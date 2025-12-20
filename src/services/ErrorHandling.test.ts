/**
 * Error Handling Integration Tests
 * 
 * Tests the comprehensive error handling implementation including
 * DataValidator, ErrorReporter, and TransformationRetryManager.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataValidator } from './DataValidator';
import { ErrorReporter, ErrorCategory, ErrorSeverity } from './ErrorReporter';
import { TransformationRetryManager } from './TransformationRetryManager';
import { TransformationError } from '../types/transformationPipeline';
import type { TranzyVehicleResponse } from '../types/tranzyApi';
import type { TransformationContext } from '../types/presentationLayer';

describe('Error Handling Integration', () => {
  let dataValidator: DataValidator;
  let errorReporter: ErrorReporter;
  let retryManager: TransformationRetryManager;

  beforeEach(() => {
    dataValidator = new DataValidator();
    errorReporter = new ErrorReporter();
    retryManager = new TransformationRetryManager();
    
    // Reset statistics
    dataValidator.resetStats();
    errorReporter.clearErrorHistory();
    retryManager.resetStats();
  });

  describe('DataValidator', () => {
    it('should validate valid API response', () => {
      const validData: TranzyVehicleResponse[] = [
        {
          id: 'vehicle-1',
          route_id: 'route-1',
          trip_id: 'trip-1',
          label: 'Bus 123',
          latitude: 46.75,
          longitude: 23.6,
          timestamp: new Date().toISOString(),
          speed: 25,
          bearing: 180,
          wheelchair_accessible: 'WHEELCHAIR_ACCESSIBLE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        }
      ];

      const result = dataValidator.validateApiResponse(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBe(0);
    });

    it('should handle malformed API response with graceful degradation', () => {
      const malformedData: TranzyVehicleResponse[] = [
        {
          id: 'vehicle-1',
          route_id: 'route-1',
          trip_id: 'trip-1',
          label: 'Bus 123',
          latitude: 46.75,
          longitude: 23.6,
          timestamp: new Date().toISOString(),
          speed: 25,
          bearing: 180,
          wheelchair_accessible: 'WHEELCHAIR_ACCESSIBLE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        },
        {
          id: 'vehicle-2',
          route_id: 'route-2',
          trip_id: 'trip-2',
          label: 'Bus 456',
          latitude: 200, // Invalid latitude
          longitude: 23.6,
          timestamp: 'invalid-timestamp',
          speed: -10, // Invalid speed
          bearing: 400, // Invalid bearing
          wheelchair_accessible: 'INVALID_VALUE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        }
      ];

      const result = dataValidator.validateApiResponse(malformedData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBe(1);
      expect(result.recoverySuggestions.length).toBeGreaterThan(0);
      expect(Object.keys(result.fallbackValues).length).toBeGreaterThan(0);
    });

    it('should apply fallback values to correct malformed data', () => {
      const malformedData: TranzyVehicleResponse[] = [
        {
          id: 'vehicle-1',
          route_id: 'route-1',
          trip_id: 'trip-1',
          label: 'Bus 123',
          latitude: 46.75,
          longitude: 23.6,
          timestamp: new Date().toISOString(),
          speed: -10, // Invalid speed - should get fallback
          bearing: 400, // Invalid bearing - should get fallback
          wheelchair_accessible: 'WHEELCHAIR_ACCESSIBLE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        }
      ];

      const validation = dataValidator.validateApiResponse(malformedData);
      const correctedData = dataValidator.applyFallbackValues(malformedData, validation.fallbackValues);
      
      expect(correctedData[0].speed).toBe(0); // Fallback speed
      expect(correctedData[0].bearing).toBeUndefined(); // Fallback bearing
    });

    it('should filter out completely invalid vehicles', () => {
      const mixedData: TranzyVehicleResponse[] = [
        {
          id: 'vehicle-1',
          route_id: 'route-1',
          trip_id: 'trip-1',
          label: 'Bus 123',
          latitude: 46.75,
          longitude: 23.6,
          timestamp: new Date().toISOString(),
          speed: 25,
          bearing: 180,
          wheelchair_accessible: 'WHEELCHAIR_ACCESSIBLE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        },
        {
          id: '', // Missing ID
          route_id: '', // Missing route ID
          trip_id: 'trip-2',
          label: 'Bus 456',
          latitude: 200, // Invalid coordinates
          longitude: 400,
          timestamp: new Date().toISOString(),
          speed: 25,
          bearing: 180,
          wheelchair_accessible: 'WHEELCHAIR_ACCESSIBLE',
          bike_accessible: 'BIKE_ACCESSIBLE'
        }
      ];

      const validVehicles = dataValidator.filterValidVehicles(mixedData);
      
      expect(validVehicles).toHaveLength(1);
      expect(validVehicles[0].id).toBe('vehicle-1');
    });
  });

  describe('ErrorReporter', () => {
    it('should report transformation errors with proper categorization', async () => {
      const transformationError = new TransformationError(
        'Test transformation error',
        'test-step',
        {
          vehicleId: 'vehicle-1',
          recoverable: true,
          context: { testData: 'test' }
        }
      );

      await errorReporter.reportTransformationError(transformationError);
      
      const metrics = errorReporter.getErrorMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByCategory.get(ErrorCategory.TRANSFORMATION)).toBe(1);
      
      const reports = errorReporter.exportErrorReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].category).toBe(ErrorCategory.TRANSFORMATION);
      expect(reports[0].recoverable).toBe(true);
    });

    it('should track error patterns and trends', async () => {
      // Report multiple similar errors
      for (let i = 0; i < 3; i++) {
        const error = new TransformationError(
          'Repeated error pattern',
          'test-step',
          { recoverable: true }
        );
        await errorReporter.reportTransformationError(error);
      }

      const metrics = errorReporter.getErrorMetrics();
      expect(metrics.totalErrors).toBe(3);
      expect(metrics.commonErrorPatterns.length).toBeGreaterThan(0);
      
      const pattern = metrics.commonErrorPatterns[0];
      expect(pattern.count).toBe(3);
    });

    it('should provide error statistics for monitoring', async () => {
      // Report errors of different severities
      const criticalError = new TransformationError(
        'Critical error',
        'critical-step',
        { recoverable: false }
      );
      
      const recoverableError = new TransformationError(
        'Recoverable error',
        'recoverable-step',
        { recoverable: true }
      );

      await errorReporter.reportTransformationError(criticalError);
      await errorReporter.reportTransformationError(recoverableError);

      const metrics = errorReporter.getErrorMetrics();
      expect(metrics.totalErrors).toBe(2);
      expect(metrics.errorsBySeverity.get(ErrorSeverity.CRITICAL)).toBe(1);
      expect(metrics.errorsBySeverity.get(ErrorSeverity.MEDIUM)).toBe(1);
    });
  });

  describe('TransformationRetryManager', () => {
    it('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0;
      const failingOperation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };

      const result = await retryManager.executeWithRetry(
        failingOperation,
        'test-operation'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(attemptCount).toBe(3);
    });

    it('should fail after max retries are exhausted', async () => {
      const alwaysFailingOperation = async () => {
        throw new Error('Permanent failure');
      };

      const result = await retryManager.executeWithRetry(
        alwaysFailingOperation,
        'test-operation'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.attempts).toBeGreaterThan(1);
    });

    it('should use circuit breaker to prevent cascade failures', async () => {
      // Configure circuit breaker with low threshold for testing
      retryManager.setCircuitBreakerConfig('test-operation', {
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 1000,
        windowSize: 5000
      });

      const failingOperation = async () => {
        throw new Error('Service unavailable');
      };

      // First few operations should fail normally
      const result1 = await retryManager.executeWithRetry(failingOperation, 'test-operation');
      expect(result1.success).toBe(false);
      expect(result1.circuitBreakerTriggered).toBe(false);

      const result2 = await retryManager.executeWithRetry(failingOperation, 'test-operation');
      expect(result2.success).toBe(false);
      // Circuit breaker might trigger on second failure depending on timing
      
      // Circuit breaker should now be open
      const result3 = await retryManager.executeWithRetry(failingOperation, 'test-operation');
      expect(result3.success).toBe(false);
      expect(result3.circuitBreakerTriggered).toBe(true);
      expect(result3.attempts).toBe(0); // No attempts made due to circuit breaker
    });

    it('should execute graceful degradation with fallback', async () => {
      const primaryOperation = async () => {
        throw new Error('Primary service failed');
      };

      const fallbackOperation = async () => {
        return 'fallback-result';
      };

      const result = await retryManager.executeWithGracefulDegradation(
        primaryOperation,
        fallbackOperation,
        'test-operation'
      );

      expect(result).toBe('fallback-result');
    });

    it('should collect retry statistics for monitoring', async () => {
      const successfulOperation = async () => 'success';
      const failingOperation = async () => { throw new Error('failure'); };

      // Execute some operations
      await retryManager.executeWithRetry(successfulOperation, 'test-operation');
      await retryManager.executeWithRetry(failingOperation, 'test-operation');

      const stats = retryManager.getRetryStats();
      expect(stats.totalOperations).toBe(2);
      expect(stats.successfulOperations).toBe(1);
      expect(stats.failedOperations).toBe(1);
      expect(stats.successRate).toBe(0.5);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete transformation failure gracefully', async () => {
      const invalidContext: Partial<TransformationContext> = {
        favoriteRoutes: null as any, // Invalid type
        targetStations: 'invalid' as any, // Invalid type
        preferences: null as any,
        timestamp: 'invalid' as any // Invalid type
      };

      const contextValidation = dataValidator.validateTransformationContext(invalidContext as TransformationContext);
      
      expect(contextValidation.isValid).toBe(false);
      expect(contextValidation.errors.length).toBeGreaterThan(0);
      expect(contextValidation.recoverySuggestions.length).toBeGreaterThan(0);
      
      // Should provide fallback values
      expect(Object.keys(contextValidation.fallbackValues).length).toBeGreaterThan(0);
    });

    it('should maintain error statistics across all components', async () => {
      // Generate some validation errors
      const invalidData: TranzyVehicleResponse[] = [
        {
          id: '',
          route_id: '',
          trip_id: 'trip-1',
          label: 'Bus 123',
          latitude: 200,
          longitude: 400,
          timestamp: 'invalid',
          speed: -10,
          bearing: 400,
          wheelchair_accessible: 'INVALID',
          bike_accessible: 'BIKE_ACCESSIBLE'
        }
      ];

      dataValidator.validateApiResponse(invalidData);

      // Generate some transformation errors
      const transformationError = new TransformationError(
        'Test error',
        'test-step',
        { recoverable: true }
      );
      await errorReporter.reportTransformationError(transformationError);

      // Execute some retry operations
      const failingOp = async () => { throw new Error('Test failure'); };
      await retryManager.executeWithRetry(failingOp, 'test-operation');

      // Check that all components have recorded statistics
      const validationStats = dataValidator.getValidationStats();
      const errorMetrics = errorReporter.getErrorMetrics();
      const retryStats = retryManager.getRetryStats();

      expect(validationStats.totalValidations).toBeGreaterThan(0);
      expect(errorMetrics.totalErrors).toBeGreaterThan(0);
      expect(retryStats.totalOperations).toBeGreaterThan(0);
    });
  });
});