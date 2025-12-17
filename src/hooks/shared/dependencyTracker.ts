import { useRef, useMemo } from 'react';
import { logger } from '../../utils/logger';

/**
 * Dependency tracking for selective re-execution
 */
export interface DependencyTracker {
  /**
   * Check if dependencies have changed since last execution
   */
  hasChanged: (key: string, dependencies: any[]) => boolean;
  
  /**
   * Update dependencies for a given key
   */
  updateDependencies: (key: string, dependencies: any[]) => void;
  
  /**
   * Get statistics about dependency changes
   */
  getStats: () => DependencyStats;
  
  /**
   * Clear all tracked dependencies
   */
  clear: () => void;
}

/**
 * Statistics about dependency tracking
 */
export interface DependencyStats {
  totalKeys: number;
  totalChecks: number;
  totalChanges: number;
  changeRate: number;
  keyStats: Record<string, {
    checks: number;
    changes: number;
    lastChanged: Date | null;
  }>;
}

/**
 * Dependency entry for tracking
 */
interface DependencyEntry {
  dependencies: any[];
  lastUpdated: Date;
  checkCount: number;
  changeCount: number;
}

/**
 * Deep equality check for dependency comparison
 */
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * Create a dependency tracker instance
 */
export const createDependencyTracker = (): DependencyTracker => {
  const dependencies = new Map<string, DependencyEntry>();
  let totalChecks = 0;
  let totalChanges = 0;

  return {
    hasChanged: (key: string, newDependencies: any[]): boolean => {
      totalChecks++;
      
      const existing = dependencies.get(key);
      
      if (!existing) {
        // First time - always considered changed
        dependencies.set(key, {
          dependencies: [...newDependencies],
          lastUpdated: new Date(),
          checkCount: 1,
          changeCount: 1
        });
        totalChanges++;
        
        logger.debug('Dependency tracker: first check (changed)', {
          key,
          dependencyCount: newDependencies.length
        }, 'dependencyTracker');
        
        return true;
      }
      
      // Update check count
      existing.checkCount++;
      
      // Compare dependencies
      const hasChanged = !deepEqual(existing.dependencies, newDependencies);
      
      if (hasChanged) {
        existing.changeCount++;
        totalChanges++;
        
        logger.debug('Dependency tracker: dependencies changed', {
          key,
          checkCount: existing.checkCount,
          changeCount: existing.changeCount,
          oldDependencies: existing.dependencies,
          newDependencies
        }, 'dependencyTracker');
      } else {
        logger.debug('Dependency tracker: no change', {
          key,
          checkCount: existing.checkCount,
          changeCount: existing.changeCount
        }, 'dependencyTracker');
      }
      
      return hasChanged;
    },
    
    updateDependencies: (key: string, newDependencies: any[]): void => {
      const existing = dependencies.get(key);
      
      if (existing) {
        existing.dependencies = [...newDependencies];
        existing.lastUpdated = new Date();
      } else {
        dependencies.set(key, {
          dependencies: [...newDependencies],
          lastUpdated: new Date(),
          checkCount: 0,
          changeCount: 0
        });
      }
      
      logger.debug('Dependency tracker: updated dependencies', {
        key,
        dependencyCount: newDependencies.length
      }, 'dependencyTracker');
    },
    
    getStats: (): DependencyStats => {
      const keyStats: Record<string, any> = {};
      
      dependencies.forEach((entry, key) => {
        keyStats[key] = {
          checks: entry.checkCount,
          changes: entry.changeCount,
          lastChanged: entry.changeCount > 0 ? entry.lastUpdated : null
        };
      });
      
      return {
        totalKeys: dependencies.size,
        totalChecks,
        totalChanges,
        changeRate: totalChecks > 0 ? totalChanges / totalChecks : 0,
        keyStats
      };
    },
    
    clear: (): void => {
      dependencies.clear();
      totalChecks = 0;
      totalChanges = 0;
      
      logger.debug('Dependency tracker: cleared all dependencies', {}, 'dependencyTracker');
    }
  };
};

/**
 * React hook for dependency tracking with selective re-execution
 */
export const useDependencyTracker = (): DependencyTracker => {
  const trackerRef = useRef<DependencyTracker | null>(null);
  
  if (!trackerRef.current) {
    trackerRef.current = createDependencyTracker();
  }
  
  return trackerRef.current;
};

/**
 * Hook for selective memoization based on dependency tracking
 */
export const useSelectiveMemo = <T>(
  factory: () => T,
  dependencies: any[],
  key: string
): T => {
  const tracker = useDependencyTracker();
  const resultRef = useRef<T | undefined>(undefined);
  
  return useMemo(() => {
    const hasChanged = tracker.hasChanged(key, dependencies);
    
    if (hasChanged || resultRef.current === undefined) {
      logger.debug('Selective memo: recomputing', {
        key,
        hasChanged,
        isFirstComputation: resultRef.current === undefined
      }, 'useSelectiveMemo');
      
      resultRef.current = factory();
      tracker.updateDependencies(key, dependencies);
    } else {
      logger.debug('Selective memo: using cached result', {
        key
      }, 'useSelectiveMemo');
    }
    
    return resultRef.current;
  }, [factory, dependencies, key, tracker]);
};

/**
 * Hook for selective callback memoization
 */
export const useSelectiveCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[],
  key: string
): T => {
  const tracker = useDependencyTracker();
  const callbackRef = useRef<T | undefined>(undefined);
  
  return useMemo(() => {
    const hasChanged = tracker.hasChanged(key, dependencies);
    
    if (hasChanged || callbackRef.current === undefined) {
      logger.debug('Selective callback: creating new callback', {
        key,
        hasChanged,
        isFirstCreation: callbackRef.current === undefined
      }, 'useSelectiveCallback');
      
      callbackRef.current = callback;
      tracker.updateDependencies(key, dependencies);
    } else {
      logger.debug('Selective callback: using cached callback', {
        key
      }, 'useSelectiveCallback');
    }
    
    return callbackRef.current;
  }, [callback, dependencies, key, tracker]) as T;
};

/**
 * Performance monitoring for selective re-execution
 */
export interface PerformanceMetrics {
  executionTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalExecutions: number;
  averageExecutionTime: number;
}

/**
 * Hook for performance monitoring of selective operations
 */
export const usePerformanceMonitor = (key: string) => {
  const metricsRef = useRef<PerformanceMetrics>({
    executionTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalExecutions: 0,
    averageExecutionTime: 0
  });
  
  const recordExecution = (executionTime: number, wasCached: boolean) => {
    const metrics = metricsRef.current;
    
    metrics.totalExecutions++;
    metrics.executionTime += executionTime;
    metrics.averageExecutionTime = metrics.executionTime / metrics.totalExecutions;
    
    if (wasCached) {
      metrics.cacheHits++;
    } else {
      metrics.cacheMisses++;
    }
    
    logger.debug('Performance monitor: recorded execution', {
      key,
      executionTime,
      wasCached,
      totalExecutions: metrics.totalExecutions,
      averageExecutionTime: metrics.averageExecutionTime,
      cacheHitRate: metrics.cacheHits / metrics.totalExecutions
    }, 'performanceMonitor');
  };
  
  const getMetrics = (): PerformanceMetrics => ({ ...metricsRef.current });
  
  const reset = () => {
    metricsRef.current = {
      executionTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalExecutions: 0,
      averageExecutionTime: 0
    };
  };
  
  return { recordExecution, getMetrics, reset };
};