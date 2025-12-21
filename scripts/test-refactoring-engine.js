#!/usr/bin/env node

/**
 * Simple test script for the ActualRefactoringEngine
 * Tests the engine without requiring a full build
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing ActualRefactoringEngine...\n');

async function testRefactoringEngine() {
  try {
    // Import the services we need
    const { ActualRefactoringEngine } = await import('../src/services/ActualRefactoringEngine.js');
    
    console.log('✅ Successfully imported ActualRefactoringEngine');
    
    // Create an instance
    const engine = new ActualRefactoringEngine(projectRoot);
    console.log('✅ Successfully created ActualRefactoringEngine instance');
    
    // Test a simple operation - create a mock duplication report
    const mockDuplicationReport = {
      patterns: [
        {
          id: 'test-pattern',
          files: ['test-file1.ts', 'test-file2.ts'],
          content: 'console.log("duplicate code");',
          locations: [],
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
    
    console.log('🔧 Testing consolidateDuplicates method...');
    const plan = await engine.consolidateDuplicates(mockDuplicationReport);
    
    console.log('✅ Successfully generated refactoring plan:');
    console.log(`   - Operations: ${plan.operations.length}`);
    console.log(`   - Execution order: ${plan.executionOrder.length}`);
    console.log(`   - Risk level: ${plan.impact.riskLevel}`);
    console.log(`   - Estimated time: ${plan.impact.estimatedTime}ms`);
    
    console.log('\n🎉 ActualRefactoringEngine is working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing ActualRefactoringEngine:');
    console.error('Message:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    return false;
  }
}

// Run the test
testRefactoringEngine().then(success => {
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