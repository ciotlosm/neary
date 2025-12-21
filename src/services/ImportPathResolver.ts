/**
 * Import Path Resolution Service
 * Handles updating import paths when files are moved or renamed during refactoring
 */

import path from 'path';
import { ASTAnalysisService, type ImportInfo } from './ASTAnalysisService.js';
import { FileSystemOperations } from './FileSystemOperations.js';

export interface ImportUpdate {
  filePath: string;
  oldImport: string;
  newImport: string;
  line: number;
}

export interface PathMapping {
  oldPath: string;
  newPath: string;
}

export class ImportPathResolver {
  private astService: ASTAnalysisService;
  private fsOps: FileSystemOperations;

  constructor(private projectRoot: string = process.cwd()) {
    this.astService = new ASTAnalysisService(projectRoot);
    this.fsOps = new FileSystemOperations(projectRoot);
  }

  /**
   * Updates all import paths affected by file moves/renames
   */
  async updateImportPaths(pathMappings: PathMapping[]): Promise<ImportUpdate[]> {
    const updates: ImportUpdate[] = [];
    
    // Initialize AST service
    await this.astService.initializeProgram();
    
    // Find all TypeScript files that might need import updates
    const allFiles = await this.findAllTypeScriptFiles();
    
    for (const filePath of allFiles) {
      const fileUpdates = await this.updateImportsInFile(filePath, pathMappings);
      updates.push(...fileUpdates);
    }
    
    return updates;
  }

  /**
   * Updates imports in a specific file
   */
  async updateImportsInFile(filePath: string, pathMappings: PathMapping[]): Promise<ImportUpdate[]> {
    const updates: ImportUpdate[] = [];
    
    try {
      // Extract current imports
      const imports = await this.astService.extractImports(filePath);
      const fileContent = await this.fsOps.readFile(filePath);
      const lines = fileContent.split('\n');
      
      let hasChanges = false;
      
      for (const importInfo of imports) {
        const newImportPath = this.resolveNewImportPath(
          filePath, 
          importInfo.moduleName, 
          pathMappings
        );
        
        if (newImportPath && newImportPath !== importInfo.moduleName) {
          // Update the import line
          const lineIndex = importInfo.line - 1;
          const oldLine = lines[lineIndex];
          const newLine = oldLine.replace(
            `'${importInfo.moduleName}'`, 
            `'${newImportPath}'`
          ).replace(
            `"${importInfo.moduleName}"`, 
            `"${newImportPath}"`
          );
          
          lines[lineIndex] = newLine;
          hasChanges = true;
          
          updates.push({
            filePath,
            oldImport: importInfo.moduleName,
            newImport: newImportPath,
            line: importInfo.line
          });
        }
      }
      
      // Write updated file if there were changes
      if (hasChanges) {
        await this.fsOps.modifyFile(filePath, lines.join('\n'));
      }
      
    } catch (error) {
      console.warn(`Could not update imports in ${filePath}:`, error);
    }
    
    return updates;
  }

  /**
   * Resolves the new import path based on file movements
   */
  private resolveNewImportPath(
    importingFile: string, 
    currentImportPath: string, 
    pathMappings: PathMapping[]
  ): string | null {
    // Skip external modules (node_modules)
    if (!currentImportPath.startsWith('.')) {
      return null;
    }
    
    // Resolve the absolute path of the imported file
    const importingDir = path.dirname(importingFile);
    const absoluteImportPath = path.resolve(importingDir, currentImportPath);
    
    // Check if this file was moved
    const mapping = pathMappings.find(m => {
      const oldAbsolute = path.resolve(this.projectRoot, m.oldPath);
      return this.pathsMatch(absoluteImportPath, oldAbsolute);
    });
    
    if (mapping) {
      // Calculate new relative path
      const newAbsolute = path.resolve(this.projectRoot, mapping.newPath);
      let newRelative = path.relative(importingDir, newAbsolute);
      
      // Strip file extension for TypeScript imports
      const ext = path.extname(newRelative);
      if (ext === '.ts' || ext === '.tsx') {
        newRelative = newRelative.slice(0, -ext.length);
      }
      
      // Ensure relative path starts with ./ or ../
      if (!newRelative.startsWith('.')) {
        newRelative = './' + newRelative;
      }
      
      return newRelative;
    }
    
    // Check if the importing file itself was moved
    const importingFileMapping = pathMappings.find(m => {
      const oldAbsolute = path.resolve(this.projectRoot, m.oldPath);
      const importingAbsolute = path.resolve(this.projectRoot, importingFile);
      return this.pathsMatch(importingAbsolute, oldAbsolute);
    });
    
    if (importingFileMapping) {
      // Recalculate relative path from new location
      const newImportingDir = path.dirname(path.resolve(this.projectRoot, importingFileMapping.newPath));
      let newRelative = path.relative(newImportingDir, absoluteImportPath);
      
      // Strip file extension for TypeScript imports
      const ext = path.extname(newRelative);
      if (ext === '.ts' || ext === '.tsx') {
        newRelative = newRelative.slice(0, -ext.length);
      }
      
      if (!newRelative.startsWith('.')) {
        newRelative = './' + newRelative;
      }
      
      return newRelative;
    }
    
    return null;
  }

  /**
   * Checks if two paths match (handles extensions)
   */
  private pathsMatch(path1: string, path2: string): boolean {
    // Remove extensions for comparison
    const normalize = (p: string) => {
      const ext = path.extname(p);
      if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
        return p.slice(0, -ext.length);
      }
      return p;
    };
    
    return normalize(path1) === normalize(path2);
  }

  /**
   * Generates import path mappings for folder reorganization
   */
  async generateFolderReorganizationMappings(
    folderPath: string, 
    subfolderMappings: { [fileName: string]: string }
  ): Promise<PathMapping[]> {
    const mappings: PathMapping[] = [];
    
    // Get all files in the folder
    const files = await this.fsOps.listFiles(folderPath, false);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const fileName = path.basename(file);
        const subfolder = subfolderMappings[fileName];
        
        if (subfolder) {
          const oldPath = path.join(folderPath, file);
          const newPath = path.join(folderPath, subfolder, file);
          
          mappings.push({ oldPath, newPath });
        }
      }
    }
    
    return mappings;
  }

  /**
   * Generates import path mappings for file splitting
   */
  generateFileSplitMappings(
    originalFile: string, 
    splitFiles: { fileName: string; exports: string[] }[]
  ): PathMapping[] {
    const mappings: PathMapping[] = [];
    
    for (const split of splitFiles) {
      mappings.push({
        oldPath: originalFile,
        newPath: split.fileName
      });
    }
    
    return mappings;
  }

  /**
   * Updates barrel exports (index.ts files) after reorganization
   */
  async updateBarrelExports(
    indexFilePath: string, 
    pathMappings: PathMapping[]
  ): Promise<void> {
    try {
      const content = await this.fsOps.readFile(indexFilePath);
      const lines = content.split('\n');
      let hasChanges = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match export statements
        const exportMatch = line.match(/export\s*\*?\s*(?:{\s*[^}]*\s*})?\s*from\s*['"]([^'"]+)['"]/);
        if (exportMatch) {
          const importPath = exportMatch[1];
          
          // Resolve the current import to an absolute path
          const absoluteIndexPath = path.resolve(this.projectRoot, indexFilePath);
          const indexDir = path.dirname(absoluteIndexPath);
          const currentAbsolutePath = path.resolve(indexDir, importPath);
          
          // Find if this file was moved
          const mapping = pathMappings.find(m => {
            const oldAbsolute = path.resolve(this.projectRoot, m.oldPath);
            return this.pathsMatch(currentAbsolutePath, oldAbsolute);
          });
          
          if (mapping) {
            // Calculate new relative path from index file to new location
            const newAbsolute = path.resolve(this.projectRoot, mapping.newPath);
            let newRelative = path.relative(indexDir, newAbsolute);
            
            // Strip file extension for TypeScript imports
            const ext = path.extname(newRelative);
            if (ext === '.ts' || ext === '.tsx') {
              newRelative = newRelative.slice(0, -ext.length);
            }
            
            // Ensure relative path starts with ./ or ../
            if (!newRelative.startsWith('.')) {
              newRelative = './' + newRelative;
            }
            
            if (newRelative !== importPath) {
              lines[i] = line.replace(`'${importPath}'`, `'${newRelative}'`)
                            .replace(`"${importPath}"`, `"${newRelative}"`);
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        await this.fsOps.modifyFile(indexFilePath, lines.join('\n'));
      }
      
    } catch (error) {
      console.warn(`Could not update barrel exports in ${indexFilePath}:`, error);
    }
  }

  /**
   * Creates new barrel export files for reorganized folders
   */
  async createBarrelExports(
    folderPath: string, 
    subfolders: string[]
  ): Promise<void> {
    // Create main index.ts for the folder
    const mainIndexPath = path.join(folderPath, 'index.ts');
    const mainExports = subfolders.map(subfolder => 
      `export * from './${subfolder}';`
    ).join('\n');
    
    await this.fsOps.createFile(mainIndexPath, mainExports + '\n');
    
    // Create index.ts for each subfolder
    for (const subfolder of subfolders) {
      const subfolderPath = path.join(folderPath, subfolder);
      const indexPath = path.join(subfolderPath, 'index.ts');
      
      // Get all TypeScript files in the subfolder
      const files = await this.fsOps.listFiles(subfolderPath, false);
      const tsFiles = files.filter(f => f.endsWith('.ts') && f !== 'index.ts');
      
      const exports = tsFiles.map(file => {
        const baseName = path.basename(file, path.extname(file));
        return `export * from './${baseName}';`;
      }).join('\n');
      
      if (exports) {
        await this.fsOps.createFile(indexPath, exports + '\n');
      }
    }
  }

  /**
   * Validates that all imports are still resolvable after changes
   */
  async validateImports(filePaths: string[]): Promise<{ file: string; errors: string[] }[]> {
    const results: { file: string; errors: string[] }[] = [];
    
    for (const filePath of filePaths) {
      const errors: string[] = [];
      
      try {
        // Ensure we have the absolute path for AST analysis
        const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(this.projectRoot, filePath);
        const imports = await this.astService.extractImports(absoluteFilePath);
        
        for (const importInfo of imports) {
          if (importInfo.moduleName.startsWith('.')) {
            // Check if relative import exists
            const importingDir = path.dirname(absoluteFilePath);
            const importedPath = path.resolve(importingDir, importInfo.moduleName);
            
            // Try common extensions and index files
            const possiblePaths = [
              importedPath + '.ts',
              importedPath + '.tsx',
              importedPath + '.js',
              importedPath + '.jsx',
              path.join(importedPath, 'index.ts'),
              path.join(importedPath, 'index.tsx'),
              path.join(importedPath, 'index.js'),
              path.join(importedPath, 'index.jsx')
            ];
            
            // Convert to relative paths from project root for fileExists check
            const relativePaths = possiblePaths.map(p => path.relative(this.projectRoot, p));
            
            const existsChecks = await Promise.all(
              relativePaths.map(p => this.fsOps.fileExists(p))
            );
            
            if (!existsChecks.some(Boolean)) {
              errors.push(`Cannot resolve import '${importInfo.moduleName}' at line ${importInfo.line}`);
            }
          }
        }
        
        if (errors.length > 0) {
          results.push({ file: filePath, errors });
        }
        
      } catch (error) {
        results.push({ 
          file: filePath, 
          errors: [`Failed to analyze imports: ${error}`] 
        });
      }
    }
    
    return results;
  }

  /**
   * Finds all TypeScript files in the project
   */
  private async findAllTypeScriptFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (dir: string) => {
      try {
        const entries = await this.fsOps.listFiles(dir, true);
        
        for (const entry of entries) {
          if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
            files.push(path.join(dir, entry));
          }
        }
      } catch (error) {
        // Ignore directories we can't read
      }
    };
    
    await scanDirectory(this.projectRoot);
    return files;
  }
}

export default ImportPathResolver;