/**
 * Integrated Refactoring System
 * Combines all refactoring components with actual file operations
 */

import path from 'path';
import { FileSystemOperations } from './FileSystemOperations.js';
import { ASTAnalysisService } from './ASTAnalysisService.js';
import { ImportPathResolver } from './ImportPathResolver.js';
import { ActualRefactoringEngine } from './ActualRefactoringEngine.js';

export interface RefactoringConfig {
  maxFileSize: number;
  maxFilesPerFolder: number;
  duplicateSimilarityThreshold: number;
  includePatterns: string[];
  excludePatterns: string[];
  createBackups: boolean;
  stopOnError: boolean;
}

export interface AnalysisResult {
  totalFiles: number;
  oversizedFiles: Array<{
    path: string;
    lineCount: number;
    complexity?: number;
  }>;
  overcrowdedFolders: Array<{
    path: string;
    fileCount: number;
    maxRecommended: number;
    suggestedSubfolders: string[];
  }>;
  duplicatePatterns: Array<{
    id: string;
    content: string;
    files: string[];
    similarity: number;
  }>;
  namingIssues: Array<{
    file: string;
    issue: string;
    suggestion: string;
  }>;
}

export interface RefactoringReport {
  success: boolean;
  totalTime: number;
  filesModified: number;
  filesCreated: number;
  filesDeleted: number;
  duplicatesRemoved: number;
  filesOptimized: number;
  foldersReorganized: number;
  operations: string[];
  errors: string[];
  warnings: string[];
}

export class IntegratedRefactoringSystem {
  private fsOps: FileSystemOperations;
  private astService: ASTAnalysisService;
  private importResolver: ImportPathResolver;
  public refactoringEngine: ActualRefactoringEngine; // Made public for testing

  constructor(
    private projectRoot: string = process.cwd(),
    private config: RefactoringConfig = {
      maxFileSize: 200,
      maxFilesPerFolder: 10,
      duplicateSimilarityThreshold: 0.8,
      includePatterns: ['src/**/*.ts', 'src/**/*.tsx'],
      excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
      createBackups: true,
      stopOnError: true
    }
  ) {
    this.fsOps = new FileSystemOperations(projectRoot);
    this.astService = new ASTAnalysisService(projectRoot);
    this.importResolver = new ImportPathResolver(projectRoot);
    this.refactoringEngine = new ActualRefactoringEngine(projectRoot);
  }

  /**
   * Performs comprehensive codebase analysis with performance optimizations
   */
  async analyzeCodebase(): Promise<AnalysisResult> {
    console.log('🔍 Analyzing codebase...');
    
    await this.astService.initializeProgram();
    
    const files = await this.findMatchingFiles();
    
    // Performance optimization: Process files in batches for large codebases
    const batchSize = files.length > 100 ? 50 : files.length;
    const oversizedFiles: AnalysisResult['oversizedFiles'] = [];
    const folderStats = new Map<string, number>();
    
    console.log(`📊 Processing ${files.length} files in batches of ${batchSize}...`);
    
    // Process files in batches to manage memory usage
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(files.length / batchSize);
      
      if (files.length > 50) {
        console.log(`   Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)...`);
      }
      
      // Process batch concurrently but with limited concurrency
      const concurrencyLimit = Math.min(batch.length, 10);
      const promises: Promise<void>[] = [];
      
      for (let j = 0; j < batch.length; j += concurrencyLimit) {
        const concurrentBatch = batch.slice(j, j + concurrencyLimit);
        
        const batchPromise = Promise.all(
          concurrentBatch.map(async (filePath) => {
            try {
              const stats = await this.fsOps.getFileStats(filePath);
              
              // Check file size
              if (stats.lines > this.config.maxFileSize) {
                oversizedFiles.push({
                  path: filePath,
                  lineCount: stats.lines
                });
              }
              
              // Count files per folder
              const folder = path.dirname(filePath);
              folderStats.set(folder, (folderStats.get(folder) || 0) + 1);
              
            } catch (error) {
              console.warn(`Could not analyze ${filePath}:`, error);
            }
          })
        ).then(() => {
          // Optional: Force garbage collection after each concurrent batch
          if (global.gc && files.length > 200) {
            global.gc();
          }
        });
        
        promises.push(batchPromise);
      }
      
      await Promise.all(promises);
    }
    
    // Find overcrowded folders
    const overcrowdedFolders: AnalysisResult['overcrowdedFolders'] = [];
    for (const [folder, count] of folderStats) {
      if (count > this.config.maxFilesPerFolder) {
        overcrowdedFolders.push({
          path: folder,
          fileCount: count,
          maxRecommended: this.config.maxFilesPerFolder,
          suggestedSubfolders: this.generateSubfolderSuggestions(folder)
        });
      }
    }
    
    // Optimize duplicate detection for large codebases
    console.log('🔍 Analyzing duplicate patterns...');
    const duplicatePatterns = await this.findDuplicatePatternsOptimized(files);
    
    // Simple naming issue detection
    const namingIssues = this.findNamingIssues(files);
    
    return {
      totalFiles: files.length,
      oversizedFiles,
      overcrowdedFolders,
      duplicatePatterns,
      namingIssues
    };
  }

  /**
   * Executes the complete refactoring process
   */
  async executeRefactoring(): Promise<RefactoringReport> {
    const startTime = Date.now();
    const operations: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let filesModified = 0;
    let filesCreated = 0;
    let filesDeleted = 0;
    let duplicatesRemoved = 0;
    let filesOptimized = 0;
    let foldersReorganized = 0;

    try {
      // Step 1: Analyze codebase
      console.log('📊 Step 1: Analyzing codebase...');
      const analysis = await this.analyzeCodebase();
      operations.push(`Analyzed ${analysis.totalFiles} files`);

      // Step 2: Handle oversized files using ActualRefactoringEngine
      if (analysis.oversizedFiles.length > 0) {
        console.log(`📏 Step 2: Splitting ${analysis.oversizedFiles.length} oversized files...`);
        
        try {
          const fileInfos = analysis.oversizedFiles.map(file => ({
            path: file.path,
            lineCount: file.lineCount,
            complexity: file.complexity || 0,
            dependencies: [],
            exports: [],
            sizeBytes: 0,
            fileType: 'ts' as const,
            lastModified: new Date()
          }));
          
          const plan = await this.refactoringEngine.splitLargeFiles(fileInfos);
          const result = await this.refactoringEngine.executeRefactoring(plan);
          
          if (result.success) {
            filesModified += result.modifiedFiles.length;
            filesCreated += result.createdFiles.length;
            filesOptimized += analysis.oversizedFiles.length;
            operations.push(`Split ${analysis.oversizedFiles.length} oversized files into ${result.createdFiles.length} modules`);
          } else {
            errors.push(`File splitting failed: ${result.failedOperations.map(f => f.error).join(', ')}`);
          }
        } catch (error) {
          const errorMsg = `Failed to split files: ${error}`;
          errors.push(errorMsg);
          if (this.config.stopOnError) throw new Error(errorMsg);
        }
      }

      // Step 3: Reorganize overcrowded folders using ActualRefactoringEngine
      if (analysis.overcrowdedFolders.length > 0) {
        console.log(`📂 Step 3: Reorganizing ${analysis.overcrowdedFolders.length} overcrowded folders...`);
        
        try {
          const structureReport = {
            overcrowdedFolders: analysis.overcrowdedFolders.map(folder => ({
              path: folder.path,
              fileCount: folder.fileCount,
              subfolderCount: 0,
              totalSize: 0,
              files: [],
              subfolders: []
            })),
            reorganizationSuggestions: [],
            depthAnalysis: {
              maxDepth: 3,
              averageDepth: 2,
              deepFolders: []
            }
          };
          
          const plan = await this.refactoringEngine.reorganizeFolders(structureReport);
          const result = await this.refactoringEngine.executeRefactoring(plan);
          
          if (result.success) {
            filesModified += result.modifiedFiles.length;
            filesCreated += result.createdFiles.length;
            foldersReorganized += analysis.overcrowdedFolders.length;
            operations.push(`Reorganized ${analysis.overcrowdedFolders.length} overcrowded folders`);
          } else {
            errors.push(`Folder reorganization failed: ${result.failedOperations.map(f => f.error).join(', ')}`);
          }
        } catch (error) {
          const errorMsg = `Failed to reorganize folders: ${error}`;
          errors.push(errorMsg);
          if (this.config.stopOnError) throw new Error(errorMsg);
        }
      }

      // Step 4: Consolidate duplicates using ActualRefactoringEngine
      if (analysis.duplicatePatterns.length > 0) {
        console.log(`🔄 Step 4: Consolidating ${analysis.duplicatePatterns.length} duplicate patterns...`);
        
        try {
          const duplicationReport = {
            patterns: analysis.duplicatePatterns.map(pattern => ({
              id: pattern.id,
              files: pattern.files,
              content: pattern.content,
              locations: [],
              similarity: pattern.similarity,
              consolidationSuggestion: {
                approach: 'utility' as const,
                targetLocation: 'src/utils/shared/',
                suggestedName: `${pattern.id}Utility`,
                effort: 'low' as const
              }
            })),
            totalDuplicates: analysis.duplicatePatterns.length,
            potentialSavings: analysis.duplicatePatterns.length * 10,
            timestamp: new Date()
          };
          
          const plan = await this.refactoringEngine.consolidateDuplicates(duplicationReport);
          const result = await this.refactoringEngine.executeRefactoring(plan);
          
          if (result.success) {
            filesModified += result.modifiedFiles.length;
            filesCreated += result.createdFiles.length;
            duplicatesRemoved += analysis.duplicatePatterns.length;
            operations.push(`Consolidated ${analysis.duplicatePatterns.length} duplicate patterns`);
          } else {
            errors.push(`Duplicate consolidation failed: ${result.failedOperations.map(f => f.error).join(', ')}`);
          }
        } catch (error) {
          const errorMsg = `Failed to consolidate duplicates: ${error}`;
          errors.push(errorMsg);
          if (this.config.stopOnError) throw new Error(errorMsg);
        }
      }

      // Step 5: Fix naming issues using ActualRefactoringEngine
      if (analysis.namingIssues.length > 0) {
        console.log(`🏷️ Step 5: Fixing ${analysis.namingIssues.length} naming issues...`);
        
        try {
          // Filter out naming issues for files that no longer exist (may have been moved/deleted)
          const existingNamingIssues = [];
          for (const issue of analysis.namingIssues) {
            const fileExists = await this.fsOps.fileExists(issue.file);
            if (fileExists) {
              existingNamingIssues.push(issue);
            } else {
              warnings.push(`Skipping rename of ${issue.file} - file no longer exists (may have been moved during reorganization)`);
            }
          }
          
          if (existingNamingIssues.length > 0) {
            const namingReport = {
              namingIssues: existingNamingIssues.map(issue => ({
                file: issue.file,
                issueType: 'unclear' as const,
                currentName: issue.file,
                suggestedName: issue.suggestion,
                reason: issue.issue
              })),
              namingSuggestions: [],
              patternAnalysis: {
                patterns: [],
                inconsistencies: [],
                suggestedConventions: []
              }
            };
            
            const plan = await this.refactoringEngine.renameFiles(namingReport);
            const result = await this.refactoringEngine.executeRefactoring(plan);
            
            if (result.success) {
              filesModified += result.modifiedFiles.length;
              operations.push(`Fixed ${existingNamingIssues.length} naming issues`);
            } else {
              errors.push(`Naming fixes failed: ${result.failedOperations.map(f => f.error).join(', ')}`);
            }
          } else {
            operations.push('No naming issues to fix (files may have been moved during reorganization)');
          }
        } catch (error) {
          const errorMsg = `Failed to fix naming issues: ${error}`;
          errors.push(errorMsg);
          if (this.config.stopOnError) throw new Error(errorMsg);
        }
      }

      const totalTime = Date.now() - startTime;
      const success = errors.length === 0;

      return {
        success,
        totalTime,
        filesModified,
        filesCreated,
        filesDeleted,
        duplicatesRemoved,
        filesOptimized,
        foldersReorganized,
        operations,
        errors,
        warnings
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      errors.push(`Critical error: ${error}`);
      
      return {
        success: false,
        totalTime,
        filesModified,
        filesCreated,
        filesDeleted,
        duplicatesRemoved,
        filesOptimized,
        foldersReorganized,
        operations,
        errors,
        warnings
      };
    }
  }

  /**
   * Splits a large file into smaller modules
   */
  private async splitLargeFile(filePath: string): Promise<{ modifiedFiles: number; createdFiles: number }> {
    const splitSuggestion = await this.astService.suggestFileSplit(filePath, this.config.maxFileSize);
    
    let createdFiles = 0;
    let modifiedFiles = 0;

    // Create split files
    for (const split of splitSuggestion.suggestedSplits) {
      await this.fsOps.createFile(split.fileName, split.content);
      createdFiles++;
    }

    // Update original file
    if (splitSuggestion.remainingContent.trim()) {
      await this.fsOps.modifyFile(filePath, splitSuggestion.remainingContent);
      modifiedFiles++;
    }

    // Update import paths
    const pathMappings = splitSuggestion.suggestedSplits.map(split => ({
      oldPath: filePath,
      newPath: split.fileName
    }));

    const importUpdates = await this.importResolver.updateImportPaths(pathMappings);
    modifiedFiles += importUpdates.length;

    return { modifiedFiles, createdFiles };
  }

  /**
   * Reorganizes an overcrowded folder
   */
  private async reorganizeFolder(
    folderPath: string, 
    subfolders: string[]
  ): Promise<{ movedFiles: number; createdFiles: number }> {
    // Create subfolders
    for (const subfolder of subfolders) {
      await this.fsOps.createDirectory(path.join(folderPath, subfolder));
    }

    // Get files and categorize them
    const files = await this.fsOps.listFiles(folderPath, false);
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    
    const fileMappings = this.categorizeFiles(tsFiles, subfolders);
    const pathMappings = [];
    let movedFiles = 0;

    // Move files to appropriate subfolders
    for (const [fileName, subfolder] of Object.entries(fileMappings)) {
      const oldPath = path.join(folderPath, fileName);
      const newPath = path.join(folderPath, subfolder, fileName);
      
      await this.fsOps.moveFile(oldPath, newPath);
      pathMappings.push({ oldPath, newPath });
      movedFiles++;
    }

    // Update import paths
    await this.importResolver.updateImportPaths(pathMappings);

    // Create barrel exports
    await this.importResolver.createBarrelExports(folderPath, subfolders);
    const createdFiles = subfolders.length + 1; // One index.ts per subfolder + main index.ts

    return { movedFiles, createdFiles };
  }

  /**
   * Consolidates a duplicate pattern
   */
  private async consolidateDuplicate(
    pattern: AnalysisResult['duplicatePatterns'][0]
  ): Promise<{ modifiedFiles: number; createdFiles: number }> {
    // Create utility file
    const utilityPath = `src/utils/shared/${pattern.id}Utility.ts`;
    const utilityContent = `/**
 * Auto-generated utility for ${pattern.id}
 * Extracted from duplicate code patterns
 */

${pattern.content}

export default ${pattern.id};
`;

    await this.fsOps.createFile(utilityPath, utilityContent);
    let createdFiles = 1;
    let modifiedFiles = 0;

    // Update files to use the utility
    for (const filePath of pattern.files) {
      if (await this.fsOps.fileExists(filePath)) {
        const content = await this.fsOps.readFile(filePath);
        const updatedContent = this.replaceWithUtilityImport(content, utilityPath, pattern.id);
        await this.fsOps.modifyFile(filePath, updatedContent);
        modifiedFiles++;
      }
    }

    return { modifiedFiles, createdFiles };
  }

  /**
   * Fixes a naming issue
   */
  private async fixNamingIssue(issue: AnalysisResult['namingIssues'][0]): Promise<void> {
    await this.fsOps.moveFile(issue.file, issue.suggestion);
    
    // Update import paths
    const pathMappings = [{ oldPath: issue.file, newPath: issue.suggestion }];
    await this.importResolver.updateImportPaths(pathMappings);
  }

  /**
   * Finds files matching the include/exclude patterns
   */
  private async findMatchingFiles(): Promise<string[]> {
    const allFiles = await this.fsOps.listFiles('.', true);
    
    return allFiles.filter(file => {
      // Check include patterns
      const included = this.config.includePatterns.some(pattern => 
        this.matchesPattern(file, pattern)
      );
      
      if (!included) return false;
      
      // Check exclude patterns
      const excluded = this.config.excludePatterns.some(pattern => 
        this.matchesPattern(file, pattern)
      );
      
      return !excluded;
    });
  }

  /**
   * Simple pattern matching (can be enhanced with glob)
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex more carefully
    let regexPattern = pattern;
    
    // Escape dots FIRST (before any replacements)
    regexPattern = regexPattern.replace(/\./g, '\\.');
    
    // Handle ** first (recursive directory match - matches zero or more path segments)
    // ** should match zero or more directories, so we need to handle the slash carefully
    regexPattern = regexPattern.replace(/\*\*\/\*/g, '§RECURSIVE_WITH_STAR§');
    regexPattern = regexPattern.replace(/\*\*/g, '§RECURSIVE§');
    
    // Handle * (matches any filename characters except /)
    regexPattern = regexPattern.replace(/\*/g, '[^/]*');
    
    // Replace the recursive placeholders with proper regex
    // **/* should match zero or more directories followed by a filename
    regexPattern = regexPattern.replace(/§RECURSIVE_WITH_STAR§/g, '(?:.*/)?[^/]*');
    // ** alone should match any path
    regexPattern = regexPattern.replace(/§RECURSIVE§/g, '.*');
    
    // Ensure pattern matches from start to end
    regexPattern = '^' + regexPattern + '$';
    
    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  }

  /**
   * Generates subfolder suggestions based on folder content
   */
  private generateSubfolderSuggestions(folderPath: string): string[] {
    const folderName = path.basename(folderPath);
    
    if (folderName === 'services') {
      return ['api', 'business-logic', 'data-processing', 'utilities'];
    } else if (folderName === 'utils') {
      return ['validation', 'formatting', 'data-processing', 'performance'];
    } else if (folderName === 'components') {
      return ['ui', 'features', 'layout', 'shared'];
    } else if (folderName === 'hooks') {
      return ['controllers', 'processing', 'shared', 'utilities'];
    }
    
    return ['core', 'shared', 'utilities', 'helpers'];
  }

  /**
   * Categorizes files into appropriate subfolders
   */
  private categorizeFiles(files: string[], subfolders: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      
      // Simple categorization logic
      if (fileName.includes('api') || fileName.includes('service') && fileName.includes('api')) {
        mappings[file] = subfolders.includes('api') ? 'api' : subfolders[0];
      } else if (fileName.includes('util') || fileName.includes('helper')) {
        mappings[file] = subfolders.includes('utilities') ? 'utilities' : subfolders[subfolders.length - 1];
      } else if (fileName.includes('data') || fileName.includes('transform')) {
        mappings[file] = subfolders.includes('data-processing') ? 'data-processing' : subfolders[1];
      } else if (fileName.includes('validation') || fileName.includes('validator')) {
        mappings[file] = subfolders.includes('validation') ? 'validation' : subfolders[0];
      } else if (fileName.includes('format') || fileName.includes('formatter')) {
        mappings[file] = subfolders.includes('formatting') ? 'formatting' : subfolders[1];
      } else if (fileName.includes('performance') || fileName.includes('perf')) {
        mappings[file] = subfolders.includes('performance') ? 'performance' : subfolders[subfolders.length - 1];
      } else {
        // Default to first subfolder or business-logic
        mappings[file] = subfolders.includes('business-logic') ? 'business-logic' : subfolders[0];
      }
    }
    
    return mappings;
  }

  /**
   * Optimized duplicate pattern detection for large codebases
   */
  private async findDuplicatePatternsOptimized(files: string[]): Promise<AnalysisResult['duplicatePatterns']> {
    // For large codebases, use sampling and heuristics to avoid O(n²) complexity
    if (files.length > 100) {
      return this.findDuplicatePatternsWithSampling(files);
    } else {
      return this.findDuplicatePatterns(files);
    }
  }

  /**
   * Sampling-based duplicate detection for large codebases
   */
  private async findDuplicatePatternsWithSampling(files: string[]): Promise<AnalysisResult['duplicatePatterns']> {
    const patterns: AnalysisResult['duplicatePatterns'] = [];
    
    // Sample files for pattern detection to avoid performance issues
    const sampleSize = Math.min(50, Math.ceil(files.length * 0.2)); // Sample 20% or max 50 files
    const sampledFiles = this.sampleFiles(files, sampleSize);
    
    console.log(`   Sampling ${sampledFiles.length} files for duplicate detection...`);
    
    // Look for common patterns in sampled files
    const patternCandidates = new Map<string, string[]>();
    
    for (const file of sampledFiles) {
      try {
        const content = await this.fsOps.readFile(file);
        
        // Extract common patterns
        const patterns = this.extractCommonPatterns(content);
        
        for (const pattern of patterns) {
          if (!patternCandidates.has(pattern)) {
            patternCandidates.set(pattern, []);
          }
          patternCandidates.get(pattern)!.push(file);
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    // Find patterns that appear in multiple files
    for (const [pattern, filesWithPattern] of patternCandidates) {
      if (filesWithPattern.length >= 2) {
        patterns.push({
          id: `pattern-${patterns.length}`,
          content: pattern,
          files: filesWithPattern,
          similarity: 0.85
        });
      }
    }
    
    return patterns;
  }

  /**
   * Sample files strategically for pattern detection
   */
  private sampleFiles(files: string[], sampleSize: number): string[] {
    // Stratified sampling: take files from different folders
    const folderGroups = new Map<string, string[]>();
    
    for (const file of files) {
      const folder = path.dirname(file);
      if (!folderGroups.has(folder)) {
        folderGroups.set(folder, []);
      }
      folderGroups.get(folder)!.push(file);
    }
    
    const sampledFiles: string[] = [];
    const filesPerFolder = Math.ceil(sampleSize / folderGroups.size);
    
    for (const [folder, folderFiles] of folderGroups) {
      const folderSample = folderFiles.slice(0, filesPerFolder);
      sampledFiles.push(...folderSample);
      
      if (sampledFiles.length >= sampleSize) break;
    }
    
    return sampledFiles.slice(0, sampleSize);
  }

  /**
   * Extract common code patterns from file content
   */
  private extractCommonPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    // Look for common error handling patterns
    if (content.includes('try {') && content.includes('catch (error)')) {
      patterns.push('try-catch-error-handling');
    }
    
    // Look for validation patterns
    if (content.includes('if (!') && content.includes('throw new Error')) {
      patterns.push('validation-with-error-throw');
    }
    
    // Look for async/await patterns
    if (content.includes('async ') && content.includes('await ')) {
      patterns.push('async-await-pattern');
    }
    
    // Look for fetch patterns
    if (content.includes('fetch(') && content.includes('response.json()')) {
      patterns.push('fetch-json-pattern');
    }
    
    return patterns;
  }
  private async findDuplicatePatterns(files: string[]): Promise<AnalysisResult['duplicatePatterns']> {
    // This is a simplified implementation
    // In a real system, this would use more sophisticated AST analysis
    const patterns: AnalysisResult['duplicatePatterns'] = [];
    
    // Look for common error handling patterns
    const errorHandlingFiles = [];
    const validationFiles = [];
    
    for (const file of files) {
      try {
        const content = await this.fsOps.readFile(file);
        
        if (content.includes('try {') && content.includes('catch (error)') && content.includes('console.error')) {
          errorHandlingFiles.push(file);
        }
        
        if (content.includes('if (!') && content.includes('throw new Error')) {
          validationFiles.push(file);
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    if (errorHandlingFiles.length >= 2) {
      patterns.push({
        id: 'error-handling-pattern',
        content: 'try { ... } catch (error) { console.error(...) }',
        files: errorHandlingFiles,
        similarity: 0.85
      });
    }
    
    if (validationFiles.length >= 2) {
      patterns.push({
        id: 'validation-pattern',
        content: 'if (!value || value.trim() === "") { throw new Error(...) }',
        files: validationFiles,
        similarity: 0.90
      });
    }
    
    return patterns;
  }

  /**
   * Simple naming issue detection
   */
  private findNamingIssues(files: string[]): AnalysisResult['namingIssues'] {
    const issues: AnalysisResult['namingIssues'] = [];
    
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      
      // Check for abbreviated names
      if (fileName.length < 4 && !['App', 'api', 'ui'].includes(fileName)) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const suggestion = path.join(dir, `${fileName}Service${ext}`);
        
        issues.push({
          file,
          issue: 'Abbreviated name',
          suggestion
        });
      }
    }
    
    return issues;
  }

  /**
   * Replaces duplicate code with utility import
   */
  private replaceWithUtilityImport(content: string, utilityPath: string, patternId: string): string {
    const relativePath = path.relative(path.dirname(utilityPath), utilityPath).replace('.ts', '');
    const importStatement = `import { ${patternId} } from '${relativePath}';`;
    
    // Simple replacement - in a real implementation, this would be more sophisticated
    return importStatement + '\n\n' + content;
  }
}

export default IntegratedRefactoringSystem;