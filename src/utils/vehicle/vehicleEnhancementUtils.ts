/**
 * Vehicle Enhancement Utilities (Simplified)
 * Consolidates 6 enhancement functions into 2 simple ones
 */

import { predictVehiclePosition } from './positionPredictionUtils';
import { predictVehicleSpeed } from './speedCalculationUtils';
import { calculateStationDensityCenter } from './stationDensityUtils';
import type { 
  TranzyVehicleResponse, 
  TranzyStopResponse, 
  TranzyStopTimeResponse,
  RouteShape 
} from '../../types/arrivalTime';
import type { Coordinates } from '../location/distanceUtils';

// ============================================================================
// Enhanced Vehicle Data Interface (Simplified)
// ============================================================================

export interface EnhancedVehicleData extends TranzyVehicleResponse {
  // Override coordinates with predicted values
  latitude: number;  // Predicted latitude (or original if no prediction)
  longitude: number; // Predicted longitude (or original if no prediction)
  
  // Original API coordinates preserved for debugging
  apiLatitude: number;
  apiLongitude: number;
  
  // Simplified prediction metadata
  predictionMetadata?: {
    // Position prediction
    predictedDistance: number;
    stationsEncountered: number;
    totalDwellTime: number;
    positionMethod: 'route_shape' | 'fallback';
    positionApplied: boolean;
    timestampAge: number;
    
    // Speed prediction (optional)
    predictedSpeed?: number;
    speedMethod?: string;
    speedConfidence?: string;
    speedApplied?: boolean;
  };
}

// ============================================================================
// Enhancement Options Interface
// ============================================================================

export interface EnhancementOptions {
  // Position prediction options
  routeShape?: RouteShape;
  stopTimes?: TranzyStopTimeResponse[];
  stops?: TranzyStopResponse[];
  
  // Speed prediction options
  includeSpeed?: boolean;
  nearbyVehicles?: TranzyVehicleResponse[];
  stationDensityCenter?: Coordinates;
}

// ============================================================================
// Consolidated Enhancement Functions (2 instead of 6)
// ============================================================================

/**
 * Enhance a single vehicle with predictions
 * Replaces: enhanceVehicleWithPrediction, enhanceVehicleWithSpeedPrediction, enhanceVehicleWithFullPrediction
 */
export function enhanceVehicle(
  vehicle: TranzyVehicleResponse,
  options: EnhancementOptions = {}
): EnhancedVehicleData {
  // Preserve original API coordinates
  const apiLatitude = vehicle.latitude;
  const apiLongitude = vehicle.longitude;
  
  // 1. Apply position prediction
  const positionResult = predictVehiclePosition(
    vehicle,
    options.routeShape,
    options.stopTimes,
    options.stops
  );
  
  // Create base enhanced vehicle
  const enhancedVehicle: EnhancedVehicleData = {
    ...vehicle,
    apiLatitude,
    apiLongitude,
    latitude: positionResult.predictedPosition.lat,
    longitude: positionResult.predictedPosition.lon,
    predictionMetadata: {
      predictedDistance: positionResult.metadata.predictedDistance,
      stationsEncountered: positionResult.metadata.stationsEncountered,
      totalDwellTime: positionResult.metadata.totalDwellTime,
      positionMethod: positionResult.metadata.method,
      positionApplied: positionResult.metadata.success,
      timestampAge: positionResult.metadata.timestampAge
    }
  };
  
  // 2. Apply speed prediction if requested
  if (options.includeSpeed && options.nearbyVehicles && options.stationDensityCenter) {
    const speedResult = predictVehicleSpeed(
      vehicle,
      options.nearbyVehicles,
      options.stationDensityCenter
    );
    
    // Add speed prediction to metadata
    enhancedVehicle.predictionMetadata = {
      ...enhancedVehicle.predictionMetadata!,
      predictedSpeed: speedResult.speed,
      speedMethod: speedResult.method,
      speedConfidence: speedResult.confidence,
      speedApplied: true
    };
  }
  
  return enhancedVehicle;
}

/**
 * Enhance multiple vehicles with predictions
 * Replaces: enhanceVehiclesWithPredictions, enhanceVehiclesWithSpeedPredictions, enhanceVehiclesWithFullPredictions
 */
export function enhanceVehicles(
  vehicles: TranzyVehicleResponse[],
  options: {
    routeShapes?: Map<string, RouteShape>;
    stopTimesByTrip?: Map<string, TranzyStopTimeResponse[]>;
    stops?: TranzyStopResponse[];
    includeSpeed?: boolean;
  } = {}
): EnhancedVehicleData[] {
  // Calculate station density center once if speed prediction is enabled
  let stationDensityCenter: Coordinates | undefined;
  if (options.includeSpeed && options.stops) {
    stationDensityCenter = calculateStationDensityCenter(options.stops);
  }
  
  return vehicles.map(vehicle => {
    // Get route shape for this vehicle
    let routeShape: RouteShape | undefined;
    if (options.routeShapes && vehicle.trip_id) {
      routeShape = options.routeShapes.get(vehicle.trip_id) || 
                   (vehicle.route_id ? options.routeShapes.get(vehicle.route_id.toString()) : undefined);
    }
    
    // Get stop times for this vehicle
    let stopTimes: TranzyStopTimeResponse[] | undefined;
    if (options.stopTimesByTrip && vehicle.trip_id) {
      stopTimes = options.stopTimesByTrip.get(vehicle.trip_id);
    }
    
    // Build enhancement options
    const enhancementOptions: EnhancementOptions = {
      routeShape,
      stopTimes,
      stops: options.stops,
      includeSpeed: options.includeSpeed,
      nearbyVehicles: options.includeSpeed ? vehicles : undefined,
      stationDensityCenter
    };
    
    return enhanceVehicle(vehicle, enhancementOptions);
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a vehicle has prediction applied
 */
export function hasPredictionApplied(vehicle: EnhancedVehicleData): boolean {
  return vehicle.predictionMetadata?.positionApplied === true;
}

/**
 * Get original API coordinates from enhanced vehicle
 */
export function getOriginalCoordinates(vehicle: EnhancedVehicleData): { lat: number; lon: number } {
  return {
    lat: vehicle.apiLatitude,
    lon: vehicle.apiLongitude
  };
}

/**
 * Get prediction summary for debugging
 */
export function getPredictionSummary(vehicles: EnhancedVehicleData[]): {
  totalVehicles: number;
  positionPredictionsApplied: number;
  speedPredictionsApplied: number;
  averageTimestampAge: number;
  averagePredictedDistance: number;
} {
  const totalVehicles = vehicles.length;
  let positionPredictionsApplied = 0;
  let speedPredictionsApplied = 0;
  let totalTimestampAge = 0;
  let totalPredictedDistance = 0;
  
  for (const vehicle of vehicles) {
    if (vehicle.predictionMetadata) {
      const { positionApplied, speedApplied, timestampAge, predictedDistance } = vehicle.predictionMetadata;
      
      if (positionApplied) {
        positionPredictionsApplied++;
        totalPredictedDistance += predictedDistance;
      }
      
      if (speedApplied) {
        speedPredictionsApplied++;
      }
      
      totalTimestampAge += timestampAge;
    }
  }
  
  return {
    totalVehicles,
    positionPredictionsApplied,
    speedPredictionsApplied,
    averageTimestampAge: totalVehicles > 0 ? totalTimestampAge / totalVehicles : 0,
    averagePredictedDistance: positionPredictionsApplied > 0 ? totalPredictedDistance / positionPredictionsApplied : 0
  };
}