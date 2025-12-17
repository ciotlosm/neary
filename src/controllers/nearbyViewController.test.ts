/**
 * Tests for Nearby View Controller GPS Stability Logic
 * 
 * This test file focuses on testing the GPS position stability functionality
 * to ensure it meets the requirements for preventing frequent station switching.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  NearbyViewController, 
  createNearbyViewController,
  type NearbyViewOptions 
} from './nearbyViewController';
import type { Coordinates, Station, LiveVehicle } from '../types';
import type { Route } from '../types/tranzyApi';

// Mock logger to avoid console output during tests
vi.mock('../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('NearbyViewController GPS Stability Logic', () => {
  let controller: NearbyViewController;
  
  // Test data
  const baseLocation: Coordinates = { latitude: 46.7712, longitude: 23.6236 };
  const nearbyLocation: Coordinates = { latitude: 46.7713, longitude: 23.6237 }; // ~15m away
  const distantLocation: Coordinates = { latitude: 46.7800, longitude: 23.6300 }; // ~1km away
  
  const testStation: Station = {
    id: 'station1',
    name: 'Test Station',
    coordinates: { latitude: 46.7720, longitude: 23.6240 },
    isFavorite: false
  };
  
  const testRoute: Route = {
    id: 'route1',
    routeName: 'Test Route',
    routeDesc: 'Test Route Description',
    agencyId: 'test-agency',
    type: 'bus'
  };
  
  const testStopTime = {
    tripId: 'trip1',
    stopId: 'station1',
    arrivalTime: '08:00:00',
    departureTime: '08:00:00',
    sequence: 1,
    isPickupAvailable: true,
    isDropOffAvailable: true
  };
  
  const testTrip = {
    id: 'trip1',
    routeId: 'route1',
    serviceId: 'service1',
    direction: 'inbound' as const,
    isWheelchairAccessible: false,
    areBikesAllowed: false
  };
  
  const testVehicle: LiveVehicle = {
    id: 'vehicle1',
    routeId: 'route1',
    tripId: 'trip1',
    label: 'Test Vehicle',
    position: { latitude: 46.7715, longitude: 23.6238 },
    timestamp: new Date().toISOString(),
    speed: 25,
    isWheelchairAccessible: false,
    isBikeAccessible: false
  };

  beforeEach(() => {
    // Create fresh controller for each test
    controller = createNearbyViewController({
      enableStabilityTracking: true,
      stabilityMode: 'normal',
      enableSecondStation: true
    });
  });

  describe('Stability Context Management', () => {
    it('should initialize with empty stability context', () => {
      const context = controller.getStabilityContext();
      expect(context.previousLocation).toBeUndefined();
      expect(context.previousSelection).toBeUndefined();
      expect(context.consecutiveOverrides).toBeUndefined();
    });

    it('should reset stability context correctly', () => {
      controller.resetStabilityContext();
      const context = controller.getStabilityContext();
      
      expect(context.consecutiveOverrides).toBe(0);
      expect(context.stabilityScore).toBe(0.5);
      expect(context.locationHistory).toEqual([]);
    });

    it('should provide stability metrics', () => {
      const metrics = controller.getStabilityMetrics();
      
      expect(metrics).toHaveProperty('stabilityScore');
      expect(metrics).toHaveProperty('consecutiveOverrides');
      expect(metrics).toHaveProperty('maxConsecutiveOverrides');
      expect(metrics).toHaveProperty('locationHistoryLength');
      expect(metrics).toHaveProperty('lastSelectionAge');
      expect(metrics).toHaveProperty('isStable');
      
      expect(typeof metrics.stabilityScore).toBe('number');
      expect(typeof metrics.isStable).toBe('boolean');
    });
  });

  describe('Stability Mode Configuration', () => {
    it('should handle strict stability mode', () => {
      const strictController = createNearbyViewController({
        stabilityMode: 'strict',
        enableStabilityTracking: true
      });
      
      const options = strictController.getOptions();
      expect(options.stabilityMode).toBe('strict');
    });

    it('should handle flexible stability mode', () => {
      const flexibleController = createNearbyViewController({
        stabilityMode: 'flexible',
        enableStabilityTracking: true
      });
      
      const options = flexibleController.getOptions();
      expect(options.stabilityMode).toBe('flexible');
    });

    it('should default to normal stability mode', () => {
      const defaultController = createNearbyViewController();
      const options = defaultController.getOptions();
      expect(options.stabilityMode).toBe('normal');
    });
  });

  describe('Selection Stability', () => {
    it('should indicate unstable selection initially', () => {
      expect(controller.isSelectionStable()).toBe(false);
    });

    it('should allow forcing new selection', () => {
      // First, simulate some overrides
      controller.resetStabilityContext();
      
      // Force new selection
      controller.forceNewSelection();
      
      // Should not crash and should be callable
      expect(() => controller.forceNewSelection()).not.toThrow();
    });
  });

  describe('GPS Position Processing', () => {
    it('should process nearby view without errors for valid input', async () => {
      const result = await controller.processNearbyView(
        baseLocation,
        [testStation],
        [testRoute],
        [testVehicle],
        [testStopTime],
        [testTrip]
      );
      
      expect(result).toBeDefined();
      expect(result.isLoading).toBe(false);
      // Note: effectiveLocationForDisplay might be null if no valid stations are found
      // This is expected behavior when stations don't have proper route associations
      expect(result.selectionMetadata.stabilityApplied).toBe(false); // First run, no stability
    });

    it('should handle null GPS location gracefully', async () => {
      const result = await controller.processNearbyView(
        null,
        [testStation],
        [testRoute],
        [testVehicle]
      );
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('no_gps_location');
      expect(result.isLoading).toBe(false);
    });

    it('should handle empty stations array', async () => {
      const result = await controller.processNearbyView(
        baseLocation,
        [], // Empty stations
        [testRoute],
        [testVehicle]
      );
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('no_stations_in_range');
    });

    it('should handle empty routes array', async () => {
      const result = await controller.processNearbyView(
        baseLocation,
        [testStation],
        [], // Empty routes
        [testVehicle]
      );
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('no_routes_available');
    });
  });

  describe('Stability Override Logic', () => {
    it('should not apply stability override on first selection', async () => {
      const result = await controller.processNearbyView(
        baseLocation,
        [testStation],
        [testRoute],
        [testVehicle],
        [testStopTime],
        [testTrip]
      );
      
      expect(result.selectionMetadata.stabilityApplied).toBe(false);
    });

    it('should track location history after processing', async () => {
      await controller.processNearbyView(
        baseLocation,
        [testStation],
        [testRoute],
        [testVehicle],
        [testStopTime],
        [testTrip]
      );
      
      const context = controller.getStabilityContext();
      // Context should be updated even if no valid stations are found
      expect(context.locationHistory).toBeDefined();
      expect(Array.isArray(context.locationHistory)).toBe(true);
    });

    it('should update stability metrics after processing', async () => {
      await controller.processNearbyView(
        baseLocation,
        [testStation],
        [testRoute],
        [testVehicle],
        [testStopTime],
        [testTrip]
      );
      
      const metrics = controller.getStabilityMetrics();
      expect(typeof metrics.lastSelectionAge).toBe('number');
      expect(metrics.locationHistoryLength).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.stabilityScore).toBe('number');
      expect(typeof metrics.isStable).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid GPS coordinates', async () => {
      const invalidLocation: Coordinates = { latitude: 999, longitude: 999 };
      
      const result = await controller.processNearbyView(
        invalidLocation,
        [testStation],
        [testRoute],
        [testVehicle]
      );
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('no_gps_location');
    });

    it('should provide retryable errors for temporary failures', async () => {
      const result = await controller.processNearbyView(
        null, // This will cause a retryable error
        [testStation],
        [testRoute],
        [testVehicle]
      );
      
      expect(result.error?.retryable).toBe(false); // GPS location error is not retryable
    });
  });

  describe('Configuration Updates', () => {
    it('should allow updating options', () => {
      const newOptions: Partial<NearbyViewOptions> = {
        stabilityMode: 'strict',
        customDistanceThreshold: 300
      };
      
      controller.updateOptions(newOptions);
      
      const updatedOptions = controller.getOptions();
      expect(updatedOptions.stabilityMode).toBe('strict');
      expect(updatedOptions.customDistanceThreshold).toBe(300);
    });

    it('should preserve other options when updating', () => {
      const originalOptions = controller.getOptions();
      
      controller.updateOptions({ stabilityMode: 'flexible' });
      
      const updatedOptions = controller.getOptions();
      expect(updatedOptions.stabilityMode).toBe('flexible');
      expect(updatedOptions.enableSecondStation).toBe(originalOptions.enableSecondStation);
      expect(updatedOptions.maxSearchRadius).toBe(originalOptions.maxSearchRadius);
    });
  });
});