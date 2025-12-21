#!/usr/bin/env node

/**
 * Execute Refactoring Script
 * Runs the app architecture simplification refactoring system
 */

import { CodebaseAnalysisEngine } from '../src/services/CodebaseAnalysisEngine.js';
import { DuplicationConsolidationEngine } from '../src/services/DuplicationConsolidationEngine.js';
import { ComprehensiveValidationPipeline } from '../src/services/ComprehensiveValidationPipeline.js';
import { RefactoringOrchestrationSystem } from '../src/services/RefactoringOrchestrationSystem.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Starting App Architecture Simplification Refactoring...\n');

// Configuration focused on the main problem areas
const config = {
  analysis: {
    maxFileSize: 200,
    maxFilesPerFolder: 10,
    duplicateSimilarityThreshold: 0.8,
    includePatterns: [
      'src/services/**/*.ts',
      'src/utils/**/*.ts',
      'src/components/**/*.tsx',
      'src/hooks/**/*.ts',
      'src/types/**/*.ts'
    ],
    excludePatterns: [
      '**/*.test.*',
      '**/*.spec.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**'
    ],
    includeTests: false,
    includeNodeModules: false
  },
  requireConfirmation: true,
  stopOnError: false, // Continue on errors to see full scope
  maxExecutionTime: 600000, // 10 minutes
  createBackups: true,
  progressUpdateInterval: 2000
};

async function executeRefactoring() {
  try {
    // Create the refactoring components
    console.log('📊 Initializing refactoring components...');
    const analyzer = new CodebaseAnalysisEngine(projectRoot);
    const engine = new DuplicationConsolidationEngine(projectRoot);
    const validator = new ComprehensiveValidationPipeline(projectRoot);

    // Create the orchestration system
    const refactoringSystem = new RefactoringOrchestrationSystem(
      analyzer,
      engine,
      validator,
      config
    );

    // Set up event listeners for progress tracking
    refactoringSystem.on('progress', (progress) => {
      const bar = '█'.repeat(Math.floor(progress.progress / 5)) + 
                  '░'.repeat(20 - Math.floor(progress.progress / 5));
      console.log(`[${bar}] ${progress.progress.toFixed(1)}% - ${progress.phase}: ${progress.step}`);
      
      if (progress.currentOperation) {
        console.log(`   → ${progress.currentOperation}`);
      }
      
      if (progress.estimatedTimeRemaining > 0) {
        const minutes = Math.floor(progress.estimatedTimeRemaining / 60000);
        const seconds = Math.floor((progress.estimatedTimeRemaining % 60000) / 1000);
        console.log(`   ⏱️  Estimated time remaining: ${minutes}m ${seconds}s`);
      }
      console.log('');
    });

    refactoringSystem.on('analysisStarted', () => {
      console.log('🔍 Starting codebase analysis...');
    });

    refactoringSystem.on('analysisCompleted', (analysis) => {
      console.log('✅ Analysis completed!');
      console.log(`   📁 Total files analyzed: ${analysis.totalFiles}`);
      console.log(`   🔄 Duplicate patterns found: ${analysis.duplicatePatterns.length}`);
      console.log(`   📏 Oversized files (>200 lines): ${analysis.oversizedFiles.length}`);
      console.log(`   📂 Overcrowded folders (>10 files): ${analysis.overcrowdedFolders.length}`);
      console.log(`   🏷️  Naming issues: ${analysis.namingIssues.length}`);
      console.log('');
    });

    refactoringSystem.on('userFeedbackRequired', (feedback) => {
      console.log('❓ User Input Required:');
      console.log(feedback.message);
      
      if (feedback.options) {
        console.log('Options:', feedback.options.join(', '));
      }
      
      // For this automated execution, we'll auto-approve with "Yes"
      setTimeout(() => {
        console.log('🤖 Auto-responding: Yes');
        refactoringSystem.provideUserResponse('Yes');
      }, 1000);
    });

    refactoringSystem.on('planStarted', (info) => {
      console.log(`🎯 Starting refactoring plan with ${info.operations} operations...`);
    });

    refactoringSystem.on('planCompleted', (info) => {
      console.log(`✅ Refactoring plan completed successfully!`);
    });

    refactoringSystem.on('planFailed', (info) => {
      console.log(`❌ Refactoring plan failed: ${info.error}`);
    });

    refactoringSystem.on('completed', (report) => {
      console.log('🎉 REFACTORING COMPLETED SUCCESSFULLY!\n');
      
      console.log('📊 SUMMARY:');
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
      
      console.log(`\n📋 Full report saved to: refactoring-report-${Date.now()}.json`);
    });

    refactoringSystem.on('error', (error) => {
      console.error('❌ REFACTORING FAILED:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    });

    // Execute the refactoring
    console.log('🔧 Starting refactoring execution...\n');
    const report = await refactoringSystem.executeRefactoring();
    
    // Save the report
    const reportPath = `refactoring-report-${Date.now()}.json`;
    await import('fs').then(fs => {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    });
    
    return report;

  } catch (error) {
    console.error('💥 Fatal error during refactoring:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Refactoring interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Refactoring terminated');
  process.exit(0);
});

// Execute the refactoring
executeRefactoring().then(() => {
  console.log('\n✨ Refactoring script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Refactoring script failed:', error);
  process.exit(1);
});