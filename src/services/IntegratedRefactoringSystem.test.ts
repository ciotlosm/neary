/**
 * IntegratedRefactoringSystem Tests
 * Tests the complete refactoring workflow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IntegratedRefactoringSystem } from './IntegratedRefactoringSystem.js';
import { FileSystemOperations } from './FileSystemOperations.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('IntegratedRefactoringSystem', () => {
  let refactoringSystem: IntegratedRefactoringSystem;
  let fsOps: FileSystemOperations;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../test-temp', `refactor-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    const config = {
      maxFileSize: 50, // Low threshold for testing
      maxFilesPerFolder: 3, // Low threshold for testing
      duplicateSimilarityThreshold: 0.8,
      includePatterns: ['src/**/*.ts'],
      excludePatterns: ['**/*.test.*'],
      createBackups: true,
      stopOnError: false
    };
    
    refactoringSystem = new IntegratedRefactoringSystem(testDir, config);
    fsOps = new FileSystemOperations(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Codebase Analysis', () => {
    it('should analyze codebase and identify issues', async () => {
      // Create test files with various issues
      
      // Large file (over 50 lines)
      const largeFileContent = Array(60).fill('console.log("line");').join('\n');
      await fsOps.createFile('src/services/largeService.ts', largeFileContent);
      
      // Overcrowded folder (more than 3 files)
      await fsOps.createFile('src/utils/util1.ts', 'export const util1 = true;');
      await fsOps.createFile('src/utils/util2.ts', 'export const util2 = true;');
      await fsOps.createFile('src/utils/util3.ts', 'export const util3 = true;');
      await fsOps.createFile('src/utils/util4.ts', 'export const util4 = true;');
      
      // Files with duplicate patterns
      const errorHandlingCode = `
try {
  doSomething();
} catch (error) {
  console.error('Error:', error);
}
`;
      await fsOps.createFile('src/services/service1.ts', errorHandlingCode);
      await fsOps.createFile('src/services/service2.ts', errorHandlingCode);
      
      // File with naming issue
      await fsOps.createFile('src/services/svc.ts', 'export const svc = true;');

      const analysis = await refactoringSystem.analyzeCodebase();

      expect(analysis.totalFiles).toBeGreaterThan(0);
      expect(analysis.oversizedFiles.length).toBeGreaterThan(0);
      expect(analysis.overcrowdedFolders.length).toBeGreaterThan(0);
      expect(analysis.duplicatePatterns.length).toBeGreaterThan(0);
      expect(analysis.namingIssues.length).toBeGreaterThan(0);

      // Check specific issues
      const largeFile = analysis.oversizedFiles.find(f => f.path.includes('largeService'));
      expect(largeFile).toBeDefined();
      expect(largeFile?.lineCount).toBeGreaterThan(50);

      const overcrowdedFolder = analysis.overcrowdedFolders.find(f => f.path.includes('utils'));
      expect(overcrowdedFolder).toBeDefined();
      expect(overcrowdedFolder?.fileCount).toBeGreaterThan(3);

      const namingIssue = analysis.namingIssues.find(i => i.file.includes('svc.ts'));
      expect(namingIssue).toBeDefined();
    });

    it('should handle empty codebase', async () => {
      const analysis = await refactoringSystem.analyzeCodebase();

      expect(analysis.totalFiles).toBe(0);
      expect(analysis.oversizedFiles.length).toBe(0);
      expect(analysis.overcrowdedFolders.length).toBe(0);
      expect(analysis.duplicatePatterns.length).toBe(0);
      expect(analysis.namingIssues.length).toBe(0);
    });

    it('should respect include/exclude patterns', async () => {
      // Create files that should be included
      await fsOps.createFile('src/services/included.ts', 'export const included = true;');
      
      // Create files that should be excluded
      await fsOps.createFile('src/services/excluded.test.ts', 'export const test = true;');
      await fsOps.createFile('other/notIncluded.ts', 'export const other = true;');

      const analysis = await refactoringSystem.analyzeCodebase();

      expect(analysis.totalFiles).toBe(1); // Only the included file
    });
  });

  describe('File Splitting', () => {
    it('should split large files into smaller modules', async () => {
      // Create a large file with multiple classes
      const largeFileContent = `
export class UserService {
  getUser(id: string) {
    return { id, name: 'User' };
  }
  
  updateUser(id: string, data: any) {
    return { id, ...data };
  }
  
  deleteUser(id: string) {
    console.log('Deleting user:', id);
  }
}

export class ProductService {
  getProduct(id: string) {
    return { id, name: 'Product' };
  }
  
  updateProduct(id: string, data: any) {
    return { id, ...data };
  }
  
  deleteProduct(id: string) {
    console.log('Deleting product:', id);
  }
}

export interface UserInterface {
  id: string;
  name: string;
}

export interface ProductInterface {
  id: string;
  name: string;
  price: number;
}
`.repeat(3); // Make it large enough

      await fsOps.createFile('src/services/largeService.ts', largeFileContent);

      // Mock the ActualRefactoringEngine to return successful results
      const mockExecuteRefactoring = vi.fn().mockResolvedValue({
        success: true,
        completedOperations: [{ operationId: 'split-0', executionTime: 100, changes: ['Split file'] }],
        failedOperations: [],
        modifiedFiles: ['src/services/largeService.ts'],
        createdFiles: ['src/services/largeService.part1.ts', 'src/services/largeService.part2.ts'],
        deletedFiles: [],
        executionTime: 100,
        validation: {
          testResults: { success: true, passedTests: 0, failedTests: 0 },
          buildResults: { success: true, errors: [], warnings: [] },
          functionalityResults: { success: true, changes: [] }
        }
      });

      refactoringSystem.refactoringEngine.executeRefactoring = mockExecuteRefactoring;

      const report = await refactoringSystem.executeRefactoring();

      expect(report.success).toBe(true);
      expect(report.filesOptimized).toBeGreaterThan(0);
      expect(report.filesCreated).toBeGreaterThan(0);
    });
  });

  describe('Folder Reorganization', () => {
    it('should reorganize overcrowded folders', async () => {
      // Create overcrowded utils folder
      await fsOps.createFile('src/utils/validation.ts', 'export const validate = () => true;');
      await fsOps.createFile('src/utils/formatting.ts', 'export const format = () => "formatted";');
      await fsOps.createFile('src/utils/performance.ts', 'export const perf = () => 100;');
      await fsOps.createFile('src/utils/helper.ts', 'export const help = () => "help";');

      // Mock the ActualRefactoringEngine to return successful results
      const mockExecuteRefactoring = vi.fn().mockResolvedValue({
        success: true,
        completedOperations: [{ operationId: 'move-0', executionTime: 150, changes: ['Reorganized folder'] }],
        failedOperations: [],
        modifiedFiles: ['src/utils/validation.ts', 'src/utils/formatting.ts'],
        createdFiles: ['src/utils/validation/index.ts', 'src/utils/formatting/index.ts'],
        deletedFiles: [],
        executionTime: 150,
        validation: {
          testResults: { success: true, passedTests: 0, failedTests: 0 },
          buildResults: { success: true, errors: [], warnings: [] },
          functionalityResults: { success: true, changes: [] }
        }
      });

      refactoringSystem.refactoringEngine.executeRefactoring = mockExecuteRefactoring;

      const report = await refactoringSystem.executeRefactoring();

      expect(report.success).toBe(true);
      expect(report.foldersReorganized).toBeGreaterThan(0);
    });
  });

  describe('Duplicate Consolidation', () => {
    it('should consolidate duplicate patterns', async () => {
      // Create files with duplicate error handling
      const errorHandlingCode1 = `
export const service1 = () => {
  try {
    doSomething();
  } catch (error) {
    console.error('Error in service1:', error);
  }
};
`;

      const errorHandlingCode2 = `
export const service2 = () => {
  try {
    doSomethingElse();
  } catch (error) {
    console.error('Error in service2:', error);
  }
};
`;

      await fsOps.createFile('src/services/service1.ts', errorHandlingCode1);
      await fsOps.createFile('src/services/service2.ts', errorHandlingCode2);

      // Mock the ActualRefactoringEngine to return successful results
      const mockExecuteRefactoring = vi.fn().mockResolvedValue({
        success: true,
        completedOperations: [{ operationId: 'consolidate-0', executionTime: 80, changes: ['Consolidated duplicates'] }],
        failedOperations: [],
        modifiedFiles: ['src/services/service1.ts', 'src/services/service2.ts'],
        createdFiles: ['src/utils/shared/error-handling-patternUtility.ts'],
        deletedFiles: [],
        executionTime: 80,
        validation: {
          testResults: { success: true, passedTests: 0, failedTests: 0 },
          buildResults: { success: true, errors: [], warnings: [] },
          functionalityResults: { success: true, changes: [] }
        }
      });

      refactoringSystem.refactoringEngine.executeRefactoring = mockExecuteRefactoring;

      const report = await refactoringSystem.executeRefactoring();

      expect(report.success).toBe(true);
      expect(report.duplicatesRemoved).toBeGreaterThan(0);
    });
  });

  describe('Complete Refactoring Workflow', () => {
    it('should execute complete refactoring with multiple issues', async () => {
      // Create a complex codebase with multiple issues
      
      // Large file
      const largeContent = Array(60).fill('console.log("line");').join('\n');
      await fsOps.createFile('src/services/large.ts', largeContent);
      
      // Overcrowded folder
      await fsOps.createFile('src/utils/util1.ts', 'export const util1 = true;');
      await fsOps.createFile('src/utils/util2.ts', 'export const util2 = true;');
      await fsOps.createFile('src/utils/util3.ts', 'export const util3 = true;');
      await fsOps.createFile('src/utils/util4.ts', 'export const util4 = true;');
      
      // Duplicate patterns
      const duplicateCode = 'try { work(); } catch (error) { console.error(error); }';
      await fsOps.createFile('src/services/dup1.ts', duplicateCode);
      await fsOps.createFile('src/services/dup2.ts', duplicateCode);
      
      // Naming issue
      await fsOps.createFile('src/services/svc.ts', 'export const svc = true;');

      // Mock the ActualRefactoringEngine to return successful results for multiple operations
      const mockExecuteRefactoring = vi.fn().mockResolvedValue({
        success: true,
        completedOperations: [
          { operationId: 'split-0', executionTime: 100, changes: ['Split large file'] },
          { operationId: 'move-0', executionTime: 150, changes: ['Reorganized folder'] },
          { operationId: 'consolidate-0', executionTime: 80, changes: ['Consolidated duplicates'] },
          { operationId: 'rename-0', executionTime: 50, changes: ['Renamed file'] }
        ],
        failedOperations: [],
        modifiedFiles: ['src/services/large.ts', 'src/services/dup1.ts', 'src/services/dup2.ts'],
        createdFiles: ['src/services/large.part1.ts', 'src/utils/shared/duplicateUtility.ts'],
        deletedFiles: [],
        executionTime: 380,
        validation: {
          testResults: { success: true, passedTests: 0, failedTests: 0 },
          buildResults: { success: true, errors: [], warnings: [] },
          functionalityResults: { success: true, changes: [] }
        }
      });

      refactoringSystem.refactoringEngine.executeRefactoring = mockExecuteRefactoring;

      const report = await refactoringSystem.executeRefactoring();

      expect(report.success).toBe(true);
      expect(report.totalTime).toBeGreaterThan(0);
      expect(report.operations.length).toBeGreaterThan(0);
      
      // Should have addressed multiple types of issues
      expect(report.filesOptimized + report.foldersReorganized + report.duplicatesRemoved).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Create a file that might cause issues
      await fsOps.createFile('src/problematic.ts', 'export const problematic = "test";');
      
      // Mock a failure scenario by creating an invalid path mapping
      const originalConfig = {
        maxFileSize: 1, // Very low to trigger splitting
        maxFilesPerFolder: 1,
        duplicateSimilarityThreshold: 0.8,
        includePatterns: ['src/**/*.ts'],
        excludePatterns: [],
        createBackups: true,
        stopOnError: false // Continue on errors
      };
      
      const systemWithErrors = new IntegratedRefactoringSystem(testDir, originalConfig);
      const report = await systemWithErrors.executeRefactoring();

      // Should complete even with errors
      expect(report).toBeDefined();
      expect(typeof report.success).toBe('boolean');
      expect(Array.isArray(report.errors)).toBe(true);
      expect(Array.isArray(report.operations)).toBe(true);
    });
  });

  describe('Configuration Handling', () => {
    it('should respect configuration limits', async () => {
      const strictConfig = {
        maxFileSize: 10, // Very strict
        maxFilesPerFolder: 2, // Very strict
        duplicateSimilarityThreshold: 0.9,
        includePatterns: ['src/**/*.ts'],
        excludePatterns: ['**/*.test.*'],
        createBackups: true,
        stopOnError: true
      };

      const strictSystem = new IntegratedRefactoringSystem(testDir, strictConfig);

      // Create files that exceed limits - make sure they're in the right location
      const longContent = Array(15).fill('console.log("line");').join('\n');
      await fsOps.createDirectory('src');
      await fsOps.createFile('src/long.ts', longContent);
      
      // Create overcrowded folder - make sure it has more than 2 files
      await fsOps.createDirectory('src/folder');
      await fsOps.createFile('src/folder/file1.ts', 'export const f1 = 1;');
      await fsOps.createFile('src/folder/file2.ts', 'export const f2 = 2;');
      await fsOps.createFile('src/folder/file3.ts', 'export const f3 = 3;');

      const analysis = await strictSystem.analyzeCodebase();

      // With strict limits, should find issues
      expect(analysis.totalFiles).toBeGreaterThan(0);
      expect(analysis.oversizedFiles.length).toBeGreaterThan(0);
      expect(analysis.overcrowdedFolders.length).toBeGreaterThan(0);
      
      // Verify the specific issues found
      expect(analysis.oversizedFiles.some(f => f.path.includes('long.ts'))).toBe(true);
      expect(analysis.overcrowdedFolders.some(f => f.path.includes('folder'))).toBe(true);
    });
  });
});
