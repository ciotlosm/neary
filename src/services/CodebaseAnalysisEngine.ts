/**
 * Codebase Analysis Engine
 * Implements comprehensive codebase scanning and analysis for architecture simplification
 * Validates Requirements: 1.1, 2.1, 3.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import type {
  CodeAnalyzer,
  AnalysisReport,
  DuplicationReport,
  SizeReport,
  StructureReport,
  NamingReport,
  FileInfo,
  FolderInfo,
  DuplicatePattern,
  PatternLocation,
  ConsolidationSuggestion,
  NamingIssue,
  ComplexityMetric,
  AnalysisConfig,
  SizeDistribution,
  ReorganizationSuggestion,
  DepthAnalysis,
  NamingSuggestion,
  NamingPatternAnalysis
} from '../types/architectureSimplification';
import { DEFAULT_ANALYSIS_CONFIG } from '../types/architectureSimplification';

/**
 * Implementation of CodeAnalyzer interface for comprehensive codebase analysis
 */
export class CodebaseAnalysisEngine implements CodeAnalyzer {
  private config: AnalysisConfig;
  private rootPath: string;

  constructor(rootPath: string = process.cwd(), config: Partial<AnalysisConfig> = {}) {
    this.rootPath = rootPath;
    this.config = { ...DEFAULT_ANALYSIS_CONFIG, ...config };
  }

  /**
   * Performs comprehensive codebase scanning and analysis
   */
  async scanCodebase(): Promise<AnalysisReport> {
    const startTime = Date.now();
    
    // Scan all files in the codebase
    const allFiles = await this.scanFiles();
    
    // Perform all analysis types
    const [
      duplicates,
      sizeReport,
      structureReport,
      namingReport
    ] = await Promise.all([
      this.identifyDuplicates(),
      this.measureFileSizes(),
      this.evaluateFolderStructure(),
      this.assessNamingConventions()
    ]);

    // Calculate complexity metrics
    const complexityMetrics = await this.calculateComplexityMetrics(allFiles);

    const report: AnalysisReport = {
      totalFiles: allFiles.length,
      oversizedFiles: sizeReport.oversizedFiles,
      overcrowdedFolders: structureReport.overcrowdedFolders,
      duplicatePatterns: duplicates.patterns,
      namingIssues: namingReport.namingIssues,
      complexityMetrics,
      timestamp: new Date(),
      config: this.config
    };

    console.log(`Analysis completed in ${Date.now() - startTime}ms`);
    return report;
  }

  /**
   * Identifies duplicate code patterns across files
   */
  async identifyDuplicates(): Promise<DuplicationReport> {
    const files = await this.scanFiles();
    const patterns: DuplicatePattern[] = [];
    const processedHashes = new Set<string>();

    // Extract function and class signatures for comparison
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        
        const duplicates = await this.findDuplicatesBetweenFiles(file1, file2);
        patterns.push(...duplicates);
      }
    }

    // Remove duplicate patterns and calculate savings
    const uniquePatterns = this.deduplicatePatterns(patterns);
    const potentialSavings = this.calculatePotentialSavings(uniquePatterns);

    return {
      patterns: uniquePatterns,
      totalDuplicates: uniquePatterns.length,
      potentialSavings,
      timestamp: new Date()
    };
  }

  /**
   * Measures file sizes against defined limits
   */
  async measureFileSizes(): Promise<SizeReport> {
    const files = await this.scanFiles();
    const oversizedFiles = files.filter(file => file.lineCount > this.config.maxFileSize);
    
    const fileSizes = files.map(f => f.lineCount);
    const averageFileSize = fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;
    const largestFile = files.reduce((largest, current) => 
      current.lineCount > largest.lineCount ? current : largest
    );

    const sizeDistribution: SizeDistribution = {
      small: files.filter(f => f.lineCount < 50).length,
      medium: files.filter(f => f.lineCount >= 50 && f.lineCount < 200).length,
      large: files.filter(f => f.lineCount >= 200 && f.lineCount < 500).length,
      extraLarge: files.filter(f => f.lineCount >= 500).length
    };

    return {
      oversizedFiles,
      averageFileSize,
      largestFile,
      sizeDistribution
    };
  }

  /**
   * Evaluates folder structure for organization issues
   */
  async evaluateFolderStructure(): Promise<StructureReport> {
    const folders = await this.scanFolders();
    const overcrowdedFolders = folders.filter(folder => 
      folder.fileCount > this.config.maxFilesPerFolder
    );

    const reorganizationSuggestions = this.generateReorganizationSuggestions(overcrowdedFolders);
    const depthAnalysis = this.analyzeDepth(folders);

    return {
      overcrowdedFolders,
      reorganizationSuggestions,
      depthAnalysis
    };
  }

  /**
   * Assesses naming conventions and suggests improvements
   */
  async assessNamingConventions(): Promise<NamingReport> {
    const files = await this.scanFiles();
    const namingIssues: NamingIssue[] = [];
    const namingSuggestions: NamingSuggestion[] = [];

    for (const file of files) {
      const fileName = path.basename(file.path, path.extname(file.path));
      const issues = this.analyzeFileName(fileName, file.path);
      namingIssues.push(...issues);

      if (issues.length > 0) {
        const suggestions = this.generateNamingSuggestions(fileName, file.path, issues);
        namingSuggestions.push(...suggestions);
      }
    }

    const patternAnalysis = this.analyzeNamingPatterns(files);

    return {
      namingIssues,
      namingSuggestions,
      patternAnalysis
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Scans the file system to identify all TypeScript/JavaScript files
   */
  private async scanFiles(): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    const scanDirectory = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath);
        
        // Skip excluded patterns
        if (this.shouldExcludeFile(relativePath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && this.isTargetFile(entry.name)) {
          const fileInfo = this.analyzeFile(fullPath, relativePath);
          if (fileInfo) {
            files.push(fileInfo);
          }
        }
      }
    };

    scanDirectory(this.rootPath);
    return files;
  }

  /**
   * Scans folders to analyze structure
   */
  private async scanFolders(): Promise<FolderInfo[]> {
    const folders: FolderInfo[] = [];
    
    const scanDirectory = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const relativePath = path.relative(this.rootPath, dirPath);
      
      // Skip excluded patterns
      if (this.shouldExcludeFile(relativePath)) {
        return;
      }
      
      const files: string[] = [];
      const subfolders: string[] = [];
      let totalSize = 0;
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const entryRelativePath = path.relative(this.rootPath, fullPath);
        
        if (this.shouldExcludeFile(entryRelativePath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          subfolders.push(entry.name);
          scanDirectory(fullPath);
        } else if (entry.isFile() && this.isTargetFile(entry.name)) {
          files.push(entry.name);
          try {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
      
      if (relativePath) { // Don't include root directory
        folders.push({
          path: relativePath,
          fileCount: files.length,
          subfolderCount: subfolders.length,
          totalSize,
          files,
          subfolders
        });
      }
    };

    scanDirectory(this.rootPath);
    return folders;
  }

  /**
   * Analyzes a single file to extract information
   */
  private analyzeFile(fullPath: string, relativePath: string): FileInfo | null {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const stats = fs.statSync(fullPath);
      const lines = content.split('\n');
      
      // Parse with TypeScript compiler for dependency analysis
      const sourceFile = ts.createSourceFile(
        relativePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      const dependencies = this.extractDependencies(sourceFile);
      const exports = this.extractExports(sourceFile);
      const complexity = this.calculateComplexity(sourceFile);
      
      return {
        path: relativePath,
        lineCount: lines.length,
        complexity,
        dependencies,
        exports,
        sizeBytes: stats.size,
        fileType: path.extname(fullPath).slice(1),
        lastModified: stats.mtime
      };
    } catch (error) {
      console.warn(`Failed to analyze file ${relativePath}:`, error);
      return null;
    }
  }

  /**
   * Extracts import dependencies from a TypeScript source file
   */
  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        dependencies.push(node.moduleSpecifier.text);
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return dependencies;
  }

  /**
   * Extracts export symbols from a TypeScript source file
   */
  private extractExports(sourceFile: ts.SourceFile): string[] {
    const exports: string[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) {
            exports.push(element.name.text);
          }
        }
      } else if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isVariableStatement(node)) {
        if (node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
          if (ts.isFunctionDeclaration(node) && node.name) {
            exports.push(node.name.text);
          } else if (ts.isClassDeclaration(node) && node.name) {
            exports.push(node.name.text);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return exports;
  }

  /**
   * Calculates cyclomatic complexity of a source file
   */
  private calculateComplexity(sourceFile: ts.SourceFile): number {
    let complexity = 1; // Base complexity
    
    const visit = (node: ts.Node) => {
      // Increment complexity for decision points
      if (ts.isIfStatement(node) ||
          ts.isWhileStatement(node) ||
          ts.isForStatement(node) ||
          ts.isForInStatement(node) ||
          ts.isForOfStatement(node) ||
          ts.isSwitchStatement(node) ||
          ts.isConditionalExpression(node) ||
          ts.isCatchClause(node)) {
        complexity++;
      }
      
      // Handle logical operators
      if (ts.isBinaryExpression(node)) {
        if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
            node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
          complexity++;
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return complexity;
  }

  /**
   * Finds duplicate patterns between two files
   */
  private async findDuplicatesBetweenFiles(file1: FileInfo, file2: FileInfo): Promise<DuplicatePattern[]> {
    const patterns: DuplicatePattern[] = [];
    
    try {
      const content1 = fs.readFileSync(path.join(this.rootPath, file1.path), 'utf-8');
      const content2 = fs.readFileSync(path.join(this.rootPath, file2.path), 'utf-8');
      
      // Simple line-based similarity detection
      const lines1 = content1.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const lines2 = content2.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Find common sequences of lines
      const commonSequences = this.findCommonSequences(lines1, lines2, 3); // Minimum 3 lines
      
      for (const sequence of commonSequences) {
        if (sequence.similarity >= this.config.duplicateSimilarityThreshold) {
          patterns.push({
            id: `dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            files: [file1.path, file2.path],
            content: sequence.content,
            locations: [
              {
                file: file1.path,
                startLine: sequence.startLine1,
                endLine: sequence.endLine1
              },
              {
                file: file2.path,
                startLine: sequence.startLine2,
                endLine: sequence.endLine2
              }
            ],
            similarity: sequence.similarity,
            consolidationSuggestion: this.generateConsolidationSuggestion(sequence.content, [file1.path, file2.path])
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to compare files ${file1.path} and ${file2.path}:`, error);
    }
    
    return patterns;
  }

  /**
   * Finds common sequences between two arrays of lines
   */
  private findCommonSequences(lines1: string[], lines2: string[], minLength: number): Array<{
    content: string;
    startLine1: number;
    endLine1: number;
    startLine2: number;
    endLine2: number;
    similarity: number;
  }> {
    const sequences: Array<{
      content: string;
      startLine1: number;
      endLine1: number;
      startLine2: number;
      endLine2: number;
      similarity: number;
    }> = [];
    
    for (let i = 0; i <= lines1.length - minLength; i++) {
      for (let j = 0; j <= lines2.length - minLength; j++) {
        let matchLength = 0;
        
        // Find the length of matching sequence
        while (i + matchLength < lines1.length && 
               j + matchLength < lines2.length && 
               this.linesAreSimilar(lines1[i + matchLength], lines2[j + matchLength])) {
          matchLength++;
        }
        
        if (matchLength >= minLength) {
          const content = lines1.slice(i, i + matchLength).join('\n');
          const similarity = this.calculateLineSimilarity(
            lines1.slice(i, i + matchLength),
            lines2.slice(j, j + matchLength)
          );
          
          sequences.push({
            content,
            startLine1: i + 1,
            endLine1: i + matchLength,
            startLine2: j + 1,
            endLine2: j + matchLength,
            similarity
          });
        }
      }
    }
    
    return sequences;
  }

  /**
   * Checks if two lines are similar enough to be considered duplicates
   */
  private linesAreSimilar(line1: string, line2: string): boolean {
    // Remove whitespace and compare
    const normalized1 = line1.replace(/\s+/g, ' ').trim();
    const normalized2 = line2.replace(/\s+/g, ' ').trim();
    
    if (normalized1 === normalized2) return true;
    
    // Calculate similarity ratio
    const similarity = this.calculateStringSimilarity(normalized1, normalized2);
    return similarity >= 0.8;
  }

  /**
   * Calculates similarity between two strings using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Calculates similarity between arrays of lines
   */
  private calculateLineSimilarity(lines1: string[], lines2: string[]): number {
    if (lines1.length !== lines2.length) return 0;
    
    let totalSimilarity = 0;
    for (let i = 0; i < lines1.length; i++) {
      totalSimilarity += this.calculateStringSimilarity(lines1[i], lines2[i]);
    }
    
    return totalSimilarity / lines1.length;
  }

  /**
   * Generates consolidation suggestion for duplicate code
   */
  private generateConsolidationSuggestion(content: string, files: string[]): ConsolidationSuggestion {
    // Analyze content to determine best consolidation approach
    const isFunction = content.includes('function') || content.includes('=>');
    const isClass = content.includes('class ');
    const isUtility = content.includes('export') && (isFunction || content.includes('const'));
    
    let approach: 'utility' | 'merge' | 'extract';
    let targetLocation: string;
    let suggestedName: string;
    
    if (isUtility || isFunction) {
      approach = 'utility';
      targetLocation = 'src/utils/';
      suggestedName = this.generateUtilityName(content);
    } else if (isClass) {
      approach = 'extract';
      targetLocation = path.dirname(files[0]);
      suggestedName = this.generateClassName(content);
    } else {
      approach = 'merge';
      targetLocation = this.findCommonDirectory(files);
      suggestedName = 'SharedImplementation';
    }
    
    const effort = content.length > 500 ? 'high' : content.length > 100 ? 'medium' : 'low';
    
    return {
      approach,
      targetLocation,
      suggestedName,
      effort
    };
  }

  /**
   * Generates a utility function name from code content
   */
  private generateUtilityName(content: string): string {
    // Extract function name if present
    const functionMatch = content.match(/(?:function\s+|const\s+)(\w+)/);
    if (functionMatch) {
      return functionMatch[1];
    }
    
    // Generate name based on content
    const words = content.match(/\b[a-zA-Z]+\b/g) || [];
    const meaningfulWords = words.filter((word: string) => 
      word.length > 3 && 
      !['const', 'function', 'return', 'export', 'some', 'utility', 'code'].includes(word.toLowerCase())
    );
    
    if (meaningfulWords.length > 0) {
      return meaningfulWords.slice(0, 2).map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('') + 'Util';
    }
    
    return 'SharedUtil';
  }

  /**
   * Generates a class name from code content
   */
  private generateClassName(content: string): string {
    const classMatch = content.match(/class\s+(\w+)/);
    if (classMatch) {
      return classMatch[1];
    }
    return 'SharedClass';
  }

  /**
   * Finds the common directory for a set of files
   */
  private findCommonDirectory(files: string[]): string {
    if (files.length === 0) return '';
    if (files.length === 1) return path.dirname(files[0]);
    
    const dirs = files.map(file => path.dirname(file).split(path.sep));
    const commonParts: string[] = [];
    
    for (let i = 0; i < dirs[0].length; i++) {
      const part = dirs[0][i];
      if (dirs.every(dir => dir[i] === part)) {
        commonParts.push(part);
      } else {
        break;
      }
    }
    
    return commonParts.join(path.sep) || '.';
  }

  /**
   * Removes duplicate patterns from the list
   */
  private deduplicatePatterns(patterns: DuplicatePattern[]): DuplicatePattern[] {
    const seen = new Set<string>();
    const unique: DuplicatePattern[] = [];
    
    for (const pattern of patterns) {
      const key = pattern.content.replace(/\s+/g, ' ').trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(pattern);
      }
    }
    
    return unique;
  }

  /**
   * Calculates potential lines of code savings from consolidation
   */
  private calculatePotentialSavings(patterns: DuplicatePattern[]): number {
    return patterns.reduce((total, pattern) => {
      const lines = pattern.content.split('\n').length;
      const instances = pattern.files.length;
      return total + (lines * (instances - 1)); // Save lines from all but one instance
    }, 0);
  }

  /**
   * Calculates complexity metrics for all files
   */
  private async calculateComplexityMetrics(files: FileInfo[]): Promise<ComplexityMetric[]> {
    const metrics: ComplexityMetric[] = [];
    
    for (const file of files) {
      try {
        const fullPath = path.join(this.rootPath, file.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const sourceFile = ts.createSourceFile(
          file.path,
          content,
          ts.ScriptTarget.Latest,
          true
        );
        
        const functionCount = this.countFunctions(sourceFile);
        const classCount = this.countClasses(sourceFile);
        const nestingDepth = this.calculateNestingDepth(sourceFile);
        
        let complexityRating: 'low' | 'medium' | 'high' | 'very-high';
        if (file.complexity < 5) complexityRating = 'low';
        else if (file.complexity < 10) complexityRating = 'medium';
        else if (file.complexity < 20) complexityRating = 'high';
        else complexityRating = 'very-high';
        
        metrics.push({
          file: file.path,
          cyclomaticComplexity: file.complexity,
          functionCount,
          classCount,
          nestingDepth,
          complexityRating
        });
      } catch (error) {
        console.warn(`Failed to calculate complexity for ${file.path}:`, error);
      }
    }
    
    return metrics;
  }

  /**
   * Counts functions in a source file
   */
  private countFunctions(sourceFile: ts.SourceFile): number {
    let count = 0;
    
    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
        count++;
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return count;
  }

  /**
   * Counts classes in a source file
   */
  private countClasses(sourceFile: ts.SourceFile): number {
    let count = 0;
    
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        count++;
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return count;
  }

  /**
   * Calculates maximum nesting depth in a source file
   */
  private calculateNestingDepth(sourceFile: ts.SourceFile): number {
    let maxDepth = 0;
    
    const visit = (node: ts.Node, depth: number = 0) => {
      maxDepth = Math.max(maxDepth, depth);
      
      if (ts.isBlock(node) || ts.isIfStatement(node) || ts.isWhileStatement(node) || 
          ts.isForStatement(node) || ts.isSwitchStatement(node)) {
        depth++;
      }
      
      ts.forEachChild(node, child => visit(child, depth));
    };
    
    visit(sourceFile);
    return maxDepth;
  }

  /**
   * Generates reorganization suggestions for overcrowded folders
   */
  private generateReorganizationSuggestions(overcrowdedFolders: FolderInfo[]): ReorganizationSuggestion[] {
    const suggestions: ReorganizationSuggestion[] = [];
    
    for (const folder of overcrowdedFolders) {
      // Group files by type or functionality
      const fileGroups = this.groupFilesByType(folder.files);
      
      if (fileGroups.size > 1) {
        const suggestedStructure = this.createSuggestedStructure(folder.path, fileGroups);
        
        suggestions.push({
          currentPath: folder.path,
          suggestedStructure,
          reason: `Folder contains ${folder.fileCount} files (limit: ${this.config.maxFilesPerFolder}). Group by functionality.`,
          effort: folder.fileCount > 20 ? 'high' : 'medium'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Groups files by their type or functionality
   */
  private groupFilesByType(files: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    
    for (const file of files) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      
      let groupKey = 'misc';
      
      // Group by common patterns
      if (baseName.includes('test') || baseName.includes('spec')) {
        groupKey = 'tests';
      } else if (baseName.includes('util') || baseName.includes('helper')) {
        groupKey = 'utilities';
      } else if (baseName.includes('component') || baseName.includes('Component')) {
        groupKey = 'components';
      } else if (baseName.includes('service') || baseName.includes('Service')) {
        groupKey = 'services';
      } else if (baseName.includes('type') || baseName.includes('interface')) {
        groupKey = 'types';
      } else if (ext === '.ts' || ext === '.tsx') {
        groupKey = 'typescript';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(file);
    }
    
    return groups;
  }

  /**
   * Creates suggested folder structure from file groups
   */
  private createSuggestedStructure(basePath: string, fileGroups: Map<string, string[]>): any {
    const subfolders: any[] = [];
    
    for (const [groupName, files] of fileGroups) {
      if (files.length > 1) {
        subfolders.push({
          name: groupName,
          files,
          subfolders: []
        });
      }
    }
    
    return {
      name: path.basename(basePath),
      files: [],
      subfolders
    };
  }

  /**
   * Analyzes folder depth
   */
  private analyzeDepth(folders: FolderInfo[]): DepthAnalysis {
    const depths = folders.map(folder => folder.path.split(path.sep).length);
    const maxDepth = Math.max(...depths);
    const averageDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const deepFolders = folders
      .filter(folder => folder.path.split(path.sep).length > 4)
      .map(folder => folder.path);
    
    return {
      maxDepth,
      averageDepth,
      deepFolders
    };
  }

  /**
   * Analyzes a file name for naming issues
   */
  private analyzeFileName(fileName: string, filePath: string): NamingIssue[] {
    const issues: NamingIssue[] = [];
    
    // Check for unclear names
    if (fileName.length < 3) {
      issues.push({
        file: filePath,
        issueType: 'unclear',
        currentName: fileName,
        suggestedName: this.generateClearerName(fileName, filePath),
        reason: 'File name is too short to be descriptive'
      });
    }
    
    // Check for excessive length
    if (fileName.length > 50) {
      issues.push({
        file: filePath,
        issueType: 'too-long',
        currentName: fileName,
        suggestedName: this.shortenFileName(fileName),
        reason: 'File name is excessively long'
      });
    }
    
    // Check for abbreviations
    if (this.hasAbbreviations(fileName)) {
      issues.push({
        file: filePath,
        issueType: 'abbreviation',
        currentName: fileName,
        suggestedName: this.expandAbbreviations(fileName),
        reason: 'File name contains unclear abbreviations'
      });
    }
    
    // Check for inconsistent casing
    if (this.hasInconsistentCasing(fileName)) {
      issues.push({
        file: filePath,
        issueType: 'inconsistent',
        currentName: fileName,
        suggestedName: this.fixCasing(fileName),
        reason: 'File name has inconsistent casing'
      });
    }
    
    return issues;
  }

  /**
   * Generates clearer name for unclear file names
   */
  private generateClearerName(fileName: string, filePath: string): string {
    const dir = path.dirname(filePath);
    const dirName = path.basename(dir);
    
    // Use directory context to generate better name
    if (dirName && dirName !== '.') {
      return `${dirName}${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;
    }
    
    return `${fileName}Module`;
  }

  /**
   * Shortens excessively long file names
   */
  private shortenFileName(fileName: string): string {
    // Remove common redundant words
    const redundantWords = ['Component', 'Service', 'Utility', 'Helper', 'Manager'];
    let shortened = fileName;
    
    for (const word of redundantWords) {
      shortened = shortened.replace(new RegExp(word, 'gi'), '');
    }
    
    // If still too long, take first 30 characters
    if (shortened.length > 30) {
      shortened = shortened.substring(0, 30);
    }
    
    return shortened || fileName.substring(0, 30);
  }

  /**
   * Checks if file name has abbreviations
   */
  private hasAbbreviations(fileName: string): boolean {
    const commonAbbreviations = ['btn', 'cfg', 'mgr', 'svc', 'comp', 'ctrl'];
    const lowerName = fileName.toLowerCase();
    
    return commonAbbreviations.some(abbr => {
      // Check for abbreviation as whole word or part of compound word
      // Exclude 'util' from this check since it's commonly used in full form
      const regex = new RegExp(`\\b${abbr}\\b|${abbr}_|_${abbr}|${abbr}[A-Z]`);
      return regex.test(lowerName);
    });
  }

  /**
   * Expands abbreviations in file names
   */
  private expandAbbreviations(fileName: string): string {
    const expansions: Record<string, string> = {
      'btn': 'Button',
      'cfg': 'Config',
      'mgr': 'Manager',
      'svc': 'Service',
      'util': 'Utility',
      'comp': 'Component',
      'ctrl': 'Controller'
    };
    
    let expanded = fileName;
    for (const [abbr, expansion] of Object.entries(expansions)) {
      expanded = expanded.replace(new RegExp(abbr, 'gi'), expansion);
    }
    
    return expanded;
  }

  /**
   * Checks for inconsistent casing
   */
  private hasInconsistentCasing(fileName: string): boolean {
    // Check if it's neither camelCase nor PascalCase nor kebab-case
    const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(fileName);
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(fileName);
    const isKebabCase = /^[a-z][a-z0-9-]*$/.test(fileName);
    
    return !isCamelCase && !isPascalCase && !isKebabCase;
  }

  /**
   * Fixes casing issues in file names
   */
  private fixCasing(fileName: string): string {
    // Convert to PascalCase for components, camelCase for others
    const words = fileName.split(/[-_\s]+/);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  }

  /**
   * Generates naming suggestions
   */
  private generateNamingSuggestions(fileName: string, filePath: string, issues: NamingIssue[]): NamingSuggestion[] {
    return issues.map(issue => ({
      currentName: fileName,
      suggestedName: issue.suggestedName,
      filePath,
      reason: issue.reason
    }));
  }

  /**
   * Analyzes naming patterns across all files
   */
  private analyzeNamingPatterns(files: FileInfo[]): NamingPatternAnalysis {
    const patterns: string[] = [];
    const inconsistencies: string[] = [];
    const suggestedConventions: string[] = [];
    
    // Analyze casing patterns
    const casingPatterns = this.analyzeCasingPatterns(files);
    patterns.push(...casingPatterns.patterns);
    inconsistencies.push(...casingPatterns.inconsistencies);
    
    // Analyze naming conventions by file type
    const conventionAnalysis = this.analyzeNamingConventions(files);
    suggestedConventions.push(...conventionAnalysis);
    
    return {
      patterns,
      inconsistencies,
      suggestedConventions
    };
  }

  /**
   * Analyzes casing patterns in file names
   */
  private analyzeCasingPatterns(files: FileInfo[]): { patterns: string[], inconsistencies: string[] } {
    const patterns: string[] = [];
    const inconsistencies: string[] = [];
    
    const casingCounts = {
      camelCase: 0,
      PascalCase: 0,
      kebabCase: 0,
      snake_case: 0,
      other: 0
    };
    
    for (const file of files) {
      const fileName = path.basename(file.path, path.extname(file.path));
      
      if (/^[a-z][a-zA-Z0-9]*$/.test(fileName)) {
        casingCounts.camelCase++;
      } else if (/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) {
        casingCounts.PascalCase++;
      } else if (/^[a-z][a-z0-9-]*$/.test(fileName)) {
        casingCounts.kebabCase++;
      } else if (/^[a-z][a-z0-9_]*$/.test(fileName)) {
        casingCounts.snake_case++;
      } else {
        casingCounts.other++;
      }
    }
    
    // Determine dominant pattern
    const dominantPattern = Object.entries(casingCounts)
      .reduce((a, b) => casingCounts[a[0] as keyof typeof casingCounts] > casingCounts[b[0] as keyof typeof casingCounts] ? a : b)[0];
    
    patterns.push(`Dominant casing: ${dominantPattern}`);
    
    // Identify inconsistencies
    const totalFiles = files.length;
    const dominantCount = casingCounts[dominantPattern as keyof typeof casingCounts];
    
    if (dominantCount / totalFiles < 0.8) {
      inconsistencies.push('Mixed casing patterns detected - consider standardizing');
    }
    
    return { patterns, inconsistencies };
  }

  /**
   * Analyzes naming conventions by file type
   */
  private analyzeNamingConventions(files: FileInfo[]): string[] {
    const suggestions: string[] = [];
    
    // Group files by extension
    const filesByType = new Map<string, FileInfo[]>();
    
    for (const file of files) {
      const ext = path.extname(file.path);
      if (!filesByType.has(ext)) {
        filesByType.set(ext, []);
      }
      filesByType.get(ext)!.push(file);
    }
    
    // Analyze each type
    for (const [ext, typeFiles] of filesByType) {
      if (ext === '.tsx' || ext === '.jsx') {
        suggestions.push('React components should use PascalCase naming');
      } else if (ext === '.ts' || ext === '.js') {
        suggestions.push('TypeScript/JavaScript files should use camelCase naming');
      }
    }
    
    return suggestions;
  }

  /**
   * Checks if a file should be excluded from analysis
   */
  private shouldExcludeFile(relativePath: string): boolean {
    return this.config.excludePatterns.some(pattern => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      const regex = new RegExp(regexPattern);
      return regex.test(relativePath);
    });
  }

  /**
   * Checks if a file is a target file for analysis
   */
  private isTargetFile(fileName: string): boolean {
    return this.config.includePatterns.some(pattern => {
      // Convert glob pattern to regex - patterns like **/*.ts should match file.ts
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      const regex = new RegExp(regexPattern);
      
      // Test both the filename and a path-like version
      return regex.test(fileName) || regex.test(`path/to/${fileName}`);
    });
  }
}

/**
 * Factory function to create a configured CodebaseAnalysisEngine
 */
export function createCodebaseAnalyzer(
  rootPath?: string, 
  config?: Partial<AnalysisConfig>
): CodeAnalyzer {
  return new CodebaseAnalysisEngine(rootPath, config);
}

/**
 * Default export for convenience
 */
export default CodebaseAnalysisEngine;