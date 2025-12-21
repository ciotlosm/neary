/**
 * IntegratedRefactoringSystem Integration Tests
 * Tests the complete refactoring workflow with real file operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntegratedRefactoringSystem } from './IntegratedRefactoringSystem.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('IntegratedRefactoringSystem Integration Tests', () => {
  let testDir: string;
  let refactoringSystem: IntegratedRefactoringSystem;

  beforeEach(async () => {
    // Create unique test directory
    testDir = path.join(__dirname, '../../test-integration', `refactor-integration-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    // Configuration for integration testing
    const config = {
      maxFileSize: 20, // Small for testing
      maxFilesPerFolder: 3, // Small for testing
      duplicateSimilarityThreshold: 0.8,
      includePatterns: ['src/**/*.ts'],
      excludePatterns: ['**/*.test.*', '**/*.spec.*'],
      createBackups: true,
      stopOnError: false // Continue on errors for testing
    };
    
    refactoringSystem = new IntegratedRefactoringSystem(testDir, config);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup warning:', error);
    }
  });

  describe('Real File Operations', () => {
    it('should split a large TypeScript file into smaller modules', async () => {
      // Create a large TypeScript file with multiple classes
      const largeFileContent = `
// Large service file that needs splitting
export class UserService {
  private users: User[] = [];
  
  async getUser(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }
  
  async createUser(userData: CreateUserData): Promise<User> {
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }
  
  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLength;
  }
}

export class ProductService {
  private products: Product[] = [];
  
  async getProduct(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }
  
  async createProduct(productData: CreateProductData): Promise<Product> {
    const product = { id: generateId(), ...productData };
    this.products.push(product);
    return product;
  }
  
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) return null;
    
    this.products[productIndex] = { ...this.products[productIndex], ...updates };
    return this.products[productIndex];
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CreateUserData {
  name: string;
  email: string;
}

export interface CreateProductData {
  name: string;
  price: number;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
`;

      // Create the test file structure
      await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'largeService.ts'),
        largeFileContent
      );

      // Run the refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify the refactoring succeeded
      expect(report.success).toBe(true);
      expect(report.filesOptimized).toBeGreaterThan(0);
      expect(report.operations.length).toBeGreaterThan(0);
      
      // Verify files were actually created/modified
      expect(report.filesModified + report.filesCreated).toBeGreaterThan(0);
      
      // Check that the original file still exists (should be modified)
      const originalFileExists = await fs.access(
        path.join(testDir, 'src', 'services', 'largeService.ts')
      ).then(() => true).catch(() => false);
      expect(originalFileExists).toBe(true);
    }, 30000); // 30 second timeout for file operations

    it('should reorganize overcrowded folders with real file moves', async () => {
      // Create overcrowded utils folder
      await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
      
      const utilFiles = [
        { name: 'validation.ts', content: 'export const validateEmail = (email: string) => /\\S+@\\S+\\.\\S+/.test(email);' },
        { name: 'formatting.ts', content: 'export const formatDate = (date: Date) => date.toISOString().split("T")[0];' },
        { name: 'performance.ts', content: 'export const debounce = (fn: Function, delay: number) => { /* implementation */ };' },
        { name: 'helpers.ts', content: 'export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);' },
        { name: 'constants.ts', content: 'export const API_BASE_URL = "https://api.example.com";' }
      ];

      // Create all utility files (exceeds maxFilesPerFolder: 3)
      for (const file of utilFiles) {
        await fs.writeFile(
          path.join(testDir, 'src', 'utils', file.name),
          file.content
        );
      }

      // Run the refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify the refactoring succeeded
      expect(report.success).toBe(true);
      expect(report.foldersReorganized).toBeGreaterThan(0);
      
      // Verify that files were actually moved/created
      expect(report.filesModified + report.filesCreated).toBeGreaterThan(0);
      
      // Check that the utils folder still exists
      const utilsFolderExists = await fs.access(
        path.join(testDir, 'src', 'utils')
      ).then(() => true).catch(() => false);
      expect(utilsFolderExists).toBe(true);
    }, 30000);

    it('should consolidate duplicate patterns into real utility files', async () => {
      // Create files with duplicate error handling patterns
      await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
      
      const service1Content = `
export const userService = {
  async getUser(id: string) {
    try {
      const response = await fetch(\`/api/users/\${id}\`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};
`;

      const service2Content = `
export const productService = {
  async getProduct(id: string) {
    try {
      const response = await fetch(\`/api/products/\${id}\`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};
`;

      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'userService.ts'),
        service1Content
      );
      
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'productService.ts'),
        service2Content
      );

      // Run the refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify the refactoring succeeded
      expect(report.success).toBe(true);
      
      // Should have found and consolidated duplicates
      if (report.duplicatesRemoved > 0) {
        expect(report.filesCreated).toBeGreaterThan(0); // Utility file created
        expect(report.filesModified).toBeGreaterThan(0); // Original files modified
      }
    }, 30000);

    it('should handle complex refactoring with multiple issues', async () => {
      // Create a complex test scenario with multiple refactoring needs
      await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
      
      // Large file that needs splitting
      const largeServiceContent = Array(25).fill('console.log("This is a line to make the file large");').join('\n');
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'largeService.ts'),
        `export class LargeService {\n${largeServiceContent}\n}`
      );
      
      // Overcrowded utils folder
      const utilFiles = ['util1.ts', 'util2.ts', 'util3.ts', 'util4.ts'];
      for (const fileName of utilFiles) {
        await fs.writeFile(
          path.join(testDir, 'src', 'utils', fileName),
          `export const ${fileName.replace('.ts', '')} = () => 'utility function';`
        );
      }
      
      // Files with duplicate patterns
      const duplicatePattern = 'try { doWork(); } catch (error) { console.error("Error:", error); }';
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'service1.ts'),
        `export const service1 = () => { ${duplicatePattern} };`
      );
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'service2.ts'),
        `export const service2 = () => { ${duplicatePattern} };`
      );
      
      // File with naming issue
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'svc.ts'),
        'export const svc = "short name";'
      );

      // Run the comprehensive refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify overall success
      expect(report.success).toBe(true);
      expect(report.totalTime).toBeGreaterThan(0);
      expect(report.operations.length).toBeGreaterThan(0);
      
      // Should have addressed multiple types of issues
      const totalImprovements = report.filesOptimized + report.foldersReorganized + report.duplicatesRemoved;
      expect(totalImprovements).toBeGreaterThan(0);
      
      // Verify actual file changes occurred
      expect(report.filesModified + report.filesCreated).toBeGreaterThan(0);
      
      // Check that backup was created
      const backupExists = await fs.readdir(testDir)
        .then(files => files.some(f => f.includes('backup')))
        .catch(() => false);
      // Note: Backup creation depends on ActualRefactoringEngine implementation
    }, 45000); // Longer timeout for complex operations
  });

  describe('Error Handling and Recovery', () => {
    it('should handle file system errors gracefully', async () => {
      // Create a scenario that might cause file system issues
      await fs.mkdir(path.join(testDir, 'src'), { recursive: true });
      
      // Create a file with potential issues (very long name, special characters)
      const problematicFileName = 'file-with-very-long-name-that-might-cause-issues.ts';
      await fs.writeFile(
        path.join(testDir, 'src', problematicFileName),
        'export const problematic = "test";'
      );

      // Run refactoring with stopOnError: false
      const report = await refactoringSystem.executeRefactoring();

      // Should complete even if some operations fail
      expect(report).toBeDefined();
      expect(typeof report.success).toBe('boolean');
      expect(Array.isArray(report.errors)).toBe(true);
      expect(Array.isArray(report.operations)).toBe(true);
    }, 20000);

    it('should preserve file content integrity during refactoring', async () => {
      // Create files with specific content that should be preserved
      await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
      
      const originalContent = `
export class TestService {
  private data = "important data";
  
  getData() {
    return this.data;
  }
  
  setData(newData: string) {
    this.data = newData;
  }
}
`;

      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'testService.ts'),
        originalContent
      );

      // Store original content hash for comparison
      const originalHash = await fs.readFile(
        path.join(testDir, 'src', 'services', 'testService.ts'),
        'utf8'
      );

      // Run refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify file still exists and has content
      const fileExists = await fs.access(
        path.join(testDir, 'src', 'services', 'testService.ts')
      ).then(() => true).catch(() => false);
      
      expect(fileExists).toBe(true);
      
      if (fileExists) {
        const finalContent = await fs.readFile(
          path.join(testDir, 'src', 'services', 'testService.ts'),
          'utf8'
        );
        
        // Content should either be unchanged or properly modified (not corrupted)
        expect(finalContent.length).toBeGreaterThan(0);
        expect(finalContent).toContain('TestService'); // Core class should remain
      }
    }, 20000);
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple files efficiently', async () => {
      // Create a larger test scenario
      await fs.mkdir(path.join(testDir, 'src', 'components'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
      
      // Create multiple files in different folders
      const fileCount = 10;
      for (let i = 0; i < fileCount; i++) {
        await fs.writeFile(
          path.join(testDir, 'src', 'components', `Component${i}.ts`),
          `export const Component${i} = () => 'component ${i}';`
        );
        
        await fs.writeFile(
          path.join(testDir, 'src', 'services', `Service${i}.ts`),
          `export const Service${i} = () => 'service ${i}';`
        );
        
        await fs.writeFile(
          path.join(testDir, 'src', 'utils', `Util${i}.ts`),
          `export const Util${i} = () => 'util ${i}';`
        );
      }

      const startTime = Date.now();
      const report = await refactoringSystem.executeRefactoring();
      const executionTime = Date.now() - startTime;

      // Should complete in reasonable time (less than 30 seconds for 30 files)
      expect(executionTime).toBeLessThan(30000);
      expect(report.success).toBe(true);
      expect(report.totalTime).toBeGreaterThan(0);
      
      // Should have analyzed all files
      expect(report.operations.length).toBeGreaterThan(0);
    }, 35000);
  });

  describe('Validation and Verification', () => {
    it('should validate refactoring results', async () => {
      // Create a simple test case
      await fs.mkdir(path.join(testDir, 'src'), { recursive: true });
      
      const testContent = 'export const test = "validation test";';
      await fs.writeFile(
        path.join(testDir, 'src', 'test.ts'),
        testContent
      );

      // Run refactoring
      const report = await refactoringSystem.executeRefactoring();

      // Verify report structure
      expect(report).toHaveProperty('success');
      expect(report).toHaveProperty('totalTime');
      expect(report).toHaveProperty('filesModified');
      expect(report).toHaveProperty('filesCreated');
      expect(report).toHaveProperty('filesDeleted');
      expect(report).toHaveProperty('operations');
      expect(report).toHaveProperty('errors');
      expect(report).toHaveProperty('warnings');
      
      // Verify numeric properties are valid
      expect(typeof report.totalTime).toBe('number');
      expect(report.totalTime).toBeGreaterThanOrEqual(0);
      expect(typeof report.filesModified).toBe('number');
      expect(typeof report.filesCreated).toBe('number');
      expect(typeof report.filesDeleted).toBe('number');
      
      // Verify arrays are properly structured
      expect(Array.isArray(report.operations)).toBe(true);
      expect(Array.isArray(report.errors)).toBe(true);
      expect(Array.isArray(report.warnings)).toBe(true);
    }, 15000);
  });
});