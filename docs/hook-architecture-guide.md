# Hook Architecture Guide

## Overview

The Cluj Bus App uses a layered hook architecture that promotes separation of concerns, testability, and reusability. This guide explains the new hook system that replaced the original monolithic `useVehicleProcessing` hook.

## Architecture Layers

### 1. Data Layer Hooks

Data layer hooks handle API data fetching, caching, and error handling. Each hook focuses on a single data type.

#### `useStationData`

Fetches and caches station data from the Tranzy API.

```typescript
import { useStationData } from '../hooks/data/useStationData';

const MyComponent = () => {
  const { data: stations, isLoading, error, refetch } = useStationData({
    agencyId: '123',
    forceRefresh: false,
    cacheMaxAge: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) return <div>Loading stations...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {stations?.map(station => (
        <div key={station.id}>{station.name}</div>
      ))}
    </div>
  );
};
```

#### `useVehicleData`

Fetches and caches live vehicle data with automatic refresh capabilities.

```typescript
import { useVehicleData } from '../hooks/data/useVehicleData';

const VehicleTracker = () => {
  const { data: vehicles, isLoading, error } = useVehicleData({
    agencyId: '123',
    autoRefresh: true,
    refreshInterval: 30 * 1000, // 30 seconds
    cacheMaxAge: 30 * 1000
  });

  return (
    <div>
      <h2>Live Vehicles ({vehicles?.length || 0})</h2>
      {vehicles?.map(vehicle => (
        <div key={vehicle.id}>
          Route {vehicle.routeId} - {vehicle.label}
        </div>
      ))}
    </div>
  );
};
```

#### `useRouteData` & `useStopTimesData`

Similar patterns for routes and stop times data:

```typescript
import { useRouteData } from '../hooks/data/useRouteData';
import { useStopTimesData } from '../hooks/data/useStopTimesData';

const RouteSchedule = ({ routeId }: { routeId: string }) => {
  const { data: routes } = useRouteData({ agencyId: '123' });
  const { data: stopTimes } = useStopTimesData({ 
    agencyId: '123',
    tripId: 'trip_123'
  });

  // Use the data...
};
```

### 2. Processing Layer Hooks

Processing layer hooks contain pure business logic that transforms data without side effects.

#### `useVehicleFiltering`

Filters vehicles based on favorites and proximity criteria.

```typescript
import { useVehicleFiltering } from '../hooks/processing/useVehicleFiltering';

const FilteredVehicleList = ({ vehicles, userLocation }) => {
  const { filteredVehicles, filterStats } = useVehicleFiltering(vehicles, {
    filterByFavorites: true,
    favoriteRoutes: ['42', '24', '35'],
    maxSearchRadius: 5000,
    userLocation
  });

  return (
    <div>
      <p>Showing {filteredVehicles.length} of {filterStats.totalVehicles} vehicles</p>
      <p>Applied filters: {filterStats.appliedFilters.join(', ')}</p>
      {/* Render filtered vehicles */}
    </div>
  );
};
```

#### `useVehicleGrouping`

Groups vehicles by stations with distance calculations.

```typescript
import { useVehicleGrouping } from '../hooks/processing/useVehicleGrouping';

const StationGroups = ({ vehicles, stations, userLocation }) => {
  const { stationGroups, groupingStats } = useVehicleGrouping(
    vehicles,
    stations,
    userLocation,
    {
      maxStations: 3,
      maxVehiclesPerStation: 5,
      proximityThreshold: 200
    }
  );

  return (
    <div>
      {stationGroups.map(group => (
        <div key={group.station.station.id}>
          <h3>{group.station.station.name}</h3>
          <p>Distance: {Math.round(group.station.distance)}m</p>
          <p>Vehicles: {group.vehicles.length}</p>
          <p>Routes: {group.allRoutes.map(r => r.routeName).join(', ')}</p>
        </div>
      ))}
    </div>
  );
};
```

#### `useDirectionAnalysis` & `useProximityCalculation`

Specialized processing hooks for direction analysis and distance calculations:

```typescript
import { useDirectionAnalysis } from '../hooks/processing/useDirectionAnalysis';
import { useProximityCalculation } from '../hooks/processing/useProximityCalculation';

const VehicleDetails = ({ vehicle, station, stopTimes }) => {
  const directionResult = useDirectionAnalysis(vehicle, station, stopTimes);
  const proximityResult = useProximityCalculation(
    vehicle.position,
    station.coordinates,
    1000 // 1km radius
  );

  return (
    <div>
      <p>Direction: {directionResult.direction}</p>
      <p>ETA: {directionResult.estimatedMinutes} minutes</p>
      <p>Confidence: {directionResult.confidence}</p>
      <p>Distance: {Math.round(proximityResult.distance)}m</p>
      <p>Within radius: {proximityResult.withinRadius ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### 3. Orchestration Layer Hook

The orchestration layer coordinates all sub-hooks while maintaining backward compatibility.

#### `useVehicleProcessing`

The main hook that provides the complete vehicle processing pipeline:

```typescript
import { useVehicleProcessing } from '../hooks/useVehicleProcessing';

const BusTracker = () => {
  const {
    stationVehicleGroups,
    isLoading,
    isLoadingStations,
    isLoadingVehicles,
    isProcessingVehicles,
    effectiveLocationForDisplay,
    favoriteRoutes,
    allStations,
    vehicles,
    error
  } = useVehicleProcessing({
    filterByFavorites: true,
    maxStations: 2,
    maxVehiclesPerStation: 5,
    showAllVehiclesPerRoute: false,
    maxSearchRadius: 5000,
    proximityThreshold: 200
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Nearby Stations</h2>
      {stationVehicleGroups.map(group => (
        <div key={group.station.station.id}>
          <h3>{group.station.station.name}</h3>
          <p>Distance: {Math.round(group.station.distance)}m</p>
          
          <h4>Vehicles:</h4>
          {group.vehicles.map(vehicle => (
            <div key={vehicle.id}>
              <p>Route {vehicle.route} - {vehicle.destination}</p>
              <p>Arriving in {vehicle.minutesAway} minutes</p>
              <p>Confidence: {vehicle.confidence}</p>
            </div>
          ))}
          
          <h4>All Routes at Station:</h4>
          {group.allRoutes.map(route => (
            <span key={route.routeId}>
              {route.routeName} ({route.vehicleCount})
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Migration Guide

### From Old useVehicleProcessing

The new `useVehicleProcessing` maintains exact API compatibility:

```typescript
// Old usage (still works)
const result = useVehicleProcessing({
  filterByFavorites: true,
  maxStations: 2
});

// New usage (same API)
const result = useVehicleProcessing({
  filterByFavorites: true,
  maxStations: 2
});
```

### Using Individual Hooks

For new components, consider using focused hooks:

```typescript
// Instead of the full orchestration hook
const MyComponent = () => {
  // Use only what you need
  const { data: stations } = useStationData({ agencyId: '123' });
  const { data: vehicles } = useVehicleData({ agencyId: '123' });
  
  const { filteredVehicles } = useVehicleFiltering(vehicles, {
    filterByFavorites: true,
    favoriteRoutes: ['42']
  });

  // Process only the data you need
  return <div>{/* Render filtered vehicles */}</div>;
};
```

### Migration with Feature Flags

Use the migration hooks for gradual rollout:

```typescript
import { 
  useVehicleProcessingMigrated,
  useVehicleProcessingMigrationStatus 
} from '../hooks/useVehicleProcessingMigrated';

const MyComponent = () => {
  // Automatically switches between old and new implementations
  const result = useVehicleProcessingMigrated({
    filterByFavorites: true
  }, 'MyComponent');

  // Monitor migration status
  const migrationStatus = useVehicleProcessingMigrationStatus('MyComponent');
  
  return (
    <div>
      {/* Your component */}
      {process.env.NODE_ENV === 'development' && (
        <div>Migration Status: {migrationStatus.isEnabled ? 'New' : 'Old'}</div>
      )}
    </div>
  );
};
```

## Best Practices

### 1. Use Focused Hooks When Possible

```typescript
// Good: Use only what you need
const StationList = () => {
  const { data: stations, isLoading } = useStationData({ agencyId: '123' });
  // ...
};

// Avoid: Using orchestration hook for simple data needs
const StationList = () => {
  const { allStations, isLoading } = useVehicleProcessing();
  // ...
};
```

### 2. Handle Loading States Appropriately

```typescript
const MyComponent = () => {
  const { data, isLoading, error } = useStationData({ agencyId: '123' });

  // Handle all states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return <DataDisplay data={data} />;
};
```

### 3. Optimize Cache Settings

```typescript
// For frequently changing data (vehicles)
const { data: vehicles } = useVehicleData({
  agencyId: '123',
  cacheMaxAge: 30 * 1000, // 30 seconds
  autoRefresh: true,
  refreshInterval: 30 * 1000
});

// For stable data (stations, routes)
const { data: stations } = useStationData({
  agencyId: '123',
  cacheMaxAge: 5 * 60 * 1000 // 5 minutes
});
```

### 4. Error Handling

```typescript
const MyComponent = () => {
  const { data, error, refetch } = useStationData({ agencyId: '123' });

  if (error) {
    return (
      <div>
        <p>Failed to load stations: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  // ...
};
```

## Testing

### Unit Testing Data Hooks

```typescript
import { renderHook } from '@testing-library/react';
import { useStationData } from '../useStationData';

describe('useStationData', () => {
  it('should fetch and cache station data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useStationData({ agencyId: '123' })
    );

    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
```

### Testing Processing Hooks

```typescript
import { renderHook } from '@testing-library/react';
import { useVehicleFiltering } from '../useVehicleFiltering';

describe('useVehicleFiltering', () => {
  it('should filter vehicles by favorites', () => {
    const vehicles = [
      { id: '1', routeId: '42' },
      { id: '2', routeId: '24' }
    ];

    const { result } = renderHook(() =>
      useVehicleFiltering(vehicles, {
        filterByFavorites: true,
        favoriteRoutes: ['42']
      })
    );

    expect(result.current.filteredVehicles).toHaveLength(1);
    expect(result.current.filteredVehicles[0].routeId).toBe('42');
  });
});
```

### Property-Based Testing

```typescript
import * as fc from 'fast-check';
import { useVehicleFiltering } from '../useVehicleFiltering';

describe('useVehicleFiltering Properties', () => {
  it('should maintain vehicle count consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.string(), routeId: fc.string() })),
      fc.array(fc.string()),
      (vehicles, favoriteRoutes) => {
        const { filteredVehicles, filterStats } = useVehicleFiltering(vehicles, {
          filterByFavorites: true,
          favoriteRoutes
        });

        // Property: filtered count should never exceed total count
        expect(filteredVehicles.length).toBeLessThanOrEqual(vehicles.length);
        expect(filterStats.filteredCount).toBe(filteredVehicles.length);
        expect(filterStats.totalVehicles).toBe(vehicles.length);
      }
    ));
  });
});
```

## Performance Considerations

### 1. Selective Re-execution

The new architecture only re-executes affected parts when dependencies change:

```typescript
// Only vehicle filtering re-runs when vehicles change
const { filteredVehicles } = useVehicleFiltering(vehicles, options);

// Only grouping re-runs when filtered vehicles or stations change
const { stationGroups } = useVehicleGrouping(filteredVehicles, stations, location);
```

### 2. Caching Strategy

- **Stations/Routes**: Long cache (5-10 minutes)
- **Vehicles**: Short cache (30 seconds) with auto-refresh
- **Stop Times**: Medium cache (2 minutes)

### 3. Memory Management

The hooks automatically clean up subscriptions and prevent memory leaks:

```typescript
// Automatic cleanup on unmount
useEffect(() => {
  return () => {
    // All subscriptions, timers, and abort controllers are cleaned up
  };
}, []);
```

## Troubleshooting

### Common Issues

1. **Infinite Re-renders**: Check that you're not passing unstable objects as dependencies
2. **Stale Data**: Verify cache settings and refresh intervals
3. **Memory Leaks**: Ensure components unmount properly and don't hold references

### Debug Mode

Enable debug logging in development:

```typescript
// Set in your environment
process.env.REACT_APP_DEBUG_HOOKS = 'true';

// Or use the performance monitor
import { usePerformanceMonitor } from '../hooks/shared/dependencyTracker';

const MyComponent = () => {
  const performanceMonitor = usePerformanceMonitor('MyComponent');
  
  // Monitor will log performance metrics
};
```

This architecture provides a solid foundation for building scalable, testable, and maintainable React applications with complex data processing needs.