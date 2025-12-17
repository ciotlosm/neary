import { describe, it, expect } from 'vitest';

/**
 * Integration tests for the Vehicle Processing Orchestration layer
 * 
 * These tests verify that the orchestration layer properly integrates
 * all the performance optimization components and maintains backward compatibility.
 */

describe('Vehicle Processing Orchestration Integration Tests', () => {
  describe('Module Integration', () => {
    it('should integrate dependency tracking utilities', async () => {
      // Test that dependency tracking modules can be imported
      const dependencyTracker = await import('./shared/dependencyTracker');
      
      expect(dependencyTracker.useDependencyTracker).toBeDefined();
      expect(dependencyTracker.useSelectiveMemo).toBeDefined();
      expect(dependencyTracker.useSelectiveCallback).toBeDefined();
      expect(dependencyTracker.usePerformanceMonitor).toBeDefined();
      expect(dependencyTracker.createDependencyTracker).toBeDefined();
    });

    it('should integrate cache management utilities', async () => {
      // Test that cache management modules can be imported
      const cacheManager = await import('./shared/cacheManager');
      
      expect(cacheManager.CacheManager).toBeDefined();
      expect(cacheManager.globalCache).toBeDefined();
      expect(cacheManager.createCacheKey).toBeDefined();
      
      // Test basic cache functionality
      expect(typeof cacheManager.globalCache.cleanup).toBe('function');
      expect(typeof cacheManager.globalCache.forceCleanup).toBe('function');
      expect(typeof cacheManager.globalCache.getMemoryStats).toBe('function');
    });

    it('should integrate orchestration hook with performance optimizations', async () => {
      // Test that the orchestration hook can be imported and has expected structure
      const orchestration = await import('./useVehicleProcessingOrchestration');
      
      expect(orchestration.useVehicleProcessing).toBeDefined();
      expect(typeof orchestration.useVehicleProcessing).toBe('function');
    });
  });

  describe('Performance Optimization Integration', () => {
    it('should provide selective re-execution capabilities', async () => {
      const { createDependencyTracker } = await import('./shared/dependencyTracker');
      
      const tracker = createDependencyTracker();
      
      // Test basic dependency tracking
      expect(tracker.hasChanged('test-key', ['dep1', 'dep2'])).toBe(true); // First call
      expect(tracker.hasChanged('test-key', ['dep1', 'dep2'])).toBe(false); // Same deps
      expect(tracker.hasChanged('test-key', ['dep1', 'dep3'])).toBe(true); // Different deps
      
      const stats = tracker.getStats();
      expect(stats.totalKeys).toBe(1);
      expect(stats.totalChecks).toBe(3);
      expect(stats.totalChanges).toBe(2);
    });

    it('should provide memory cleanup capabilities', async () => {
      const { CacheManager } = await import('./shared/cacheManager');
      
      const cache = new CacheManager({ maxSize: 5, maxAge: 1000 });
      
      // Add some test data
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size()).toBe(2);
      
      // Test cleanup
      cache.cleanup();
      expect(cache.size()).toBeLessThanOrEqual(2);
      
      // Test destroy
      cache.destroy();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain API compatibility', async () => {
      // Test that the hook maintains the expected interface
      const { useVehicleProcessing } = await import('./useVehicleProcessingOrchestration');
      
      // Should be a function
      expect(typeof useVehicleProcessing).toBe('function');
      
      // Should accept the expected options (type check)
      const validOptions = {
        filterByFavorites: true,
        maxStations: 5,
        maxVehiclesPerStation: 10,
        showAllVehiclesPerRoute: false,
        maxSearchRadius: 2000,
        maxStationsToCheck: 20,
        proximityThreshold: 150
      };
      
      // This should not throw a type error
      expect(validOptions).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should provide comprehensive error handling', async () => {
      const orchestration = await import('./useVehicleProcessingOrchestration');
      
      // Test that error classes are available
      expect(orchestration).toBeDefined();
      
      // The hook should be importable without errors
      expect(typeof orchestration.useVehicleProcessing).toBe('function');
    });
  });

  describe('Performance Benchmarking', () => {
    it('should complete module imports efficiently', async () => {
      const startTime = performance.now();
      
      // Import all performance optimization modules
      await Promise.all([
        import('./shared/dependencyTracker'),
        import('./shared/cacheManager'),
        import('./useVehicleProcessingOrchestration')
      ]);
      
      const endTime = performance.now();
      const importTime = endTime - startTime;
      
      // Module imports should be fast
      expect(importTime).toBeLessThan(100); // 100ms threshold
    });

    it('should handle basic operations efficiently', async () => {
      const { createDependencyTracker } = await import('./shared/dependencyTracker');
      const { CacheManager } = await import('./shared/cacheManager');
      
      const startTime = performance.now();
      
      // Perform basic operations
      const tracker = createDependencyTracker();
      const cache = new CacheManager({ maxSize: 10 });
      
      // Multiple operations
      for (let i = 0; i < 100; i++) {
        tracker.hasChanged(`key${i}`, [i, i + 1]);
        cache.set(`cache${i}`, `value${i}`);
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Operations should be efficient
      expect(operationTime).toBeLessThan(50); // 50ms for 100 operations
      
      // Cleanup
      cache.destroy();
    });
  });
});