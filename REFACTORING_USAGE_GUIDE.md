# How to Use the Refactoring System

The refactoring system built as part of the app-architecture-simplification spec provides automated code analysis, duplication removal, file size optimization, and folder restructuring.

## Quick Start

### 1. Basic Usage

```typescript
import { RefactoringOrchestrationSystem } from './src/services/RefactoringOrchestrationSystem';
import { CodebaseAnalysisEngine } from './src/services/CodebaseAnalysisEngine';
import { DuplicationConsolidationEngine } from './src/services/DuplicationConsolidationEngine';
import { ComprehensiveValidationPipeline } from './src/services/ComprehensiveValidationPipeline';

// Create the components
const analyzer = new CodebaseAnalysisEngine();
const engine = new DuplicationConsolidationEngine();
const validator = new ComprehensiveValidationPipeline();

// Create the orchestration system
const refactoringSystem = new RefactoringOrchestrationSystem(
  analyzer, 
  engine, 
  validator
);

// Execute refactoring
const report = await refactoringSystem.executeRefactoring();
console.log('Refactoring completed:', report);
```

### 2. With Custom Configuration

```typescript
const config = {
  analysis: {
    maxFileSize: 200,           // Max lines per file
    maxFilesPerFolder: 10,      // Max files per folder
    duplicateSimilarityThreshold: 0.8,
    includePatterns: ['**/*.ts', '**/*.tsx'],
    excludePatterns: ['**/node_modules/**', '**/dist/**'],
    includeTests: false
  },
  requireConfirmation: true,    // Ask user before executing
  stopOnError: true,           // Stop on first error
  maxExecutionTime: 300000,    // 5 minutes timeout
  createBackups: true          // Create backups before changes
};

const refactoringSystem = new RefactoringOrchestrationSystem(
  analyzer, 
  engine, 
  validator, 
  config
);
```

## What the System Does

### 🔍 **Analysis Phase**
- Scans all TypeScript/JavaScript files
- Identifies duplicate code patterns
- Finds files over 200 lines
- Detects folders with more than 10 files
- Analyzes naming conventions

### 📋 **Planning Phase**
- Creates refactoring plans for each issue type
- Calculates dependencies between operations
- Estimates impact and execution time
- Generates safe execution order

### ✅ **Validation Phase**
- Runs existing tests to ensure they pass
- Validates build process works
- Checks for functionality preservation

### 🔧 **Execution Phase**
- Consolidates duplicate code into reusable utilities
- Splits large files into logical modules
- Reorganizes overcrowded folders
- Updates import paths automatically
- Creates backups before changes

### 📊 **Reporting Phase**
- Generates comprehensive report
- Shows what was changed
- Provides recommendations
- Tracks performance metrics

## Event Monitoring

The system emits events you can listen to:

```typescript
// Progress tracking
refactoringSystem.on('progress', (progress) => {
  console.log(`${progress.phase}: ${progress.step} (${progress.progress}%)`);
});

// User interaction
refactoringSystem.on('userFeedbackRequired', (feedback) => {
  // Handle user confirmation requests
  console.log(feedback.message);
  if (feedback.options) {
    console.log('Options:', feedback.options);
  }
});

// Completion
refactoringSystem.on('completed', (report) => {
  console.log('Refactoring completed successfully!');
  console.log(`Files modified: ${report.changesSummary.filesModified}`);
  console.log(`Duplicates removed: ${report.changesSummary.duplicatesRemoved}`);
});

// Error handling
refactoringSystem.on('error', (error) => {
  console.error('Refactoring failed:', error);
});
```

## User Interaction

When `requireConfirmation: true`, the system will ask for confirmation:

```typescript
// Provide user response
refactoringSystem.provideUserResponse('Yes'); // or 'No' or 'Show Details'
```

## Example Output

After running, you'll get a comprehensive report:

```typescript
{
  success: true,
  totalTime: 45000, // 45 seconds
  changesSummary: {
    filesModified: 23,
    filesCreated: 8,
    filesDeleted: 2,
    linesChanged: 1250,
    duplicatesRemoved: 15,
    filesOptimized: 12,
    foldersReorganized: 4
  },
  recommendations: [
    "Consider implementing code review processes to prevent future duplication",
    "Establish file size guidelines and automated checks",
    "Document new folder structure for team consistency"
  ]
}
```

## Safety Features

- **Automatic Backups**: Creates backups before making changes
- **Rollback Support**: Can revert changes if issues occur
- **Dependency Tracking**: Ensures operations execute in safe order
- **Validation**: Runs tests and build checks after changes
- **User Confirmation**: Asks permission before making changes

## Running on Your Codebase

To run on the Cluj Bus App codebase:

```typescript
// Focus on services and utils folders (the main problem areas)
const config = {
  analysis: {
    includePatterns: [
      'src/services/**/*.ts',
      'src/utils/**/*.ts',
      'src/components/**/*.tsx'
    ],
    excludePatterns: [
      '**/*.test.*',
      '**/*.spec.*'
    ]
  }
};

const report = await refactoringSystem.executeRefactoring();
```

This will help organize the overcrowded services (40+ files) and utils (30+ files) folders into logical subfolders with max 10 files each, as specified in the requirements.