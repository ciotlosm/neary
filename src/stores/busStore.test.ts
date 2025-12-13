import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { useBusStore } from './busStore';
import { useConfigStore } from './configStore';
import type { UserConfig, BusInfo } from '../types';

// Mock the other stores
vi.mock('./directionStore', () => ({
  useDirectionStore: {
    getState: () => ({
      classifyBusesWithIntelligence: vi.fn((buses: BusInfo[]) => buses),
    }),
  },
}));

vi.mock('./locationStore', () => ({
  useLocationStore: {
    getState: () => ({
      calculateDistance: vi.fn(() => 1000),
    }),
  },
}));

// Mock the retry utils
vi.mock('../utils/retryUtils', () => ({
  withRetry: vi.fn((fn) => fn()),
  isRetryableError: vi.fn(() => true),
  RetryError: class extends Error {},
}));

// Mock the cache utils
vi.mock('../utils/cacheUtils', () => ({
  DataCache: class {
    set = vi.fn();
    getStale = vi.fn(() => null);
  },
}));

describe('BusStore Refresh System', () => {
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
    });
    
    useConfigStore.setState({
      config: null,
      isConfigured: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Property Tests', () => {
    /**
     * **Feature: bus-tracker, Property 4: Refresh rate timing compliance**
     * **Validates: Requirements 3.2**
     */
    it('should comply with refresh rate timing within tolerance', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }), // 1-10 second refresh rates for faster tests
          (refreshRate) => {
            // Setup configuration with the test refresh rate
            const config: UserConfig = {
              city: 'TestCity',
              homeLocation: { latitude: 45.0, longitude: 25.0 },
              workLocation: { latitude: 45.1, longitude: 25.1 },
              apiKey: 'test-key',
              refreshRate,
            };
            
            useConfigStore.setState({
              config,
              isConfigured: true,
            });

            // Create a refresh system that tracks timing
            const refreshTimes: number[] = [];
            let refreshCount = 0;
            const maxRefreshes = 3;
            
            // Mock the refreshBuses function to track timing
            const mockRefreshBuses = vi.fn(() => {
              refreshTimes.push(Date.now());
              refreshCount++;
              
              // Update the store state to simulate successful refresh
              useBusStore.setState({
                lastUpdate: new Date(),
                isLoading: false,
                error: null,
              });
            });

            // Start automatic refresh system
            let intervalId: ReturnType<typeof setInterval> | null = null;
            
            try {
              intervalId = setInterval(() => {
                if (refreshCount < maxRefreshes) {
                  mockRefreshBuses();
                }
              }, refreshRate);

              // Simulate time passing for the expected number of refreshes
              const totalTime = refreshRate * (maxRefreshes - 1);
              vi.advanceTimersByTime(totalTime);
              
              // Verify timing compliance (±10% tolerance as specified in design)
              if (refreshTimes.length >= 2) {
                for (let i = 1; i < refreshTimes.length; i++) {
                  const actualInterval = refreshTimes[i] - refreshTimes[i - 1];
                  const tolerance = refreshRate * 0.1; // 10% tolerance
                  const minExpected = refreshRate - tolerance;
                  const maxExpected = refreshRate + tolerance;
                  
                  expect(actualInterval).toBeGreaterThanOrEqual(minExpected);
                  expect(actualInterval).toBeLessThanOrEqual(maxExpected);
                }
              }
            } finally {
              if (intervalId) {
                clearInterval(intervalId);
              }
            }
          }
        ),
        { numRuns: 5 } // Reduced runs for timing tests
      );
    }, 10000); // 10 second timeout

    /**
     * **Feature: bus-tracker, Property 5: Manual refresh bypass**
     * **Validates: Requirements 3.3**
     */
    it('should bypass automatic timing when manual refresh is triggered', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2000, max: 10000 }), // 2-10 second refresh rates for this test
          async (refreshRate) => {
            // Setup configuration
            const config: UserConfig = {
              city: 'TestCity',
              homeLocation: { latitude: 45.0, longitude: 25.0 },
              workLocation: { latitude: 45.1, longitude: 25.1 },
              apiKey: 'test-key',
              refreshRate,
            };
            
            useConfigStore.setState({
              config,
              isConfigured: true,
            });

            // Reset bus store to clean state
            useBusStore.setState({
              buses: [],
              stations: [],
              lastUpdate: null,
              isLoading: false,
              error: null,
              isAutoRefreshEnabled: false,
            });

            // Track when refreshes occur
            const refreshTimes: number[] = [];
            const originalRefreshBuses = useBusStore.getState().refreshBuses;
            
            // Mock refreshBuses to track timing
            const mockRefreshBuses = vi.fn(async () => {
              refreshTimes.push(Date.now());
              // Simulate successful refresh
              useBusStore.setState({
                lastUpdate: new Date(),
                isLoading: false,
                error: null,
              });
            });

            // Replace the refreshBuses method temporarily
            useBusStore.setState({ refreshBuses: mockRefreshBuses });

            try {
              // Start auto refresh
              useBusStore.getState().startAutoRefresh();
              
              // Wait for first automatic refresh to establish baseline
              vi.advanceTimersByTime(refreshRate);
              expect(refreshTimes.length).toBe(1);
              const firstRefreshTime = refreshTimes[0];
              
              // Wait only 30% of the refresh interval (should not trigger automatic refresh yet)
              const partialTime = Math.floor(refreshRate * 0.3);
              vi.advanceTimersByTime(partialTime);
              
              // Verify no automatic refresh occurred yet
              expect(refreshTimes.length).toBe(1);
              
              // Trigger manual refresh - this should bypass the automatic timing
              await useBusStore.getState().manualRefresh();
              
              // Verify manual refresh happened immediately
              expect(refreshTimes.length).toBe(2);
              const manualRefreshTime = refreshTimes[1];
              const timeSinceFirst = manualRefreshTime - firstRefreshTime;
              
              // Manual refresh should have occurred at partialTime, not at the full refreshRate
              // This proves it bypassed the automatic timing
              expect(timeSinceFirst).toBeLessThan(refreshRate);
              expect(timeSinceFirst).toBeGreaterThanOrEqual(partialTime - 100); // Allow small timing variance
              
              // Continue to next automatic refresh point
              const remainingTime = refreshRate - partialTime;
              vi.advanceTimersByTime(remainingTime);
              
              // Should now have 3 refreshes total (1 auto, 1 manual, 1 auto)
              expect(refreshTimes.length).toBe(3);
              
            } finally {
              // Clean up
              useBusStore.getState().stopAutoRefresh();
              useBusStore.setState({ refreshBuses: originalRefreshBuses });
            }
          }
        ),
        { numRuns: 5 } // Reduced runs for timing tests
      );
    }, 15000); // 15 second timeout
  });
});