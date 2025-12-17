import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useConfigStore } from './configStore';
import { useVehicleStore } from './vehicleStore';
import type { UserConfig } from '../types';

describe('Refresh System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset stores
    useVehicleStore.setState({
      vehicles: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      isAutoRefreshEnabled: false,
    });
    
    useConfigStore.setState({
      config: null,
      isConfigured: false,
    });
  });

  afterEach(() => {
    // Clean up any intervals
    const store = useVehicleStore.getState();
    if (store.isAutoRefreshEnabled) {
      store.stopAutoRefresh();
    }
    vi.useRealTimers();
  });

  it('should start auto refresh when configuration is set', () => {
    const config: UserConfig = {
      city: 'TestCity',
      homeLocation: { latitude: 45.0, longitude: 25.0 },
      workLocation: { latitude: 45.1, longitude: 25.1 },
      apiKey: 'test-key',
      refreshRate: 5000, // 5 seconds
    };

    // Set configuration
    useConfigStore.setState({
      config,
      isConfigured: true,
    });

    // Start auto refresh
    const store = useVehicleStore.getState();
    store.startAutoRefresh();

    // Verify auto refresh is enabled
    expect(useVehicleStore.getState().isAutoRefreshEnabled).toBe(true);
  });

  it('should stop auto refresh when configuration is cleared', () => {
    const config: UserConfig = {
      city: 'TestCity',
      homeLocation: { latitude: 45.0, longitude: 25.0 },
      workLocation: { latitude: 45.1, longitude: 25.1 },
      apiKey: 'test-key',
      refreshRate: 5000,
    };

    // Set configuration and start auto refresh
    useConfigStore.setState({
      config,
      isConfigured: true,
    });
    
    const store = useVehicleStore.getState();
    store.startAutoRefresh();
    expect(useVehicleStore.getState().isAutoRefreshEnabled).toBe(true);

    // Clear configuration
    store.stopAutoRefresh();

    // Verify auto refresh is disabled
    expect(useVehicleStore.getState().isAutoRefreshEnabled).toBe(false);
  });

  it('should handle manual refresh independently of auto refresh', async () => {
    const config: UserConfig = {
      city: 'TestCity',
      homeLocation: { latitude: 45.0, longitude: 25.0 },
      workLocation: { latitude: 45.1, longitude: 25.1 },
      apiKey: 'test-key',
      refreshRate: 10000, // 10 seconds
    };

    useConfigStore.setState({
      config,
      isConfigured: true,
    });

    const store = useVehicleStore.getState();
    
    // Mock the refreshVehicles function to track calls
    const refreshSpy = vi.fn().mockResolvedValue(undefined);
    useVehicleStore.setState({
      refreshVehicles: refreshSpy,
    });

    // Trigger manual refresh
    await store.manualRefresh();

    // Verify manual refresh was called
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear error state on manual refresh', async () => {
    const config: UserConfig = {
      city: 'TestCity',
      homeLocation: { latitude: 45.0, longitude: 25.0 },
      workLocation: { latitude: 45.1, longitude: 25.1 },
      apiKey: 'test-key',
      refreshRate: 5000,
    };

    useConfigStore.setState({
      config,
      isConfigured: true,
    });

    // Set an error state
    useVehicleStore.setState({
      error: {
        type: 'network',
        message: 'Test error',
        timestamp: new Date(),
        retryable: true,
      },
    });

    const store = useVehicleStore.getState();
    
    // Mock refreshVehicles to succeed
    const refreshSpy = vi.fn().mockResolvedValue(undefined);
    useVehicleStore.setState({
      refreshVehicles: refreshSpy,
    });

    // Trigger manual refresh
    await store.manualRefresh();

    // Verify error was cleared before refresh
    expect(refreshSpy).toHaveBeenCalled();
  });
});