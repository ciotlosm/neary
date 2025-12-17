import { useMemo } from 'react';
import type { LiveVehicle, Station, StopTime } from '../../types';
import { calculateDistance } from '../../utils/distanceUtils';
import { logger } from '../../utils/logger';

/**
 * Direction status for a vehicle relative to a station
 */
export type DirectionStatus = 'arriving' | 'departing' | 'unknown';

/**
 * Confidence level for direction analysis
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Result of direction analysis
 */
export interface DirectionAnalysisResult {
  direction: DirectionStatus;
  estimatedMinutes: number;
  confidence: ConfidenceLevel;
  stopSequence?: Array<{
    stopId: string;
    stopName: string;
    sequence: number;
    isCurrent: boolean;
    isDestination: boolean;
    estimatedArrival?: Date;
  }>;
}

/**
 * Hook for analyzing vehicle direction and arrival/departure status
 * 
 * This is a pure processing hook that takes a vehicle, target station, and stop times
 * and determines whether the vehicle is arriving at or departing from the station.
 * It handles:
 * - Arrival/departure analysis using stop sequence data
 * - Confidence scoring based on data quality
 * - Estimated arrival time calculations
 * - Input validation and safe defaults
 * 
 * @param vehicle Live vehicle to analyze
 * @param targetStation Station to analyze direction relative to
 * @param stopTimes Stop times data for the vehicle's trip
 * @returns Direction analysis result with confidence scoring
 */
export const useDirectionAnalysis = (
  vehicle: LiveVehicle | null,
  targetStation: Station | null,
  stopTimes: StopTime[]
): DirectionAnalysisResult => {
  return useMemo(() => {
    // Input validation - return safe defaults for invalid inputs
    if (!vehicle || typeof vehicle !== 'object') {
      logger.debug('Invalid vehicle provided for direction analysis', { 
        vehicle 
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    if (!targetStation || typeof targetStation !== 'object') {
      logger.debug('Invalid target station provided for direction analysis', { 
        targetStation 
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    if (!Array.isArray(stopTimes)) {
      logger.debug('Invalid stop times provided for direction analysis', { 
        stopTimesType: typeof stopTimes 
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    // Validate vehicle data
    if (!vehicle.id || !vehicle.tripId || !vehicle.position ||
        typeof vehicle.position.latitude !== 'number' ||
        typeof vehicle.position.longitude !== 'number' ||
        isNaN(vehicle.position.latitude) ||
        isNaN(vehicle.position.longitude)) {
      
      logger.debug('Vehicle missing required data for direction analysis', {
        vehicleId: vehicle.id,
        hasTripId: !!vehicle.tripId,
        hasPosition: !!vehicle.position,
        positionValid: vehicle.position && 
          typeof vehicle.position.latitude === 'number' && 
          typeof vehicle.position.longitude === 'number'
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    // Validate target station data
    if (!targetStation.id || !targetStation.coordinates ||
        typeof targetStation.coordinates.latitude !== 'number' ||
        typeof targetStation.coordinates.longitude !== 'number' ||
        isNaN(targetStation.coordinates.latitude) ||
        isNaN(targetStation.coordinates.longitude)) {
      
      logger.debug('Target station missing required data for direction analysis', {
        stationId: targetStation.id,
        hasCoordinates: !!targetStation.coordinates,
        coordinatesValid: targetStation.coordinates &&
          typeof targetStation.coordinates.latitude === 'number' &&
          typeof targetStation.coordinates.longitude === 'number'
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    // Filter stop times for this vehicle's trip
    const tripStopTimes = stopTimes.filter(stopTime => 
      stopTime && 
      stopTime.tripId === vehicle.tripId &&
      stopTime.stopId &&
      typeof stopTime.sequence === 'number' &&
      !isNaN(stopTime.sequence)
    );

    if (tripStopTimes.length === 0) {
      logger.debug('No valid stop times found for vehicle trip', {
        vehicleId: vehicle.id,
        tripId: vehicle.tripId,
        totalStopTimes: stopTimes.length
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    // Sort stop times by sequence
    const sortedStopTimes = tripStopTimes.sort((a, b) => a.sequence - b.sequence);

    // Find the target station in the trip's stop sequence
    const targetStopTime = sortedStopTimes.find(stopTime => stopTime.stopId === targetStation.id);
    
    if (!targetStopTime) {
      logger.debug('Target station not found in vehicle trip', {
        vehicleId: vehicle.id,
        tripId: vehicle.tripId,
        targetStationId: targetStation.id,
        tripStops: sortedStopTimes.map(st => st.stopId)
      }, 'useDirectionAnalysis');
      
      return {
        direction: 'unknown',
        estimatedMinutes: 0,
        confidence: 'low'
      };
    }

    const targetSequence = targetStopTime.sequence;

    // Find the vehicle's current position in the stop sequence
    // We'll determine this by finding the closest stop to the vehicle's GPS position
    let closestStopDistance = Infinity;
    let closestStopSequence = 0;
    let currentStopTime: StopTime | null = null;

    // We need station data to calculate distances, but we don't have it directly
    // For now, we'll use a simplified approach based on sequence position
    // In a real implementation, this would need access to all station coordinates

    // Simplified approach: assume the vehicle is progressing through the sequence
    // and estimate position based on time if available
    const now = new Date();
    const vehicleTimestamp = vehicle.timestamp instanceof Date ? vehicle.timestamp : new Date(vehicle.timestamp);
    
    // Calculate time since last vehicle update (in minutes)
    const minutesSinceUpdate = Math.max(0, (now.getTime() - vehicleTimestamp.getTime()) / (1000 * 60));

    // If we have arrival times, use them for better analysis
    let estimatedCurrentSequence = 0;
    let confidence: ConfidenceLevel = 'low';

    if (targetStopTime.arrivalTime && typeof targetStopTime.arrivalTime === 'string') {
      try {
        // Parse arrival time (HH:MM:SS format)
        const [hours, minutes, seconds] = targetStopTime.arrivalTime.split(':').map(Number);
        const scheduledArrival = new Date();
        scheduledArrival.setHours(hours, minutes, seconds || 0, 0);

        // Calculate time difference
        const timeDiffMinutes = (scheduledArrival.getTime() - now.getTime()) / (1000 * 60);

        if (timeDiffMinutes > 0) {
          // Vehicle should arrive in the future
          estimatedCurrentSequence = Math.max(0, targetSequence - Math.ceil(timeDiffMinutes / 2)); // Assume 2 minutes per stop
          confidence = 'medium';
        } else if (timeDiffMinutes > -10) {
          // Vehicle should have arrived recently (within 10 minutes)
          estimatedCurrentSequence = targetSequence;
          confidence = 'medium';
        } else {
          // Vehicle is likely past this stop
          estimatedCurrentSequence = targetSequence + Math.ceil(Math.abs(timeDiffMinutes) / 2);
          confidence = 'low';
        }
      } catch (error) {
        logger.debug('Failed to parse arrival time', {
          arrivalTime: targetStopTime.arrivalTime,
          error: error instanceof Error ? error.message : String(error)
        }, 'useDirectionAnalysis');
        
        // Fallback to sequence-based estimation
        estimatedCurrentSequence = Math.floor(sortedStopTimes.length / 2);
        confidence = 'low';
      }
    } else {
      // No time data available, use middle of sequence as estimate
      estimatedCurrentSequence = Math.floor(sortedStopTimes.length / 2);
      confidence = 'low';
    }

    // Determine direction based on sequence comparison
    let direction: DirectionStatus = 'unknown';
    let estimatedMinutes = 0;

    if (estimatedCurrentSequence < targetSequence) {
      // Vehicle is before the target station → arriving
      direction = 'arriving';
      const remainingStops = targetSequence - estimatedCurrentSequence;
      estimatedMinutes = Math.max(1, remainingStops * 2); // 2 minutes per stop estimate
      
      // Adjust for vehicle age
      estimatedMinutes = Math.max(1, estimatedMinutes - minutesSinceUpdate);
      
      if (confidence === 'medium' && remainingStops <= 3) {
        confidence = 'high'; // High confidence for nearby arrivals with time data
      }
    } else if (estimatedCurrentSequence > targetSequence) {
      // Vehicle is after the target station → departing
      direction = 'departing';
      const stopsSinceDeparture = estimatedCurrentSequence - targetSequence;
      estimatedMinutes = stopsSinceDeparture * 2; // Time since departure
      
      // Departing vehicles have lower confidence unless very recent
      if (stopsSinceDeparture <= 2 && confidence === 'medium') {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }
    } else {
      // Vehicle is at or very near the target station
      direction = 'arriving';
      estimatedMinutes = 0; // At station
      
      if (confidence === 'medium') {
        confidence = 'high'; // High confidence when at station with time data
      }
    }

    // Build stop sequence information if we have enough data
    let stopSequence: DirectionAnalysisResult['stopSequence'] = undefined;
    
    if (sortedStopTimes.length > 1) {
      stopSequence = sortedStopTimes.map((stopTime, index) => {
        const isCurrent = stopTime.sequence === estimatedCurrentSequence;
        const isDestination = index === sortedStopTimes.length - 1;
        
        // Estimate arrival time for each stop
        let estimatedArrival: Date | undefined;
        if (stopTime.arrivalTime) {
          try {
            const [hours, minutes, seconds] = stopTime.arrivalTime.split(':').map(Number);
            estimatedArrival = new Date();
            estimatedArrival.setHours(hours, minutes, seconds || 0, 0);
          } catch (error) {
            // Ignore parsing errors
          }
        }

        return {
          stopId: stopTime.stopId,
          stopName: `Stop ${stopTime.stopId}`, // Would need station data for actual names
          sequence: stopTime.sequence,
          isCurrent,
          isDestination,
          estimatedArrival
        };
      });
    }

    const result: DirectionAnalysisResult = {
      direction,
      estimatedMinutes: Math.round(estimatedMinutes),
      confidence,
      stopSequence
    };

    logger.debug('Direction analysis completed', {
      vehicleId: vehicle.id,
      tripId: vehicle.tripId,
      targetStationId: targetStation.id,
      result: {
        direction: result.direction,
        estimatedMinutes: result.estimatedMinutes,
        confidence: result.confidence
      },
      analysis: {
        targetSequence,
        estimatedCurrentSequence,
        totalStops: sortedStopTimes.length,
        hasTimeData: !!targetStopTime.arrivalTime
      }
    }, 'useDirectionAnalysis');

    return result;
  }, [vehicle, targetStation, stopTimes]);
};