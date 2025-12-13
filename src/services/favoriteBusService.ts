import { enhancedTranzyApi } from './enhancedTranzyApi';
import { agencyService } from './agencyService';
import { routeMappingService } from './routeMappingService';
import { logger } from '../utils/logger';

export interface BusStopInfo {
  id: string;
  name: string;
  sequence: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  arrivalTime?: string; // Scheduled arrival time (HH:MM:SS)
  departureTime?: string; // Scheduled departure time (HH:MM:SS)
  isNearest?: boolean; // True if this is the nearest station to the vehicle
  isClosestRouteStop?: boolean; // True if this is the closest route stop when bus is off-route
  isOffRoute?: boolean; // True if the bus is not near any route stops
}

export interface FavoriteBusInfo {
  routeShortName: string; // What users see: "42", "43B", etc. (PRIMARY IDENTIFIER)
  routeName: string; // Display name: "Route 42" or full long name
  routeDescription?: string;
  routeType: 'bus' | 'trolleybus' | 'tram' | 'metro' | 'rail' | 'ferry' | 'other';
  vehicleId: string; // Live vehicle ID
  tripId: string; // Active trip ID (indicates direction: "40_0", "40_1", etc.)
  destination?: string; // Where the bus is going (from trip_headsign)
  latitude: number; // Current vehicle position
  longitude: number;
  speed?: number; // Vehicle speed if available
  bearing?: number; // Vehicle direction if available
  lastUpdate: Date; // When this vehicle data was last updated
  nearestStation: {
    id: string;
    name: string;
    distance: number; // Distance in meters
  } | null;
  stopSequence?: BusStopInfo[]; // Ordered list of stops for this trip
  direction?: 'inbound' | 'outbound'; // Trip direction
}

export interface FavoriteBusResult {
  favoriteBuses: FavoriteBusInfo[];
  lastUpdate: Date;
}

class FavoriteBusService {

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    pos1: { latitude: number; longitude: number },
    pos2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.latitude * Math.PI / 180;
    const φ2 = pos2.latitude * Math.PI / 180;
    const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Find the nearest station to a vehicle position
   */
  private findNearestStation(
    vehiclePosition: { latitude: number; longitude: number },
    stations: any[]
  ): { id: string; name: string; distance: number } | null {
    if (!stations || stations.length === 0) return null;

    let nearest: { id: string; name: string; distance: number } | null = null;
    let minDistance = Infinity;

    for (const station of stations) {
      if (!station.coordinates) continue;
      
      const distance = this.calculateDistance(vehiclePosition, station.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          id: station.id,
          name: station.name,
          distance: Math.round(distance)
        };
      }
    }

    // Only return stations within 2km
    return nearest && nearest.distance <= 2000 ? nearest : null;
  }

  /**
   * Build stop sequence for a trip with nearest station highlighted
   */
  private buildStopSequence(
    tripId: string,
    stopTimes: any[],
    stations: any[],
    vehiclePosition: { latitude: number; longitude: number },
    nearestStation: { id: string; name: string; distance: number } | null,
    allRouteStopTimes: Map<string, any[]>,
    routeId: string,
    _tripDirection?: 'inbound' | 'outbound'
  ): BusStopInfo[] {
    if (!stopTimes || stopTimes.length === 0) return [];

    // Create a map for quick station lookup
    const stationsMap = new Map(stations.map(station => [station.id, station]));

    // Build stop sequence
    const stopSequence: BusStopInfo[] = stopTimes.map(stopTime => {
      const station = stationsMap.get(stopTime.stopId);
      const isNearest = nearestStation?.id === stopTime.stopId;

      return {
        id: stopTime.stopId,
        name: station?.name || `Stop ${stopTime.stopId}`,
        sequence: stopTime.sequence,
        coordinates: station?.coordinates || { latitude: 0, longitude: 0 },
        arrivalTime: stopTime.arrivalTime,
        departureTime: stopTime.departureTime,
        isNearest,
        isClosestRouteStop: false,
        isOffRoute: false
      };
    });

    // Sort by sequence (should already be sorted, but ensure it)
    stopSequence.sort((a, b) => a.sequence - b.sequence);

    // Check if the nearest station is part of the current trip stops
    const nearestStationInCurrentTrip = stopSequence.some(stop => stop.isNearest);
    
    if (!nearestStationInCurrentTrip && nearestStation) {
      // Check if the nearest station exists in ANY trip for this route
      let nearestStationInAnyRouteTrip = false;
      
      // Get all trips for this route (extract route ID from trip ID pattern like "40_0", "40_1")
      const routeTrips = Array.from(allRouteStopTimes.keys()).filter(tId => 
        tId.startsWith(routeId + '_')
      );
      
      for (const routeTripId of routeTrips) {
        const routeTripStopTimes = allRouteStopTimes.get(routeTripId) || [];
        const stationInThisTrip = routeTripStopTimes.some(st => st.stopId === nearestStation.id);
        if (stationInThisTrip) {
          nearestStationInAnyRouteTrip = true;
          break;
        }
      }

      // Find the closest route stop to the vehicle's GPS position
      let closestRouteStop: BusStopInfo | null = null;
      let minDistance = Infinity;

      for (const stop of stopSequence) {
        if (stop.coordinates.latitude !== 0 && stop.coordinates.longitude !== 0) {
          const distance = this.calculateDistance(vehiclePosition, stop.coordinates);
          if (distance < minDistance) {
            minDistance = distance;
            closestRouteStop = stop;
          }
        }
      }

      if (closestRouteStop) {
        closestRouteStop.isClosestRouteStop = true;
        
        if (nearestStationInAnyRouteTrip) {
          // Station exists in route but not current trip - likely opposite direction
          closestRouteStop.isOffRoute = false; // Don't mark as off-route
          console.log('🟡 BUS NEAR OPPOSITE DIRECTION STOP:', {
            vehiclePosition,
            nearestStation: nearestStation.name,
            nearestStationDistance: nearestStation.distance,
            closestRouteStop: closestRouteStop.name,
            closestRouteStopDistance: Math.round(minDistance),
            status: 'opposite_direction'
          });
        } else {
          // Station doesn't exist in any route trip - truly off-route
          closestRouteStop.isOffRoute = true;
          console.log('🔴 BUS OFF-ROUTE:', {
            vehiclePosition,
            nearestStation: nearestStation.name,
            nearestStationDistance: nearestStation.distance,
            closestRouteStop: closestRouteStop.name,
            closestRouteStopDistance: Math.round(minDistance),
            status: 'off_route'
          });
        }
      }
    }

    return stopSequence;
  }

  async getFavoriteBusInfo(
    favoriteRoutes: Array<{id: string, shortName: string}>,
    cityName: string
  ): Promise<FavoriteBusResult> {
    try {
      logger.info('Getting live vehicles for favorite routes', {
        favoriteRoutes,
        cityName
      });
      
      // Debug: Log the actual favorite routes structure
      console.log('🔍 DEBUG: Favorite routes received:', favoriteRoutes);
      console.log('🔍 DEBUG: Favorite routes count:', favoriteRoutes.length);
      
      if (favoriteRoutes.length === 0) {
        console.log('⚠️ WARNING: No favorite routes provided - this will show no vehicles');
        return {
          favoriteBuses: [],
          lastUpdate: new Date()
        };
      }
      
      favoriteRoutes.forEach((route, index) => {
        console.log(`🔍 Route ${index}:`, {
          id: route.id,
          shortName: route.shortName,
          idType: typeof route.id,
          parsedId: parseInt(route.id),
          isValidNumber: !isNaN(parseInt(route.id))
        });
      });
      
      const favoriteBuses: FavoriteBusInfo[] = [];
      
      if (favoriteRoutes.length === 0) {
        logger.warn('No favorite routes provided', { cityName });
        return {
          favoriteBuses: [],
          lastUpdate: new Date()
        };
      }

      // Get agency ID for the city
      const agencyId = await agencyService.getAgencyIdForCity(cityName);
      if (!agencyId) {
        logger.warn('No agency found for city', { cityName });
        return {
          favoriteBuses: [],
          lastUpdate: new Date()
        };
      }

      // Get route mappings for display info
      const routeMappings = new Map<string, any>();
      for (const favoriteRoute of favoriteRoutes) {
        const mapping = await routeMappingService.getRouteMappingFromShortName(favoriteRoute.shortName, cityName);
        if (mapping) {
          routeMappings.set(favoriteRoute.id, mapping);
        }
      }

      // Get stations for finding nearest stations to vehicles
      let stations: any[] = [];
      try {
        console.log('🚏 FETCHING stations for nearest station lookup...');
        stations = await enhancedTranzyApi.getStops(agencyId);
        console.log('✅ RETRIEVED stations:', { stationCount: stations.length });
        logger.info('Retrieved stations for nearest station lookup', { stationCount: stations.length });
      } catch (error) {
        console.log('❌ FAILED to get stations:', error);
        logger.error('Failed to get stations for nearest station lookup', { agencyId, error });
        // Continue without station data - will show coordinates instead
      }

      // Get trips data for destination information
      let tripsMap = new Map<string, any>();
      try {
        console.log('🚌 FETCHING trips for destination lookup...');
        const trips = await enhancedTranzyApi.getTrips(agencyId);
        trips.forEach(trip => {
          tripsMap.set(trip.id, trip);
        });
        console.log('✅ RETRIEVED trips:', { tripCount: trips.length });
        logger.info('Retrieved trips for destination lookup', { tripCount: trips.length });
      } catch (error) {
        console.log('❌ FAILED to get trips:', error);
        logger.error('Failed to get trips for destination lookup', { agencyId, error });
        // Continue without trip data - will show direction numbers instead
      }

      // Get stop times for building stop sequences
      let stopTimesMap = new Map<string, any[]>();
      try {
        console.log('🕐 FETCHING stop times for stop sequences...');
        const stopTimes = await enhancedTranzyApi.getStopTimes(agencyId);
        // Group stop times by trip_id
        stopTimes.forEach(stopTime => {
          if (!stopTimesMap.has(stopTime.tripId)) {
            stopTimesMap.set(stopTime.tripId, []);
          }
          stopTimesMap.get(stopTime.tripId)!.push(stopTime);
        });
        // Sort each trip's stop times by sequence
        stopTimesMap.forEach(tripStopTimes => {
          tripStopTimes.sort((a, b) => a.sequence - b.sequence);
        });
        console.log('✅ RETRIEVED stop times:', { tripCount: stopTimesMap.size });
        logger.info('Retrieved stop times for stop sequences', { tripCount: stopTimesMap.size });
      } catch (error) {
        console.log('❌ FAILED to get stop times:', error);
        logger.error('Failed to get stop times for stop sequences', { agencyId, error });
        // Continue without stop times - will not show stop sequences
      }

      // Get live vehicles for each favorite route
      for (const favoriteRoute of favoriteRoutes) {
        const routeShortName = favoriteRoute.shortName;
        const routeId = favoriteRoute.id;
        
        try {
          logger.debug('Getting live vehicles for route', { routeShortName, routeId });
          
          // Validate route ID before making API call
          const parsedRouteId = parseInt(routeId);
          if (isNaN(parsedRouteId)) {
            logger.error('Invalid route ID - cannot parse as integer', { 
              routeShortName, 
              routeId, 
              parsedRouteId 
            });
            console.log('❌ SKIPPING ROUTE: Invalid route ID', { routeShortName, routeId });
            continue; // Skip this route instead of making API call without route_id
          }
          
          console.log('🚌 FETCHING vehicles for route:', { routeShortName, routeId: parsedRouteId });
          
          // Get live vehicles for this route ONLY
          const liveVehiclesRaw = await enhancedTranzyApi.getVehicles(agencyId, parsedRouteId);
          const liveVehicles = Array.isArray(liveVehiclesRaw) ? liveVehiclesRaw : [];
          
          // Double-check: Filter vehicles to ensure they match the requested route AND have active trip_id
          const filteredVehicles = liveVehicles.filter(vehicle => {
            const vehicleRouteId = vehicle.routeId;
            const routeMatches = vehicleRouteId === routeId || vehicleRouteId === parsedRouteId.toString();
            const hasActiveTripId = vehicle.tripId !== null && vehicle.tripId !== undefined;
            
            if (!routeMatches) {
              console.log('⚠️ FILTERING OUT vehicle from wrong route:', {
                vehicleId: vehicle.id,
                vehicleRouteId,
                expectedRouteId: routeId,
                expectedParsedId: parsedRouteId.toString()
              });
            }
            
            if (routeMatches && !hasActiveTripId) {
              console.log('⚠️ FILTERING OUT vehicle without active trip_id:', {
                vehicleId: vehicle.id,
                tripId: vehicle.tripId,
                reason: 'Vehicle not actively traveling (trip_id is null)'
              });
            }
            
            return routeMatches && hasActiveTripId;
          });
          
          console.log('📊 VEHICLE DATA for route:', { 
            routeShortName, 
            routeId, 
            rawVehicleCount: liveVehicles.length,
            filteredVehicleCount: filteredVehicles.length,
            activeVehiclesWithTripId: liveVehicles.filter(v => v.tripId !== null && v.tripId !== undefined).length,
            sampleVehicle: liveVehicles[0] // Log first vehicle for debugging
          });
          
          if (filteredVehicles.length === 0) {
            console.log('⚠️ NO VEHICLES after filtering for route:', { routeShortName, routeId });
            continue;
          }

          // Get route mapping for display info
          const routeMapping = routeMappings.get(routeId);
          
          // Convert each filtered live vehicle to FavoriteBusInfo
          for (const vehicle of filteredVehicles) {
            logger.debug('Processing vehicle', { 
              vehicleId: vehicle.id,
              hasPosition: !!vehicle.position,
              latitude: vehicle.position?.latitude,
              longitude: vehicle.position?.longitude,
              speed: vehicle.speed
            });

            // Find nearest station
            const nearestStation = this.findNearestStation(
              { latitude: vehicle.position.latitude, longitude: vehicle.position.longitude },
              stations
            );
            
            if (nearestStation) {
              console.log('🚏 FOUND nearest station for vehicle:', {
                vehicleId: vehicle.id,
                stationName: nearestStation.name,
                distance: nearestStation.distance
              });
            }

            // Get destination from trip data
            const tripData = tripsMap.get(vehicle.tripId!);
            const destination = tripData?.headsign || undefined;
            const direction = tripData?.direction || undefined;

            // Get stop sequence for this trip
            const tripStopTimes = stopTimesMap.get(vehicle.tripId!) || [];
            const stopSequence = this.buildStopSequence(
              vehicle.tripId!,
              tripStopTimes,
              stations,
              { latitude: vehicle.position.latitude, longitude: vehicle.position.longitude },
              nearestStation,
              stopTimesMap,
              routeId,
              direction
            );

            // Use the actual timestamp from the vehicle data, fallback to current time if not available
            const vehicleTimestamp = vehicle.timestamp instanceof Date 
              ? vehicle.timestamp 
              : (vehicle.timestamp ? new Date(vehicle.timestamp) : new Date());

            const favoriteBus: FavoriteBusInfo = {
              routeShortName,
              routeName: routeMapping?.routeLongName || `Route ${routeShortName}`,
              routeDescription: routeMapping?.routeDescription,
              routeType: routeMapping?.routeType || 'bus',
              vehicleId: vehicle.id,
              tripId: vehicle.tripId!, // We know it's not null due to filtering
              destination,
              latitude: vehicle.position.latitude,
              longitude: vehicle.position.longitude,
              speed: vehicle.speed,
              bearing: vehicle.position.bearing,
              lastUpdate: vehicleTimestamp,
              nearestStation,
              stopSequence,
              direction
            };
            
            logger.debug('Created favorite bus info', {
              vehicleId: favoriteBus.vehicleId,
              latitude: favoriteBus.latitude,
              longitude: favoriteBus.longitude
            });
            
            // Temporary console log for debugging
            console.log('🚌 Vehicle Data:', {
              id: vehicle.id,
              tripId: vehicle.tripId,
              direction: vehicle.tripId?.split('_')[1] || 'unknown',
              position: vehicle.position,
              timestamp: vehicle.timestamp,
              parsedTimestamp: vehicleTimestamp,
              finalCoords: { lat: favoriteBus.latitude, lng: favoriteBus.longitude }
            });
            
            favoriteBuses.push(favoriteBus);
          }
          
          console.log('✅ ADDED vehicles for route:', { 
            routeShortName, 
            routeId, 
            vehicleCount: filteredVehicles.length 
          });
          
        } catch (error) {
          logger.error(`Failed to get live vehicles for route ${routeShortName} (ID: ${routeId})`, { 
            routeShortName,
            routeId, 
            error: error instanceof Error ? error.message : error 
          });
        }
      }
      
      logger.info('Retrieved live vehicles for favorite routes', {
        totalVehicles: favoriteBuses.length,
        routeCount: favoriteRoutes.length
      });
      
      return {
        favoriteBuses,
        lastUpdate: new Date()
      };

    } catch (error) {
      logger.error('Failed to get favorite bus info', error);
      throw error;
    }
  }


}

export const favoriteBusService = new FavoriteBusService();