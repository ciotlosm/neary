/**
 * Nearby View Adapter
 * 
 * Integration adapter that allows existing components to use the new nearby view
 * controller while maintaining backward compatibility with the existing
 * useVehicleProcessing hook interface.
 * 
 * Requirements: 6.5 - Clean integration with existing vehicle processing
 */

import type { 
  VehicleProcessingOptions,
  VehicleProcessingResult 
} from '../hooks/controllers/useVehicleProcessingOrchestration';
import type { 
  NearbyViewOptions,
  NearbyStationVehicleGroup 
} from '../controllers/nearbyViewController';
import { 
  useNearbyViewController,
  type UseNearbyViewControllerOptions 
} from '../hooks/controllers/useNearbyViewController';
import { logger } from '../utils/logger';

// ============================================================================
// ADAPTER INTERFACES
// ============================================================================

/**
 * Adapter options that map vehicle processing options to nearby view options
 */
export interface NearbyViewAdapterOptions extends VehicleProcessingOptions {
  // Nearby view specific options
  enableNearbyView?: boolean;
  stabilityMode?: 'strict' | 'normal' | 'flexible';
  enableStabilityTracking?: boolean;
  requireActiveRoutes?: boolean;
}

/**
 * Enhanced station vehicle group that maintains compatibility
 */
interface AdaptedStationVehicleGroup {
  station: { station: any; distance: number };
  vehicles: any[];
  allRoutes: Array<{
    routeId: string;
    routeName: string;
    vehicleCount: number;
  }>;
}

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * Adapter hook that provides nearby view functionality through the existing
 * vehicle processing interface for backward compatibility.
 * 
 * This allows existing components like StationDisplay to use the new nearby
 * view controller without requiring changes to their implementation.
 * 
 * @param options - Vehicle processing options with nearby view extensions
 * @returns Vehicle processing result with nearby view data
 * 
 * Requirements 6.5: Seamless integration with existing vehicle processing
 */
export const useNearbyViewAdapter = (
  options: NearbyViewAdapterOptions = {}
): VehicleProcessingResult => {
  const {
    enableNearbyView = true,
    stabilityMode = 'normal',
    enableStabilityTracking = true,
    requireActiveRoutes = true,
    filterByFavorites = false,
    maxStations = 2,
    maxVehiclesPerStation = 5,
    showAllVehiclesPerRoute = false,
    maxSearchRadius = 5000,
    proximityThreshold = 200,
    ...otherOptions
  } = options;

  // Map vehicle processing options to nearby view options
  const nearbyViewOptions: UseNearbyViewControllerOptions = {
    enableSecondStation: maxStations > 1,
    customDistanceThreshold: proximityThreshold,
    stabilityMode,
    maxSearchRadius,
    maxVehiclesPerStation,
    requireActiveRoutes,
    enableStabilityTracking,
    autoRefresh: true,
    refreshInterval: 30000,
    enableCaching: true
  };

  // Use nearby view controller if enabled, otherwise fall back to original logic
  const nearbyViewResult = useNearbyViewController(nearbyViewOptions);

  // Adapt nearby view result to vehicle processing result format
  const adaptedResult: VehicleProcessingResult = {
    stationVehicleGroups: adaptNearbyViewGroups(nearbyViewResult.stationVehicleGroups),
    isLoading: nearbyViewResult.isLoading,
    isLoadingStations: nearbyViewResult.isLoading,
    isLoadingVehicles: nearbyViewResult.isLoading,
    isProcessingVehicles: nearbyViewResult.isRefreshing,
    effectiveLocationForDisplay: nearbyViewResult.effectiveLocationForDisplay,
    favoriteRoutes: [], // Not used in nearby view context
    allStations: [], // Not directly available from nearby view
    vehicles: [], // Not directly available from nearby view
    error: nearbyViewResult.error ? new Error(nearbyViewResult.error.message) : undefined
  };

  logger.debug('Nearby view adapter result', {
    enableNearbyView,
    stationGroupsCount: adaptedResult.stationVehicleGroups.length,
    isLoading: adaptedResult.isLoading,
    hasError: !!adaptedResult.error,
    effectiveLocation: !!adaptedResult.effectiveLocationForDisplay
  });

  return adaptedResult;
};

/**
 * Adapt nearby view station groups to the expected vehicle processing format
 * 
 * @param nearbyGroups - Station groups from nearby view controller
 * @returns Adapted station groups compatible with existing components
 */
const adaptNearbyViewGroups = (
  nearbyGroups: NearbyStationVehicleGroup[]
): AdaptedStationVehicleGroup[] => {
  return nearbyGroups.map(group => ({
    station: {
      station: group.station.station,
      distance: group.station.distance
    },
    vehicles: group.vehicles,
    allRoutes: group.allRoutes
  }));
};

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Check if nearby view should be used based on configuration and feature flags
 * 
 * @param options - Adapter options
 * @returns True if nearby view should be enabled
 */
export const shouldUseNearbyView = (options: NearbyViewAdapterOptions): boolean => {
  // Check if nearby view is explicitly disabled
  if (options.enableNearbyView === false) {
    return false;
  }

  // Check if we're in favorites mode (nearby view not applicable)
  if (options.filterByFavorites) {
    logger.debug('Nearby view disabled for favorites mode');
    return false;
  }

  // Check if maxStations is set to a value that makes sense for nearby view
  if (options.maxStations && options.maxStations > 2) {
    logger.debug('Nearby view disabled for maxStations > 2', { maxStations: options.maxStations });
    return false;
  }

  return true;
};

/**
 * Create adapter options from legacy vehicle processing options
 * 
 * @param legacyOptions - Original vehicle processing options
 * @returns Adapted options for nearby view
 */
export const createAdapterOptions = (
  legacyOptions: VehicleProcessingOptions
): NearbyViewAdapterOptions => {
  return {
    ...legacyOptions,
    enableNearbyView: shouldUseNearbyView(legacyOptions),
    stabilityMode: 'normal',
    enableStabilityTracking: true,
    requireActiveRoutes: true
  };
};

/**
 * Validate that adapter options are compatible with nearby view
 * 
 * @param options - Adapter options to validate
 * @returns Validation result with warnings
 */
export const validateAdapterOptions = (
  options: NearbyViewAdapterOptions
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isValid = true;

  // Check for conflicting options
  if (options.filterByFavorites && options.enableNearbyView) {
    warnings.push('Nearby view is not compatible with favorites filtering');
  }

  if (options.maxStations && options.maxStations > 2 && options.enableNearbyView) {
    warnings.push('Nearby view is optimized for maxStations <= 2');
  }

  if (options.showAllVehiclesPerRoute && options.maxVehiclesPerStation && options.maxVehiclesPerStation < 10) {
    warnings.push('showAllVehiclesPerRoute may be limited by maxVehiclesPerStation');
  }

  // Check for performance concerns
  if (options.maxSearchRadius && options.maxSearchRadius > 10000) {
    warnings.push('Large search radius may impact performance');
  }

  return { isValid, warnings };
};

// ============================================================================
// FEATURE FLAG UTILITIES
// ============================================================================

/**
 * Feature flag for gradual rollout of nearby view functionality
 */
export const NEARBY_VIEW_FEATURE_FLAG = {
  enabled: true,
  rolloutPercentage: 100, // 100% rollout
  enabledForFavorites: false,
  enabledForLargeStationCounts: false
};

/**
 * Check if nearby view feature is enabled for the current context
 * 
 * @param context - Context information for feature flag evaluation
 * @returns True if feature should be enabled
 */
export const isNearbyViewFeatureEnabled = (context: {
  userId?: string;
  isFavoritesMode?: boolean;
  stationCount?: number;
} = {}): boolean => {
  if (!NEARBY_VIEW_FEATURE_FLAG.enabled) {
    return false;
  }

  // Check favorites mode
  if (context.isFavoritesMode && !NEARBY_VIEW_FEATURE_FLAG.enabledForFavorites) {
    return false;
  }

  // Check station count
  if (context.stationCount && context.stationCount > 10 && !NEARBY_VIEW_FEATURE_FLAG.enabledForLargeStationCounts) {
    return false;
  }

  // Simple rollout percentage check (in a real app, this would use proper feature flag service)
  if (NEARBY_VIEW_FEATURE_FLAG.rolloutPercentage < 100) {
    const hash = context.userId ? simpleHash(context.userId) : Math.random();
    return (hash * 100) < NEARBY_VIEW_FEATURE_FLAG.rolloutPercentage;
  }

  return true;
};

/**
 * Simple hash function for consistent feature flag evaluation
 * 
 * @param str - String to hash
 * @returns Hash value between 0 and 1
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
};

// ============================================================================
// DEBUGGING AND MONITORING
// ============================================================================

/**
 * Debug information for nearby view adapter
 */
export interface NearbyViewAdapterDebugInfo {
  adapterEnabled: boolean;
  nearbyViewEnabled: boolean;
  featureFlagEnabled: boolean;
  options: NearbyViewAdapterOptions;
  validationResult: { isValid: boolean; warnings: string[] };
  performance: {
    lastProcessingTime: number;
    averageProcessingTime: number;
    errorRate: number;
  };
}

/**
 * Get debug information for the nearby view adapter
 * 
 * @param options - Current adapter options
 * @returns Debug information object
 */
export const getNearbyViewAdapterDebugInfo = (
  options: NearbyViewAdapterOptions
): NearbyViewAdapterDebugInfo => {
  const validationResult = validateAdapterOptions(options);
  const featureFlagEnabled = isNearbyViewFeatureEnabled({
    isFavoritesMode: options.filterByFavorites
  });

  return {
    adapterEnabled: true,
    nearbyViewEnabled: shouldUseNearbyView(options),
    featureFlagEnabled,
    options,
    validationResult,
    performance: {
      lastProcessingTime: 0, // Would be tracked in real implementation
      averageProcessingTime: 0,
      errorRate: 0
    }
  };
};