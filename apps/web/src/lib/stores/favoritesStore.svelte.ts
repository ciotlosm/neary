/*
 * favoritesStore — persistent set of route ids the user has starred.
 *
 * Single-source for "is this route a favorite?" reads + writes. Used by:
 *   - RouteBadge (heart pip when favorite)
 *   - StationCard (passes the set down so each badge knows)
 *   - selectBoardsForView (favorite fallback when no stop is nearby)
 *   - /favorites page (lists favorite routes)
 *
 * Persistence: localStorage key `neary:favoriteRoutes`, stored as a
 * JSON array of route ids (always strings on the wire). Loaded once
 * on construction (browser only), saved on every mutation. SSR-safe
 * (no-ops on the server).
 *
 * IDs are normalised to STRINGS at the boundary. GTFS allows route_id
 * to be any text token ("102L" exists in the Cluj feed); the TS types
 * downstream still claim `number` in places but SQLite-WASM gives us
 * the value verbatim and Set membership is by identity, so a single
 * canonical form across persistence + comparison is what matters.
 * Methods accept `string | number` so callers don't have to coerce.
 */

import { SvelteSet } from 'svelte/reactivity';

const STORAGE_KEY = 'neary:favoriteRoutes';

/** Normalise any caller-supplied route id to its canonical string
 *  form. Numbers (legacy) and strings (current) both map cleanly. */
function key(id: string | number): string {
  return String(id);
}

function loadInitial(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string | number => typeof x === 'string' || typeof x === 'number')
      .map(key);
  } catch {
    return [];
  }
}

class FavoritesStore {
  // Native reactive Set — mutations on it propagate without any
  // reassignment dance, and consumers read through `routeIds` (a
  // ReadonlySet view) so they can't mutate behind our back.
  #routes = new SvelteSet<string>(loadInitial());

  /** Reactive, read-only view. */
  get routeIds(): ReadonlySet<string> {
    return this.#routes;
  }

  has(routeId: string | number): boolean {
    return this.#routes.has(key(routeId));
  }

  add(routeId: string | number): void {
    const k = key(routeId);
    if (this.#routes.has(k)) return;
    this.#routes.add(k);
    this.#persist();
  }

  remove(routeId: string | number): void {
    const k = key(routeId);
    if (!this.#routes.has(k)) return;
    this.#routes.delete(k);
    this.#persist();
  }

  toggle(routeId: string | number): void {
    if (this.has(routeId)) this.remove(routeId);
    else this.add(routeId);
  }

  clear(): void {
    this.#routes.clear();
    this.#persist();
  }

  #persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.#routes)));
    } catch {
      // Quota / disabled — silently noop. Favorites is non-critical.
    }
  }
}

export const favoritesStore = new FavoritesStore();
