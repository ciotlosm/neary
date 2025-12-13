import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOfflineStore } from './offlineStore';

// Mock service instance
const mockService = {
  getStatus: vi.fn(),
  onStatusChange: vi.fn(),
  onConnectionChange: vi.fn(),
  getCacheInfo: vi.fn(),
  clearCache: vi.fn(),
};

// Mock the service worker service
vi.mock('../services/serviceWorkerService', () => ({
  getServiceWorkerService: () => mockService,
}));

// Mock navigator
const mockNavigator = {
  onLine: true,
};

describe('OfflineStore', () => {
  let store: ReturnType<typeof useOfflineStore>;

  beforeEach(() => {
    // Reset store state
    useOfflineStore.setState({
      isOnline: true,
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
    });

    store = useOfflineStore.getState();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock navigator
    (globalThis as any).navigator = mockNavigator;
  });

  afterEach(() => {
    // Cleanup any listeners
    store.cleanup();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.isOnline).toBe(true);
      expect(store.isOfflineCapable).toBe(false);
      expect(store.serviceWorkerStatus.isSupported).toBe(false);
      expect(store.cacheInfo).toBeNull();
      expect(store.isUsingCachedData).toBe(false);
    });
  });

  describe('Connection Status Updates', () => {
    it('should update connection status', () => {
      store.updateConnectionStatus(false);
      
      const state = useOfflineStore.getState();
      expect(state.isOnline).toBe(false);
    });

    it('should update connection status to online', () => {
      store.updateConnectionStatus(true);
      
      const state = useOfflineStore.getState();
      expect(state.isOnline).toBe(true);
    });
  });

  describe('Service Worker Status Updates', () => {
    it('should update service worker status', () => {
      const newStatus = {
        isSupported: true,
        isRegistered: true,
        isActive: true,
        registration: {} as ServiceWorkerRegistration,
      };

      store.updateServiceWorkerStatus(newStatus);
      
      const state = useOfflineStore.getState();
      expect(state.serviceWorkerStatus).toEqual(newStatus);
      expect(state.isOfflineCapable).toBe(true);
    });

    it('should set offline capability based on service worker active state', () => {
      const inactiveStatus = {
        isSupported: true,
        isRegistered: true,
        isActive: false,
        registration: null,
      };

      store.updateServiceWorkerStatus(inactiveStatus);
      
      const state = useOfflineStore.getState();
      expect(state.isOfflineCapable).toBe(false);
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      mockService.getCacheInfo.mockResolvedValue({
        'bus-tracker-api-v1': { size: 5, urls: ['url1', 'url2'] },
        'bus-tracker-v1': { size: 10, urls: ['url3', 'url4'] },
      });
      mockService.clearCache.mockResolvedValue(undefined);
    });

    it('should refresh cache info successfully', async () => {
      await store.refreshCacheInfo();
      
      const state = useOfflineStore.getState();
      expect(state.cacheInfo).toEqual({
        'bus-tracker-api-v1': { size: 5, urls: ['url1', 'url2'] },
        'bus-tracker-v1': { size: 10, urls: ['url3', 'url4'] },
      });
      expect(state.lastCacheUpdate).toBeInstanceOf(Date);
      expect(mockService.getCacheInfo).toHaveBeenCalled();
    });

    it('should handle cache info refresh failure', async () => {
      const error = new Error('Cache info failed');
      mockService.getCacheInfo.mockRejectedValue(error);
      
      // Should not throw, but log error
      await expect(store.refreshCacheInfo()).resolves.toBeUndefined();
      
      const state = useOfflineStore.getState();
      expect(state.cacheInfo).toBeNull();
    });

    it('should clear cache successfully', async () => {
      // Set up initial cache info
      await store.refreshCacheInfo();
      
      await store.clearCache('api');
      
      expect(mockService.clearCache).toHaveBeenCalledWith('api');
      expect(mockService.getCacheInfo).toHaveBeenCalledTimes(2); // Initial + after clear
    });

    it('should reset cached data state when clearing API cache', async () => {
      // Set up cached data state
      store.setUsingCachedData(true, new Date());
      
      await store.clearCache('api');
      
      const state = useOfflineStore.getState();
      expect(state.isUsingCachedData).toBe(false);
      expect(state.lastApiDataUpdate).toBeNull();
    });

    it('should not reset cached data state when clearing static cache', async () => {
      // Set up cached data state
      const testDate = new Date();
      store.setUsingCachedData(true, testDate);
      
      await store.clearCache('static');
      
      const state = useOfflineStore.getState();
      expect(state.isUsingCachedData).toBe(true);
      expect(state.lastApiDataUpdate).toEqual(testDate);
    });

    it('should handle cache clear failure', async () => {
      const error = new Error('Clear cache failed');
      mockService.clearCache.mockRejectedValue(error);
      
      await expect(store.clearCache()).rejects.toThrow('Clear cache failed');
    });
  });

  describe('Cached Data Management', () => {
    it('should set using cached data with timestamp', () => {
      const testDate = new Date();
      store.setUsingCachedData(true, testDate);
      
      const state = useOfflineStore.getState();
      expect(state.isUsingCachedData).toBe(true);
      expect(state.lastApiDataUpdate).toEqual(testDate);
    });

    it('should set using cached data without timestamp', () => {
      store.setUsingCachedData(true);
      
      const state = useOfflineStore.getState();
      expect(state.isUsingCachedData).toBe(true);
      expect(state.lastApiDataUpdate).toBeInstanceOf(Date);
    });

    it('should clear cached data state', () => {
      // First set cached data
      store.setUsingCachedData(true, new Date());
      
      // Then clear it
      store.setUsingCachedData(false);
      
      const state = useOfflineStore.getState();
      expect(state.isUsingCachedData).toBe(false);
      expect(state.lastApiDataUpdate).toBeNull();
    });
  });

  describe('Initialization and Cleanup', () => {
    it('should initialize with service worker listeners', () => {
      const mockStatusCallback = vi.fn();
      const mockConnectionCallback = vi.fn();
      
      mockService.onStatusChange.mockReturnValue(mockStatusCallback);
      mockService.onConnectionChange.mockReturnValue(mockConnectionCallback);
      mockService.getStatus.mockReturnValue({
        isSupported: true,
        isRegistered: true,
        isActive: false,
        registration: null,
      });

      store.initialize();
      
      expect(mockService.getStatus).toHaveBeenCalled();
      expect(mockService.onStatusChange).toHaveBeenCalled();
      expect(mockService.onConnectionChange).toHaveBeenCalled();
    });

    it('should refresh cache info on initialization when service worker is active', async () => {
      mockService.getStatus.mockReturnValue({
        isSupported: true,
        isRegistered: true,
        isActive: true,
        registration: {} as ServiceWorkerRegistration,
      });
      mockService.getCacheInfo.mockResolvedValue({});

      store.initialize();
      
      // Wait for async cache refresh
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockService.getCacheInfo).toHaveBeenCalled();
    });

    it('should cleanup listeners', () => {
      const mockStatusCleanup = vi.fn();
      const mockConnectionCleanup = vi.fn();
      
      mockService.onStatusChange.mockReturnValue(mockStatusCleanup);
      mockService.onConnectionChange.mockReturnValue(mockConnectionCleanup);
      mockService.getStatus.mockReturnValue({
        isSupported: false,
        isRegistered: false,
        isActive: false,
        registration: null,
      });

      store.initialize();
      store.cleanup();
      
      expect(mockStatusCleanup).toHaveBeenCalled();
      expect(mockConnectionCleanup).toHaveBeenCalled();
    });
  });
});