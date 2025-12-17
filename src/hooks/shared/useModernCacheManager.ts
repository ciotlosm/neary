/**
 * Modern Cache Manager
 * 
 * Replaces Enhanced Bus Store cache management with modern data hooks approach.
 * Provides centralized cache management for all data types.
 */

import { useCallback, useState } from 'react';
import { useStationData } from '../data/useStationData';
import { useVehicleData } from '../data/useVehicleData';
import { useRouteData } from '../data/useRouteData';
import { useStopTimesData } from '../data/useStopTimesData';
import { logger } from '../../utils/logger';

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  entriesByType: Record<string, number>;
  entriesWithTimestamps: Record<string, { createdAt: number; updatedAt: number; age: number }>;
  lastCacheUpdate: number;
  lastRefresh?: Date;
}

export interface ModernCacheManagerState {
  isClearing: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastOperation: Date | null;
}

export interface ModernCacheManagerActions {
  getCacheStats: () => CacheStats;
  clearCache: () => Promise<void>;
  refreshCache: () => Promise<void>;
  forceRefreshAll: () => Promise<void>;
}

export interface ModernCacheManagerResult extends ModernCacheManagerState, ModernCacheManagerActions {}

/**
 * Modern cache manager hook that replaces Enhanced Bus Store cache functionality
 */
export const useModernCacheManager = (): ModernCacheManagerResult => {
  const [state, setState] = useState<ModernCacheManagerState>({
    isClearing: false,
    isRefreshing: false,
    error: null,
    lastOperation: null
  });

  // Data hooks for cache operations
  const stationData = useStationData({ agencyId: undefined });
  const vehicleData = useVehicleData({ agencyId: undefined });
  const routeData = useRouteData({ agencyId: undefined });
  const stopTimesData = useStopTimesData({ agencyId: undefined });

  const getCacheStats = useCallback((): CacheStats => {
    const stats: CacheStats = {
      totalEntries: 0,
      totalSize: 0,
      entriesByType: {},
      entriesWithTimestamps: {},
      lastCacheUpdate: Date.now(),
      lastRefresh: new Date()
    };

    // Calculate localStorage cache stats
    if (typeof window !== 'undefined') {
      const appSettingsKeys = ['favorites', 'config', 'theme'];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !appSettingsKeys.includes(key)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const size = value.length;
              stats.totalSize += size;
              stats.totalEntries++;

              // Categorize by key pattern
              let category = 'other';
              if (key.includes('station') || key.includes('stop')) category = 'stations';
              else if (key.includes('vehicle')) category = 'vehicles';
              else if (key.includes('route')) category = 'routes';
              else if (key.includes('stop_time')) category = 'stopTimes';
              else if (key.includes('agency')) category = 'agencies';

              stats.entriesByType[category] = (stats.entriesByType[category] || 0) + 1;

              // Try to extract timestamp
              try {
                const parsed = JSON.parse(value);
                let updatedAt = Date.now();
                
                if (parsed.state?.lastUpdate) {
                  updatedAt = new Date(parsed.state.lastUpdate).getTime();
                } else if (parsed.state?.lastApiUpdate) {
                  updatedAt = new Date(parsed.state.lastApiUpdate).getTime();
                } else if (parsed.timestamp) {
                  updatedAt = parsed.timestamp;
                }

                stats.entriesWithTimestamps[key] = {
                  createdAt: updatedAt,
                  updatedAt: updatedAt,
                  age: Date.now() - updatedAt
                };
              } catch {
                // Not JSON or no timestamp
                stats.entriesWithTimestamps[key] = {
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  age: 0
                };
              }
            }
          } catch (error) {
            logger.warn('Failed to read cache entry', { key, error }, 'CACHE_MANAGER');
          }
        }
      }
    }

    return stats;
  }, []);

  const clearCache = useCallback(async () => {
    setState(prev => ({ ...prev, isClearing: true, error: null }));

    try {
      logger.info('Starting cache clear operation', {}, 'CACHE_MANAGER');

      // Clear localStorage cache (excluding app settings)
      if (typeof window !== 'undefined') {
        const appSettingsKeys = ['favorites', 'config', 'theme'];
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !appSettingsKeys.includes(key)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        logger.info('Cache cleared successfully', { 
          removedKeys: keysToRemove.length 
        }, 'CACHE_MANAGER');
      }

      // Note: Data hooks don't have clearCache methods
      // Cache clearing is handled by localStorage cleanup above

      setState(prev => ({ 
        ...prev, 
        isClearing: false, 
        lastOperation: new Date() 
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during cache clear';
      setState(prev => ({ 
        ...prev, 
        isClearing: false, 
        error: errorMessage 
      }));
      
      logger.error('Cache clear failed', { error }, 'CACHE_MANAGER');
      throw error;
    }
  }, [stationData, vehicleData, routeData, stopTimesData]);

  const refreshCache = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      logger.info('Starting cache refresh operation', {}, 'CACHE_MANAGER');

      // Refresh all data hooks
      await Promise.allSettled([
        stationData.refetch?.(),
        vehicleData.refetch?.(),
        routeData.refetch?.(),
        stopTimesData.refetch?.()
      ]);

      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        lastOperation: new Date() 
      }));

      logger.info('Cache refresh completed successfully', {}, 'CACHE_MANAGER');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during cache refresh';
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        error: errorMessage 
      }));
      
      logger.error('Cache refresh failed', { error }, 'CACHE_MANAGER');
      throw error;
    }
  }, [stationData, vehicleData, routeData, stopTimesData]);

  const forceRefreshAll = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      logger.info('Starting force refresh all operation', {}, 'CACHE_MANAGER');

      // Force refresh all data hooks
      await Promise.allSettled([
        stationData.refetch?.(),
        vehicleData.refetch?.(),
        routeData.refetch?.(),
        stopTimesData.refetch?.()
      ]);

      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        lastOperation: new Date() 
      }));

      logger.info('Force refresh all completed successfully', {}, 'CACHE_MANAGER');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during force refresh';
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        error: errorMessage 
      }));
      
      logger.error('Force refresh all failed', { error }, 'CACHE_MANAGER');
      throw error;
    }
  }, [stationData, vehicleData, routeData, stopTimesData]);

  return {
    // State
    ...state,
    
    // Actions
    getCacheStats,
    clearCache,
    refreshCache,
    forceRefreshAll
  };
};