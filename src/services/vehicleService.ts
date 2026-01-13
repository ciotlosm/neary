// VehicleService - Domain-focused service for vehicle tracking
// Applies position predictions at service layer before returning data
// Integrated with status tracking and position prediction

import axios from 'axios';
import type { TranzyVehicleResponse } from '../types/rawTranzyApi.ts';
import type { EnhancedVehicleData } from '../utils/vehicle/vehicleEnhancementUtils.ts';
import { enhanceVehicles } from '../utils/vehicle/vehicleEnhancementUtils.ts';
import { calculateStationDensityCenter } from '../utils/vehicle/stationDensityUtils.ts';
import { handleApiError, apiStatusTracker } from './error';
import { getApiConfig } from '../context/appContext';
import { API_CONFIG, SpeedPredictionConfigValidator } from '../utils/core/constants';

export const vehicleService = {
  /**
   * Get vehicles with position predictions applied (primary method)
   * Enhancement happens at service layer before returning to consumers
   * Uses proper store architecture with caching
   */
  async getVehicles(): Promise<EnhancedVehicleData[]> {
    try {
      // Get raw vehicle data from API
      const rawVehicles = await this.getRawVehicles();
      
      // Load additional data through stores (respects caching and prevents duplicate requests)
      const { useTripStore } = await import('../stores/tripStore');
      const { useStationStore } = await import('../stores/stationStore');
      const { useShapeStore } = await import('../stores/shapeStore');
      const { useStopTimeStore } = await import('../stores/stopTimeStore');

      // Load data through stores in parallel - stores handle caching and deduplication
      await Promise.all([
        useTripStore.getState().loadTrips(),
        useStationStore.getState().loadStops(), 
        useShapeStore.getState().loadShapes(),
        useStopTimeStore.getState().loadStopTimes()
      ]);

      // Get cached data from stores
      const trips = useTripStore.getState().trips;
      const stops = useStationStore.getState().stops;
      const shapes = useShapeStore.getState().shapes;
      const stopTimes = useStopTimeStore.getState().stopTimes;

      // Build route shapes mapping from cached store data
      const routeShapes = this.buildRouteShapesFromStoreData(rawVehicles, trips, shapes);
      
      // Build stop times mapping from cached store data
      const stopTimesByTrip = this.buildStopTimesMappingFromStoreData(stopTimes);
      
      console.log(`[VehicleService] Enhancement data from stores: routeShapes=${routeShapes?.size || 0}, stopTimesByTrip=${stopTimesByTrip?.size || 0}, stops=${stops?.length || 0}`);
      
      // Apply position predictions at service layer
      const vehiclesWithPositionPredictions = enhanceVehicles(rawVehicles, {
        routeShapes,
        stopTimesByTrip,
        stops,
        includeSpeed: false
      });
      
      // Apply speed predictions after position predictions (Requirements 8.1, 8.2)
      try {
        const vehiclesWithSpeedPredictions = await this.applySpeedPredictions(vehiclesWithPositionPredictions, stops);
        console.log(`[VehicleService] Speed predictions applied to ${vehiclesWithSpeedPredictions.length} vehicles`);
        return vehiclesWithSpeedPredictions;
      } catch (speedError) {
        // Graceful fallback to position-only predictions (Requirements 8.3, 8.4)
        console.warn('Speed prediction failed, continuing with position-only predictions:', speedError);
        return vehiclesWithPositionPredictions;
      }
    } catch (error) {
      // If enhancement fails, fall back to raw vehicles without predictions
      console.warn('Failed to enhance vehicles with predictions, falling back to raw data:', error);
      const rawVehicles = await this.getRawVehicles();
      
      // Convert to enhanced format without predictions for consistency
      return rawVehicles.map(vehicle => ({
        ...vehicle,
        apiLatitude: vehicle.latitude,
        apiLongitude: vehicle.longitude,
        predictionMetadata: {
          predictedDistance: 0,
          stationsEncountered: 0,
          totalDwellTime: 0,
          positionMethod: 'fallback' as const,
          positionApplied: false,
          timestampAge: 0
        }
      }));
    }
  },

  /**
   * Get raw vehicles from API (internal method)
   * Use this only for debugging or when you specifically need original API data
   */
  async getRawVehicles(): Promise<TranzyVehicleResponse[]> {
    const startTime = Date.now();
    try {
      // Get API credentials from app context
      const { apiKey, agencyId } = getApiConfig();

      const response = await axios.get(`${API_CONFIG.BASE_URL}/vehicles`, {
        headers: {
          'X-API-Key': apiKey,
          'X-Agency-Id': agencyId.toString()
        }
      });
      
      // Validate response is JSON array, not HTML error page
      if (!Array.isArray(response.data)) {
        console.error('API returned non-array response:', typeof response.data, response.data);
        throw new Error('API returned invalid data format (expected array, got ' + typeof response.data + ')');
      }
      
      // Record successful API call
      const responseTime = Date.now() - startTime;
      apiStatusTracker.recordSuccess('fetch vehicles', responseTime);
      
      // Update status store if available
      if (typeof window !== 'undefined') {
        const { useStatusStore } = await import('../stores/statusStore');
        useStatusStore.getState().updateFromApiCall(true, responseTime, 'fetch vehicles');
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetch vehicles');
    }
  },

  /**
   * Get enhanced vehicles with position predictions applied
   * @deprecated Use getVehicles() instead - it now returns enhanced vehicles by default
   */
  async getEnhancedVehicles(): Promise<EnhancedVehicleData[]> {
    return this.getVehicles();
  },

  /**
   * Apply speed predictions to vehicles with position predictions already applied
   * Implements performance requirements (8.1, 8.2) and error handling (8.3, 8.4, 8.5)
   * @param vehicles Vehicles with position predictions applied
   * @param stops Array of transit stops for station density calculation
   * @returns Vehicles with both position and speed predictions applied
   */
  async applySpeedPredictions(
    vehicles: EnhancedVehicleData[],
    stops: any[]
  ): Promise<EnhancedVehicleData[]> {
    const startTime = performance.now();
    
    try {
      // Validate configuration at runtime (Requirements 8.5)
      if (!SpeedPredictionConfigValidator.validateAllParameters()) {
        console.warn('Speed prediction configuration validation failed, skipping speed predictions');
        return vehicles;
      }
      
      // Skip speed predictions if no vehicles or stops available
      if (vehicles.length === 0 || stops.length === 0) {
        console.log('[VehicleService] Skipping speed predictions: no vehicles or stops available');
        return vehicles;
      }
      
      // Calculate station density center for location-based speed estimation
      const stationDensityCenter = calculateStationDensityCenter(stops);
      
      console.log(`[VehicleService] Applying speed predictions to ${vehicles.length} vehicles using station density center:`, stationDensityCenter);
      
      // Apply speed predictions with performance monitoring (Requirements 8.1, 8.2)
      const enhancedVehicles = enhanceVehicles(vehicles, {
        stops,
        includeSpeed: true
      });
      
      // Performance monitoring and logging (Requirements 8.1, 8.2)
      const calculationTime = performance.now() - startTime;
      console.log(`[VehicleService] Speed predictions completed in ${calculationTime.toFixed(2)}ms for ${vehicles.length} vehicles`);
      
      // Log performance warning if calculation takes too long (Requirements 8.1)
      if (calculationTime > 100) { // Warning threshold higher than individual calculation timeout
        console.warn(`[VehicleService] Speed prediction calculation took ${calculationTime.toFixed(2)}ms, consider optimization`);
      }
      
      return enhancedVehicles;
    } catch (error) {
      // Graceful error handling with detailed logging (Requirements 8.3, 8.4, 8.5)
      const calculationTime = performance.now() - startTime;
      console.error('[VehicleService] Speed prediction error:', {
        error: error instanceof Error ? error.message : String(error),
        vehicleCount: vehicles.length,
        stopCount: stops.length,
        calculationTimeMs: calculationTime,
        timestamp: new Date().toISOString()
      });
      
      // Return vehicles without speed predictions (graceful degradation)
      return vehicles;
    }
  },

  /**
   * Helper methods to build data structures from store data
   */
  buildRouteShapesFromStoreData(vehicles: TranzyVehicleResponse[], trips: any[], shapes: Map<string, any>): Map<string, any> | undefined {
    try {
      if (trips.length === 0 || shapes.size === 0) {
        return undefined;
      }

      // Create a mapping from trip_id to route shape for easier lookup
      const routeShapesByTripId = new Map<string, any>();
      
      for (const vehicle of vehicles) {
        if (vehicle.trip_id) {
          // Find the trip for this vehicle
          const trip = trips.find(t => t.trip_id === vehicle.trip_id);
          if (trip && trip.shape_id) {
            // Get the route shape for this trip's shape_id from store
            const routeShape = shapes.get(trip.shape_id);
            if (routeShape) {
              routeShapesByTripId.set(vehicle.trip_id, routeShape);
            }
          }
        }
      }
      
      return routeShapesByTripId;
    } catch (error) {
      console.warn('Route shapes not available for predictions:', error);
      return undefined;
    }
  },

  buildStopTimesMappingFromStoreData(stopTimes: any[]): Map<string, any> | undefined {
    try {
      if (stopTimes.length === 0) {
        return undefined;
      }

      // Group stop times by trip_id for efficient lookup
      const stopTimesByTrip = new Map();
      for (const stopTime of stopTimes) {
        if (!stopTimesByTrip.has(stopTime.trip_id)) {
          stopTimesByTrip.set(stopTime.trip_id, []);
        }
        stopTimesByTrip.get(stopTime.trip_id).push(stopTime);
      }
      
      return stopTimesByTrip;
    } catch (error) {
      console.warn('Stop times not available for predictions:', error);
      return undefined;
    }
  }
};