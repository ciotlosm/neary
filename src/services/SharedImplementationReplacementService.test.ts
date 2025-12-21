/**
 * Tests for SharedImplementationReplacementService
 * Validates Requirements: 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SharedImplementationReplacementService, createSharedImplementationReplacementService } from './SharedImplementationReplacementService';
import type { DuplicatePattern } from '../types/architectureSimplification';

describe('SharedImplementationReplacementService', () => {
  let service: SharedImplementationReplacementService;
  
  beforeEach(() => {
    service = new SharedImplementationReplacementService();
  });

  describe('Core Functionality Tests', () => {
    it('should create service with default configuration', () => {
      expect(service).toBeInstanceOf(SharedImplementationReplacementService);
    });

    it('should create service with custom root path', () => {
      const customService = new SharedImplementationReplacementService('/custom/path');
      expect(customService).toBeInstanceOf(SharedImplementationReplacementService);
    });
  });

  describe('Shared Implementation Replacement', () => {
    it('should replace duplicate patterns with shared implementation', async () => {
      const pattern: DuplicatePattern = {
        id: 'test_pattern',
        files: ['file1.ts', 'file2.ts'],
        content: 'function formatDate(date: Date): string {\n  return date.toISOString();\n}',
        locations: [
          { file: 'file1.ts', startLine: 1, endLine: 3 },
          { file: 'file2.ts', startLine: 5, endLine: 7 }
        ],
        similarity: 0.95,
        consolidationSuggestion: {
          approach: 'utility',
          targetLocation: 'src/utils/',
          suggestedName: 'formatDate',
          effort: 'low'
        }
      };

      const result = await service.replaceWithSharedImplementation(
        pattern,
        'src/utils/formatDate.ts',
        'formatDate'
      );
      
      expect(result.replacements).toHaveLength(2);
      expect(result.updatedFiles).toEqual(['file1.ts', 'file2.ts']);
      expect(result.importUpdates).toHaveLength(2);
      expect(result.validationResults).toHaveLength(2);
      
      // Check that replacements contain the expected structure
      expect(result.replacements[0].file).toBe('file1.ts');
      expect(result.replacements[0].replacementCode).toContain('formatDate');
      expect(result.replacements[0].requiresImport).toBe(true);
    });

    it('should handle class-based patterns', async () => {
      const pattern: DuplicatePattern = {
        id: 'class_pattern',
        files: ['service1.ts'],
        content: 'class Helper {\n  validate(): boolean {\n    return true;\n  }\n}',
        locations: [
          { file: 'service1.ts', startLine: 1, endLine: 5 }
        ],
        similarity: 0.9,
        consolidationSuggestion: {
          approach: 'extract',
          targetLocation: 'src/shared/',
          suggestedName: 'Helper',
          effort: 'medium'
        }
      };

      const result = await service.replaceWithSharedImplementation(
        pattern,
        'src/shared/Helper.ts',
        'Helper'
      );
      
      expect(result.replacements).toHaveLength(1);
      expect(result.replacements[0].replacementCode).toContain('Helper');
    });
  });

  describe('Replacement Impact Analysis', () => {
    it('should analyze replacement impact correctly', async () => {
      const pattern: DuplicatePattern = {
        id: 'impact_pattern',
        files: ['file1.ts', 'file2.ts', 'file3.ts'],
        content: 'function test() {\n  console.log("test");\n  return true;\n}',
        locations: [
          { file: 'file1.ts', startLine: 1, endLine: 4 },
          { file: 'file2.ts', startLine: 10, endLine: 13 },
          { file: 'file3.ts', startLine: 20, endLine: 23 }
        ],
        similarity: 0.95,
        consolidationSuggestion: {
          approach: 'utility',
          targetLocation: 'src/utils/',
          suggestedName: 'testUtil',
          effort: 'low'
        }
      };

      const impact = await service.analyzeReplacementImpact(
        pattern,
        'src/utils/testUtil.ts'
      );
      
      expect(impact.linesRemoved).toBe(8); // 4 lines * 2 duplicates (keep one)
      expect(impact.filesAffected).toBe(3);
      expect(impact.complexityReduction).toBeGreaterThanOrEqual(0);
      expect(impact.potentialIssues).toBeDefined();
      expect(impact.recommendations).toBeDefined();
    });

    it('should provide recommendations for low similarity patterns', async () => {
      const pattern: DuplicatePattern = {
        id: 'low_similarity',
        files: ['file1.ts', 'file2.ts'],
        content: 'function test() { return true; }',
        locations: [
          { file: 'file1.ts', startLine: 1, endLine: 1 },
          { file: 'file2.ts', startLine: 1, endLine: 1 }
        ],
        similarity: 0.7, // Below 90%
        consolidationSuggestion: {
          approach: 'utility',
          targetLocation: 'src/utils/',
          suggestedName: 'test',
          effort: 'low'
        }
      };

      const impact = await service.analyzeReplacementImpact(
        pattern,
        'src/utils/test.ts'
      );
      
      expect(impact.recommendations).toContain('Pattern similarity is below 90% - manual review recommended');
    });
  });

  describe('Replacement Code Generation', () => {
    it('should generate utility replacement code', () => {
      const pattern: DuplicatePattern = {
        id: 'utility_pattern',
        files: ['file1.ts'],
        content: 'function helper() { return true; }',
        locations: [{ file: 'file1.ts', startLine: 1, endLine: 1 }],
        similarity: 0.9,
        consolidationSuggestion: {
          approach: 'utility',
          targetLocation: 'src/utils/',
          suggestedName: 'helper',
          effort: 'low'
        }
      };

      const result = service.generateReplacementCode(pattern, 'helper');
      
      expect(result.replacementCode).toContain('helper');
      expect(result.requiresParameters).toBeDefined();
      expect(result.parameters).toBeDefined();
    });

    it('should generate extract replacement code', () => {
      const pattern: DuplicatePattern = {
        id: 'extract_pattern',
        files: ['file1.ts'],
        content: 'class Helper {}',
        locations: [{ file: 'file1.ts', startLine: 1, endLine: 1 }],
        similarity: 0.9,
        consolidationSuggestion: {
          approach: 'extract',
          targetLocation: 'src/shared/',
          suggestedName: 'Helper',
          effort: 'medium'
        }
      };

      const result = service.generateReplacementCode(pattern, 'Helper');
      
      expect(result.replacementCode).toContain('Helper');
    });

    it('should generate merge replacement code', () => {
      const pattern: DuplicatePattern = {
        id: 'merge_pattern',
        files: ['file1.ts'],
        content: 'const value = 42;',
        locations: [{ file: 'file1.ts', startLine: 1, endLine: 1 }],
        similarity: 0.9,
        consolidationSuggestion: {
          approach: 'merge',
          targetLocation: 'src/shared/',
          suggestedName: 'SharedValues',
          effort: 'medium'
        }
      };

      const result = service.generateReplacementCode(pattern, 'SharedValues');
      
      expect(result.replacementCode).toContain('SharedValues');
      expect(result.requiresParameters).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate replacement successfully', async () => {
      const replacement = {
        file: 'test.ts',
        originalCode: 'function test() { return true; }',
        replacementCode: 'testUtil()',
        startLine: 1,
        endLine: 1,
        requiresImport: true,
        importStatement: 'import { testUtil } from "./utils";',
        requiresParameters: false,
        parameters: []
      };

      const result = await service.validateReplacement('test.ts', replacement);
      
      expect(result.file).toBe('test.ts');
      expect(result.success).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      const replacement = {
        file: 'nonexistent.ts',
        originalCode: 'invalid syntax {{{',
        replacementCode: 'testUtil()',
        startLine: 1,
        endLine: 1,
        requiresImport: false,
        requiresParameters: false,
        parameters: []
      };

      const result = await service.validateReplacement('nonexistent.ts', replacement);
      
      expect(result.file).toBe('nonexistent.ts');
      expect(result.success).toBeDefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe('Factory Function', () => {
    it('should create service with custom root path', () => {
      const customService = createSharedImplementationReplacementService('/custom/path');
      expect(customService).toBeInstanceOf(SharedImplementationReplacementService);
    });

    it('should create service with default root path', () => {
      const defaultService = createSharedImplementationReplacementService();
      expect(defaultService).toBeInstanceOf(SharedImplementationReplacementService);
    });
  });
});