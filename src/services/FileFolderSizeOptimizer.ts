/**
 * File and Folder Size Optimizer
 * Implements file splitting logic, folder reorganization, size limit enforcement,
 * and automatic import path updating during moves
 * Validates Requirements: 2.2, 2.4, 3.2, 3.4, 3.5
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import type {
  FileInfo,
  FolderInfo,
  RefactoringOperation,
  RefactoringPlan,
  OperationParameters,
  CodeSelection,
  ReorganizationSuggestion,
  FolderStructure,
  AnalysisConfig
} from '../types/architectureSimplification';
import { DEFAULT_ANALYSIS_CONFIG } from '../types/architectureSimplification';

/**
 * Split point information for file splitting
 */
export interface SplitPoint {
  /** Starting line number */
  startLine: number;
  /** Ending line number */
  endLine: number;
  /** Target file path for this split */
  targetFile: string;
  /** Description of what's being split */
  description: string;
  /** Type of code being split */
  type: 'function' | 'class' | 'interface' | 'type' | 'constant' | 'export';
  /** Name of the symbol being split */
  symbolName: string;
  /** Dependencies this split requires */
  dependencies: string[];
  /** Exports this split provides */
  exports: string[];
}

/**
 * Import update information
 */
export interface ImportUpdate {
  /** File that needs import updates */
  file: string;
  /** Old import path */
  oldPath: string;
  /** New import path */
  newPath: string;
  /** Imported symbols */
  symbols: string[];
}

/**
 * File and Folder Size Optimizer implementation
 */
export class FileFolderSizeOptimizer {
  private rootPath: string;
  private config: AnalysisConfig;

  constructor(rootPath: string = process.cwd(), config: Partial<AnalysisConfig> = {}) {
    this.rootPath = rootPath;
    this.config = { ...DEFAULT_ANALYSIS_CONFIG, ...config };
  }

  /**
   * Creates file splitting logic based on logical boundaries
   * Implements Requirements: 2.2, 2.4
   */
  async createFileSplitPlan(file: FileInfo): Promise<RefactoringOperation> {
    const splitPoints = await this.analyzeSplitPoints(file);
    const importUpdates = await this.calculateImportUpdates(file, splitPoints);
    
    const operationId = `split_${file.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    return {
      id: operationId,
      type: 'split',
      affectedFiles: [file.path, ...importUpdates.map(u => u.file)],
      parameters: {
        sourceFiles: [file.path],
        targetFiles: splitPoints.map(point => point.targetFile),
        config: {
          splitPoints,
          importUpdates,
          preserveExports: true,
          updateImports: true
        }
      },
      dependencies: [],
      riskLevel: this.assessSplitRisk(file, splitPoints),
      estimatedTime: this.estimateSplitTime(file, splitPoints)
    };
  }

  /**
   * Builds folder reorganization system with intelligent grouping
   * Implements Requirements: 3.2, 3.4, 3.5
   */
  async createFolderReorganizationPlan(folder: FolderInfo): Promise<RefactoringOperation> {
    const reorganizationSuggestion = await this.generateIntelligentGrouping(folder);
    const affectedFiles = await this.getFilesInFolder(folder.path);
    const importUpdates = await this.calculateFolderImportUpdates(folder, reorganizationSuggestion);
    
    const operationId = `reorganize_${folder.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    return {
      id: operationId,
      type: 'move',
      affectedFiles: [...affectedFiles, ...importUpdates.map(u => u.file)],
      parameters: {
        sourceFiles: affectedFiles,
        config: {
          reorganizationPlan: reorganizationSuggestion,
          importUpdates,
          updateImports: true,
          preserveStructure: false
        }
      },
      dependencies: [],
      riskLevel: this.assessReorganizationRisk(folder, reorganizationSuggestion),
      estimatedTime: this.estimateReorganizationTime(folder, affectedFiles)
    };
  }

  /**
   * Implements size limit enforcement for files and folders
   * Implements Requirements: 2.4, 3.4
   */
  async enforceSizeLimits(files: FileInfo[], folders: FolderInfo[]): Promise<RefactoringPlan> {
    const operations: RefactoringOperation[] = [];
    
    // Handle oversized files
    const oversizedFiles = files.filter(file => file.lineCount > this.config.maxFileSize);
    for (const file of oversizedFiles) {
      const splitOp = await this.createFileSplitPlan(file);
      operations.push(splitOp);
    }
    
    // Handle overcrowded folders
    const overcrowdedFolders = folders.filter(folder => folder.fileCount > this.config.maxFilesPerFolder);
    for (const folder of overcrowdedFolders) {
      const reorganizeOp = await this.createFolderReorganizationPlan(folder);
      operations.push(reorganizeOp);
    }
    
    // Calculate execution order and dependencies
    const dependencies = this.calculateOperationDependencies(operations);
    const executionOrder = this.calculateExecutionOrder(operations, dependencies);
    
    return {
      operations,
      dependencies,
      executionOrder,
      rollbackPlan: operations.map(op => this.createRollbackOperation(op)),
      impact: this.assessSizeLimitImpact(operations, oversizedFiles, overcrowdedFolders),
      timestamp: new Date()
    };
  }

  /**
   * Adds automatic import path updating during moves
   * Implements Requirements: 3.5
   */
  async updateImportPaths(importUpdates: ImportUpdate[]): Promise<void> {
    for (const update of importUpdates) {
      await this.updateFileImports(update);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Analyzes a file to determine optimal split points based on logical boundaries
   */
  private async analyzeSplitPoints(file: FileInfo): Promise<SplitPoint[]> {
    const splitPoints: SplitPoint[] = [];
    
    try {
      const fullPath = path.join(this.rootPath, file.path);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Simple line-based analysis for functions and classes
      const lines = content.split('\n');
      const baseName = path.basename(file.path, path.extname(file.path));
      const baseDir = path.dirname(file.path);
      
      let currentLine = 0;
      let inFunction = false;
      let inClass = false;
      let functionStart = 0;
      let classStart = 0;
      let functionName = '';
      let className = '';
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        currentLine = i + 1;
        
        // Count braces to track scope
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // Detect function declarations
        const functionMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/);
        if (functionMatch && !inFunction && !inClass) {
          inFunction = true;
          functionStart = currentLine;
          functionName = functionMatch[1] || functionMatch[2];
        }
        
        // Detect class declarations
        const classMatch = line.match(/(?:export\s+)?class\s+(\w+)/);
        if (classMatch && !inClass) {
          inClass = true;
          classStart = currentLine;
          className = classMatch[1];
        }
        
        // End of function (when braces balance and we're in a function)
        if (inFunction && braceCount === 0 && line.includes('}')) {
          const functionLength = currentLine - functionStart + 1;
          if (functionLength > 20) { // Functions over 20 lines
            splitPoints.push({
              startLine: functionStart,
              endLine: currentLine,
              targetFile: path.join(baseDir, `${baseName}.${functionName}.ts`),
              description: `Extract function ${functionName}`,
              type: 'function',
              symbolName: functionName,
              dependencies: [],
              exports: [functionName]
            });
          }
          inFunction = false;
        }
        
        // End of class (when braces balance and we're in a class)
        if (inClass && braceCount === 0 && line.includes('}')) {
          const classLength = currentLine - classStart + 1;
          if (classLength > 30) { // Classes over 30 lines
            splitPoints.push({
              startLine: classStart,
              endLine: currentLine,
              targetFile: path.join(baseDir, `${className}.ts`),
              description: `Extract class ${className}`,
              type: 'class',
              symbolName: className,
              dependencies: [],
              exports: [className]
            });
          }
          inClass = false;
        }
      }
      
    } catch (error) {
      console.warn(`Failed to analyze split points for ${file.path}:`, error);
    }
    
    return splitPoints;
  }

  /**
   * Extracts dependencies for a TypeScript node
   */
  private extractNodeDependencies(node: ts.Node, sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    const identifiers = new Set<string>();
    
    // Collect all identifiers used in the node
    const visit = (child: ts.Node) => {
      if (ts.isIdentifier(child)) {
        identifiers.add(child.text);
      }
      ts.forEachChild(child, visit);
    };
    
    visit(node);
    
    // Find imports that provide these identifiers
    const visit2 = (child: ts.Node) => {
      if (ts.isImportDeclaration(child) && child.moduleSpecifier && ts.isStringLiteral(child.moduleSpecifier)) {
        if (child.importClause?.namedBindings && ts.isNamedImports(child.importClause.namedBindings)) {
          for (const element of child.importClause.namedBindings.elements) {
            if (identifiers.has(element.name.text)) {
              dependencies.push(child.moduleSpecifier.text);
              break;
            }
          }
        }
      }
      ts.forEachChild(child, visit2);
    };
    
    visit2(sourceFile);
    
    return [...new Set(dependencies)];
  }

  /**
   * Calculates import updates needed after file splitting
   */
  private async calculateImportUpdates(file: FileInfo, splitPoints: SplitPoint[]): Promise<ImportUpdate[]> {
    const importUpdates: ImportUpdate[] = [];
    
    // Find all files that import from the file being split
    const allFiles = await this.scanAllFiles();
    const originalPath = file.path;
    
    for (const otherFile of allFiles) {
      if (otherFile.path === originalPath) continue;
      
      const imports = await this.getFileImports(otherFile.path);
      const relevantImport = imports.find(imp => this.resolvePath(imp.path, otherFile.path) === originalPath);
      
      if (relevantImport) {
        // Determine which symbols are moving to which files
        for (const splitPoint of splitPoints) {
          const movedSymbols = relevantImport.symbols.filter(symbol => 
            splitPoint.exports.includes(symbol)
          );
          
          if (movedSymbols.length > 0) {
            importUpdates.push({
              file: otherFile.path,
              oldPath: relevantImport.path,
              newPath: this.calculateRelativePath(otherFile.path, splitPoint.targetFile),
              symbols: movedSymbols
            });
          }
        }
      }
    }
    
    return importUpdates;
  }

  /**
   * Generates intelligent grouping for folder reorganization
   */
  private async generateIntelligentGrouping(folder: FolderInfo): Promise<ReorganizationSuggestion> {
    const files = await this.getDetailedFilesInFolder(folder.path);
    const groups = this.groupFilesByPurpose(files);
    
    const suggestedStructure: FolderStructure = {
      name: path.basename(folder.path),
      files: [],
      subfolders: []
    };
    
    // Create subfolders for each group
    for (const [groupName, groupFiles] of groups) {
      if (groupFiles.length > 1) {
        suggestedStructure.subfolders.push({
          name: groupName,
          files: groupFiles.map(f => path.basename(f.path)),
          subfolders: []
        });
      } else {
        // Single files stay in parent folder
        suggestedStructure.files.push(path.basename(groupFiles[0].path));
      }
    }
    
    // If no subfolders were created but we have files, put them all in the main folder
    if (suggestedStructure.subfolders.length === 0 && files.length > 0) {
      suggestedStructure.files = files.map(f => path.basename(f.path));
    }
    
    return {
      currentPath: folder.path,
      suggestedStructure,
      reason: `Folder contains ${folder.fileCount} files (limit: ${this.config.maxFilesPerFolder}). Group by functionality.`,
      effort: folder.fileCount > 20 ? 'high' : 'medium'
    };
  }

  /**
   * Groups files by their purpose/functionality
   */
  private groupFilesByPurpose(files: FileInfo[]): Map<string, FileInfo[]> {
    const groups = new Map<string, FileInfo[]>();
    
    for (const file of files) {
      const baseName = path.basename(file.path, path.extname(file.path));
      let groupKey = 'misc';
      
      // Group by common patterns
      if (baseName.includes('test') || baseName.includes('spec')) {
        groupKey = 'tests';
      } else if (baseName.includes('util') || baseName.includes('helper') || baseName.toLowerCase().includes('utils')) {
        groupKey = 'utilities';
      } else if (baseName.includes('component') || baseName.includes('Component') || baseName.endsWith('Component')) {
        groupKey = 'components';
      } else if (baseName.includes('service') || baseName.includes('Service') || baseName.endsWith('Service')) {
        groupKey = 'services';
      } else if (baseName.includes('type') || baseName.includes('interface') || baseName.includes('Type') || baseName.endsWith('types')) {
        groupKey = 'types';
      } else if (baseName.includes('hook') || baseName.includes('Hook') || baseName.startsWith('use')) {
        groupKey = 'hooks';
      } else if (baseName.includes('store') || baseName.includes('Store') || baseName.endsWith('Store')) {
        groupKey = 'stores';
      } else if (file.exports.some(exp => exp.includes('Component') || exp.includes('component'))) {
        groupKey = 'components';
      } else if (file.exports.some(exp => exp.includes('Service') || exp.includes('service'))) {
        groupKey = 'services';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(file);
    }
    
    return groups;
  }

  /**
   * Calculates import updates needed after folder reorganization
   */
  private async calculateFolderImportUpdates(
    folder: FolderInfo, 
    reorganization: ReorganizationSuggestion
  ): Promise<ImportUpdate[]> {
    const importUpdates: ImportUpdate[] = [];
    const allFiles = await this.scanAllFiles();
    
    // Map old paths to new paths based on reorganization
    const pathMapping = this.createPathMapping(folder, reorganization);
    
    for (const file of allFiles) {
      const imports = await this.getFileImports(file.path);
      
      for (const importInfo of imports) {
        const resolvedPath = this.resolvePath(importInfo.path, file.path);
        const newPath = pathMapping.get(resolvedPath);
        
        if (newPath && newPath !== resolvedPath) {
          importUpdates.push({
            file: file.path,
            oldPath: importInfo.path,
            newPath: this.calculateRelativePath(file.path, newPath),
            symbols: importInfo.symbols
          });
        }
      }
    }
    
    return importUpdates;
  }

  /**
   * Creates a mapping from old paths to new paths based on reorganization
   */
  private createPathMapping(
    folder: FolderInfo, 
    reorganization: ReorganizationSuggestion
  ): Map<string, string> {
    const mapping = new Map<string, string>();
    
    // Map files that stay in the main folder
    for (const fileName of reorganization.suggestedStructure.files) {
      const oldPath = path.join(folder.path, fileName);
      mapping.set(oldPath, oldPath); // No change
    }
    
    // Map files that move to subfolders
    for (const subfolder of reorganization.suggestedStructure.subfolders) {
      for (const fileName of subfolder.files) {
        const oldPath = path.join(folder.path, fileName);
        const newPath = path.join(folder.path, subfolder.name, fileName);
        mapping.set(oldPath, newPath);
      }
    }
    
    return mapping;
  }

  /**
   * Updates import statements in a file
   */
  private async updateFileImports(update: ImportUpdate): Promise<void> {
    try {
      const fullPath = path.join(this.rootPath, update.file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Simple string replacement for now - in production would use AST transformation
      const updatedContent = content.replace(
        new RegExp(`from\\s+['"]${this.escapeRegex(update.oldPath)}['"]`, 'g'),
        `from '${update.newPath}'`
      ).replace(
        new RegExp(`import\\s+['"]${this.escapeRegex(update.oldPath)}['"]`, 'g'),
        `import '${update.newPath}'`
      );
      
      if (updatedContent !== content) {
        fs.writeFileSync(fullPath, updatedContent, 'utf-8');
      }
    } catch (error) {
      console.warn(`Failed to update imports in ${update.file}:`, error);
    }
  }

  /**
   * Helper methods for path resolution and file operations
   */
  private async scanAllFiles(): Promise<FileInfo[]> {
    // Simplified implementation - would use existing CodebaseAnalysisEngine in production
    const files: FileInfo[] = [];
    
    const scanDirectory = (dirPath: string) => {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(this.rootPath, fullPath);
          
          if (this.shouldExcludeFile(relativePath)) continue;
          
          if (entry.isDirectory()) {
            scanDirectory(fullPath);
          } else if (entry.isFile() && this.isTargetFile(entry.name)) {
            const fileInfo = this.createBasicFileInfo(fullPath, relativePath);
            if (fileInfo) files.push(fileInfo);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    scanDirectory(this.rootPath);
    return files;
  }

  private createBasicFileInfo(fullPath: string, relativePath: string): FileInfo | null {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const stats = fs.statSync(fullPath);
      const lines = content.split('\n');
      
      return {
        path: relativePath,
        lineCount: lines.length,
        complexity: 1, // Simplified
        dependencies: [],
        exports: [],
        sizeBytes: stats.size,
        fileType: path.extname(fullPath).slice(1),
        lastModified: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }

  private async getFileImports(filePath: string): Promise<Array<{ path: string; symbols: string[] }>> {
    // Simplified implementation - would parse AST in production
    try {
      const fullPath = path.join(this.rootPath, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const imports: Array<{ path: string; symbols: string[] }> = [];
      
      // Simple regex-based import extraction
      const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const symbols = match[1] ? match[1].split(',').map(s => s.trim()) : [];
        imports.push({
          path: match[2],
          symbols
        });
      }
      
      return imports;
    } catch (error) {
      return [];
    }
  }

  private resolvePath(importPath: string, fromFile: string): string {
    if (importPath.startsWith('.')) {
      return path.resolve(path.dirname(fromFile), importPath);
    }
    return importPath;
  }

  private calculateRelativePath(fromFile: string, toFile: string): string {
    const fromDir = path.dirname(fromFile);
    const relativePath = path.relative(fromDir, toFile);
    
    // Ensure relative imports start with './'
    if (!relativePath.startsWith('.')) {
      return './' + relativePath;
    }
    
    return relativePath;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private shouldExcludeFile(relativePath: string): boolean {
    return this.config.excludePatterns.some(pattern => {
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      const regex = new RegExp(regexPattern);
      return regex.test(relativePath);
    });
  }

  private isTargetFile(fileName: string): boolean {
    return this.config.includePatterns.some(pattern => {
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      const regex = new RegExp(regexPattern);
      return regex.test(fileName) || regex.test(`path/to/${fileName}`);
    });
  }

  private async getFilesInFolder(folderPath: string): Promise<string[]> {
    try {
      const fullPath = path.join(this.rootPath, folderPath);
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      
      return entries
        .filter(entry => entry.isFile() && this.isTargetFile(entry.name))
        .map(entry => path.join(folderPath, entry.name));
    } catch (error) {
      console.warn(`Failed to read folder ${folderPath}:`, error);
      return [];
    }
  }

  private async getDetailedFilesInFolder(folderPath: string): Promise<FileInfo[]> {
    const fileNames = await this.getFilesInFolder(folderPath);
    const files: FileInfo[] = [];
    
    for (const fileName of fileNames) {
      const fullPath = path.join(this.rootPath, fileName);
      const fileInfo = this.createBasicFileInfo(fullPath, fileName);
      if (fileInfo) files.push(fileInfo);
    }
    
    return files;
  }

  // Risk and time estimation methods
  private assessSplitRisk(file: FileInfo, splitPoints: SplitPoint[]): 'low' | 'medium' | 'high' {
    if (splitPoints.length === 0) return 'low';
    if (splitPoints.length > 5 || file.complexity > 20) return 'high';
    if (splitPoints.length > 2 || file.complexity > 10) return 'medium';
    return 'low';
  }

  private estimateSplitTime(file: FileInfo, splitPoints: SplitPoint[]): number {
    const baseTime = 2000; // 2 seconds base
    const pointTime = splitPoints.length * 1000; // 1 second per split point
    const complexityTime = file.complexity * 100; // 100ms per complexity point
    return baseTime + pointTime + complexityTime;
  }

  private assessReorganizationRisk(folder: FolderInfo, suggestion: ReorganizationSuggestion): 'low' | 'medium' | 'high' {
    if (suggestion.effort === 'high') return 'high';
    if (folder.fileCount > 10) return 'medium'; // Changed from 15 to 10
    return 'low';
  }

  private estimateReorganizationTime(folder: FolderInfo, affectedFiles: string[]): number {
    return affectedFiles.length * 500; // 500ms per file
  }

  private calculateOperationDependencies(operations: RefactoringOperation[]): Record<string, string[]> {
    // Simple dependency calculation - split operations should run before reorganization
    const dependencies: Record<string, string[]> = {};
    
    const splitOps = operations.filter(op => op.type === 'split');
    const moveOps = operations.filter(op => op.type === 'move');
    
    // Move operations depend on split operations
    for (const moveOp of moveOps) {
      dependencies[moveOp.id] = splitOps.map(op => op.id);
    }
    
    return dependencies;
  }

  private calculateExecutionOrder(operations: RefactoringOperation[], dependencies: Record<string, string[]>): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    
    const visit = (operationId: string) => {
      if (visited.has(operationId)) return;
      
      const deps = dependencies[operationId] || [];
      for (const dep of deps) {
        visit(dep);
      }
      
      visited.add(operationId);
      order.push(operationId);
    };
    
    for (const operation of operations) {
      visit(operation.id);
    }
    
    return order;
  }

  private createRollbackOperation(operation: RefactoringOperation): any {
    return {
      operationId: operation.id,
      type: 'restore',
      filesToRestore: operation.affectedFiles,
      backupData: {
        originalContents: {},
        originalPaths: {},
        timestamp: new Date()
      }
    };
  }

  private assessSizeLimitImpact(
    operations: RefactoringOperation[], 
    oversizedFiles: FileInfo[], 
    overcrowdedFolders: FolderInfo[]
  ): any {
    const filesAffected = new Set<string>();
    operations.forEach(op => op.affectedFiles.forEach(file => filesAffected.add(file)));
    
    return {
      filesAffected: filesAffected.size,
      linesChanged: oversizedFiles.reduce((sum, file) => sum + file.lineCount, 0),
      riskLevel: operations.some(op => op.riskLevel === 'high') ? 'high' : 'medium',
      estimatedTime: operations.reduce((sum, op) => sum + op.estimatedTime, 0),
      benefits: [
        `Split ${oversizedFiles.length} oversized files`,
        `Reorganize ${overcrowdedFolders.length} overcrowded folders`,
        'Improve code maintainability and navigation',
        'Enforce consistent file and folder size limits'
      ],
      risks: [
        'Potential import path issues',
        'Risk of breaking existing dependencies',
        'Temporary build failures during refactoring'
      ]
    };
  }
}

/**
 * Factory function to create a configured FileFolderSizeOptimizer
 */
export function createFileFolderSizeOptimizer(
  rootPath?: string, 
  config?: Partial<AnalysisConfig>
): FileFolderSizeOptimizer {
  return new FileFolderSizeOptimizer(rootPath, config);
}

/**
 * Default export for convenience
 */
export default FileFolderSizeOptimizer;