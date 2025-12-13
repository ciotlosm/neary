import { create } from 'zustand';
import { getServiceWorkerService, type ServiceWorkerStatus, type CacheInfo } from '../services/serviceWorkerService';

export interface OfflineStore {
  // Connection state
  isOnline: boolean;
  isOfflineCapable: boolean;
  
  // Service worker state
  serviceWorkerStatus: ServiceWorkerStatus;
  
  // Cache information
  cacheInfo: CacheInfo | null;
  lastCacheUpdate: Date | null;
  
  // Cached data timestamps
  lastApiDataUpdate: Date | null;
  isUsingCachedData: boolean;
  
  // Actions
  updateConnectionStatus: (isOnline: boolean) => void;
  updateServiceWorkerStatus: (status: ServiceWorkerStatus) => void;
  refreshCacheInfo: () => Promise<void>;
  clearCache: (cacheType?: 'api' | 'static') => Promise<void>;
  setUsingCachedData: (isUsing: boolean, timestamp?: Date) => void;
  
  // Initialization
  initialize: () => void;
  cleanup: () => void;
}

// Cleanup functions for event listeners
let connectionCleanup: (() => void) | null = null;
let serviceWorkerCleanup: (() => void) | null = null;

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  // Initial state
  isOnline: navigator.onLine,
  isOfflineCapable: false,
  serviceWorkerStatus: {
    isSupported: false,
    isRegistered: false,
    isActive: false,
    registration: null,
  },
  cacheInfo: null,
  lastCacheUpdate: null,
  lastApiDataUpdate: null,
  isUsingCachedData: false,

  // Actions
  updateConnectionStatus: (isOnline: boolean) => {
    set({ isOnline });
    console.log(`Connection status changed: ${isOnline ? 'online' : 'offline'}`);
  },

  updateServiceWorkerStatus: (status: ServiceWorkerStatus) => {
    set({ 
      serviceWorkerStatus: status,
      isOfflineCapable: status.isActive,
    });
    console.log('Service Worker status updated:', status);
  },

  refreshCacheInfo: async () => {
    try {
      const swService = getServiceWorkerService();
      const cacheInfo = await swService.getCacheInfo();
      set({ 
        cacheInfo,
        lastCacheUpdate: new Date(),
      });
    } catch (error) {
      console.error('Failed to refresh cache info:', error);
    }
  },

  clearCache: async (cacheType?: 'api' | 'static') => {
    try {
      const swService = getServiceWorkerService();
      await swService.clearCache(cacheType);
      
      // Refresh cache info after clearing
      await get().refreshCacheInfo();
      
      // If API cache was cleared, reset cached data state
      if (cacheType === 'api' || !cacheType) {
        set({ 
          isUsingCachedData: false,
          lastApiDataUpdate: null,
        });
      }
      
      console.log(`Cache cleared: ${cacheType || 'all'}`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  },

  setUsingCachedData: (isUsing: boolean, timestamp?: Date) => {
    set({ 
      isUsingCachedData: isUsing,
      lastApiDataUpdate: timestamp || (isUsing ? new Date() : null),
    });
  },

  initialize: () => {
    const swService = getServiceWorkerService();
    
    // Set initial service worker status
    const initialStatus = swService.getStatus();
    get().updateServiceWorkerStatus(initialStatus);
    
    // Listen for service worker status changes
    serviceWorkerCleanup = swService.onStatusChange((status) => {
      get().updateServiceWorkerStatus(status);
    });
    
    // Listen for connection changes
    connectionCleanup = swService.onConnectionChange((isOnline) => {
      get().updateConnectionStatus(isOnline);
    });
    
    // Initial cache info refresh (if service worker is active)
    if (initialStatus.isActive) {
      get().refreshCacheInfo().catch(console.error);
    }
    
    console.log('Offline store initialized');
  },

  cleanup: () => {
    if (connectionCleanup) {
      connectionCleanup();
      connectionCleanup = null;
    }
    
    if (serviceWorkerCleanup) {
      serviceWorkerCleanup();
      serviceWorkerCleanup = null;
    }
    
    console.log('Offline store cleaned up');
  },
}));