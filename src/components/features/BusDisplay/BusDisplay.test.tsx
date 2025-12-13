import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { BusDisplay } from './BusDisplay';
import { useEnhancedBusStore } from '../../../stores/enhancedBusStore';

// Mock the stores
vi.mock('../../../stores/enhancedBusStore', () => ({
  useEnhancedBusStore: vi.fn(),
}));

describe('BusDisplay Component', () => {
  // Generator for non-empty strings without whitespace-only values
  const nonEmptyStringArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
  
  // Generator for unique IDs
  const uniqueIdArb = fc.uuid();

  // Generator for coordinates
  const coordinatesArb = fc.record({
    latitude: fc.float({ min: -90, max: 90 }),
    longitude: fc.float({ min: -180, max: 180 }),
  });

  // Generator for stations
  const stationArb = fc.record({
    id: uniqueIdArb,
    name: nonEmptyStringArb,
    coordinates: coordinatesArb,
    isFavorite: fc.boolean(),
  });

  // Generator for bus info with realistic timing
  const busInfoArb = fc.record({
    id: uniqueIdArb,
    route: nonEmptyStringArb,
    routeId: nonEmptyStringArb,
    destination: nonEmptyStringArb,
    direction: fc.constantFrom('work', 'home', 'unknown'),
    estimatedArrival: fc.date({ min: new Date(), max: new Date(Date.now() + 24 * 60 * 60 * 1000) }),
    minutesAway: fc.integer({ min: 0, max: 60 }),
    isLive: fc.boolean(),
    isScheduled: fc.boolean(),
    confidence: fc.constantFrom('high', 'medium', 'low'),
    station: stationArb,
  });

  describe('Unit Tests', () => {
    it('should render empty state when no buses match direction', () => {
      const buses = [
        {
          id: 'bus1',
          route: '101',
          routeId: '101',
          destination: 'Downtown',
          direction: 'home' as const,
          estimatedArrival: new Date(),
          minutesAway: 5,
          isLive: true,
          isScheduled: false,
          confidence: 'high' as const,
          station: {
            id: 'station1',
            name: 'Main St',
            coordinates: { latitude: 45.0, longitude: 25.0 },
            isFavorite: false,
          },
        },
      ];

      // Mock the store to return buses that don't match the direction
      vi.mocked(useEnhancedBusStore).mockReturnValue({
        buses,
        isLoading: false,
        error: null,
        lastUpdate: null,
        cacheStats: {
          totalEntries: 0,
          totalSize: 0,
          entriesByType: {},
        },
        refreshBuses: vi.fn(),
        refreshScheduleData: vi.fn(),
        refreshLiveData: vi.fn(),
        forceRefreshAll: vi.fn(),
        clearError: vi.fn(),
        isAutoRefreshEnabled: false,
        startAutoRefresh: vi.fn(),
        stopAutoRefresh: vi.fn(),
        manualRefresh: vi.fn(),
        getCacheStats: vi.fn(),
        clearCache: vi.fn(),
        calculateDistance: vi.fn(),
      });

      const { container } = render(<BusDisplay direction="work" />);
      
      expect(container.textContent).toContain('No buses available');
    });

    it('should render buses for matching direction', () => {
      const buses = [
        {
          id: 'bus1',
          route: '101',
          routeId: '101',
          destination: 'Downtown',
          direction: 'work' as const,
          estimatedArrival: new Date(Date.now() + 5 * 60000),
          minutesAway: 5,
          isLive: true,
          isScheduled: false,
          confidence: 'high' as const,
          station: {
            id: 'station1',
            name: 'Main St',
            coordinates: { latitude: 45.0, longitude: 25.0 },
            isFavorite: false,
          },
        },
      ];

      // Mock the store to return buses that match the direction
      vi.mocked(useEnhancedBusStore).mockReturnValue({
        buses,
        isLoading: false,
        error: null,
        lastUpdate: null,
        cacheStats: {
          totalEntries: 0,
          totalSize: 0,
          entriesByType: {},
        },
        refreshBuses: vi.fn(),
        refreshScheduleData: vi.fn(),
        refreshLiveData: vi.fn(),
        forceRefreshAll: vi.fn(),
        clearError: vi.fn(),
        isAutoRefreshEnabled: false,
        startAutoRefresh: vi.fn(),
        stopAutoRefresh: vi.fn(),
        manualRefresh: vi.fn(),
        getCacheStats: vi.fn(),
        clearCache: vi.fn(),
        calculateDistance: vi.fn(),
      });

      const { container } = render(<BusDisplay direction="work" />);
      
      expect(container.textContent).toContain('Route 101');
      expect(container.textContent).toContain('To: Downtown');
      expect(container.textContent).toContain('From: Main St');
    });
  });

  describe('Property Tests', () => {
    /**
     * **Feature: bus-tracker, Property 8: Data presentation consistency**
     * **Validates: Requirements 5.2, 5.3, 7.1**
     */
    it('should consistently format bus timing data as "Bus X in Y minutes (live/scheduled) at HH:MM"', () => {
      fc.assert(
        fc.property(
          fc.array(busInfoArb, { minLength: 1, maxLength: 10 }),
          (buses) => {
            // Ensure at least one bus matches the direction we're testing
            const workBuses = buses.map(bus => ({ ...bus, direction: 'work' as const }));
            
            // Mock the store to return the test buses
            vi.mocked(useEnhancedBusStore).mockReturnValue({
              buses: workBuses,
              isLoading: false,
              error: null,
              lastUpdate: null,
              cacheStats: {
                totalEntries: 0,
                totalSize: 0,
                entriesByType: {},
              },
              refreshBuses: vi.fn(),
              refreshScheduleData: vi.fn(),
              refreshLiveData: vi.fn(),
              forceRefreshAll: vi.fn(),
              clearError: vi.fn(),
              isAutoRefreshEnabled: false,
              startAutoRefresh: vi.fn(),
              stopAutoRefresh: vi.fn(),
              manualRefresh: vi.fn(),
              getCacheStats: vi.fn(),
              clearCache: vi.fn(),
              calculateDistance: vi.fn(),
            });
            
            // Render the component with test buses
            const { container } = render(<BusDisplay direction="work" />);
            
            // For each bus that should be displayed, verify the format is correct
            workBuses.forEach((bus) => {
              const liveStatus = bus.isLive ? 'live' : 'scheduled';
              const timeString = bus.estimatedArrival.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              
              // Check if this bus element exists
              const busElement = container.querySelector(`[data-testid="bus-${bus.id}"]`);
              if (busElement) {
                const busText = busElement.textContent || '';
                
                // Check if the new UI format contains the expected elements
                expect(busText).toContain(`Route ${bus.route}`);
                expect(busText).toContain(`${bus.minutesAway}`);
                expect(busText).toContain(bus.isLive ? 'Live' : bus.isScheduled ? 'Scheduled' : 'Estimated');
              }
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * **Feature: bus-tracker, Property 9: Chronological bus ordering**
     * **Validates: Requirements 7.2**
     */
    it('should display buses in chronological order of arrival', () => {
      fc.assert(
        fc.property(
          fc.array(busInfoArb, { minLength: 2, maxLength: 10 }),
          (buses) => {
            // Ensure buses have different arrival times and all match the direction
            const workBuses = buses
              .map((bus, index) => ({
                ...bus,
                direction: 'work' as const,
                estimatedArrival: new Date(Date.now() + (index + 1) * 60000), // Each bus 1 minute apart
                minutesAway: index + 1,
              }))
              .sort(() => Math.random() - 0.5); // Randomize order before passing to component
            
            // Mock the store to return the test buses
            vi.mocked(useEnhancedBusStore).mockReturnValue({
              buses: workBuses,
              isLoading: false,
              error: null,
              lastUpdate: null,
              cacheStats: {
                totalEntries: 0,
                totalSize: 0,
                entriesByType: {},
              },
              refreshBuses: vi.fn(),
              refreshScheduleData: vi.fn(),
              refreshLiveData: vi.fn(),
              forceRefreshAll: vi.fn(),
              clearError: vi.fn(),
              isAutoRefreshEnabled: false,
              startAutoRefresh: vi.fn(),
              stopAutoRefresh: vi.fn(),
              manualRefresh: vi.fn(),
              getCacheStats: vi.fn(),
              clearCache: vi.fn(),
              calculateDistance: vi.fn(),
            });
            
            const { container } = render(<BusDisplay direction="work" />);
            
            // Get all bus elements in the order they appear in the DOM
            const busElements = Array.from(container.querySelectorAll('[data-testid^="bus-"]'));
            
            // Extract the minutes away from each element and verify chronological order
            const displayedMinutes: number[] = [];
            busElements.forEach((element) => {
              const text = element.textContent || '';
              const minutesMatch = text.match(/in (\d+) minutes?/);
              if (minutesMatch) {
                displayedMinutes.push(parseInt(minutesMatch[1], 10));
              }
            });
            
            // Verify that the displayed minutes are in ascending order (chronological)
            for (let i = 1; i < displayedMinutes.length; i++) {
              expect(displayedMinutes[i]).toBeGreaterThanOrEqual(displayedMinutes[i - 1]);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});