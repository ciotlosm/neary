/**
 * ActualRefactoringEngine Execution Tests
 * Tests the actual execution logic with mocked file operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActualRefactoringEngine } from './ActualRefactoringEngine.js';
import type { DuplicationReport } from '../types/architectureSimplification.js';

describe('ActualRefactoringEngine Execution', () => {
  let engine: ActualRefactoringEngine;
  const testProjectRoot = process.cwd();

  beforeEach(() => {
    engine = new ActualRefactoringEngine(testProjectRoot);
    
    // Mock the file system operations to avoid actual file changes
    engine.fsOps = {
      createFile: vi.fn().mockResolvedValue(undefined),
      modifyFile: vi.fn().mockResolvedValue(undefined),
      moveFile: vi.fn().mockResolvedValue(undefined),
      createDirectory: vi.fn().mockResolvedValue(undefined),
      fileExists: vi.fn().mockResolvedValue(true),
      readFile: vi.fn().mockResolvedValue('// Mock file content'),
      listFiles: vi.fn().mockResolvedValue(['file1.ts', 'file2.ts']),
      createBackup: vi.fn().mockResolvedValue('mock-backup-id'),
      restoreBackup: vi.fn().mockResolvedValue(undefined)
    } as any;

    // Mock the AST service
    engine.astService = {
      suggestFileSplit: vi.fn().mockResolvedValue({
        suggestedSplits: [
          {
            fileName: 'test.part1.ts',
            content: '// Split part 1'
          },
          {
            fileName: 'test.part2.ts', 
            content: '// Split part 2'
          }
        ],
        remainingContent: '// Remaining content'
      })
    } as any;

    // Mock the import resolver
    engine.importResolver = {
      updateImportPaths: vi.fn().mockResolvedValue([
        {
          filePath: 'some-file.ts',
          oldImport: 'old-path',
          newImport: 'new-path'
        }
      ]),
      createBarrelExports: vi.fn().mockResolvedValue(undefined)
    } as any;
  });

  describe('Plan Execution', () => {
    it('should execute consolidation plan successfully', async () => {
      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'test-pattern',
            files: ['src/file1.ts', 'src/file2.ts'],
            content: 'console.log("duplicate code");',
            locations: [
              { file: 'src/file1.ts', startLine: 10, endLine: 12 },
              { file: 'src/file2.ts', startLine: 15, endLine: 17 }
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

      // Generate plan
      const plan = await engine.consolidateDuplicates(mockDuplicationReport);
      expect(plan.operations).toHaveLength(1);

      // Execute plan
      const result = await engine.executeRefactoring(plan);

      // Verify execution results
      expect(result.success).toBe(true);
      expect(result.completedOperations).toHaveLength(1);
      expect(result.failedOperations).toHaveLength(0);
      expect(result.modifiedFiles.length).toBeGreaterThan(0);
      expect(result.createdFiles.length).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);

      // Verify file operations were called
      expect(engine.fsOps.createFile).toHaveBeenCalled();
      expect(engine.fsOps.modifyFile).toHaveBeenCalled();
      // Note: updateImportPaths might not be called for consolidation operations
      // depending on the implementation, so we'll verify the core operations
    });

    it('should handle execution errors gracefully', async () => {
      // Mock file operations to fail
      engine.fsOps.createFile = vi.fn().mockRejectedValue(new Error('File creation failed'));

      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'failing-pattern',
            files: ['src/file1.ts'],
            content: 'test content',
            locations: [],
            similarity: 0.8,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'failingUtility',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 5,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);
      const result = await engine.executeRefactoring(plan);

      // Should handle errors gracefully
      expect(result.success).toBe(false);
      expect(result.failedOperations).toHaveLength(1);
      expect(result.failedOperations[0].error).toContain('File creation failed');
    });

    it('should create backups before execution', async () => {
      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'backup-test',
            files: ['src/test.ts'],
            content: 'test',
            locations: [],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'backupTest',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 3,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);
      await engine.executeRefactoring(plan);

      // Verify backup was created
      expect(engine.fsOps.createBackup).toHaveBeenCalled();
    });

    it('should handle critical failures gracefully', async () => {
      // Mock a critical failure during execution
      engine.fsOps.createFile = vi.fn().mockImplementation(() => {
        throw new Error('Critical system error');
      });

      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'critical-failure',
            files: ['src/test.ts'],
            content: 'test',
            locations: [],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'criticalTest',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 3,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);
      
      // Should handle critical failure gracefully and return failure result
      const result = await engine.executeRefactoring(plan);
      
      expect(result.success).toBe(false);
      expect(result.failedOperations).toHaveLength(1);
      expect(result.failedOperations[0].error).toContain('Critical system error');
      
      // Should still create backup even if execution fails
      expect(engine.fsOps.createBackup).toHaveBeenCalled();
    });
  });

  describe('Validation Integration', () => {
    it('should generate validation report after execution', async () => {
      const mockDuplicationReport: DuplicationReport = {
        patterns: [
          {
            id: 'validation-test',
            files: ['src/test.ts'],
            content: 'test',
            locations: [],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'validationTest',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 3,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicationReport);
      const result = await engine.executeRefactoring(plan);

      // Should include validation report
      expect(result.validation).toBeDefined();
      expect(result.validation.testResults).toBeDefined();
      expect(result.validation.buildResults).toBeDefined();
      expect(result.validation.functionalityResults).toBeDefined();
    });
  });
});