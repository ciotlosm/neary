/**
 * Nearby View Error Handler
 * 
 * Comprehensive error handling and fallback logic for the Nearby View
 * Stabilization system. Provides error classification, recovery strategies,
 * and user-friendly error messages.
 * 
 * Requirements: 5.4, 7.1, 7.2, 7.3, 7.5 - Error handling and edge cases
 */

import type { Coordinates, Station } from '../types';
import type { 
  NearbyViewError, 
  NearbyViewResult 
} from '../controllers/nearbyViewController';
import { NearbyViewErrorType } from '../controllers/nearbyViewController';
import { logger } from '../utils/logger';

// ============================================================================
// ERROR CLASSIFICATION AND RECOVERY
// ============================================================================

/**
 * Error severity levels for nearby view errors
 */
export enum NearbyViewErrorSeverity {
  LOW = 'low',           // Minor issues, system can continue
  MEDIUM = 'medium',     // Significant issues, degraded functionality
  HIGH = 'high',         // Major issues, limited functionality
  CRITICAL = 'critical'  // System cannot function
}

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'retry',                    // Retry the operation
  FALLBACK_DATA = 'fallback_data',    // Use cached or default data
  DEGRADE_GRACEFULLY = 'degrade_gracefully', // Reduce functionality
  USER_ACTION = 'user_action',        // Require user intervention
  SHOW_MESSAGE = 'show_message'       // Display informative message
}

/**
 * Error context information
 */
export interface ErrorContext {
  userLocation?: Coordinates | null;
  stationsAvailable?: number;
  routesAvailable?: number;
  vehiclesAvailable?: number;
  hasGTFSData?: boolean;
  isConfigured?: boolean;
  timestamp: Date;
  retryCount?: number;
  previousErrors?: string[];
  // Extended context for offline state
  isOnline?: boolean;
  isApiOnline?: boolean;
  isUsingCachedData?: boolean;
  lastApiSuccess?: Date | null;
  lastCacheUpdate?: Date | null;
  cacheAge?: number | null;
}

/**
 * Error recovery plan
 */
export interface ErrorRecoveryPlan {
  strategy: RecoveryStrategy;
  severity: NearbyViewErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
  retryDelay?: number;
  fallbackData?: Partial<NearbyViewResult>;
  userActions?: string[];
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

/**
 * Classify nearby view error and determine appropriate recovery strategy
 * 
 * @param error - Nearby view error to classify
 * @param context - Additional context information
 * @returns Error recovery plan with strategy and user guidance
 * 
 * Requirements 7.1, 7.2, 7.3: Error classification and handling
 */
export const classifyNearbyViewError = (
  error: NearbyViewError,
  context: ErrorContext
): ErrorRecoveryPlan => {
  switch (error.type) {
    case NearbyViewErrorType.NO_GPS_LOCATION:
      return handleLocationError(error, context);
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      return handleNoStationsError(error, context);
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      return handleNoRoutesError(error, context);
    
    case NearbyViewErrorType.STATION_SELECTION_FAILED:
      return handleSelectionError(error, context);
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      return handleVehicleProcessingError(error, context);
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      return handleDataLoadingError(error, context);
    
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      return handleConfigurationError(error, context);
    
    case NearbyViewErrorType.OFFLINE_MODE:
      return handleOfflineModeError(error, context);
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      return handleCacheUnavailableError(error, context);
    
    default:
      return handleUnknownError(error, context);
  }
};

/**
 * Handle GPS location errors
 * 
 * Requirements 7.1: No GPS position handling
 */
const handleLocationError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const hasLocationPermission = context.userLocation !== undefined;
  const hasConfiguredLocation = context.isConfigured;
  
  if (!hasLocationPermission) {
    // Check if user has configured fallback locations in settings
    if (hasConfiguredLocation) {
      return {
        strategy: RecoveryStrategy.FALLBACK_DATA,
        severity: NearbyViewErrorSeverity.MEDIUM,
        userMessage: 'Location access denied. Using your configured default location from settings.',
        technicalMessage: 'GPS location permission denied, using fallback offline coordinates',
        retryable: true,
        retryDelay: 10000,
        userActions: [
          'Enable location services for live updates',
          'Your configured location is being used as fallback',
          'Update your default location in settings if needed'
        ]
      };
    }
    
    return {
      strategy: RecoveryStrategy.USER_ACTION,
      severity: NearbyViewErrorSeverity.HIGH,
      userMessage: 'Location access is required to find nearby buses. Please enable location services or configure a default location.',
      technicalMessage: 'GPS location permission denied and no fallback location configured',
      retryable: false,
      userActions: [
        'Enable location services in your browser',
        'Allow location access when prompted',
        'Check that location services are enabled on your device',
        'Go to Settings → Location to set a default location',
        'Use the location picker to set a manual location'
      ]
    };
  }
  
  return {
    strategy: RecoveryStrategy.FALLBACK_DATA,
    severity: NearbyViewErrorSeverity.MEDIUM,
    userMessage: 'Unable to get your current location. Using default location.',
    technicalMessage: 'GPS coordinates invalid or location service unavailable',
    retryable: true,
    retryDelay: 5000,
    userActions: [
      'Check your device location settings',
      'Try refreshing the page',
      'Set a manual location in settings'
    ]
  };
};

/**
 * Handle no stations in range errors
 * 
 * Requirements 7.2: No stations available handling
 */
const handleNoStationsError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const hasStations = (context.stationsAvailable || 0) > 0;
  
  if (!hasStations) {
    return {
      strategy: RecoveryStrategy.SHOW_MESSAGE,
      severity: NearbyViewErrorSeverity.MEDIUM,
      userMessage: 'No bus stations found in your area. This might be a temporary issue.',
      technicalMessage: 'No station data available from API',
      retryable: true,
      retryDelay: 30000,
      userActions: [
        'Try again in a few minutes',
        'Check your internet connection',
        'Contact support if the issue persists'
      ]
    };
  }
  
  return {
    strategy: RecoveryStrategy.DEGRADE_GRACEFULLY,
    severity: NearbyViewErrorSeverity.LOW,
    userMessage: 'No bus stations found within 5km of your location. Try a different area.',
    technicalMessage: 'No stations within search radius',
    retryable: false,
    userActions: [
      'Move to a different location',
      'Increase search radius in settings',
      'Use the map to find stations manually'
    ]
  };
};

/**
 * Handle no routes available errors
 * 
 * Requirements 7.3: No active routes handling
 */
const handleNoRoutesError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const hasRoutes = (context.routesAvailable || 0) > 0;
  
  if (!hasRoutes) {
    return {
      strategy: RecoveryStrategy.RETRY,
      severity: NearbyViewErrorSeverity.HIGH,
      userMessage: 'Bus route information is temporarily unavailable. Retrying...',
      technicalMessage: 'No route data available from API',
      retryable: true,
      retryDelay: 10000,
      userActions: [
        'Wait for automatic retry',
        'Check your internet connection',
        'Try refreshing the page'
      ]
    };
  }
  
  return {
    strategy: RecoveryStrategy.SHOW_MESSAGE,
    severity: NearbyViewErrorSeverity.MEDIUM,
    userMessage: 'No active bus routes found for nearby stations. Service may be limited.',
    technicalMessage: 'Stations available but no route associations found',
    retryable: true,
    retryDelay: 60000,
    userActions: [
      'Check if buses are running today',
      'Try again later',
      'Contact transit authority for service updates'
    ]
  };
};

/**
 * Handle station selection errors
 */
const handleSelectionError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const retryCount = context.retryCount || 0;
  
  if (retryCount < 3) {
    return {
      strategy: RecoveryStrategy.RETRY,
      severity: NearbyViewErrorSeverity.MEDIUM,
      userMessage: 'Having trouble finding nearby stations. Retrying...',
      technicalMessage: `Station selection failed: ${error.message}`,
      retryable: true,
      retryDelay: Math.min(1000 * Math.pow(2, retryCount), 10000), // Exponential backoff
      userActions: ['Please wait while we retry']
    };
  }
  
  return {
    strategy: RecoveryStrategy.FALLBACK_DATA,
    severity: NearbyViewErrorSeverity.HIGH,
    userMessage: 'Unable to find nearby stations. Showing all available stations.',
    technicalMessage: `Station selection failed after ${retryCount} retries`,
    retryable: false,
    fallbackData: {
      selectedStations: { closestStation: null, secondStation: null, rejectedStations: [] },
      stationVehicleGroups: []
    },
    userActions: [
      'Try refreshing the page',
      'Check your location settings',
      'Contact support if the issue continues'
    ]
  };
};

/**
 * Handle vehicle processing errors
 */
const handleVehicleProcessingError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  return {
    strategy: RecoveryStrategy.DEGRADE_GRACEFULLY,
    severity: NearbyViewErrorSeverity.LOW,
    userMessage: 'Live bus information may be limited. Showing available data.',
    technicalMessage: `Vehicle processing failed: ${error.message}`,
    retryable: true,
    retryDelay: 30000,
    userActions: [
      'Station information is still available',
      'Live bus times will be retried automatically',
      'Try refreshing for updated information'
    ]
  };
};

/**
 * Handle data loading errors
 * 
 * Requirements 7.4: API data temporarily unavailable handling
 */
const handleDataLoadingError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const retryCount = context.retryCount || 0;
  const hasGTFSData = context.hasGTFSData;
  
  // If we have some cached data available, use it
  if (hasGTFSData || (context.stationsAvailable && context.stationsAvailable > 0)) {
    return {
      strategy: RecoveryStrategy.FALLBACK_DATA,
      severity: NearbyViewErrorSeverity.LOW,
      userMessage: 'Using cached data while we retry loading fresh information.',
      technicalMessage: `Data loading failed, using cached data: ${error.message}`,
      retryable: true,
      retryDelay: Math.min(5000 * Math.pow(2, retryCount), 30000), // Exponential backoff, max 30s
      fallbackData: {
        selectedStations: { closestStation: null, secondStation: null, rejectedStations: [] },
        stationVehicleGroups: [],
        isLoading: false
      },
      userActions: [
        'Cached data is being displayed',
        'Fresh data will be loaded automatically',
        'Check your internet connection if issues persist'
      ]
    };
  }
  
  // No cached data available, need to retry
  if (retryCount < 3) {
    return {
      strategy: RecoveryStrategy.RETRY,
      severity: NearbyViewErrorSeverity.MEDIUM,
      userMessage: 'Having trouble loading bus data. Retrying...',
      technicalMessage: `Data loading failed (attempt ${retryCount + 1}): ${error.message}`,
      retryable: true,
      retryDelay: Math.min(5000 * Math.pow(2, retryCount), 30000),
      userActions: [
        'Check your internet connection',
        'Wait for automatic retry',
        `Retry attempt ${retryCount + 1} of 3`
      ]
    };
  }
  
  // Max retries exceeded
  return {
    strategy: RecoveryStrategy.SHOW_MESSAGE,
    severity: NearbyViewErrorSeverity.HIGH,
    userMessage: 'Unable to load bus data. Please check your connection and try again.',
    technicalMessage: `Data loading failed after ${retryCount} retries: ${error.message}`,
    retryable: false,
    userActions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the issue continues',
      'The app may work better when you have a stable connection'
    ]
  };
};

/**
 * Handle configuration errors
 */
const handleConfigurationError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  return {
    strategy: RecoveryStrategy.USER_ACTION,
    severity: NearbyViewErrorSeverity.CRITICAL,
    userMessage: 'App configuration is incomplete. Please complete the setup.',
    technicalMessage: `Configuration error: ${error.message}`,
    retryable: false,
    userActions: [
      'Complete the initial app setup',
      'Check your API key configuration',
      'Select your city and location',
      'Contact support if setup issues persist'
    ]
  };
};

/**
 * Handle offline mode errors
 * 
 * Requirements 7.6: Proper app hooks for cached data and offline work
 */
const handleOfflineModeError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const hasGTFSData = context.hasGTFSData;
  const hasCachedStations = (context.stationsAvailable || 0) > 0;
  
  if (hasGTFSData || hasCachedStations) {
    return {
      strategy: RecoveryStrategy.FALLBACK_DATA,
      severity: NearbyViewErrorSeverity.LOW,
      userMessage: 'You\'re offline. Showing cached bus information.',
      technicalMessage: 'Operating in offline mode with cached data',
      retryable: true,
      retryDelay: 60000, // Retry connection every minute
      fallbackData: {
        selectedStations: { closestStation: null, secondStation: null, rejectedStations: [] },
        stationVehicleGroups: []
      },
      userActions: [
        'Cached information is being displayed',
        'Live updates will resume when connection is restored',
        'Some features may be limited while offline'
      ]
    };
  }
  
  return {
    strategy: RecoveryStrategy.SHOW_MESSAGE,
    severity: NearbyViewErrorSeverity.HIGH,
    userMessage: 'You\'re offline and no cached data is available. Please connect to the internet.',
    technicalMessage: 'Offline mode with no cached data available',
    retryable: true,
    retryDelay: 30000,
    userActions: [
      'Check your internet connection',
      'Try connecting to Wi-Fi',
      'The app will work better with cached data from previous use'
    ]
  };
};

/**
 * Handle cache unavailable errors
 * 
 * Requirements 7.6: Proper cache integration
 */
const handleCacheUnavailableError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  return {
    strategy: RecoveryStrategy.RETRY,
    severity: NearbyViewErrorSeverity.MEDIUM,
    userMessage: 'Cache system unavailable. Loading fresh data...',
    technicalMessage: `Cache system error: ${error.message}`,
    retryable: true,
    retryDelay: 3000,
    userActions: [
      'Fresh data is being loaded',
      'Performance may be slower without cache',
      'Try refreshing if issues persist'
    ]
  };
};

/**
 * Handle unknown errors
 */
const handleUnknownError = (error: NearbyViewError, context: ErrorContext): ErrorRecoveryPlan => {
  const retryCount = context.retryCount || 0;
  
  return {
    strategy: retryCount < 2 ? RecoveryStrategy.RETRY : RecoveryStrategy.SHOW_MESSAGE,
    severity: NearbyViewErrorSeverity.MEDIUM,
    userMessage: retryCount < 2 ? 'Something went wrong. Trying again...' : 'An unexpected error occurred. Please try refreshing the page.',
    technicalMessage: `Unknown error (attempt ${retryCount + 1}): ${error.message}`,
    retryable: retryCount < 2,
    retryDelay: 5000,
    userActions: [
      retryCount < 2 ? 'Wait for automatic retry' : 'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the issue continues'
    ]
  };
};

// ============================================================================
// FALLBACK DATA GENERATION
// ============================================================================

/**
 * Generate fallback data for error scenarios
 * 
 * @param errorType - Type of error that occurred
 * @param context - Error context information
 * @returns Fallback nearby view result
 * 
 * Requirements 5.4: Fallback displays and error handling
 */
export const generateFallbackData = (
  errorType: NearbyViewErrorType,
  context: ErrorContext
): NearbyViewResult => {
  const baseResult: NearbyViewResult = {
    selectedStations: {
      closestStation: null,
      secondStation: null,
      rejectedStations: []
    },
    stationVehicleGroups: [],
    isLoading: false,
    effectiveLocationForDisplay: context.userLocation || null,
    thresholdUsed: 200,
    selectionMetadata: {
      totalStationsEvaluated: context.stationsAvailable || 0,
      stationsWithRoutes: 0,
      selectionTime: 0,
      stabilityApplied: false
    },
    error: {
      type: errorType,
      message: 'Fallback data generated due to error',
      fallbackAction: 'show_message'
    }
  };

  // Customize fallback based on error type
  switch (errorType) {
    case NearbyViewErrorType.NO_GPS_LOCATION:
      baseResult.effectiveLocationForDisplay = null;
      baseResult.error = {
        type: errorType,
        message: 'Location access required for nearby view',
        fallbackAction: 'show_message'
      };
      break;
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      // Keep error to show appropriate message
      baseResult.error = {
        type: errorType,
        message: 'No stations found in your area',
        fallbackAction: 'show_message'
      };
      break;
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      // Keep error to show route unavailable message
      baseResult.error = {
        type: errorType,
        message: 'No active routes available',
        fallbackAction: 'show_message'
      };
      break;
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      // Show stations without vehicle data - remove error to allow partial display
      baseResult.error = undefined;
      break;
    
    case NearbyViewErrorType.OFFLINE_MODE:
      baseResult.error = {
        type: errorType,
        message: 'Operating in offline mode',
        fallbackAction: 'use_cached_data'
      };
      break;
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      baseResult.error = {
        type: errorType,
        message: 'Data loading failed, using cached information',
        fallbackAction: 'use_cached_data'
      };
      break;
    
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      baseResult.error = {
        type: errorType,
        message: 'App configuration incomplete',
        fallbackAction: 'show_message'
      };
      break;
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      baseResult.error = {
        type: errorType,
        message: 'Cache unavailable, loading fresh data',
        fallbackAction: 'retry'
      };
      break;
  }

  return baseResult;
};

// ============================================================================
// ERROR RECOVERY UTILITIES
// ============================================================================

/**
 * Execute error recovery strategy
 * 
 * @param plan - Error recovery plan
 * @param retryCallback - Function to call for retry operations
 * @returns Promise that resolves when recovery action is complete
 */
export const executeRecoveryStrategy = async (
  plan: ErrorRecoveryPlan,
  retryCallback?: () => Promise<void>
): Promise<void> => {
  logger.info('Executing error recovery strategy', {
    strategy: plan.strategy,
    severity: plan.severity,
    retryable: plan.retryable,
    retryDelay: plan.retryDelay
  });

  switch (plan.strategy) {
    case RecoveryStrategy.RETRY:
      if (retryCallback && plan.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, plan.retryDelay));
        await retryCallback();
      }
      break;
    
    case RecoveryStrategy.FALLBACK_DATA:
      // Fallback data should be provided in the plan
      logger.debug('Using fallback data for error recovery');
      break;
    
    case RecoveryStrategy.DEGRADE_GRACEFULLY:
      logger.debug('Gracefully degrading functionality');
      break;
    
    case RecoveryStrategy.USER_ACTION:
      logger.debug('User action required for error recovery');
      break;
    
    case RecoveryStrategy.SHOW_MESSAGE:
      logger.debug('Showing error message to user');
      break;
  }
};

/**
 * Check if error recovery should be attempted
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @returns True if recovery should be attempted
 */
export const shouldAttemptRecovery = (
  error: NearbyViewError,
  context: ErrorContext
): boolean => {
  const retryCount = context.retryCount || 0;
  const maxRetries = 3;
  
  // Don't retry if max retries exceeded
  if (retryCount >= maxRetries) {
    return false;
  }
  
  // Don't retry configuration errors
  if (error.type === NearbyViewErrorType.CONFIGURATION_ERROR) {
    return false;
  }
  
  // Don't retry if explicitly marked as non-retryable
  if (error.retryable === false) {
    return false;
  }
  
  return true;
};

/**
 * Create error context from current application state
 * 
 * @param params - Parameters for creating error context
 * @returns Error context object
 */
export const createErrorContext = (params: {
  userLocation?: Coordinates | null;
  stationsCount?: number;
  routesCount?: number;
  vehiclesCount?: number;
  hasGTFSData?: boolean;
  isConfigured?: boolean;
  retryCount?: number;
  previousErrors?: string[];
}): ErrorContext => {
  return {
    userLocation: params.userLocation,
    stationsAvailable: params.stationsCount,
    routesAvailable: params.routesCount,
    vehiclesAvailable: params.vehiclesCount,
    hasGTFSData: params.hasGTFSData,
    isConfigured: params.isConfigured,
    timestamp: new Date(),
    retryCount: params.retryCount || 0,
    previousErrors: params.previousErrors || []
  };
};

/**
 * Create error context with offline store integration
 * 
 * @param params - Parameters for creating error context
 * @param offlineStoreState - Current offline store state
 * @returns Enhanced error context with offline information
 * 
 * Requirements 7.6: Integration with app hooks and cache system
 */
export const createErrorContextWithOfflineState = (
  params: {
    userLocation?: Coordinates | null;
    stationsCount?: number;
    routesCount?: number;
    vehiclesCount?: number;
    hasGTFSData?: boolean;
    isConfigured?: boolean;
    retryCount?: number;
    previousErrors?: string[];
  },
  offlineStoreState?: {
    isOnline?: boolean;
    isApiOnline?: boolean;
    isUsingCachedData?: boolean;
    lastApiSuccess?: Date | null;
    lastCacheUpdate?: Date | null;
  }
): ErrorContext => {
  const baseContext = createErrorContext(params);
  
  // Enhance context with offline state information
  if (offlineStoreState) {
    baseContext.isOnline = offlineStoreState.isOnline;
    baseContext.isApiOnline = offlineStoreState.isApiOnline;
    baseContext.isUsingCachedData = offlineStoreState.isUsingCachedData;
    baseContext.lastApiSuccess = offlineStoreState.lastApiSuccess;
    baseContext.lastCacheUpdate = offlineStoreState.lastCacheUpdate;
    baseContext.cacheAge = offlineStoreState.lastCacheUpdate 
      ? Date.now() - offlineStoreState.lastCacheUpdate.getTime()
      : null;
  }
  
  return baseContext;
};

/**
 * Determine if error should trigger offline mode
 * 
 * @param error - Nearby view error
 * @param context - Error context with offline state
 * @returns True if should switch to offline mode
 */
export const shouldTriggerOfflineMode = (
  error: NearbyViewError,
  context: ErrorContext
): boolean => {
  // Check if we're already in offline mode
  if (error.type === NearbyViewErrorType.OFFLINE_MODE) {
    return false;
  }
  
  // Check if this is a network-related error
  const networkErrors = [
    NearbyViewErrorType.DATA_LOADING_ERROR,
    NearbyViewErrorType.NO_STATIONS_IN_RANGE,
    NearbyViewErrorType.NO_ROUTES_AVAILABLE
  ];
  
  if (!networkErrors.includes(error.type)) {
    return false;
  }
  
  // Check offline state from context
  const isOnline = context.isOnline;
  const isApiOnline = context.isApiOnline;
  const hasRecentCache = context.lastCacheUpdate && 
    (Date.now() - context.lastCacheUpdate.getTime()) < 300000; // 5 minutes
  
  // Trigger offline mode if we're offline or API is down and we have cache
  return (!isOnline || !isApiOnline) && hasRecentCache;
};

/**
 * Get user-friendly error message based on error type and context
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @returns User-friendly error message
 * 
 * Requirements 7.1, 7.2, 7.3, 7.5: Appropriate user messages for each error scenario
 */
export const getUserFriendlyErrorMessage = (
  error: NearbyViewError,
  context: ErrorContext
): string => {
  const plan = classifyNearbyViewError(error, context);
  return plan.userMessage;
};

/**
 * Get actionable user instructions based on error type
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @returns Array of actionable instructions for the user
 */
export const getActionableInstructions = (
  error: NearbyViewError,
  context: ErrorContext
): string[] => {
  const plan = classifyNearbyViewError(error, context);
  return plan.userActions || [];
};

// ============================================================================
// ERROR MONITORING AND ANALYTICS
// ============================================================================

/**
 * Error statistics for monitoring
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Map<NearbyViewErrorType, number>;
  errorsBySeverity: Map<NearbyViewErrorSeverity, number>;
  recoverySuccessRate: number;
  averageRecoveryTime: number;
  mostCommonErrors: Array<{ type: NearbyViewErrorType; count: number }>;
}

/**
 * Track error occurrence for monitoring and analytics
 * 
 * @param error - Error that occurred
 * @param plan - Recovery plan that was executed
 * @param recoverySuccessful - Whether recovery was successful
 */
export const trackErrorOccurrence = (
  error: NearbyViewError,
  plan: ErrorRecoveryPlan,
  recoverySuccessful: boolean
): void => {
  logger.info('Tracking nearby view error occurrence', {
    errorType: error.type,
    severity: plan.severity,
    strategy: plan.strategy,
    recoverySuccessful,
    retryable: plan.retryable,
    timestamp: new Date().toISOString()
  });
  
  // In a real application, this would send data to analytics service
  // For now, we just log the information for debugging
};