# Design Document

## Architecture Overview

The store consolidation will transform the current fragmented 10+ store architecture into a clean 3-store system with clear separation of concerns, event-based communication, and unified patterns. The new architecture emphasizes simplicity, single responsibility, and performance optimization with no legacy compatibility concerns.

## Current State Analysis

### Existing Stores (Problems Identified)
```
src/stores/
├── appStore.ts          ❌ Remove - merge into configStore
├── configStore.ts       ❌ Remove - merge into new configStore
├── busStore.ts          ❌ Remove - merge into vehicleStore
├── busDataStore.ts      ❌ Remove - merge into vehicleStore
├── enhancedBusStore.ts  ❌ Remove - merge into vehicleStore
├── favoriteBusStore.ts  ❌ Remove - replace with simple favoritesStore
├── directionStore.ts    ❌ Remove - not used in UI
├── locationStore.ts     ✅ Keep as-is (well-designed)
├── agencyStore.ts       ❌ Remove - merge into configStore
├── offlineStore.ts      ❌ Remove - integrate into vehicleStore
└── themeStore.ts        ❌ Remove - merge into configStore
```

### Issues to Resolve
1. **Store Fragmentation**: 3 stores handling vehicle data with duplicate logic
2. **Configuration Scatter**: Config spread across appStore, configStore, agencyStore, themeStore  
3. **Direct Dependencies**: Stores calling other stores directly (tight coupling)
4. **Inconsistent Patterns**: Different error handling, auto-refresh, and caching approaches
5. **Unnecessary Complexity**: Too many stores for simple functionality

### Stores to Keep
- **LocationStore**: Well-designed geolocation management (keep as-is)

## Target Architecture

### New Store Structure
```
src/stores/
├── configStore.ts          # Unified config + theme + agencies + favorites
├── vehicleStore.ts         # Unified vehicle data management  
├── locationStore.ts        # GPS and geolocation (keep existing)
├── shared/
│   ├── storeEvents.ts      # Event-based communication
│   ├── autoRefresh.ts      # Unified auto-refresh manager
│   ├── errorHandler.ts     # Standardized error handling
│   └── cacheManager.ts     # Unified cache management
└── index.ts                # Clean exports (3 stores only)
```

## Detailed Design

### 1. Unified Configuration Store

**File**: `src/stores/configStore.ts`

```typescript
interface ConfigStore {
  // Configuration
  config: UserConfig | null;
  isConfigured: boolean;
  isFullyConfigured: boolean;
  
  // Theme (moved from themeStore)
  theme: ThemeMode;
  
  // Agencies (moved from agencyStore)
  agencies: Agency[];
  isAgenciesLoading: boolean;
  agenciesError: ErrorState | null;
  isApiValidated: boolean;
  
  // Actions - Configuration
  updateConfig: (updates: Partial<UserConfig>) => void;
  resetConfig: () => void;
  validateConfig: () => boolean;
  
  // Actions - Theme
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Actions - Agencies
  fetchAgencies: () => Promise<void>;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  clearAgenciesError: () => void;
  
  // Actions - Favorites (integrated from removed FavoritesStore)
  addFavoriteRoute: (route: FavoriteRoute) => void;
  removeFavoriteRoute: (routeId: string) => void;
  addFavoriteStation: (stationId: string) => void;
  removeFavoriteStation: (stationId: string) => void;
  getFavoriteRoutes: () => FavoriteRoute[];
  getFavoriteStations: () => string[];
}
```

**Key Features**:
- Merges appStore + configStore + agencyStore + themeStore + favoritesStore
- Single source of truth for all configuration and user preferences
- Integrated favorites management (no separate store needed)
- Encrypted storage for sensitive data
- Event emission for configuration changes

### 2. Unified Vehicle Store

**File**: `src/stores/vehicleStore.ts`

```typescript
interface VehicleStore {
  // Unified Data
  vehicles: EnhancedVehicleInfo[];
  stations: Station[];
  
  // State Management
  isLoading: boolean;
  error: ErrorState | null;
  lastUpdate: Date | null;
  lastApiUpdate: Date | null;
  lastCacheUpdate: Date | null;
  
  // Cache Information
  cacheStats: CacheStats;
  
  // Actions - Data Management
  refreshVehicles: (options?: RefreshOptions) => Promise<void>;
  refreshStations: (forceRefresh?: boolean) => Promise<void>;
  refreshScheduleData: () => Promise<void>;
  refreshLiveData: () => Promise<void>;
  forceRefreshAll: () => Promise<void>;
  
  // Actions - Auto Refresh
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  manualRefresh: () => Promise<void>;
  
  // Actions - Cache Management
  getCacheStats: () => void;
  clearCache: () => void;
  clearError: () => void;
  
  // Helper Methods
  calculateDistance: (from: Coordinates, to: Coordinates) => number;
}

interface RefreshOptions {
  forceRefresh?: boolean;
  includeSchedule?: boolean;
  includeLive?: boolean;
  includeStations?: boolean;
}
```

**Key Features**:
- Merges busStore + busDataStore + enhancedBusStore + offlineStore
- Unified data model using EnhancedVehicleInfo
- Flexible refresh options for different data types
- Integrated cache and offline management

### 3. Event-Based Communication System

**File**: `src/stores/shared/storeEvents.ts`

```typescript
export enum StoreEvents {
  CONFIG_CHANGED = 'store:config:changed',
  VEHICLES_UPDATED = 'store:vehicles:updated',
  LOCATION_CHANGED = 'store:location:changed',
  THEME_CHANGED = 'store:theme:changed',
  API_KEY_VALIDATED = 'store:api:validated',
  CACHE_INVALIDATED = 'store:cache:invalidated',
}

export interface StoreEventData {
  [StoreEvents.CONFIG_CHANGED]: { config: UserConfig; changes: Partial<UserConfig> };
  [StoreEvents.VEHICLES_UPDATED]: { vehicles: EnhancedVehicleInfo[]; timestamp: Date };
  [StoreEvents.LOCATION_CHANGED]: { location: Coordinates; source: 'gps' | 'manual' };
  [StoreEvents.THEME_CHANGED]: { theme: ThemeMode; source: 'user' | 'system' };
  [StoreEvents.API_KEY_VALIDATED]: { isValid: boolean; agencies?: Agency[] };
  [StoreEvents.CACHE_INVALIDATED]: { cacheKeys: string[]; reason: string };
}

export class StoreEventManager {
  static emit<T extends StoreEvents>(event: T, data: StoreEventData[T]): void;
  static subscribe<T extends StoreEvents>(
    event: T, 
    handler: (data: StoreEventData[T]) => void
  ): () => void;
  static once<T extends StoreEvents>(
    event: T, 
    handler: (data: StoreEventData[T]) => void
  ): void;
}
```

### 4. Unified Auto-Refresh Manager

**File**: `src/stores/shared/autoRefresh.ts`

```typescript
export interface RefreshConfig {
  key: string;
  callback: () => Promise<void>;
  intervalMs: number;
  immediate?: boolean;
  onError?: (error: Error) => void;
}

export class AutoRefreshManager {
  private intervals = new Map<string, number>();
  private configs = new Map<string, RefreshConfig>();
  
  start(config: RefreshConfig): void;
  stop(key: string): void;
  restart(key: string): void;
  updateInterval(key: string, intervalMs: number): void;
  stopAll(): void;
  getStatus(key: string): { isRunning: boolean; nextRun?: Date };
  
  // Global pause/resume for app lifecycle
  pauseAll(): void;
  resumeAll(): void;
}

// Usage in stores:
const autoRefresh = new AutoRefreshManager();

// In vehicle store
autoRefresh.start({
  key: 'vehicles',
  callback: () => this.refreshVehicles(),
  intervalMs: config.refreshRate,
  onError: (error) => this.handleRefreshError(error)
});
```

### 5. Standardized Error Handler

**File**: `src/stores/shared/errorHandler.ts`

```typescript
export interface ErrorContext {
  storeName: string;
  operation: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class StoreErrorHandler {
  static createError(
    error: unknown, 
    context: ErrorContext
  ): ErrorState {
    const errorState: ErrorState = {
      type: this.classifyError(error),
      message: this.formatErrorMessage(error, context),
      timestamp: context.timestamp,
      retryable: this.isRetryable(error),
    };
    
    this.logError(errorState, context);
    return errorState;
  }
  
  private static classifyError(error: unknown): ErrorState['type'] {
    if (error instanceof NetworkError) return 'network';
    if (error instanceof AuthenticationError) return 'authentication';
    if (error instanceof ValidationError) return 'parsing';
    if (error instanceof NoDataError) return 'noData';
    return 'partial';
  }
  
  private static isRetryable(error: unknown): boolean {
    // Network errors are retryable, auth errors are not
    return !(error instanceof AuthenticationError);
  }
  
  static withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries = 3
  ): Promise<T> {
    return withRetry(operation, {
      maxRetries,
      baseDelay: 1000,
      maxDelay: 8000,
      onError: (error, attempt) => {
        logger.warn(`${context.storeName}: Retry ${attempt}/${maxRetries}`, {
          error: error.message,
          context
        });
      }
    });
  }
}

// Usage in stores:
try {
  const data = await StoreErrorHandler.withRetry(
    () => api.fetchVehicles(),
    { storeName: 'VehicleStore', operation: 'fetchVehicles', timestamp: new Date() }
  );
} catch (error) {
  const errorState = StoreErrorHandler.createError(error, {
    storeName: 'VehicleStore',
    operation: 'fetchVehicles',
    timestamp: new Date()
  });
  set({ error: errorState });
}
```

### 6. Unified Cache Manager

**File**: `src/stores/shared/cacheManager.ts`

```typescript
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  staleWhileRevalidate?: boolean; // Serve stale data while fetching fresh
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

export class UnifiedCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private subscribers = new Map<string, Set<(data: any) => void>>();
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T>;
  
  async getLive<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh?: boolean
  ): Promise<T>;
  
  set<T>(key: string, data: T, config: CacheConfig): void;
  
  invalidate(key: string | string[]): void;
  
  subscribe(key: string, callback: (data: any) => void): () => void;
  
  getStats(): CacheStats;
  
  clear(): void;
}
```

## Migration Strategy

### Phase 1: Create New Unified Stores
1. Create `src/stores/configStore.ts` (merge appStore + configStore + agencyStore + themeStore + favoritesStore)
2. Create `src/stores/vehicleStore.ts` (merge busStore + busDataStore + enhancedBusStore + offlineStore)
3. Create shared utilities (storeEvents, autoRefresh, errorHandler, cacheManager)

### Phase 2: Update Store Exports
1. Update `src/stores/index.ts` with new clean exports
2. Add temporary legacy aliases with deprecation warnings
3. Update TypeScript interfaces to match new store contracts

### Phase 3: Migrate Components
1. Update components to use new store names
2. Replace direct store calls with event-based communication
3. Update error handling to use standardized patterns

### Phase 4: Remove Legacy Code
1. Remove old store files (busStore.ts, appStore.ts, etc.)
2. Remove legacy aliases from exports
3. Clean up unused dependencies and imports

## Data Flow Architecture

```
┌─────────────────┐    Events    ┌─────────────────┐
│   ConfigStore   │◄────────────►│  VehicleStore   │
│                 │              │                 │
│ • UserConfig    │              │ • Vehicles[]    │
│ • Theme         │              │ • Stations[]    │
│ • Agencies[]    │              │ • Cache/Offline │
│ • Favorites     │              │                 │
└─────────────────┘              └─────────────────┘
         │                                │
         │ Events                         │ Events
         ▼                                ▼
┌─────────────────┐              
│ LocationStore   │              
│                 │              
│ • Current Loc   │              
│ • Permissions   │              
└─────────────────┘              
```

## Performance Optimizations

### Bundle Size Reduction
- **Before**: 10+ store files with duplicate logic and legacy code
- **After**: 3 focused store files with shared utilities
- **Expected Reduction**: 60-70% in store bundle size

### Memory Optimization
- Unified auto-refresh manager prevents multiple intervals
- Event-based communication reduces memory leaks
- Optimized cache management with size limits and LRU eviction

### Runtime Performance
- Reduced re-renders through optimized selectors
- Batched updates through event system
- Lazy loading of non-critical store functionality

## Testing Strategy

### Unit Testing
```typescript
// Example test structure
describe('VehicleStore', () => {
  beforeEach(() => {
    // Reset store state
    // Mock API calls
    // Setup test data
  });
  
  it('should consolidate vehicle data from multiple sources', async () => {
    // Test unified data handling
  });
  
  it('should handle errors consistently', async () => {
    // Test standardized error handling
  });
  
  it('should emit events on data changes', async () => {
    // Test event emission
  });
});
```

### Integration Testing
- Test store communication through events
- Test auto-refresh coordination
- Test cache invalidation across stores

### Migration Testing
- Test backward compatibility during migration
- Test component updates with new store interfaces
- Test performance improvements

## Risk Mitigation

### Breaking Changes
- **Risk**: Components break during migration
- **Mitigation**: Gradual migration with legacy aliases and comprehensive testing

### Data Loss
- **Risk**: Configuration or cache data loss during consolidation
- **Mitigation**: Data migration scripts and backup/restore functionality

### Performance Regression
- **Risk**: New architecture performs worse than current
- **Mitigation**: Performance benchmarks and rollback plan

### Complex Dependencies
- **Risk**: Circular dependencies or complex event chains
- **Mitigation**: Clear dependency graph and event flow documentation

## Success Metrics

### Code Quality
- Reduced cyclomatic complexity in store files
- Improved TypeScript coverage and type safety
- Reduced duplicate code (measured by code analysis tools)

### Performance
- 30%+ reduction in store bundle size
- Improved initial load time
- Reduced memory usage during runtime

### Developer Experience
- Simplified store imports (no confusion about which store to use)
- Consistent error handling patterns
- Better debugging through unified logging and events

### Maintainability
- Single responsibility stores
- Decoupled communication
- Comprehensive test coverage