/**
 * ASTAnalysisService Tests
 * Tests TypeScript AST parsing and code analysis functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ASTAnalysisService } from './ASTAnalysisService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ASTAnalysisService', () => {
  let astService: ASTAnalysisService;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../test-temp', `ast-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    astService = new ASTAnalysisService(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Code Element Extraction', () => {
    it('should extract functions from TypeScript code', async () => {
      const testFile = path.join(testDir, 'functions.ts');
      const content = `
export function testFunction(param: string): string {
  return param.toUpperCase();
}

function internalFunction(): void {
  console.log('internal');
}

const arrowFunction = (x: number) => x * 2;
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const elements = await astService.analyzeFile(testFile);
      
      const functions = elements.filter(el => el.type === 'function');
      expect(functions.length).toBeGreaterThanOrEqual(1);
      
      const exportedFunction = functions.find(f => f.name === 'testFunction');
      expect(exportedFunction).toBeDefined();
      expect(exportedFunction?.exports).toContain('testFunction');
    });

    it('should extract classes and interfaces', async () => {
      const testFile = path.join(testDir, 'classes.ts');
      const content = `
export interface TestInterface {
  prop: string;
}

export class TestClass implements TestInterface {
  prop: string;
  
  constructor(prop: string) {
    this.prop = prop;
  }
  
  method(): string {
    return this.prop;
  }
}

type TestType = {
  value: number;
};
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const elements = await astService.analyzeFile(testFile);
      
      const interfaces = elements.filter(el => el.type === 'interface');
      const classes = elements.filter(el => el.type === 'class');
      const types = elements.filter(el => el.type === 'type');
      
      expect(interfaces.length).toBe(1);
      expect(classes.length).toBe(1);
      expect(types.length).toBe(1);
      
      expect(interfaces[0].name).toBe('TestInterface');
      expect(classes[0].name).toBe('TestClass');
      expect(types[0].name).toBe('TestType');
    });

    it('should calculate complexity correctly', async () => {
      const testFile = path.join(testDir, 'complexity.ts');
      const content = `
function complexFunction(x: number): string {
  if (x > 10) {
    for (let i = 0; i < x; i++) {
      if (i % 2 === 0) {
        console.log(i);
      }
    }
  } else if (x < 0) {
    while (x < 0) {
      x++;
    }
  }
  
  try {
    return x.toString();
  } catch (error) {
    return 'error';
  }
}
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const elements = await astService.analyzeFile(testFile);
      const complexFunc = elements.find(el => el.name === 'complexFunction');
      
      expect(complexFunc).toBeDefined();
      expect(complexFunc?.complexity).toBeGreaterThan(5); // Should have high complexity
    });
  });

  describe('Import/Export Analysis', () => {
    it('should extract imports correctly', async () => {
      const testFile = path.join(testDir, 'imports.ts');
      const content = `
import React from 'react';
import { useState, useEffect } from 'react';
import * as fs from 'fs';
import { CustomType } from './types';
import defaultExport from '../utils/helper';
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const imports = await astService.extractImports(testFile);
      
      expect(imports.length).toBe(5);
      
      const reactImport = imports.find(imp => imp.moduleName === 'react' && imp.isDefault);
      expect(reactImport).toBeDefined();
      expect(reactImport?.importedNames).toContain('React');
      
      const namedImport = imports.find(imp => imp.moduleName === 'react' && !imp.isDefault);
      expect(namedImport).toBeDefined();
      expect(namedImport?.importedNames).toContain('useState');
      expect(namedImport?.importedNames).toContain('useEffect');
    });

    it('should extract exports correctly', async () => {
      const testFile = path.join(testDir, 'exports.ts');
      const content = `
export const namedExport = 'test';
export function exportedFunction() {}
export default class DefaultClass {}
export { renamedExport as alias } from './other';
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const exports = await astService.extractExports(testFile);
      
      expect(exports.length).toBeGreaterThanOrEqual(1);
      
      const defaultExport = exports.find(exp => exp.isDefault);
      expect(defaultExport).toBeDefined();
    });
  });

  describe('File Splitting Suggestions', () => {
    it('should suggest file splits for large files', async () => {
      const testFile = path.join(testDir, 'large.ts');
      const content = `
// This is a large file that should be split

export class UserService {
  getUser(id: string) {
    return { id, name: 'User' };
  }
  
  updateUser(id: string, data: any) {
    return { id, ...data };
  }
}

export class ProductService {
  getProduct(id: string) {
    return { id, name: 'Product' };
  }
  
  updateProduct(id: string, data: any) {
    return { id, ...data };
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

export const userUtils = {
  validateUser: (user: UserInterface) => !!user.id,
  formatUser: (user: UserInterface) => \`\${user.name} (\${user.id})\`
};

export const productUtils = {
  validateProduct: (product: ProductInterface) => !!product.id,
  formatProduct: (product: ProductInterface) => \`\${product.name} - $\${product.price}\`
};
`.repeat(10); // Make it large enough to trigger splitting

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const splitSuggestion = await astService.suggestFileSplit(testFile, 50); // Low threshold for testing
      
      expect(splitSuggestion.suggestedSplits.length).toBeGreaterThan(0);
      expect(splitSuggestion.originalFile).toBe(testFile);
      
      // Check that split files have content
      for (const split of splitSuggestion.suggestedSplits) {
        expect(split.content.length).toBeGreaterThan(0);
        expect(split.elements.length).toBeGreaterThan(0);
      }
    });

    it('should group related elements together', async () => {
      const testFile = path.join(testDir, 'related.ts');
      const content = `
export interface User {
  id: string;
  name: string;
}

export class UserService {
  getUser(id: string): User {
    return { id, name: 'User' };
  }
}

export const userValidator = {
  validateUser: (user: User) => !!user.id
};

export interface Product {
  id: string;
  name: string;
}

export class ProductService {
  getProduct(id: string): Product {
    return { id, name: 'Product' };
  }
}
`;

      await fs.writeFile(testFile, content);
      await astService.initializeProgram();
      
      const elements = await astService.analyzeFile(testFile);
      
      // Should find User-related and Product-related elements
      const userElements = elements.filter(el => 
        el.name.toLowerCase().includes('user')
      );
      const productElements = elements.filter(el => 
        el.name.toLowerCase().includes('product')
      );
      
      expect(userElements.length).toBeGreaterThan(1);
      expect(productElements.length).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid TypeScript files', async () => {
      const testFile = path.join(testDir, 'invalid.ts');
      const content = `
this is not valid typescript code {{{
function incomplete(
`;

      await fs.writeFile(testFile, content);
      
      // Should not throw, but may return empty results
      await expect(astService.initializeProgram()).resolves.not.toThrow();
    });

    it('should handle non-existent files', async () => {
      await astService.initializeProgram();
      
      await expect(astService.analyzeFile('non-existent.ts')).rejects.toThrow();
    });
  });
});