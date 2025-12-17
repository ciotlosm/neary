import { useMemo } from 'react';
import type { LiveVehicle, Station, Coordinates } from '../../types';
import { calculateDistance } from '../../utils/distanceUtils';
import { logger } from '../../utils/logger';

/**
 * Configuration options for vehicle grouping
 */
export interface UseVehicleGroupingOptions {
  maxStations?: number; // Maximum number of stations to return
  maxVehiclesPerStation?: number; // Maximum vehicles per station
  proximityThreshold?: number; // Distance threshold for grouping nearby stations (meters)
}

/**
 * Station with distance information
 */
export interface StationWithDistance {
  station: Station;
  distance: number; // Distance from user location in meters
}

/**
 * Vehicle grouped by station
 */
export interface StationVehicleGroup {
  station: StationWithDistance;
  vehicles: LiveVehicle[];
  allRoutes: Array<{
    routeId: string;
    routeName: string;
    vehicleCount: number;
  }>;
}

/**
 * Result of vehicle grouping operation
 */
export interface VehicleGroupingResult {
  stationGroups: StationVehicleGroup[];
  totalStations: number;
  totalVehicles: number;
  groupingStats: {
    stationsWithVehicles: number;
    averageVehiclesPerStation: number;
    maxDistanceIncluded: number;
  };
}

/**
 * Hook for grouping vehicles by stations with distance calculations
 * 
 * This is a pure processing hook that takes vehicles, stations, and user location
 * and returns vehicles grouped by their nearest stations. It handles:
 * - Station-based vehicle grouping with distance calculations
 * - Capacity constraints and proximity thresholds
 * - Route aggregation and vehicle counting per station
 * - Input validation and safe defaults
 * 
 * @param vehicles Array of live vehicles to group
 * @param stations Array of stations to group vehicles by
 * @param userLocation User's current location for distance calculations
 * @param options Grouping configuration options
 * @returns Vehicles grouped by stations with statistics
 */
export const useVehicleGrouping = (
  vehicles: LiveVehicle[],
  stations: Station[],
  userLocation: Coordinates,
  options: UseVehicleGroupingOptions = {}
): VehicleGroupingResult => {
  const {
    maxStations = 5,
    maxVehiclesPerStation = 10,
    proximityThreshold = 200 // 200 meters default
  } = options;

  // Early return if maxStations is 0
  if (maxStations === 0) {
    return {
      stationGroups: [],
      totalStations: 0,
      totalVehicles: 0,
      groupingStats: {
        stationsWithVehicles: 0,
        averageVehiclesPerStation: 0,
        maxDistanceIncluded: 0
      }
    };
  }

  return useMemo(() => {
    // Input validation - return safe defaults for invalid inputs
    if (!Array.isArray(vehicles)) {
      logger.warn('Invalid vehicles input - expected array', { 
        vehiclesType: typeof vehicles 
      }, 'useVehicleGrouping');
      
      return {
        stationGroups: [],
        totalStations: 0,
        totalVehicles: 0,
        groupingStats: {
          stationsWithVehicles: 0,
          averageVehiclesPerStation: 0,
          maxDistanceIncluded: 0
        }
      };
    }

    if (!Array.isArray(stations)) {
      logger.warn('Invalid stations input - expected array', { 
        stationsType: typeof stations 
      }, 'useVehicleGrouping');
      
      return {
        stationGroups: [],
        totalStations: 0,
        totalVehicles: 0,
        groupingStats: {
          stationsWithVehicles: 0,
          averageVehiclesPerStation: 0,
          maxDistanceIncluded: 0
        }
      };
    }

    if (!userLocation || 
        typeof userLocation.latitude !== 'number' || 
        typeof userLocation.longitude !== 'number' ||
        isNaN(userLocation.latitude) || 
        isNaN(userLocation.longitude) ||
        Math.abs(userLocation.latitude) > 90 ||
        Math.abs(userLocation.longitude) > 180) {
      
      logger.warn('Invalid user location provided for vehicle grouping', {
        userLocation
      }, 'useVehicleGrouping');
      
      return {
        stationGroups: [],
        totalStations: 0,
        totalVehicles: 0,
        groupingStats: {
          stationsWithVehicles: 0,
          averageVehiclesPerStation: 0,
          maxDistanceIncluded: 0
        }
      };
    }

    // Validate and filter vehicles
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

    // Validate and filter stations
    const validStations = stations.filter(station => {
      return (
        station &&
        typeof station === 'object' &&
        station.id &&
        station.name &&
        station.coordinates &&
        typeof station.coordinates.latitude === 'number' &&
        typeof station.coordinates.longitude === 'number' &&
        !isNaN(station.coordinates.latitude) &&
        !isNaN(station.coordinates.longitude) &&
        Math.abs(station.coordinates.latitude) <= 90 &&
        Math.abs(station.coordinates.longitude) <= 180
      );
    });

    if (validVehicles.length === 0 || validStations.length === 0) {
      logger.debug('No valid vehicles or stations for grouping', {
        validVehicles: validVehicles.length,
        validStations: validStations.length,
        originalVehicles: vehicles.length,
        originalStations: stations.length
      }, 'useVehicleGrouping');
      
      return {
        stationGroups: [],
        totalStations: validStations.length,
        totalVehicles: validVehicles.length,
        groupingStats: {
          stationsWithVehicles: 0,
          averageVehiclesPerStation: 0,
          maxDistanceIncluded: 0
        }
      };
    }

    // Step 1: Calculate distances from user location to all stations
    const stationsWithDistances: StationWithDistance[] = validStations
      .map(station => {
        try {
          const distance = calculateDistance(userLocation, station.coordinates);
          return { station, distance };
        } catch (error) {
          logger.debug('Distance calculation failed for station', {
            stationId: station.id,
            stationCoordinates: station.coordinates,
            userLocation,
            error: error instanceof Error ? error.message : String(error)
          }, 'useVehicleGrouping');
          return null;
        }
      })
      .filter((item): item is StationWithDistance => item !== null)
      .sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)

    // Step 2: Group vehicles by their nearest station
    const stationVehicleMap = new Map<string, LiveVehicle[]>();
    
    for (const vehicle of validVehicles) {
      let nearestStation: StationWithDistance | null = null;
      let minDistance = Infinity;

      // Find the nearest station to this vehicle
      for (const stationWithDistance of stationsWithDistances) {
        try {
          const distance = calculateDistance(vehicle.position, stationWithDistance.station.coordinates);
          if (distance < minDistance) {
            minDistance = distance;
            nearestStation = stationWithDistance;
          }
        } catch (error) {
          // Skip this station if distance calculation fails
          continue;
        }
      }

      // Only group vehicles that are reasonably close to a station
      if (nearestStation && minDistance <= proximityThreshold) {
        const stationId = nearestStation.station.id;
        if (!stationVehicleMap.has(stationId)) {
          stationVehicleMap.set(stationId, []);
        }
        stationVehicleMap.get(stationId)!.push(vehicle);
      }
    }

    // Step 3: Create station groups with route aggregation
    const stationGroups: StationVehicleGroup[] = [];
    let maxDistanceIncluded = 0;

    for (const stationWithDistance of stationsWithDistances) {
      const stationId = stationWithDistance.station.id;
      const vehiclesAtStation = stationVehicleMap.get(stationId) || [];

      // Only include stations that have vehicles
      if (vehiclesAtStation.length > 0) {
        // Apply vehicle limit per station
        const limitedVehicles = vehiclesAtStation.slice(0, maxVehiclesPerStation);

        // Aggregate routes at this station
        const routeMap = new Map<string, { routeName: string; count: number }>();
        
        for (const vehicle of vehiclesAtStation) {
          const routeId = vehicle.routeId;
          if (routeMap.has(routeId)) {
            routeMap.get(routeId)!.count++;
          } else {
            // Extract route name from routeId (fallback to routeId if no better name available)
            const routeName = vehicle.label || routeId;
            routeMap.set(routeId, { routeName, count: 1 });
          }
        }

        // Convert route map to array and sort by route name
        const allRoutes = Array.from(routeMap.entries())
          .map(([routeId, { routeName, count }]) => ({
            routeId,
            routeName,
            vehicleCount: count
          }))
          .sort((a, b) => a.routeName.localeCompare(b.routeName));

        stationGroups.push({
          station: stationWithDistance,
          vehicles: limitedVehicles,
          allRoutes
        });

        // Track maximum distance included
        maxDistanceIncluded = Math.max(maxDistanceIncluded, stationWithDistance.distance);

        // Stop if we've reached the maximum number of stations
        if (stationGroups.length >= maxStations) {
          break;
        }
      }
    }

    // Step 4: Calculate grouping statistics
    const totalVehiclesInGroups = stationGroups.reduce((sum, group) => sum + group.vehicles.length, 0);
    const averageVehiclesPerStation = stationGroups.length > 0 
      ? totalVehiclesInGroups / stationGroups.length 
      : 0;

    const groupingStats = {
      stationsWithVehicles: stationGroups.length,
      averageVehiclesPerStation: Math.round(averageVehiclesPerStation * 100) / 100, // Round to 2 decimal places
      maxDistanceIncluded: Math.round(maxDistanceIncluded)
    };

    logger.debug('Vehicle grouping completed', {
      totalVehicles: validVehicles.length,
      totalStations: validStations.length,
      stationGroups: stationGroups.length,
      groupingStats,
      options: {
        maxStations,
        maxVehiclesPerStation,
        proximityThreshold
      }
    }, 'useVehicleGrouping');

    return {
      stationGroups,
      totalStations: validStations.length,
      totalVehicles: validVehicles.length,
      groupingStats
    };
  }, [
    vehicles,
    stations,
    userLocation,
    maxStations,
    maxVehiclesPerStation,
    proximityThreshold
  ]);
};