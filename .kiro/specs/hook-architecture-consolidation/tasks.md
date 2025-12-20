# Implementation Tasks

## Phase 1: Shared Infrastructure Foundation

- [x] 1. Create unified input validation library
  - Create `src/hooks/shared/validation/` directory structure
  - Implement `InputValidator` class with generic validation methods
  - Add `validateArray`, `validateVehicleArray`, `validateStationArray` functions
  - Add `validateCoordinates` and `validateBounds` utilities
  - Add `createSafeDefaults` factory functions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 1.1 Write property test for input validation consistency
  - **Property 4: Validation Consolidation**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 2. Implement standardized error handling system
  - Create `src/hooks/shared/errors/` directory structure
  - Implement `ErrorType` enum and `StandardError` interface
  - Create `ErrorHandler` class with error creation and classification methods
  - Add user-friendly message generation utilities
  - Add retry logic with exponential backoff
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 2.1 Write property test for error handling standardization
  - **Property 3: Error Handling Standardization**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 3. Create unified cache management system
  - Create `src/hooks/shared/cache/` directory structure
  - Implement `UnifiedCacheManager` class replacing 3 separate systems
  - Add TTL management, memory pressure detection, and cleanup
  - Implement cache statistics and monitoring
  - Add request deduplication capabilities
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 3.1 Write property test for cache unification correctness
  - **Property 2: Cache Unification Correctness**
  - **Validates: Requirements 2.1, 2.2, 2.3**

## Phase 2: Generic Store Data Hook

- [x] 4. Implement generic useStoreData hook
  - Create `src/hooks/shared/useStoreData.ts` with generic TypeScript implementation
  - Add `UseStoreDataConfig<T>` interface with type-safe data type mapping
  - Implement unified store method calling with proper error handling
  - Add auto-refresh consolidation replacing 4 separate implementations
  - Add subscription management with proper cleanup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 4.1 Write property test for generic hook consistency
  - **Property 1: Generic Hook Consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 5. Create type-safe data configuration system
  - Define `DataTypeMap` and `StoreMethodMap` type mappings
  - Implement compile-time type checking for data configurations
  - Add runtime validation for configuration objects
  - Create helper functions for common data access patterns
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 5.1 Write unit tests for type safety and configuration
  - Test type-safe data access patterns
  - Test configuration validation
  - Test helper function behavior
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

## Phase 3: Remove Duplicated Store Data Hooks

- [x] 6. Remove useVehicleStoreData hook
  - Delete `src/hooks/shared/useVehicleStoreData.ts` (200+ lines)
  - Update all imports to use generic `useStoreData<LiveVehicle>` 
  - Update controller hooks to use new generic pattern
  - Remove vehicle-specific auto-refresh logic
  - _Requirements: 1.1, 10.1_

- [x] 7. Remove useStationStoreData hook
  - Delete `src/hooks/shared/useStationStoreData.ts` (180+ lines)
  - Update all imports to use generic `useStoreData<Station>`
  - Update controller hooks to use new generic pattern
  - _Requirements: 1.2, 10.1_

- [x] 8. Remove useRouteStoreData hook
  - Delete `src/hooks/shared/useRouteStoreData.ts` (170+ lines)
  - Update all imports to use generic `useStoreData<Route>`
  - Update controller hooks to use new generic pattern
  - _Requirements: 1.3, 10.1_

- [x] 9. Remove useStopTimesStoreData hook
  - Delete `src/hooks/shared/useStopTimesStoreData.ts` (190+ lines)
  - Update all imports to use generic `useStoreData<StopTime>`
  - Update controller hooks to use new generic pattern
  - Remove stop-times-specific auto-refresh logic
  - _Requirements: 1.4, 10.1_

## Phase 4: Optimize Processing Layer

- [x] 10. Extract shared vehicle processing utilities
  - Create `src/hooks/shared/processing/` directory structure
  - Extract direction analysis logic from useVehicleDisplay to shared utilities
  - Create reusable vehicle enhancement functions
  - Add shared vehicle transformation pipelines
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Update processing hooks to use shared validation
  - Update `useVehicleFiltering` to use `InputValidator` library
  - Update `useVehicleGrouping` to use shared validation utilities
  - Update `useDirectionAnalysis` to use standardized error handling
  - Remove 300+ lines of duplicated validation code
  - no need for proximity filtering for vehicles, as that is only usable for stations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 11.1 Write property test for processing hook optimization
  - **Property 5: Memory Optimization Effectiveness**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

## Phase 5: Simplify Controller Layer

- [x] 12. Refactor useVehicleDisplay hook
  - Reduce from 847 lines to under 200 lines using shared infrastructure
  - Replace complex CompositionError with standardized error handling
  - Use generic `useStoreData` for all data access
  - Optimize memoization and dependency arrays
  - Remove duplicated direction analysis logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 12.1 Write property test for interface consistency
  - **Property 7: Interface Consistency**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 13. Update useNearbyViewController hook
  - Replace store data hooks with generic `useStoreData` calls
  - Use standardized error handling instead of custom error types
  - Optimize memory usage and cleanup patterns
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 14. Update remaining controller hooks
  - Update `useRouteManager` to use new infrastructure
  - Ensure all controller hooks follow consistent patterns
  - Remove any remaining duplicated logic
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Phase 6: Remove Legacy Cache Systems

- [x] 15. Remove legacy cache implementations ✅ COMPLETED
  - ✅ Delete `src/hooks/shared/cacheManager.ts` (300+ lines)
  - ✅ Delete `src/hooks/shared/useModernCacheManager.ts` (200+ lines)
  - ✅ Update all cache usage to use unified cache system
  - ✅ Remove cache-related duplication from stores
  - ✅ Created `src/hooks/shared/useUnifiedCacheManager.ts` as replacement
  - ✅ All services and stores now use `unifiedCache` from cache/instance
  - ✅ All cache-related tests passing (27/27)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 16. Remove legacy refresh systems ✅ COMPLETED
  - ✅ Deleted `src/hooks/shared/useModernRefreshSystem.ts` (250+ lines)
  - ✅ Created `src/hooks/shared/useRefreshSystem.ts` as unified replacement
  - ✅ Consolidated all refresh logic into unified auto-refresh system using existing `autoRefreshManager`
  - ✅ Updated all imports across 7 files to use new unified system
  - ✅ Leverages existing `useStoreData` hooks for data access
  - ✅ Uses vehicle store's `startAutoRefresh`/`stopAutoRefresh` methods
  - ✅ All tests passing (494 passed, 1 skipped)
  - _Requirements: 1.5, 7.2, 7.3_

## Phase 7: Update Exports and Documentation

- [x] 17. Update hook exports and indexes
  - Update `src/hooks/index.ts` to export new unified hooks
  - Update `src/hooks/shared/index.ts` to remove deleted hooks
  - Update `src/hooks/controllers/index.ts` with simplified exports
  - Ensure no broken imports remain in the codebase
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 18. Create comprehensive documentation
  - Document new generic hook patterns with examples
  - Create migration guide showing before/after patterns
  - Document shared infrastructure usage
  - Add architectural decision records for major changes
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

## Phase 8: Performance Validation and Testing

- [x] 19. Validate performance improvements
  - Measure bundle size reduction (target: 1,950+ lines removed)
  - Measure memory usage improvements
  - Measure render performance improvements
  - Validate cache efficiency improvements
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 19.1 Write property test for performance guarantees
  - **Property 6: Performance Improvement Guarantee**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [x] 20. Validate architecture boundaries
  - Ensure processing layer has no data fetching dependencies
  - Ensure controller layer uses only composition patterns
  - Ensure shared infrastructure is truly reusable
  - Validate clean dependency flow between layers
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 20.1 Write property test for architecture boundary enforcement
  - **Property 8: Architecture Boundary Enforcement**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

## Phase 9: Final Integration and Cleanup

- [x] 21. Run comprehensive test suite
  - Ensure all existing tests pass with minimal modifications
  - Validate property-based tests for all new properties
  - Run integration tests to ensure end-to-end functionality
  - Validate error handling in all scenarios
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 22. Final cleanup and validation
  - Remove any remaining dead code or unused imports
  - Validate TypeScript compilation with strict settings
  - Ensure ESLint passes with no warnings
  - Validate that all requirements have been implemented
  - _Requirements: 8.5, 11.5, 12.5_