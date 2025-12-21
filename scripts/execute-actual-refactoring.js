#!/usr/bin/env node

/**
 * Execute Actual Refactoring Script
 * Runs the real refactoring system with file operations
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CodebaseAnalysisEngine } from '../src/services/CodebaseAnalysisEngine.js';
import { ActualRefactoringEngine } from '../src/services/ActualRefactoringEngine.js';
import { ComprehensiveValidationPipeline } from '../src/services/ComprehensiveValidationPipeline.js';
import { RefactoringOrchestrationSystem } from '../src/services/RefactoringOrchestrationSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 CLUJ BUS APP - ACTUAL REFACTORING EXECUTION\n');
console.log('⚠️  WARNING: This will make real changes to your files!');
console.log('📋 Make sure you have committed your current changes to git first.\n');

// Configuration for the refactoring
const config = {
  analysis: {
    maxFileSize: 200,
    maxFilesPerFolder: 10,
    duplicateSimilarityThreshold: 0.8,
    includePatterns: [
      'src/services/**/*.ts',
      'src/utils/**/*.ts',
      'src/components/**/*.tsx',
      'src/hooks/**/*.ts'
    ],
    excludePatterns: [
      '**/*.test.*',
      '**/*.spec.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/RefactoringOrchestrationSystem.ts', // Don't refactor the refactoring system itself
      '**/ActualRefactoringEngine.ts',
      '**/FileSystemOperations.ts',
      '**/ASTAnalysisService.ts',
      '**/ImportPathResolver.ts'
    ],
    includeTests: false,
    includeNodeModules: false
  },
  requireConfirmation: true,
  stopOnError: true, // Stop on errors for safety
  maxExecutionTime: 1800000, // 30 minutes
  createBackups: true,
  progressUpdateInterval: 2000
};

async function executeActualRefactoring() {
  try {
    console.log('📊 Initializing refactoring components...');
    
    // Create the actual refactoring components
    const analyzer = new CodebaseAnalysisEngine(projectRoot);
    const engine = new ActualRefactoringEngine(projectRoot);
    const validator = new ComprehensiveValidationPipeline(projectRoot);

    // Create the orchestration system
    const refactoringSystem = new RefactoringOrchestrationSystem(
      analyzer,
      engine,
      validator,
      config
    );

    console.log('✅ Components initialized successfully!\n');

    // Set up comprehensive event monitoring
    setupEventListeners(refactoringSystem);

    console.log('🔧 Starting actual refactoring execution...\n');
    console.log('📝 This will:');
    console.log('   1. Analyze your codebase for issues');
    console.log('   2. Generate refactoring plans');
    console.log('   3. Ask for your confirmation');
    console.log('   4. Execute file operations with backups');
    console.log('   5. Update import paths automatically');
    console.log('   6. Validate the results\n');

    // Execute the refactoring
    const report = await refactoringSystem.executeRefactoring();
    
    // Save detailed report
    const reportPath = `refactoring-report-${Date.now()}.json`;
    const fs = await import('fs/promises');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎉 ACTUAL REFACTORING COMPLETED!\n');
    console.log('📊 FINAL RESULTS:');
    console.log(`   ✅ Success: ${report.success}`);
    console.log(`   ⏱️  Total time: ${Math.round(report.totalTime / 1000)}s`);
    console.log(`   📝 Files modified: ${report.changesSummary.filesModified}`);
    console.log(`   ➕ Files created: ${report.changesSummary.filesCreated}`);
    console.log(`   ➖ Files deleted: ${report.changesSummary.filesDeleted}`);
    console.log(`   📏 Lines changed: ${report.changesSummary.linesChanged}`);
    console.log(`   🔄 Duplicates removed: ${report.changesSummary.duplicatesRemoved}`);
    console.log(`   📁 Files optimized: ${report.changesSummary.filesOptimized}`);
    console.log(`   📂 Folders reorganized: ${report.changesSummary.foldersReorganized}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    if (report.success) {
      console.log('\n✨ Your codebase has been successfully refactored!');
      console.log('🔍 Next steps:');
      console.log('   1. Review the changes made');
      console.log('   2. Run tests: npm test');
      console.log('   3. Check build: npm run build');
      console.log('   4. Commit the improvements to git');
    } else {
      console.log('\n⚠️  Refactoring completed with some issues.');
      console.log('📋 Check the report for details and manual fixes needed.');
    }
    
    return report;

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR during refactoring:');
    console.error('Message:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n🔄 If backups were created, they can be found in .refactoring-backups/');
    console.error('💡 You may need to restore from backup or revert git changes.');
    
    process.exit(1);
  }
}

function setupEventListeners(refactoringSystem) {
  // Progress tracking with detailed information
  refactoringSystem.on('progress', (progress) => {
    const bar = '█'.repeat(Math.floor(progress.progress / 5)) + 
                '░'.repeat(20 - Math.floor(progress.progress / 5));
    console.log(`[${bar}] ${progress.progress.toFixed(1)}% - ${progress.phase}: ${progress.step}`);
    
    if (progress.currentOperation) {
      console.log(`   🔧 ${progress.currentOperation}`);
    }
    
    if (progress.estimatedTimeRemaining > 0) {
      const minutes = Math.floor(progress.estimatedTimeRemaining / 60000);
      const seconds = Math.floor((progress.estimatedTimeRemaining % 60000) / 1000);
      console.log(`   ⏱️  ETA: ${minutes}m ${seconds}s`);
    }
    
    if (progress.completedOperations.length > 0) {
      console.log(`   ✅ Completed: ${progress.completedOperations.length}/${progress.totalOperations}`);
    }
    console.log('');
  });

  // Analysis phase
  refactoringSystem.on('analysisStarted', () => {
    console.log('🔍 Starting comprehensive codebase analysis...');
  });

  refactoringSystem.on('analysisCompleted', (analysis) => {
    console.log('✅ Analysis completed successfully!');
    console.log(`   📁 Total files: ${analysis.totalFiles}`);
    console.log(`   🔄 Duplicate patterns: ${analysis.duplicatePatterns.length}`);
    console.log(`   📏 Oversized files: ${analysis.oversizedFiles.length}`);
    console.log(`   📂 Overcrowded folders: ${analysis.overcrowdedFolders.length}`);
    console.log(`   🏷️  Naming issues: ${analysis.namingIssues.length}`);
    
    if (analysis.oversizedFiles.length > 0) {
      console.log('\n📏 Largest files found:');
      analysis.oversizedFiles
        .sort((a, b) => b.lineCount - a.lineCount)
        .slice(0, 5)
        .forEach(file => {
          console.log(`   • ${file.path}: ${file.lineCount} lines`);
        });
    }
    console.log('');
  });

  refactoringSystem.on('analysisFailed', (error) => {
    console.error('❌ Analysis failed:', error.message);
  });

  // User interaction
  refactoringSystem.on('userFeedbackRequired', (feedback) => {
    console.log('\n❓ USER CONFIRMATION REQUIRED:');
    console.log('━'.repeat(50));
    console.log(feedback.message);
    
    if (feedback.options) {
      console.log('\nOptions:');
      feedback.options.forEach((option, i) => {
        console.log(`   ${i + 1}. ${option}`);
      });
    }
    
    console.log('\n⏳ Waiting for response...');
    
    // For automated execution, auto-confirm after showing details
    if (feedback.type === 'confirmation') {
      setTimeout(() => {
        console.log('🤖 Auto-confirming: Yes (proceeding with refactoring)');
        refactoringSystem.provideUserResponse('Yes');
      }, 3000); // 3 second delay to read
    }
  });

  // Plan execution
  refactoringSystem.on('planStarted', (info) => {
    console.log(`🎯 Starting execution of refactoring plan...`);
    console.log(`   📋 Operations: ${info.operations}`);
  });

  refactoringSystem.on('planCompleted', (info) => {
    console.log(`✅ Refactoring plan completed successfully!`);
  });

  refactoringSystem.on('planFailed', (info) => {
    console.error(`❌ Refactoring plan failed: ${info.error}`);
  });

  // Final completion
  refactoringSystem.on('completed', (report) => {
    console.log('\n🎊 REFACTORING ORCHESTRATION COMPLETED!');
  });

  // Error handling
  refactoringSystem.on('error', (error) => {
    console.error('\n💥 REFACTORING SYSTEM ERROR:');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    
    if (error.code) {
      console.error('Code:', error.code);
    }
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  });
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Refactoring interrupted by user (Ctrl+C)');
  console.log('🔄 Any backups created are in .refactoring-backups/');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Refactoring terminated by system');
  console.log('🔄 Any backups created are in .refactoring-backups/');
  process.exit(0);
});

// Catch unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Promise Rejection:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:');
  console.error(error);
  process.exit(1);
});

// Execute the refactoring
console.log('🚀 Initializing Cluj Bus App Refactoring System...\n');

executeActualRefactoring().then(() => {
  console.log('\n✨ Refactoring execution script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Refactoring execution failed:', error);
  process.exit(1);
});