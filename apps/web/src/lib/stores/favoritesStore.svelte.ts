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
 * JSON array of route ids. Loaded once on construction (browser only),
 * saved on every mutation. SSR-safe (no-ops on the server).
 *
 * KISS: a plain Set wrapped in $state. No debounce, no validation —
 * the set stays small (typical user favorites a handful of routes).
 */

const STORAGE_KEY = 'neary:favoriteRoutes';

function loadInitial(): Set<number> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    const set = new Set<number>();
    for (const x of arr) if (typeof x === 'number' && Number.isFinite(x)) set.add(x);
    return set;
  } catch {
    return new Set();
  }
}

class FavoritesStore {
  // Backing field is a $state-wrapped Set so mutations Svelte-track,
  // BUT consumers read through `routeIds` (cast to ReadonlySet) so they
  // can't mutate behind our back.
  #routes = $state<Set<number>>(loadInitial());

  /** Reactive, read-only view. */
  get routeIds(): ReadonlySet<number> {
    return this.#routes;
  }

  has(routeId: number): boolean {
    return this.#routes.has(routeId);
  }

  add(routeId: number): void {
    if (this.#routes.has(routeId)) return;
    // Reassign so Svelte's reactivity sees a new reference. A plain
    // `.add` on the inner Set works for `$state.raw` but not for the
    // proxy-tracked set in some runes builds — reassignment is the
    // safe form across versions.
    this.#routes = new Set(this.#routes).add(routeId);
    this.#persist();
  }

  remove(routeId: number): void {
    if (!this.#routes.has(routeId)) return;
    const next = new Set(this.#routes);
    next.delete(routeId);
    this.#routes = next;
    this.#persist();
  }

  toggle(routeId: number): void {
    if (this.#routes.has(routeId)) this.remove(routeId);
    else this.add(routeId);
  }

  clear(): void {
    this.#routes = new Set();
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
