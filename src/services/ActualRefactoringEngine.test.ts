/**
 * ActualRefactoringEngine Tests
 * Tests the real refactoring engine functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActualRefactoringEngine } from './ActualRefactoringEngine.js';
import type { DuplicationReport, FileInfo, StructureReport, NamingReport } from '../types/architectureSimplification.js';

describe('ActualRefactoringEngine', () => {
  let engine: ActualRefactoringEngine;
  const testProjectRoot = process.cwd();

  beforeEach(() => {
    engine = new ActualRefactoringEngine(testProjectRoot);
  });

  describe('Plan Generation', () => {
    it('should generate consolidation plan for duplicates', async () => {
      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'test-pattern',
            files: ['test-file1.ts', 'test-file2.ts'],
            content: 'console.log("duplicate code");',
            locations: [
              { file: 'test-file1.ts', startLine: 10, endLine: 12 },
              { file: 'test-file2.ts', startLine: 15, endLine: 17 }
            ],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/shared/',
              suggestedName: 'testUtility',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 10,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);

      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('consolidate');
      expect(plan.operations[0].riskLevel).toBe('medium');
      expect(plan.impact.benefits).toContain('Reduced code duplication');
      expect(plan.impact.risks).toContain('Potential import path issues');
    });

    it('should generate split plan for large files', async () => {
      const oversizedFiles: FileInfo[] = [
        {
          path: 'src/services/LargeService.ts',
          lineCount: 350,
          complexity: 25,
          dependencies: ['fs', 'path'],
          exports: ['LargeService', 'helper'],
          sizeBytes: 15000,
          fileType: 'ts',
          lastModified: new Date()
        }
      ];

      const plan = await engine.splitLargeFiles(oversizedFiles);

      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('split');
      expect(plan.operations[0].riskLevel).toBe('medium');
      expect(plan.impact.benefits).toContain('Improved file organization');
    });

    it('should generate reorganization plan for overcrowded folders', async () => {
      const structureReport: StructureReport = {
        overcrowdedFolders: [
          {
            path: 'src/services',
            fileCount: 25,
            subfolderCount: 0,
            totalSize: 500000,
            files: Array.from({ length: 25 }, (_, i) => `service${i}.ts`),
            subfolders: []
          }
        ],
        reorganizationSuggestions: [],
        depthAnalysis: {
          maxDepth: 3,
          averageDepth: 2,
          deepFolders: []
        }
      };

      const plan = await engine.reorganizeFolders(structureReport);

      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('move');
      expect(plan.operations[0].riskLevel).toBe('high');
      expect(plan.impact.benefits).toContain('Better folder organization');
    });

    it('should generate rename plan for naming issues', async () => {
      const namingReport: NamingReport = {
        namingIssues: [
          {
            file: 'src/utils/hlpr.ts',
            issueType: 'abbreviation',
            currentName: 'hlpr.ts',
            suggestedName: 'src/utils/helper.ts',
            reason: 'Avoid abbreviations in file names'
          }
        ],
        namingSuggestions: [],
        patternAnalysis: {
          patterns: [],
          inconsistencies: [],
          suggestedConventions: []
        }
      };

      const plan = await engine.renameFiles(namingReport);

      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('rename');
      expect(plan.operations[0].riskLevel).toBe('low');
      expect(plan.impact.benefits).toContain('Clearer file names');
    });
  });

  describe('Plan Structure Validation', () => {
    it('should create valid operation structures', async () => {
      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'test-pattern',
            files: ['test1.ts', 'test2.ts'],
            content: 'test code',
            locations: [],
            similarity: 0.8,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'testUtil',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 5,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);

      // Validate operation structure
      const operation = plan.operations[0];
      expect(operation.id).toBeDefined();
      expect(operation.type).toBe('consolidate');
      expect(operation.affectedFiles).toBeInstanceOf(Array);
      expect(operation.parameters).toBeDefined();
      expect(operation.dependencies).toBeInstanceOf(Array);
      expect(operation.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(operation.estimatedTime).toBeGreaterThan(0);

      // Validate plan structure
      expect(plan.dependencies).toBeDefined();
      expect(plan.executionOrder).toBeInstanceOf(Array);
      expect(plan.rollbackPlan).toBeInstanceOf(Array);
      expect(plan.impact).toBeDefined();
      expect(plan.timestamp).toBeInstanceOf(Date);

      // Validate impact assessment
      expect(plan.impact.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(plan.impact.estimatedTime).toBeGreaterThan(0);
      expect(plan.impact.filesAffected).toBeGreaterThan(0);
      expect(plan.impact.benefits).toBeInstanceOf(Array);
      expect(plan.impact.risks).toBeInstanceOf(Array);
    });

    it('should handle empty reports gracefully', async () => {
      const emptyDuplicationReport: DuplicationReport = {
        patterns: [],
        totalDuplicates: 0,
        potentialSavings: 0,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(emptyDuplicationReport);

      expect(plan.operations).toHaveLength(0);
      expect(plan.executionOrder).toHaveLength(0);
      expect(plan.impact.filesAffected).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidReport = {
        patterns: null,
        totalDuplicates: 0,
        potentialSavings: 0,
        timestamp: new Date()
      } as any;

      await expect(engine.consolidateDuplicates(invalidReport)).rejects.toThrow();
    });
  });
});