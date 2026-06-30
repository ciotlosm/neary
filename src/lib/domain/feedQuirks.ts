/*
 * Per-feed quirks for the GTFS-RT parse step.
 *
 * GTFS-RT is a stable spec, but operator implementations diverge from
 * it in producer-specific ways. To honor the spirit of GTFS issue #117
 * ("trip_id is opaque"), this module is the SINGLE place in the
 * codebase that knows about per-feed trip_id encodings. The RT parser
 * applies quirks when present, then exposes only the canonical
 * `directionId` + `startTime` fields downstream. The reconciler and
 * everything else in `src/lib/domain/` see opaque trip_ids only.
 *
 * Adding a new feed:
 *   1. Run `scripts/sample-rt-feed.mjs <feedId>` (or just curl the
 *      vehiclePositions endpoint and inspect with the proto bindings)
 *      to confirm whether `TripDescriptor.startTime` and `directionId`
 *      are populated and correct.
 *   2. If both are present + correct, leave the feed out of this table
 *      \u2014 the parser falls back to canonical fields automatically.
 *   3. If either is absent / broken AND the trip_id carries the
 *      information in a stable position, add an entry with the
 *      capture regex.
 *
 * Cluj-napoca audit 2026-06-30 (124 entities sampled):
 *   - has start_time:   0%   (always missing)
 *   - has trip_id:      100%
 *   - has direction_id: 100% but ALL=0 (broken)
 *   - trip_id pattern:  100% match `^<route>_<dir>_<service>_<run>_<HHMM>`
 *   Without these quirks, the live pipeline collapses to gps-only
 *   orphans on every observation.
 */

export interface FeedRtQuirks {
  /**
   * When set, derive `TripDescriptor.start_time` from this capture
   * group on the trip_id. Use when the operator's RT feed never
   * populates `start_time` directly.
   *
   * The captured value is interpreted as `HHMM` (4 digits) or `HMM`
   * (3 digits, single-digit hour) and synthesised into `HH:MM:00`
   * before the observation is handed off.
   */
  deriveStartTimeFromTripId?: RegExp;
  /**
   * When set, derive `direction_id` from this capture group on the
   * trip_id. Use when the operator's RT feed reports a fixed/broken
   * `direction_id` for every vehicle (e.g. Cluj reports 0 always).
   *
   * The captured value must be the literal string "0" or "1";
   * anything else is treated as no-match (the parser falls back to
   * the feed-provided direction).
   */
  deriveDirectionFromTripId?: RegExp;
}

const QUIRKS: Record<string, FeedRtQuirks> = {
  'cluj-napoca': {
    deriveStartTimeFromTripId: /_(\d{3,4})$/,
    deriveDirectionFromTripId: /^\d+_(\d)_/,
  },
};

const EMPTY: FeedRtQuirks = Object.freeze({});

/** Look up the quirks for a feed. Returns an empty object (no
 *  quirks applied) when the feed is unknown. */
export function quirksForFeed(feedId: string | null | undefined): FeedRtQuirks {
  if (!feedId) return EMPTY;
  return QUIRKS[feedId] ?? EMPTY;
}

/** Apply `deriveDirectionFromTripId` if defined. Returns 0 or 1 on a
 *  successful parse, otherwise null (caller falls back to the
 *  feed-provided direction). */
export function deriveDirection(quirks: FeedRtQuirks, tripId: string): 0 | 1 | null {
  const re = quirks.deriveDirectionFromTripId;
  if (!re || !tripId) return null;
  const m = tripId.match(re);
  if (!m || m[1] == null) return null;
  if (m[1] === '0') return 0;
  if (m[1] === '1') return 1;
  return null;
}

/** Apply `deriveStartTimeFromTripId` if defined. Returns a synthesised
 *  "HH:MM:00" string on a successful parse, otherwise null (caller
 *  falls back to whatever the feed provided, possibly empty). */
export function deriveStartTime(quirks: FeedRtQuirks, tripId: string): string | null {
  const re = quirks.deriveStartTimeFromTripId;
  if (!re || !tripId) return null;
  const m = tripId.match(re);
  if (!m || m[1] == null) return null;
  const digits = m[1];
  // 4 digits = HHMM; 3 digits = HMM (single-digit hour, e.g. 905 → 9:05)
  const h = digits.length === 4 ? Number(digits.slice(0, 2)) : Number(digits.slice(0, 1));
  const min = Number(digits.slice(-2));
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 30 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}
