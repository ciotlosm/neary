# API Documentation

## Overview

This directory contains comprehensive API documentation for the Cluj Bus App's new vehicle data architecture. The documentation covers the unified transformation service, performance characteristics, and integration patterns.

## Architecture Documentation

### [Vehicle Transformation Service](vehicle-transformation-service.md)

The core component of the new vehicle data architecture, providing:

- **Unified Transformation Pipeline**: Single entry point for all vehicle data transformations
- **Performance Optimization**: Built-in caching, efficient data structures, and lazy evaluation
- **Error Resilience**: Comprehensive error handling with graceful degradation
- **Type Safety**: Full TypeScript support with strict type checking

**Key Features:**
- Transform raw Tranzy API responses into UI-ready data structures
- Eliminate type system fragmentation across the codebase
- Provide comprehensive performance monitoring and optimization
- Support for concurrent transformations with intelligent caching

## Performance Benchmarks

### Benchmark Results

The new architecture has been thoroughly benchmarked to ensure optimal performance:

| Dataset Size | Average Time | Memory Usage | Cache Hit Rate |
|--------------|--------------|--------------|----------------|
| 10 vehicles  | <50ms        | <5MB         | 85%+           |
| 100 vehicles | <200ms       | <15MB        | 80%+           |
| 500 vehicles | <1000ms      | <50MB        | 75%+           |

### Running Benchmarks

To run performance benchmarks for the vehicle transformation service:

```bash
# Run benchmark with default settings
npm run benchmark:transformation

# Run benchmark with custom output
npm run benchmark:transformation -- --output=custom-results.json --report=custom-report.txt
```

**Benchmark Features:**
- Multiple iterations for statistical significance
- Memory usage tracking and optimization detection
- Cache effectiveness measurement
- Performance regression detection
- Comprehensive reporting with recommendations

## API Reference

### Core Interfaces

#### VehicleTransformationService

```typescript
class VehicleTransformationService {
  // Main transformation method
  async transform(
    rawData: TranzyVehicleResponse[],
    context: TransformationContext
  ): Promise<TransformedVehicleData>
  
  // Performance monitoring
  getPerformanceStats(): PerformanceStats
  
  // Cache management
  clearCache(): void
}
```

#### Data Types

**Input Types:**
- `TranzyVehicleResponse[]` - Raw vehicle data from Tranzy API
- `TransformationContext` - User preferences and location context

**Output Types:**
- `TransformedVehicleData` - Complete transformed data with all layers
- `CoreVehicle[]` - Normalized vehicle data
- `VehicleSchedule` - Timing and arrival information
- `VehicleDisplayData` - UI-ready presentation data

### Integration Patterns

#### React Hook Integration

```typescript
import { useVehicleTransformation } from '@/hooks/useVehicleTransformation';

const { transform, clearCache, getStats, isLoading, error } = useVehicleTransformation();

// Transform data
const result = await transform(apiData, context);

// Monitor performance
const stats = getStats();
console.log(`Cache hit rate: ${stats.cache.hitRate * 100}%`);
```

#### Service Integration

```typescript
import { VehicleTransformationService } from '@/services/VehicleTransformationService';

const transformationService = new VehicleTransformationService();

// Process vehicle data
const processVehicles = async (apiResponse, userContext) => {
  try {
    const transformed = await transformationService.transform(apiResponse, userContext);
    return transformed;
  } catch (error) {
    // Handle transformation errors
    console.error('Transformation failed:', error);
    throw error;
  }
};
```

## Performance Optimization

### Caching Strategy

The transformation service implements intelligent caching:

- **TTL-based caching**: Results cached with configurable time-to-live
- **Memory pressure detection**: Automatic cleanup when memory usage is high
- **Cache key optimization**: Efficient key generation for fast lookups
- **Hit rate monitoring**: Real-time cache performance tracking

### Memory Management

- **Efficient data structures**: Map-based lookups for O(1) performance
- **Lazy evaluation**: Expensive calculations performed only when needed
- **Memory pooling**: Reuse of data structures to minimize allocations
- **Automatic cleanup**: Periodic cache cleanup to prevent memory leaks

### Error Handling

- **Input validation**: Comprehensive validation with fallback values
- **Graceful degradation**: Continue processing with partial data when possible
- **Retry logic**: Exponential backoff for transient failures
- **Error reporting**: Detailed error context for debugging

## Testing

### Unit Tests

```typescript
import { VehicleTransformationService } from '@/services/VehicleTransformationService';

describe('VehicleTransformationService', () => {
  it('should transform valid vehicle data', async () => {
    const service = new VehicleTransformationService();
    const result = await service.transform(mockData, mockContext);
    
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].id).toBe('test_vehicle');
  });
});
```

### Performance Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Performance Benchmarks', () => {
  it('should handle large datasets efficiently', async () => {
    const service = new VehicleTransformationService();
    const largeDataset = generateMockVehicles(1000);
    
    const startTime = performance.now();
    const result = await service.transform(largeDataset, context);
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(2000); // Under 2 seconds
    expect(result.vehicles).toHaveLength(1000);
  });
});
```

## Migration Guide

### From Legacy Architecture

When migrating from the old vehicle data architecture:

1. **Replace direct API calls** with VehicleTransformationService
2. **Update type imports** to use new unified types
3. **Remove duplicate transformation logic** from components
4. **Update error handling** to use new error types

#### Before (Legacy)

```typescript
// Old approach with duplicate logic
const processVehicles = async (apiData: any[]) => {
  const vehicles = apiData.map(item => ({
    id: item.vehicle_id,
    route: item.route_short_name,
    // ... manual transformation
  }));
  
  return vehicles.filter(v => v.id && v.route);
};
```

#### After (New Architecture)

```typescript
// New approach with unified service
const transformationService = new VehicleTransformationService();

const processVehicles = async (apiData: TranzyVehicleResponse[], context: TransformationContext) => {
  const result = await transformationService.transform(apiData, context);
  return result.vehicles;
};
```

## Best Practices

### Performance Optimization

1. **Reuse service instances**: Create one service instance per application lifecycle
2. **Monitor cache performance**: Regularly check cache hit rates and adjust TTL
3. **Use appropriate context**: Provide complete transformation context for best results
4. **Handle errors gracefully**: Implement proper error boundaries and fallbacks

### Memory Management

1. **Clear cache periodically**: Use `clearCache()` during low-usage periods
2. **Monitor memory usage**: Track performance stats to detect memory leaks
3. **Limit concurrent transformations**: Avoid overwhelming the system with parallel requests

### Error Handling

1. **Check error recoverability**: Use `error.recoverable` to determine retry strategy
2. **Log transformation context**: Include context in error reports for debugging
3. **Implement circuit breakers**: Prevent cascade failures in high-error scenarios

## Troubleshooting

### Common Issues

#### High Memory Usage
- **Symptoms**: Increasing memory consumption over time
- **Solutions**: Call `clearCache()` periodically, monitor memory stats

#### Poor Cache Performance
- **Symptoms**: Low cache hit rate, slow transformation times
- **Solutions**: Stabilize transformation context, increase cache TTL

#### Transformation Errors
- **Symptoms**: Frequent TransformationError exceptions
- **Solutions**: Validate API responses, implement retry logic, provide fallback values

## Support

For additional support and documentation:

- **Developer Guide**: [../developer-guide.md](../developer-guide.md)
- **Troubleshooting**: [../troubleshooting/](../troubleshooting/)
- **Performance Analysis**: [../performance/](../performance/)

## Changelog

### Version 1.0.0 (Current)

- Initial release of VehicleTransformationService API documentation
- Complete transformation pipeline documentation
- Performance benchmark documentation
- Integration patterns and best practices
- Comprehensive troubleshooting guide