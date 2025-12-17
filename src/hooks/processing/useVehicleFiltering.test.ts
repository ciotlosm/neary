import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import { useVehicleFiltering } from './useVehicleFiltering';
import { propertyTestConfig } from '../../test/utils/propertyTestConfig';
import { 
  liveVehicleArb, 
  clujCoordinatesArb, 
  createMockData 
} from '../../test/utils/mockDataGenerators';
import type { LiveVehicle, FavoriteRoute } from '../../types';

describe('useVehicleFiltering', () => {
  describe('Property 4: Vehicle Filtering Determinism', () => {
    /**
     * **Feature: hook-refactoring, Property 4: Vehicle Filtering Determinism**
     * **Validates: Requirements 2.1, 5.4**
     * 
     * For any set of vehicles and filter criteria, the filtering hook should 
     * always return identical filtered results when given the same inputs
     */
    it('should return identical results for identical inputs', () => {
      fc.assert(
        fc.property(
          fc.array(liveVehicleArb, { minLength: 0, maxLength: 20 }),
          fc.boolean(), // filterByFavorites
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            routeName: fc.string({ minLength: 1, maxLength: 5 })
          }), { minLength: 0, maxLength: 5 }), // favoriteRoutes
          fc.double({ min: 100, max: 10000 }), // maxSearchRadius
          fc.option(clujCoordinatesArb), // userLocation
          (vehicles, filterByFavorites, favoriteRoutes, maxSearchRadius, userLocation) => {
            // Ensure vehicles have valid data for consistent testing
            const validVehicles = vehicles.map((vehicle, index) => ({
              ...vehicle,
              id: vehicle.id || `vehicle-${index}`,
              routeId: vehicle.routeId || `route-${index % 5}`,
              // Ensure valid coordinates
              position: {
                ...vehicle.position,
                latitude: isNaN(vehicle.position.latitude) ? 46.75 : vehicle.position.latitude,
                longitude: isNaN(vehicle.position.longitude) ? 23.6 : vehicle.position.longitude
              }
            }));

            // Ensure valid user location for consistent testing
            const validUserLocation = userLocation && 
              !isNaN(userLocation.latitude) && 
              !isNaN(userLocation.longitude) &&
              Math.abs(userLocation.latitude) <= 90 &&
              Math.abs(userLocation.longitude) <= 180
              ? userLocation 
              : undefined;

            const options = {
              filterByFavorites,
              favoriteRoutes,
              maxSearchRadius,
              userLocation: validUserLocation
            };

            // Run the hook twice with identical inputs
            const { result: result1 } = renderHook(() => 
              useVehicleFiltering(validVehicles, options)
            );
            
            const { result: result2 } = renderHook(() => 
              useVehicleFiltering(validVehicles, options)
            );

            // Results should be identical
            expect(result1.current.filteredVehicles).toEqual(result2.current.filteredVehicles);
            expect(result1.current.filterStats).toEqual(result2.current.filterStats);

            // Filtered vehicles should be a subset of input vehicles (after validation)
            expect(result1.current.filteredVehicles.length).toBeLessThanOrEqual(validVehicles.length);
            
            // All filtered vehicles should exist in the original array
            result1.current.filteredVehicles.forEach(filteredVehicle => {
              expect(validVehicles.some(v => v.id === filteredVehicle.id)).toBe(true);
            });

            // Filter stats should be consistent - totalVehicles reflects valid vehicles after validation
            expect(result1.current.filterStats.filteredCount).toBe(result1.current.filteredVehicles.length);
            expect(Array.isArray(result1.current.filterStats.appliedFilters)).toBe(true);

            // If favorites filtering is enabled, only vehicles with matching route IDs should pass
            if (filterByFavorites && favoriteRoutes.length > 0) {
              const favoriteRouteIds = favoriteRoutes.map(r => r.id);
              result1.current.filteredVehicles.forEach(vehicle => {
                expect(favoriteRouteIds.includes(vehicle.routeId)).toBe(true);
              });
              expect(result1.current.filterStats.appliedFilters).toContain('favorites');
            }

            // If proximity filtering is applied and we didn't return early due to favorites, 
            // vehicles should be within radius
            if (validUserLocation && !result1.current.filterStats.appliedFilters.includes('no-valid-favorites')) {
              expect(result1.current.filterStats.appliedFilters).toContain('proximity');
            }
          }
        ),
        propertyTestConfig
      );
    });

    it('should handle edge cases gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant([]), // empty array
            fc.constant(null as any), // null input
            fc.constant(undefined as any), // undefined input
            fc.array(fc.oneof(
              fc.constant(null), // null vehicle
              fc.constant({}), // empty object
              fc.record({
                id: fc.constant(''), // empty id
                routeId: fc.constant(''), // empty routeId
                position: fc.record({
                  latitude: fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.double({ min: -200, max: 200 })),
                  longitude: fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.double({ min: -200, max: 200 }))
                })
              })
            ), { minLength: 1, maxLength: 5 })
          ),
          (invalidVehicles) => {
            const { result } = renderHook(() => 
              useVehicleFiltering(invalidVehicles, {})
            );

            // Should not throw and should return safe defaults
            expect(result.current).toBeDefined();
            expect(Array.isArray(result.current.filteredVehicles)).toBe(true);
            expect(typeof result.current.filterStats).toBe('object');
            expect(typeof result.current.filterStats.totalVehicles).toBe('number');
            expect(typeof result.current.filterStats.filteredCount).toBe('number');
            expect(Array.isArray(result.current.filterStats.appliedFilters)).toBe(true);
          }
        ),
        propertyTestConfig
      );
    });

    it('should maintain consistent ordering', () => {
      fc.assert(
        fc.property(
          fc.array(liveVehicleArb, { minLength: 2, maxLength: 10 }),
          (vehicles) => {
            // Ensure vehicles have valid route IDs
            const validVehicles = vehicles.map((vehicle, index) => ({
              ...vehicle,
              routeId: `route-${index % 3}`, // Create some duplicate route IDs
              id: `vehicle-${index}`
            }));

            const { result } = renderHook(() => 
              useVehicleFiltering(validVehicles, {})
            );

            const filteredVehicles = result.current.filteredVehicles;

            // Should be sorted by route ID, then by vehicle ID
            for (let i = 1; i < filteredVehicles.length; i++) {
              const prev = filteredVehicles[i - 1];
              const curr = filteredVehicles[i];
              
              const routeComparison = String(prev.routeId).localeCompare(String(curr.routeId));
              if (routeComparison === 0) {
                // Same route - should be sorted by vehicle ID
                expect(String(prev.id).localeCompare(String(curr.id))).toBeLessThanOrEqual(0);
              } else {
                // Different routes - should be sorted by route ID
                expect(routeComparison).toBeLessThan(0);
              }
            }
          }
        ),
        propertyTestConfig
      );
    });
  });

  describe('Unit Tests', () => {
    it('should filter by favorite routes correctly', () => {
      const vehicles: LiveVehicle[] = [
        createMockData.liveVehicle({ id: 'v1', routeId: 'route-42' }),
        createMockData.liveVehicle({ id: 'v2', routeId: 'route-43' }),
        createMockData.liveVehicle({ id: 'v3', routeId: 'route-44' })
      ];

      const favoriteRoutes: FavoriteRoute[] = [
        { id: 'route-42', routeName: '42', longName: 'Route 42', type: 'bus' },
        { id: 'route-43', routeName: '43', longName: 'Route 43', type: 'bus' }
      ];

      const { result } = renderHook(() => 
        useVehicleFiltering(vehicles, { 
          filterByFavorites: true, 
          favoriteRoutes 
        })
      );

      expect(result.current.filteredVehicles).toHaveLength(2);
      expect(result.current.filteredVehicles.map(v => v.id)).toEqual(['v1', 'v2']);
      expect(result.current.filterStats.appliedFilters).toContain('favorites');
    });

    it('should filter by proximity correctly', () => {
      const userLocation = { latitude: 46.75, longitude: 23.6 };
      const vehicles: LiveVehicle[] = [
        createMockData.liveVehicle({ 
          id: 'v1', 
          position: { latitude: 46.75, longitude: 23.6 } // Same location
        }),
        createMockData.liveVehicle({ 
          id: 'v2', 
          position: { latitude: 46.76, longitude: 23.61 } // Close
        }),
        createMockData.liveVehicle({ 
          id: 'v3', 
          position: { latitude: 47.0, longitude: 24.0 } // Far away
        })
      ];

      const { result } = renderHook(() => 
        useVehicleFiltering(vehicles, { 
          userLocation, 
          maxSearchRadius: 5000 // 5km
        })
      );

      expect(result.current.filteredVehicles.length).toBeLessThan(vehicles.length);
      expect(result.current.filterStats.appliedFilters).toContain('proximity');
    });

    it('should return empty result when favorites enabled but no valid routes', () => {
      const vehicles: LiveVehicle[] = [
        createMockData.liveVehicle({ id: 'v1', routeId: 'route-42' })
      ];

      const { result } = renderHook(() => 
        useVehicleFiltering(vehicles, { 
          filterByFavorites: true, 
          favoriteRoutes: [] 
        })
      );

      expect(result.current.filteredVehicles).toHaveLength(0);
      expect(result.current.filterStats.appliedFilters).toContain('no-valid-favorites');
    });

    it('should return all vehicles when favorites disabled', () => {
      const vehicles: LiveVehicle[] = [
        createMockData.liveVehicle({ id: 'v1', routeId: 'route-42' })
      ];

      const { result } = renderHook(() => 
        useVehicleFiltering(vehicles, { 
          filterByFavorites: false, 
          favoriteRoutes: [] 
        })
      );

      expect(result.current.filteredVehicles).toHaveLength(1);
      expect(result.current.filterStats.appliedFilters).not.toContain('favorites');
    });

    it('should handle invalid input gracefully', () => {
      const { result } = renderHook(() => 
        useVehicleFiltering(null as any, {})
      );

      expect(result.current.filteredVehicles).toEqual([]);
      expect(result.current.filterStats.appliedFilters).toContain('invalid-input');
    });
  });
});