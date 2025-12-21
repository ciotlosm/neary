/**
 * Tests for RefactoringOrchestrationSystem
 * Validates the main refactoring pipeline coordination, dependency-aware execution,
 * progress tracking, and comprehensive reporting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefactoringOrchestrationSystem, createRefactoringOrchestrationSystem } from './RefactoringOrchestrationSystem';
import type {
  CodeAnalyzer,
  RefactoringEngine,
  ValidationSystem,
  AnalysisReport,
  RefactoringPlan,
  RefactoringResult,
  ValidationReport,
  FileInfo,
  FolderInfo,
  DuplicatePattern,
  NamingIssue,
  ComplexityMetric,
  TestResult,
  BuildResult,
  FunctionalityResult
} from '../types/architectureSimplification';

// Mock implementations
const createMockAnalyzer = (): CodeAnalyzer => ({
  scanCodebase: vi.fn(),
  identifyDuplicates: vi.fn(),
  measureFileSizes: vi.fn(),
  evaluateFolderStructure: vi.fn(),
  assessNamingConventions: vi.fn()
});

const createMockEngine = (): RefactoringEngine => ({
  consolidateDuplicates: vi.fn(),
  splitLargeFiles: vi.fn(),
  reorganizeFolders: vi.fn(),
  renameFiles: vi.fn(),
  executeRefactoring: vi.fn()
});

const createMockValidator = (): ValidationSystem => ({
  runTests: vi.fn(),
  validateBuild: vi.fn(),
  checkFunctionality: vi.fn(),
  generateReport: vi.fn()
});

// Test data
const mockFileInfo: FileInfo = {
  path: 'src/test.ts',
  lineCount: 250,
  complexity: 15,
  dependencies: ['./utils', './types'],
  exports: ['TestClass', 'testFunction'],
  sizeBytes: 8192,
  fileType: 'ts',
  lastModified: new Date()
};

const mockFolderInfo: FolderInfo = {
  path: 'src/services',
  fileCount: 15,
  subfolderCount: 2,
  totalSize: 102400,
  files: ['service1.ts', 'service2.ts'],
  subfolders: ['api', 'utils']
};

const mockDuplicatePattern: DuplicatePattern = {
  id: 'dup_001',
  files: ['src/file1.ts', 'src/file2.ts'],
  content: 'function validateInput(input: string) { return input.trim().length > 0; }',
  locations: [
    { file: 'src/file1.ts', startLine: 10, endLine: 12 },
    { file: 'src/file2.ts', startLine: 25, endLine: 27 }
  ],
  similarity: 0.95,
  consolidationSuggestion: {
    approach: 'utility',
    targetLocation: 'src/utils/',
    suggestedName: 'validateInput',
    effort: 'low'
  }
};

const mockNamingIssue: NamingIssue = {
  file: 'src/test.ts',
  issueType: 'abbreviation',
  currentName: 'usrMgr',
  suggestedName: 'userManager',
  reason: 'Avoid abbreviations for clarity'
};

const mockComplexityMetric: ComplexityMetric = {
  file: 'src/test.ts',
  cyclomaticComplexity: 15,
  functionCount: 8,
  classCount: 2,
  nestingDepth: 4,
  complexityRating: 'medium'
};

const mockAnalysisReport: AnalysisReport = {
  totalFiles: 50,
  oversizedFiles: [mockFileInfo],
  overcrowdedFolders: [mockFolderInfo],
  duplicatePatterns: [mockDuplicatePattern],
  namingIssues: [mockNamingIssue],
  complexityMetrics: [mockComplexityMetric],
  timestamp: new Date(),
  config: {
    maxFileSize: 200,
    maxFilesPerFolder: 10,
    duplicateSimilarityThreshold: 0.8,
    includePatterns: ['**/*.ts'],
    excludePatterns: ['**/node_modules/**'],
    includeTests: false,
    includeNodeModules: false
  }
};

const mockRefactoringPlan: RefactoringPlan = {
  operations: [
    {
      id: 'op_001',
      type: 'consolidate',
      affectedFiles: ['src/file1.ts', 'src/file2.ts'],
      parameters: {
        sourceFiles: ['src/file1.ts', 'src/file2.ts'],
        targetFiles: ['src/utils/validateInput.ts']
      },
      dependencies: [],
      riskLevel: 'low',
      estimatedTime: 5000
    }
  ],
  dependencies: {},
  executionOrder: ['op_001'],
  rollbackPlan: [],
  impact: {
    filesAffected: 2,
    linesChanged: 10,
    riskLevel: 'low',
    estimatedTime: 5000,
    benefits: ['Eliminate code duplication'],
    risks: ['Potential import issues']
  },
  timestamp: new Date()
};

const mockRefactoringResult: RefactoringResult = {
  success: true,
  completedOperations: ['op_001'],
  failedOperations: [],
  modifiedFiles: ['src/file1.ts', 'src/file2.ts'],
  createdFiles: ['src/utils/validateInput.ts'],
  deletedFiles: [],
  executionTime: 4500,
  validation: {
    testResults: {
      success: true,
      testsRun: 25,
      testsPassed: 25,
      testsFailed: 0,
      failures: [],
      executionTime: 2000
    },
    buildResults: {
      success: true,
      errors: [],
      warnings: [],
      buildTime: 1500
    },
    functionalityResults: {
      functionalityPreserved: true,
      changes: [],
      performanceImpact: {
        bundleSizeChange: -100,
        runtimeChange: 0,
        memoryChange: 0,
        overallImpact: 'positive'
      },
      timestamp: new Date()
    },
    overallSuccess: true,
    issuesSummary: [],
    recommendations: []
  }
};

const mockValidationReport: ValidationReport = {
  testResults: {
    success: true,
    testsRun: 25,
    testsPassed: 25,
    testsFailed: 0,
    failures: [],
    executionTime: 2000
  },
  buildResults: {
    success: true,
    errors: [],
    warnings: [],
    buildTime: 1500
  },
  functionalityResults: {
    functionalityPreserved: true,
    changes: [],
    performanceImpact: {
      bundleSizeChange: 0,
      runtimeChange: 0,
      memoryChange: 0,
      overallImpact: 'neutral'
    },
    timestamp: new Date()
  },
  overallSuccess: true,
  issuesSummary: [],
  recommendations: []
};

describe('RefactoringOrchestrationSystem', () => {
  let analyzer: CodeAnalyzer;
  let engine: RefactoringEngine;
  let validator: ValidationSystem;
  let orchestrator: RefactoringOrchestrationSystem;

  beforeEach(() => {
    analyzer = createMockAnalyzer();
    engine = createMockEngine();
    validator = createMockValidator();
    
    // Setup default mock implementations
    vi.mocked(analyzer.scanCodebase).mockResolvedValue(mockAnalysisReport);
    vi.mocked(engine.consolidateDuplicates).mockResolvedValue(mockRefactoringPlan);
    vi.mocked(engine.splitLargeFiles).mockResolvedValue(mockRefactoringPlan);
    vi.mocked(engine.reorganizeFolders).mockResolvedValue(mockRefactoringPlan);
    vi.mocked(engine.renameFiles).mockResolvedValue(mockRefactoringPlan);
    vi.mocked(engine.executeRefactoring).mockResolvedValue(mockRefactoringResult);
    vi.mocked(validator.generateReport).mockResolvedValue(mockValidationReport);
    
    orchestrator = new RefactoringOrchestrationSystem(analyzer, engine, validator, {
      requireConfirmation: false, // Disable for testing
      stopOnError: true,
      maxExecutionTime: 60000,
      createBackups: true,
      progressUpdateInterval: 100
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Main Refactoring Pipeline', () => {
    it('should execute complete refactoring pipeline successfully', async () => {
      const progressEvents: any[] = [];
      orchestrator.on('progress', (progress) => progressEvents.push(progress));

      const report = await orchestrator.executeRefactoring();

      expect(report.success).toBe(true);
      expect(report.analysis).toEqual(mockAnalysisReport);
      expect(report.plans).toHaveLength(4); // duplication, size, folder, naming plans
      expect(report.results).toHaveLength(4);
      expect(report.validation).toEqual(mockValidationReport);
      expect(report.changesSummary.duplicatesRemoved).toBe(1);
      expect(report.changesSummary.filesOptimized).toBe(1);
      expect(report.changesSummary.foldersReorganized).toBe(1);

      // Verify progress tracking
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0].phase).toBe('analysis');
      expect(progressEvents[progressEvents.length - 1].progress).toBe(100);
    });

    it('should handle analysis phase correctly', async () => {
      await orchestrator.executeRefactoring();

      expect(analyzer.scanCodebase).toHaveBeenCalledOnce();
    });

    it('should generate appropriate refactoring plans', async () => {
      await orchestrator.executeRefactoring();

      expect(engine.consolidateDuplicates).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: [mockDuplicatePattern],
          totalDuplicates: 1
        })
      );
      expect(engine.splitLargeFiles).toHaveBeenCalledWith([mockFileInfo]);
      expect(engine.reorganizeFolders).toHaveBeenCalled();
      expect(engine.renameFiles).toHaveBeenCalled();
    });

    it('should execute refactoring plans in correct order', async () => {
      const executionOrder: string[] = [];
      vi.mocked(engine.executeRefactoring).mockImplementation(async (plan) => {
        executionOrder.push(plan.timestamp.toISOString());
        return mockRefactoringResult;
      });

      await orchestrator.executeRefactoring();

      expect(engine.executeRefactoring).toHaveBeenCalledTimes(4);
      expect(executionOrder).toHaveLength(4);
    });

    it('should perform validation before and after refactoring', async () => {
      await orchestrator.executeRefactoring();

      expect(validator.generateReport).toHaveBeenCalledTimes(2); // Pre and post validation
    });
  });

  describe('Dependency-Aware Execution', () => {
    it('should handle operations with dependencies correctly', async () => {
      const planWithDependencies: RefactoringPlan = {
        ...mockRefactoringPlan,
        operations: [
          {
            id: 'op_001',
            type: 'split',
            affectedFiles: ['src/large.ts'],
            parameters: {},
            dependencies: [],
            riskLevel: 'medium',
            estimatedTime: 3000
          },
          {
            id: 'op_002',
            type: 'consolidate',
            affectedFiles: ['src/file1.ts', 'src/file2.ts'],
            parameters: {},
            dependencies: ['op_001'], // Depends on split operation
            riskLevel: 'low',
            estimatedTime: 2000
          }
        ],
        dependencies: {
          'op_002': ['op_001']
        },
        executionOrder: ['op_001', 'op_002']
      };

      vi.mocked(engine.consolidateDuplicates).mockResolvedValue(planWithDependencies);
      vi.mocked(engine.splitLargeFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.reorganizeFolders).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.renameFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });

      const report = await orchestrator.executeRefactoring();

      expect(report.success).toBe(true);
      expect(engine.executeRefactoring).toHaveBeenCalledWith(
        expect.objectContaining({
          executionOrder: ['op_001', 'op_002']
        })
      );
    });

    it('should detect and correct invalid execution order', async () => {
      const planWithInvalidOrder: RefactoringPlan = {
        ...mockRefactoringPlan,
        operations: [
          {
            id: 'op_001',
            type: 'split',
            affectedFiles: ['src/large.ts'],
            parameters: {},
            dependencies: [],
            riskLevel: 'medium',
            estimatedTime: 3000
          },
          {
            id: 'op_002',
            type: 'consolidate',
            affectedFiles: ['src/file1.ts', 'src/file2.ts'],
            parameters: {},
            dependencies: ['op_001'],
            riskLevel: 'low',
            estimatedTime: 2000
          }
        ],
        dependencies: {
          'op_002': ['op_001']
        },
        executionOrder: ['op_002', 'op_001'] // Invalid order - op_002 depends on op_001
      };

      vi.mocked(engine.consolidateDuplicates).mockResolvedValue(planWithInvalidOrder);
      vi.mocked(engine.splitLargeFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.reorganizeFolders).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.renameFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });

      const report = await orchestrator.executeRefactoring();

      expect(report.success).toBe(true);
      // Should have corrected the execution order
      expect(engine.executeRefactoring).toHaveBeenCalledWith(
        expect.objectContaining({
          executionOrder: ['op_001', 'op_002']
        })
      );
    });

    it('should detect circular dependencies', async () => {
      const planWithCircularDeps: RefactoringPlan = {
        ...mockRefactoringPlan,
        operations: [
          {
            id: 'op_001',
            type: 'split',
            affectedFiles: ['src/file1.ts'],
            parameters: {},
            dependencies: ['op_002'],
            riskLevel: 'medium',
            estimatedTime: 3000
          },
          {
            id: 'op_002',
            type: 'consolidate',
            affectedFiles: ['src/file2.ts'],
            parameters: {},
            dependencies: ['op_001'],
            riskLevel: 'low',
            estimatedTime: 2000
          }
        ],
        dependencies: {
          'op_001': ['op_002'],
          'op_002': ['op_001']
        },
        executionOrder: ['op_001', 'op_002']
      };

      vi.mocked(engine.consolidateDuplicates).mockResolvedValue(planWithCircularDeps);
      vi.mocked(engine.splitLargeFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.reorganizeFolders).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });
      vi.mocked(engine.renameFiles).mockResolvedValue({ ...mockRefactoringPlan, operations: [] });

      await expect(orchestrator.executeRefactoring()).rejects.toThrow('Circular dependency detected');
    });
  });

  describe('Progress Tracking', () => {
    it('should emit progress events throughout execution', async () => {
      const progressEvents: any[] = [];
      orchestrator.on('progress', (progress) => progressEvents.push(progress));

      await orchestrator.executeRefactoring();

      expect(progressEvents.length).toBeGreaterThan(5);
      
      // Check phase progression
      const phases = progressEvents.map(p => p.phase);
      expect(phases).toContain('analysis');
      expect(phases).toContain('planning');
      expect(phases).toContain('validation');
      expect(phases).toContain('execution');
      expect(phases).toContain('completion');

      // Check progress increases
      const progressValues = progressEvents.map(p => p.progress);
      expect(progressValues[0]).toBe(0);
      expect(progressValues[progressValues.length - 1]).toBe(100);
      
      // Progress should generally increase
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }
    });

    it('should provide accurate progress information', async () => {
      let finalProgress: any;
      orchestrator.on('progress', (progress) => {
        finalProgress = progress;
      });

      await orchestrator.executeRefactoring();

      expect(finalProgress.phase).toBe('completion');
      expect(finalProgress.progress).toBe(100);
      expect(finalProgress.estimatedTimeRemaining).toBe(0);
    });

    it('should track current progress state', async () => {
      const progressPromise = orchestrator.executeRefactoring();
      
      // Check initial progress
      const initialProgress = orchestrator.getProgress();
      expect(initialProgress.progress).toBe(0);
      expect(initialProgress.phase).toBe('analysis');

      await progressPromise;

      // Check final progress
      const finalProgress = orchestrator.getProgress();
      expect(finalProgress.progress).toBe(100);
      expect(finalProgress.phase).toBe('completion');
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      const analysisError = new Error('Analysis failed');
      vi.mocked(analyzer.scanCodebase).mockRejectedValue(analysisError);

      await expect(orchestrator.executeRefactoring()).rejects.toThrow('Analysis failed');
    });

    it('should handle refactoring execution errors', async () => {
      const executionError = new Error('Execution failed');
      vi.mocked(engine.executeRefactoring).mockRejectedValue(executionError);

      await expect(orchestrator.executeRefactoring()).rejects.toThrow('Execution failed');
    });

    it('should stop on error when configured', async () => {
      const failedResult: RefactoringResult = {
        ...mockRefactoringResult,
        success: false,
        failedOperations: [{
          operationId: 'op_001',
          error: 'Operation failed',
          affectedFiles: ['src/test.ts']
        }]
      };

      vi.mocked(engine.executeRefactoring).mockResolvedValue(failedResult);

      await expect(orchestrator.executeRefactoring()).rejects.toThrow('Refactoring plan failed');
    });

    it('should continue on error when configured', async () => {
      const orchestratorContinueOnError = new RefactoringOrchestrationSystem(
        analyzer, 
        engine, 
        validator, 
        { 
          requireConfirmation: false,
          stopOnError: false 
        }
      );

      const failedResult: RefactoringResult = {
        ...mockRefactoringResult,
        success: false,
        failedOperations: [{
          operationId: 'op_001',
          error: 'Operation failed',
          affectedFiles: ['src/test.ts']
        }]
      };

      vi.mocked(engine.executeRefactoring).mockResolvedValue(failedResult);

      const report = await orchestratorContinueOnError.executeRefactoring();

      expect(report.success).toBe(false);
      expect(report.results.some(r => !r.success)).toBe(true);
    });
  });

  describe('Comprehensive Reporting', () => {
    it('should generate detailed refactoring report', async () => {
      const report = await orchestrator.executeRefactoring();

      expect(report).toMatchObject({
        analysis: mockAnalysisReport,
        success: true,
        changesSummary: {
          duplicatesRemoved: 1,
          filesOptimized: 1,
          foldersReorganized: 1
        }
      });

      expect(report.totalTime).toBeGreaterThanOrEqual(0); // Changed to >= 0 since tests run very fast
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should include appropriate recommendations', async () => {
      const report = await orchestrator.executeRefactoring();

      expect(report.recommendations).toContain('Consider implementing code review processes to prevent future duplication');
      expect(report.recommendations).toContain('Establish file size guidelines and automated checks');
      expect(report.recommendations).toContain('Document new folder structure for team consistency');
    });

    it('should calculate changes summary correctly', async () => {
      const report = await orchestrator.executeRefactoring();

      expect(report.changesSummary.filesModified).toBeGreaterThan(0);
      expect(report.changesSummary.duplicatesRemoved).toBe(1);
      expect(report.changesSummary.filesOptimized).toBe(1);
      expect(report.changesSummary.foldersReorganized).toBe(1);
    });
  });

  describe('Factory Function', () => {
    it('should create orchestration system with factory function', () => {
      const system = createRefactoringOrchestrationSystem(analyzer, engine, validator);
      
      expect(system).toBeInstanceOf(RefactoringOrchestrationSystem);
    });

    it('should accept configuration in factory function', () => {
      const config = {
        requireConfirmation: false,
        stopOnError: false,
        maxExecutionTime: 120000
      };

      const system = createRefactoringOrchestrationSystem(analyzer, engine, validator, config);
      
      expect(system).toBeInstanceOf(RefactoringOrchestrationSystem);
    });
  });

  describe('State Management', () => {
    it('should track running state correctly', async () => {
      expect(orchestrator.isRefactoringInProgress()).toBe(false);

      const refactoringPromise = orchestrator.executeRefactoring();
      expect(orchestrator.isRefactoringInProgress()).toBe(true);

      await refactoringPromise;
      expect(orchestrator.isRefactoringInProgress()).toBe(false);
    });

    it('should prevent concurrent refactoring executions', async () => {
      const firstExecution = orchestrator.executeRefactoring();
      
      await expect(orchestrator.executeRefactoring()).rejects.toThrow('Refactoring is already in progress');
      
      await firstExecution;
    });
  });
});