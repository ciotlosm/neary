/*
 * Time utilities shared by pipeline stages. Pure functions.
 */

/** Convert a GTFS time string "HH:MM:SS" (24h+ allowed for past-midnight
 *  trips) to minutes since midnight. Returns NaN on garbage. */
export function timeToMinutes(t: string): number {
  if (!t) return Number.NaN;
  const parts = t.split(':');
  if (parts.length < 2) return Number.NaN;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.NaN;
  return h * 60 + m;
}

/** Format a `Date` (system-local) as GTFS calendar key "YYYYMMDD". */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}${mo}${da}`;
}

/** Minutes since local (system) midnight for a `Date`. */
export function localMinSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * "YYYYMMDD" for a Unix ms timestamp evaluated in a given IANA timezone.
 * Used by the worker so the GTFS calendar query uses the feed's local date
 * (e.g. Europe/Bucharest for Cluj) regardless of where the user's system
 * clock is. Built on Intl.DateTimeFormat so it works in workers.
 */
export function dateKeyInTz(nowMs: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(nowMs);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  const d = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${y}${m}${d}`;
}

/** Minutes since midnight in the given IANA timezone for a Unix ms timestamp. */
export function minSinceMidnightInTz(nowMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(nowMs);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
}
