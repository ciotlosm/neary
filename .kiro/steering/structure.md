# Cluj Bus App - Project Structure & Conventions

## Directory Organization (Current Reality)

```
src/
├── components/          # React components (organized by ui/features/layout/debug)
├── stores/              # Zustand state management (minimal, focused stores)
├── services/            # API services and business logic (NEEDS CONSOLIDATION - 40+ files)
├── hooks/               # Custom React hooks (organized by controllers/processing/shared)
├── utils/               # Pure utility functions (NEEDS ORGANIZATION - 30+ files)
├── types/               # TypeScript type definitions
├── theme/               # Material-UI theme configuration
└── test/                # Test utilities and integration tests
```

## Architecture Simplification in Progress

**CRITICAL**: This codebase is undergoing architecture simplification to reduce complexity:
- **Services folder**: Currently 40+ files, being consolidated with subfolders (max 10 files each)
- **Utils folder**: Currently 30+ files, being organized into subfolders by functional domain (validation, formatting, data processing)
- **File size limits**: Enforcing **200-line files**, **10-file folders** (Requirements 2.4, 3.4)
- **Pattern modernization**: Moving from complex factory/singleton patterns to simple exports
- **Duplication elimination**: Automated detection and consolidation of duplicate code patterns
- **Import path automation**: Automatic import path updates during file moves and renames

## Modern Architecture Patterns (Target State)

### Composition Over Inheritance
- Prefer function composition over class inheritance
- Use React hooks for stateful logic instead of class components
- Build complex functionality by combining simple functions

### Dependency Minimization
- Reduce cross-service dependencies
- Use direct imports instead of dependency injection
- Keep services focused on single responsibilities

### Clean Code Principles
- **Single Responsibility**: Each file/function has one clear purpose
- **Minimal Complexity**: Avoid over-engineering and complex patterns
- **Readable Code**: Self-documenting code over extensive comments
- **Testable Design**: Easy to test without complex mocking

## Component Architecture

### Component Naming (ACTUAL PATTERNS)
- **UI Components**: Simple names matching their purpose (e.g., `Button`, `Card`, `Input`)
- **Feature Components**: Descriptive names (e.g., `LocationPicker`, `StationDisplay`)
- **Specialized Cards**: Descriptive names (e.g., `InfoCard`, `VehicleCard`, `DataCard`)
- **File Names**: PascalCase matching component name

**IMPORTANT**: Components do NOT use "Material" prefix. The app uses simple, descriptive names like `Button` instead of `MaterialButton`. These components internally wrap Material-UI components with custom styling.

## State Management Patterns

### Zustand Stores (`src/stores/`)
- **Single Responsibility**: Each store handles one domain
- **Typed Interfaces**: All stores implement interfaces from `src/types/`
- **Persistence**: Use Zustand persist middleware for user data

### Store Conventions
- Include loading states and error handling
- Implement cleanup methods for subscriptions

## Service Layer (`src/services/`) - UNDER REFACTORING

### Current State (Being Simplified)
- **40+ files**: Too many specialized services, being consolidated
- **Complex patterns**: Factory functions, singletons, dependency injection being simplified
- **Duplication**: Multiple services with similar functionality being merged

### Target Architecture (Post-Refactoring)
- **Simple exports**: Direct service exports instead of factory patterns
- **Organized subfolders**: Services grouped by domain in subfolders (max 10 files each)
- **Clear separation**: API services, business logic, utilities properly categorized
- **Minimal dependencies**: Services with minimal cross-dependencies

### Refactoring Guidelines
- **Consolidate duplicates**: Merge services with similar functionality (Requirement 1.2, 1.3)
- **Simplify patterns**: Replace factory/singleton patterns with simple exports (Requirement 5.2)
- **Size limits**: Keep services under 200 lines, split if larger (Requirement 2.4)
- **Clear naming**: Use descriptive names that indicate purpose (Requirement 4.3)
- **Folder organization**: Group related services into subfolders (max 10 files each) (Requirement 6.3)
- **Import path updates**: Automatically update all import paths during moves (Requirement 3.5)
- **Validation**: Run tests and build validation after each refactoring step (Requirement 8.1, 8.2)

### Duplication Detection and Elimination (Requirement 1)
- **Pattern Analysis**: Identify similar code blocks, functions, and patterns across files
- **Consolidation Strategy**: Merge duplicate functionality into reusable utilities
- **Shared Implementation**: Replace duplicates with single, well-named modules
- **Validation**: Ensure all functionality is preserved during consolidation

### Architecture Layer Simplification (Requirement 5)
- **Remove unnecessary abstractions**: Eliminate complex factory patterns and dependency injection
- **Flatten complex hierarchies**: Replace multi-layer abstractions with direct implementations
- **Simplify service patterns**: Use direct exports instead of complex initialization patterns
- **Preserve functionality**: Ensure core functionality remains intact during simplification
- **Modern patterns**: Adopt lightweight, modern architectural approaches

## File Size Optimization (Requirement 2)

### Size Limit Enforcement
- **Maximum file size**: 200 lines per file (Requirement 2.4)
- **Splitting strategy**: Split large files into logical, cohesive modules
- **Single responsibility**: Each split module has one clear purpose
- **Functionality preservation**: Original functionality remains intact through proper imports/exports

### File Splitting Guidelines
- **Logical boundaries**: Split at natural code boundaries (classes, functions, feature groups)
- **Cohesive modules**: Each new file contains related functionality
- **Clear interfaces**: Well-defined exports and imports between split files
- **Import path updates**: Automatically update all references during splitting

### Target File Structure
- **Services**: Individual service files under 200 lines, grouped in domain subfolders
- **Components**: Component files under 200 lines, split by feature when needed
- **Utilities**: Utility files under 200 lines, organized by functional domain
- **Hooks**: Hook files under 200 lines, split by responsibility

### Modern Architecture Enforcement (Requirement 7)
- **Composition over Inheritance**: Favor composition patterns in new code
- **Functional Patterns**: Use functional programming principles where appropriate
- **Modern React**: Use hooks and composition instead of class components
- **Minimal Dependencies**: Reduce inter-module dependencies

## Folder Structure Optimization (Requirement 3)

### Current Challenges
- **Overcrowded folders**: Services and utils folders exceed 10-file limit
- **Poor navigation**: Difficult to locate specific functionality
- **Mixed purposes**: Related files scattered across different locations

### Reorganization Strategy
- **Logical subfolders**: Create subfolders based on functional grouping
- **Size enforcement**: Ensure no folder exceeds 10 files (Requirement 3.4)
- **Intuitive naming**: Subfolder names reflect contained functionality
- **Import path automation**: Automatically update all import paths during moves (Requirement 3.5)

### Target Folder Structure
```
src/services/
├── api/                 # API integration services (max 10 files)
├── business-logic/      # Core business logic services (max 10 files)
├── data-processing/     # Data transformation services (max 10 files)
└── utilities/          # Service utilities and helpers (max 10 files)

src/utils/
├── validation/          # Input validation utilities (max 10 files)
├── formatting/          # Date, string, number formatting (max 10 files)
├── data-processing/     # Data transformation utilities (max 10 files)
├── performance/         # Performance monitoring utilities (max 10 files)
└── shared/             # Common utilities across domains (max 10 files)
```

## Utils Folder Restructuring (Requirement 6)

### Current State (Being Reorganized)
- **30+ files**: Too many utilities scattered in single folder
- **Mixed purposes**: Validation, formatting, data processing utilities mixed together
- **Navigation difficulty**: Hard to locate specific utility functions

### Target Organization (Post-Refactoring)
```
src/utils/
├── validation/          # Input validation, data validation utilities (max 10 files)
├── formatting/          # Date, string, number formatting utilities (max 10 files)
├── data-processing/     # Data transformation, filtering utilities (max 10 files)
├── performance/         # Performance monitoring, optimization utilities (max 10 files)
└── shared/             # Common utilities used across domains (max 10 files)
```

### Reorganization Guidelines
- **Functional grouping**: Group utilities by purpose (validation, formatting, data processing)
- **Subfolder limits**: Maximum 10 files per subfolder (Requirement 6.3)
- **Clear naming**: Utility names should clearly indicate their purpose (Requirement 6.5)
- **Import updates**: Automatic import path updates during reorganization (Requirement 3.5)

## File Naming Conventions

### Human-Friendly Naming (Requirement 4)
- **Clear purpose indication**: File names should clearly indicate the module's primary responsibility
- **Logical workflow**: Names should follow a logical progression matching developer mental models
- **Avoid abbreviations**: Use full words instead of unclear abbreviations (e.g., `userService.ts` not `usrSvc.ts`)
- **Consistent patterns**: Follow established naming patterns within each domain

### Components
- **PascalCase**: `Button.tsx`, `StationDisplay.tsx`, `VehicleCard.tsx`
- **Test Files**: `ComponentName.test.tsx`
- **Integration Test Files**: `Feature.integration.test.tsx`
- **Index Files**: `index.ts` for barrel exports

### Services & Utilities
- **camelCase**: `tranzyApiService.ts`, `locationUtils.ts`
- **Descriptive names**: `vehicleTransformationService.ts` not `vehTransSvc.ts`
- **Test Files**: `serviceName.test.ts`

### Stores
- **camelCase**: `configStore.ts`
- **Test Files**: `storeName.test.ts`

## Import/Export Patterns

### Simple Exports (Preferred)
- Use direct named exports for services and utilities
- Avoid complex factory patterns and dependency injection
- Keep imports straightforward and traceable

### Barrel Exports (Use Sparingly)
- Only for major directories with stable APIs
- Re-export public APIs only
- Prefer explicit imports for better tree-shaking

### Import Organization
```typescript
// External libraries
import React from 'react';
import { Button as MuiButton } from '@mui/material';

// Internal components (explicit paths preferred)
import { Button } from '@/components/ui/Button';
import { VehicleCard } from '@/components/features/VehicleCard';

// Internal services/stores (direct imports)
import { useConfigStore } from '@/stores/configStore';
import { logger } from '@/utils/logger';
```

## Error Handling Conventions

### Error Types
- **Network Errors**: API failures, timeouts
- **Parsing Errors**: Invalid data format
- **Authentication Errors**: Invalid API keys
- **Partial Errors**: Some data unavailable

### Error Boundaries
- Wrap major features in ErrorBoundary components
- Provide fallback UI and retry mechanisms
- Log errors with context for debugging

## Testing Conventions

### Refactoring Validation (Requirement 8)
- **Test preservation**: All existing tests must continue to pass after refactoring
- **Build validation**: Build process must complete successfully after file moves/renames
- **Functionality verification**: Application must run identically before and after refactoring
- **Rollback procedures**: Clear rollback options when issues are detected

### Test Organization
- **Co-located**: Test files next to source files
- **Integration Tests**: In `src/` root for cross-feature tests
- **Test Utilities**: In `src/test/` directory

### Test Patterns
- **Arrange-Act-Assert**: Clear test structure
- **Mock External Dependencies**: Use Vitest mocks for APIs
- **Test User Interactions**: Use Testing Library patterns

## Performance Guidelines

### File and Folder Size Limits (ENFORCED)
- **Files**: Maximum **200 lines**, split if larger (Requirement 2.4)
- **Folders**: Maximum **10 files**, create subfolders if needed (Requirement 3.4)
- **Services**: Consolidate similar functionality, organize into subfolders by domain
- **Utils**: Group by functional domain (validation, formatting, data processing) with subfolders

### Component Optimization
- **React.memo**: For expensive components
- **useCallback**: For event handlers passed to children
- **useMemo**: For expensive calculations

### Bundle Optimization
- **Code Splitting**: Lazy load non-critical features
- **Tree Shaking**: Use named imports and avoid barrel exports
- **Vendor Chunks**: Separate vendor code in build

## Kiro Spec Task Format Requirements

### Task File Structure for Kiro IDE Integration

**CRITICAL: Tasks must follow this exact format for "Start task" buttons to appear in Kiro IDE**

#### ✅ Correct Format:
```markdown
# Implementation Tasks

## Phase 1: Description

- [ ] 1. Task description
  - Subtask details
  - More details
  - _Requirements: 1.1, 2.2_

- [ ] 2. Another task description
  - Subtask details
  - _Requirements: 3.1_

- [ ]* 3. Optional task description (marked with *)
  - **Property X: Property name**
  - **Validates: Requirements X.X**

## Phase 2: Description

- [ ] 4. Next phase task
  - Details
  - _Requirements: 4.1_
```

#### ❌ Incorrect Format (No Start Task Buttons):
```markdown
### 1. Section Header
- [ ] 1.1 Nested task (won't work)
- [ ] 1.2 Another nested task (won't work)

### 2. Another Section
- [ ] 2.1 More nested tasks (won't work)
```

#### Key Requirements:
1. **Flat numbered list**: Use `- [ ] N.` format (1, 2, 3, etc.)
2. **No nested numbering**: Avoid `1.1, 1.2` style numbering
3. **Optional tasks**: Mark with `*` like `- [ ]* N.`
4. **Phase headers**: Use `## Phase N:` for organization
5. **Requirements tracking**: Include `_Requirements: X.X, Y.Y_`
6. **Property tests**: Use `**Property X:** and **Validates:**` format

#### Examples from Working Specs:
- `.kiro/specs/store-architecture-consolidation/tasks.md`
- `.kiro/specs/nearby-view-stabilization/tasks.md`

**Always check existing working specs for reference when creating new task files!**

