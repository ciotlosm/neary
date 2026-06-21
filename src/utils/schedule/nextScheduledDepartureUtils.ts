/**
 * Next scheduled departure at a route's START station.
 *
 * For the "scheduled departure" UI: at a station that is the first stop of a
 * route (in some direction), find the NEXT scheduled departure for that route —
 * today if one remains, otherwise rolling forward to the next service day on
 * which the route's service is active (calendar-aware).
 *
 * Pure functions — no I/O, no store access. The route association comes from a
 * caller-supplied `trip_id → route_id` map (the schedule payload has no route
 * info); build it with `buildTripRouteMap` from scheduleVehicleIntegration.
 */

import type { SchedulePayload } from '../../types/schedule';
import { resolveActiveServices, minutesSinceMidnight } from './activeServiceUtils';

const MINUTES_PER_DAY = 1440;
const DEFAULT_LOOKAHEAD_DAYS = 7;

export interface NextScheduledDeparture {
  tripId: string;
  routeId: number;
  /** Scheduled departure on its service day, minutes since midnight. */
  departureMinutes: number;
  /** Minutes from `now` until that departure (may exceed 1440 for next-day). */
  minutesUntil: number;
  /** 0 = today, 1 = tomorrow, ... */
  dayOffset: number;
}

interface StartCandidate {
  tripId: string;
  /** First-stop departure (minutes since midnight). */
  dep: number;
  serviceId: string;
}

export interface NextScheduledDepartureParams {
  scheduleData: SchedulePayload | null;
  /** trip_id → route_id (from tripStore via buildTripRouteMap). */
  tripRouteMap: Record<string, number>;
  /** The station being viewed. */
  stopId: number;
  /** The route to find the next departure for. */
  routeId: number;
  /** Current time. */
  now: Date;
  /** How many days ahead to roll when nothing remains today (default 7). */
  maxDayLookahead?: number;
}

/** First stop (lowest stop_sequence) of a trip, or null when it has no stops. */
function firstStop(stopTimes: SchedulePayload['stopTimes'][string]) {
  if (!stopTimes || stopTimes.length === 0) return null;
  let first = stopTimes[0];
  for (const st of stopTimes) {
    if (st.q < first.q) first = st;
  }
  return first;
}

/**
 * Collect the trips of `routeId` that START at `stopId` (i.e. their first stop
 * is this station — direction-aware, since only one direction starts here).
 */
function collectStartCandidates(
  scheduleData: SchedulePayload,
  tripRouteMap: Record<string, number>,
  stopId: number,
  routeId: number,
): StartCandidate[] {
  const candidates: StartCandidate[] = [];
  for (const [tripId, stopTimes] of Object.entries(scheduleData.stopTimes)) {
    if (tripRouteMap[tripId] !== routeId) continue;
    const first = firstStop(stopTimes);
    if (!first || first.s !== stopId) continue;
    candidates.push({
      tripId,
      dep: first.d,
      serviceId: scheduleData.tripServiceMap[tripId] ?? '',
    });
  }
  return candidates;
}

/** A `Date` for `now` shifted by whole days (local), at midnight. */
function dateForOffset(now: Date, dayOffset: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, 12, 0, 0);
}

/**
 * Find the next scheduled departure for `routeId` from its start station
 * `stopId`, rolling forward across service days when nothing remains today.
 *
 * @returns The next departure, or `null` when the route does not start at this
 *   stop or no active departure is found within the look-ahead window.
 */
export function getNextScheduledDeparture(
  params: NextScheduledDepartureParams,
): NextScheduledDeparture | null {
  const {
    scheduleData,
    tripRouteMap,
    stopId,
    routeId,
    now,
    maxDayLookahead = DEFAULT_LOOKAHEAD_DAYS,
  } = params;

  if (!scheduleData) return null;

  // Prefer the authoritative trip→route map embedded in the schedule payload
  // (from GTFS trips.txt). Fall back to the caller-supplied map (e.g. from the
  // Tranzy trip store) only when the payload lacks it — note Tranzy's `/trips`
  // is a partial set, so it cannot resolve most scheduled trips.
  const routeMap =
    scheduleData.tripRouteMap && Object.keys(scheduleData.tripRouteMap).length > 0
      ? scheduleData.tripRouteMap
      : tripRouteMap;

  const candidates = collectStartCandidates(scheduleData, routeMap, stopId, routeId);
  if (candidates.length === 0) return null;

  const nowMinutes = minutesSinceMidnight(now);

  for (let dayOffset = 0; dayOffset <= maxDayLookahead; dayOffset++) {
    const active = resolveActiveServices(
      scheduleData.calendar,
      scheduleData.calendarExceptions,
      dateForOffset(now, dayOffset),
    );

    let best: StartCandidate | null = null;
    for (const candidate of candidates) {
      if (!active.has(candidate.serviceId)) continue;
      // Today: skip departures that have already passed.
      if (dayOffset === 0 && candidate.dep < nowMinutes) continue;
      if (best === null || candidate.dep < best.dep) best = candidate;
    }

    if (best) {
      return {
        tripId: best.tripId,
        routeId,
        departureMinutes: best.dep,
        minutesUntil: dayOffset * MINUTES_PER_DAY + best.dep - nowMinutes,
        dayOffset,
      };
    }
  }

  return null;
}

/**
 * Format minutes-until as a short, human label for the ETA bubble: "in 3m",
 * "in 1h 20m", "in 2h", "in 1d 3h". Negative/zero clamps to "now".
 */
export function formatMinutesUntil(minutesUntil: number): string {
  const m = Math.round(minutesUntil);
  if (m <= 0) return 'now';
  if (m < 60) return `in ${m}m`;
  if (m < MINUTES_PER_DAY) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm === 0 ? `in ${h}h` : `in ${h}h ${mm}m`;
  }
  const d = Math.floor(m / MINUTES_PER_DAY);
  const h = Math.floor((m % MINUTES_PER_DAY) / 60);
  return h === 0 ? `in ${d}d` : `in ${d}d ${h}h`;
}
