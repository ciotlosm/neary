import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ErrorState } from '../types';
import { favoriteBusService, type FavoriteBusResult } from '../services/favoriteBusService';
import { enhancedTranzyApi } from '../services/enhancedTranzyApi';
import { useConfigStore } from './configStore';
import { useLocationStore } from './locationStore';
import { logger } from '../utils/logger';

export interface FavoriteBusStore {
  // Data
  favoriteBusResult: FavoriteBusResult | null;
  availableRoutes: { 
    shortName: string; // PRIMARY: What users see and interact with
    name: string; 
    longName: string; 
    description?: string; 
    type: 'bus' | 'trolleybus' | 'tram' | 'metro' | 'rail' | 'ferry' | 'other';
  }[];
  lastUpdate: Date | null;
  isLoading: boolean;
  error: ErrorState | null;
  
  // Actions
  refreshFavorites: () => Promise<void>;
  loadAvailableRoutes: () => Promise<void>;
  clearError: () => void;
  
  // Auto-refresh system
  isAutoRefreshEnabled: boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  manualRefresh: () => Promise<void>;
}

// Global refresh interval
let autoRefreshInterval: number | null = null;

export const useFavoriteBusStore = create<FavoriteBusStore>()(
  persist(
    (set, get) => ({
      // Initial state
      favoriteBusResult: null,
      availableRoutes: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      isAutoRefreshEnabled: false,

      // Refresh favorite buses
      refreshFavorites: async () => {
        const { config } = useConfigStore.getState();
        const { currentLocation, requestLocation } = useLocationStore.getState();
        
        if (!config?.homeLocation || !config?.favoriteBuses || config.favoriteBuses.length === 0) {
          set({
            favoriteBusResult: null,
            error: null
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Set API key in enhanced API service
          enhancedTranzyApi.setApiKey(config.apiKey);

          // Get current location if not available
          let location = currentLocation;
          if (!location) {
            try {
              location = await requestLocation();
            } catch (locationError) {
              logger.warn('Could not get current location, using home as fallback');
              location = config.homeLocation;
            }
          }

          logger.info('Refreshing favorite buses', {
            favoriteRoutes: config.favoriteBuses,
            currentLocation: location,
            homeLocation: config.homeLocation
          });

          // Get favorite bus info (simplified - just live vehicles)
          const result = await favoriteBusService.getFavoriteBusInfo(
            config.favoriteBuses,
            config.city
          );

          set({
            favoriteBusResult: result,
            lastUpdate: new Date(),
            isLoading: false,
            error: null
          });

          logger.info('Favorite buses refreshed', {
            count: result.favoriteBuses.length
          });

        } catch (error) {
          logger.error('Failed to refresh favorite buses', error);
          set({
            isLoading: false,
            error: {
              type: 'network',
              message: error instanceof Error ? error.message : 'Failed to refresh favorite buses',
              timestamp: new Date(),
              retryable: true
            }
          });
        }
      },

      // Load available routes - removed (simplified functionality)
      loadAvailableRoutes: async () => {
        logger.info('Available routes loading disabled in simplified mode');
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Manual refresh
      manualRefresh: async () => {
        logger.info('Manual refresh triggered for favorite buses');
        await get().refreshFavorites();
      },

      // Start auto-refresh
      startAutoRefresh: () => {
        const state = get();
        if (state.isAutoRefreshEnabled) return;

        logger.info('Starting auto-refresh for favorite buses');
        
        // Initial refresh
        state.refreshFavorites();
        
        // Set up interval (refresh every 1 minute for favorites)
        autoRefreshInterval = window.setInterval(() => {
          const currentState = get();
          if (currentState.isAutoRefreshEnabled) {
            logger.debug('Auto-refreshing favorite buses');
            currentState.refreshFavorites();
          }
        }, 60 * 1000); // 1 minute

        set({ isAutoRefreshEnabled: true });
      },

      // Stop auto-refresh
      stopAutoRefresh: () => {
        logger.info('Stopping auto-refresh for favorite buses');
        
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
        }
        
        set({ isAutoRefreshEnabled: false });
      }
    }),
    {
      name: 'favorite-bus-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        availableRoutes: state.availableRoutes,
        lastUpdate: state.lastUpdate,
        isAutoRefreshEnabled: state.isAutoRefreshEnabled
      })
    }
  )
);

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  });
}