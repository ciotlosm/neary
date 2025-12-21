#!/usr/bin/env node

/**
 * Safe Refactoring Execution Script
 * Runs the IntegratedRefactoringSystem on a test directory first, then optionally on the real codebase
 */

import { IntegratedRefactoringSystem } from '../src/services/IntegratedRefactoringSystem.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createTestScenario() {
  console.log('📁 Creating test scenario...');
  
  const testDir = path.join(projectRoot, 'test-refactoring-demo');
  
  // Clean up any existing test directory
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }
  
  // Create test directory structure
  await fs.mkdir(path.join(testDir, 'src', 'services'), { recursive: true });
  await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
  
  // Create a large file that needs splitting
  const largeFileContent = `
export class UserService {
  private users: User[] = [];
  
  async getUser(id: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.id === id);
      if (!user) {
        console.log('User not found:', id);
        return null;
      }
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
  
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const user = { id: this.generateId(), ...userData, createdAt: new Date() };
      this.users.push(user);
      console.log('Created user:', user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        console.log('User not found for update:', id);
        return null;
      }
      
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      console.log('Updated user:', this.users[userIndex]);
      return this.users[userIndex];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export class ProductService {
  private products: Product[] = [];
  
  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = this.products.find(p => p.id === id);
      if (!product) {
        console.log('Product not found:', id);
        return null;
      }
      console.log('Found product:', product);
      return product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }
  
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const product = { id: this.generateId(), ...productData, createdAt: new Date() };
      this.products.push(product);
      console.log('Created product:', product);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
}

export interface CreateProductData {
  name: string;
  price: number;
}
`;

  await fs.writeFile(
    path.join(testDir, 'src', 'services', 'largeService.ts'),
    largeFileContent
  );
  
  // Create overcrowded utils folder
  const utilFiles = [
    { name: 'validation.ts', content: 'export const validateEmail = (email: string) => /\\S+@\\S+\\.\\S+/.test(email);' },
    { name: 'formatting.ts', content: 'export const formatDate = (date: Date) => date.toISOString().split("T")[0];' },
    { name: 'performance.ts', content: 'export const debounce = (fn: Function, delay: number) => { /* implementation */ };' },
    { name: 'helpers.ts', content: 'export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);' },
    { name: 'constants.ts', content: 'export const API_BASE_URL = "https://api.example.com";' }
  ];

  for (const file of utilFiles) {
    await fs.writeFile(
      path.join(testDir, 'src', 'utils', file.name),
      file.content
    );
  }
  
  // Create files with duplicate patterns
  const duplicateErrorHandling = `
try {
  await performOperation();
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
`;

  await fs.writeFile(
    path.join(testDir, 'src', 'services', 'service1.ts'),
    `export const service1 = async () => { ${duplicateErrorHandling} };`
  );
  
  await fs.writeFile(
    path.join(testDir, 'src', 'services', 'service2.ts'),
    `export const service2 = async () => { ${duplicateErrorHandling} };`
  );
  
  // Create file with naming issue
  await fs.writeFile(
    path.join(testDir, 'src', 'services', 'svc.ts'),
    'export const svc = "service with unclear name";'
  );
  
  console.log('✅ Test scenario created in:', testDir);
  return testDir;
}

async function runRefactoringOnDirectory(directory, description) {
  console.log(`\n🔧 Running refactoring on ${description}...`);
  
  const config = {
    maxFileSize: 50, // Lines
    maxFilesPerFolder: 3,
    duplicateSimilarityThreshold: 0.8,
    includePatterns: ['src/**/*.ts'],
    excludePatterns: ['**/*.test.*', '**/*.spec.*'],
    createBackups: true,
    stopOnError: false
  };
  
  const refactoringSystem = new IntegratedRefactoringSystem(directory, config);
  
  try {
    console.log('📊 Analyzing codebase...');
    const analysis = await refactoringSystem.analyzeCodebase();
    
    console.log('\n📋 Analysis Results:');
    console.log(`   📁 Total files: ${analysis.totalFiles}`);
    console.log(`   📏 Oversized files: ${analysis.oversizedFiles.length}`);
    console.log(`   📂 Overcrowded folders: ${analysis.overcrowdedFolders.length}`);
    console.log(`   🔄 Duplicate patterns: ${analysis.duplicatePatterns.length}`);
    console.log(`   🏷️  Naming issues: ${analysis.namingIssues.length}`);
    
    if (analysis.oversizedFiles.length === 0 && 
        analysis.overcrowdedFolders.length === 0 && 
        analysis.duplicatePatterns.length === 0 && 
        analysis.namingIssues.length === 0) {
      console.log('✨ No issues found! Codebase is already well-organized.');
      return { success: true, noIssues: true };
    }
    
    const shouldProceed = await askQuestion('\n❓ Proceed with refactoring? (y/N): ');
    if (shouldProceed.toLowerCase() !== 'y' && shouldProceed.toLowerCase() !== 'yes') {
      console.log('⏹️  Refactoring cancelled by user.');
      return { success: false, cancelled: true };
    }
    
    console.log('\n🚀 Executing refactoring...');
    const startTime = Date.now();
    const report = await refactoringSystem.executeRefactoring();
    const executionTime = Date.now() - startTime;
    
    console.log('\n📊 Refactoring Results:');
    console.log(`   ✅ Success: ${report.success}`);
    console.log(`   ⏱️  Total time: ${report.totalTime}ms (actual: ${executionTime}ms)`);
    console.log(`   📝 Files modified: ${report.filesModified}`);
    console.log(`   📄 Files created: ${report.filesCreated}`);
    console.log(`   🗑️  Files deleted: ${report.filesDeleted}`);
    console.log(`   🔄 Duplicates removed: ${report.duplicatesRemoved}`);
    console.log(`   📏 Files optimized: ${report.filesOptimized}`);
    console.log(`   📂 Folders reorganized: ${report.foldersReorganized}`);
    console.log(`   🔧 Operations: ${report.operations.length}`);
    
    if (report.errors.length > 0) {
      console.log(`   ❌ Errors: ${report.errors.length}`);
      report.errors.forEach(error => console.log(`      - ${error}`));
    }
    
    if (report.warnings.length > 0) {
      console.log(`   ⚠️  Warnings: ${report.warnings.length}`);
      report.warnings.forEach(warning => console.log(`      - ${warning}`));
    }
    
    return report;
    
  } catch (error) {
    console.error('💥 Refactoring failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Safe Refactoring Execution Script\n');
  console.log('This script will:');
  console.log('1. Create a test scenario with various refactoring needs');
  console.log('2. Run the refactoring system on the test scenario');
  console.log('3. Optionally run on your actual codebase\n');
  
  try {
    // Step 1: Create and run test scenario
    const testDir = await createTestScenario();
    const testResult = await runRefactoringOnDirectory(testDir, 'test scenario');
    
    if (testResult.success) {
      console.log('\n✅ Test scenario refactoring completed successfully!');
      
      // Show what files were created/modified
      console.log('\n📁 Inspecting test results...');
      try {
        const files = await fs.readdir(path.join(testDir, 'src'), { recursive: true });
        console.log('Files in test directory after refactoring:');
        files.forEach(file => console.log(`   - ${file}`));
      } catch (error) {
        console.log('Could not list files:', error.message);
      }
      
      // Ask if user wants to run on real codebase
      const runOnReal = await askQuestion('\n❓ Run refactoring on your actual codebase? (y/N): ');
      if (runOnReal.toLowerCase() === 'y' || runOnReal.toLowerCase() === 'yes') {
        
        // Final safety check
        console.log('\n⚠️  IMPORTANT SAFETY NOTICE:');
        console.log('   - Make sure all your changes are committed to git');
        console.log('   - The refactoring will create backups, but git is your safety net');
        console.log('   - You can stop the process at any time with Ctrl+C');
        
        const finalConfirm = await askQuestion('\n❓ Are you sure you want to proceed? Type "YES" to confirm: ');
        if (finalConfirm === 'YES') {
          const realResult = await runRefactoringOnDirectory(projectRoot, 'your actual codebase');
          
          if (realResult.success) {
            console.log('\n🎉 Refactoring completed successfully!');
            console.log('📋 Please review the changes and run your tests to ensure everything works correctly.');
          } else {
            console.log('\n❌ Refactoring failed on actual codebase.');
            console.log('🔧 Please review the errors and try again.');
          }
        } else {
          console.log('⏹️  Real codebase refactoring cancelled.');
        }
      }
    } else {
      console.log('\n❌ Test scenario failed. Please fix issues before running on real codebase.');
    }
    
    // Cleanup test directory
    const cleanup = await askQuestion('\n❓ Clean up test directory? (Y/n): ');
    if (cleanup.toLowerCase() !== 'n' && cleanup.toLowerCase() !== 'no') {
      await fs.rm(testDir, { recursive: true, force: true });
      console.log('🧹 Test directory cleaned up.');
    } else {
      console.log(`📁 Test directory preserved at: ${testDir}`);
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Script interrupted by user');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Script terminated');
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  rl.close();
  process.exit(1);
});