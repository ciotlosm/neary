#!/usr/bin/env node

/**
 * Test ActualRefactoringEngine execution without file operations
 * This tests the engine logic without performing actual file system changes
 */

console.log('🧪 Testing ActualRefactoringEngine execution logic...\n');

// Mock the file system operations to avoid actual file changes during testing
const mockFileSystemOperations = {
  createFile: async (path, content) => {
    console.log(`[MOCK] Would create file: ${path}`);
    return Promise.resolve();
  },
  modifyFile: async (path, content) => {
    console.log(`[MOCK] Would modify file: ${path}`);
    return Promise.resolve();
  },
  moveFile: async (oldPath, newPath) => {
    console.log(`[MOCK] Would move file: ${oldPath} → ${newPath}`);
    return Promise.resolve();
  },
  createDirectory: async (path) => {
    console.log(`[MOCK] Would create directory: ${path}`);
    return Promise.resolve();
  },
  fileExists: async (path) => {
    console.log(`[MOCK] Checking if file exists: ${path}`);
    return Promise.resolve(true);
  },
  readFile: async (path) => {
    console.log(`[MOCK] Would read file: ${path}`);
    return Promise.resolve('// Mock file content');
  },
  listFiles: async (path, recursive) => {
    console.log(`[MOCK] Would list files in: ${path}`);
    return Promise.resolve(['file1.ts', 'file2.ts']);
  },
  createBackup: async (operations) => {
    console.log(`[MOCK] Would create backup for ${operations.length} operations`);
    return Promise.resolve('mock-backup-id');
  },
  restoreBackup: async (backupId) => {
    console.log(`[MOCK] Would restore backup: ${backupId}`);
    return Promise.resolve();
  }
};

// Mock the AST service to avoid file system dependencies
const mockASTService = {
  suggestFileSplit: async (filePath, maxLines) => {
    console.log(`[MOCK] Would analyze file for splitting: ${filePath}`);
    return Promise.resolve({
      suggestedSplits: [
        {
          fileName: filePath.replace('.ts', '.part1.ts'),
          content: '// Split part 1'
        },
        {
          fileName: filePath.replace('.ts', '.part2.ts'),
          content: '// Split part 2'
        }
      ],
      remainingContent: '// Remaining content'
    });
  }
};

// Mock the import resolver
const mockImportResolver = {
  updateImportPaths: async (pathMappings) => {
    console.log(`[MOCK] Would update import paths for ${pathMappings.length} mappings`);
    return Promise.resolve(pathMappings.map(mapping => ({
      filePath: 'some-file.ts',
      oldImport: mapping.oldPath,
      newImport: mapping.newPath
    })));
  },
  createBarrelExports: async (folderPath, subfolders) => {
    console.log(`[MOCK] Would create barrel exports in: ${folderPath}`);
    return Promise.resolve();
  }
};

async function testEngineExecution() {
  try {
    console.log('📊 Creating test data...');
    
    // Create test duplication report
    const mockDuplicationReport = {
      patterns: [
        {
          id: 'test-pattern',
          files: ['src/file1.ts', 'src/file2.ts'],
          content: 'console.log("duplicate code");',
          locations: [
            { file: 'src/file1.ts', startLine: 10, endLine: 12 },
            { file: 'src/file2.ts', startLine: 15, endLine: 17 }
          ],
          similarity: 0.9,
          consolidationSuggestion: {
            approach: 'utility',
            targetLocation: 'src/utils/shared/',
            suggestedName: 'testUtility',
            effort: 'low'
          }
        }
      ],
      totalDuplicates: 1,
      potentialSavings: 10,
      timestamp: new Date()
    };

    console.log('✅ Test data created');
    console.log('\n🔧 Testing plan generation...');
    
    // Test that we can import and create the engine
    const { ActualRefactoringEngine } = await import('../src/services/ActualRefactoringEngine.js');
    const engine = new ActualRefactoringEngine(process.cwd());
    
    console.log('✅ ActualRefactoringEngine imported and created');
    
    // Test plan generation
    const plan = await engine.consolidateDuplicates(mockDuplicationReport);
    
    console.log('✅ Plan generated successfully:');
    console.log(`   - Operations: ${plan.operations.length}`);
    console.log(`   - Execution order: ${plan.executionOrder.length}`);
    console.log(`   - Risk level: ${plan.impact.riskLevel}`);
    console.log(`   - Benefits: ${plan.impact.benefits.length}`);
    console.log(`   - Risks: ${plan.impact.risks.length}`);
    
    console.log('\n🎯 Testing execution logic (with mocked file operations)...');
    
    // Mock the internal services to avoid file system operations
    engine.fsOps = mockFileSystemOperations;
    engine.astService = mockASTService;
    engine.importResolver = mockImportResolver;
    
    // Test execution
    const result = await engine.executeRefactoring(plan);
    
    console.log('✅ Execution completed:');
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Completed operations: ${result.completedOperations.length}`);
    console.log(`   - Failed operations: ${result.failedOperations.length}`);
    console.log(`   - Modified files: ${result.modifiedFiles.length}`);
    console.log(`   - Created files: ${result.createdFiles.length}`);
    console.log(`   - Execution time: ${result.executionTime}ms`);
    
    if (result.failedOperations.length > 0) {
      console.log('\n❌ Failed operations:');
      result.failedOperations.forEach(failure => {
        console.log(`   - ${failure.operationId}: ${failure.error}`);
      });
    }
    
    console.log('\n🎉 ActualRefactoringEngine execution logic is working!');
    return result.success;
    
  } catch (error) {
    console.error('❌ Error testing ActualRefactoringEngine execution:');
    console.error('Message:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    return false;
  }
}

// Run the test
testEngineExecution().then(success => {
  if (success) {
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});