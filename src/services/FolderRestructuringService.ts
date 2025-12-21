import * as fs from 'fs';
import * as path from 'path';
import { ImportPathUpdater } from './ImportPathUpdater';
import { NamingConventionService } from './NamingConventionService';

export interface FileInfo {
  name: string;
  path: string;
  category: string;
  subcategory?: string;
}

export interface RestructuringPlan {
  services: {
    api: FileInfo[];
    businessLogic: FileInfo[];
    dataProcessing: FileInfo[];
    utilities: FileInfo[];
  };
  utils: {
    validation: FileInfo[];
    formatting: FileInfo[];
    dataProcessing: FileInfo[];
    performance: FileInfo[];
    shared: FileInfo[];
  };
}

export interface RestructuringResult {
  success: boolean;
  movedFiles: string[];
  createdFolders: string[];
  errors: string[];
}

export class FolderRestructuringService {
  private readonly FOLDER_LIMIT = 10;
  private readonly servicesPath = 'src/services';
  private readonly utilsPath = 'src/utils';
  private readonly importUpdater = new ImportPathUpdater();
  private readonly namingService = new NamingConventionService();

  /**
   * Analyzes naming conventions and suggests improvements
   */
  analyzeNamingConventions(): { services: any; utils: any } {
    const serviceFiles = this.getTypeScriptFiles(this.servicesPath)
      .map(file => path.join(this.servicesPath, file));
    const utilFiles = this.getTypeScriptFiles(this.utilsPath)
      .map(file => path.join(this.utilsPath, file));

    return {
      services: this.namingService.analyzeNaming(serviceFiles),
      utils: this.namingService.analyzeNaming(utilFiles)
    };
  }

  /**
   * Applies naming improvements to files during restructuring
   */
  private applyNamingImprovements(files: FileInfo[]): FileInfo[] {
    return files.map(file => {
      const improvedName = this.namingService.suggestImprovedName(file.path);
      if (improvedName !== path.basename(file.name, '.ts')) {
        return {
          ...file,
          name: improvedName + '.ts'
        };
      }
      return file;
    });
  }
  /**
   * Analyzes and categorizes services files
   */
  categorizeServices(files: string[]): RestructuringPlan['services'] {
    const categories = {
      api: [] as FileInfo[],
      businessLogic: [] as FileInfo[],
      dataProcessing: [] as FileInfo[],
      utilities: [] as FileInfo[]
    };

    files.forEach(file => {
      const fileName = path.basename(file, '.ts');
      const filePath = path.join(this.servicesPath, file);
      
      // Data processing services - transformation and analysis (check first for specificity)
      if (this.isDataProcessingService(fileName)) {
        categories.dataProcessing.push({
          name: file,
          path: filePath,
          category: 'data-processing'
        });
      }
      // API services - external integrations
      else if (this.isApiService(fileName)) {
        categories.api.push({
          name: file,
          path: filePath,
          category: 'api'
        });
      }
      // Business logic services - core domain logic
      else if (this.isBusinessLogicService(fileName)) {
        categories.businessLogic.push({
          name: file,
          path: filePath,
          category: 'business-logic'
        });
      }
      // Utility services - supporting functionality
      else {
        categories.utilities.push({
          name: file,
          path: filePath,
          category: 'utilities'
        });
      }
    });

    // Apply naming improvements to each category
    categories.api = this.applyNamingImprovements(categories.api);
    categories.businessLogic = this.applyNamingImprovements(categories.businessLogic);
    categories.dataProcessing = this.applyNamingImprovements(categories.dataProcessing);
    categories.utilities = this.applyNamingImprovements(categories.utilities);

    return categories;
  }

  /**
   * Analyzes and categorizes utils files
   */
  categorizeUtils(files: string[]): RestructuringPlan['utils'] {
    const categories = {
      validation: [] as FileInfo[],
      formatting: [] as FileInfo[],
      dataProcessing: [] as FileInfo[],
      performance: [] as FileInfo[],
      shared: [] as FileInfo[]
    };

    files.forEach(file => {
      const fileName = path.basename(file, '.ts');
      const filePath = path.join(this.utilsPath, file);
      
      // Validation utilities
      if (this.isValidationUtil(fileName)) {
        categories.validation.push({
          name: file,
          path: filePath,
          category: 'validation'
        });
      }
      // Formatting utilities
      else if (this.isFormattingUtil(fileName)) {
        categories.formatting.push({
          name: file,
          path: filePath,
          category: 'formatting'
        });
      }
      // Data processing utilities
      else if (this.isDataProcessingUtil(fileName)) {
        categories.dataProcessing.push({
          name: file,
          path: filePath,
          category: 'data-processing'
        });
      }
      // Performance utilities
      else if (this.isPerformanceUtil(fileName)) {
        categories.performance.push({
          name: file,
          path: filePath,
          category: 'performance'
        });
      }
      // Shared utilities
      else {
        categories.shared.push({
          name: file,
          path: filePath,
          category: 'shared'
        });
      }
    });

    // Apply naming improvements to each category
    categories.validation = this.applyNamingImprovements(categories.validation);
    categories.formatting = this.applyNamingImprovements(categories.formatting);
    categories.dataProcessing = this.applyNamingImprovements(categories.dataProcessing);
    categories.performance = this.applyNamingImprovements(categories.performance);
    categories.shared = this.applyNamingImprovements(categories.shared);

    return categories;
  }

  /**
   * Creates the restructuring plan for both services and utils
   */
  createRestructuringPlan(): RestructuringPlan {
    const serviceFiles = this.getTypeScriptFiles(this.servicesPath);
    const utilFiles = this.getTypeScriptFiles(this.utilsPath);

    return {
      services: this.categorizeServices(serviceFiles),
      utils: this.categorizeUtils(utilFiles)
    };
  }

  /**
   * Executes the restructuring plan
   */
  async executeRestructuring(plan: RestructuringPlan): Promise<RestructuringResult> {
    const result: RestructuringResult = {
      success: true,
      movedFiles: [],
      createdFolders: [],
      errors: []
    };

    try {
      // Restructure services
      this.restructureServices(plan.services, result);
      
      // Restructure utils
      this.restructureUtils(plan.utils, result);

      // Update import paths
      const importResult = await this.importUpdater.updateImportPaths(result.movedFiles);
      if (!importResult.success) {
        result.errors.push(...importResult.errors);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Restructuring failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Enforces folder limits by creating subfolders when needed
   */
  enforceFolderLimits(category: FileInfo[], basePath: string): string[] {
    const createdFolders: string[] = [];
    
    if (category.length > this.FOLDER_LIMIT) {
      // Create numbered subfolders
      const subfoldersNeeded = Math.ceil(category.length / this.FOLDER_LIMIT);
      
      for (let i = 0; i < subfoldersNeeded; i++) {
        const subfolderPath = path.join(basePath, `group-${i + 1}`);
        if (!fs.existsSync(subfolderPath)) {
          fs.mkdirSync(subfolderPath, { recursive: true });
          createdFolders.push(subfolderPath);
        }
        
        // Update file paths for this group
        const startIndex = i * this.FOLDER_LIMIT;
        const endIndex = Math.min(startIndex + this.FOLDER_LIMIT, category.length);
        
        for (let j = startIndex; j < endIndex; j++) {
          category[j].subcategory = `group-${i + 1}`;
        }
      }
    }
    
    return createdFolders;
  }

  private isApiService(fileName: string): boolean {
    const apiPatterns = [
      'tranzy', 'geocoding', 'agency'
    ];
    // More specific API patterns - exclude generic 'service' to avoid conflicts
    return apiPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    ) || (fileName.toLowerCase().includes('api') && !fileName.toLowerCase().includes('service'));
  }

  private isBusinessLogicService(fileName: string): boolean {
    const businessPatterns = [
      'route', 'station', 'vehicle', 'filter', 'selector', 'planning'
    ];
    return businessPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isDataProcessingService(fileName: string): boolean {
    const dataPatterns = [
      'transformation', 'analysis', 'analyzer', 'engine', 'consolidation',
      'validation', 'pipeline', 'processing', 'duplication'
    ];
    return dataPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isValidationUtil(fileName: string): boolean {
    const validationPatterns = [
      'validation', 'validator', 'propValidation'
    ];
    return validationPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isFormattingUtil(fileName: string): boolean {
    const formattingPatterns = [
      'format', 'time', 'date', 'string'
    ];
    return formattingPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isDataProcessingUtil(fileName: string): boolean {
    const dataPatterns = [
      'vehicle', 'data', 'factory', 'generator', 'guards', 'direction'
    ];
    return dataPatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isPerformanceUtil(fileName: string): boolean {
    const performancePatterns = [
      'performance', 'benchmark', 'cache', 'debounce', 'retry'
    ];
    return performancePatterns.some(pattern => 
      fileName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private getTypeScriptFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    return fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .filter(file => file !== 'index.ts'); // Exclude index files
  }

  private restructureServices(services: RestructuringPlan['services'], result: RestructuringResult): void {
    Object.entries(services).forEach(([categoryName, files]) => {
      if (files.length === 0) return;
      
      const categoryPath = path.join(this.servicesPath, categoryName);
      
      // Create category folder
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
        result.createdFolders.push(categoryPath);
      }
      
      // Enforce folder limits
      const subfolders = this.enforceFolderLimits(files, categoryPath);
      result.createdFolders.push(...subfolders);
      
      // Move files
      files.forEach(file => {
        const targetPath = file.subcategory 
          ? path.join(categoryPath, file.subcategory, file.name)
          : path.join(categoryPath, file.name);
          
        this.moveFile(file.path, targetPath, result);
      });
    });
  }

  private restructureUtils(utils: RestructuringPlan['utils'], result: RestructuringResult): void {
    Object.entries(utils).forEach(([categoryName, files]) => {
      if (files.length === 0) return;
      
      const categoryPath = path.join(this.utilsPath, categoryName);
      
      // Create category folder
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
        result.createdFolders.push(categoryPath);
      }
      
      // Enforce folder limits
      const subfolders = this.enforceFolderLimits(files, categoryPath);
      result.createdFolders.push(...subfolders);
      
      // Move files
      files.forEach(file => {
        const targetPath = file.subcategory 
          ? path.join(categoryPath, file.subcategory, file.name)
          : path.join(categoryPath, file.name);
          
        this.moveFile(file.path, targetPath, result);
      });
    });
  }

  private moveFile(sourcePath: string, targetPath: string, result: RestructuringResult): void {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(sourcePath, targetPath);
      result.movedFiles.push(`${sourcePath} -> ${targetPath}`);
      
      // Also move test file if it exists
      const testSourcePath = sourcePath.replace('.ts', '.test.ts');
      if (fs.existsSync(testSourcePath)) {
        const testTargetPath = targetPath.replace('.ts', '.test.ts');
        fs.renameSync(testSourcePath, testTargetPath);
        result.movedFiles.push(`${testSourcePath} -> ${testTargetPath}`);
      }
      
    } catch (error) {
      result.errors.push(`Failed to move ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const folderRestructuringService = new FolderRestructuringService();