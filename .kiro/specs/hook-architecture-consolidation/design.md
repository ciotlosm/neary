# Design Document

## Overview

This design implements a comprehensive refactoring of the Cluj Bus App's React hooks architecture to eliminate ~1,950 lines of duplicated code and establish a clean, maintainable system. The refactoring consolidates 4 nearly identical store data hooks into a single generic implementation, unifies 3 fragmented cache systems, and standardizes error handling across all hooks.

## Architecture

### Layered Hook Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ useVehicleDisplay│  │useNearbyView    │  │useRouteManager│ │
│  │ (Simplified)    │  │Controller       │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Processing Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │useVehicleFilter │  │useVehicleGroup  │  │useDirection  │ │
│  │(Pure Functions) │  │(Pure Functions) │  │Analysis      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Shared Infrastructure                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │useStoreData<T>  │  │Unified Cache    │  │Input         │ │
│  │(Generic Hook)   │  │System           │  │Validation    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Single Responsibility**: Each hook has one clear purpose
2. **Composition over Inheritance**: Controllers compose simpler hooks
3. **Shared Infrastructure**: Common utilities eliminate duplication
4. **Type Safety**: Full TypeScript coverage with generic types
5. **Memory Efficiency**: Optimized memoization and cleanup

## Components and Interfaces

### Generic Store Data Hook

```typescript
// Replaces 4 duplicated hooks with single generic implementation
interface UseStoreDataConfig<T> {
  dataType: 'vehicles' | 'stations' | 'routes' | 'stopTimes';
  agencyId?: string;
  filters?: Record<string, any>;
  cacheMaxAge?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface StoreDataResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

function useStoreData<T>(config: UseStoreDataConfig<T>): StoreDataResult<T>
```

### Unified Cache System

```typescript
interface UnifiedCacheConfig {
  maxSize: number;
  defaultTTL: number;
  memoryPressureThreshold: number;
}

class UnifiedCacheManager {
  // Replaces 3 separate cache systems
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  invalidate(pattern: string | RegExp): void;
  getStats(): CacheStats;
  cleanup(): void;
}
```

### Standardized Error Handling

```typescript
enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication', 
  VALIDATION = 'validation',
  CONFIGURATION = 'configuration',
  CACHE = 'cache'
}

interface StandardError {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  context: Record<string, any>;
}

class ErrorHandler {
  static createError(type: ErrorType, message: string, context?: any): StandardError;
  static getUserMessage(error: StandardError): string;
  static shouldRetry(error: StandardError, retryCount: number): boolean;
}
```

### Input Validation Library

```typescript
interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
}

class InputValidator {
  static validateArray<T>(input: unknown, itemValidator: (item: any) => boolean): ValidationResult<T[]>;
  static validateVehicleArray(vehicles: unknown): ValidationResult<LiveVehicle[]>;
  static validateStationArray(stations: unknown): ValidationResult<Station[]>;
  static validateCoordinates(coords: unknown): ValidationResult<Coordinates>;
  static createSafeDefaults<T>(type: string): T;
}
```

## Data Models

### Generic Store Data Configuration

```typescript
type DataTypeMap = {
  vehicles: LiveVehicle;
  stations: Station;
  routes: Route;
  stopTimes: StopTime;
};

type StoreMethodMap = {
  vehicles: 'getVehicleData';
  stations: 'getStationData';
  routes: 'getRouteData';
  stopTimes: 'getStopTimesData';
};
```

### Simplified Controller Configuration

```typescript
interface VehicleDisplayConfig {
  filterByFavorites?: boolean;
  maxStations?: number;
  maxVehiclesPerStation?: number;
  maxSearchRadius?: number;
  proximityThreshold?: number;
}

interface ControllerResult<T> {
  data: T;
  isLoading: boolean;
  error: StandardError | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Generic Hook Consistency
*For any* data type configuration, the generic useStoreData hook should return consistent results with the same loading, error, and data patterns regardless of the specific data type being requested
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Cache Unification Correctness  
*For any* cache operation, the unified cache system should provide consistent behavior that eliminates conflicts between the previous 3 separate cache implementations
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Error Handling Standardization
*For any* error scenario, the standardized error handling should produce consistent error types and user messages across all hooks without complex error class hierarchies
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Validation Consolidation
*For any* input validation scenario, the shared validation library should provide consistent validation results that eliminate the 300+ lines of duplicated validation code
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 5: Memory Optimization Effectiveness
*For any* hook usage pattern, the memory optimization should prevent memory leaks and reduce memory footprint compared to the current duplicated implementation
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 6: Performance Improvement Guarantee
*For any* application usage scenario, the refactored architecture should demonstrate measurable performance improvements in bundle size, memory usage, and render performance
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 7: Interface Consistency
*For any* hook in the system, the interface patterns should follow consistent conventions for options, results, and error handling
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 8: Architecture Boundary Enforcement
*For any* layer in the hook architecture, the dependencies should flow in one direction with clear separation of concerns
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

## Error Handling

### Standardized Error Types

```typescript
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: 'Unable to connect to transit service',
  [ErrorType.AUTHENTICATION]: 'Invalid API key or authentication failed',
  [ErrorType.VALIDATION]: 'Invalid data format received',
  [ErrorType.CONFIGURATION]: 'Configuration error - check settings',
  [ErrorType.CACHE]: 'Cache operation failed'
};

const RETRY_STRATEGIES = {
  [ErrorType.NETWORK]: { maxRetries: 3, backoff: 'exponential' },
  [ErrorType.AUTHENTICATION]: { maxRetries: 1, backoff: 'none' },
  [ErrorType.VALIDATION]: { maxRetries: 0, backoff: 'none' },
  [ErrorType.CONFIGURATION]: { maxRetries: 1, backoff: 'none' },
  [ErrorType.CACHE]: { maxRetries: 2, backoff: 'linear' }
};
```

### Error Boundary Integration

```typescript
interface ErrorBoundaryProps {
  fallback: (error: StandardError) => React.ReactNode;
  onError?: (error: StandardError) => void;
}

const HookErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback, onError }) => {
  // Standardized error boundary for hook errors
};
```

## Testing Strategy

### Unit Testing Approach

**Unit tests will focus on:**
- Generic hook behavior with different data types
- Validation library functions with edge cases
- Error handling utilities with various error scenarios
- Cache operations with different TTL and invalidation patterns

**Property-based testing will verify:**
- Generic hook consistency across all data types
- Cache behavior under various load conditions
- Error handling with random error scenarios
- Memory optimization under stress conditions

### Integration Testing

**Integration tests will validate:**
- Controller hook composition with real store data
- End-to-end data flow from store to UI
- Error propagation through the hook layers
- Performance characteristics under realistic usage

### Test Configuration

- **Minimum 100 iterations** for each property-based test
- **Fast-check library** for property test generation
- **Vitest** for unit and integration testing
- **React Testing Library** for hook testing

Each property-based test will be tagged with:
```typescript
/**
 * **Feature: hook-architecture-consolidation, Property 1: Generic Hook Consistency**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */
```