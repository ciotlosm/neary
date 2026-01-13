/**
 * Station Density Utilities
 * Simple functions for calculating station density centers (replaces StationDensityCalculator class)
 */

import { calculateDistance, type Coordinates } from '../location/distanceUtils';
import type { TranzyStopResponse } from '../../types/rawTranzyApi';

// ============================================================================
// Station Density Functions
// ============================================================================

/**
 * Calculate the geographic center of all stations - replaces StationDensityCalculator class
 */
export function calculateStationDensityCenter(stops: TranzyStopResponse[]): Coordinates {
  if (stops.length === 0) {
    throw new Error('Cannot calculate density center with no stops');
  }

  // Simple centroid calculation
  const totalLat = stops.reduce((sum, stop) => sum + stop.stop_lat, 0);
  const totalLon = stops.reduce((sum, stop) => sum + stop.stop_lon, 0);

  return {
    lat: totalLat / stops.length,
    lon: totalLon / stops.length
  };
}

/**
 * Calculate average distance from center (for metadata/debugging)
 */
export function calculateAverageDistanceFromCenter(
  stops: TranzyStopResponse[], 
  center: Coordinates
): number {
  if (stops.length === 0) return 0;

  const totalDistance = stops.reduce((sum, stop) => {
    return sum + calculateDistance(center, { lat: stop.stop_lat, lon: stop.stop_lon });
  }, 0);

  return totalDistance / stops.length;
}

/**
 * Find stations within a radius of a point
 */
export function findStationsWithinRadius(
  stops: TranzyStopResponse[],
  center: Coordinates,
  radiusMeters: number
): TranzyStopResponse[] {
  return stops.filter(stop => {
    const distance = calculateDistance(center, { lat: stop.stop_lat, lon: stop.stop_lon });
    return distance <= radiusMeters;
  });
}