/**
 * Modern Refresh System
 * 
 * Replaces legacy bus store refresh functionality with modern data hooks.
 * Provides centralized refresh control for all data types.
 */

import { useCallback, useEffect, useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { useStoreEvent, StoreEvents } from '../../stores/shared/storeEvents';
import { useStationData } from '../data/useStationData';
import { useVehicleData } from '../data/useVehicleData';
import { useRouteData } from '../data/useRouteData';
import { useStopTimesData } from '../data/useStopTimesData';
import { logger } from '../../utils/logger';

export interface ModernRefreshSystemState {
  isLoading: boolean;
  lastUpdate: Date | null;
  lastApiUpdate: Date | null;
  error: string | null;
  isAutoRefreshEnabled: boolean;
}

export interface ModernRefreshSystemActions {
  refreshAll: (forceRefresh?: boolean) => Promise<void>;
  refreshVehicles: (forceRefresh?: boolean) => Promise<void>;
  refreshStations: (forceRefresh?: boolean) => Promise<void>;
  refreshRoutes: (forceRefresh?: boolean) => Promise<void>;
  refreshStopTimes: (forceRefresh?: boolean) => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  toggleAutoRefresh: () => void;
}

export interface ModernRefreshSystemResult extends ModernRefreshSystemState, ModernRefreshSystemActions {
  // Data access (for components that need it)
  stations: any[];
  vehicles: any[];
  routes: any[];
  stopTimes: any[];
}

/**
 * Modern refresh system hook that replaces legacy bus store functionality
 */
export const useModernRefreshSystem = (): ModernRefreshSystemResult => {
  const { config: initialConfig } = useConfigStore();
  const [config, setConfig] = useState(initialConfig);
  const agencyId = config?.agencyId;
  
  // Subscribe to configuration changes via events
  useStoreEvent(
    StoreEvents.CONFIG_CHANGED,
    useCallback((data: any) => {
      setConfig(data.config);
    }, []),
    []
  );

  // State management
  const [state, setState] = useState<ModernRefreshSystemState>({
    isLoading: false,
    lastUpdate: null,
    lastApiUpdate: null,
    error: null,
    isAutoRefreshEnabled: false
  });

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(null);

  // Data hooks with refresh capabilities
  const stationDataResult = useStationData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 60000 // 1 minute
  });

  const vehicleDataResult = useVehicleData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 30000, // 30 seconds for live data
    autoRefresh: state.isAutoRefreshEnabled,
    refreshInterval: 30000
  });

  const routeDataResult = useRouteData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 60000 // 1 minute
  });

  const stopTimesDataResult = useStopTimesData({
    agencyId,
    forceRefresh: false,
    cacheMaxAge: 120000 // 2 minutes
  });

  // Aggregate loading state
  const isLoading = stationDataResult.isLoading || 
                   vehicleDataResult.isLoading || 
                   routeDataResult.isLoading || 
                   stopTimesDataResult.isLoading;

  // Update state when data changes
  useEffect(() => {
    const now = new Date();
    const hasData = stationDataResult.data || vehicleDataResult.data || 
                   routeDataResult.data || stopTimesDataResult.data;

    setState(prev => ({
      ...prev,
      isLoading,
      lastUpdate: hasData ? now : prev.lastUpdate,
      lastApiUpdate: hasData ? now : prev.lastApiUpdate,
      error: (stationDataResult.error || vehicleDataResult.error || 
             routeDataResult.error || stopTimesDataResult.error)?.message || null
    }));
  }, [
    isLoading,
    stationDataResult.data, stationDataResult.error,
    vehicleDataResult.data, vehicleDataResult.error,
    routeDataResult.data, routeDataResult.error,
    stopTimesDataResult.data, stopTimesDataResult.error
  ]);

  // Refresh functions
  const refreshStations = useCallback(async (forceRefresh = false) => {
    if (!agencyId) return;
    logger.debug('Refreshing stations data', { forceRefresh }, 'MODERN_REFRESH');
    await stationDataResult.refetch?.();
  }, [agencyId, stationDataResult.refetch]);

  const refreshVehicles = useCallback(async (forceRefresh = false) => {
    if (!agencyId) return;
    logger.debug('Refreshing vehicles data', { forceRefresh }, 'MODERN_REFRESH');
    await vehicleDataResult.refetch?.();
  }, [agencyId, vehicleDataResult.refetch]);

  const refreshRoutes = useCallback(async (forceRefresh = false) => {
    if (!agencyId) return;
    logger.debug('Refreshing routes data', { forceRefresh }, 'MODERN_REFRESH');
    await routeDataResult.refetch?.();
  }, [agencyId, routeDataResult.refetch]);

  const refreshStopTimes = useCallback(async (forceRefresh = false) => {
    if (!agencyId) return;
    logger.debug('Refreshing stop times data', { forceRefresh }, 'MODERN_REFRESH');
    await stopTimesDataResult.refetch?.();
  }, [agencyId, stopTimesDataResult.refetch]);

  const refreshAll = useCallback(async (forceRefresh = false) => {
    if (!agencyId) {
      logger.warn('Cannot refresh - no agency ID configured', {}, 'MODERN_REFRESH');
      return;
    }

    logger.info('Refreshing all data', { forceRefresh, agencyId }, 'MODERN_REFRESH');
    
    try {
      await Promise.all([
        refreshStations(forceRefresh),
        refreshVehicles(forceRefresh),
        refreshRoutes(forceRefresh),
        refreshStopTimes(forceRefresh)
      ]);
      
      logger.info('All data refreshed successfully', {}, 'MODERN_REFRESH');
    } catch (error) {
      logger.error('Failed to refresh all data', { error }, 'MODERN_REFRESH');
      throw error;
    }
  }, [agencyId, refreshStations, refreshVehicles, refreshRoutes, refreshStopTimes]);

  // Auto-refresh management
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    const interval = setInterval(() => {
      refreshVehicles(false); // Only refresh vehicles automatically (live data)
    }, 30000); // 30 seconds

    setAutoRefreshInterval(interval);
    setState(prev => ({ ...prev, isAutoRefreshEnabled: true }));
    
    logger.info('Auto-refresh started', { interval: 30000 }, 'MODERN_REFRESH');
  }, [autoRefreshInterval, refreshVehicles]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }

    setState(prev => ({ ...prev, isAutoRefreshEnabled: false }));
    logger.info('Auto-refresh stopped', {}, 'MODERN_REFRESH');
  }, [autoRefreshInterval]);

  const toggleAutoRefresh = useCallback(() => {
    if (state.isAutoRefreshEnabled) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  }, [state.isAutoRefreshEnabled, startAutoRefresh, stopAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  return {
    // State
    ...state,
    
    // Actions
    refreshAll,
    refreshVehicles,
    refreshStations,
    refreshRoutes,
    refreshStopTimes,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    
    // Data access
    stations: stationDataResult.data || [],
    vehicles: vehicleDataResult.data || [],
    routes: routeDataResult.data || [],
    stopTimes: stopTimesDataResult.data || []
  };
};