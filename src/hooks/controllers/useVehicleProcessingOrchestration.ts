import React, { useMemo, useCallback, useRef } from 'react';
import type { 
  LiveVehicle, 
  Station, 
  Route, 
  StopTime, 
  Coordinates, 
  FavoriteRoute,
  EnhancedVehicleInfo 
} from '../../types';
import { useLocationStore } from '../../stores/locationStore';
import { useConfigStore } from '../../stores/configStore';
import { getEffectiveLocation } from '../../utils/locationUtils';
import { logger } from '../../utils/logger';
import { 
  useDependencyTracker, 
  useSelectiveMemo, 
  useSelectiveCallback,
  usePerformanceMonitor 
} from '../shared/dependencyTracker';
import { globalCache } from '../shared/cacheManager';

// Import data layer hooks
import { useStationData } from '../data/useStationData';
import { useVehicleData } from '../data/useVehicleData';
import { useRouteData } from '../data/useRouteData';
import { useStopTimesData } from '../data/useStopTimesData';

// Import processing layer hooks
import { useVehicleFiltering } from '../processing/useVehicleFiltering';
import { useVehicleGrouping } from '../processing/useVehicleGrouping';
import { useDirectionAnalysis } from '../processing/useDirectionAnalysis';
import { useProximityCalculation } from '../processing/useProximityCalculation';

// Import nearby view controller for new station selection logic
import { 
  useNearbyViewController,
  type UseNearbyViewControllerOptions 
} from './useNearbyViewController';

/**
 * Enhanced vehicle with direction analysis
 */
interface EnhancedVehicleInfoWithDirection extends EnhancedVehicleInfo {
  _internalDirection?: 'arriving' | 'departing' | 'unknown';
  stopSequence?: Array<{
    stopId: string;
    stopName: string;
    sequence: number;
    isCurrent: boolean;
    isDestination: boolean;
  }>;
}

/**
 * Station vehicle group for backward compatibility
 */
interface StationVehicleGroup {
  station: { station: Station; distance: number };
  vehicles: EnhancedVehicleInfoWithDirection[];
  allRoutes: Array<{
    routeId: string;
    routeName: string;
    vehicleCount: number;
  }>;
}

/**
 * Configuration options for vehicle processing (maintains backward compatibility)
 */
export interface VehicleProcessingOptions {
  filterByFavorites?: boolean;
  maxStations?: number;
  maxVehiclesPerStation?: number;
  showAllVehiclesPerRoute?: boolean;
  maxSearchRadius?: number;
  maxStationsToCheck?: number;
  proximityThreshold?: number; // Deprecated: Use customDistanceThreshold in nearby view
}

/**
 * Result interface for vehicle processing (maintains exact backward compatibility)
 */
export interface VehicleProcessingResult {
  stationVehicleGroups: StationVehicleGroup[];
  isLoading: boolean;
  isLoadingStations: boolean;
  isLoadingVehicles: boolean;
  isProcessingVehicles: boolean;
  effectiveLocationForDisplay: Coordinates | null;
  favoriteRoutes: FavoriteRoute[];
  allStations: Station[];
  vehicles: LiveVehicle[];
  error?: Error;
}

/**
 * Error classification for orchestration layer
 */
enum HookErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  CACHE_ERROR = 'cache_error',
  PROCESSING_ERROR = 'processing_error',
  DEPENDENCY_ERROR = 'dependency_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  CONFIGURATION_ERROR = 'configuration_error'
}

/**
 * Enhanced error class for hook errors with comprehensive context
 */
class HookError extends Error {
  constructor(
    message: string,
    public type: HookErrorType,
    public hookName: string,
    public context: Record<string, any> = {},
    public retryable: boolean = true,
    public timestamp: Date = new Date(),
    public retryCount?: number,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.name = 'HookError';
    
    // Add stack trace context (Node.js specific)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, HookError);
    }
  }

  /**
   * Create a structured error report for debugging
   */
  toErrorReport(): Record<string, any> {
    return {
      message: this.message,
      type: this.type,
      hookName: this.hookName,
      severity: this.severity,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      retryCount: this.retryCount || 0,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Check if this error should trigger a retry
   */
  shouldRetry(maxRetries: number = 3): boolean {
    return this.retryable && (this.retryCount || 0) < maxRetries;
  }
}

/**
 * Fallback data strategies for different error scenarios
 */
const createFallbackData = () => ({
  stations: [] as Station[],
  vehicles: [] as LiveVehicle[],
  routes: [] as Route[],
  stopTimes: [] as StopTime[],
  stationVehicleGroups: [] as StationVehicleGroup[]
});

/**
 * Error severity assessment based on error type and context
 */
const assessErrorSeverity = (
  error: Error,
  context: Record<string, any>
): 'low' | 'medium' | 'high' | 'critical' => {
  // Authentication errors are critical
  if (error.message.includes('401') || error.message.includes('403')) {
    return 'critical';
  }

  // Network errors during initial load are high severity
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return context.isInitialLoad ? 'high' : 'medium';
  }

  // Validation errors are usually medium severity
  if (error.message.includes('validation') || error.message.includes('format')) {
    return 'medium';
  }

  // Processing errors are typically low severity (can continue with partial data)
  if (error.message.includes('processing')) {
    return 'low';
  }

  // Default to medium severity
  return 'medium';
};

/**
 * Structured error logging with context
 */
const logStructuredError = (error: HookError, additionalContext?: Record<string, any>) => {
  const errorReport = {
    ...error.toErrorReport(),
    ...additionalContext
  };

  switch (error.severity) {
    case 'critical':
      logger.error('Critical hook error', errorReport, error.hookName);
      break;
    case 'high':
      logger.error('High severity hook error', errorReport, error.hookName);
      break;
    case 'medium':
      logger.warn('Medium severity hook error', errorReport, error.hookName);
      break;
    case 'low':
      logger.debug('Low severity hook error', errorReport, error.hookName);
      break;
  }
};

/**
 * Exponential backoff configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
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
 * Utility function to analyze vehicle direction (non-hook version)
 * This replicates the logic from useDirectionAnalysis but as a pure function
 */
const analyzeVehicleDirection = (
  vehicle: LiveVehicle,
  targetStation: Station,
  stopTimes: StopTime[]
): { direction: 'arriving' | 'departing' | 'unknown'; estimatedMinutes: number; confidence: 'high' | 'medium' | 'low' } => {
  // Input validation
  if (!vehicle?.tripId || !targetStation?.id || !Array.isArray(stopTimes)) {
    return { direction: 'unknown', estimatedMinutes: 0, confidence: 'low' };
  }

  // Filter stop times for this vehicle's trip
  const tripStopTimes = stopTimes.filter(stopTime => 
    stopTime && 
    stopTime.tripId === vehicle.tripId &&
    stopTime.stopId &&
    typeof stopTime.sequence === 'number' &&
    !isNaN(stopTime.sequence)
  );

  if (tripStopTimes.length === 0) {
    return { direction: 'unknown', estimatedMinutes: 0, confidence: 'low' };
  }

  // Sort stop times by sequence
  const sortedStopTimes = tripStopTimes.sort((a, b) => a.sequence - b.sequence);

  // Find the target station in the trip's stop sequence
  const targetStopTime = sortedStopTimes.find(stopTime => stopTime.stopId === targetStation.id);
  
  if (!targetStopTime) {
    return { direction: 'unknown', estimatedMinutes: 0, confidence: 'low' };
  }

  const targetSequence = targetStopTime.sequence;

  // Simplified approach: estimate position based on time if available
  const now = new Date();
  const vehicleTimestamp = vehicle.timestamp instanceof Date ? vehicle.timestamp : new Date(vehicle.timestamp);
  
  // Calculate time since last vehicle update (in minutes)
  const minutesSinceUpdate = Math.max(0, (now.getTime() - vehicleTimestamp.getTime()) / (1000 * 60));

  let estimatedCurrentSequence = 0;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (targetStopTime.arrivalTime && typeof targetStopTime.arrivalTime === 'string') {
    try {
      // Parse arrival time (HH:MM:SS format)
      const [hours, minutes, seconds] = targetStopTime.arrivalTime.split(':').map(Number);
      const scheduledArrival = new Date();
      scheduledArrival.setHours(hours, minutes, seconds || 0, 0);

      // Calculate time difference
      const timeDiffMinutes = (scheduledArrival.getTime() - now.getTime()) / (1000 * 60);

      if (timeDiffMinutes > 0) {
        // Vehicle should arrive in the future
        estimatedCurrentSequence = Math.max(0, targetSequence - Math.ceil(timeDiffMinutes / 2)); // Assume 2 minutes per stop
        confidence = 'medium';
      } else if (timeDiffMinutes > -10) {
        // Vehicle should have arrived recently (within 10 minutes)
        estimatedCurrentSequence = targetSequence;
        confidence = 'medium';
      } else {
        // Vehicle is likely past this stop
        estimatedCurrentSequence = targetSequence + Math.ceil(Math.abs(timeDiffMinutes) / 2);
        confidence = 'low';
      }
    } catch (error) {
      // Fallback to sequence-based estimation
      estimatedCurrentSequence = Math.floor(sortedStopTimes.length / 2);
      confidence = 'low';
    }
  } else {
    // No time data available, use middle of sequence as estimate
    estimatedCurrentSequence = Math.floor(sortedStopTimes.length / 2);
    confidence = 'low';
  }

  // Determine direction based on sequence comparison
  let direction: 'arriving' | 'departing' | 'unknown' = 'unknown';
  let estimatedMinutes = 0;

  if (estimatedCurrentSequence < targetSequence) {
    // Vehicle is before the target station → arriving
    direction = 'arriving';
    const remainingStops = targetSequence - estimatedCurrentSequence;
    estimatedMinutes = Math.max(1, remainingStops * 2); // 2 minutes per stop estimate
    
    // Adjust for vehicle age
    estimatedMinutes = Math.max(1, estimatedMinutes - minutesSinceUpdate);
    
    if (confidence === 'medium' && remainingStops <= 3) {
      confidence = 'high'; // High confidence for nearby arrivals with time data
    }
  } else if (estimatedCurrentSequence > targetSequence) {
    // Vehicle is after the target station → departing
    direction = 'departing';
    const stopsSinceDeparture = estimatedCurrentSequence - targetSequence;
    estimatedMinutes = stopsSinceDeparture * 2; // Time since departure
    
    // Departing vehicles have lower confidence unless very recent
    if (stopsSinceDeparture <= 2 && confidence === 'medium') {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  } else {
    // Vehicle is at or very near the target station
    direction = 'arriving';
    estimatedMinutes = 0; // At station
    
    if (confidence === 'medium') {
      confidence = 'high'; // High confidence when at station with time data
    }
  }

  return {
    direction,
    estimatedMinutes: Math.round(estimatedMinutes),
    confidence
  };
};

/**
 * New orchestration hook that coordinates all data and processing sub-hooks
 * while maintaining exact backward compatibility with the existing API
 * 
 * Features:
 * - Coordinates all data and processing sub-hooks
 * - Maintains exact backward compatibility with existing API
 * - Error aggregation and partial failure handling
 * - Performance optimizations with selective re-execution
 * - Comprehensive error handling with retry mechanisms
 * - Structured error logging with context
 * - Fallback data strategies for each error type
 * 
 * @param options Configuration options (same as original useVehicleProcessing)
 * @returns Vehicle processing result (same format as original)
 */
export const useVehicleProcessing = (options: VehicleProcessingOptions = {}): VehicleProcessingResult => {
  const {
    filterByFavorites = false,
    maxStations = 2,
    maxVehiclesPerStation = 5,
    showAllVehiclesPerRoute = false,
    maxSearchRadius = 5000,
    maxStationsToCheck = 20,
    proximityThreshold = 200, // Deprecated but kept for backward compatibility
  } = options;

  // Get location and config from stores
  const { currentLocation } = useLocationStore();
  const { config } = useConfigStore();

  // Get effective location with fallback priority (same as original)
  const effectiveLocationForDisplay = getEffectiveLocation(
    currentLocation,
    config?.homeLocation,
    config?.workLocation,
    config?.defaultLocation
  );

  // Get favorite routes from Config Store method
  const { getFavoriteRoutes } = useConfigStore();
  const favoriteRoutes = useMemo(() => {
    return filterByFavorites ? getFavoriteRoutes() : [];
  }, [filterByFavorites, getFavoriteRoutes]);

  // Get agency ID for data hooks
  const agencyId = config?.agencyId;
  const isConfigured = !!agencyId;

  // Data layer hooks - fetch all required data
  const stationDataResult = useStationData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 5 * 60 * 1000 // 5 minutes
  });

  const vehicleDataResult = useVehicleData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 30 * 1000, // 30 seconds for live data
    autoRefresh: true,
    refreshInterval: 30 * 1000
  });

  const routeDataResult = useRouteData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 10 * 60 * 1000 // 10 minutes
  });

  const stopTimesDataResult = useStopTimesData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 2 * 60 * 1000 // 2 minutes
  });

  // Extract data with fallbacks
  const allStations = stationDataResult.data || [];
  const vehicles = vehicleDataResult.data || [];
  const routes = routeDataResult.data || [];
  const stopTimes = stopTimesDataResult.data || [];

  // Aggregate loading states
  const isLoadingStations = stationDataResult.isLoading;
  const isLoadingVehicles = vehicleDataResult.isLoading;
  const isLoadingRoutes = routeDataResult.isLoading;
  const isLoadingStopTimes = stopTimesDataResult.isLoading;
  
  const isLoading = isLoadingStations || isLoadingVehicles || isLoadingRoutes || isLoadingStopTimes;

  // Aggregate errors with context
  const dataErrors = useMemo(() => {
    const errors = [
      stationDataResult.error && { source: 'stations', error: stationDataResult.error },
      vehicleDataResult.error && { source: 'vehicles', error: vehicleDataResult.error },
      routeDataResult.error && { source: 'routes', error: routeDataResult.error },
      stopTimesDataResult.error && { source: 'stopTimes', error: stopTimesDataResult.error }
    ].filter(Boolean);
    return errors;
  }, [
    stationDataResult.error,
    vehicleDataResult.error,
    routeDataResult.error,
    stopTimesDataResult.error
  ]);

  // Create aggregated error if any data hooks failed
  const aggregatedError = useMemo(() => {
    if (dataErrors.length === 0) return undefined;

    const errorMessages = dataErrors.map(({ source, error }) => `${source}: ${error!.message}`);
    const hasAuthError = dataErrors.some(({ error }) => 
      error!.message.includes('401') || error!.message.includes('403')
    );
    const hasNetworkError = dataErrors.some(({ error }) => 
      error!.message.includes('network') || error!.message.includes('fetch')
    );

    // Determine error type based on the most severe error present
    let errorType = HookErrorType.DEPENDENCY_ERROR;
    if (hasAuthError) {
      errorType = HookErrorType.AUTHENTICATION_ERROR;
    } else if (hasNetworkError) {
      errorType = HookErrorType.NETWORK_ERROR;
    }

    const context = {
      dataErrors: dataErrors.map(({ source, error }) => ({
        source,
        message: error!.message,
        type: (error as any).type || 'unknown',
        timestamp: new Date().toISOString()
      })),
      partialDataAvailable: {
        stations: allStations.length > 0,
        vehicles: vehicles.length > 0,
        routes: routes.length > 0,
        stopTimes: stopTimes.length > 0
      },
      totalErrors: dataErrors.length,
      errorSources: dataErrors.map(({ source }) => source),
      canContinueWithPartialData: allStations.length > 0 || vehicles.length > 0
    };

    const hookError = new HookError(
      `Data layer errors (${dataErrors.length}): ${errorMessages.join('; ')}`,
      errorType,
      'useVehicleProcessing',
      context,
      !hasAuthError, // Not retryable if auth error
      new Date(),
      0,
      assessErrorSeverity(new Error(errorMessages.join('; ')), context)
    );

    // Log the structured error
    logStructuredError(hookError, {
      agencyId: config?.agencyId,
      effectiveLocationAvailable: !!effectiveLocationForDisplay,
      configurationValid: isConfigured
    });

    return hookError;
  }, [dataErrors, allStations.length, vehicles.length, routes.length, stopTimes.length, config?.agencyId, effectiveLocationForDisplay, isConfigured]);

  // Use nearby view controller for station selection when not in favorites mode
  // For favorites mode, fall back to old processing logic
  const shouldUseNearbyView = !filterByFavorites && maxStations <= 2;
  
  // Nearby view controller options
  const nearbyViewOptions: UseNearbyViewControllerOptions = {
    enableSecondStation: maxStations > 1,
    customDistanceThreshold: proximityThreshold,
    stabilityMode: 'normal',
    maxSearchRadius,
    maxVehiclesPerStation,
    requireActiveRoutes: true,
    enableStabilityTracking: true,
    autoRefresh: false, // We handle refresh at this level
    enableCaching: false // We handle caching at this level
  };

  // Use nearby view controller for modern station selection
  const nearbyViewResult = useNearbyViewController(nearbyViewOptions);

  // Fallback processing layer hooks for favorites mode or when nearby view is not suitable
  const vehicleFilteringResult = useVehicleFiltering(vehicles, {
    filterByFavorites,
    favoriteRoutes,
    maxSearchRadius,
    userLocation: effectiveLocationForDisplay
  });

  const vehicleGroupingResult = useVehicleGrouping(
    vehicleFilteringResult.filteredVehicles,
    allStations,
    effectiveLocationForDisplay || { latitude: 0, longitude: 0 },
    {
      maxStations,
      maxVehiclesPerStation,
      proximityThreshold
    }
  );

  // Processing state management
  const [isProcessingVehicles, setIsProcessingVehicles] = React.useState(false);
  const [processingError, setProcessingError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const retryTimeoutRef = React.useRef<number | null>(null);

  // Initialize dependency tracker and performance monitor
  const dependencyTracker = useDependencyTracker();
  const performanceMonitor = usePerformanceMonitor('stationVehicleGroups');

  // Subscription and cleanup management
  const subscriptionsRef = useRef<Set<() => void>>(new Set());
  const timersRef = useRef<Set<number>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  // Cleanup utilities
  const addSubscription = useCallback((cleanup: () => void) => {
    subscriptionsRef.current.add(cleanup);
    return () => {
      subscriptionsRef.current.delete(cleanup);
    };
  }, []);

  const addTimer = useCallback((timerId: number) => {
    timersRef.current.add(timerId);
    return () => {
      timersRef.current.delete(timerId);
      clearTimeout(timerId);
    };
  }, []);

  const addAbortController = useCallback((controller: AbortController) => {
    abortControllersRef.current.add(controller);
    return () => {
      abortControllersRef.current.delete(controller);
      if (!controller.signal.aborted) {
        controller.abort();
      }
    };
  }, []);

  const cleanupAll = useCallback(() => {
    // Cleanup subscriptions
    subscriptionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        logger.warn('Error during subscription cleanup', { error }, 'useVehicleProcessing');
      }
    });
    subscriptionsRef.current.clear();

    // Cleanup timers
    timersRef.current.forEach(timerId => {
      clearTimeout(timerId);
    });
    timersRef.current.clear();

    // Cleanup abort controllers
    abortControllersRef.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    abortControllersRef.current.clear();

    // Clear dependency tracker
    dependencyTracker.clear();

    logger.debug('All subscriptions and resources cleaned up', {}, 'useVehicleProcessing');
  }, [dependencyTracker]);

  // Selective memoization for expensive sub-operations
  const routeMaps = useSelectiveMemo(() => {
    const routeMap = new Map<string, Route>();
    const routeIdMap = new Map<string, Route>();
    
    routes.forEach(route => {
      routeMap.set(route.routeName, route);
      routeIdMap.set(route.id, route);
    });
    
    return { routeMap, routeIdMap };
  }, [routes], 'routeMaps');

  // Process vehicles using selective re-execution
  const stationVehicleGroups = useSelectiveMemo(() => {
    const startTime = performance.now();
    // Early return if not configured or missing critical data
    if (!isConfigured || !effectiveLocationForDisplay) {
      const endTime = performance.now();
      performanceMonitor.recordExecution(endTime - startTime, true); // Cached/early return
      return [];
    }

    // For favorites mode, check if we have favorite routes configured
    if (filterByFavorites && favoriteRoutes.length === 0) {
      const endTime = performance.now();
      performanceMonitor.recordExecution(endTime - startTime, true); // Cached/early return
      return [];
    }

    // Need minimum data to proceed
    if (allStations.length === 0 || vehicles.length === 0) {
      const endTime = performance.now();
      performanceMonitor.recordExecution(endTime - startTime, true); // Cached/early return
      return [];
    }

    try {
      logger.debug('Starting orchestrated vehicle processing', {
        stationsCount: allStations.length,
        vehiclesCount: vehicles.length,
        routesCount: routes.length,
        stopTimesCount: stopTimes.length,
        filterByFavorites,
        favoriteRoutesCount: favoriteRoutes.length,
        effectiveLocation: effectiveLocationForDisplay,
        shouldUseNearbyView
      }, 'useVehicleProcessing');

      // Step 1: Use nearby view controller for modern station selection (when appropriate)
      if (shouldUseNearbyView && !nearbyViewResult.error && nearbyViewResult.stationVehicleGroups.length > 0) {
        logger.debug('Using nearby view controller results', {
          stationGroups: nearbyViewResult.stationVehicleGroups.length,
          hasClosestStation: !!nearbyViewResult.selectedStations.closestStation,
          hasSecondStation: !!nearbyViewResult.selectedStations.secondStation
        }, 'useVehicleProcessing');

        // Convert nearby view results to expected format
        const transformedGroups: StationVehicleGroup[] = nearbyViewResult.stationVehicleGroups.map(group => ({
          station: group.station,
          vehicles: group.vehicles as EnhancedVehicleInfoWithDirection[],
          allRoutes: group.allRoutes
        }));

        const endTime = performance.now();
        performanceMonitor.recordExecution(endTime - startTime, false);
        return transformedGroups;
      }

      // Step 2: Fallback to legacy processing for favorites mode or when nearby view fails
      logger.debug('Using legacy vehicle processing', {
        reason: shouldUseNearbyView ? 'nearby_view_failed' : 'favorites_mode',
        nearbyViewError: nearbyViewResult.error?.message
      }, 'useVehicleProcessing');

      // Use pre-computed route mapping
      const { routeMap, routeIdMap } = routeMaps;

      const filteredVehicles = vehicleFilteringResult.filteredVehicles;

      logger.debug('Vehicle filtering completed', {
        originalCount: vehicles.length,
        filteredCount: filteredVehicles.length,
        filterStats: vehicleFilteringResult.filterStats
      }, 'useVehicleProcessing');

      logger.debug('Vehicle grouping completed', {
        stationGroups: vehicleGroupingResult.stationGroups.length,
        groupingStats: vehicleGroupingResult.groupingStats
      }, 'useVehicleProcessing');

      // Step 2: Transform grouped results to match original API format
      const transformedGroups: StationVehicleGroup[] = vehicleGroupingResult.stationGroups.map(group => {
        // Enhance vehicles with direction analysis and route information
        const enhancedVehicles: EnhancedVehicleInfoWithDirection[] = group.vehicles.map(vehicle => {
          // Get route information
          const route = routeIdMap.get(vehicle.routeId || '');
          
          // Perform direction analysis using utility function (not hook)
          const directionResult = analyzeVehicleDirection(
            vehicle,
            group.station.station,
            stopTimes
          );

          // Get trip data for destination (headsign)
          const tripStopTimes = stopTimes.filter(st => st.tripId === vehicle.tripId);
          const destination = tripStopTimes.length > 0 
            ? `${route?.routeName || vehicle.routeId} - ${route?.routeDesc || 'Unknown destination'}`
            : route?.routeDesc || 'Unknown destination';

          return {
            id: vehicle.id,
            routeId: vehicle.routeId || '',
            route: route?.routeName || `Route ${vehicle.routeId}`,
            destination,
            vehicle: {
              id: vehicle.id,
              routeId: vehicle.routeId || '',
              tripId: vehicle.tripId,
              label: vehicle.label,
              position: vehicle.position,
              timestamp: vehicle.timestamp,
              speed: vehicle.speed,
              isWheelchairAccessible: vehicle.isWheelchairAccessible,
              isBikeAccessible: vehicle.isBikeAccessible,
            },
            isLive: true,
            isScheduled: false,
            confidence: directionResult.confidence === 'high' ? 'high' : 'medium',
            direction: 'unknown' as 'work' | 'home' | 'unknown',
            station: group.station.station,
            minutesAway: directionResult.estimatedMinutes,
            estimatedArrival: new Date(Date.now() + directionResult.estimatedMinutes * 60000),
            _internalDirection: directionResult.direction,
            stopSequence: undefined // Will be populated if needed
          };
        });

        // Apply vehicle selection logic based on mode (same as original)
        let finalVehicles: EnhancedVehicleInfoWithDirection[];
        
        if (showAllVehiclesPerRoute) {
          // Show all vehicles (favorites mode)
          finalVehicles = enhancedVehicles
            .sort((a, b) => {
              // Priority sorting (same as original)
              const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
              const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
              
              if (aAtStation && !bAtStation) return -1;
              if (!aAtStation && bAtStation) return 1;
              
              const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
              const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
              
              if (aArriving && !bArriving) return -1;
              if (!aArriving && bArriving) return 1;
              
              if (aArriving && bArriving) {
                return a.minutesAway - b.minutesAway;
              }
              
              return a.minutesAway - b.minutesAway;
            });
        } else {
          // Deduplicate by route and apply limits (station display mode)
          const routeGroups = new Map<string, EnhancedVehicleInfoWithDirection[]>();
          
          enhancedVehicles.forEach(vehicle => {
            const routeId = vehicle.routeId;
            if (!routeGroups.has(routeId)) {
              routeGroups.set(routeId, []);
            }
            routeGroups.get(routeId)!.push(vehicle);
          });

          // Select the best vehicle per route based on priority (same logic as original)
          const bestVehiclePerRoute = Array.from(routeGroups.entries()).map(([routeId, vehicles]) => {
            const sortedVehicles = vehicles.sort((a, b) => {
              const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
              const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
              
              if (aAtStation && !bAtStation) return -1;
              if (!aAtStation && bAtStation) return 1;
              
              const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
              const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
              
              if (aArriving && !bArriving) return -1;
              if (!aArriving && bArriving) return 1;
              
              if (aArriving && bArriving) {
                return a.minutesAway - b.minutesAway;
              }
              
              return a.minutesAway - b.minutesAway;
            });
            
            return sortedVehicles[0];
          });

          // Check if there's only one route at this station (same logic as original)
          const uniqueRoutes = Array.from(new Set(enhancedVehicles.map(v => v.routeId)));
          
          if (uniqueRoutes.length === 1) {
            // Single route: show all vehicles from that route (up to maxVehicles limit)
            finalVehicles = enhancedVehicles
              .sort((a, b) => {
                const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
                const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
                
                if (aAtStation && !bAtStation) return -1;
                if (!aAtStation && bAtStation) return 1;
                
                const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
                const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
                
                if (aArriving && !bArriving) return -1;
                if (!aArriving && bArriving) return 1;
                
                if (aArriving && bArriving) {
                  return a.minutesAway - b.minutesAway;
                }
                
                return a.minutesAway - b.minutesAway;
              })
              .slice(0, maxVehiclesPerStation);
          } else {
            // Multiple routes: deduplicate by route and limit to maxVehicles
            finalVehicles = bestVehiclePerRoute
              .sort((a, b) => {
                const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
                const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
                
                if (aAtStation && !bAtStation) return -1;
                if (!aAtStation && bAtStation) return 1;
                
                const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
                const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
                
                if (aArriving && !bArriving) return -1;
                if (!aArriving && bArriving) return 1;
                
                if (aArriving && bArriving) {
                  return a.minutesAway - b.minutesAway;
                }
                
                return a.minutesAway - b.minutesAway;
              })
              .slice(0, maxVehiclesPerStation);
          }
        }

        return {
          station: group.station,
          vehicles: finalVehicles,
          allRoutes: group.allRoutes
        };
      });

      logger.debug('Vehicle processing orchestration completed', {
        finalStationGroups: transformedGroups.length,
        totalVehicles: transformedGroups.reduce((sum, group) => sum + group.vehicles.length, 0),
        processingOptions: {
          filterByFavorites,
          maxStations,
          maxVehiclesPerStation,
          showAllVehiclesPerRoute
        }
      }, 'useVehicleProcessing');

      const endTime = performance.now();
      performanceMonitor.recordExecution(endTime - startTime, false);

      return transformedGroups;

    } catch (error) {
      const context = {
        processingStep: 'orchestration',
        dataAvailable: {
          stations: allStations.length,
          vehicles: vehicles.length,
          routes: routes.length,
          stopTimes: stopTimes.length
        },
        options,
        effectiveLocationAvailable: !!effectiveLocationForDisplay,
        favoriteRoutesCount: favoriteRoutes.length,
        originalError: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined
      };

      const processingError = new HookError(
        `Vehicle processing failed: ${error instanceof Error ? error.message : String(error)}`,
        HookErrorType.PROCESSING_ERROR,
        'useVehicleProcessing',
        context,
        true, // Retryable
        new Date(),
        0,
        assessErrorSeverity(error instanceof Error ? error : new Error(String(error)), context)
      );

      setProcessingError(processingError);
      
      // Log structured error
      logStructuredError(processingError, {
        agencyId: config?.agencyId,
        filterByFavorites,
        maxStations,
        maxVehiclesPerStation
      });

      // Return fallback data instead of empty array
      const endTime = performance.now();
      performanceMonitor.recordExecution(endTime - startTime, false);
      
      return createFallbackData().stationVehicleGroups;
    }
  }, [
    isConfigured,
    effectiveLocationForDisplay,
    filterByFavorites,
    favoriteRoutes,
    allStations,
    vehicles,
    routes,
    stopTimes,
    maxStations,
    maxVehiclesPerStation,
    showAllVehiclesPerRoute,
    maxSearchRadius,
    proximityThreshold,
    shouldUseNearbyView,
    nearbyViewResult.stationVehicleGroups,
    nearbyViewResult.error,
    vehicleFilteringResult,
    vehicleGroupingResult
  ], 'stationVehicleGroups');

  // Effect to manage processing state
  React.useEffect(() => {
    if (stationVehicleGroups.length > 0 || 
        (!isConfigured || !effectiveLocationForDisplay || 
         (filterByFavorites && favoriteRoutes.length === 0) ||
         allStations.length === 0 || vehicles.length === 0)) {
      setIsProcessingVehicles(false);
    } else {
      setIsProcessingVehicles(true);
    }
  }, [
    stationVehicleGroups.length,
    isConfigured,
    effectiveLocationForDisplay,
    filterByFavorites,
    favoriteRoutes.length,
    allStations.length,
    vehicles.length
  ]);

  // Retry mechanism with exponential backoff
  React.useEffect(() => {
    if (processingError && 
        processingError instanceof HookError && 
        processingError.shouldRetry(DEFAULT_RETRY_CONFIG.maxRetries) &&
        retryCount < DEFAULT_RETRY_CONFIG.maxRetries) {
      
      const delay = calculateRetryDelay(retryCount, DEFAULT_RETRY_CONFIG);
      
      logger.info('Scheduling retry for processing error', {
        retryCount,
        delay,
        error: processingError.message,
        maxRetries: DEFAULT_RETRY_CONFIG.maxRetries
      }, 'useVehicleProcessing');

      retryTimeoutRef.current = window.setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setProcessingError(null);
        
        logger.info('Retrying vehicle processing', {
          retryAttempt: retryCount + 1,
          previousError: processingError.message
        }, 'useVehicleProcessing');
      }, delay);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [processingError, retryCount]);

  // Reset retry count on successful processing
  React.useEffect(() => {
    if (stationVehicleGroups.length > 0 && retryCount > 0) {
      setRetryCount(0);
      logger.info('Vehicle processing succeeded after retries', {
        totalRetries: retryCount,
        stationGroups: stationVehicleGroups.length
      }, 'useVehicleProcessing');
    }
  }, [stationVehicleGroups.length, retryCount]);

  // Cleanup effect for component unmounting
  React.useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  // Memory pressure monitoring effect
  React.useEffect(() => {
    const checkMemoryPressure = () => {
      const memoryStats = globalCache.getMemoryStats();
      
      if (memoryStats.isUnderPressure) {
        logger.warn('Cache under memory pressure, forcing cleanup', {
          memoryPressure: memoryStats.memoryPressure,
          cacheSize: memoryStats.totalEntries,
          maxSize: memoryStats.maxSize
        }, 'useVehicleProcessing');
        
        globalCache.forceCleanup();
      }
    };

    // Check memory pressure every 30 seconds
    const memoryCheckInterval = setInterval(checkMemoryPressure, 30 * 1000);
    addTimer(memoryCheckInterval);

    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, [addTimer]);

  // Determine final error state
  const finalError = processingError || aggregatedError;

  return {
    stationVehicleGroups,
    isLoading,
    isLoadingStations,
    isLoadingVehicles,
    isProcessingVehicles,
    effectiveLocationForDisplay,
    favoriteRoutes,
    allStations,
    vehicles,
    error: finalError
  };
};