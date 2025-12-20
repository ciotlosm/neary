# Hook Refactoring Design Document

## Overview

This design document outlines the architectural refactoring of the Cluj Bus App's React hooks system. The current `useVehicleProcessing` hook has grown to 829 lines and violates the Single Responsibility Principle by handling data fetching, business logic processing, UI state management, and performance optimization all in one place.

The refactoring will decompose this "God Hook" into a collection of focused, composable hooks that each handle a single responsibility while maintaining backward compatibility and improving testability, performance, and maintainability.

## Architecture

### Current Architecture Problems

The existing `useVehicleProcessing` hook suffers from several architectural issues:

```typescript
// Current problematic structure (829 lines)
useVehicleProcessing() {
  // Data fetching (stations, vehicles, routes, stop_times, trips)
  // Business logic (filtering, grouping, direction analysis)  
  // Performance optimization (caching, memoization, deduplication)
  // Error handling (multiple try-catch blocks)
  // State management (loading states, data states)
  // Complex dependencies (circular dependency prevention)
}
```

**Critical Issues:**
- **Single Responsibility Violation**: 11+ distinct responsibilities in one hook
- **Complex Dependencies**: Memoized hashes to prevent infinite loops (red flag)
- **Testing Difficulty**: Cannot test individual pieces in isolation
- **Reusability Problems**: Cannot reuse logic across different components
- **Performance Bottlenecks**: Re-executes entire pipeline on any change

### New Layered Architecture

The new architecture follows a clean three-layer approach:

```
┌─────────────────────────────────────────────────────────┐
│                 Orchestration Layer                     │
│  useVehicleProcessing() - Coordinates all sub-hooks    │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                 Processing Layer                        │
│  useVehicleFiltering()    useVehicleGrouping()         │
│  useDirectionAnalysis()   useProximityCalculation()    │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  useStationData()    useVehicleData()                  │
│  useRouteData()      useStopTimesData()                │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Single Responsibility**: Each hook has one clear purpose
- **Composability**: Hooks can be combined in different ways
- **Testability**: Each layer can be tested independently
- **Performance**: Focused caching and selective re-execution
- **Maintainability**: Changes affect only relevant hooks

## Components and Interfaces

### Data Layer Hooks

The data layer provides focused hooks for each type of API data:

```typescript
// Base interface for all data hooks
interface DataHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

// Station data hook
interface UseStationDataOptions {
  agencyId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number;
}

export const useStationData: (options?: UseStationDataOptions) => DataHookResult<Station[]>

// Vehicle data hook
interface UseVehicleDataOptions {
  agencyId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number;
}

export const useVehicleData: (options?: UseVehicleDataOptions) => DataHookResult<LiveVehicle[]>

// Route data hook
interface UseRouteDataOptions {
  agencyId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number;
}

export const useRouteData: (options?: UseRouteDataOptions) => DataHookResult<Route[]>

// Stop times data hook
interface UseStopTimesDataOptions {
  agencyId?: string;
  tripId?: string;
  stopId?: string;
  forceRefresh?: boolean;
  cacheMaxAge?: number;
}

export const useStopTimesData: (options?: UseStopTimesDataOptions) => DataHookResult<StopTime[]>
```

### Processing Layer Hooks

The processing layer provides pure business logic hooks:

```typescript
// Vehicle filtering hook
interface UseVehicleFilteringOptions {
  filterByFavorites?: boolean;
  favoriteRoutes?: string[];
  maxSearchRadius?: number;
  userLocation?: Coordinates;
}

interface VehicleFilteringResult {
  filteredVehicles: LiveVehicle[];
  filterStats: {
    totalVehicles: number;
    filteredCount: number;
    appliedFilters: string[];
  };
}

export const useVehicleFiltering: (
  vehicles: LiveVehicle[],
  options: UseVehicleFilteringOptions
) => VehicleFilteringResult

// Vehicle grouping hook
interface UseVehicleGroupingOptions {
  maxStations?: number;
  maxVehiclesPerStation?: number;
  proximityThreshold?: number;
}

export const useVehicleGrouping: (
  vehicles: LiveVehicle[],
  stations: Station[],
  userLocation: Coordinates,
  options: UseVehicleGroupingOptions
) => StationVehicleGroup[]

// Direction analysis hook
interface DirectionAnalysisResult {
  direction: 'arriving' | 'departing' | 'unknown';
  estimatedMinutes: number;
  confidence: 'high' | 'medium' | 'low';
}

export const useDirectionAnalysis: (
  vehicle: LiveVehicle,
  targetStation: Station,
  stopTimes: StopTime[]
) => DirectionAnalysisResult

// Proximity calculation hook
interface ProximityResult {
  distance: number;
  withinRadius: boolean;
  bearing?: number;
}

export const useProximityCalculation: (
  from: Coordinates,
  to: Coordinates,
  maxRadius?: number
) => ProximityResult
```

### Orchestration Layer Hook

The orchestration layer maintains the existing API while using the new focused hooks:

```typescript
// Maintains exact backward compatibility
interface VehicleProcessingOptions {
  filterByFavorites?: boolean;
  maxStations?: number;
  maxVehiclesPerStation?: number;
  showAllVehiclesPerRoute?: boolean;
  maxSearchRadius?: number;
  maxStationsToCheck?: number;
  proximityThreshold?: number;
}

interface VehicleProcessingResult {
  stationVehicleGroups: StationVehicleGroup[];
  isLoading: boolean;
  isLoadingStations: boolean;
  isLoadingVehicles: boolean;
  isProcessingVehicles: boolean;
  effectiveLocationForDisplay: Coordinates | null;
  favoriteRoutes: FavoriteRoute[];
  allStations: Station[];
  vehicles: LiveVehicle[];
  error?: Error;
}

export const useVehicleProcessing: (
  options?: VehicleProcessingOptions
) => VehicleProcessingResult
```

## Data Models

### Enhanced Data Models

```typescript
// Enhanced vehicle with processing metadata
interface EnhancedVehicleInfo extends LiveVehicle {
  // Processing metadata
  _internalDirection?: 'arriving' | 'departing' | 'unknown';
  _processingTimestamp?: Date;
  _confidence?: 'high' | 'medium' | 'low';
  
  // Stop sequence information
  stopSequence?: StopSequenceItem[];
  
  // Station relationship
  station?: Station;
  minutesAway?: number;
  estimatedArrival?: Date;
}

interface StopSequenceItem {
  stopId: string;
  stopName: string;
  sequence: number;
  isCurrent: boolean;
  isDestination: boolean;
  estimatedArrival?: Date;
}

// Station vehicle group
interface StationVehicleGroup {
  station: { station: Station; distance: number };
  vehicles: EnhancedVehicleInfo[];
  allRoutes: Array<{
    routeId: string;
    routeName: string;
    vehicleCount: number;
  }>;
}

// Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  maxAge: number;
  key: string;
}

// Error handling
interface HookError extends Error {
  hookName: string;
  context: Record<string, any>;
  retryable: boolean;
  timestamp: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Data Hook Properties

**Property 1: Data Hook Caching Consistency**
*For any* data hook and valid cache configuration, when data is fetched and cached, subsequent calls within the cache lifetime should return identical data without additional API calls
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 4.1**

**Property 2: Data Hook Error Handling Consistency**
*For any* data hook and API failure scenario, the hook should provide consistent error information format and retry mechanisms without crashing the component
**Validates: Requirements 1.5, 8.1**

**Property 3: Data Hook Request Deduplication**
*For any* multiple simultaneous calls to the same data hook with identical parameters, only one API request should be made and results shared
**Validates: Requirements 4.2, 4.5**

### Processing Hook Properties

**Property 4: Vehicle Filtering Determinism**
*For any* set of vehicles and filter criteria, the filtering hook should always return identical filtered results when given the same inputs
**Validates: Requirements 2.1, 5.4**

**Property 5: Vehicle Grouping Consistency**
*For any* set of vehicles and stations, the grouping hook should produce consistent groupings that respect distance and capacity constraints
**Validates: Requirements 2.2**

**Property 6: Direction Analysis Accuracy**
*For any* vehicle and station with valid stop sequence data, the direction analysis should correctly determine arrival/departure status based on sequence positions
**Validates: Requirements 2.3**

**Property 7: Proximity Calculation Correctness**
*For any* two valid coordinate pairs, the proximity calculation should return accurate distances using the haversine formula within 1% tolerance
**Validates: Requirements 2.4**

**Property 8: Processing Hook Error Safety**
*For any* processing hook receiving invalid or null data, the hook should return safe defaults and not throw exceptions
**Validates: Requirements 2.5, 8.2**

### Orchestration Properties

**Property 9: API Compatibility Preservation**
*For any* existing usage of useVehicleProcessing with valid options, the refactored hook should return data in exactly the same format and structure
**Validates: Requirements 3.2**

**Property 10: Sub-Hook Error Isolation**
*For any* sub-hook failure in the orchestration, the system should continue processing with available data and provide meaningful error messages identifying the failed component
**Validates: Requirements 3.4, 8.3**

**Property 11: Data Sharing Efficiency**
*For any* multiple instances of the orchestration hook with overlapping data needs, the system should share cached data and avoid duplicate processing
**Validates: Requirements 3.5, 4.2**

### Performance Properties

**Property 12: Selective Re-execution**
*For any* dependency change in the hook system, only the processing steps that depend on the changed data should re-execute
**Validates: Requirements 4.3**

**Property 13: Memory Cleanup**
*For any* component unmounting that uses the hooks, all subscriptions, timers, and cached references should be properly cleaned up
**Validates: Requirements 4.4**

### Error Handling Properties

**Property 14: Error Aggregation**
*For any* combination of simultaneous errors across multiple hooks, the system should aggregate error information while maintaining system stability
**Validates: Requirements 8.4**

**Property 15: Exponential Backoff Retry**
*For any* transient error in data fetching, the retry mechanism should implement exponential backoff with jitter and maximum retry limits
**Validates: Requirements 8.5**

## Error Handling

### Error Classification System

```typescript
enum HookErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  CACHE_ERROR = 'cache_error', 
  PROCESSING_ERROR = 'processing_error',
  DEPENDENCY_ERROR = 'dependency_error'
}

interface HookError extends Error {
  type: HookErrorType;
  hookName: string;
  context: Record<string, any>;
  retryable: boolean;
  timestamp: Date;
  retryCount?: number;
}
```

### Error Handling Strategy

**Data Layer Error Handling:**
- Return cached data when available on API failures
- Provide exponential backoff retry for transient errors
- Log errors with structured context for debugging
- Maintain loading states during retry attempts

**Processing Layer Error Handling:**
- Return safe defaults for invalid input data
- Log warnings for data quality issues
- Continue processing with partial data when possible
- Validate inputs and provide meaningful error messages

**Orchestration Layer Error Handling:**
- Aggregate errors from all sub-hooks
- Continue with partial data when some hooks fail
- Provide detailed error context for debugging
- Maintain backward compatibility in error responses

### Fallback Data Strategy

```typescript
// Safe defaults for each data type
const dataFallbacks = {
  stations: [] as Station[],
  vehicles: [] as LiveVehicle[],
  routes: [] as Route[],
  stopTimes: [] as StopTime[]
};

// Safe defaults for processing results
const processingFallbacks = {
  filteredVehicles: [] as LiveVehicle[],
  groupedVehicles: [] as StationVehicleGroup[],
  direction: 'unknown' as const,
  proximity: { distance: Infinity, withinRadius: false }
};
```

## Testing Strategy

### Dual Testing Approach

The system will use both unit testing and property-based testing approaches:

**Unit Tests:**
- Test specific examples and edge cases for each hook
- Verify error handling with known failure scenarios
- Test integration points between hooks
- Validate backward compatibility with existing usage

**Property-Based Tests:**
- Verify universal properties across all valid inputs using **fast-check**
- Test data consistency, filtering determinism, and error safety
- Run minimum 100 iterations per property test
- Use custom generators for domain-specific data (vehicles, stations, coordinates)

### Testing Strategy by Layer

**Data Layer Testing:**
- Mock API calls using MSW (Mock Service Worker)
- Test caching behavior with various cache configurations
- Verify error handling and retry mechanisms with network failures
- Test cleanup behavior on component unmount

**Processing Layer Testing:**
- Provide mock data inputs without API dependencies
- Verify deterministic outputs for identical inputs
- Test edge cases (empty data, invalid coordinates, malformed objects)
- Verify error handling with intentionally malformed inputs

**Orchestration Layer Testing:**
- Mock individual sub-hooks to test coordination logic
- Verify backward compatibility with existing component usage
- Test error aggregation with simulated sub-hook failures
- Verify performance improvements with benchmarking

### Property-Based Testing Configuration

```typescript
// Property test configuration
const propertyTestConfig = {
  numRuns: 100, // Minimum iterations per property
  timeout: 5000, // 5 second timeout per property
  shrinkOnFailure: true, // Find minimal failing case
  verbose: true // Detailed failure reporting
};

// Custom generators for domain data
const generators = {
  coordinates: fc.record({
    latitude: fc.double({ min: -90, max: 90 }),
    longitude: fc.double({ min: -180, max: 180 })
  }),
  vehicle: fc.record({
    id: fc.string(),
    routeId: fc.string(),
    tripId: fc.string(),
    position: generators.coordinates,
    timestamp: fc.date()
  }),
  station: fc.record({
    id: fc.string(),
    name: fc.string(),
    coordinates: generators.coordinates
  })
};
```

## Implementation Plan

### Phase 1: Data Layer Foundation (Week 1)

**Objective:** Create focused data hooks with caching and error handling

**Deliverables:**
- `useStationData` hook with caching
- `useVehicleData` hook with caching  
- `useRouteData` hook with caching
- `useStopTimesData` hook with caching
- Shared caching infrastructure
- Unit tests for all data hooks

**Success Criteria:**
- All data hooks pass unit tests
- Caching reduces API calls by 80%+
- Error handling provides consistent fallbacks
- No memory leaks in mount/unmount cycles

### Phase 2: Processing Layer (Week 2)

**Objective:** Create pure business logic hooks

**Deliverables:**
- `useVehicleFiltering` hook for favorite/proximity filtering
- `useVehicleGrouping` hook for station-based grouping
- `useDirectionAnalysis` hook for arrival/departure calculation
- `useProximityCalculation` hook for distance calculations
- Property-based tests for all processing hooks

**Success Criteria:**
- All processing hooks are pure functions (no side effects)
- Property tests pass with 100+ iterations
- Processing hooks work with mock data
- Error handling returns safe defaults

### Phase 3: Orchestration and Migration (Week 3)

**Objective:** Create orchestration hook and migrate existing usage

**Deliverables:**
- New `useVehicleProcessing` hook using sub-hooks
- Backward compatibility verification
- Performance benchmarking
- Migration of existing components
- Integration tests

**Success Criteria:**
- Exact API compatibility with current implementation
- Performance improvement of 30%+ in processing time
- All existing components work without changes
- Integration tests pass with real and mock data

### Migration Strategy

**Gradual Migration Approach:**
1. **Parallel Implementation**: New hooks run alongside existing hook
2. **Component-by-Component**: Migrate one component at a time
3. **A/B Testing**: Compare behavior between old and new implementations
4. **Rollback Safety**: Keep old implementation until full migration complete

**Risk Mitigation:**
- Feature flags to enable/disable new hooks
- Comprehensive integration tests before migration
- Performance monitoring during migration
- Quick rollback plan if issues arise

This phased approach ensures system stability while delivering incremental improvements and maintaining the ability to rollback if issues are discovered.