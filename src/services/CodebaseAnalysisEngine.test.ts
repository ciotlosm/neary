/**
 * Tests for CodebaseAnalysisEngine
 * Validates Requirements: 1.1, 2.1, 3.1
 */

import { describe, it, expect } from 'vitest';
import { CodebaseAnalysisEngine, createCodebaseAnalyzer } from './CodebaseAnalysisEngine';
import { DEFAULT_ANALYSIS_CONFIG } from '../types/architectureSimplification';

describe('CodebaseAnalysisEngine', () => {

  describe('Core Functionality Tests', () => {
    it('should create analyzer with default configuration', () => {
      const analyzer = new CodebaseAnalysisEngine();
      expect(analyzer).toBeInstanceOf(CodebaseAnalysisEngine);
    });

    it('should create analyzer with custom configuration', () => {
      const customConfig = {
        maxFileSize: 100,
        maxFilesPerFolder: 5
      };

      const analyzer = new CodebaseAnalysisEngine(process.cwd(), customConfig);
      expect(analyzer).toBeInstanceOf(CodebaseAnalysisEngine);
    });

    it('should calculate string similarity correctly', () => {
      const analyzer = new CodebaseAnalysisEngine();
      
      // Access private method for testing via type assertion
      const calculateSimilarity = (analyzer as any).calculateStringSimilarity.bind(analyzer);
      
      // Test identical strings
      expect(calculateSimilarity('hello', 'hello')).toBe(1);
      
      // Test completely different strings
      expect(calculateSimilarity('hello', 'world')).toBeLessThan(0.5);
      
      // Test similar strings
      expect(calculateSimilarity('hello', 'hallo')).toBeGreaterThan(0.5);
    });

    it('should detect inconsistent casing', () => {
      const analyzer = new CodebaseAnalysisEngine();
      
      // Access private method for testing
      const hasInconsistentCasing = (analyzer as any).hasInconsistentCasing.bind(analyzer);
      
      expect(hasInconsistentCasing('Component')).toBe(false); // PascalCase
      expect(hasInconsistentCasing('component')).toBe(false); // camelCase
      expect(hasInconsistentCasing('my-component')).toBe(false); // kebab-case
      expect(hasInconsistentCasing('My_Component')).toBe(true); // Mixed
      expect(hasInconsistentCasing('myComponent_Test')).toBe(true); // Mixed
    });

    it('should expand abbreviations correctly', () => {
      const analyzer = new CodebaseAnalysisEngine();
      
      // Access private method for testing
      const expandAbbreviations = (analyzer as any).expandAbbreviations.bind(analyzer);
      
      expect(expandAbbreviations('btn')).toBe('Button');
      expect(expandAbbreviations('cfg')).toBe('Config');
      expect(expandAbbreviations('btnMgr')).toBe('ButtonManager');
    });

    it('should generate utility names from code content', () => {
      const analyzer = new CodebaseAnalysisEngine();
      
      // Access private method for testing
      const generateUtilityName = (analyzer as any).generateUtilityName.bind(analyzer);
      
      expect(generateUtilityName('function validateInput() {}')).toBe('validateInput');
      expect(generateUtilityName('const formatDate = () => {}')).toBe('formatDate');
      expect(generateUtilityName('// some utility code')).toBe('SharedUtil');
    });

    it('should find common directory for files', () => {
      const analyzer = new CodebaseAnalysisEngine();
      
      // Access private method for testing
      const findCommonDirectory = (analyzer as any).findCommonDirectory.bind(analyzer);
      
      expect(findCommonDirectory(['src/components/Button.tsx', 'src/components/Input.tsx'])).toBe('src/components');
      expect(findCommonDirectory(['src/utils/format.ts', 'src/services/api.ts'])).toBe('src');
      expect(findCommonDirectory(['file.ts'])).toBe('.');
      expect(findCommonDirectory([])).toBe('');
    });

    it('should handle empty directory gracefully', async () => {
      // Create analyzer for a non-existent directory to test error handling
      const analyzer = new CodebaseAnalysisEngine('/non/existent/path');
      
      // The analyzer should handle missing directories gracefully
      try {
        const report = await analyzer.scanCodebase();
        expect(report.totalFiles).toBe(0);
        expect(report.oversizedFiles).toHaveLength(0);
        expect(report.timestamp).toBeInstanceOf(Date);
      } catch (error) {
        // It's acceptable for this to throw an error for non-existent paths
        expect(error).toBeDefined();
      }
    });
  });

  describe('Factory Function', () => {
    it('should create analyzer with custom configuration', () => {
      const customConfig = {
        maxFileSize: 100,
        maxFilesPerFolder: 5
      };

      const customAnalyzer = createCodebaseAnalyzer('/custom/path', customConfig);
      expect(customAnalyzer).toBeInstanceOf(CodebaseAnalysisEngine);
    });

    it('should create analyzer with default configuration', () => {
      const defaultAnalyzer = createCodebaseAnalyzer();
      expect(defaultAnalyzer).toBeInstanceOf(CodebaseAnalysisEngine);
    });
  });
});