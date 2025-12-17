/**
 * Shared cache infrastructure for data hooks
 * Provides TTL-based caching with key-based invalidation and request deduplication
 */

const CACHE_MISS = Symbol('CACHE_MISS');

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  maxAge: number; // milliseconds
  key: string;
}

export interface CacheOptions {
  maxAge?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
}

/**
 * Generic cache manager with TTL and key-based invalidation
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly defaultMaxAge: number;
  private readonly maxSize: number;
  private cleanupInterval: number | null = null;
  private memoryPressureThreshold: number;
  private lastCleanup: Date;

  constructor(options: CacheOptions = {}) {
    this.defaultMaxAge = options.maxAge ?? 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize ?? 100;
    this.memoryPressureThreshold = Math.floor(this.maxSize * 0.8); // 80% of max size
    this.lastCleanup = new Date();
    
    // Start automatic cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get data from cache if valid, otherwise return CACHE_MISS symbol
   */
  private getRaw<T>(key: string): T | typeof CACHE_MISS {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return CACHE_MISS;
    }

    // Check if entry has expired
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    
    if (age > entry.maxAge) {
      this.cache.delete(key);
      return CACHE_MISS;
    }

    return entry.data;
  }

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const result = this.getRaw<T>(key);
    return result === CACHE_MISS ? null : result;
  }

  /**
   * Set data in cache with optional custom TTL
   */
  set<T>(key: string, data: T, maxAge?: number): void {
    // Enforce cache size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      maxAge: maxAge ?? this.defaultMaxAge,
      key
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is valid in cache
   */
  has(key: string): boolean {
    return this.getRaw(key) !== CACHE_MISS;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = new Date();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      const age = now.getTime() - entry.timestamp.getTime();
      if (age <= entry.maxAge) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      pendingRequests: this.pendingRequests.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Request deduplication - ensures only one request per key is in flight
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    maxAge?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.getRaw<T>(key);
    if (cached !== CACHE_MISS) {
      return cached;
    }

    // Check if request is already in flight
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Start new request
    const request = fetchFn()
      .then((data) => {
        this.set(key, data, maxAge);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = new Date();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now.getTime() - entry.timestamp.getTime();
      if (age > entry.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval !== null) {
      return; // Already started
    }

    // Only start interval in browser environment (not in tests)
    if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
      // Run cleanup every 2 minutes
      this.cleanupInterval = window.setInterval(() => {
        this.performScheduledCleanup();
      }, 2 * 60 * 1000);
    }
  }

  /**
   * Stop automatic cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Perform scheduled cleanup with memory pressure detection
   */
  private performScheduledCleanup(): void {
    const now = new Date();
    const timeSinceLastCleanup = now.getTime() - this.lastCleanup.getTime();
    
    // Skip if cleaned up recently (less than 1 minute ago)
    if (timeSinceLastCleanup < 60 * 1000) {
      return;
    }

    const sizeBefore = this.cache.size;
    
    // Always clean expired entries
    this.cleanup();
    
    // If under memory pressure, perform aggressive cleanup
    if (this.cache.size > this.memoryPressureThreshold) {
      this.performAggressiveCleanup();
    }
    
    const sizeAfter = this.cache.size;
    this.lastCleanup = now;
    
    if (sizeBefore !== sizeAfter) {
      console.debug(`Cache cleanup: ${sizeBefore} -> ${sizeAfter} entries (freed ${sizeBefore - sizeAfter})`);
    }
  }

  /**
   * Perform aggressive cleanup when under memory pressure
   */
  private performAggressiveCleanup(): void {
    const entries = Array.from(this.cache.entries());
    const now = new Date();
    
    // Sort by age (oldest first) and remove oldest entries
    entries.sort(([, a], [, b]) => {
      const ageA = now.getTime() - a.timestamp.getTime();
      const ageB = now.getTime() - b.timestamp.getTime();
      return ageB - ageA; // Descending order (oldest first)
    });
    
    // Remove oldest 25% of entries
    const entriesToRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < entriesToRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Force immediate cleanup and memory optimization
   */
  forceCleanup(): void {
    // Clean expired entries
    this.cleanup();
    
    // If still over threshold, perform aggressive cleanup
    if (this.cache.size > this.memoryPressureThreshold) {
      this.performAggressiveCleanup();
    }
    
    this.lastCleanup = new Date();
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.clear();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    const stats = this.getStats();
    const memoryPressure = this.cache.size / this.maxSize;
    
    return {
      ...stats,
      memoryPressure,
      isUnderPressure: this.cache.size > this.memoryPressureThreshold,
      lastCleanup: this.lastCleanup,
      cleanupIntervalActive: this.cleanupInterval !== null
    };
  }
}

/**
 * Global cache instance for data hooks
 */
export const globalCache = new CacheManager({
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 200
});

/**
 * Create cache key from parameters
 */
export const createCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
};