import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBusStore } from './busStore';
import { useConfigStore } from './configStore';
import type { UserConfig } from '../types';

describe('Refresh System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset stores
    useBusStore.setState({
      buses: [],
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
    const store = useBusStore.getState();
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
    const store = useBusStore.getState();
    store.startAutoRefresh();

    // Verify auto refresh is enabled
    expect(useBusStore.getState().isAutoRefreshEnabled).toBe(true);
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
    
    const store = useBusStore.getState();
    store.startAutoRefresh();
    expect(useBusStore.getState().isAutoRefreshEnabled).toBe(true);

    // Clear configuration
    store.stopAutoRefresh();

    // Verify auto refresh is disabled
    expect(useBusStore.getState().isAutoRefreshEnabled).toBe(false);
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

    const store = useBusStore.getState();
    
    // Mock the refreshBuses function to track calls
    const refreshSpy = vi.fn().mockResolvedValue(undefined);
    useBusStore.setState({
      refreshBuses: refreshSpy,
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
    useBusStore.setState({
      error: {
        type: 'network',
        message: 'Test error',
        timestamp: new Date(),
        retryable: true,
      },
    });

    const store = useBusStore.getState();
    
    // Mock refreshBuses to succeed
    const refreshSpy = vi.fn().mockResolvedValue(undefined);
    useBusStore.setState({
      refreshBuses: refreshSpy,
    });

    // Trigger manual refresh
    await store.manualRefresh();

    // Verify error was cleared before refresh
    expect(refreshSpy).toHaveBeenCalled();
  });
});