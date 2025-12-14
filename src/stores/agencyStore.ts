import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AgencyStore, ErrorState } from '../types';
import { tranzyApiService } from '../services/tranzyApiService';
import { logger } from '../utils/logger';

export const useAgencyStore = create<AgencyStore>()(
  persist(
    (set, get) => ({
      agencies: [],
      isLoading: false,
      error: null,
      isApiValidated: false,

      fetchAgencies: async () => {
        const { isLoading } = get();
        
        if (isLoading) {
          logger.warn('Agency fetch already in progress', undefined, 'STORE');
          return;
        }

        set({ isLoading: true, error: null });
        logger.info('Starting agency fetch', undefined, 'STORE');

        try {
          const service = tranzyApiService();
          const agencies = await service.getAgencies();
          
          logger.info('Setting agencies in store', { 
            agencyCount: agencies.length,
            agencies: agencies,
            rawAgencies: agencies.map(a => ({ id: a.id, name: a.name }))
          }, 'STORE');
          
          set({
            agencies,
            isLoading: false,
            error: null,
            isApiValidated: true,
          });
          
          // Verify the state was set correctly
          const newState = get();
          logger.info('Agency fetch completed successfully', { 
            agencyCount: newState.agencies.length,
            storedAgencies: newState.agencies.map(a => ({ id: a.id, name: a.name })),
            fullStoredAgencies: newState.agencies
          }, 'STORE');
        } catch (error) {
          const errorState: ErrorState = error && typeof error === 'object' && 'type' in error
            ? error as ErrorState
            : {
                type: 'network',
                message: error instanceof Error ? error.message : 'Failed to fetch agencies',
                timestamp: new Date(),
                retryable: true,
              };

          set({
            isLoading: false,
            error: errorState,
            isApiValidated: false,
          });
          
          logger.error('Agency fetch failed', { 
            error: errorState.message,
            type: errorState.type 
          }, 'STORE');
        }
      },

      validateAndFetchAgencies: async (apiKey: string): Promise<boolean> => {
        logger.info('Validating API key and fetching agencies', { keyLength: apiKey.length }, 'STORE');
        
        set({ isLoading: true, error: null, isApiValidated: false });

        try {
          const service = tranzyApiService();
          
          // Set the API key first
          service.setApiKey(apiKey);
          
          // Validate the API key by trying to fetch agencies
          const isValid = await service.validateApiKey(apiKey);
          
          if (!isValid) {
            set({
              isLoading: false,
              error: {
                type: 'authentication',
                message: 'Invalid API key. Please check your key and try again.',
                timestamp: new Date(),
                retryable: true,
              },
              isApiValidated: false,
            });
            return false;
          }

          // If validation successful, fetch and cache agencies
          const agencies = await service.getAgencies();
          
          set({
            agencies,
            isLoading: false,
            error: null,
            isApiValidated: true,
          });
          
          logger.info('API validation and agency fetch successful - agencies cached', { 
            agencyCount: agencies.length,
            agencies: agencies.map(a => ({ id: a.id, name: a.name }))
          }, 'STORE');
          
          return true;
        } catch (error) {
          const errorState: ErrorState = error && typeof error === 'object' && 'type' in error
            ? error as ErrorState
            : {
                type: 'authentication',
                message: 'Failed to validate API key or fetch agencies',
                timestamp: new Date(),
                retryable: true,
              };

          set({
            isLoading: false,
            error: errorState,
            isApiValidated: false,
          });
          
          logger.error('API validation failed', { 
            error: errorState.message,
            type: errorState.type 
          }, 'STORE');
          
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
        logger.debug('Agency store error cleared', undefined, 'STORE');
      },

      resetStore: () => {
        set({
          agencies: [],
          isLoading: false,
          error: null,
          isApiValidated: false,
        });
        logger.info('Agency store reset', undefined, 'STORE');
      },

      // Method to check and fix corrupted data
      checkAndFixCorruptedData: () => {
        const { agencies } = get();
        
        if (agencies && Array.isArray(agencies)) {
          const hasCorruptedData = agencies.some(agency => 
            !agency || typeof agency !== 'object' || !agency.id || !agency.name
          );
          
          if (hasCorruptedData) {
            logger.warn('Detected corrupted agency data, clearing store', { 
              agencies,
              corruptedCount: agencies.filter(a => !a || !a.id || !a.name).length
            }, 'STORE');
            
            set({
              agencies: [],
              isApiValidated: false,
            });
            
            return true; // Indicates data was corrupted and cleared
          }
        }
        
        return false; // No corruption detected
      },
    }),
    {
      name: 'bus-tracker-agencies',
      storage: createJSONStorage(() => localStorage),
      // Only persist agencies and validation status, not loading/error states
      partialize: (state) => {
        const persistedData = {
          agencies: state.agencies,
          isApiValidated: state.isApiValidated,
        };
        
        logger.debug('Persisting agency store state', { 
          agencies: state.agencies,
          agencyCount: state.agencies.length,
          isApiValidated: state.isApiValidated,
          persistedData
        }, 'STORE');
        
        return persistedData;
      },
      // Add version to handle schema changes
      version: 1,
      // Add migration function to handle version changes
      migrate: (persistedState: any, version: number) => {
        logger.info('Migrating agency store', { version, persistedState }, 'STORE');
        
        if (version === 0) {
          // If we have old data with empty objects, clear it
          if (persistedState?.agencies && Array.isArray(persistedState.agencies)) {
            const hasEmptyObjects = persistedState.agencies.some((agency: any) => 
              !agency || typeof agency !== 'object' || !agency.id || !agency.name
            );
            
            if (hasEmptyObjects) {
              logger.warn('Found corrupted agency data, clearing store', { 
                agencies: persistedState.agencies 
              }, 'STORE');
              return {
                agencies: [],
                isApiValidated: false,
              };
            }
          }
        }
        
        return persistedState;
      },
    }
  )
);