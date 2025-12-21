/**
 * Tests for DuplicationConsolidationEngine
 * Validates Requirements: 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DuplicationConsolidationEngine, createDuplicationConsolidationEngine } from './DuplicationConsolidationEngine';
import type { 
  DuplicationReport, 
  DuplicatePattern, 
  ConsolidationSuggestion,
  FileInfo,
  SizeReport,
  StructureReport,
  NamingReport
} from '../types/architectureSimplification';

describe('DuplicationConsolidationEngine', () => {
  let engine: DuplicationConsolidationEngine;
  
  beforeEach(() => {
    engine = new DuplicationConsolidationEngine();
  });

  describe('Core Functionality Tests', () => {
    it('should create engine with default configuration', () => {
      expect(engine).toBeInstanceOf(DuplicationConsolidationEngine);
    });

    it('should create engine with custom root path', () => {
      const customEngine = new DuplicationConsolidationEngine('/custom/path');
      expect(customEngine).toBeInstanceOf(DuplicationConsolidationEngine);
    });
  });

  describe('Duplicate Consolidation', () => {
    it('should consolidate utility-type duplicates', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_1',
            files: ['src/utils/format.ts', 'src/services/api.ts'],
            content: 'function formatDate(date: Date): string {\n  return date.toISOString();\n}',
            locations: [
              { file: 'src/utils/format.ts', startLine: 10, endLine: 12 },
              { file: 'src/services/api.ts', startLine: 25, endLine: 27 }
            ],
            similarity: 0.95,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'formatDate',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 3,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('consolidate');
      expect(plan.operations[0].affectedFiles).toEqual(['src/utils/format.ts', 'src/services/api.ts']);
      expect(plan.operations[0].riskLevel).toBe('low');
      expect(plan.rollbackPlan).toHaveLength(1);
      expect(plan.impact.filesAffected).toBe(2);
      expect(plan.impact.benefits).toContain('Eliminate 1 duplicate patterns');
    });

    it('should consolidate merge-type duplicates', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_2',
            files: ['src/components/Button.tsx', 'src/components/Input.tsx'],
            content: 'const styles = {\n  padding: "8px",\n  border: "1px solid #ccc"\n};',
            locations: [
              { file: 'src/components/Button.tsx', startLine: 5, endLine: 8 },
              { file: 'src/components/Input.tsx', startLine: 12, endLine: 15 }
            ],
            similarity: 0.88,
            consolidationSuggestion: {
              approach: 'merge',
              targetLocation: 'src/components/shared/',
              suggestedName: 'SharedStyles',
              effort: 'medium'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 4,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.operations[0].riskLevel).toBe('medium');
      expect(plan.operations[0].parameters.config?.approach).toBe('merge');
    });

    it('should consolidate extract-type duplicates', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_3',
            files: ['src/services/UserService.ts', 'src/services/AdminService.ts'],
            content: 'class ValidationHelper {\n  validate(data: any): boolean {\n    return true;\n  }\n}',
            locations: [
              { file: 'src/services/UserService.ts', startLine: 15, endLine: 19 },
              { file: 'src/services/AdminService.ts', startLine: 8, endLine: 12 }
            ],
            similarity: 0.92,
            consolidationSuggestion: {
              approach: 'extract',
              targetLocation: 'src/services/',
              suggestedName: 'ValidationHelper',
              effort: 'high'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 5,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.operations[0].riskLevel).toBe('high');
      expect(plan.operations[0].parameters.config?.approach).toBe('extract');
    });

    it('should handle multiple duplicate patterns with dependencies', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_1',
            files: ['file1.ts', 'file2.ts'],
            content: 'utility function 1',
            locations: [
              { file: 'file1.ts', startLine: 1, endLine: 3 },
              { file: 'file2.ts', startLine: 1, endLine: 3 }
            ],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'util1',
              effort: 'low'
            }
          },
          {
            id: 'dup_2',
            files: ['file3.ts', 'file4.ts'],
            content: 'utility function 2',
            locations: [
              { file: 'file3.ts', startLine: 1, endLine: 3 },
              { file: 'file4.ts', startLine: 1, endLine: 3 }
            ],
            similarity: 0.85,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'util2',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 2,
        potentialSavings: 6,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.operations).toHaveLength(2);
      expect(plan.executionOrder).toHaveLength(2);
      expect(plan.dependencies[plan.operations[1].id]).toEqual([plan.operations[0].id]);
    });

    it('should calculate correct impact assessment', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_1',
            files: ['file1.ts', 'file2.ts', 'file3.ts'],
            content: 'function test() {\n  console.log("test");\n  return true;\n}',
            locations: [
              { file: 'file1.ts', startLine: 1, endLine: 4 },
              { file: 'file2.ts', startLine: 1, endLine: 4 },
              { file: 'file3.ts', startLine: 1, endLine: 4 }
            ],
            similarity: 0.95,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'testUtil',
              effort: 'medium'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 8, // 4 lines * 2 duplicate instances
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.impact.filesAffected).toBe(3);
      expect(plan.impact.linesChanged).toBe(12); // 4 lines * 3 files
      expect(plan.impact.benefits).toContain('Save approximately 8 lines of code');
      expect(plan.impact.risks).toContain('Potential breaking changes in imports');
    });
  });

  describe('File Splitting', () => {
    it('should split large files into smaller modules', async () => {
      const oversizedFiles: FileInfo[] = [
        {
          path: 'src/services/LargeService.ts',
          lineCount: 350,
          complexity: 25,
          dependencies: ['fs', 'path'],
          exports: ['LargeService', 'helper1', 'helper2'],
          sizeBytes: 15000,
          fileType: 'ts',
          lastModified: new Date()
        }
      ];

      const plan = await engine.splitLargeFiles(oversizedFiles);
      
      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('split');
      expect(plan.operations[0].affectedFiles).toEqual(['src/services/LargeService.ts']);
      expect(plan.operations[0].riskLevel).toBe('medium');
      expect(plan.impact.filesAffected).toBe(1);
      expect(plan.impact.linesChanged).toBe(350);
    });

    it('should handle multiple large files', async () => {
      const oversizedFiles: FileInfo[] = [
        {
          path: 'src/services/Service1.ts',
          lineCount: 250,
          complexity: 15,
          dependencies: [],
          exports: ['Service1'],
          sizeBytes: 10000,
          fileType: 'ts',
          lastModified: new Date()
        },
        {
          path: 'src/utils/Utils.ts',
          lineCount: 300,
          complexity: 20,
          dependencies: [],
          exports: ['util1', 'util2'],
          sizeBytes: 12000,
          fileType: 'ts',
          lastModified: new Date()
        }
      ];

      const plan = await engine.splitLargeFiles(oversizedFiles);
      
      expect(plan.operations).toHaveLength(2);
      expect(plan.impact.filesAffected).toBe(2);
      expect(plan.impact.linesChanged).toBe(550);
    });
  });

  describe('Folder Reorganization', () => {
    it('should reorganize overcrowded folders', async () => {
      const structureReport: StructureReport = {
        overcrowdedFolders: [],
        reorganizationSuggestions: [
          {
            currentPath: 'src/components',
            suggestedStructure: {
              name: 'components',
              files: [],
              subfolders: [
                { name: 'ui', files: ['Button.tsx', 'Input.tsx'], subfolders: [] },
                { name: 'features', files: ['UserProfile.tsx'], subfolders: [] }
              ]
            },
            reason: 'Too many files in components folder',
            effort: 'medium'
          }
        ],
        depthAnalysis: {
          maxDepth: 3,
          averageDepth: 2.5,
          deepFolders: []
        }
      };

      const plan = await engine.reorganizeFolders(structureReport);
      
      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('move');
      expect(plan.operations[0].riskLevel).toBe('medium');
    });
  });

  describe('File Renaming', () => {
    it('should rename files with naming issues', async () => {
      const namingReport: NamingReport = {
        namingIssues: [],
        namingSuggestions: [
          {
            currentName: 'btn',
            suggestedName: 'Button',
            filePath: 'src/components/btn.tsx',
            reason: 'Expand abbreviation for clarity'
          },
          {
            currentName: 'cfg',
            suggestedName: 'Config',
            filePath: 'src/utils/cfg.ts',
            reason: 'Expand abbreviation for clarity'
          }
        ],
        patternAnalysis: {
          patterns: ['camelCase dominant'],
          inconsistencies: ['Mixed abbreviations'],
          suggestedConventions: ['Use full words instead of abbreviations']
        }
      };

      const plan = await engine.renameFiles(namingReport);
      
      expect(plan.operations).toHaveLength(2);
      expect(plan.operations[0].type).toBe('rename');
      expect(plan.operations[0].riskLevel).toBe('low');
      expect(plan.operations[0].parameters.newNames).toEqual({ 'btn': 'Button' });
    });
  });

  describe('Refactoring Execution', () => {
    it('should execute a complete refactoring plan', async () => {
      const mockPlan = {
        operations: [
          {
            id: 'op1',
            type: 'consolidate' as const,
            affectedFiles: ['file1.ts'],
            parameters: { sourceFiles: ['file1.ts'], targetFiles: ['util.ts'] },
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
          linesChanged: 10,
          riskLevel: 'low' as const,
          estimatedTime: 1000,
          benefits: ['Test benefit'],
          risks: ['Test risk']
        },
        timestamp: new Date()
      };

      const result = await engine.executeRefactoring(mockPlan);
      
      expect(result.success).toBe(true);
      expect(result.completedOperations).toEqual(['op1']);
      expect(result.failedOperations).toHaveLength(0);
      expect(result.validation.overallSuccess).toBe(true);
    });

    it('should handle execution failures gracefully', async () => {
      const mockPlan = {
        operations: [
          {
            id: 'failing_op',
            type: 'invalid_type' as any,
            affectedFiles: ['file1.ts'],
            parameters: {},
            dependencies: [],
            riskLevel: 'high' as const,
            estimatedTime: 1000
          }
        ],
        dependencies: {},
        executionOrder: ['failing_op'],
        rollbackPlan: [],
        impact: {
          filesAffected: 1,
          linesChanged: 10,
          riskLevel: 'high' as const,
          estimatedTime: 1000,
          benefits: [],
          risks: ['High risk operation']
        },
        timestamp: new Date()
      };

      const result = await engine.executeRefactoring(mockPlan);
      
      expect(result.success).toBe(false);
      expect(result.failedOperations).toHaveLength(1);
      expect(result.failedOperations[0].operationId).toBe('failing_op');
    });
  });

  describe('Utility Methods', () => {
    it('should calculate execution order correctly', async () => {
      // Test through consolidateDuplicates which uses calculateExecutionOrder internally
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'dup_1',
            files: ['file1.ts'],
            content: 'test',
            locations: [{ file: 'file1.ts', startLine: 1, endLine: 1 }],
            similarity: 0.9,
            consolidationSuggestion: {
              approach: 'utility',
              targetLocation: 'src/utils/',
              suggestedName: 'test',
              effort: 'low'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 1,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      expect(plan.executionOrder).toHaveLength(1);
      expect(plan.executionOrder[0]).toBe(plan.operations[0].id);
    });

    it('should estimate consolidation time based on complexity', async () => {
      const mockDuplicates: DuplicationReport = {
        patterns: [
          {
            id: 'complex_dup',
            files: ['file1.ts', 'file2.ts', 'file3.ts'],
            content: 'function complex() {\n'.repeat(50) + '}', // 50 lines
            locations: [
              { file: 'file1.ts', startLine: 1, endLine: 50 },
              { file: 'file2.ts', startLine: 1, endLine: 50 },
              { file: 'file3.ts', startLine: 1, endLine: 50 }
            ],
            similarity: 0.95,
            consolidationSuggestion: {
              approach: 'extract',
              targetLocation: 'src/shared/',
              suggestedName: 'ComplexFunction',
              effort: 'high'
            }
          }
        ],
        totalDuplicates: 1,
        potentialSavings: 100,
        timestamp: new Date()
      };

      const plan = await engine.consolidateDuplicates(mockDuplicates);
      
      // High effort operation should have longer estimated time
      expect(plan.operations[0].estimatedTime).toBeGreaterThan(10000);
    });
  });

  describe('Factory Function', () => {
    it('should create engine with custom root path', () => {
      const customEngine = createDuplicationConsolidationEngine('/custom/path');
      expect(customEngine).toBeInstanceOf(DuplicationConsolidationEngine);
    });

    it('should create engine with default root path', () => {
      const defaultEngine = createDuplicationConsolidationEngine();
      expect(defaultEngine).toBeInstanceOf(DuplicationConsolidationEngine);
    });
  });
});