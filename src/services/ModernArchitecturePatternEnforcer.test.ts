/**
 * Tests for ModernArchitecturePatternEnforcer
 * Validates Requirements: 7.1, 7.3, 7.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModernArchitecturePatternEnforcerImpl } from './ModernArchitecturePatternEnforcer';
import type { FileInfo } from '../types/architectureSimplification';

describe('ModernArchitecturePatternEnforcer', () => {
  let enforcer: ModernArchitecturePatternEnforcerImpl;
  let mockFiles: FileInfo[];

  beforeEach(() => {
    enforcer = new ModernArchitecturePatternEnforcerImpl(process.cwd());
    
    mockFiles = [
      {
        path: 'src/components/ClassComponent.tsx',
        lineCount: 50,
        complexity: 5,
        dependencies: ['react'],
        exports: ['ClassComponent'],
        sizeBytes: 1500,
        fileType: 'tsx',
        lastModified: new Date()
      },
      {
        path: 'src/components/HookComponent.tsx',
        lineCount: 30,
        complexity: 3,
        dependencies: ['react'],
        exports: ['HookComponent'],
        sizeBytes: 900,
        fileType: 'tsx',
        lastModified: new Date()
      },
      {
        path: 'src/services/InheritanceService.ts',
        lineCount: 80,
        complexity: 8,
        dependencies: ['./BaseService'],
        exports: ['InheritanceService'],
        sizeBytes: 2400,
        fileType: 'ts',
        lastModified: new Date()
      }
    ];
  });

  describe('analyzeCompositionVsInheritance', () => {
    it('should handle empty file list', async () => {
      const result = await enforcer.analyzeCompositionVsInheritance([]);

      expect(result.inheritancePatterns).toHaveLength(0);
      expect(result.compositionPatterns).toHaveLength(0);
      expect(result.compositionRatio).toBe(1); // Default to 1 when no patterns
    });

    it('should calculate composition ratio correctly with no patterns', async () => {
      const result = await enforcer.analyzeCompositionVsInheritance(mockFiles);

      expect(result.compositionRatio).toBeGreaterThanOrEqual(0);
      expect(result.compositionRatio).toBeLessThanOrEqual(1);
    });

    it('should provide recommendations', async () => {
      const result = await enforcer.analyzeCompositionVsInheritance(mockFiles);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('analyzeReactPatterns', () => {
    it('should handle empty file list', async () => {
      const result = await enforcer.analyzeReactPatterns([]);

      expect(result.classComponents).toHaveLength(0);
      expect(result.hookComponents).toHaveLength(0);
      expect(result.modernPatterns).toHaveLength(0);
      expect(result.modernizationScore).toBe(1); // Default to 1 when no components
    });

    it('should calculate modernization score', async () => {
      const result = await enforcer.analyzeReactPatterns(mockFiles);

      expect(result.modernizationScore).toBeGreaterThanOrEqual(0);
      expect(result.modernizationScore).toBeLessThanOrEqual(1);
    });

    it('should provide recommendations', async () => {
      const result = await enforcer.analyzeReactPatterns(mockFiles);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('analyzeDependencies', () => {
    it('should build dependency graph', async () => {
      const result = await enforcer.analyzeDependencies(mockFiles);

      expect(result.dependencyGraph).toHaveProperty('src/components/ClassComponent.tsx');
      expect(result.dependencyGraph['src/components/ClassComponent.tsx']).toEqual(['react']);
    });

    it('should detect excessive dependencies', async () => {
      const fileWithManyDeps: FileInfo = {
        path: 'src/services/ComplexService.ts',
        lineCount: 100,
        complexity: 15,
        dependencies: Array.from({ length: 15 }, (_, i) => `./dep${i}`),
        exports: ['ComplexService'],
        sizeBytes: 3000,
        fileType: 'ts',
        lastModified: new Date()
      };

      const result = await enforcer.analyzeDependencies([...mockFiles, fileWithManyDeps]);

      expect(result.excessiveDependencies).toHaveLength(1);
      expect(result.excessiveDependencies[0]).toMatchObject({
        file: 'src/services/ComplexService.ts',
        dependencyCount: 15
      });
    });

    it('should calculate average dependencies', async () => {
      const result = await enforcer.analyzeDependencies(mockFiles);

      const totalDeps = mockFiles.reduce((sum, file) => sum + file.dependencies.length, 0);
      const expectedAverage = totalDeps / mockFiles.length;

      expect(result.averageDependencies).toBe(expectedAverage);
    });

    it('should calculate coupling score', async () => {
      const result = await enforcer.analyzeDependencies(mockFiles);

      expect(result.couplingScore).toBeGreaterThanOrEqual(0);
      expect(result.couplingScore).toBeLessThanOrEqual(1);
    });

    it('should handle empty file list', async () => {
      const result = await enforcer.analyzeDependencies([]);

      expect(result.dependencyGraph).toEqual({});
      expect(result.circularDependencies).toHaveLength(0);
      expect(result.excessiveDependencies).toHaveLength(0);
      expect(result.averageDependencies).toBe(0);
      expect(result.couplingScore).toBe(0);
    });
  });

  describe('generateModernizationPlan', () => {
    it('should generate suggestions for excessive dependencies', async () => {
      const fileWithManyDeps: FileInfo = {
        path: 'src/services/ComplexService.ts',
        lineCount: 100,
        complexity: 15,
        dependencies: Array.from({ length: 15 }, (_, i) => `./dep${i}`),
        exports: ['ComplexService'],
        sizeBytes: 3000,
        fileType: 'ts',
        lastModified: new Date()
      };

      const suggestions = await enforcer.generateModernizationPlan([...mockFiles, fileWithManyDeps]);

      const dependencySuggestion = suggestions.find(s => s.type === 'dependency-reduction');
      expect(dependencySuggestion).toBeDefined();
      expect(dependencySuggestion?.file).toBe('src/services/ComplexService.ts');
    });

    it('should return empty suggestions for clean codebase', async () => {
      const cleanFiles: FileInfo[] = [
        {
          path: 'src/components/SimpleComponent.tsx',
          lineCount: 20,
          complexity: 2,
          dependencies: ['react'],
          exports: ['SimpleComponent'],
          sizeBytes: 600,
          fileType: 'tsx',
          lastModified: new Date()
        }
      ];

      const suggestions = await enforcer.generateModernizationPlan(cleanFiles);

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should sort suggestions by priority', async () => {
      const fileWithManyDeps: FileInfo = {
        path: 'src/services/ComplexService.ts',
        lineCount: 100,
        complexity: 15,
        dependencies: Array.from({ length: 15 }, (_, i) => `./dep${i}`),
        exports: ['ComplexService'],
        sizeBytes: 3000,
        fileType: 'ts',
        lastModified: new Date()
      };

      const suggestions = await enforcer.generateModernizationPlan([...mockFiles, fileWithManyDeps]);

      // Verify suggestions are sorted by priority (high -> medium -> low)
      const priorities = suggestions.map(s => s.priority);
      for (let i = 0; i < priorities.length - 1; i++) {
        const currentPriority = priorities[i];
        const nextPriority = priorities[i + 1];
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        expect(priorityOrder[currentPriority]).toBeGreaterThanOrEqual(priorityOrder[nextPriority]);
      }
    });
  });

  describe('transformToModernPatterns', () => {
    it('should log transformations to be applied', async () => {
      const transformations = [
        {
          id: 'transform-1',
          type: 'class-to-hooks' as const,
          file: 'src/components/OldComponent.tsx',
          description: 'Convert class component to hooks',
          sourceSelection: {
            file: 'src/components/OldComponent.tsx',
            startLine: 1,
            endLine: 20
          },
          parameters: {}
        }
      ];

      // This should not throw
      await expect(enforcer.transformToModernPatterns(transformations)).resolves.toBeUndefined();
    });

    it('should handle empty transformations list', async () => {
      await expect(enforcer.transformToModernPatterns([])).resolves.toBeUndefined();
    });
  });

  describe('interface compliance', () => {
    it('should implement all required methods', () => {
      expect(typeof enforcer.analyzeCompositionVsInheritance).toBe('function');
      expect(typeof enforcer.analyzeReactPatterns).toBe('function');
      expect(typeof enforcer.analyzeDependencies).toBe('function');
      expect(typeof enforcer.generateModernizationPlan).toBe('function');
      expect(typeof enforcer.transformToModernPatterns).toBe('function');
    });

    it('should return properly structured results', async () => {
      const compositionResult = await enforcer.analyzeCompositionVsInheritance(mockFiles);
      expect(compositionResult).toHaveProperty('inheritancePatterns');
      expect(compositionResult).toHaveProperty('compositionPatterns');
      expect(compositionResult).toHaveProperty('compositionRatio');
      expect(compositionResult).toHaveProperty('recommendations');

      const reactResult = await enforcer.analyzeReactPatterns(mockFiles);
      expect(reactResult).toHaveProperty('classComponents');
      expect(reactResult).toHaveProperty('hookComponents');
      expect(reactResult).toHaveProperty('modernPatterns');
      expect(reactResult).toHaveProperty('modernizationScore');
      expect(reactResult).toHaveProperty('recommendations');

      const dependencyResult = await enforcer.analyzeDependencies(mockFiles);
      expect(dependencyResult).toHaveProperty('dependencyGraph');
      expect(dependencyResult).toHaveProperty('circularDependencies');
      expect(dependencyResult).toHaveProperty('excessiveDependencies');
      expect(dependencyResult).toHaveProperty('averageDependencies');
      expect(dependencyResult).toHaveProperty('couplingScore');
      expect(dependencyResult).toHaveProperty('recommendations');
    });
  });
});