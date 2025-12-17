/**
 * Debug hook for nearby view troubleshooting
 * Exposes debug function with real app data to browser console
 */

import { useEffect } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { useLocationStore } from '../../stores/locationStore';
import { useStationData } from '../data/useStationData';
import { useVehicleData } from '../data/useVehicleData';
import { useRouteData } from '../data/useRouteData';
import { useStopTimesData } from '../data/useStopTimesData';
import { debugNearbyViewConsole } from '../../utils/nearbyViewDebugger';
import { logger } from '../../utils/logger';

export const useDebugNearbyView = () => {
  const { config } = useConfigStore();
  const { currentLocation } = useLocationStore();
  
  // Get agency ID for data hooks
  const agencyId = config?.agencyId;
  
  // Use the same data hooks as the nearby view controller
  const stationDataResult = useStationData({
    agencyId: agencyId || undefined,
    forceRefresh: false,
    cacheMaxAge: 60000 // 1 minute
  });

  const vehicleDataResult = useVehicleData({
    agencyId: agencyId || undefined,
    forceRefresh: false,
    cacheMaxAge: 30000 // 30 seconds
  });

  const routeDataResult = useRouteData({
    agencyId: agencyId || undefined,
    forceRefresh: false,
    cacheMaxAge: 60000 // 1 minute
  });

  const stopTimesDataResult = useStopTimesData({
    agencyId: agencyId || undefined,
    forceRefresh: false,
    cacheMaxAge: 120000 // 2 minutes
  });

  // Extract data with safe fallbacks
  const stations = stationDataResult.data || [];
  const vehicles = vehicleDataResult.data || [];
  const routes = routeDataResult.data || [];
  const stopTimes = stopTimesDataResult.data || [];
  const trips: any[] = []; // Trips data not currently used in nearby view

  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      // Only set up debug functions if we have basic data structure
      const safeStations = stations || [];
      const safeRoutes = routes || [];
      const safeVehicles = vehicles || [];
      const safeStopTimes = stopTimes || [];
      const safeTrips = trips || [];
      // Create a debug function with current app data
      (window as any).debugNearbyViewWithData = () => {
        if (!currentLocation) {
          console.warn('🔍 No GPS location available. Using Cluj center as fallback.');
          const fallbackLocation = { latitude: 46.7712, longitude: 23.6236 };
          debugNearbyViewConsole(fallbackLocation, safeStations, safeRoutes, safeStopTimes, safeTrips);
          return;
        }

        console.log('🔍 Running nearby view debug with current app data...');
        debugNearbyViewConsole(currentLocation, safeStations, safeRoutes, safeStopTimes, safeTrips);
      };

      // Also expose individual data for manual debugging
      (window as any).debugData = {
        userLocation: currentLocation,
        stations: safeStations,
        routes: safeRoutes,
        vehicles: safeVehicles,
        stopTimes: safeStopTimes,
        trips: safeTrips,
        config
      };

      logger.debug('Debug functions exposed to console', {
        hasLocation: !!currentLocation,
        stationsCount: safeStations.length,
        routesCount: safeRoutes.length,
        vehiclesCount: safeVehicles.length,
        stopTimesCount: safeStopTimes.length,
        tripsCount: safeTrips.length
      }, 'DEBUG');

      console.log('🔍 Debug functions available:');
      console.log('  debugNearbyViewWithData() - Run debug with current app data');
      console.log('  debugData - Access to all current app data');
      console.log('  debugNearbyView(userLocation, stations, routes, stopTimes, trips) - Manual debug');
      console.log(`📊 Current data: ${safeStations.length} stations, ${safeRoutes.length} routes, ${safeVehicles.length} vehicles`);
    }
  }, [currentLocation, stations, routes, vehicles, stopTimes, trips, config]);

  // Use safe variables for consistent data access
  const safeStations = stations || [];
  const safeRoutes = routes || [];
  const safeVehicles = vehicles || [];
  const safeStopTimes = stopTimes || [];
  const safeTrips = trips || [];

  return {
    hasData: safeStations.length > 0 && safeRoutes.length > 0,
    dataStatus: {
      hasLocation: !!currentLocation,
      stationsCount: safeStations.length,
      routesCount: safeRoutes.length,
      vehiclesCount: safeVehicles.length,
      stopTimesCount: safeStopTimes.length,
      tripsCount: safeTrips.length
    }
  };
};