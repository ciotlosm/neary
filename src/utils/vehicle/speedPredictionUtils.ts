/**
 * Speed Prediction Utilities (Simplified)
 * Main interface that combines the split utilities - replaces the 934-line monster file
 */

// Re-export the core functions from the split files
export { 
  predictVehicleSpeed, 
  validateSpeed,
  type SpeedPrediction 
} from './speedCalculationUtils';

export { 
  calculateStationDensityCenter,
  calculateAverageDistanceFromCenter,
  findStationsWithinRadius 
} from './stationDensityUtils';

// Legacy compatibility - provide a simple function-based interface that replaces the SpeedPredictor class
import { predictVehicleSpeed } from './speedCalculationUtils';
import { calculateStationDensityCenter } from './stationDensityUtils';

/**
 * Legacy compatibility function that replaces SpeedPredictor class usage
 * This maintains the same interface but uses simple functions internally
 */
export function createSpeedPredictor() {
  return {
    predictSpeed: predictVehicleSpeed,
    getStationDensityCenter: calculateStationDensityCenter
  };
}

/**
 * Simplified speed prediction result for legacy compatibility
 */
export interface SpeedPredictionResult {
  predictedSpeed: number;
  speedMethod: string;
  speedConfidence: string;
  speedApplied: boolean;
  apiSpeed?: number;
  nearbyVehicleCount?: number;
  nearbyAverageSpeed?: number;
  distanceToCenter?: number;
  locationBasedSpeed?: number;
  speedCalculationTimeMs?: number;
}

/**
 * Convert new SpeedPrediction format to legacy SpeedPredictionResult format
 */
export function convertToLegacyFormat(prediction: import('./speedCalculationUtils').SpeedPrediction): SpeedPredictionResult {
  return {
    predictedSpeed: prediction.speed,
    speedMethod: prediction.method,
    speedConfidence: prediction.confidence,
    speedApplied: prediction.speed > 0,
    apiSpeed: prediction.metadata?.apiSpeed,
    nearbyVehicleCount: prediction.metadata?.nearbyVehicleCount,
    nearbyAverageSpeed: prediction.metadata?.nearbyAverageSpeed,
    distanceToCenter: prediction.metadata?.distanceToCenter,
    locationBasedSpeed: prediction.metadata?.locationBasedSpeed,
    speedCalculationTimeMs: 0 // Not tracked in simplified version
  };
}