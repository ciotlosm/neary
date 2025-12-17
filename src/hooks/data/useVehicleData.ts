import { useState, useEffect, useCallback, useRef } from 'react';
import type { LiveVehicle } from '../../types/tranzyApi';
import { enhancedTranzyApi } from '../../services/tranzyApiService';
import { globalCache, createCacheKey } from '../shared/cacheManager';
import { logger } from '../../utils/logger';
import type { DataHookResult, DataHookError, DataHookErrorType } from './useStationData';
import { DataHookError as BaseDataHookError, DataHookErrorType as BaseDataHookErrorType } from './useStationData';

/**
 * Configuration options for useVehicleData hook
 */
export interface UseVehicleDataOptions {
  agencyId?: string;
  routeId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number; // milliseconds
  autoRefresh?: boolean; // Enable automatic refresh for live data
  refreshInterval?: number; // milliseconds
}

/**
 * Exponential backoff configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2
};

/**
 * Calculate delay for exponential backoff with jitter
 */
const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attempt),
    config.maxDelay
  );
  
  // Add jitter (±25% of the delay)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.max(0, exponentialDelay + jitter);
};

/**
 * Hook for fetching live vehicle data with caching, error handling, and automatic refresh
 * 
 * Features:
 * - Automatic caching with shorter TTL for live data
 * - Exponential backoff retry logic
 * - Request deduplication
 * - Automatic refresh mechanisms for live data
 * - Data validation and sanitization
 * - Loading states and timestamps
 * - Comprehensive error handling
 * 
 * @param options Configuration options
 * @returns Live vehicle data with loading states and error information
 */
export const useVehicleData = (options: UseVehicleDataOptions = {}): DataHookResult<LiveVehicle[]> => {
  const {
    agencyId,
    routeId,
    forceRefresh = false,
    cacheMaxAge = 30 * 1000, // 30 seconds default for live data
    autoRefresh = true,
    refreshInterval = 30 * 1000 // 30 seconds default refresh interval
  } = options;

  // State management
  const [data, setData] = useState<LiveVehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup and retry logic
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  /**
   * Get configured agency ID from config store or use provided one
   */
  const getAgencyId = useCallback(async (): Promise<number> => {
    if (agencyId) {
      return parseInt(agencyId);
    }

    try {
      // Dynamic import to avoid circular dependencies
      const { useConfigStore } = await import('../../stores/configStore');
      const config = useConfigStore.getState().config;
      
      if (config?.agencyId) {
        return parseInt(config.agencyId);
      }
    } catch (error) {
      logger.warn('Could not get agency ID from config store', { error }, 'useVehicleData');
    }
    
    // Fallback to CTP Cluj agency ID
    return 2;
  }, [agencyId]);

  /**
   * Validate and sanitize vehicle data
   */
  const validateVehicleData = useCallback((vehicles: any[]): LiveVehicle[] => {
    if (!Array.isArray(vehicles)) {
      throw new BaseDataHookError(
        'Invalid vehicle data format received from API',
        BaseDataHookErrorType.VALIDATION_ERROR,
        'useVehicleData',
        { responseType: typeof vehicles }
      );
    }

    // Filter and validate vehicles
    const validVehicles = vehicles.filter(vehicle => {
      // Basic validation - must have required fields
      return (
        vehicle &&
        typeof vehicle === 'object' &&
        vehicle.id &&
        vehicle.routeId &&
        vehicle.position &&
        typeof vehicle.position.latitude === 'number' &&
        typeof vehicle.position.longitude === 'number' &&
        !isNaN(vehicle.position.latitude) &&
        !isNaN(vehicle.position.longitude) &&
        Math.abs(vehicle.position.latitude) <= 90 &&
        Math.abs(vehicle.position.longitude) <= 180
      );
    });

    // Sanitize and enhance vehicle data
    const sanitizedVehicles = validVehicles.map(vehicle => ({
      ...vehicle,
      // Ensure timestamp is a Date object
      timestamp: vehicle.timestamp instanceof Date 
        ? vehicle.timestamp 
        : new Date(vehicle.timestamp || Date.now()),
      // Validate speed (ensure it's a reasonable value)
      speed: typeof vehicle.speed === 'number' && vehicle.speed >= 0 && vehicle.speed <= 200 
        ? vehicle.speed 
        : 0,
      // Ensure bearing is within valid range
      position: {
        ...vehicle.position,
        bearing: typeof vehicle.position.bearing === 'number' && 
                 vehicle.position.bearing >= 0 && 
                 vehicle.position.bearing <= 360
          ? vehicle.position.bearing
          : undefined
      },
      // Validate boolean fields
      isWheelchairAccessible: Boolean(vehicle.isWheelchairAccessible),
      isBikeAccessible: Boolean(vehicle.isBikeAccessible),
      // Ensure label exists - use ID as fallback if label is empty
      label: (vehicle.label && vehicle.label.trim()) || vehicle.id || 'Unknown'
    }));

    // Filter out stale data (older than 10 minutes)
    const now = new Date();
    const freshVehicles = sanitizedVehicles.filter(vehicle => {
      const age = now.getTime() - vehicle.timestamp.getTime();
      return age <= 10 * 60 * 1000; // 10 minutes
    });

    // Sort by timestamp (newest first) for consistent ordering
    freshVehicles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    logger.debug('Vehicle data validated and sanitized', {
      originalCount: vehicles.length,
      validCount: freshVehicles.length,
      filteredCount: vehicles.length - freshVehicles.length,
      staleCount: sanitizedVehicles.length - freshVehicles.length
    }, 'useVehicleData');

    return freshVehicles;
  }, []);

  /**
   * Fetch vehicle data with retry logic
   */
  const fetchVehicleData = useCallback(async (retryAttempt = 0): Promise<LiveVehicle[]> => {
    const currentAgencyId = await getAgencyId();
    const currentRouteId = routeId ? parseInt(routeId) : undefined;
    const cacheKey = createCacheKey('vehicles', { 
      agencyId: currentAgencyId, 
      routeId: currentRouteId 
    });

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && retryAttempt === 0) {
        const cachedData = globalCache.get<LiveVehicle[]>(cacheKey);
        if (cachedData) {
          logger.debug('Vehicle data loaded from cache', { 
            agencyId: currentAgencyId, 
            routeId: currentRouteId,
            count: cachedData.length 
          }, 'useVehicleData');
          return cachedData;
        }
      }

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      logger.info('Fetching vehicle data from API', { 
        agencyId: currentAgencyId, 
        routeId: currentRouteId,
        forceRefresh,
        retryAttempt 
      }, 'useVehicleData');

      // Fetch from API using the service
      const apiService = enhancedTranzyApi; // Use singleton instance that has API key set
      const vehicles = await apiService.getVehicles(currentAgencyId, currentRouteId);

      // Validate and sanitize the response
      const validatedVehicles = validateVehicleData(vehicles);

      // Cache the successful result with shorter TTL for live data
      globalCache.set(cacheKey, validatedVehicles, cacheMaxAge);

      logger.info('Vehicle data fetched successfully', { 
        agencyId: currentAgencyId, 
        routeId: currentRouteId,
        count: validatedVehicles.length 
      }, 'useVehicleData');

      // Reset retry count on success
      retryCountRef.current = 0;

      return validatedVehicles;

    } catch (fetchError) {
      // Handle different types of errors
      let error: BaseDataHookError;

      if (fetchError instanceof BaseDataHookError) {
        error = fetchError;
      } else if (fetchError instanceof Error) {
        // Determine error type based on error characteristics
        let errorType = BaseDataHookErrorType.NETWORK_ERROR;
        let retryable = true;

        if (fetchError.message.includes('401') || fetchError.message.includes('403')) {
          errorType = BaseDataHookErrorType.AUTHENTICATION_ERROR;
          retryable = false;
        } else if (fetchError.message.includes('400') || fetchError.message.includes('404')) {
          errorType = BaseDataHookErrorType.VALIDATION_ERROR;
          retryable = false;
        } else if (fetchError.message.includes('validation') || fetchError.message.includes('format')) {
          errorType = BaseDataHookErrorType.VALIDATION_ERROR;
          retryable = false;
        }

        error = new BaseDataHookError(
          `Failed to fetch vehicle data: ${fetchError.message}`,
          errorType,
          'useVehicleData',
          { 
            agencyId: currentAgencyId, 
            routeId: currentRouteId,
            retryAttempt, 
            originalError: fetchError.message 
          },
          retryable
        );
      } else {
        error = new BaseDataHookError(
          'Unknown error occurred while fetching vehicle data',
          BaseDataHookErrorType.NETWORK_ERROR,
          'useVehicleData',
          { agencyId: currentAgencyId, routeId: currentRouteId, retryAttempt }
        );
      }

      // Retry logic for retryable errors
      if (error.retryable && retryAttempt < DEFAULT_RETRY_CONFIG.maxRetries) {
        const delay = calculateRetryDelay(retryAttempt, DEFAULT_RETRY_CONFIG);
        
        logger.warn('Vehicle data fetch failed, retrying', {
          agencyId: currentAgencyId,
          routeId: currentRouteId,
          retryAttempt,
          nextRetryIn: delay,
          error: error.message
        }, 'useVehicleData');

        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await fetchVehicleData(retryAttempt + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }

      // Try to return cached data as fallback
      const cachedData = globalCache.get<LiveVehicle[]>(cacheKey);
      if (cachedData) {
        logger.warn('Using cached vehicle data as fallback', {
          agencyId: currentAgencyId,
          routeId: currentRouteId,
          count: cachedData.length,
          error: error.message
        }, 'useVehicleData');
        return cachedData;
      }

      throw error;
    }
  }, [agencyId, routeId, forceRefresh, cacheMaxAge, getAgencyId, validateVehicleData]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (isLoading) {
      logger.debug('Refetch ignored - already loading', {}, 'useVehicleData');
      return;
    }

    setIsLoading(true);
    setError(null);
    retryCountRef.current = 0;

    try {
      const vehicles = await fetchVehicleData();
      setData(vehicles);
      setLastUpdated(new Date());
    } catch (fetchError) {
      const error = fetchError instanceof BaseDataHookError 
        ? fetchError 
        : new BaseDataHookError(
            'Failed to refetch vehicle data',
            BaseDataHookErrorType.NETWORK_ERROR,
            'useVehicleData'
          );
      
      setError(error);
      logger.error('Vehicle data refetch failed', { error: error.message }, 'useVehicleData');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, fetchVehicleData]);

  /**
   * Setup automatic refresh for live data
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || refreshInterval <= 0) {
      return;
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(async () => {
      if (!isLoading) {
        try {
          logger.debug('Auto-refreshing vehicle data', { 
            interval: refreshInterval 
          }, 'useVehicleData');
          
          const vehicles = await fetchVehicleData();
          setData(vehicles);
          setLastUpdated(new Date());
          setError(null);
        } catch (fetchError) {
          // Don't update error state on auto-refresh failures to avoid UI flicker
          logger.warn('Auto-refresh failed', { 
            error: fetchError instanceof Error ? fetchError.message : String(fetchError) 
          }, 'useVehicleData');
        }
      }
    }, refreshInterval);

    logger.debug('Auto-refresh setup', { interval: refreshInterval }, 'useVehicleData');
  }, [autoRefresh, refreshInterval, isLoading, fetchVehicleData]);

  /**
   * Initial data fetch effect
   */
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const vehicles = await fetchVehicleData();
        
        if (isMounted) {
          setData(vehicles);
          setLastUpdated(new Date());
        }
      } catch (fetchError) {
        if (isMounted) {
          const error = fetchError instanceof BaseDataHookError 
            ? fetchError 
            : new BaseDataHookError(
                'Failed to load initial vehicle data',
                BaseDataHookErrorType.NETWORK_ERROR,
                'useVehicleData'
              );
          
          setError(error);
          logger.error('Initial vehicle data load failed', { error: error.message }, 'useVehicleData');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchVehicleData]);

  /**
   * Auto-refresh setup effect
   */
  useEffect(() => {
    setupAutoRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [setupAutoRefresh]);

  /**
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Clear refresh intervals
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastUpdated
  };
};