#!/usr/bin/env node

/**
 * Integration Test Script for Refactoring System
 * Tests the complete refactoring workflow with real files
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Running IntegratedRefactoringSystem Integration Tests\n');
console.log('⚠️  These tests create and modify real files in test directories');
console.log('📁 Test files will be cleaned up automatically\n');

// Run the integration tests
const testProcess = spawn('npm', ['test', '--', 'IntegratedRefactoringSystem.integration'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Integration tests completed successfully!');
    console.log('🎉 The refactoring system is ready for real-world usage.');
  } else {
    console.log('\n❌ Integration tests failed!');
    console.log('🔧 Please review the test output and fix any issues before using the refactoring system.');
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('💥 Failed to run integration tests:', error.message);
  process.exit(1);
});