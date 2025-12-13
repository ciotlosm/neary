import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ErrorState } from '../types';
import { routePlanningService, type RoutePlanResult, type RouteOption } from '../services/routePlanningService';
import { useConfigStore } from './configStore';
import { useLocationStore } from './locationStore';
import { logger } from '../utils/logger';

export interface IntelligentBusStore {
  // Data
  routePlan: RoutePlanResult | null;
  recommendedRoutes: RouteOption[];
  lastUpdate: Date | null;
  isLoading: boolean;
  error: ErrorState | null;
  
  // Current context
  currentDestination: 'work' | 'home' | null;
  
  // Actions
  planRoute: () => Promise<void>;
  refreshRoutes: () => Promise<void>;
  clearError: () => void;
  
  // Auto-refresh system
  isAutoRefreshEnabled: boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  manualRefresh: () => Promise<void>;
}

// Global refresh interval
let autoRefreshInterval: number | null = null;

export const useIntelligentBusStore = create<IntelligentBusStore>()(
  persist(
    (set, get) => ({
      // Initial state
      routePlan: null,
      recommendedRoutes: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      currentDestination: null,
      isAutoRefreshEnabled: false,

      // Plan route based on current location and config
      planRoute: async () => {
        const { config } = useConfigStore.getState();
        const { currentLocation, requestLocation } = useLocationStore.getState();
        
        if (!config?.homeLocation || !config?.workLocation) {
          set({
            error: {
              type: 'noData',
              message: 'Home and work locations must be configured',
              timestamp: new Date(),
              retryable: false
            }
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
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

          logger.info('Planning intelligent route', {
            currentLocation: location,
            homeLocation: config.homeLocation,
            workLocation: config.workLocation
          });

          // Plan the route
          const routePlan = await routePlanningService.planRoute(
            location,
            config.homeLocation,
            config.workLocation,
            config.city
          );

          set({
            routePlan,
            recommendedRoutes: routePlan.recommendedOptions,
            currentDestination: routePlan.destination,
            lastUpdate: new Date(),
            isLoading: false,
            error: null
          });

          logger.info('Route planning completed', {
            destination: routePlan.destination,
            directRoutes: routePlan.directRoutes.length,
            connectionRoutes: routePlan.connectionRoutes.length,
            recommendedOptions: routePlan.recommendedOptions.length
          });

        } catch (error) {
          logger.error('Route planning failed', error);
          set({
            isLoading: false,
            error: {
              type: 'network',
              message: error instanceof Error ? error.message : 'Failed to plan route',
              timestamp: new Date(),
              retryable: true
            }
          });
        }
      },

      // Refresh routes (alias for planRoute)
      refreshRoutes: async () => {
        await get().planRoute();
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Manual refresh
      manualRefresh: async () => {
        logger.info('Manual refresh triggered for intelligent routing');
        await get().planRoute();
      },

      // Start auto-refresh
      startAutoRefresh: () => {
        const state = get();
        if (state.isAutoRefreshEnabled) return;

        logger.info('Starting auto-refresh for intelligent routing');
        
        // Initial refresh
        state.planRoute();
        
        // Set up interval (refresh every 2 minutes for route planning)
        autoRefreshInterval = window.setInterval(() => {
          const currentState = get();
          if (currentState.isAutoRefreshEnabled) {
            logger.debug('Auto-refreshing intelligent routes');
            currentState.planRoute();
          }
        }, 2 * 60 * 1000); // 2 minutes

        set({ isAutoRefreshEnabled: true });
      },

      // Stop auto-refresh
      stopAutoRefresh: () => {
        logger.info('Stopping auto-refresh for intelligent routing');
        
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
        }
        
        set({ isAutoRefreshEnabled: false });
      }
    }),
    {
      name: 'intelligent-bus-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        lastUpdate: state.lastUpdate,
        currentDestination: state.currentDestination,
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