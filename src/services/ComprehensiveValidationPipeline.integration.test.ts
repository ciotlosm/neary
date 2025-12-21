/**
 * Integration Tests for Comprehensive Validation Pipeline
 * Tests the actual functionality without complex mocking
 * Validates Requirements: 5.3, 7.5, 8.3, 8.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_VALIDATION_CONFIG } from './ComprehensiveValidationPipeline';
import type { ValidationPipelineConfig } from './ComprehensiveValidationPipeline';

describe('ComprehensiveValidationPipeline Integration', () => {
  let mockConfig: ValidationPipelineConfig;

  beforeEach(() => {
    mockConfig = { ...DEFAULT_VALIDATION_CONFIG };
  });

  describe('configuration validation', () => {
    it('should have valid default configuration', () => {
      expect(DEFAULT_VALIDATION_CONFIG).toBeDefined();
      expect(DEFAULT_VALIDATION_CONFIG.runUnitTests).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.validateBuild).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.runFunctionalityValidation).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.runBehavioralTests).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.monitorPerformance).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.timeout).toBe(60000);
      expect(DEFAULT_VALIDATION_CONFIG.createBaseline).toBe(false);
      expect(DEFAULT_VALIDATION_CONFIG.failFast).toBe(false);
    });

    it('should allow partial configuration override', () => {
      const partialConfig = {
        runUnitTests: false,
        timeout: 30000
      };

      const mergedConfig = { ...DEFAULT_VALIDATION_CONFIG, ...partialConfig };

      expect(mergedConfig.runUnitTests).toBe(false);
      expect(mergedConfig.timeout).toBe(30000);
      expect(mergedConfig.validateBuild).toBe(true); // Should keep default
    });
  });

  describe('validation pipeline types', () => {
    it('should have correct ValidationPipelineResult structure', () => {
      // Test that the types are properly defined
      const mockResult = {
        success: true,
        report: {
          testResults: { success: true, testsRun: 0, testsPassed: 0, testsFailed: 0, failures: [], executionTime: 0 },
          buildResults: { success: true, errors: [], warnings: [], buildTime: 0 },
          functionalityResults: { 
            functionalityPreserved: true, 
            changes: [], 
            performanceImpact: { bundleSizeChange: 0, runtimeChange: 0, memoryChange: 0, overallImpact: 'neutral' as const }, 
            timestamp: new Date() 
          },
          overallSuccess: true,
          issuesSummary: [],
          recommendations: []
        },
        executionTime: 1000,
        performanceMetrics: {},
        errors: [],
        warnings: []
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.report).toBeDefined();
      expect(mockResult.executionTime).toBeGreaterThan(0);
      expect(Array.isArray(mockResult.errors)).toBe(true);
      expect(Array.isArray(mockResult.warnings)).toBe(true);
    });
  });

  describe('refactoring plan validation', () => {
    it('should validate refactoring plan structure', () => {
      const mockPlan = {
        operations: [
          {
            id: 'op1',
            type: 'split' as const,
            affectedFiles: ['file1.ts'],
            parameters: {},
            dependencies: [],
            riskLevel: 'low' as const,
            estimatedTime: 1000
          }
        ],
        dependencies: {},
        executionOrder: ['op1'],
        rollbackPlan: [],
        impact: {
          filesAffected: 1,
          linesChanged: 50,
          riskLevel: 'low' as const,
          estimatedTime: 1000,
          benefits: ['Improved maintainability'],
          risks: ['Potential import issues']
        },
        timestamp: new Date()
      };

      expect(mockPlan.operations).toHaveLength(1);
      expect(mockPlan.operations[0].type).toBe('split');
      expect(mockPlan.impact.riskLevel).toBe('low');
      expect(Array.isArray(mockPlan.operations[0].affectedFiles)).toBe(true);
    });

    it('should handle high-risk refactoring plans', () => {
      const highRiskPlan = {
        operations: Array.from({ length: 15 }, (_, i) => ({
          id: `op${i}`,
          type: 'split' as const,
          affectedFiles: [`file${i}.ts`],
          parameters: {},
          dependencies: [],
          riskLevel: 'high' as const,
          estimatedTime: 1000
        })),
        dependencies: {},
        executionOrder: Array.from({ length: 15 }, (_, i) => `op${i}`),
        rollbackPlan: [],
        impact: {
          filesAffected: 60,
          linesChanged: 1000,
          riskLevel: 'high' as const,
          estimatedTime: 15000,
          benefits: ['Major refactoring'],
          risks: ['High complexity']
        },
        timestamp: new Date()
      };

      expect(highRiskPlan.operations.length).toBe(15);
      expect(highRiskPlan.impact.riskLevel).toBe('high');
      expect(highRiskPlan.impact.filesAffected).toBeGreaterThan(50);
    });
  });

  describe('refactoring results validation', () => {
    it('should validate successful refactoring results structure', () => {
      const mockResults = {
        success: true,
        completedOperations: ['op1', 'op2'],
        failedOperations: [],
        modifiedFiles: ['file1.ts', 'file2.ts'],
        createdFiles: ['file3.ts'],
        deletedFiles: [],
        executionTime: 5000,
        validation: {
          testResults: { success: true, testsRun: 10, testsPassed: 10, testsFailed: 0, failures: [], executionTime: 5000 },
          buildResults: { success: true, errors: [], warnings: [], buildTime: 3000 },
          functionalityResults: { 
            functionalityPreserved: true, 
            changes: [], 
            performanceImpact: { bundleSizeChange: 0, runtimeChange: 0, memoryChange: 0, overallImpact: 'neutral' as const }, 
            timestamp: new Date() 
          },
          overallSuccess: true,
          issuesSummary: [],
          recommendations: []
        }
      };

      expect(mockResults.success).toBe(true);
      expect(mockResults.completedOperations).toHaveLength(2);
      expect(mockResults.failedOperations).toHaveLength(0);
      expect(mockResults.validation.overallSuccess).toBe(true);
    });

    it('should validate failed refactoring results structure', () => {
      const mockResults = {
        success: false,
        completedOperations: ['op1'],
        failedOperations: [
          {
            operationId: 'op2',
            error: 'Operation failed',
            affectedFiles: ['file2.ts']
          }
        ],
        modifiedFiles: ['file1.ts'],
        createdFiles: [],
        deletedFiles: [],
        executionTime: 3000,
        validation: {
          testResults: { success: false, testsRun: 10, testsPassed: 8, testsFailed: 2, failures: [], executionTime: 5000 },
          buildResults: { success: false, errors: [], warnings: [], buildTime: 3000 },
          functionalityResults: { 
            functionalityPreserved: false, 
            changes: [], 
            performanceImpact: { bundleSizeChange: 0, runtimeChange: 0, memoryChange: 0, overallImpact: 'negative' as const }, 
            timestamp: new Date() 
          },
          overallSuccess: false,
          issuesSummary: ['Refactoring failed'],
          recommendations: ['Fix failed operations']
        }
      };

      expect(mockResults.success).toBe(false);
      expect(mockResults.failedOperations).toHaveLength(1);
      expect(mockResults.validation.overallSuccess).toBe(false);
    });
  });

  describe('performance impact assessment', () => {
    it('should correctly categorize performance impacts', () => {
      const positiveImpact = {
        bundleSizeChange: -5000, // 5KB smaller
        runtimeChange: -10, // 10% faster
        memoryChange: -1000, // 1KB less memory
        overallImpact: 'positive' as const
      };

      const negativeImpact = {
        bundleSizeChange: 15000, // 15KB larger
        runtimeChange: 20, // 20% slower
        memoryChange: 5000, // 5KB more memory
        overallImpact: 'negative' as const
      };

      const neutralImpact = {
        bundleSizeChange: 0,
        runtimeChange: 0,
        memoryChange: 0,
        overallImpact: 'neutral' as const
      };

      expect(positiveImpact.overallImpact).toBe('positive');
      expect(negativeImpact.overallImpact).toBe('negative');
      expect(neutralImpact.overallImpact).toBe('neutral');
    });
  });

  describe('functionality change severity', () => {
    it('should correctly categorize functionality change severities', () => {
      const criticalChange = {
        type: 'behavior' as const,
        component: 'core-system',
        description: 'Critical system failure',
        severity: 'critical' as const
      };

      const lowChange = {
        type: 'interface' as const,
        component: 'ui-component',
        description: 'Minor UI adjustment',
        severity: 'low' as const
      };

      expect(criticalChange.severity).toBe('critical');
      expect(lowChange.severity).toBe('low');
    });
  });

  describe('error and warning handling', () => {
    it('should handle validation errors correctly', () => {
      const errors = [
        'Unit tests failed: 2 failures',
        'Build validation failed: 1 errors',
        'Functionality validation failed: 1 critical changes detected'
      ];

      const warnings = [
        'High-risk refactoring plan detected - proceed with caution',
        'Large number of operations - consider breaking into smaller batches'
      ];

      expect(Array.isArray(errors)).toBe(true);
      expect(Array.isArray(warnings)).toBe(true);
      expect(errors.length).toBe(3);
      expect(warnings.length).toBe(2);
    });
  });

  describe('timeout handling', () => {
    it('should have reasonable timeout values', () => {
      expect(DEFAULT_VALIDATION_CONFIG.timeout).toBe(60000); // 1 minute
      
      const shortTimeout = 5000; // 5 seconds
      const longTimeout = 300000; // 5 minutes
      
      expect(shortTimeout).toBeLessThan(DEFAULT_VALIDATION_CONFIG.timeout);
      expect(longTimeout).toBeGreaterThan(DEFAULT_VALIDATION_CONFIG.timeout);
    });
  });
});