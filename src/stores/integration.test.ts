import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConfigStore, useBusStore, useFavoritesStore, useLocationStore } from './index';

// Mock localStorage for testing
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

// Mock btoa/atob for encryption
Object.defineProperty(window, 'btoa', {
  value: vi.fn((str: string) => Buffer.from(str).toString('base64')),
});

Object.defineProperty(window, 'atob', {
  value: vi.fn((str: string) => Buffer.from(str, 'base64').toString()),
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
});

describe('Store Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset all stores
    useConfigStore.getState().resetConfig();
    useFavoritesStore.setState({ favorites: { buses: [], stations: [] } });
    useBusStore.setState({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
    });
  });

  it('should export all stores correctly', () => {
    expect(useConfigStore).toBeDefined();
    expect(useBusStore).toBeDefined();
    expect(useFavoritesStore).toBeDefined();
    expect(useLocationStore).toBeDefined();
  });

  it('should allow stores to work together', () => {
    // Test configuration store
    const configStore = useConfigStore.getState();
    configStore.updateConfig({
      city: 'Cluj-Napoca',
      homeLocation: { latitude: 46.7712, longitude: 23.6236 },
      workLocation: { latitude: 46.7833, longitude: 23.6167 },
      apiKey: 'test-api-key',
      refreshRate: 30000,
    });

    expect(useConfigStore.getState().isConfigured).toBe(true);

    // Test favorites store
    const favoritesStore = useFavoritesStore.getState();
    favoritesStore.addFavoriteBus('24');
    favoritesStore.addFavoriteStation('station-1');

    expect(useFavoritesStore.getState().favorites.buses).toContain('24');
    expect(useFavoritesStore.getState().favorites.stations).toContain('station-1');

    // Test location store
    const locationStore = useLocationStore.getState();
    const distance = locationStore.calculateDistance(
      { latitude: 46.7712, longitude: 23.6236 },
      { latitude: 46.7833, longitude: 23.6167 }
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10); // Should be less than 10km for Cluj
  });
});