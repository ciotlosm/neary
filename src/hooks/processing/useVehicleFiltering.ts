import { useMemo } from 'react';
import type { LiveVehicle, Coordinates, FavoriteRoute } from '../../types';
import { calculateDistance } from '../../utils/distanceUtils';
import { logger } from '../../utils/logger';

/**
 * Configuration options for vehicle filtering
 */
export interface UseVehicleFilteringOptions {
  filterByFavorites?: boolean;
  favoriteRoutes?: FavoriteRoute[];
  maxSearchRadius?: number; // meters
  userLocation?: Coordinates;
}

/**
 * Statistics about the filtering operation
 */
export interface VehicleFilteringStats {
  totalVehicles: number;
  filteredCount: number;
  appliedFilters: string[];
  favoriteRouteIds?: string[];
  radiusFiltered?: number;
}

/**
 * Result of vehicle filtering operation
 */
export interface VehicleFilteringResult {
  filteredVehicles: LiveVehicle[];
  filterStats: VehicleFilteringStats;
}

/**
 * Hook for filtering vehicles by favorites and proximity
 * 
 * This is a pure processing hook that takes vehicles and filter criteria
 * and returns filtered results with statistics. It handles:
 * - Filtering by favorite routes
 * - Proximity filtering based on user location
 * - Input validation and safe defaults
 * - Comprehensive filtering statistics
 * 
 * @param vehicles Array of live vehicles to filter
 * @param options Filtering configuration options
 * @returns Filtered vehicles with statistics
 */
export const useVehicleFiltering = (
  vehicles: LiveVehicle[],
  options: UseVehicleFilteringOptions = {}
): VehicleFilteringResult => {
  const {
    filterByFavorites = false,
    favoriteRoutes = [],
    maxSearchRadius = 5000, // 5km default
    userLocation
  } = options;

  return useMemo(() => {
    // Input validation - return safe defaults for invalid inputs
    if (!Array.isArray(vehicles)) {
      logger.warn('Invalid vehicles input - expected array', { 
        vehiclesType: typeof vehicles 
      }, 'useVehicleFiltering');
      
      return {
        filteredVehicles: [],
        filterStats: {
          totalVehicles: 0,
          filteredCount: 0,
          appliedFilters: ['invalid-input']
        }
      };
    }

    // Validate vehicles array - filter out invalid entries
    const validVehicles = vehicles.filter(vehicle => {
      return (
        vehicle &&
        typeof vehicle === 'object' &&
        vehicle.id &&
        vehicle.routeId &&
        vehicle.position &&
        typeof vehicle.position.latitude === 'number' &&
        typeof vehicle.position.longitude === 'number' &&
        !isNaN(vehicle.position.latitude) &&
        !isNaN(vehicle.position.longitude) &&
        Math.abs(vehicle.position.latitude) <= 90 &&
        Math.abs(vehicle.position.longitude) <= 180
      );
    });

    if (validVehicles.length !== vehicles.length) {
      logger.debug('Filtered out invalid vehicles', {
        originalCount: vehicles.length,
        validCount: validVehicles.length,
        invalidCount: vehicles.length - validVehicles.length
      }, 'useVehicleFiltering');
    }

    const appliedFilters: string[] = [];
    let currentVehicles = validVehicles;
    let radiusFiltered = 0;

    // Step 1: Filter by favorite routes if enabled
    let favoriteRouteIds: string[] = [];
    if (filterByFavorites) {
      appliedFilters.push('favorites');
      
      if (Array.isArray(favoriteRoutes) && favoriteRoutes.length > 0) {
        // Extract route IDs from favorite routes (handle both string and object formats)
        favoriteRouteIds = favoriteRoutes.map(route => {
          if (typeof route === 'string') {
            return route;
          } else if (route && typeof route === 'object' && route.id) {
            return route.id;
          } else if (route && typeof route === 'object' && route.routeName) {
            // Fallback to routeName if id is not available
            return route.routeName;
          }
          return '';
        }).filter(id => id !== '');

        if (favoriteRouteIds.length > 0) {
          currentVehicles = currentVehicles.filter(vehicle => 
            vehicle.routeId && favoriteRouteIds.includes(vehicle.routeId)
          );
          
          logger.debug('Applied favorite routes filter', {
            favoriteRouteIds,
            beforeCount: validVehicles.length,
            afterCount: currentVehicles.length
          }, 'useVehicleFiltering');
        } else {
          logger.warn('Favorite routes provided but no valid route IDs found', {
            favoriteRoutes
          }, 'useVehicleFiltering');
          
          // Return empty result if favorites are enabled but no valid routes
          return {
            filteredVehicles: [],
            filterStats: {
              totalVehicles: validVehicles.length,
              filteredCount: 0,
              appliedFilters: ['favorites', 'no-valid-favorites'],
              favoriteRouteIds: []
            }
          };
        }
      } else {
        logger.debug('Favorite routes filter enabled but no routes provided', {
          favoriteRoutes
        }, 'useVehicleFiltering');
        
        // Return empty result if favorites are enabled but no routes provided
        return {
          filteredVehicles: [],
          filterStats: {
            totalVehicles: validVehicles.length,
            filteredCount: 0,
            appliedFilters: ['favorites', 'no-valid-favorites'],
            favoriteRouteIds: []
          }
        };
      }
    }

    // Step 2: Filter by proximity if user location is provided
    if (userLocation && 
        typeof userLocation.latitude === 'number' && 
        typeof userLocation.longitude === 'number' &&
        !isNaN(userLocation.latitude) && 
        !isNaN(userLocation.longitude) &&
        Math.abs(userLocation.latitude) <= 90 &&
        Math.abs(userLocation.longitude) <= 180) {
      
      appliedFilters.push('proximity');
      const beforeProximityCount = currentVehicles.length;
      
      currentVehicles = currentVehicles.filter(vehicle => {
        try {
          const distance = calculateDistance(userLocation, vehicle.position);
          return distance <= maxSearchRadius;
        } catch (error) {
          // If distance calculation fails, exclude the vehicle
          logger.debug('Distance calculation failed for vehicle', {
            vehicleId: vehicle.id,
            vehiclePosition: vehicle.position,
            userLocation,
            error: error instanceof Error ? error.message : String(error)
          }, 'useVehicleFiltering');
          return false;
        }
      });
      
      radiusFiltered = beforeProximityCount - currentVehicles.length;
      
      logger.debug('Applied proximity filter', {
        userLocation,
        maxSearchRadius,
        beforeCount: beforeProximityCount,
        afterCount: currentVehicles.length,
        radiusFiltered
      }, 'useVehicleFiltering');
    } else if (userLocation) {
      logger.warn('Invalid user location provided for proximity filtering', {
        userLocation
      }, 'useVehicleFiltering');
    }

    // Step 3: Sort vehicles for consistent ordering (by route name, then by vehicle ID)
    const sortedVehicles = currentVehicles.sort((a, b) => {
      // First sort by route ID
      const routeComparison = (a.routeId || '').localeCompare(b.routeId || '');
      if (routeComparison !== 0) {
        return routeComparison;
      }
      
      // Then sort by vehicle ID for consistent ordering
      return String(a.id || '').localeCompare(String(b.id || ''));
    });

    // Build comprehensive statistics
    const filterStats: VehicleFilteringStats = {
      totalVehicles: validVehicles.length,
      filteredCount: sortedVehicles.length,
      appliedFilters,
      ...(favoriteRouteIds.length > 0 && { favoriteRouteIds }),
      ...(radiusFiltered > 0 && { radiusFiltered })
    };

    logger.debug('Vehicle filtering completed', {
      ...filterStats,
      options: {
        filterByFavorites,
        favoriteRoutesCount: favoriteRoutes.length,
        maxSearchRadius,
        hasUserLocation: !!userLocation
      }
    }, 'useVehicleFiltering');

    return {
      filteredVehicles: sortedVehicles,
      filterStats
    };
  }, [
    vehicles, 
    filterByFavorites, 
    favoriteRoutes, 
    maxSearchRadius, 
    userLocation
  ]);
};