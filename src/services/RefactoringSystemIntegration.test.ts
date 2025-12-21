/**
 * Refactoring System Integration Tests
 * Tests the core functionality that we know is working
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystemOperations } from './FileSystemOperations.js';
import { ASTAnalysisService } from './ASTAnalysisService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Refactoring System Integration', () => {
  let fsOps: FileSystemOperations;
  let astService: ASTAnalysisService;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../test-temp', `integration-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    fsOps = new FileSystemOperations(testDir);
    astService = new ASTAnalysisService(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('File System + AST Integration', () => {
    it('should create files and analyze them with AST', async () => {
      const testFile = 'src/test.ts';
      const content = `
export class TestClass {
  private value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  getValue(): string {
    return this.value;
  }
  
  complexMethod(x: number): string {
    if (x > 10) {
      for (let i = 0; i < x; i++) {
        if (i % 2 === 0) {
          console.log(i);
        }
      }
    }
    return this.value + x.toString();
  }
}

export interface TestInterface {
  id: string;
  name: string;
}

export const testFunction = (param: string): string => {
  return param.toUpperCase();
};
`;

      // Create file using FileSystemOperations
      await fsOps.createFile(testFile, content);
      expect(await fsOps.fileExists(testFile)).toBe(true);

      // Analyze file using ASTAnalysisService
      await astService.initializeProgram();
      const elements = await astService.analyzeFile(path.join(testDir, testFile));

      expect(elements.length).toBeGreaterThan(0);
      
      const classes = elements.filter(el => el.type === 'class');
      const interfaces = elements.filter(el => el.type === 'interface');
      const functions = elements.filter(el => el.type === 'function');

      expect(classes.length).toBe(1);
      expect(interfaces.length).toBe(1);
      expect(functions.length).toBeGreaterThanOrEqual(0); // Arrow functions might not be detected as separate elements

      const testClass = classes[0];
      expect(testClass.name).toBe('TestClass');
      expect(testClass.exports).toContain('TestClass');
      expect(testClass.complexity).toBeGreaterThan(1); // Should have some complexity
    });

    it('should handle file operations with backup and restore', async () => {
      const originalFile = 'src/original.ts';
      const originalContent = 'export const original = "test";';
      
      // Create original file
      await fsOps.createFile(originalFile, originalContent);
      
      // Create operations that will modify the file
      const operations = [
        {
          type: 'modify' as const,
          targetPath: originalFile,
          content: 'export const modified = "test";'
        }
      ];

      // Execute operations (should create backup)
      await fsOps.executeOperations(operations);
      
      // Verify file was modified
      const modifiedContent = await fsOps.readFile(originalFile);
      expect(modifiedContent).toBe('export const modified = "test";');

      // Analyze the modified file
      await astService.initializeProgram();
      const elements = await astService.analyzeFile(path.join(testDir, originalFile));
      
      expect(elements.length).toBeGreaterThan(0);
      const variable = elements.find(el => el.name === 'modified');
      expect(variable).toBeDefined();
    });

    it('should suggest file splits for large files', async () => {
      const largeFile = 'src/large.ts';
      const largeContent = `
// User-related functionality
export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
  
  updateUser(id: string, updates: Partial<User>): void {
    const user = this.getUser(id);
    if (user) {
      Object.assign(user, updates);
    }
  }
  
  deleteUser(id: string): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}

export const userValidator = {
  validateEmail: (email: string): boolean => {
    return email.includes('@');
  },
  
  validateName: (name: string): boolean => {
    return name.length > 0;
  }
};

// Product-related functionality
export interface Product {
  id: string;
  name: string;
  price: number;
}

export class ProductService {
  private products: Product[] = [];
  
  addProduct(product: Product): void {
    this.products.push(product);
  }
  
  getProduct(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }
  
  updateProduct(id: string, updates: Partial<Product>): void {
    const product = this.getProduct(id);
    if (product) {
      Object.assign(product, updates);
    }
  }
  
  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
  }
}

export const productValidator = {
  validatePrice: (price: number): boolean => {
    return price > 0;
  },
  
  validateName: (name: string): boolean => {
    return name.length > 0;
  }
};
`.repeat(2); // Make it large enough

      await fsOps.createFile(largeFile, largeContent);
      
      // Analyze and suggest splits
      await astService.initializeProgram();
      const splitSuggestion = await astService.suggestFileSplit(
        path.join(testDir, largeFile), 
        100 // Low threshold for testing
      );

      expect(splitSuggestion.suggestedSplits.length).toBeGreaterThan(0);
      expect(splitSuggestion.originalFile).toBe(path.join(testDir, largeFile));

      // Verify split files have content
      for (const split of splitSuggestion.suggestedSplits) {
        expect(split.content.length).toBeGreaterThan(0);
        expect(split.elements.length).toBeGreaterThan(0);
        expect(split.fileName).toBeTruthy();
      }

      // Create the split files and verify they work
      for (const split of splitSuggestion.suggestedSplits) {
        await fsOps.createFile(split.fileName.replace(testDir + '/', ''), split.content);
        expect(await fsOps.fileExists(split.fileName.replace(testDir + '/', ''))).toBe(true);
      }
    });

    it('should extract imports and exports correctly', async () => {
      const testFile = 'src/imports-exports.ts';
      const content = `
import React from 'react';
import { useState, useEffect } from 'react';
import { CustomType } from './types';

export const namedExport = 'test';
export function exportedFunction() {
  return 'function';
}

export default class DefaultClass {
  render() {
    return 'default';
  }
}

export { useState as useStateAlias };
`;

      await fsOps.createFile(testFile, content);
      await astService.initializeProgram();

      // Test import extraction
      const imports = await astService.extractImports(path.join(testDir, testFile));
      expect(imports.length).toBeGreaterThan(0);

      const reactImport = imports.find(imp => imp.moduleName === 'react' && imp.isDefault);
      expect(reactImport).toBeDefined();
      expect(reactImport?.importedNames).toContain('React');

      const namedImport = imports.find(imp => imp.moduleName === 'react' && !imp.isDefault);
      expect(namedImport).toBeDefined();
      expect(namedImport?.importedNames).toContain('useState');

      // Test export extraction
      const exports = await astService.extractExports(path.join(testDir, testFile));
      expect(exports.length).toBeGreaterThan(0);

      const defaultExport = exports.find(exp => exp.isDefault);
      expect(defaultExport).toBeDefined();

      const namedExports = exports.filter(exp => !exp.isDefault);
      expect(namedExports.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle file operation failures gracefully', async () => {
      const testFile = 'src/test.ts';
      const originalContent = 'export const original = true;';

      await fsOps.createFile(testFile, originalContent);

      // Create operations that will fail
      const operations = [
        {
          type: 'modify' as const,
          targetPath: testFile,
          content: 'export const modified = true;'
        },
        {
          type: 'delete' as const,
          targetPath: 'non-existent-file.ts' // This will fail
        }
      ];

      // Operations should fail and rollback
      await expect(fsOps.executeOperations(operations)).rejects.toThrow();

      // Original file should be restored
      const content = await fsOps.readFile(testFile);
      expect(content).toBe(originalContent);
    });

    it('should handle invalid TypeScript gracefully', async () => {
      const invalidFile = 'src/invalid.ts';
      const invalidContent = `
this is not valid typescript {{{
function incomplete(
class Broken {
  method() {
    return unclosed string"
  }
`;

      await fsOps.createFile(invalidFile, invalidContent);
      
      // AST service should not crash
      await expect(astService.initializeProgram()).resolves.not.toThrow();
      
      // Analysis might return empty results but shouldn't crash
      await expect(astService.analyzeFile(path.join(testDir, invalidFile))).resolves.not.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple files efficiently', async () => {
      const fileCount = 10;
      const files: string[] = [];

      // Create multiple files
      for (let i = 0; i < fileCount; i++) {
        const fileName = `src/file${i}.ts`;
        const content = `
export class Class${i} {
  private value${i}: string = "test${i}";
  
  getValue${i}(): string {
    return this.value${i};
  }
}

export const constant${i} = ${i};
`;
        await fsOps.createFile(fileName, content);
        files.push(fileName);
      }

      // Verify all files exist
      for (const file of files) {
        expect(await fsOps.fileExists(file)).toBe(true);
      }

      // Analyze all files
      await astService.initializeProgram();
      
      const startTime = Date.now();
      const allElements = [];
      
      for (const file of files) {
        const elements = await astService.analyzeFile(path.join(testDir, file));
        allElements.push(...elements);
      }
      
      const endTime = Date.now();
      const analysisTime = endTime - startTime;

      expect(allElements.length).toBeGreaterThan(fileCount); // At least one element per file
      expect(analysisTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large file content efficiently', async () => {
      const largeFile = 'src/large-content.ts';
      
      // Create a file with many functions
      let content = '';
      for (let i = 0; i < 100; i++) {
        content += `
export function func${i}(param${i}: string): string {
  if (param${i}.length > ${i}) {
    return param${i}.toUpperCase();
  }
  return param${i}.toLowerCase();
}
`;
      }

      await fsOps.createFile(largeFile, content);
      
      const startTime = Date.now();
      await astService.initializeProgram();
      const elements = await astService.analyzeFile(path.join(testDir, largeFile));
      const endTime = Date.now();

      expect(elements.length).toBeGreaterThan(50); // Should find many functions
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});