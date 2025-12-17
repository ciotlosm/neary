import { useState, useEffect, useCallback, useRef } from 'react';
import type { Station } from '../../types';
import { enhancedTranzyApi } from '../../services/tranzyApiService';
import { globalCache, createCacheKey } from '../shared/cacheManager';
import { logger } from '../../utils/logger';

/**
 * Configuration options for useStationData hook
 */
export interface UseStationDataOptions {
  agencyId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number; // milliseconds
}

/**
 * Result interface for data hooks
 */
export interface DataHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Error types for data hooks
 */
export enum DataHookErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  CACHE_ERROR = 'cache_error',
  AUTHENTICATION_ERROR = 'authentication_error'
}

/**
 * Enhanced error class for data hooks
 */
export class DataHookError extends Error {
  constructor(
    message: string,
    public type: DataHookErrorType,
    public hookName: string,
    public context: Record<string, any> = {},
    public retryable: boolean = true,
    public timestamp: Date = new Date()
  ) {
    super(message);
    this.name = 'DataHookError';
  }
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
 * Hook for fetching station data with caching and error handling
 * 
 * Features:
 * - Automatic caching with TTL
 * - Exponential backoff retry logic
 * - Request deduplication
 * - Loading states and timestamps
 * - Comprehensive error handling
 * 
 * @param options Configuration options
 * @returns Station data with loading states and error information
 */
export const useStationData = (options: UseStationDataOptions = {}): DataHookResult<Station[]> => {
  const {
    agencyId,
    forceRefresh = false,
    cacheMaxAge = 5 * 60 * 1000 // 5 minutes default
  } = options;

  // State management
  const [data, setData] = useState<Station[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup and retry logic
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
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
      logger.warn('Could not get agency ID from config store', { error }, 'useStationData');
    }
    
    // Fallback to CTP Cluj agency ID
    return 2;
  }, [agencyId]);

  /**
   * Fetch station data with retry logic
   */
  const fetchStationData = useCallback(async (retryAttempt = 0): Promise<Station[]> => {
    const currentAgencyId = await getAgencyId();
    const cacheKey = createCacheKey('stations', { agencyId: currentAgencyId });

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && retryAttempt === 0) {
        const cachedData = globalCache.get<Station[]>(cacheKey);
        if (cachedData) {
          logger.debug('Station data loaded from cache', { 
            agencyId: currentAgencyId, 
            count: cachedData.length 
          }, 'useStationData');
          return cachedData;
        }
      }

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      logger.info('Fetching station data from API', { 
        agencyId: currentAgencyId, 
        forceRefresh,
        retryAttempt 
      }, 'useStationData');

      // Fetch from API using the service
      const apiService = enhancedTranzyApi; // Use singleton instance that has API key set
      const stations = await apiService.getStops(currentAgencyId, forceRefresh);

      // Validate the response
      if (!Array.isArray(stations)) {
        throw new DataHookError(
          'Invalid station data format received from API',
          DataHookErrorType.VALIDATION_ERROR,
          'useStationData',
          { agencyId: currentAgencyId, responseType: typeof stations }
        );
      }

      // Cache the successful result
      globalCache.set(cacheKey, stations, cacheMaxAge);

      logger.info('Station data fetched successfully', { 
        agencyId: currentAgencyId, 
        count: stations.length 
      }, 'useStationData');

      // Reset retry count on success
      retryCountRef.current = 0;

      return stations;

    } catch (fetchError) {
      // Handle different types of errors
      let error: DataHookError;

      if (fetchError instanceof DataHookError) {
        error = fetchError;
      } else if (fetchError instanceof Error) {
        // Determine error type based on error characteristics
        let errorType = DataHookErrorType.NETWORK_ERROR;
        let retryable = true;

        if (fetchError.message.includes('401') || fetchError.message.includes('403')) {
          errorType = DataHookErrorType.AUTHENTICATION_ERROR;
          retryable = false;
        } else if (fetchError.message.includes('400') || fetchError.message.includes('404')) {
          errorType = DataHookErrorType.VALIDATION_ERROR;
          retryable = false;
        } else if (fetchError.message.includes('validation') || fetchError.message.includes('format')) {
          errorType = DataHookErrorType.VALIDATION_ERROR;
          retryable = false;
        }

        error = new DataHookError(
          `Failed to fetch station data: ${fetchError.message}`,
          errorType,
          'useStationData',
          { agencyId: currentAgencyId, retryAttempt, originalError: fetchError.message },
          retryable
        );
      } else {
        error = new DataHookError(
          'Unknown error occurred while fetching station data',
          DataHookErrorType.NETWORK_ERROR,
          'useStationData',
          { agencyId: currentAgencyId, retryAttempt }
        );
      }

      // Retry logic for retryable errors
      if (error.retryable && retryAttempt < DEFAULT_RETRY_CONFIG.maxRetries) {
        const delay = calculateRetryDelay(retryAttempt, DEFAULT_RETRY_CONFIG);
        
        logger.warn('Station data fetch failed, retrying', {
          agencyId: currentAgencyId,
          retryAttempt,
          nextRetryIn: delay,
          error: error.message
        }, 'useStationData');

        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await fetchStationData(retryAttempt + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }

      // Try to return cached data as fallback
      const cachedData = globalCache.get<Station[]>(cacheKey);
      if (cachedData) {
        logger.warn('Using cached station data as fallback', {
          agencyId: currentAgencyId,
          count: cachedData.length,
          error: error.message
        }, 'useStationData');
        return cachedData;
      }

      throw error;
    }
  }, [agencyId, forceRefresh, cacheMaxAge, getAgencyId]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (isLoading) {
      logger.debug('Refetch ignored - already loading', {}, 'useStationData');
      return;
    }

    setIsLoading(true);
    setError(null);
    retryCountRef.current = 0;

    try {
      const stations = await fetchStationData();
      setData(stations);
      setLastUpdated(new Date());
    } catch (fetchError) {
      const error = fetchError instanceof DataHookError 
        ? fetchError 
        : new DataHookError(
            'Failed to refetch station data',
            DataHookErrorType.NETWORK_ERROR,
            'useStationData'
          );
      
      setError(error);
      logger.error('Station data refetch failed', { error: error.message }, 'useStationData');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, fetchStationData]);

  /**
   * Initial data fetch effect
   */
  useEffect(() => {
    let isMounted = true;
    const hookId = Math.random().toString(36).substr(2, 9);

    const loadInitialData = async () => {
      logger.debug('useStationData: Starting initial load', { hookId, isMounted }, 'useStationData');
      setIsLoading(true);
      setError(null);

      try {
        const stations = await fetchStationData();
        logger.debug('useStationData: Fetch completed', { 
          hookId,
          stationsCount: stations?.length || 0,
          isMounted 
        }, 'useStationData');
        
        if (isMounted) {
          setData(stations);
          setLastUpdated(new Date());
          logger.debug('useStationData: State updated successfully', { 
            hookId,
            stationsCount: stations?.length || 0 
          }, 'useStationData');
        } else {
          logger.debug('useStationData: Component unmounted, skipping state update', { hookId }, 'useStationData');
        }
      } catch (fetchError) {
        if (isMounted) {
          const error = fetchError instanceof DataHookError 
            ? fetchError 
            : new DataHookError(
                'Failed to load initial station data',
                DataHookErrorType.NETWORK_ERROR,
                'useStationData'
              );
          
          setError(error);
          logger.error('Initial station data load failed', { error: error.message }, 'useStationData');
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
  }, [fetchStationData]);

  /**
   * Cleanup effect with comprehensive resource management
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

      // Reset retry count
      retryCountRef.current = 0;

      logger.debug('Station data hook cleanup completed', {}, 'useStationData');
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