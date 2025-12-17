/**
 * Unified cache manager for consistent caching across all stores
 * Supports TTL, size limits, LRU eviction, and stale-while-revalidate patterns
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  staleWhileRevalidate?: boolean; // Serve stale data while fetching fresh
  maxEntries?: number; // Maximum number of entries
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  entriesByType: Record<string, number>;
  entriesWithTimestamps: Record<string, { 
    createdAt: number; 
    updatedAt: number; 
    age: number;
    accessCount: number;
  }>;
  lastCacheUpdate: number;
  hitRate?: number;
  missRate?: number;
}

export interface CacheEvent<T> {
  type: 'hit' | 'miss' | 'updated' | 'evicted' | 'expired';
  key: string;
  data?: T;
  timestamp: number;
}

/**
 * Unified cache manager with advanced features
 */
export class UnifiedCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private subscribers = new Map<string, Set<(event: CacheEvent<any>) => void>>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  /**
   * Get data from cache or fetch fresh data
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Check if we have valid cached data
    if (entry && (now - entry.timestamp) < entry.ttl) {
      entry.accessCount++;
      entry.lastAccessed = now;
      this.stats.hits++;
      this.emitEvent({ type: 'hit', key, data: entry.data, timestamp: now });
      return entry.data;
    }

    // Cache miss or expired data
    this.stats.misses++;
    this.emitEvent({ type: 'miss', key, timestamp: now });

    // If we have stale data and stale-while-revalidate is enabled
    if (entry && config.staleWhileRevalidate) {
      // Return stale data immediately
      const staleData = entry.data;
      
      // Fetch fresh data in background
      this.fetchAndCache(key, fetcher, config).catch(error => {
        console.warn(`Background refresh failed for ${key}:`, error);
      });
      
      return staleData;
    }

    // Fetch fresh data
    return await this.fetchAndCache(key, fetcher, config);
  }

  /**
   * Get data optimized for live/real-time scenarios
   */
  async getLive<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    if (forceRefresh) {
      return await this.forceRefresh(key, fetcher, {
        ttl: 60000, // 1 minute for live data
        staleWhileRevalidate: true,
      });
    }

    return await this.get(key, fetcher, {
      ttl: 60000, // 1 minute for live data
      staleWhileRevalidate: true,
    });
  }

  /**
   * Force refresh data regardless of cache state
   */
  async forceRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    return await this.fetchAndCache(key, fetcher, config);
  }

  /**
   * Set data in cache directly
   */
  set<T>(key: string, data: T, config: CacheConfig): void {
    const now = Date.now();
    const size = this.estimateSize(data);

    // Check size limits before adding
    if (config.maxSize && size > config.maxSize) {
      console.warn(`Data too large for cache: ${key} (${size} bytes)`);
      return;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: config.ttl,
      size,
      accessCount: 1,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.emitEvent({ type: 'updated', key, data, timestamp: now });

    // Enforce cache limits
    this.enforceLimits(config);
  }

  /**
   * Get cached data even if stale (for offline scenarios)
   */
  getCachedStale<T>(key: string): { data: T; age: number; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;
    const isStale = age > entry.ttl;

    entry.accessCount++;
    entry.lastAccessed = now;

    return {
      data: entry.data,
      age,
      isStale,
    };
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(keys: string | string[]): void {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const now = Date.now();

    keysArray.forEach(key => {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.emitEvent({ type: 'evicted', key, timestamp: now });
      }
    });
  }

  /**
   * Subscribe to cache events for a specific key or pattern
   */
  subscribe<T>(
    keyOrPattern: string,
    callback: (event: CacheEvent<T>) => void
  ): () => void {
    if (!this.subscribers.has(keyOrPattern)) {
      this.subscribers.set(keyOrPattern, new Set());
    }

    const subscribers = this.subscribers.get(keyOrPattern)!;
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(keyOrPattern);
      }
    };
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entriesByType: Record<string, number> = {};
    const entriesWithTimestamps: Record<string, any> = {};
    let totalSize = 0;

    this.cache.forEach((entry, key) => {
      const keyType = key.split(':')[0] || 'unknown';
      entriesByType[keyType] = (entriesByType[keyType] || 0) + 1;
      totalSize += entry.size;

      entriesWithTimestamps[key] = {
        createdAt: entry.timestamp,
        updatedAt: entry.timestamp,
        age: now - entry.timestamp,
        accessCount: entry.accessCount,
      };
    });

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

    return {
      totalEntries: this.cache.size,
      totalSize,
      entriesByType,
      entriesWithTimestamps,
      lastCacheUpdate: now,
      hitRate,
      missRate,
    };
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    const now = Date.now();
    this.cache.forEach((_, key) => {
      this.emitEvent({ type: 'evicted', key, timestamp: now });
    });
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    this.cache.forEach((entry, key) => {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key);
        this.emitEvent({ type: 'expired', key, timestamp: now });
        cleared++;
      }
    });

    return cleared;
  }

  /**
   * Private: Fetch data and cache it
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    try {
      const data = await fetcher();
      this.set(key, data, config);
      return data;
    } catch (error) {
      // If we have stale data, return it as fallback
      const staleEntry = this.cache.get(key);
      if (staleEntry) {
        console.warn(`Using stale data for ${key} due to fetch error:`, error);
        return staleEntry.data;
      }
      throw error;
    }
  }

  /**
   * Private: Emit cache event to subscribers
   */
  private emitEvent<T>(event: CacheEvent<T>): void {
    // Emit to specific key subscribers
    const keySubscribers = this.subscribers.get(event.key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in cache event callback for ${event.key}:`, error);
        }
      });
    }

    // Emit to wildcard subscribers (keys ending with '*')
    this.subscribers.forEach((subscribers, pattern) => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (event.key.startsWith(prefix)) {
          subscribers.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              console.error(`Error in cache event callback for pattern ${pattern}:`, error);
            }
          });
        }
      }
    });
  }

  /**
   * Private: Enforce cache size and entry limits
   */
  private enforceLimits(config: CacheConfig): void {
    // Enforce max entries (LRU eviction)
    if (config.maxEntries && this.cache.size > config.maxEntries) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = entries.slice(0, this.cache.size - config.maxEntries);
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
        this.stats.evictions++;
        this.emitEvent({ type: 'evicted', key, timestamp: Date.now() });
      });
    }

    // Enforce max size (remove largest entries first)
    if (config.maxSize) {
      let totalSize = 0;
      this.cache.forEach(entry => totalSize += entry.size);

      if (totalSize > config.maxSize) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => b[1].size - a[1].size); // Largest first

        for (const [key, entry] of entries) {
          if (totalSize <= config.maxSize) break;
          
          this.cache.delete(key);
          totalSize -= entry.size;
          this.stats.evictions++;
          this.emitEvent({ type: 'evicted', key, timestamp: Date.now() });
        }
      }
    }
  }

  /**
   * Private: Estimate data size in bytes
   */
  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      if (typeof data === 'string') return data.length * 2;
      if (typeof data === 'number') return 8;
      if (typeof data === 'boolean') return 4;
      if (Array.isArray(data)) return data.length * 100; // Rough estimate
      if (typeof data === 'object') return Object.keys(data).length * 50; // Rough estimate
      return 100; // Default estimate
    }
  }
}

// Global cache manager instance
export const cacheManager = new UnifiedCacheManager();

// Periodic cleanup of expired entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleared = cacheManager.clearExpired();
    if (cleared > 0) {
      console.debug(`Cleared ${cleared} expired cache entries`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}