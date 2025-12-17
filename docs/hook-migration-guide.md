# Hook Migration Guide

This guide provides best practices and patterns for developing new hooks and migrating existing ones in the Cluj Bus App.

## Migration Principles

### 1. Single Responsibility Principle

Each hook should have one clear responsibility:

```typescript
// ❌ Bad: Multiple responsibilities
const useEverything = () => {
  // Fetches data
  // Processes data  
  // Manages UI state
  // Handles errors
  // Caches results
};

// ✅ Good: Single responsibility
const useStationData = () => {
  // Only fetches and caches station data
};

const useVehicleFiltering = (vehicles, options) => {
  // Only filters vehicles based on criteria
};
```

### 2. Composability Over Complexity

Build complex functionality by composing simple hooks:

```typescript
// ❌ Bad: One complex hook
const useComplexVehicleProcessing = () => {
  // 500+ lines of mixed concerns
};

// ✅ Good: Composed from focused hooks
const useVehicleProcessing = () => {
  const { data: stations } = useStationData();
  const { data: vehicles } = useVehicleData();
  const { filteredVehicles } = useVehicleFiltering(vehicles, options);
  const { stationGroups } = useVehicleGrouping(filteredVehicles, stations);
  
  return { stationGroups };
};
```

### 3. Predictable APIs

Maintain consistent interfaces across similar hooks:

```typescript
// ✅ Consistent data hook pattern
interface DataHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

const useStationData = (options): DataHookResult<Station[]> => { /* */ };
const useVehicleData = (options): DataHookResult<Vehicle[]> => { /* */ };
const useRouteData = (options): DataHookResult<Route[]> => { /* */ };
```

## Migration Patterns

### Pattern 1: Extract Data Fetching

When migrating a complex hook, first extract data fetching logic:

```typescript
// Before: Mixed data fetching and processing
const useComplexHook = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsLoading(true);
    fetchData().then(result => {
      // Complex processing logic here
      const processed = processData(result);
      setData(processed);
      setIsLoading(false);
    });
  }, []);
  
  return { data, isLoading };
};

// After: Separated concerns
const useDataFetching = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => { refetch(); }, [refetch]);
  
  return { data, isLoading, refetch };
};

const useDataProcessing = (rawData) => {
  return useMemo(() => {
    if (!rawData) return null;
    return processData(rawData);
  }, [rawData]);
};

const useComplexHook = () => {
  const { data: rawData, isLoading } = useDataFetching();
  const processedData = useDataProcessing(rawData);
  
  return { data: processedData, isLoading };
};
```

### Pattern 2: Extract Processing Logic

Move business logic into pure processing hooks:

```typescript
// Before: Processing mixed with data fetching
const useVehicleHook = () => {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    fetchVehicles().then(data => {
      // Inline filtering logic
      const filtered = data.filter(v => 
        favoriteRoutes.includes(v.routeId) &&
        calculateDistance(userLocation, v.position) < maxRadius
      );
      
      // Inline grouping logic
      const grouped = groupByStation(filtered, stations);
      
      setVehicles(grouped);
    });
  }, [favoriteRoutes, userLocation, maxRadius, stations]);
  
  return vehicles;
};

// After: Extracted processing hooks
const useVehicleFiltering = (vehicles, options) => {
  return useMemo(() => {
    if (!vehicles?.length) return [];
    
    return vehicles.filter(vehicle => {
      if (options.filterByFavorites) {
        return options.favoriteRoutes.includes(vehicle.routeId);
      }
      
      if (options.userLocation && options.maxRadius) {
        const distance = calculateDistance(options.userLocation, vehicle.position);
        return distance <= options.maxRadius;
      }
      
      return true;
    });
  }, [vehicles, options]);
};

const useVehicleGrouping = (vehicles, stations) => {
  return useMemo(() => {
    if (!vehicles?.length || !stations?.length) return [];
    return groupByStation(vehicles, stations);
  }, [vehicles, stations]);
};

const useVehicleHook = () => {
  const { data: vehicles } = useVehicleData();
  const filteredVehicles = useVehicleFiltering(vehicles, options);
  const groupedVehicles = useVehicleGrouping(filteredVehicles, stations);
  
  return groupedVehicles;
};
```

### Pattern 3: Add Caching Layer

Implement consistent caching across data hooks:

```typescript
// Before: No caching
const useApiData = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchFromApi().then(setData);
  }, []);
  
  return data;
};

// After: With caching
const useApiData = (options = {}) => {
  const { 
    cacheMaxAge = 5 * 60 * 1000, // 5 minutes default
    forceRefresh = false 
  } = options;
  
  const cacheKey = `api-data-${JSON.stringify(options)}`;
  
  const [data, setData] = useState(() => {
    if (forceRefresh) return null;
    return getCachedData(cacheKey, cacheMaxAge);
  });
  
  const [isLoading, setIsLoading] = useState(!data);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFromApi();
      setData(result);
      setCachedData(cacheKey, result);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey]);
  
  useEffect(() => {
    if (!data || forceRefresh) {
      fetchData();
    }
  }, [data, forceRefresh, fetchData]);
  
  return { 
    data, 
    isLoading, 
    lastUpdated,
    refetch: fetchData 
  };
};
```

## Step-by-Step Migration Process

### Step 1: Analyze Current Hook

Document the current hook's responsibilities:

```typescript
// Analysis of useComplexHook
const responsibilities = [
  'Fetch station data from API',           // → useStationData
  'Fetch vehicle data from API',           // → useVehicleData  
  'Filter vehicles by favorites',          // → useVehicleFiltering
  'Group vehicles by stations',            // → useVehicleGrouping
  'Calculate distances',                   // → useProximityCalculation
  'Manage loading states',                 // → Individual hooks
  'Handle errors',                         // → Individual hooks
  'Cache API responses',                   // → Shared caching layer
  'Coordinate all operations'              // → New orchestration hook
];
```

### Step 2: Create Focused Hooks

Start with data layer hooks:

```typescript
// 1. Create data hooks first
export const useStationData = (options) => {
  // Implementation focused only on station data
};

export const useVehicleData = (options) => {
  // Implementation focused only on vehicle data
};
```

### Step 3: Extract Processing Logic

Create processing hooks:

```typescript
// 2. Create processing hooks
export const useVehicleFiltering = (vehicles, options) => {
  // Pure function - no side effects
  return useMemo(() => {
    // Filtering logic only
  }, [vehicles, options]);
};

export const useVehicleGrouping = (vehicles, stations, options) => {
  // Pure function - no side effects
  return useMemo(() => {
    // Grouping logic only
  }, [vehicles, stations, options]);
};
```

### Step 4: Create Orchestration Hook

Combine focused hooks:

```typescript
// 3. Create orchestration hook
export const useVehicleProcessing = (options) => {
  // Coordinate all sub-hooks
  const { data: stations } = useStationData({ agencyId: options.agencyId });
  const { data: vehicles } = useVehicleData({ agencyId: options.agencyId });
  
  const { filteredVehicles } = useVehicleFiltering(vehicles, {
    filterByFavorites: options.filterByFavorites,
    favoriteRoutes: options.favoriteRoutes
  });
  
  const { stationGroups } = useVehicleGrouping(
    filteredVehicles, 
    stations, 
    options
  );
  
  // Maintain backward compatibility
  return {
    stationVehicleGroups: stationGroups,
    isLoading: isLoadingStations || isLoadingVehicles,
    // ... other properties for compatibility
  };
};
```

### Step 5: Add Migration Support

Create migration wrapper:

```typescript
// 4. Create migration wrapper
export const useVehicleProcessingMigrated = (options, componentName) => {
  const isNewImplementationEnabled = useFeatureFlag(
    `new-vehicle-processing-${componentName}`
  );
  
  if (isNewImplementationEnabled) {
    return useVehicleProcessingNew(options);
  } else {
    return useVehicleProcessingOld(options);
  }
};
```

### Step 6: Update Components Gradually

Migrate components one by one:

```typescript
// Before
const MyComponent = () => {
  const result = useVehicleProcessing(options);
  // ...
};

// After (with migration support)
const MyComponent = () => {
  const result = useVehicleProcessingMigrated(options, 'MyComponent');
  // Same API, different implementation
};
```

### Step 7: Test and Validate

Ensure compatibility:

```typescript
// Compatibility tests
describe('Migration Compatibility', () => {
  it('should return identical results', () => {
    const oldResult = useVehicleProcessingOld(options);
    const newResult = useVehicleProcessingNew(options);
    
    expect(newResult).toEqual(oldResult);
  });
});
```

### Step 8: Remove Old Implementation

After successful migration:

```typescript
// Archive old implementation
// src/hooks/archive/useVehicleProcessing.legacy.ts

// Update main export
export { useVehicleProcessing } from './useVehicleProcessingOrchestration';
```

## Common Migration Challenges

### Challenge 1: Circular Dependencies

**Problem**: Hooks depend on each other in circular ways.

**Solution**: Identify the dependency direction and break cycles:

```typescript
// ❌ Circular dependency
const useHookA = () => {
  const { data } = useHookB();
  // ...
};

const useHookB = () => {
  const { result } = useHookA();
  // ...
};

// ✅ Clear dependency direction
const useDataHook = () => {
  // Base data, no dependencies
};

const useProcessingHook = (data) => {
  // Depends only on data, not other hooks
};

const useOrchestrationHook = () => {
  const data = useDataHook();
  const result = useProcessingHook(data);
  return result;
};
```

### Challenge 2: Shared State

**Problem**: Multiple hooks need to share state.

**Solution**: Use a shared store or context:

```typescript
// ❌ Duplicated state
const useHookA = () => {
  const [sharedData, setSharedData] = useState(null);
  // ...
};

const useHookB = () => {
  const [sharedData, setSharedData] = useState(null); // Duplicate!
  // ...
};

// ✅ Shared store
const useSharedStore = () => {
  // Centralized state management
};

const useHookA = () => {
  const { sharedData } = useSharedStore();
  // ...
};

const useHookB = () => {
  const { sharedData } = useSharedStore();
  // ...
};
```

### Challenge 3: Performance Issues

**Problem**: Too many re-renders or expensive calculations.

**Solution**: Use memoization and selective updates:

```typescript
// ❌ Expensive recalculation on every render
const useExpensiveHook = (data, options) => {
  const result = expensiveCalculation(data, options);
  return result;
};

// ✅ Memoized calculation
const useExpensiveHook = (data, options) => {
  const result = useMemo(() => {
    return expensiveCalculation(data, options);
  }, [data, options]);
  
  return result;
};

// ✅ Selective memoization with custom equality
const useExpensiveHook = (data, options) => {
  const result = useMemo(() => {
    return expensiveCalculation(data, options);
  }, [
    data?.length, // Only re-run if length changes
    options.filterByFavorites,
    options.maxRadius
    // Don't include the entire objects
  ]);
  
  return result;
};
```

## Testing Migration

### Unit Tests for Individual Hooks

```typescript
describe('useVehicleFiltering', () => {
  it('should filter vehicles correctly', () => {
    const vehicles = [/* test data */];
    const options = { filterByFavorites: true, favoriteRoutes: ['42'] };
    
    const { result } = renderHook(() => useVehicleFiltering(vehicles, options));
    
    expect(result.current.filteredVehicles).toHaveLength(1);
  });
});
```

### Integration Tests for Orchestration

```typescript
describe('useVehicleProcessing Integration', () => {
  it('should coordinate all sub-hooks correctly', () => {
    const { result } = renderHook(() => useVehicleProcessing(options));
    
    expect(result.current.stationVehicleGroups).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Compatibility Tests

```typescript
describe('Migration Compatibility', () => {
  it('should maintain API compatibility', () => {
    const options = { filterByFavorites: true };
    
    const oldResult = renderHook(() => useVehicleProcessingOld(options));
    const newResult = renderHook(() => useVehicleProcessingNew(options));
    
    // Compare structure and data
    expect(Object.keys(newResult.result.current))
      .toEqual(Object.keys(oldResult.result.current));
  });
});
```

## Best Practices Summary

1. **Start Small**: Begin with the simplest hooks and build up complexity
2. **Test Early**: Write tests for each hook as you create it
3. **Maintain Compatibility**: Keep the same API during migration
4. **Document Changes**: Update documentation as you migrate
5. **Monitor Performance**: Ensure new hooks don't degrade performance
6. **Use Feature Flags**: Enable gradual rollout and easy rollback
7. **Clean Up**: Remove old code only after successful migration

This migration approach ensures a smooth transition while maintaining system stability and improving code quality.