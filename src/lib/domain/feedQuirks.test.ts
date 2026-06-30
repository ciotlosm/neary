import { describe, expect, it } from 'vitest';
import { deriveDirection, deriveStartTime, quirksForFeed } from './feedQuirks';

describe('quirksForFeed', () => {
  it('returns the Cluj entry for cluj-napoca', () => {
    const q = quirksForFeed('cluj-napoca');
    expect(q.deriveDirectionFromTripId).toBeInstanceOf(RegExp);
    expect(q.deriveStartTimeFromTripId).toBeInstanceOf(RegExp);
  });

  it('returns an empty object for unknown / null feeds', () => {
    expect(quirksForFeed('unknown')).toEqual({});
    expect(quirksForFeed(null)).toEqual({});
    expect(quirksForFeed(undefined)).toEqual({});
  });
});

describe('deriveDirection (Cluj quirks)', () => {
  const q = quirksForFeed('cluj-napoca');

  it('extracts 0 or 1 from the second segment', () => {
    expect(deriveDirection(q, '13_0_LV_70_1448')).toBe(0);
    expect(deriveDirection(q, '13_1_LV_70_1448')).toBe(1);
  });

  it('returns null for non-0/1 segments', () => {
    expect(deriveDirection(q, '13_7_LV_70_1448')).toBeNull();
  });

  it('returns null for an opaque trip_id', () => {
    expect(deriveDirection(q, 'opaque')).toBeNull();
    expect(deriveDirection(q, '')).toBeNull();
  });

  it('returns null when no quirk is defined', () => {
    expect(deriveDirection({}, '13_1_LV_70_1448')).toBeNull();
  });
});

describe('deriveStartTime (Cluj quirks)', () => {
  const q = quirksForFeed('cluj-napoca');

  it('synthesises HH:MM:00 from a 4-digit trailing run', () => {
    expect(deriveStartTime(q, '13_1_LV_70_1448')).toBe('14:48:00');
    expect(deriveStartTime(q, '14_1_LV_99_0900')).toBe('09:00:00');
  });

  it('synthesises HH:MM:00 from a 3-digit trailing run (single-digit hour)', () => {
    expect(deriveStartTime(q, '14_1_LV_99_905')).toBe('09:05:00');
  });

  it('returns null for an opaque trip_id', () => {
    expect(deriveStartTime(q, 'no-time-here')).toBeNull();
    expect(deriveStartTime(q, '')).toBeNull();
  });

  it('returns null for out-of-range hours / minutes', () => {
    expect(deriveStartTime(q, 'x_y_z_3199')).toBeNull(); // 31:99 → invalid h+min
    expect(deriveStartTime(q, 'x_y_z_2299')).toBeNull(); // 22:99 → invalid min
  });

  it('returns null when no quirk is defined', () => {
    expect(deriveStartTime({}, '14_1_LV_99_1448')).toBeNull();
  });
});
