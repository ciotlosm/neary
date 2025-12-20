# Design Document

## Overview

This design implements intelligent route-based vehicle filtering to replace the current arbitrary 2km station-distance filtering. The new system classifies routes as "busy" or "quiet" based on vehicle count and applies distance filtering only to busy routes, ensuring users see all available vehicles for less active routes while maintaining performance for high-traffic routes.

## Architecture

### High-Level Flow

```
Raw Vehicle Data
    ↓
Route Activity Analyzer
    ↓
Route Classification (Busy/Quiet)
    ↓
Intelligent Vehicle Filter
    ↓ (Busy: Apply Distance Filter)
    ↓ (Quiet: Show All Vehicles)
Filtered Vehicle Data
```

### Integration Points

The new filtering system integrates into the existing `VehicleTransformationService` pipeline:

1. **Input**: Raw vehicle data from API normalization
2. **Processing**: Route activity analysis and intelligent filtering
3. **Output**: Filtered vehicles that maintain existing data structures
4. **Integration**: Replaces hardcoded 2km filtering in `enrichWithScheduleOptimized()` and `analyzeDirectionsOptimized()`

## Components and Interfaces

### RouteActivityAnalyzer

```typescript
interface RouteActivityAnalyzer {
  analyzeRouteActivity(vehicles: CoreVehicle[]): Map<string, RouteActivityInfo>;
  classifyRoute(routeId: string, vehicleCount: number, threshold: number): RouteClassification;
  getRouteVehicleCount(routeId: string, vehicles: CoreVehicle[]): number;
  validateVehicleData(vehicle: CoreVehicle): VehicleDataQuality;
  filterValidVehicles(vehicles: CoreVehicle[]): CoreVehicle[];
}

interface RouteActivityInfo {
  routeId: string;
  vehicleCount: number;
  classification: RouteClassification;
  lastUpdated: Date;
  validVehicleCount: number; // Excludes stale/invalid vehicles
}

enum RouteClassification {
  BUSY = 'busy',
  QUIET = 'quiet'
}
```

### IntelligentVehicleFilter

```typescript
interface IntelligentVehicleFilter {
  filterVehicles(
    vehicles: CoreVehicle[],
    routeActivity: Map<string, RouteActivityInfo>,
    context: FilteringContext
  ): FilteringResult;
  
  shouldApplyDistanceFilter(routeId: string, routeActivity: Map<string, RouteActivityInfo>): boolean;
  filterByDistance(vehicles: CoreVehicle[], stations: TransformationStation[], maxDistance: number): CoreVehicle[];
  generateUserFeedback(routeActivity: Map<string, RouteActivityInfo>, filteredVehicles: CoreVehicle[]): UserFeedbackInfo;
}

interface FilteringContext {
  targetStations: TransformationStation[];
  busyRouteThreshold: number;
  distanceFilterThreshold: number;
  debugMode: boolean;
  transformationContext: TransformationContext; // Existing context compatibility
}

interface FilteringResult {
  filteredVehicles: CoreVehicle[];
  metadata: FilteringMetadata;
  userFeedback: UserFeedbackInfo;
}

interface UserFeedbackInfo {
  totalRoutes: number;
  busyRoutes: number;
  quietRoutes: number;
  distanceFilteredVehicles: number;
  emptyStateMessage?: string;
  routeStatusMessages: Map<string, string>;
}
```

### Configuration Management

```typescript
interface RouteFilteringConfig {
  busyRouteThreshold: number; // Default: 5 vehicles
  distanceFilterThreshold: number; // Default: 2000 meters
  enableDebugLogging: boolean; // Default: false
  performanceMonitoring: boolean; // Default: true
}

interface ConfigurationManager {
  getRouteFilteringConfig(): RouteFilteringConfig;
  updateConfig(updates: Partial<RouteFilteringConfig>): void;
  validateConfig(config: RouteFilteringConfig): ValidationResult;
  persistConfig(config: RouteFilteringConfig): Promise<void>;
  loadPersistedConfig(): Promise<RouteFilteringConfig>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedConfig?: RouteFilteringConfig;
}
```

## Data Models

### Enhanced Vehicle Processing Pipeline

```typescript
// Existing CoreVehicle structure remains unchanged
interface CoreVehicle {
  id: string;
  routeId: string;
  position: Coordinates;
  // ... existing properties
}

// New route activity tracking
interface RouteActivitySnapshot {
  timestamp: Date;
  routeActivities: Map<string, RouteActivityInfo>;
  totalVehicles: number;
  busyRoutes: string[];
  quietRoutes: string[];
}

// Enhanced filtering metadata
interface FilteringMetadata {
  routeActivitySnapshot: RouteActivitySnapshot;
  filteringDecisions: Map<string, FilteringDecision>;
  performanceMetrics: FilteringPerformanceMetrics;
}

interface FilteringDecision {
  vehicleId: string;
  routeId: string;
  routeClassification: RouteClassification;
  distanceFilterApplied: boolean;
  distanceToNearestStation?: number;
  included: boolean;
  reason: string;
}

interface FilteringPerformanceMetrics {
  routeAnalysisTime: number;
  filteringTime: number;
  totalVehiclesProcessed: number;
  vehiclesFiltered: number;
  cacheHitRate: number;
}

// Data quality validation
interface VehicleDataQuality {
  isPositionValid: boolean;
  isTimestampRecent: boolean;
  hasRequiredFields: boolean;
  stalenessScore: number;
}
```

## Implementation Strategy

### Phase 1: Route Activity Analysis

1. **Create RouteActivityAnalyzer service**
   - Implement vehicle counting per route
   - Add route classification logic
   - Include caching for performance

2. **Integrate with VehicleTransformationService**
   - Add route activity analysis step before filtering
   - Maintain existing pipeline structure
   - Preserve all existing interfaces

### Phase 2: Intelligent Filtering Logic

1. **Create IntelligentVehicleFilter service**
   - Implement route-based filtering decisions
   - Apply distance filtering only to busy routes
   - Show all vehicles for quiet routes

2. **Replace hardcoded 2km filtering**
   - Update `enrichWithScheduleOptimized()` method
   - Update `analyzeDirectionsOptimized()` method
   - Maintain backward compatibility

### Phase 3: Configuration and Monitoring

1. **Add configuration management**
   - Implement RouteFilteringConfig interface with validation
   - Add configuration persistence across application sessions
   - Provide sensible defaults (5 vehicles threshold, 2000m distance)
   - Implement real-time configuration updates

2. **Add debugging and monitoring**
   - Log filtering decisions when debugging enabled
   - Track performance metrics (50ms target for 1000 vehicles)
   - Provide clear user feedback about filtering behavior
   - Generate intelligent empty state messages

### Phase 4: User Experience and Integration

1. **User feedback system**
   - Implement route status indicators (busy/quiet)
   - Generate context-aware empty state messages
   - Provide transparency about filtering decisions
   - Add route-specific user messaging

2. **Existing architecture integration**
   - Ensure compatibility with TransformationContext
   - Maintain StationSelector service integration
   - Preserve existing error handling mechanisms
   - Support both real-time and scheduled vehicle data

## Error Handling

### Graceful Degradation

1. **No vehicle data**: Return empty results with clear messaging indicating no vehicles available
2. **Invalid configuration**: Use defaults and log warnings, continue operation with fallback values
3. **Route analysis failure**: Fall back to showing all vehicles without filtering
4. **Performance issues**: Implement circuit breaker pattern to prevent system overload
5. **Stale vehicle data**: Exclude vehicles with invalid/stale position data from calculations
6. **Route data unavailable**: Display warning about potential GPS errors, show available data

### Error Recovery

```typescript
interface ErrorRecoveryStrategy {
  handleRouteAnalysisFailure(error: Error, vehicles: CoreVehicle[]): CoreVehicle[];
  handleFilteringFailure(error: Error, vehicles: CoreVehicle[]): CoreVehicle[];
  handleConfigurationError(error: Error): RouteFilteringConfig;
  handleDataQualityIssues(vehicles: CoreVehicle[]): CoreVehicle[];
  generateFallbackUserMessage(error: Error): string;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  performanceThreshold: number; // 50ms as per requirements
}
```

## Testing Strategy

### Unit Testing Approach

- **RouteActivityAnalyzer**: Test vehicle counting, classification logic, and data quality validation
- **IntelligentVehicleFilter**: Test filtering decisions for busy/quiet routes and edge cases
- **Configuration**: Test validation, persistence, and real-time updates
- **Error handling**: Test graceful degradation and fallback scenarios
- **User feedback**: Test message generation for various filtering states
- **Performance**: Verify 50ms target for 1000 vehicles

### Property-Based Testing

The system will be validated using property-based testing with fast-check to ensure correctness across all input combinations. Each property test will run a minimum of 100 iterations to provide comprehensive coverage.

### Integration Testing

- **VehicleTransformationService integration**: Verify seamless pipeline integration
- **StationSelector compatibility**: Test with existing station selection logic
- **Configuration persistence**: Verify settings persist across sessions
- **Real-time updates**: Test configuration changes apply immediately
- **Data type compatibility**: Test with both real-time and scheduled data

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several properties that can be combined for more comprehensive testing:

- Properties for route classification (1.2, 1.3) can be combined into a single comprehensive classification property
- Properties for filtering behavior (2.1, 2.2) can be combined into a single filtering consistency property  
- Properties for user feedback (6.1, 6.2) can be combined into a single feedback consistency property
- Properties for configuration validation (3.5, 7.3) can be combined into a single validation property
- Properties for empty state messaging (6.3, 6.5, 7.1) can be combined into a single messaging property
- Properties for caching behavior (5.3, 5.4) can be combined into a single cache management property

### Core Properties

**Property 1: Route activity calculation accuracy**
*For any* set of vehicles and routes, the calculated vehicle count for each route should equal the actual number of vehicles with that routeId
**Validates: Requirements 1.1**

**Property 2: Route classification consistency**
*For any* route with a given vehicle count and threshold, routes with count > threshold should be classified as busy, and routes with count ≤ threshold should be classified as quiet
**Validates: Requirements 1.2, 1.3**

**Property 3: Filtering behavior consistency**
*For any* route classification and vehicle set, busy routes should have distance filtering applied while quiet routes should show all vehicles regardless of distance
**Validates: Requirements 2.1, 2.2**

**Property 4: Configuration change reactivity**
*For any* configuration update, the system should immediately apply new thresholds to current data and produce updated classifications and filtering results
**Validates: Requirements 1.4, 2.5, 3.3**

**Property 5: Configuration validation and fallback**
*For any* invalid configuration values (negative numbers, zero thresholds, out-of-range values), the system should reject them, use default values, and log appropriate warnings
**Validates: Requirements 3.5, 7.3**

**Property 6: Configuration persistence**
*For any* valid configuration saved to storage, retrieving the configuration after a simulated application restart should return the same values
**Validates: Requirements 3.4**

**Property 7: Debug logging completeness**
*For any* filtering operation, when debugging is enabled, appropriate log entries should be created for route classifications and filtering decisions
**Validates: Requirements 4.4, 6.4**

**Property 8: Cache management correctness**
*For any* vehicle data change, only route classifications affected by the changed data should be recalculated, while unaffected routes should retain cached values
**Validates: Requirements 5.3, 5.4**

**Property 9: User feedback consistency**
*For any* route classification result, busy routes should indicate distance filtering is applied, while quiet routes should indicate all vehicles are shown
**Validates: Requirements 6.1, 6.2**

**Property 10: Empty state messaging intelligence**
*For any* filtering result that produces no vehicles, the empty state message should reflect the intelligent filtering logic and provide context about route classifications rather than generic messaging
**Validates: Requirements 6.3, 6.5, 7.1**

**Property 11: Fallback behavior correctness**
*For any* scenario where route data is unavailable or invalid, the system should display appropriate warnings, but still show to the user that there is a route found
**Validates: Requirements 7.2**

**Property 12: Data quality filtering**
*For any* set of vehicles containing stale or invalid position data, those vehicles should be excluded from activity calculations while valid vehicles are processed normally
**Validates: Requirements 7.5**

**Property 13: Data type compatibility**
*For any* combination of real-time and scheduled vehicle data, the filtering logic should work consistently across both data types and produce equivalent results for equivalent inputs
**Validates: Requirements 8.4**
