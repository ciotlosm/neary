/**
 * Station Display Integration Hook
 * 
 * Integration hook that provides a seamless transition between the existing
 * vehicle processing system and the new nearby view controller. This allows
 * for gradual migration and A/B testing of the new functionality.
 * 
 * Requirements: 6.5 - Integration with existing StationDisplay component
 */

import { useMemo } from 'react';
import { useVehicleProcessing, type VehicleProcessingOptions } from './useVehicleProcessingOrchestration';
import { useNearbyViewAdapter, type NearbyViewAdapterOptions } from '../../adapters/nearbyViewAdapter';
import { isNearbyViewFeatureEnabled, shouldUseNearbyView } from '../../adapters/nearbyViewAdapter';
import { logger } from '../../utils/logger';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Integration options that extend vehicle processing options
 */
export interface StationDisplayIntegrationOptions extends VehicleProcessingOptions {
  // Feature flag controls
  enableNearbyView?: boolean;
  forceNearbyView?: boolean;
  
  // Nearby view specific options
  stabilityMode?: 'strict' | 'normal' | 'flexible';
  enableStabilityTracking?: boolean;
  requireActiveRoutes?: boolean;
  
  // Debug and monitoring
  enableDebugLogging?: boolean;
  trackPerformance?: boolean;
}

/**
 * Integration result that maintains compatibility with existing components
 */
export interface StationDisplayIntegrationResult {
  // Standard vehicle processing result fields
  stationVehicleGroups: any[];
  isLoading: boolean;
  isLoadingStations: boolean;
  isLoadingVehicles: boolean;
  isProcessingVehicles: boolean;
  effectiveLocationForDisplay: any;
  favoriteRoutes: any[];
  allStations: any[];
  vehicles: any[];
  error?: Error;
  
  // Integration metadata
  usingNearbyView: boolean;
  integrationVersion: string;
  performanceMetrics?: {
    processingTime: number;
    stationSelectionTime: number;
    vehicleProcessingTime: number;
  };
}

// ============================================================================
// FEATURE FLAG CONFIGURATION
// ============================================================================

/**
 * Feature flag configuration for nearby view integration
 */
const NEARBY_VIEW_INTEGRATION_CONFIG = {
  // Global feature flag
  enabled: true,
  
  // Rollout percentage (0-100)
  rolloutPercentage: 100,
  
  // Specific feature controls
  enableForStationDisplay: true,
  enableForFavorites: false,
  enableStabilityTracking: true,
  
  // Performance thresholds
  maxProcessingTime: 1000, // ms
  maxStationCount: 50,
  
  // Debug settings
  enableDebugLogging: false,
  enablePerformanceTracking: true
};

// ============================================================================
// INTEGRATION HOOK
// ============================================================================

/**
 * Main integration hook for StationDisplay component
 * 
 * This hook provides a seamless interface that can use either the existing
 * vehicle processing system or the new nearby view controller based on
 * feature flags and configuration.
 * 
 * @param options - Integration options
 * @returns Integration result compatible with existing StationDisplay
 * 
 * Requirements 6.5: Clean integration without breaking existing functionality
 */
export const useStationDisplayIntegration = (
  options: StationDisplayIntegrationOptions = {}
): StationDisplayIntegrationResult => {
  const {
    enableNearbyView,
    forceNearbyView = false,
    enableDebugLogging = NEARBY_VIEW_INTEGRATION_CONFIG.enableDebugLogging,
    trackPerformance = NEARBY_VIEW_INTEGRATION_CONFIG.enablePerformanceTracking,
    ...vehicleProcessingOptions
  } = options;

  // Determine which system to use
  const shouldUseNearbyViewController = useMemo(() => {
    // Check force flag first
    if (forceNearbyView) {
      if (enableDebugLogging) {
        logger.debug('Nearby view forced via forceNearbyView flag');
      }
      return true;
    }

    // Check explicit disable
    if (enableNearbyView === false) {
      if (enableDebugLogging) {
        logger.debug('Nearby view explicitly disabled');
      }
      return false;
    }

    // Check global feature flag
    if (!NEARBY_VIEW_INTEGRATION_CONFIG.enabled || !NEARBY_VIEW_INTEGRATION_CONFIG.enableForStationDisplay) {
      if (enableDebugLogging) {
        logger.debug('Nearby view disabled by global feature flag');
      }
      return false;
    }

    // Check if nearby view is appropriate for current options
    const adapterOptions: NearbyViewAdapterOptions = {
      ...vehicleProcessingOptions,
      enableNearbyView: true
    };

    if (!shouldUseNearbyView(adapterOptions)) {
      if (enableDebugLogging) {
        logger.debug('Nearby view not appropriate for current options', { options: adapterOptions });
      }
      return false;
    }

    // Check feature flag with context
    const featureEnabled = isNearbyViewFeatureEnabled({
      isFavoritesMode: vehicleProcessingOptions.filterByFavorites,
      stationCount: undefined // Not available at this level
    });

    if (!featureEnabled) {
      if (enableDebugLogging) {
        logger.debug('Nearby view disabled by feature flag evaluation');
      }
      return false;
    }

    if (enableDebugLogging) {
      logger.debug('Nearby view enabled for station display');
    }
    return true;
  }, [
    forceNearbyView,
    enableNearbyView,
    vehicleProcessingOptions.filterByFavorites,
    vehicleProcessingOptions.maxStations,
    enableDebugLogging
  ]);

  // Use appropriate hook based on decision
  const nearbyViewResult = useNearbyViewAdapter({
    ...vehicleProcessingOptions,
    enableNearbyView: shouldUseNearbyViewController,
    stabilityMode: options.stabilityMode || 'normal',
    enableStabilityTracking: options.enableStabilityTracking ?? NEARBY_VIEW_INTEGRATION_CONFIG.enableStabilityTracking,
    requireActiveRoutes: options.requireActiveRoutes ?? true
  });

  const legacyResult = useVehicleProcessing(vehicleProcessingOptions);

  // Select result based on which system is being used
  const selectedResult = shouldUseNearbyViewController ? nearbyViewResult : legacyResult;

  // Create integration result with metadata
  const integrationResult: StationDisplayIntegrationResult = useMemo(() => {
    const result: StationDisplayIntegrationResult = {
      ...selectedResult,
      usingNearbyView: shouldUseNearbyViewController,
      integrationVersion: '1.0.0'
    };

    // Add performance metrics if tracking is enabled
    if (trackPerformance) {
      result.performanceMetrics = {
        processingTime: 0, // Would be measured in real implementation
        stationSelectionTime: 0,
        vehicleProcessingTime: 0
      };
    }

    return result;
  }, [selectedResult, shouldUseNearbyViewController, trackPerformance]);

  // Debug logging
  if (enableDebugLogging) {
    logger.debug('Station display integration result', {
      usingNearbyView: integrationResult.usingNearbyView,
      stationGroupsCount: integrationResult.stationVehicleGroups.length,
      isLoading: integrationResult.isLoading,
      hasError: !!integrationResult.error,
      effectiveLocation: !!integrationResult.effectiveLocationForDisplay
    });
  }

  return integrationResult;
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for testing nearby view functionality
 * 
 * This hook forces the use of nearby view controller for testing purposes.
 * 
 * @param options - Vehicle processing options
 * @returns Integration result using nearby view
 */
export const useNearbyViewTest = (
  options: VehicleProcessingOptions = {}
): StationDisplayIntegrationResult => {
  return useStationDisplayIntegration({
    ...options,
    forceNearbyView: true,
    enableDebugLogging: true,
    trackPerformance: true
  });
};

/**
 * Hook for comparing nearby view vs legacy performance
 * 
 * This hook runs both systems and compares their results for analysis.
 * Should only be used in development/testing environments.
 * 
 * @param options - Vehicle processing options
 * @returns Comparison result with both systems' outputs
 */
export const useNearbyViewComparison = (
  options: VehicleProcessingOptions = {}
) => {
  const nearbyViewResult = useStationDisplayIntegration({
    ...options,
    forceNearbyView: true,
    enableDebugLogging: true
  });

  const legacyResult = useVehicleProcessing(options);

  return {
    nearbyView: nearbyViewResult,
    legacy: legacyResult,
    comparison: {
      stationCountDiff: nearbyViewResult.stationVehicleGroups.length - legacyResult.stationVehicleGroups.length,
      bothHaveData: nearbyViewResult.stationVehicleGroups.length > 0 && legacyResult.stationVehicleGroups.length > 0,
      bothLoading: nearbyViewResult.isLoading && legacyResult.isLoading,
      bothHaveErrors: !!nearbyViewResult.error && !!legacyResult.error
    }
  };
};

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Get current integration configuration
 * 
 * @returns Current configuration object
 */
export const getIntegrationConfig = () => {
  return { ...NEARBY_VIEW_INTEGRATION_CONFIG };
};

/**
 * Check if nearby view integration is available
 * 
 * @param context - Optional context for feature flag evaluation
 * @returns True if integration is available
 */
export const isNearbyViewIntegrationAvailable = (context?: {
  isFavoritesMode?: boolean;
  stationCount?: number;
}): boolean => {
  return NEARBY_VIEW_INTEGRATION_CONFIG.enabled && 
         NEARBY_VIEW_INTEGRATION_CONFIG.enableForStationDisplay &&
         isNearbyViewFeatureEnabled(context);
};

/**
 * Get recommended integration options for StationDisplay
 * 
 * @param currentOptions - Current vehicle processing options
 * @returns Recommended integration options
 */
export const getRecommendedIntegrationOptions = (
  currentOptions: VehicleProcessingOptions = {}
): StationDisplayIntegrationOptions => {
  return {
    ...currentOptions,
    enableNearbyView: undefined, // Let feature flags decide
    stabilityMode: 'normal',
    enableStabilityTracking: true,
    requireActiveRoutes: true,
    enableDebugLogging: false,
    trackPerformance: NEARBY_VIEW_INTEGRATION_CONFIG.enablePerformanceTracking
  };
};