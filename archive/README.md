# Archive Directory

This directory contains historical code and migration files that are no longer part of the active codebase but are preserved for reference.

## Structure

### `hooks/`
Contains archived hook implementations and migration infrastructure:

- **`useVehicleProcessing.legacy.ts`** - Original 829-line "God Hook" implementation
  - Archived after successful refactoring into layered architecture
  - Kept for reference and potential rollback scenarios
  - Contains complete original vehicle processing logic

- **`migration/`** - Hook migration infrastructure files
  - `compatibilityVerification.ts` - Automated compatibility testing
  - `featureFlags.ts` - Feature flag system for gradual migration
  - `performanceMonitor.ts` - Performance comparison tools
  - `migrationHelpers.ts` - Utility functions for migration process
  - Various test files (`.disabled` extension to prevent execution)

## Purpose

These files were moved outside of `src/` to:
- ✅ Prevent TypeScript compilation errors
- ✅ Keep build process clean and fast
- ✅ Maintain historical reference for future development
- ✅ Preserve migration infrastructure for future refactoring projects

## Usage

These files are **not included in the build process** and should not be imported by active code. They serve as:
- Reference documentation for architectural decisions
- Backup implementations in case of rollback needs
- Examples for future migration projects
- Historical record of code evolution

## Migration History

- **December 17, 2024**: Moved from `src/hooks/archive/` to `archive/hooks/`
- **December 16, 2024**: Hook architecture refactoring completed
- **November 2024**: Original migration infrastructure created

---

*For active development, see the main `src/` directory and current documentation in `docs/`.*