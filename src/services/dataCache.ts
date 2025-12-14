// Cache management for different data types
import { logger } from '../utils/loggerFixed';

// Cache configuration for different data types
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxAge: number; // Maximum age before forced refresh
  staleWhileRevalidate: boolean; // Return stale data while fetching fresh
}

// Cache configurations for different data types
export const CACHE_CONFIGS = {
  // Static data - changes rarely
  agencies: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    staleWhileRevalidate: true,
  },
  stops: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    staleWhileRevalidate: true,
  },
  routes: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    staleWhileRevalidate: true,
  },
  // Semi-static data - changes daily
  schedules: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    staleWhileRevalidate: true,
  },
  stopTimes: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    staleWhileRevalidate: true,
  },
  // Dynamic data - changes frequently
  vehicles: {
    ttl: 60 * 1000, // 1 minute
    maxAge: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
  },
} as const;

export interface CachedData<T> {
  data: T;
  timestamp: number;
  etag?: string;
  lastModified?: string;
  source: 'network' | 'cache' | 'offline';
}

export interface CacheEntry<T> {
  key: string;
  data: CachedData<T>;
  config: CacheConfig;
}

export class DataCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.loadFromStorage();
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get data from cache or fetch if needed
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<CachedData<T>> {
    const cacheKey = this.getCacheKey(key);
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Check if we have valid cached data
    if (cached && this.isValid(cached, now)) {
      logger.debug('Cache hit', { key, age: now - cached.data.timestamp }, 'CACHE');
      
      // If stale but within max age, return cached data and refresh in background
      if (config.staleWhileRevalidate && this.isStale(cached, now)) {
        this.refreshInBackground(key, fetcher, config);
      }
      
      return cached.data;
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      logger.debug('Using pending request', { key }, 'CACHE');
      return pending;
    }

    // If we have stale data and are offline, return it
    if (cached && !navigator.onLine) {
      logger.info('Returning stale data (offline)', { 
        key, 
        age: now - cached.data.timestamp 
      }, 'CACHE');
      return {
        ...cached.data,
        source: 'offline' as const,
      };
    }

    // Fetch fresh data
    return this.fetchAndCache(key, fetcher, config);
  }

  /**
   * Force refresh data regardless of cache state
   */
  async forceRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<CachedData<T>> {
    logger.info('Force refreshing cache', { key }, 'CACHE');
    return this.fetchAndCache(key, fetcher, config);
  }

  /**
   * Set data in cache manually
   */
  set<T>(key: string, data: T, config: CacheConfig, source: 'network' | 'cache' = 'network'): void {
    const cacheKey = this.getCacheKey(key);
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data: {
        data,
        timestamp: Date.now(),
        source,
      },
      config,
    };

    this.cache.set(cacheKey, entry);
    this.saveToStorage();
    
    logger.debug('Cache set', { key, source }, 'CACHE');
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.saveToStorage();
    logger.debug('Cache cleared', { key }, 'CACHE');
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    this.saveToStorage();
    logger.info('All cache cleared', {}, 'CACHE');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    entriesByType: Record<string, number>;
    oldestEntry?: { key: string; age: number };
  } {
    const now = Date.now();
    const entriesByType: Record<string, number> = {};
    let oldestEntry: { key: string; age: number } | undefined;
    let totalSize = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      const type = key.split(':')[0];
      entriesByType[type] = (entriesByType[type] || 0) + 1;
      
      const age = now - entry.data.timestamp;
      if (!oldestEntry || age > oldestEntry.age) {
        oldestEntry = { key, age };
      }

      // Rough size calculation
      totalSize += JSON.stringify(entry.data.data).length;
    }

    return {
      totalEntries: this.cache.size,
      totalSize,
      entriesByType,
      oldestEntry,
    };
  }

  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<CachedData<T>> {
    const cacheKey = this.getCacheKey(key);
    
    try {
      // Create and store the promise to prevent duplicate requests
      const promise = fetcher();
      this.pendingRequests.set(cacheKey, promise);

      const data = await promise;
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        source: 'network',
      };

      // Store in cache
      this.cache.set(cacheKey, {
        key: cacheKey,
        data: cachedData,
        config,
      });

      this.saveToStorage();
      logger.debug('Cache updated from network', { key }, 'CACHE');

      return cachedData;
    } catch (error) {
      logger.error('Failed to fetch data', { key, error }, 'CACHE');
      
      // Try to return stale data if available
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.info('Returning stale data due to fetch error', { key }, 'CACHE');
        return {
          ...cached.data,
          source: 'cache' as const,
        };
      }
      
      throw error;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    try {
      logger.debug('Background refresh started', { key }, 'CACHE');
      await this.fetchAndCache(key, fetcher, config);
    } catch (error) {
      logger.warn('Background refresh failed', { key, error }, 'CACHE');
    }
  }

  private isValid(entry: CacheEntry<any>, now: number): boolean {
    const age = now - entry.data.timestamp;
    return age < entry.config.maxAge;
  }

  private isStale(entry: CacheEntry<any>, now: number): boolean {
    const age = now - entry.data.timestamp;
    return age > entry.config.ttl;
  }

  private getCacheKey(key: string): string {
    return key;
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (!this.isValid(entry, now)) {
        toDelete.push(key);
      }
    }

    if (toDelete.length > 0) {
      toDelete.forEach(key => this.cache.delete(key));
      this.saveToStorage();
      logger.debug('Cache cleanup completed', { deletedEntries: toDelete.length }, 'CACHE');
    }
  }

  private saveToStorage(): void {
    try {
      const serialized = Array.from(this.cache.entries()).map(([key, entry]) => [
        key,
        {
          ...entry,
          data: {
            ...entry.data,
            // Don't serialize functions or complex objects
            data: JSON.parse(JSON.stringify(entry.data.data)),
          },
        },
      ]);
      
      localStorage.setItem('bus-tracker-cache', JSON.stringify(serialized));
    } catch (error) {
      logger.warn('Failed to save cache to storage', { error }, 'CACHE');
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('bus-tracker-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed);
        logger.debug('Cache loaded from storage', { entries: this.cache.size }, 'CACHE');
      }
    } catch (error) {
      logger.warn('Failed to load cache from storage', { error }, 'CACHE');
      this.cache = new Map();
    }
  }
}

// Singleton instance
export const dataCacheManager = new DataCacheManager();