/**
 * GPS Data Age Calculation Utilities
 * Calculates and categorizes the age of vehicle GPS data for user-facing indicators
 */

import { GPS_DATA_AGE_THRESHOLDS, AUTO_REFRESH_CYCLE } from '../core/constants';

export type DataAgeStatus = 'current' | 'aging' | 'stale';

export interface DataAgeResult {
  status: DataAgeStatus;
  icon: 'green-clock' | 'yellow-warning' | 'red-error';
  gpsAge: number; // milliseconds
  fetchAge: number; // milliseconds
  tip: string;
}

/**
 * Calculate the age and status of vehicle GPS data
 * 
 * Logic:
 * 1. Calculate GPS age: currentTime - vehicleTimestamp
 * 2. Calculate fetch age: currentTime - fetchTimestamp
 * 3. Check if GPS newer than fetch → Red (invalid timestamp)
 * 4. Check if GPS < 2 min → Green (current)
 * 5. Check if GPS > 5 min AND fetch < AUTO_REFRESH_CYCLE → Red (stale GPS, fresh fetch)
 * 6. Otherwise → Yellow (aging)
 * 
 * @param vehicleTimestamp - ISO timestamp string from vehicle GPS
 * @param fetchTimestamp - Unix timestamp (ms) when API data was fetched
 * @param currentTime - Current time in ms (defaults to Date.now())
 * @returns DataAgeResult with status, icon, ages, and contextual tip
 */
export function calculateDataAge(
  vehicleTimestamp: string,
  fetchTimestamp: number,
  currentTime: number = Date.now()
): DataAgeResult {
  // Handle invalid vehicle timestamp
  let vehicleTime: number;
  try {
    vehicleTime = new Date(vehicleTimestamp).getTime();
    
    // Check if timestamp is invalid (NaN) or in the future
    if (isNaN(vehicleTime) || vehicleTime > currentTime) {
      return {
        status: 'stale',
        icon: 'red-error',
        gpsAge: 0,
        fetchAge: currentTime - fetchTimestamp,
        tip: 'Invalid GPS timestamp detected. Vehicle data may be unreliable.',
      };
    }
  } catch (error) {
    return {
      status: 'stale',
      icon: 'red-error',
      gpsAge: 0,
      fetchAge: currentTime - fetchTimestamp,
      tip: 'Unable to parse GPS timestamp. Vehicle data may be unreliable.',
    };
  }

  // Calculate ages
  const gpsAge = currentTime - vehicleTime;
  const fetchAge = currentTime - fetchTimestamp;

  // Check if GPS timestamp is newer than fetch timestamp (invalid state)
  if (vehicleTime > fetchTimestamp) {
    return {
      status: 'stale',
      icon: 'red-error',
      gpsAge,
      fetchAge,
      tip: 'GPS timestamp is newer than API fetch. This indicates a data synchronization issue.',
    };
  }

  // Check if GPS data is current (< 2 minutes old)
  if (gpsAge < GPS_DATA_AGE_THRESHOLDS.CURRENT_THRESHOLD) {
    return {
      status: 'current',
      icon: 'green-clock',
      gpsAge,
      fetchAge,
      tip: 'Vehicle data is fresh and reliable.',
    };
  }

  // Check if GPS data is stale (> 5 minutes) AND fetch is fresh (< AUTO_REFRESH_CYCLE)
  if (gpsAge > GPS_DATA_AGE_THRESHOLDS.STALE_THRESHOLD && fetchAge < AUTO_REFRESH_CYCLE) {
    return {
      status: 'stale',
      icon: 'red-error',
      gpsAge,
      fetchAge,
      tip: 'Vehicle GPS sensor may be broken. Data was recently fetched but GPS timestamp is old.',
    };
  }

  // Otherwise, data is aging - provide context-aware tip
  const tip = fetchAge < AUTO_REFRESH_CYCLE
    ? 'Vehicle data is aging. Data was recently fetched, so refreshing won\'t help right now.'
    : 'Vehicle data is getting old. Try pressing the manual refresh button to get fresh data.';
  
  return {
    status: 'aging',
    icon: 'yellow-warning',
    gpsAge,
    fetchAge,
    tip,
  };
}
