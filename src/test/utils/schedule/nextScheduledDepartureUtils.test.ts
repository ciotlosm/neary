import { describe, it, expect } from 'vitest';
import {
  getNextScheduledDeparture,
  formatMinutesUntil,
} from '../../../utils/schedule/nextScheduledDepartureUtils';
import type { SchedulePayload, ScheduleStopTime, CalendarEntry } from '../../../types/schedule';

const STOP_START = 100; // route's start station
const STOP_MID = 101;

function trip(startMin: number): ScheduleStopTime[] {
  return [
    { s: STOP_START, q: 0, a: startMin, d: startMin },
    { s: STOP_MID, q: 1, a: startMin + 5, d: startMin + 5 },
  ];
}

/** A calendar entry active on the given weekday flags, wide date range. */
function cal(serviceId: string, days: Partial<CalendarEntry>): CalendarEntry {
  return {
    serviceId,
    monday: false, tuesday: false, wednesday: false, thursday: false,
    friday: false, saturday: false, sunday: false,
    startDate: '20000101', endDate: '20991231',
    ...days,
  };
}

function payload(
  stopTimes: Record<string, ScheduleStopTime[]>,
  tripServiceMap: Record<string, string>,
  calendar: CalendarEntry[],
): SchedulePayload {
  return { version: 'v', stopTimes, calendar, calendarExceptions: [], tripServiceMap };
}

// route 42 = routeId 40; trip ids T_<min>
const tripRouteMap: Record<string, number> = {
  T_300: 40, T_360: 40, T_1380: 40, T_other: 99, T_mid: 40,
};

describe('getNextScheduledDeparture', () => {
  // 2025-06-16 is a Monday.
  const monday10am = new Date(2025, 5, 16, 10, 0, 0); // 600 min
  const LV = cal('LV', { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true });
  const S = cal('S', { saturday: true });

  it('returns the next upcoming departure today', () => {
    const p = payload(
      { T_300: trip(300), T_360: trip(360), T_1380: trip(1380) }, // 05:00, 06:00, 23:00
      { T_300: 'LV', T_360: 'LV', T_1380: 'LV' },
      [LV],
    );
    const r = getNextScheduledDeparture({ scheduleData: p, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am });
    expect(r).not.toBeNull();
    expect(r!.tripId).toBe('T_1380'); // 05:00 and 06:00 already passed at 10:00
    expect(r!.dayOffset).toBe(0);
    expect(r!.departureMinutes).toBe(1380);
    expect(r!.minutesUntil).toBe(1380 - 600);
  });

  it('rolls to the next service day when nothing remains today', () => {
    // All departures earlier than 10:00 -> none left today; next is tomorrow.
    const p = payload(
      { T_300: trip(300), T_360: trip(360) }, // 05:00, 06:00
      { T_300: 'LV', T_360: 'LV' },
      [LV],
    );
    const r = getNextScheduledDeparture({ scheduleData: p, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am });
    expect(r).not.toBeNull();
    expect(r!.dayOffset).toBe(1); // Tuesday (LV active)
    expect(r!.tripId).toBe('T_300'); // earliest next day
    expect(r!.departureMinutes).toBe(300);
    // minutesUntil = 1440 + 300 - 600
    expect(r!.minutesUntil).toBe(1440 + 300 - 600);
  });

  it('skips days whose service is not active and finds the next active one', () => {
    // Saturday-only service; "now" is Monday -> next active is Saturday (offset 5).
    const p = payload({ T_300: trip(300) }, { T_300: 'S' }, [S]);
    const r = getNextScheduledDeparture({ scheduleData: p, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am });
    expect(r).not.toBeNull();
    expect(r!.dayOffset).toBe(5); // Mon(0)->Sat(5)
    expect(r!.departureMinutes).toBe(300);
  });

  it('is direction-aware: only counts trips whose FIRST stop is this station', () => {
    // T_mid passes through STOP_START but does not start there (starts at STOP_MID).
    const p = payload(
      { T_mid: [
        { s: STOP_MID, q: 0, a: 660, d: 660 },
        { s: STOP_START, q: 1, a: 665, d: 665 },
      ] },
      { T_mid: 'LV' },
      [LV],
    );
    const r = getNextScheduledDeparture({ scheduleData: p, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am });
    expect(r).toBeNull();
  });

  it('ignores trips of other routes', () => {
    const p = payload({ T_other: trip(660) }, { T_other: 'LV' }, [LV]);
    const r = getNextScheduledDeparture({ scheduleData: p, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am });
    expect(r).toBeNull();
  });

  it('returns null when schedule data is unavailable', () => {
    expect(
      getNextScheduledDeparture({ scheduleData: null, tripRouteMap, stopId: STOP_START, routeId: 40, now: monday10am }),
    ).toBeNull();
  });
});

describe('formatMinutesUntil', () => {
  it('formats minutes, hours and days', () => {
    expect(formatMinutesUntil(0)).toBe('now');
    expect(formatMinutesUntil(8)).toBe('in 8m');
    expect(formatMinutesUntil(60)).toBe('in 1h');
    expect(formatMinutesUntil(80)).toBe('in 1h 20m');
    expect(formatMinutesUntil(1440)).toBe('in 1d');
    expect(formatMinutesUntil(1440 + 180)).toBe('in 1d 3h');
  });
});
