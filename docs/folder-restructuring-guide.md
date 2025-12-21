# Folder Restructuring Guide

## Overview

The Folder Restructuring Service provides intelligent categorization and reorganization of the services and utils folders to improve code discoverability and maintainability. This addresses Requirements 6.1-6.5 from the architecture simplification specification.

## Features

### 🗂️ Intelligent Categorization

**Services Folder Organization:**
- **API**: External integrations (tranzyApiService, geocodingService, agencyService)
- **Business Logic**: Core domain logic (routePlanningService, stationSelector, vehicleFilter)
- **Data Processing**: Transformation and analysis (VehicleTransformationService, CodebaseAnalysisEngine)
- **Utilities**: Supporting functionality (ErrorReporter, DebugMonitoringService)

**Utils Folder Organization:**
- **Validation**: Input validation utilities (validation, propValidation)
- **Formatting**: Date, string, number formatting (timeFormat)
- **Data Processing**: Data transformation utilities (VehicleDataFactory, directionIntelligence)
- **Performance**: Performance monitoring utilities (performance, cacheUtils, debounce)
- **Shared**: Common utilities across domains (logger, mapUtils, distanceUtils)

### 📏 Folder Limit Enforcement

- **Maximum 10 files per folder** (configurable)
- **Automatic subfolder creation** when limits are exceeded
- **Intelligent grouping** with numbered subfolders (group-1, group-2, etc.)

### ✨ Naming Convention Improvements

- **Expand abbreviations**: `authSvc.ts` → `authentication.ts`
- **Remove redundant suffixes**: `userService.ts` → `user.ts` (in services folder)
- **Fix casing issues**: `data_processor.ts` → `dataProcessor.ts`
- **Add appropriate prefixes**: `apiData.ts` → `useApiData.ts` (in hooks folder)

### 🔄 Automatic Import Path Updates

- **Scans all TypeScript files** for import statements
- **Updates relative paths** when files are moved
- **Handles various import patterns** (import/from, require, dynamic imports)
- **Validates import resolution** after updates

## Usage

### Demo Mode

Run the demo to see how files would be categorized:

```bash
node scripts/demo-restructuring.js
```

### Full Restructuring

**⚠️ Warning: This will move files in your codebase. Commit your changes first!**

```bash
# Build the project first (required for the script)
npm run build

# Run the restructuring
node scripts/restructure-folders.js
```

### Programmatic Usage

```typescript
import { FolderRestructuringService } from './src/services/FolderRestructuringService';

const service = new FolderRestructuringService();

// Create restructuring plan
const plan = service.createRestructuringPlan();

// Execute restructuring
const result = await service.executeRestructuring(plan);

if (result.success) {
  console.log(`Moved ${result.movedFiles.length} files`);
  console.log(`Created ${result.createdFolders.length} folders`);
} else {
  console.error('Restructuring failed:', result.errors);
}
```

## API Reference

### FolderRestructuringService

#### Methods

- `createRestructuringPlan()`: Analyzes current structure and creates reorganization plan
- `executeRestructuring(plan)`: Executes the restructuring plan with file moves
- `categorizeServices(files)`: Categorizes service files into logical groups
- `categorizeUtils(files)`: Categorizes utility files by functional domain
- `enforceFolderLimits(files, path)`: Creates subfolders when file limits are exceeded
- `analyzeNamingConventions()`: Analyzes and suggests naming improvements

#### Configuration

```typescript
const service = new FolderRestructuringService();
// Folder limit is configurable (default: 10)
service.FOLDER_LIMIT = 15; // Increase if needed
```

### ImportPathUpdater

#### Methods

- `updateImportPaths(movedFiles)`: Updates import statements after file moves
- `validateImports()`: Validates that all imports are still resolvable

### NamingConventionService

#### Methods

- `analyzeNaming(filePaths)`: Analyzes file names for convention issues
- `suggestImprovedName(filePath)`: Suggests improved name for a file
- `suggestFolderName(files)`: Suggests folder name based on file contents

## Target Folder Structure

After restructuring, your folders will be organized as follows:

```
src/
├── services/
│   ├── api/                    # External integrations
│   │   ├── tranzyApiService.ts
│   │   ├── geocodingService.ts
│   │   └── agencyService.ts
│   ├── business-logic/         # Core domain logic
│   │   ├── routePlanningService.ts
│   │   ├── stationSelector.ts
│   │   └── routeAssociationFilter.ts
│   ├── data-processing/        # Transformation and analysis
│   │   ├── VehicleTransformationService.ts
│   │   └── CodebaseAnalysisEngine.ts
│   └── utilities/              # Supporting functionality
│       ├── ErrorReporter.ts
│       └── DebugMonitoringService.ts
└── utils/
    ├── validation/             # Input validation
    │   ├── validation.ts
    │   └── propValidation.ts
    ├── formatting/             # Date, string, number formatting
    │   └── timeFormat.ts
    ├── data-processing/        # Data transformation
    │   ├── VehicleDataFactory.ts
    │   ├── VehicleTypeGuards.ts
    │   └── directionIntelligence.ts
    ├── performance/            # Performance monitoring
    │   ├── performance.ts
    │   ├── cacheUtils.ts
    │   ├── debounce.ts
    │   └── retryUtils.ts
    └── shared/                 # Common utilities
        ├── logger.ts
        ├── mapUtils.ts
        └── distanceUtils.ts
```

## Safety Features

### Error Handling

- **Individual file errors** don't stop the entire process
- **Detailed error reporting** with specific failure reasons
- **Graceful degradation** when issues occur

### Rollback Capabilities

- **File move tracking** for potential rollback
- **Import validation** to detect broken references
- **Build validation** to ensure project still compiles

### Validation

- **Import path validation** after moves
- **Build process validation** 
- **Test execution validation** (recommended)

## Best Practices

### Before Restructuring

1. **Commit all changes** to version control
2. **Run existing tests** to ensure they pass
3. **Build the project** to ensure no compilation errors
4. **Review the restructuring plan** using demo mode

### After Restructuring

1. **Run tests** to ensure functionality is preserved
2. **Build the project** to check for import issues
3. **Review generated folder structure** for logical organization
4. **Update any remaining manual imports** if needed

### Customization

You can customize the categorization logic by modifying the pattern matching in:

- `isApiService()` - API service patterns
- `isBusinessLogicService()` - Business logic patterns  
- `isDataProcessingService()` - Data processing patterns
- `isValidationUtil()` - Validation utility patterns
- `isFormattingUtil()` - Formatting utility patterns
- `isPerformanceUtil()` - Performance utility patterns

## Troubleshooting

### Common Issues

**Import errors after restructuring:**
- Run `npm run build` to identify broken imports
- Use the import validation: `service.validateImports()`
- Manually fix any remaining import paths

**Files not categorized correctly:**
- Review the categorization patterns in the service
- Adjust patterns to match your specific file naming conventions
- Re-run the restructuring with updated patterns

**Folder limits exceeded:**
- The service automatically creates subfolders
- Adjust `FOLDER_LIMIT` if you prefer different grouping sizes
- Consider further breaking down large categories

### Recovery

If something goes wrong:

1. **Revert using Git**: `git checkout -- src/`
2. **Review error messages** in the restructuring result
3. **Fix issues** and re-run the restructuring
4. **Use incremental approach** by restructuring one folder at a time

## Requirements Validation

This implementation addresses all requirements from the specification:

- **6.1**: ✅ Groups related services into logical categories
- **6.2**: ✅ Groups utilities by functional domain  
- **6.3**: ✅ Enforces folder limits with automatic subfolder creation
- **6.4**: ✅ Improves naming conventions for better discoverability
- **6.5**: ✅ Enables intuitive file location following mental models

The restructuring maintains all existing functionality while significantly improving code organization and developer experience.