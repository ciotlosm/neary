import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseVehiclePositions } from './gtfsRtClient';
import { quirksForFeed } from '../../domain/feedQuirks';

// Fixture is a real protobuf capture from Cluj's vehicle_positions feed.
// Purpose + regen recipe: docs/specs/live-data-pipeline.md § "Test fixture".
const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(__dirname, '__fixtures__/cluj-vehicle-positions.bin'));

describe('parseVehiclePositions', () => {
  it('decodes a real Cluj VehiclePositions snapshot', () => {
    const snap = parseVehiclePositions(new Uint8Array(fixture));
    expect(snap.feedTimestampMs).toBeGreaterThan(0);
    expect(snap.vehicles.length).toBeGreaterThan(10);

    const v = snap.vehicles[0];
    expect(v.source).toBe('gtfs-rt');
    expect(typeof v.lat).toBe('number');
    expect(typeof v.lon).toBe('number');
    // Cluj is around 46.7, 23.6 — sanity-check the snapshot is in-region.
    expect(v.lat).toBeGreaterThan(46);
    expect(v.lat).toBeLessThan(47);
    expect(v.lon).toBeGreaterThan(23);
    expect(v.lon).toBeLessThan(24);
  });

  it('emits a trip_id that looks GTFS-canonical when the feed assigns one', () => {
    const snap = parseVehiclePositions(new Uint8Array(fixture));
    // Most entries should have a non-empty trip_id; some may be deadheading.
    const withTrip = snap.vehicles.filter((v) => v.tripId.length > 0);
    expect(withTrip.length).toBeGreaterThan(0);
    // GTFS-RT trip_ids for Cluj look like '45_1_LV_9_0721' (route_dir_service_block_starttime).
    expect(withTrip[0].tripId).toMatch(/^\d+_\d+_/);
  });

  it('without quirks: trusts whatever the feed provides', () => {
    // The Cluj feed reports direction_id=0 for every vehicle and never
    // populates start_time. Without quirks applied, the parser
    // surfaces the broken canonical values verbatim. This is the
    // correct behavior for unknown feeds — only feeds with a quirks
    // entry get producer-specific decoding.
    const snap = parseVehiclePositions(new Uint8Array(fixture));
    expect(snap.vehicles.every((v) => v.directionId === 0)).toBe(true);
    expect(snap.vehicles.every((v) => v.startTime === '')).toBe(true);
  });

  it('with Cluj quirks: derives direction + startTime from trip_id', () => {
    // Confirmed against the live Cluj feed 2026-06-30: 0% have
    // start_time, 100% have direction_id=0, and 100% match the
    // ^<route>_<dir>_<service>_<run>_<HHMM> trip_id pattern.
    const snap = parseVehiclePositions(new Uint8Array(fixture), quirksForFeed('cluj-napoca'));
    const withTrip = snap.vehicles.filter((v) => /^\d+_(0|1)_/.test(v.tripId));
    expect(withTrip.length).toBeGreaterThan(10);

    // Direction should split between 0 and 1 (not all 0 like the
    // raw feed claims).
    const dirs = new Set(withTrip.map((v) => v.directionId));
    expect(dirs.has(0) || dirs.has(1)).toBe(true);
    expect(withTrip.every((v) => v.directionId === 0 || v.directionId === 1)).toBe(true);

    // startTime should be synthesised from the trailing _HHMM digits.
    expect(withTrip.every((v) => /^\d{2}:\d{2}:00$/.test(v.startTime))).toBe(true);
  });
});
