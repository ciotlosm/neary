/**
 * Tests for UtilityExtractionService
 * Validates Requirements: 1.2, 1.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UtilityExtractionService, createUtilityExtractionService } from './UtilityExtractionService';
import type { DuplicatePattern } from '../types/architectureSimplification';

describe('UtilityExtractionService', () => {
  let service: UtilityExtractionService;
  
  beforeEach(() => {
    service = new UtilityExtractionService();
  });

  describe('Core Functionality Tests', () => {
    it('should create service with default configuration', () => {
      expect(service).toBeInstanceOf(UtilityExtractionService);
    });

    it('should create service with custom root path', () => {
      const customService = new UtilityExtractionService('/custom/path');
      expect(customService).toBeInstanceOf(UtilityExtractionService);
    });
  });

  describe('Pattern Analysis', () => {
    it('should analyze function patterns correctly', () => {
      const functionCode = 'function formatDate(date: Date): string {\n  return date.toISOString();\n}';
      
      const analysis = service.analyzePattern(functionCode);
      
      expect(analysis.type).toBe('function');
      expect(analysis.extractable).toBe(true);
      expect(analysis.complexity).toBe('low');
    });

    it('should analyze class patterns correctly', () => {
      const classCode = 'class ValidationHelper {\n  validate(data: any): boolean {\n    return true;\n  }\n}';
      
      const analysis = service.analyzePattern(classCode);
      
      expect(analysis.type).toBe('class');
      expect(analysis.extractable).toBe(true);
    });

    it('should analyze constant patterns correctly', () => {
      const constantCode = 'const API_URL = "https://api.example.com";';
      
      const analysis = service.analyzePattern(constantCode);
      
      expect(analysis.type).toBe('constant');
      expect(analysis.extractable).toBe(true);
    });

    it('should handle mixed patterns', () => {
      const mixedCode = 'function helper() {}\nconst value = 42;\nclass Helper {}';
      
      const analysis = service.analyzePattern(mixedCode);
      
      expect(analysis.type).toBe('mixed');
      expect(analysis.extractable).toBe(true);
      expect(analysis.complexity).toBe('medium'); // 3 elements = medium complexity
    });
  });

  describe('Similarity Calculation', () => {
    it('should calculate identical code similarity as 1.0', () => {
      const code1 = 'function test() { return true; }';
      const code2 = 'function test() { return true; }';
      
      const similarity = service.calculateSimilarity(code1, code2);
      
      expect(similarity).toBe(1.0);
    });

    it('should calculate different code similarity as less than 1.0', () => {
      const code1 = 'function test() { return true; }';
      const code2 = 'function different() { return false; }';
      
      const similarity = service.calculateSimilarity(code1, code2);
      
      expect(similarity).toBeLessThan(1.0);
    });

    it('should handle similar code with minor differences', () => {
      const code1 = 'function formatDate(date) { return date.toISOString(); }';
      const code2 = 'function formatDate(date) { return date.toString(); }';
      
      const similarity = service.calculateSimilarity(code1, code2);
      
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });
  });

  describe('Common Pattern Identification', () => {
    it('should identify common functions across code blocks', () => {
      const codeBlocks = [
        'function helper() { return true; }\nconst value = 1;',
        'function helper() { return true; }\nconst other = 2;',
        'function helper() { return true; }\nconst another = 3;'
      ];
      
      const patterns = service.identifyCommonPatterns(codeBlocks);
      
      expect(patterns.commonFunctions).toHaveLength(1);
      expect(patterns.commonFunctions[0]).toContain('helper');
    });

    it('should handle empty code blocks', () => {
      const codeBlocks: string[] = [];
      
      const patterns = service.identifyCommonPatterns(codeBlocks);
      
      expect(patterns.commonFunctions).toHaveLength(0);
      expect(patterns.commonVariables).toHaveLength(0);
      expect(patterns.commonImports).toHaveLength(0);
    });

    it('should handle single code block', () => {
      const codeBlocks = ['function test() { return true; }'];
      
      const patterns = service.identifyCommonPatterns(codeBlocks);
      
      expect(patterns.commonFunctions).toHaveLength(0);
    });
  });

  describe('Utility Extraction', () => {
    it('should extract utility from function pattern', async () => {
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

      const result = await service.extractUtility(pattern);
      
      expect(result.utilityCode).toContain('formatDate');
      expect(result.utilityCode).toContain('export');
      expect(result.utilityPath).toBe('src/utils/formatDate.ts');
      expect(result.replacementCode).toContain('formatDate');
      expect(result.importStatements).toHaveProperty('file1.ts');
      expect(result.importStatements).toHaveProperty('file2.ts');
    });

    it('should extract utility from class pattern', async () => {
      const pattern: DuplicatePattern = {
        id: 'class_pattern',
        files: ['service1.ts', 'service2.ts'],
        content: 'class Helper {\n  validate(): boolean {\n    return true;\n  }\n}',
        locations: [
          { file: 'service1.ts', startLine: 1, endLine: 5 },
          { file: 'service2.ts', startLine: 10, endLine: 14 }
        ],
        similarity: 0.9,
        consolidationSuggestion: {
          approach: 'extract',
          targetLocation: 'src/shared/',
          suggestedName: 'Helper',
          effort: 'medium'
        }
      };

      const result = await service.extractUtility(pattern);
      
      expect(result.utilityCode).toContain('Helper');
      expect(result.utilityCode).toContain('export');
      expect(result.replacementCode).toContain('Helper');
    });
  });

  describe('Factory Function', () => {
    it('should create service with custom root path', () => {
      const customService = createUtilityExtractionService('/custom/path');
      expect(customService).toBeInstanceOf(UtilityExtractionService);
    });

    it('should create service with default root path', () => {
      const defaultService = createUtilityExtractionService();
      expect(defaultService).toBeInstanceOf(UtilityExtractionService);
    });
  });
});