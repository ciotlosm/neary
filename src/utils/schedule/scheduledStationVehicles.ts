/**
 * Synthesize SCHEDULED departures as station vehicles (Req 6, 12).
 *
 * This is the unifying seam that lets a scheduled trip render through the SAME
 * machinery as a live GPS vehicle (full vehicle card, map button, station
 * inclusion, departed-dedup) instead of a bespoke slim row. For each station
 * we build synthetic {@link StationVehicle}s for the scheduled trips that serve
 * it, in one of two phases:
 *
 *   - **Future** (trip not yet departed): shown ONLY at the trip's start
 *     station, positioned at that station's GPS coordinates with speed 0
 *     ("departs in X min"). enhanceVehicle's at-station detection yields speed 0
 *     naturally, so no special-casing is needed.
 *   - **Ghost** (scheduled departure passed, no live GPS): shown at the trip's
 *     not-yet-passed stations as a moving vehicle. Position is interpolated
 *     between the surrounding scheduled stops by elapsed time; speed is the
 *     average prediction produced by the normal `enhanceVehicle` flow (with
 *     forward prediction suppressed so it stays at the interpolated point), and
 *     GPS freshness is pegged to the last departed stop's scheduled time.
 *
 * A trip that has a live GPS vehicle is never synthesized (GPS wins, Req 7.4).
 * Everything degrades gracefully: no schedule data -> no synthetic vehicles.
 */

import type { SchedulePayload, ScheduleStopTime } from '../../types/schedule';
import type {
  TranzyStopResponse,
  TranzyRouteResponse,
  TranzyTripResponse,
  TranzyVehicleResponse,
} from '../../types/rawTranzyApi';
import type { StationVehicle } from '../../types/stationFilter';
import {
  enhanceVehicle,
  type EnhancedVehicleData,
} from '../vehicle/vehicleEnhancementUtils';
import { calculateStationDensityCenter } from '../vehicle/stationDensityUtils';
import { minutesSinceMidnight } from './activeServiceUtils';

/** Default look-ahead window for scheduled departures/arrivals, in minutes. */
const DEFAULT_WINDOW_MINUTES = 90;

/** stop_id -> the trips serving it, with that stop's stop-time entry. */
export type ScheduleStopIndex = Map<
  number,
  Array<{ tripId: string; entry: ScheduleStopTime }>
>;

// Memoize the (expensive) inverted index on the schedule payload reference.
// The payload only changes on a daily refresh, so this is rebuilt rarely even
// though the station filter re-runs every ~15s.
let cachedIndex: { source: SchedulePayload; index: ScheduleStopIndex } | null = null;

/**
 * Build (and cache) an inverted index mapping each stop_id to the trips that
 * serve it. One pass over all trips' stop times.
 */
export function buildScheduleStopIndex(scheduleData: SchedulePayload): ScheduleStopIndex {
  if (cachedIndex && cachedIndex.source === scheduleData) {
    return cachedIndex.index;
  }
  const index: ScheduleStopIndex = new Map();
  for (const [tripId, stopTimes] of Object.entries(scheduleData.stopTimes)) {
    for (const entry of stopTimes) {
      let arr = index.get(entry.s);
      if (!arr) {
        arr = [];
        index.set(entry.s, arr);
      }
      arr.push({ tripId, entry });
    }
  }
  cachedIndex = { source: scheduleData, index };
  return index;
}

/** First (lowest q) and last (highest q) stop times of a trip. */
function tripBounds(
  stopTimes: ScheduleStopTime[],
): { first: ScheduleStopTime; last: ScheduleStopTime } | null {
  if (stopTimes.length === 0) return null;
  let first = stopTimes[0];
  let last = stopTimes[0];
  for (const st of stopTimes) {
    if (st.q < first.q) first = st;
    if (st.q > last.q) last = st;
  }
  return { first, last };
}

/** Stable, collision-resistant negative id for a synthetic vehicle from its trip id. */
function syntheticVehicleId(tripId: string): number {
  let hash = 0;
  for (let i = 0; i < tripId.length; i++) {
    hash = (hash * 31 + tripId.charCodeAt(i)) | 0;
  }
  // Negative space keeps synthetic ids from colliding with real vehicle ids.
  return -Math.abs(hash) - 1;
}

/** Local-day ISO timestamp for a given minutes-since-midnight value. */
function isoAtMinutes(now: Date, minutes: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  d.setMinutes(minutes);
  return d.toISOString();
}

/** Linear interpolation between two coordinates. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate a ghost vehicle's current position between the scheduled stops
 * that surround `nowMin`. Returns the most recently departed stop's scheduled
 * departure minute too (for GPS-freshness pegging).
 */
function interpolateGhostPosition(
  stopTimes: ScheduleStopTime[],
  stopsById: Map<number, TranzyStopResponse>,
  nowMin: number,
): { lat: number; lon: number; lastDepartedMin: number } | null {
  const ordered = [...stopTimes].sort((l, r) => l.q - r.q);
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    // Between a's departure and b's arrival -> on this segment.
    if (a.d <= nowMin && nowMin <= b.a) {
      const sa = stopsById.get(a.s);
      const sb = stopsById.get(b.s);
      if (!sa || !sb) return null;
      const span = b.a - a.d;
      const frac = span > 0 ? (nowMin - a.d) / span : 0;
      return {
        lat: lerp(sa.stop_lat, sb.stop_lat, frac),
        lon: lerp(sa.stop_lon, sb.stop_lon, frac),
        lastDepartedMin: a.d,
      };
    }
  }
  // Dwelling at a stop (between its arrival and departure): use that stop.
  for (const st of ordered) {
    if (st.a <= nowMin && nowMin <= st.d) {
      const s = stopsById.get(st.s);
      if (!s) return null;
      return { lat: s.stop_lat, lon: s.stop_lon, lastDepartedMin: st.d };
    }
  }
  return null;
}

interface Candidate {
  tripId: string;
  routeId: number;
  serviceId: string;
  minutesUntil: number;
  departed: boolean;
  position: { lat: number; lon: number };
  lastKnownMin: number;
  headsign: string;
}

export interface ScheduledVehiclesParams {
  scheduleData: SchedulePayload | null;
  /** trip_id -> route_id (prefer payload.tripRouteMap; fallback Tranzy map). */
  tripRouteMap: Record<string, number>;
  /** Service ids active for the current local date (from scheduleStore). */
  activeServiceIds: Set<string>;
  /** Station stop_ids to compute scheduled vehicles for (the near stations). */
  stopIds: number[];
  stops: TranzyStopResponse[];
  routes: TranzyRouteResponse[];
  /** Tranzy trips, used to find a representative shape_id/direction per route. */
  tranzyTrips: TranzyTripResponse[];
  /** Trip ids that already have a live GPS vehicle (GPS wins, Req 7.4). */
  gpsVehicleTripIds: Set<string>;
  /** Live vehicles, used for ghost speed averaging (same as real predictions). */
  realVehicles: EnhancedVehicleData[];
  now?: Date;
  windowMinutes?: number;
}

/**
 * Build synthetic scheduled {@link StationVehicle}s keyed by stop_id for the
 * requested stations. Returns an empty map when schedule data is unavailable.
 */
export function buildScheduledStationVehicles(
  params: ScheduledVehiclesParams,
): Map<number, StationVehicle[]> {
  const result = new Map<number, StationVehicle[]>();
  const {
    scheduleData,
    tripRouteMap,
    activeServiceIds,
    stopIds,
    stops,
    routes,
    tranzyTrips,
    gpsVehicleTripIds,
    realVehicles,
    now = new Date(),
    windowMinutes = DEFAULT_WINDOW_MINUTES,
  } = params;

  if (!scheduleData) return result;

  // Prefer the authoritative trip->route map embedded in the payload.
  const routeMap =
    scheduleData.tripRouteMap && Object.keys(scheduleData.tripRouteMap).length > 0
      ? scheduleData.tripRouteMap
      : tripRouteMap;

  const stopsById = new Map(stops.map((s) => [s.stop_id, s]));
  const routesById = new Map(routes.map((r) => [r.route_id, r]));
  const index = buildScheduleStopIndex(scheduleData);
  const stationDensityCenter = calculateStationDensityCenter(stops);
  const nowMin = minutesSinceMidnight(now);

  for (const stopId of stopIds) {
    const entries = index.get(stopId);
    if (!entries || entries.length === 0) continue;

    // Keep only the soonest scheduled trip per route at this station to mirror
    // the live board (one card per route) and feed the departed-dedup cleanly.
    const perRoute = new Map<number, Candidate>();

    for (const { tripId, entry } of entries) {
      const routeId = routeMap[tripId];
      if (routeId === undefined) continue;

      const serviceId = scheduleData.tripServiceMap[tripId] ?? '';
      if (!activeServiceIds.has(serviceId)) continue;

      // GPS wins: never synthesize a trip that has a live vehicle.
      if (gpsVehicleTripIds.has(tripId)) continue;

      const stopTimes = scheduleData.stopTimes[tripId];
      const bounds = tripBounds(stopTimes);
      if (!bounds) continue;

      const firstDep = bounds.first.d;
      const lastArr = bounds.last.a;
      const departed = firstDep < nowMin;
      const isStart = entry.q === bounds.first.q;

      let candidate: Candidate | null = null;

      if (!departed) {
        // Future departure: only surface it at the trip's START station.
        if (!isStart) continue;
        const minutesUntil = firstDep - nowMin;
        if (minutesUntil < 0 || minutesUntil > windowMinutes) continue;
        const startStop = stopsById.get(stopId);
        if (!startStop) continue;
        candidate = {
          tripId,
          routeId,
          serviceId,
          minutesUntil,
          departed: false,
          position: { lat: startStop.stop_lat, lon: startStop.stop_lon },
          lastKnownMin: nowMin,
          headsign: stopsById.get(bounds.last.s)?.stop_name ?? '',
        };
      } else {
        // Ghost: trip is en route. Show at not-yet-passed stops only.
        if (nowMin > lastArr) continue; // trip already finished
        const minutesUntil = entry.a - nowMin;
        if (minutesUntil < 0 || minutesUntil > windowMinutes) continue;
        const pos = interpolateGhostPosition(stopTimes, stopsById, nowMin);
        if (!pos) continue;
        candidate = {
          tripId,
          routeId,
          serviceId,
          minutesUntil,
          departed: true,
          position: { lat: pos.lat, lon: pos.lon },
          lastKnownMin: pos.lastDepartedMin,
          headsign: stopsById.get(bounds.last.s)?.stop_name ?? '',
        };
      }

      const existing = perRoute.get(routeId);
      if (!existing || candidate.minutesUntil < existing.minutesUntil) {
        perRoute.set(routeId, candidate);
      }
    }

    if (perRoute.size === 0) continue;

    const stationVehicles: StationVehicle[] = [];
    for (const candidate of perRoute.values()) {
      stationVehicles.push(
        synthesizeStationVehicle(candidate, {
          routesById,
          tranzyTrips,
          stops,
          stationDensityCenter,
          realVehicles,
          now,
        }),
      );
    }
    result.set(stopId, stationVehicles);
  }

  return result;
}

interface SynthDeps {
  routesById: Map<number, TranzyRouteResponse>;
  tranzyTrips: TranzyTripResponse[];
  stops: TranzyStopResponse[];
  stationDensityCenter: { lat: number; lon: number };
  realVehicles: EnhancedVehicleData[];
  now: Date;
}

/** Parse the GTFS direction (0/1) encoded as the 2nd token of the trip id. */
function parseDirection(tripId: string): number | null {
  const token = tripId.split('_')[1];
  if (token === '0') return 0;
  if (token === '1') return 1;
  return null;
}

/** Build the synthetic StationVehicle for a candidate, reusing enhanceVehicle. */
function synthesizeStationVehicle(candidate: Candidate, deps: SynthDeps): StationVehicle {
  const { routesById, tranzyTrips, stops, stationDensityCenter, realVehicles, now } = deps;

  // Find a representative Tranzy trip for shape/direction (best-effort).
  const dir = parseDirection(candidate.tripId);
  const repTrip =
    (dir !== null
      ? tranzyTrips.find((t) => t.route_id === candidate.routeId && t.direction_id === dir)
      : undefined) ?? tranzyTrips.find((t) => t.route_id === candidate.routeId);

  const rawVehicle: TranzyVehicleResponse = {
    id: syntheticVehicleId(candidate.tripId),
    label: '',
    latitude: candidate.position.lat,
    longitude: candidate.position.lon,
    timestamp: isoAtMinutes(now, candidate.lastKnownMin),
    speed: 0,
    route_id: candidate.routeId,
    trip_id: candidate.tripId,
    vehicle_type: 3,
    bike_accessible: 'BIKE_INACCESSIBLE',
    wheelchair_accessible: 'WHEELCHAIR_INACCESSIBLE',
  };

  // Reuse the normal enhancement so speed is predicted like every other vehicle.
  // Forward prediction is suppressed so the vehicle stays at our schedule-derived
  // position; at-station detection yields speed 0 for the future (start-station)
  // phase, while ghosts mid-segment get the averaged speed prediction.
  const enhanced = enhanceVehicle(rawVehicle, {
    suppressForwardPrediction: true,
    stops,
    nearbyVehicles: realVehicles,
    stationDensityCenter,
  });
  enhanced.isScheduled = true;
  enhanced.scheduledDepartureMinutes = candidate.minutesUntil;

  const trip: TranzyTripResponse = {
    trip_id: candidate.tripId,
    route_id: candidate.routeId,
    service_id: candidate.serviceId,
    trip_headsign: candidate.headsign,
    direction_id: dir ?? repTrip?.direction_id ?? 0,
    block_id: 0,
    shape_id: repTrip?.shape_id ?? '',
  };

  return {
    vehicle: enhanced,
    route: routesById.get(candidate.routeId) ?? null,
    trip,
    arrivalTime: {
      estimatedMinutes: candidate.minutesUntil,
      statusMessage: candidate.departed ? 'Scheduled · en route' : 'Scheduled',
      confidence: 'low',
      calculationMethod: 'schedule',
    },
  };
}
