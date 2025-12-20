/**
 * Unified Cache Management System
 * 
 * Consolidates 3 separate cache implementations into a single, efficient system:
 * - Services cache manager (TTL, event-driven updates)
 * - Hooks cache manager (request deduplication)
 * - Store cache manager (LRU, memory pressure detection)
 */

export { UnifiedCacheManager } from './UnifiedCacheManager';
export type { CacheConfig, CacheEntry, CacheStats, CacheEvent } from './types';
export { createCacheKey, CACHE_CONFIGS } from './utils';
export { unifiedCache } from './instance';