import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { 
  createDependencyTracker, 
  useDependencyTracker, 
  useSelectiveMemo,
  useSelectiveCallback,
  usePerformanceMonitor 
} from './dependencyTracker';

/**
 * **Feature: hook-refactoring, Property 12: Selective Re-execution**
 * **Validates: Requirements 4.3**
 * 
 * Property: For any dependency change in the hook system, only the processing steps 
 * that depend on the changed data should re-execute
 */

describe('Dependency Tracker Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 12: Selective Re-execution', () => {
    it('should only re-execute when dependencies actually change', () => {
      fc.assert(
        fc.property(
          // Generate arrays of primitive values as dependencies
          fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean()), { minLength: 1, maxLength: 10 }),
          fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean()), { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1, maxLength: 20 }), // key
          (initialDeps, newDeps, key) => {
            const tracker = createDependencyTracker();
            let executionCount = 0;
            
            // Mock expensive computation
            const expensiveComputation = vi.fn(() => {
              executionCount++;
              return `result-${executionCount}`;
            });

            // First call - should always execute
            const hasChanged1 = tracker.hasChanged(key, initialDeps);
            expect(hasChanged1).toBe(true); // First call always returns true
            
            const result1 = expensiveComputation();
            tracker.updateDependencies(key, initialDeps);

            // Second call with same dependencies - should not execute
            const hasChanged2 = tracker.hasChanged(key, initialDeps);
            expect(hasChanged2).toBe(false); // Same dependencies
            
            let result2 = result1; // Simulate not calling expensive computation
            if (hasChanged2) {
              result2 = expensiveComputation();
              tracker.updateDependencies(key, initialDeps);
            }

            // Third call with different dependencies - should execute only if actually different
            const actuallyDifferent = JSON.stringify(initialDeps) !== JSON.stringify(newDeps);
            const hasChanged3 = tracker.hasChanged(key, newDeps);
            
            expect(hasChanged3).toBe(actuallyDifferent);
            
            let result3 = result2; // Simulate not calling expensive computation
            if (hasChanged3) {
              result3 = expensiveComputation();
              tracker.updateDependencies(key, newDeps);
            }

            // Verify execution count matches expectation
            const expectedExecutions = actuallyDifferent ? 2 : 1;
            expect(executionCount).toBe(expectedExecutions);

            // Verify results are consistent
            if (!actuallyDifferent) {
              expect(result1).toBe(result2);
              expect(result2).toBe(result3);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle complex object dependencies correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string(),
            count: fc.integer(),
            nested: fc.record({
              value: fc.string(),
              flag: fc.boolean()
            })
          }),
          fc.record({
            id: fc.string(),
            count: fc.integer(),
            nested: fc.record({
              value: fc.string(),
              flag: fc.boolean()
            })
          }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (obj1, obj2, key) => {
            const tracker = createDependencyTracker();
            let executionCount = 0;

            const computation = () => {
              executionCount++;
              return `computed-${executionCount}`;
            };

            // First execution
            expect(tracker.hasChanged(key, [obj1])).toBe(true);
            computation();
            tracker.updateDependencies(key, [obj1]);

            // Second execution with same object
            expect(tracker.hasChanged(key, [obj1])).toBe(false);

            // Third execution with potentially different object
            const actuallyDifferent = JSON.stringify(obj1) !== JSON.stringify(obj2);
            expect(tracker.hasChanged(key, [obj2])).toBe(actuallyDifferent);

            if (actuallyDifferent) {
              computation();
              tracker.updateDependencies(key, [obj2]);
            }

            const expectedExecutions = actuallyDifferent ? 2 : 1;
            expect(executionCount).toBe(expectedExecutions);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track multiple keys independently', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 }), // keys
          fc.array(fc.array(fc.integer(), { minLength: 1, maxLength: 5 }), { minLength: 2, maxLength: 5 }), // dependencies per key
          (keys, depArrays) => {
            // Ensure we have matching arrays
            const minLength = Math.min(keys.length, depArrays.length);
            const testKeys = keys.slice(0, minLength);
            const testDeps = depArrays.slice(0, minLength);

            const tracker = createDependencyTracker();
            const executionCounts = new Map<string, number>();

            // Initialize all keys
            testKeys.forEach((key, index) => {
              executionCounts.set(key, 0);
              expect(tracker.hasChanged(key, testDeps[index])).toBe(true);
              executionCounts.set(key, 1);
              tracker.updateDependencies(key, testDeps[index]);
            });

            // Test that changing one key doesn't affect others
            if (testKeys.length > 1) {
              const keyToChange = testKeys[0];
              const unchangedKeys = testKeys.slice(1);
              const newDeps = [...testDeps[0], 999]; // Add element to make it different

              // Change first key
              expect(tracker.hasChanged(keyToChange, newDeps)).toBe(true);
              executionCounts.set(keyToChange, 2);
              tracker.updateDependencies(keyToChange, newDeps);

              // Verify other keys are unchanged
              unchangedKeys.forEach((key, index) => {
                const originalDeps = testDeps[index + 1];
                expect(tracker.hasChanged(key, originalDeps)).toBe(false);
                // Execution count should remain 1
                expect(executionCounts.get(key)).toBe(1);
              });
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('useSelectiveMemo hook', () => {
    it('should only recompute when dependencies change', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1, maxLength: 5 }),
          fc.array(fc.integer(), { minLength: 1, maxLength: 5 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (deps1, deps2, key) => {
            let computationCount = 0;
            const factory = vi.fn(() => {
              computationCount++;
              return `result-${computationCount}`;
            });

            const { result, rerender } = renderHook(
              ({ dependencies, factoryFn, memoKey }) => 
                useSelectiveMemo(factoryFn, dependencies, memoKey),
              {
                initialProps: {
                  dependencies: deps1,
                  factoryFn: factory,
                  memoKey: key
                }
              }
            );

            // First render should compute
            expect(factory).toHaveBeenCalledTimes(1);
            const firstResult = result.current;

            // Rerender with same dependencies - should not recompute
            rerender({
              dependencies: deps1,
              factoryFn: factory,
              memoKey: key
            });

            expect(factory).toHaveBeenCalledTimes(1); // Still 1
            expect(result.current).toBe(firstResult);

            // Rerender with different dependencies - should recompute only if actually different
            const actuallyDifferent = JSON.stringify(deps1) !== JSON.stringify(deps2);
            
            rerender({
              dependencies: deps2,
              factoryFn: factory,
              memoKey: key
            });

            const expectedCalls = actuallyDifferent ? 2 : 1;
            expect(factory).toHaveBeenCalledTimes(expectedCalls);

            if (actuallyDifferent) {
              expect(result.current).not.toBe(firstResult);
            } else {
              expect(result.current).toBe(firstResult);
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('useSelectiveCallback hook', () => {
    it('should only recreate callback when dependencies change', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
          fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (deps1, deps2, key) => {
            // Create different callback functions to test recreation
            const callback1 = vi.fn((x: number) => x * 2);
            const callback2 = vi.fn((x: number) => x * 3);

            const { result, rerender } = renderHook(
              ({ dependencies, cb, callbackKey }) => 
                useSelectiveCallback(cb, dependencies, callbackKey),
              {
                initialProps: {
                  dependencies: deps1,
                  cb: callback1,
                  callbackKey: key
                }
              }
            );

            const firstCallback = result.current;

            // Rerender with same dependencies and same callback - should return same callback
            rerender({
              dependencies: deps1,
              cb: callback1,
              callbackKey: key
            });

            expect(result.current).toBe(firstCallback);

            // Rerender with different dependencies - should use new callback only if dependencies actually different
            const actuallyDifferent = JSON.stringify(deps1) !== JSON.stringify(deps2);
            
            rerender({
              dependencies: deps2,
              cb: actuallyDifferent ? callback2 : callback1, // Use different callback only if deps are different
              callbackKey: key
            });

            if (actuallyDifferent) {
              // Should be the new callback since dependencies changed
              expect(result.current).toBe(callback2);
              expect(result.current).not.toBe(firstCallback);
            } else {
              // Should still be the original callback since dependencies didn't change
              expect(result.current).toBe(firstCallback);
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Performance Monitor', () => {
    it('should accurately track execution metrics', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 5, maxLength: 20 }), // execution times
          fc.array(fc.boolean(), { minLength: 5, maxLength: 20 }), // cache hit flags
          fc.string({ minLength: 1, maxLength: 10 }), // key
          (executionTimes, cacheHits, key) => {
            const minLength = Math.min(executionTimes.length, cacheHits.length);
            const times = executionTimes.slice(0, minLength);
            const hits = cacheHits.slice(0, minLength);

            const { result } = renderHook(() => usePerformanceMonitor(key));
            const monitor = result.current;

            // Record all executions
            times.forEach((time, index) => {
              monitor.recordExecution(time, hits[index]);
            });

            const metrics = monitor.getMetrics();

            // Verify metrics
            expect(metrics.totalExecutions).toBe(times.length);
            expect(metrics.executionTime).toBe(times.reduce((sum, time) => sum + time, 0));
            expect(metrics.averageExecutionTime).toBeCloseTo(
              times.reduce((sum, time) => sum + time, 0) / times.length,
              2
            );
            expect(metrics.cacheHits).toBe(hits.filter(hit => hit).length);
            expect(metrics.cacheMisses).toBe(hits.filter(hit => !hit).length);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Dependency Tracker Statistics', () => {
    it('should provide accurate statistics', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              dependencies: fc.array(fc.integer(), { minLength: 1, maxLength: 5 }),
              checkCount: fc.integer({ min: 1, max: 10 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (operations) => {
            const tracker = createDependencyTracker();
            let totalExpectedChecks = 0;
            let totalExpectedChanges = 0;

            operations.forEach(({ key, dependencies, checkCount }) => {
              // First check is always a change
              tracker.hasChanged(key, dependencies);
              tracker.updateDependencies(key, dependencies);
              totalExpectedChecks++;
              totalExpectedChanges++;

              // Additional checks with same dependencies (no changes)
              for (let i = 1; i < checkCount; i++) {
                tracker.hasChanged(key, dependencies);
                totalExpectedChecks++;
              }
            });

            const stats = tracker.getStats();
            
            expect(stats.totalKeys).toBe(new Set(operations.map(op => op.key)).size);
            expect(stats.totalChecks).toBe(totalExpectedChecks);
            expect(stats.totalChanges).toBe(totalExpectedChanges);
            expect(stats.changeRate).toBeCloseTo(totalExpectedChanges / totalExpectedChecks, 2);

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});