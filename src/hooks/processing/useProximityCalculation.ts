import { useMemo } from 'react';
import type { Coordinates } from '../../types';
import { calculateDistance } from '../../utils/distanceUtils';
import { logger } from '../../utils/logger';

/**
 * Result of proximity calculation
 */
export interface ProximityResult {
  distance: number; // Distance in meters
  withinRadius: boolean; // Whether the distance is within the specified radius
  bearing?: number; // Bearing from 'from' to 'to' in degrees (0-360)
}

/**
 * Hook for calculating distances and bearings between coordinates
 * 
 * This is a pure processing hook that takes two coordinate pairs and calculates
 * the distance and bearing between them. It handles:
 * - Haversine distance calculations between coordinates
 * - Bearing calculations and radius checking
 * - Input validation for coordinate ranges
 * - Safe defaults for invalid inputs
 * 
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @param maxRadius Optional maximum radius in meters for withinRadius check
 * @returns Proximity calculation result with distance, bearing, and radius check
 */
export const useProximityCalculation = (
  from: Coordinates | null,
  to: Coordinates | null,
  maxRadius?: number
): ProximityResult => {
  return useMemo(() => {
    // Input validation - return safe defaults for invalid inputs
    if (!from || typeof from !== 'object') {
      logger.debug('Invalid "from" coordinates provided for proximity calculation', { 
        from 
      }, 'useProximityCalculation');
      
      return {
        distance: Infinity,
        withinRadius: false,
        bearing: undefined
      };
    }

    if (!to || typeof to !== 'object') {
      logger.debug('Invalid "to" coordinates provided for proximity calculation', { 
        to 
      }, 'useProximityCalculation');
      
      return {
        distance: Infinity,
        withinRadius: false,
        bearing: undefined
      };
    }

    // Validate coordinate values
    if (typeof from.latitude !== 'number' || 
        typeof from.longitude !== 'number' ||
        isNaN(from.latitude) || 
        isNaN(from.longitude) ||
        Math.abs(from.latitude) > 90 ||
        Math.abs(from.longitude) > 180) {
      
      logger.debug('Invalid "from" coordinate values for proximity calculation', {
        from,
        latitudeValid: typeof from.latitude === 'number' && !isNaN(from.latitude) && Math.abs(from.latitude) <= 90,
        longitudeValid: typeof from.longitude === 'number' && !isNaN(from.longitude) && Math.abs(from.longitude) <= 180
      }, 'useProximityCalculation');
      
      return {
        distance: Infinity,
        withinRadius: false,
        bearing: undefined
      };
    }

    if (typeof to.latitude !== 'number' || 
        typeof to.longitude !== 'number' ||
        isNaN(to.latitude) || 
        isNaN(to.longitude) ||
        Math.abs(to.latitude) > 90 ||
        Math.abs(to.longitude) > 180) {
      
      logger.debug('Invalid "to" coordinate values for proximity calculation', {
        to,
        latitudeValid: typeof to.latitude === 'number' && !isNaN(to.latitude) && Math.abs(to.latitude) <= 90,
        longitudeValid: typeof to.longitude === 'number' && !isNaN(to.longitude) && Math.abs(to.longitude) <= 180
      }, 'useProximityCalculation');
      
      return {
        distance: Infinity,
        withinRadius: false,
        bearing: undefined
      };
    }

    try {
      // Calculate distance using the haversine formula
      const distance = calculateDistance(from, to);

      // Calculate bearing from 'from' to 'to'
      const bearing = calculateBearing(from, to);

      // Check if within radius
      const withinRadius = maxRadius !== undefined ? distance <= maxRadius : true;

      const result: ProximityResult = {
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        withinRadius,
        bearing: bearing !== undefined ? Math.min(Math.round(bearing * 100) / 100, 359.99) : undefined
      };

      logger.debug('Proximity calculation completed', {
        from,
        to,
        result,
        maxRadius
      }, 'useProximityCalculation');

      return result;

    } catch (error) {
      logger.warn('Proximity calculation failed', {
        from,
        to,
        maxRadius,
        error: error instanceof Error ? error.message : String(error)
      }, 'useProximityCalculation');

      return {
        distance: Infinity,
        withinRadius: false,
        bearing: undefined
      };
    }
  }, [from, to, maxRadius]);
};

/**
 * Calculate bearing from one coordinate to another using the forward azimuth formula
 * 
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @returns Bearing in degrees (0-360) or undefined if calculation fails
 */
function calculateBearing(from: Coordinates, to: Coordinates): number | undefined {
  try {
    // Convert degrees to radians
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    // Calculate bearing using the forward azimuth formula
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    // Calculate initial bearing in radians
    const bearingRad = Math.atan2(y, x);

    // Convert to degrees and normalize to 0-360 range
    let bearingDeg = (bearingRad * 180) / Math.PI;
    bearingDeg = (bearingDeg + 360) % 360;

    // Ensure bearing is never exactly 360 (should be 0 instead)
    if (bearingDeg >= 360) {
      bearingDeg = 0;
    }

    return bearingDeg;
  } catch (error) {
    logger.debug('Bearing calculation failed', {
      from,
      to,
      error: error instanceof Error ? error.message : String(error)
    }, 'useProximityCalculation');
    
    return undefined;
  }
}