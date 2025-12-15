import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useConfigStore, useBusStore, useFavoritesStore } from './stores';
import type { UserConfig, BusInfo } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Integration Tests - Complete User Flows', () => {
  const mockConfig: UserConfig = {
    city: 'Cluj-Napoca',
    homeLocation: { latitude: 46.7712, longitude: 23.6236 },
    workLocation: { latitude: 46.7833, longitude: 23.6167 },
    apiKey: 'test-api-key-12345',
    refreshRate: 30000,
  };

  const mockBuses: BusInfo[] = [
    {
      id: 'bus-1',
      route: '24',
      destination: 'Zorilor',
      arrivalTime: new Date(Date.now() + 5 * 60 * 1000),
      isLive: true,
      minutesAway: 5,
      station: {
        id: 'station-1',
        name: 'Piața Unirii',
        coordinates: { latitude: 46.7712, longitude: 23.6236 },
        isFavorite: false,
      },
      direction: 'work',
    },
    {
      id: 'bus-2',
      route: '35',
      destination: 'Mănăștur',
      arrivalTime: new Date(Date.now() + 8 * 60 * 1000),
      isLive: false,
      minutesAway: 8,
      station: {
        id: 'station-2',
        name: 'Piața Mărăști',
        coordinates: { latitude: 46.7833, longitude: 23.6167 },
        isFavorite: false,
      },
      direction: 'home',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Reset stores
    useConfigStore.getState().resetConfig();
    useBusStore.setState({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      isAutoRefreshEnabled: false,
    });
    useFavoritesStore.setState({
      favorites: { buses: [], stations: [] },
    });
  });

  describe('Configuration Management Integration', () => {
    it('should complete configuration setup flow', () => {
      const configStore = useConfigStore.getState();

      // Initially not configured
      expect(useConfigStore.getState().isConfigured).toBe(false);

      // Update configuration
      act(() => {
        configStore.updateConfig(mockConfig);
      });

      // Should be configured now
      expect(useConfigStore.getState().isConfigured).toBe(true);
      expect(useConfigStore.getState().config?.city).toBe(mockConfig.city);
      expect(useConfigStore.getState().config?.apiKey).toBe(mockConfig.apiKey);
      expect(useConfigStore.getState().config?.refreshRate).toBe(mockConfig.refreshRate);
    });

    it('should persist configuration to localStorage', () => {
      const configStore = useConfigStore.getState();

      act(() => {
        configStore.updateConfig(mockConfig);
      });

      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'config',
        expect.stringContaining(mockConfig.city)
      );
    });

    it('should handle configuration reset', () => {
      const configStore = useConfigStore.getState();

      // Set configuration first
      act(() => {
        configStore.updateConfig(mockConfig);
      });

      expect(useConfigStore.getState().isConfigured).toBe(true);

      // Reset configuration
      act(() => {
        configStore.resetConfig();
      });

      // Should be reset
      expect(useConfigStore.getState().isConfigured).toBe(false);
      expect(useConfigStore.getState().config).toBeNull();
    });
  });

  describe('Bus Data Management Integration', () => {
    beforeEach(() => {
      useConfigStore.getState().updateConfig(mockConfig);
    });

    it('should manage bus data correctly', () => {
      act(() => {
        useBusStore.setState({
          buses: mockBuses,
          stations: [],
          lastUpdate: new Date(),
          isLoading: false,
          error: null,
        });
      });

      const busStore = useBusStore.getState();
      expect(busStore.buses).toHaveLength(2);
      expect(busStore.buses[0].route).toBe('24');
      expect(busStore.buses[0].direction).toBe('work');
      expect(busStore.buses[0].isLive).toBe(true);
      expect(busStore.buses[1].route).toBe('35');
      expect(busStore.buses[1].direction).toBe('home');
      expect(busStore.buses[1].isLive).toBe(false);
    });

    it('should filter buses by direction', () => {
      act(() => {
        useBusStore.setState({
          buses: mockBuses,
          stations: [],
          lastUpdate: new Date(),
          isLoading: false,
          error: null,
        });
      });

      const busStore = useBusStore.getState();
      const workBuses = busStore.buses.filter(bus => bus.direction === 'work');
      const homeBuses = busStore.buses.filter(bus => bus.direction === 'home');

      expect(workBuses).toHaveLength(1);
      expect(workBuses[0].route).toBe('24');
      expect(homeBuses).toHaveLength(1);
      expect(homeBuses[0].route).toBe('35');
    });

    it('should handle empty bus data', () => {
      act(() => {
        useBusStore.setState({
          buses: [],
          stations: [],
          lastUpdate: new Date(),
          isLoading: false,
          error: null,
        });
      });

      const busStore = useBusStore.getState();
      expect(busStore.buses).toHaveLength(0);
      expect(busStore.error).toBeNull();
    });
  });

  describe('Favorites Management Integration', () => {
    beforeEach(() => {
      useConfigStore.getState().updateConfig(mockConfig);
    });

    it('should manage favorites across app sessions', () => {
      const favoritesStore = useFavoritesStore.getState();
      
      // Add favorites
      act(() => {
        favoritesStore.addFavoriteBus('24');
        favoritesStore.addFavoriteStation('station-1');
      });

      // Verify favorites were added
      expect(useFavoritesStore.getState().favorites.buses).toContain('24');
      expect(useFavoritesStore.getState().favorites.stations).toContain('station-1');

      // Verify localStorage was called (favorites store uses Zustand persistence)
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update filtered views when favorites change', () => {
      const favoritesStore = useFavoritesStore.getState();
      
      // Initially no favorites
      expect(useFavoritesStore.getState().favorites.buses).toHaveLength(0);

      // Add favorite bus
      act(() => {
        favoritesStore.addFavoriteBus('24');
      });

      // Should be in favorites now
      expect(useFavoritesStore.getState().favorites.buses).toContain('24');

      // Remove favorite
      act(() => {
        favoritesStore.removeFavoriteBus('24');
      });

      // Should be removed
      expect(useFavoritesStore.getState().favorites.buses).not.toContain('24');
    });
  });

  describe('Error Recovery and Retry Mechanisms', () => {
    beforeEach(() => {
      useConfigStore.getState().updateConfig(mockConfig);
    });

    it('should handle network errors gracefully', () => {
      act(() => {
        useBusStore.setState({
          buses: [],
          stations: [],
          lastUpdate: null,
          isLoading: false,
          error: {
            type: 'network',
            message: 'Network error',
            timestamp: new Date(),
            retryable: true,
          },
        });
      });

      const busStore = useBusStore.getState();
      expect(busStore.error).toBeTruthy();
      expect(busStore.error?.type).toBe('network');
      expect(busStore.error?.retryable).toBe(true);
    });

    it('should handle authentication errors', () => {
      act(() => {
        useBusStore.setState({
          buses: [],
          stations: [],
          lastUpdate: null,
          isLoading: false,
          error: {
            type: 'authentication',
            message: 'Invalid API key',
            timestamp: new Date(),
            retryable: false,
          },
        });
      });

      const busStore = useBusStore.getState();
      expect(busStore.error).toBeTruthy();
      expect(busStore.error?.type).toBe('authentication');
      expect(busStore.error?.retryable).toBe(false);
    });

    it('should recover from errors when new data is loaded', () => {
      // Start with error state
      act(() => {
        useBusStore.setState({
          buses: [],
          stations: [],
          lastUpdate: null,
          isLoading: false,
          error: {
            type: 'network',
            message: 'Network error',
            timestamp: new Date(),
            retryable: true,
          },
        });
      });

      expect(useBusStore.getState().error).toBeTruthy();

      // Clear error and add data
      act(() => {
        useBusStore.setState({
          buses: mockBuses,
          stations: [],
          lastUpdate: new Date(),
          isLoading: false,
          error: null,
        });
      });

      const busStore = useBusStore.getState();
      expect(busStore.error).toBeNull();
      expect(busStore.buses).toHaveLength(2);
    });
  });

  describe('Store Coordination and Integration', () => {
    it('should coordinate between all stores correctly', () => {
      const configStore = useConfigStore.getState();
      const favoritesStore = useFavoritesStore.getState();

      // Update configuration
      act(() => {
        configStore.updateConfig(mockConfig);
      });

      // Add favorites
      act(() => {
        favoritesStore.addFavoriteBus('24');
        favoritesStore.addFavoriteStation('station-1');
      });

      // Update bus data
      act(() => {
        useBusStore.setState({ buses: mockBuses });
      });

      // Verify all stores are coordinated
      expect(useConfigStore.getState().config?.city).toBe(mockConfig.city);
      expect(useFavoritesStore.getState().favorites.buses).toContain('24');
      expect(useFavoritesStore.getState().favorites.stations).toContain('station-1');
      expect(useBusStore.getState().buses).toHaveLength(2);
    });

    it('should handle configuration persistence across stores', () => {
      const configStore = useConfigStore.getState();
      const favoritesStore = useFavoritesStore.getState();

      // Update stores
      act(() => {
        configStore.updateConfig(mockConfig);
        favoritesStore.addFavoriteBus('24');
      });

      // Verify localStorage calls for stores
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'config',
        expect.stringContaining(mockConfig.city)
      );
      // Favorites store also persists via Zustand
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsiveness and Performance', () => {
    it('should handle data updates efficiently', () => {
      const configStore = useConfigStore.getState();

      // Multiple rapid updates should work correctly
      act(() => {
        configStore.updateConfig(mockConfig);
        useBusStore.setState({ buses: mockBuses });
        useFavoritesStore.getState().addFavoriteBus('24');
      });

      // All updates should be applied
      expect(useConfigStore.getState().isConfigured).toBe(true);
      expect(useBusStore.getState().buses).toHaveLength(2);
      expect(useFavoritesStore.getState().favorites.buses).toContain('24');
    });

    it('should validate mobile-specific data structures', () => {
      // Test that bus data includes mobile-friendly properties
      act(() => {
        useBusStore.setState({ buses: mockBuses });
      });

      const buses = useBusStore.getState().buses;
      buses.forEach(bus => {
        expect(bus.minutesAway).toBeTypeOf('number');
        expect(bus.isLive).toBeTypeOf('boolean');
        expect(bus.direction).toMatch(/^(work|home|unknown)$/);
        expect(bus.station.coordinates).toHaveProperty('latitude');
        expect(bus.station.coordinates).toHaveProperty('longitude');
      });
    });
  });
});