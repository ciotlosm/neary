/**
 * Refactoring Orchestration System
 * Main refactoring pipeline that coordinates all components with dependency-aware execution,
 * progress tracking, user feedback systems, and comprehensive reporting
 * Validates Requirements: All requirements integration
 */

import { EventEmitter } from 'events';
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
  DuplicationReport,
  SizeReport,
  StructureReport,
  NamingReport,
  RefactoringOperation,
  ImpactAssessment,
  AnalysisConfig
} from '../types/architectureSimplification';

/**
 * Progress tracking information
 */
export interface ProgressInfo {
  /** Current phase of refactoring */
  phase: 'analysis' | 'planning' | 'validation' | 'execution' | 'completion';
  
  /** Current step within the phase */
  step: string;
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number;
  
  /** Current operation being executed */
  currentOperation?: string;
  
  /** Operations completed so far */
  completedOperations: string[];
  
  /** Total operations to execute */
  totalOperations: number;
}

/**
 * User feedback and interaction interface
 */
export interface UserFeedback {
  /** Type of feedback request */
  type: 'confirmation' | 'choice' | 'input' | 'warning' | 'error';
  
  /** Message to display to user */
  message: string;
  
  /** Available options for user selection */
  options?: string[];
  
  /** Default option if user doesn't respond */
  defaultOption?: string;
  
  /** Whether this requires user interaction */
  requiresResponse: boolean;
  
  /** Timeout for user response in milliseconds */
  timeout?: number;
}

/**
 * Comprehensive refactoring report
 */
export interface RefactoringReport {
  /** Analysis results */
  analysis: AnalysisReport;
  
  /** Refactoring plans generated */
  plans: RefactoringPlan[];
  
  /** Execution results */
  results: RefactoringResult[];
  
  /** Final validation report */
  validation: ValidationReport;
  
  /** Overall success status */
  success: boolean;
  
  /** Total execution time */
  totalTime: number;
  
  /** Summary of changes made */
  changesSummary: {
    filesModified: number;
    filesCreated: number;
    filesDeleted: number;
    linesChanged: number;
    duplicatesRemoved: number;
    filesOptimized: number;
    foldersReorganized: number;
  };
  
  /** Recommendations for future improvements */
  recommendations: string[];
  
  /** Report generation timestamp */
  timestamp: Date;
}

/**
 * Configuration for orchestration system
 */
export interface OrchestrationConfig {
  /** Analysis configuration */
  analysis: AnalysisConfig;
  
  /** Whether to require user confirmation before execution */
  requireConfirmation: boolean;
  
  /** Whether to stop on first error */
  stopOnError: boolean;
  
  /** Maximum execution time in milliseconds */
  maxExecutionTime: number;
  
  /** Whether to create backups before refactoring */
  createBackups: boolean;
  
  /** Progress update interval in milliseconds */
  progressUpdateInterval: number;
}

/**
 * Main orchestration system that coordinates all refactoring components
 */
export class RefactoringOrchestrationSystem extends EventEmitter {
  private analyzer: CodeAnalyzer;
  private engine: RefactoringEngine;
  private validator: ValidationSystem;
  private config: OrchestrationConfig;
  private currentProgress: ProgressInfo;
  private startTime: number = 0;
  private isRunning: boolean = false;

  constructor(
    analyzer: CodeAnalyzer,
    engine: RefactoringEngine,
    validator: ValidationSystem,
    config: Partial<OrchestrationConfig> = {}
  ) {
    super();
    
    this.analyzer = analyzer;
    this.engine = engine;
    this.validator = validator;
    this.config = {
      analysis: config.analysis || {
        maxFileSize: 200,
        maxFilesPerFolder: 10,
        duplicateSimilarityThreshold: 0.8,
        includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
        includeTests: false,
        includeNodeModules: false
      },
      requireConfirmation: config.requireConfirmation ?? true,
      stopOnError: config.stopOnError ?? true,
      maxExecutionTime: config.maxExecutionTime ?? 300000, // 5 minutes
      createBackups: config.createBackups ?? true,
      progressUpdateInterval: config.progressUpdateInterval ?? 1000
    };
    
    this.currentProgress = this.initializeProgress();
  }

  /**
   * Main refactoring pipeline that coordinates all components
   * Implements Requirements: All requirements integration
   */
  async executeRefactoring(): Promise<RefactoringReport> {
    if (this.isRunning) {
      throw new Error('Refactoring is already in progress');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    
    try {
      // Phase 1: Analysis
      this.updateProgress('analysis', 'Starting comprehensive codebase analysis', 0);
      const analysis = await this.performAnalysis();
      
      // Phase 2: Planning
      this.updateProgress('planning', 'Generating refactoring plans', 20);
      const plans = await this.generateRefactoringPlans(analysis);
      
      // Phase 3: Pre-execution Validation
      this.updateProgress('validation', 'Validating current state', 40);
      const preValidation = await this.validator.generateReport();
      
      // User confirmation if required
      if (this.config.requireConfirmation) {
        await this.requestUserConfirmation(plans, analysis);
      }
      
      // Phase 4: Execution
      this.updateProgress('execution', 'Executing refactoring operations', 50);
      const results = await this.executeRefactoringPlans(plans);
      
      // Phase 5: Post-execution Validation
      this.updateProgress('validation', 'Validating refactored code', 90);
      const postValidation = await this.validator.generateReport();
      
      // Phase 6: Completion
      this.updateProgress('completion', 'Generating final report', 95);
      const report = await this.generateFinalReport(
        analysis, 
        plans, 
        results, 
        preValidation, 
        postValidation
      );
      
      this.updateProgress('completion', 'Refactoring completed successfully', 100);
      this.emit('completed', report);
      
      return report;
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Implements dependency-aware execution ordering
   */
  private async executeRefactoringPlans(plans: RefactoringPlan[]): Promise<RefactoringResult[]> {
    const results: RefactoringResult[] = [];
    const totalOperations = plans.reduce((sum, plan) => sum + plan.operations.length, 0);
    let completedOperations = 0;

    for (const plan of plans) {
      try {
        this.emit('planStarted', { plan: plan.timestamp, operations: plan.operations.length });
        
        // Execute operations in dependency-aware order
        const result = await this.executeWithDependencyOrder(plan);
        results.push(result);
        
        completedOperations += plan.operations.length;
        const progress = 50 + (completedOperations / totalOperations) * 40; // 50-90% range
        this.updateProgress('execution', `Completed ${completedOperations}/${totalOperations} operations`, progress);
        
        this.emit('planCompleted', { plan: plan.timestamp, result });
        
        // Stop on error if configured
        if (!result.success && this.config.stopOnError) {
          throw new Error(`Refactoring plan failed: ${result.failedOperations.map(f => f.error).join(', ')}`);
        }
        
      } catch (error) {
        this.emit('planFailed', { plan: plan.timestamp, error });
        
        if (this.config.stopOnError) {
          throw error;
        }
        
        // Create a failed result
        results.push({
          success: false,
          completedOperations: [],
          failedOperations: [{
            operationId: 'plan-execution',
            error: error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : undefined,
            affectedFiles: []
          }],
          modifiedFiles: [],
          createdFiles: [],
          deletedFiles: [],
          executionTime: 0,
          validation: await this.validator.generateReport()
        });
      }
    }

    return results;
  }

  /**
   * Executes operations with proper dependency ordering
   */
  private async executeWithDependencyOrder(plan: RefactoringPlan): Promise<RefactoringResult> {
    // Validate execution order matches dependencies
    const validatedOrder = this.validateExecutionOrder(plan.operations, plan.dependencies, plan.executionOrder);
    
    // If order is invalid but we have a corrected order, use it
    if (!validatedOrder.isValid && validatedOrder.correctedOrder) {
      const updatedPlan: RefactoringPlan = {
        ...plan,
        executionOrder: validatedOrder.correctedOrder
      };
      return await this.engine.executeRefactoring(updatedPlan);
    }
    
    // If order is invalid and we can't correct it, throw error
    if (!validatedOrder.isValid) {
      throw new Error(`Invalid execution order: ${validatedOrder.errors.join(', ')}`);
    }

    // Execute the plan with original order if valid
    return await this.engine.executeRefactoring(plan);
  }

  /**
   * Validates and corrects execution order based on dependencies
   */
  private validateExecutionOrder(
    operations: RefactoringOperation[], 
    dependencies: Record<string, string[]>, 
    executionOrder: string[]
  ): { isValid: boolean; errors: string[]; correctedOrder?: string[] } {
    const errors: string[] = [];
    const operationMap = new Map(operations.map(op => [op.id, op]));
    
    // Check if all operations are in execution order
    const orderSet = new Set(executionOrder);
    const operationIds = operations.map(op => op.id);
    
    for (const opId of operationIds) {
      if (!orderSet.has(opId)) {
        errors.push(`Operation ${opId} missing from execution order`);
      }
    }
    
    // Check dependency constraints
    const executed = new Set<string>();
    
    for (const opId of executionOrder) {
      const deps = dependencies[opId] || [];
      
      for (const dep of deps) {
        if (!executed.has(dep)) {
          errors.push(`Operation ${opId} depends on ${dep} which hasn't been executed yet`);
        }
      }
      
      executed.add(opId);
    }
    
    // If there are errors, try to generate a corrected order
    if (errors.length > 0) {
      try {
        const correctedOrder = this.topologicalSort(operations, dependencies);
        return { isValid: false, errors, correctedOrder };
      } catch (sortError) {
        errors.push(`Cannot resolve dependencies: ${sortError}`);
        return { isValid: false, errors };
      }
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Performs topological sort to resolve dependencies
   */
  private topologicalSort(operations: RefactoringOperation[], dependencies: Record<string, string[]>): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize graph and in-degrees
    for (const op of operations) {
      graph.set(op.id, []);
      inDegree.set(op.id, 0);
    }
    
    // Build the graph (reverse direction for topological sort)
    for (const op of operations) {
      const deps = dependencies[op.id] || [];
      for (const dep of deps) {
        if (!graph.has(dep)) {
          graph.set(dep, []);
        }
        graph.get(dep)!.push(op.id);
        inDegree.set(op.id, (inDegree.get(op.id) || 0) + 1);
      }
    }
    
    // Kahn's algorithm
    const queue: string[] = [];
    const result: string[] = [];
    
    // Find nodes with no incoming edges
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      const dependents = graph.get(current) || [];
      for (const dependent of dependents) {
        const newDegree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, newDegree);
        
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }
    
    // Check for cycles
    if (result.length !== operations.length) {
      throw new Error('Circular dependency detected');
    }
    
    return result;
  }

  /**
   * Adds progress tracking and user feedback systems
   */
  private updateProgress(
    phase: ProgressInfo['phase'], 
    step: string, 
    progress: number, 
    currentOperation?: string
  ): void {
    const elapsed = Date.now() - this.startTime;
    const estimatedTotal = elapsed / (progress / 100);
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);
    
    this.currentProgress = {
      phase,
      step,
      progress: Math.min(100, Math.max(0, progress)),
      estimatedTimeRemaining,
      currentOperation,
      completedOperations: this.currentProgress.completedOperations,
      totalOperations: this.currentProgress.totalOperations
    };
    
    this.emit('progress', this.currentProgress);
  }

  /**
   * Requests user confirmation before proceeding with refactoring
   */
  private async requestUserConfirmation(plans: RefactoringPlan[], analysis: AnalysisReport): Promise<void> {
    const totalOperations = plans.reduce((sum, plan) => sum + plan.operations.length, 0);
    const totalFiles = new Set<string>();
    plans.forEach(plan => 
      plan.operations.forEach(op => 
        op.affectedFiles.forEach(file => totalFiles.add(file))
      )
    );
    
    const feedback: UserFeedback = {
      type: 'confirmation',
      message: `Ready to execute refactoring:\n` +
               `- ${totalOperations} operations planned\n` +
               `- ${totalFiles.size} files will be affected\n` +
               `- ${analysis.duplicatePatterns.length} duplicate patterns to consolidate\n` +
               `- ${analysis.oversizedFiles.length} files to optimize\n` +
               `- ${analysis.overcrowdedFolders.length} folders to reorganize\n\n` +
               `Proceed with refactoring?`,
      options: ['Yes', 'No', 'Show Details'],
      defaultOption: 'No',
      requiresResponse: true,
      timeout: 30000 // 30 seconds
    };
    
    const response = await this.requestUserInput(feedback);
    
    if (response === 'No') {
      throw new Error('Refactoring cancelled by user');
    } else if (response === 'Show Details') {
      await this.showRefactoringDetails(plans, analysis);
      // Recursively ask for confirmation after showing details
      await this.requestUserConfirmation(plans, analysis);
    }
  }

  /**
   * Shows detailed refactoring information to user
   */
  private async showRefactoringDetails(plans: RefactoringPlan[], analysis: AnalysisReport): Promise<void> {
    let details = 'Refactoring Details:\n\n';
    
    // Analysis summary
    details += `Analysis Summary:\n`;
    details += `- Total files analyzed: ${analysis.totalFiles}\n`;
    details += `- Duplicate patterns found: ${analysis.duplicatePatterns.length}\n`;
    details += `- Oversized files: ${analysis.oversizedFiles.length}\n`;
    details += `- Overcrowded folders: ${analysis.overcrowdedFolders.length}\n`;
    details += `- Naming issues: ${analysis.namingIssues.length}\n\n`;
    
    // Plans summary
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      details += `Plan ${i + 1}:\n`;
      details += `- Operations: ${plan.operations.length}\n`;
      details += `- Risk level: ${plan.impact.riskLevel}\n`;
      details += `- Estimated time: ${Math.round(plan.impact.estimatedTime / 1000)}s\n`;
      details += `- Files affected: ${plan.impact.filesAffected}\n\n`;
    }
    
    const feedback: UserFeedback = {
      type: 'input',
      message: details + 'Press Enter to continue...',
      requiresResponse: true
    };
    
    await this.requestUserInput(feedback);
  }

  /**
   * Requests input from user with timeout
   */
  private async requestUserInput(feedback: UserFeedback): Promise<string> {
    return new Promise((resolve, reject) => {
      this.emit('userFeedbackRequired', feedback);
      
      const timeout = feedback.timeout ? setTimeout(() => {
        reject(new Error('User input timeout'));
      }, feedback.timeout) : null;
      
      const handleResponse = (response: string) => {
        if (timeout) clearTimeout(timeout);
        this.removeListener('userResponse', handleResponse);
        resolve(response);
      };
      
      this.once('userResponse', handleResponse);
    });
  }

  /**
   * Performs comprehensive codebase analysis
   */
  private async performAnalysis(): Promise<AnalysisReport> {
    this.emit('analysisStarted');
    
    try {
      const analysis = await this.analyzer.scanCodebase();
      this.emit('analysisCompleted', analysis);
      return analysis;
    } catch (error) {
      this.emit('analysisFailed', error);
      throw error;
    }
  }

  /**
   * Generates refactoring plans based on analysis
   */
  private async generateRefactoringPlans(analysis: AnalysisReport): Promise<RefactoringPlan[]> {
    const plans: RefactoringPlan[] = [];
    
    try {
      // Generate duplication consolidation plan
      if (analysis.duplicatePatterns.length > 0) {
        const duplicationReport: DuplicationReport = {
          patterns: analysis.duplicatePatterns,
          totalDuplicates: analysis.duplicatePatterns.length,
          potentialSavings: analysis.duplicatePatterns.reduce((sum, pattern) => 
            sum + pattern.content.split('\n').length * (pattern.files.length - 1), 0
          ),
          timestamp: new Date()
        };
        
        const duplicationPlan = await this.engine.consolidateDuplicates(duplicationReport);
        plans.push(duplicationPlan);
      }
      
      // Generate file size optimization plan
      if (analysis.oversizedFiles.length > 0) {
        const sizePlan = await this.engine.splitLargeFiles(analysis.oversizedFiles);
        plans.push(sizePlan);
      }
      
      // Generate folder reorganization plan
      if (analysis.overcrowdedFolders.length > 0) {
        const structureReport: StructureReport = {
          overcrowdedFolders: analysis.overcrowdedFolders,
          reorganizationSuggestions: [], // Would be populated by analyzer
          depthAnalysis: { maxDepth: 0, averageDepth: 0, deepFolders: [] }
        };
        
        const folderPlan = await this.engine.reorganizeFolders(structureReport);
        plans.push(folderPlan);
      }
      
      // Generate naming improvement plan
      if (analysis.namingIssues.length > 0) {
        const namingReport: NamingReport = {
          namingIssues: analysis.namingIssues,
          namingSuggestions: [], // Would be populated by analyzer
          patternAnalysis: { patterns: [], inconsistencies: [], suggestedConventions: [] }
        };
        
        const namingPlan = await this.engine.renameFiles(namingReport);
        plans.push(namingPlan);
      }
      
      return plans;
      
    } catch (error) {
      this.emit('planningFailed', error);
      throw error;
    }
  }

  /**
   * Creates comprehensive reporting for refactoring results
   */
  private async generateFinalReport(
    analysis: AnalysisReport,
    plans: RefactoringPlan[],
    results: RefactoringResult[],
    preValidation: ValidationReport,
    postValidation: ValidationReport
  ): Promise<RefactoringReport> {
    const totalTime = Date.now() - this.startTime;
    const success = results.every(result => result.success) && postValidation.overallSuccess;
    
    // Calculate changes summary
    const changesSummary = {
      filesModified: new Set(results.flatMap(r => r.modifiedFiles)).size,
      filesCreated: new Set(results.flatMap(r => r.createdFiles)).size,
      filesDeleted: new Set(results.flatMap(r => r.deletedFiles)).size,
      linesChanged: plans.reduce((sum, plan) => sum + plan.impact.linesChanged, 0),
      duplicatesRemoved: analysis.duplicatePatterns.length,
      filesOptimized: analysis.oversizedFiles.length,
      foldersReorganized: analysis.overcrowdedFolders.length
    };
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!postValidation.testResults.success) {
      recommendations.push('Fix failing tests to ensure code quality');
    }
    
    if (!postValidation.buildResults.success) {
      recommendations.push('Resolve build errors to ensure deployability');
    }
    
    if (changesSummary.duplicatesRemoved > 0) {
      recommendations.push('Consider implementing code review processes to prevent future duplication');
    }
    
    if (changesSummary.filesOptimized > 0) {
      recommendations.push('Establish file size guidelines and automated checks');
    }
    
    if (changesSummary.foldersReorganized > 0) {
      recommendations.push('Document new folder structure for team consistency');
    }
    
    const report: RefactoringReport = {
      analysis,
      plans,
      results,
      validation: postValidation,
      success,
      totalTime,
      changesSummary,
      recommendations,
      timestamp: new Date()
    };
    
    this.emit('reportGenerated', report);
    return report;
  }

  /**
   * Initializes progress tracking
   */
  private initializeProgress(): ProgressInfo {
    return {
      phase: 'analysis',
      step: 'Initializing',
      progress: 0,
      estimatedTimeRemaining: 0,
      completedOperations: [],
      totalOperations: 0
    };
  }

  /**
   * Gets current progress information
   */
  getProgress(): ProgressInfo {
    return { ...this.currentProgress };
  }

  /**
   * Checks if refactoring is currently running
   */
  isRefactoringInProgress(): boolean {
    return this.isRunning;
  }

  /**
   * Cancels ongoing refactoring (if possible)
   */
  async cancelRefactoring(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('No refactoring in progress');
    }
    
    this.emit('cancellationRequested');
    // Implementation would depend on the specific refactoring engine capabilities
    // For now, we just emit the event
  }

  /**
   * Provides user response to feedback requests
   */
  provideUserResponse(response: string): void {
    this.emit('userResponse', response);
  }
}

/**
 * Factory function to create a configured RefactoringOrchestrationSystem
 */
export function createRefactoringOrchestrationSystem(
  analyzer: CodeAnalyzer,
  engine: RefactoringEngine,
  validator: ValidationSystem,
  config?: Partial<OrchestrationConfig>
): RefactoringOrchestrationSystem {
  return new RefactoringOrchestrationSystem(analyzer, engine, validator, config);
}

/**
 * Default export for convenience
 */
export default RefactoringOrchestrationSystem;