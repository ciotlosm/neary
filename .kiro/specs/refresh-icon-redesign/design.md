# Design Document

## Overview

This design updates the ManualRefreshButton component to provide clearer visual feedback through a three-color freshness system (green/yellow/red), removes visual clutter (countdown dots), and ensures consistent sizing with other header controls. The redesign maintains all existing functionality while improving user experience through better color coding and differentiated refresh animations.

## Architecture

### Component Structure

```
ManualRefreshButton (updated)
├── Color State Logic (new three-color system)
├── Refresh Animation (differentiated speeds)
├── Tooltip Content (enhanced with countdown)
└── Size Configuration (updated to match other icons)
```

### Data Flow

```
API Fetch → Store Update → Timestamp Tracking → Age Calculation → Color Determination → Button Rendering
                                                                                      ↓
                                                                            Spinning Animation
                                                                            (preserves color)
```

### Integration Points

- **Data Freshness Monitor**: Provides freshness status and countdown information
- **Manual Refresh Service**: Handles refresh operations and progress tracking
- **Automatic Refresh Service**: Triggers periodic refreshes
- **Config Store**: Provides API key and agency configuration
- **Status Store**: Provides network and API status
- **All Data Stores**: Track lastUpdated timestamps for freshness calculation

## Components and Interfaces

### Updated ManualRefreshButton Component

**Location**: `src/components/features/controls/ManualRefreshButton.tsx`

**Props**:
```typescript
interface ManualRefreshButtonProps {
  className?: string;
  disabled?: boolean;
}
```

**Key Changes**:
1. Remove `RefreshCountdownDots` component entirely
2. Update `getButtonColor()` to return 'success' | 'warning' | 'error' | 'default'
3. Add logic to preserve color during refresh (don't switch to 'default')
4. Change button size from 'medium' to 'small'
5. Remove explicit width/height overrides (48x48px)
6. Add differentiated animation speeds for cache vs API operations

### Color Calculation Logic

**Function**: `getButtonColor()`

**Input**:
- `lastApiFetchTime`: number | null (from vehicleStore.lastApiFetch)
- `isRefreshing`: boolean
- `isDisabled`: boolean (derived from config/status stores)

**Output**: 'success' | 'warning' | 'error' | 'default'

**Constants** (add to `src/utils/core/constants.ts`):

**Note**: The existing constants serve different purposes:
- `API_CACHE_DURATION` - When to skip API calls and use cache
- `API_DATA_STALENESS_THRESHOLDS` - When Data Freshness Monitor shows "stale"
- `API_FETCH_FRESHNESS_THRESHOLDS` - NEW for refresh button UI colors (more granular)

```typescript
/**
 * API Fetch Freshness Thresholds (in milliseconds)
 * Controls refresh button color states based on API fetch time
 * Provides more granular UI feedback than staleness thresholds
 */
export const API_FETCH_FRESHNESS_THRESHOLDS = {
  // Green: API fetch age under 1 minute
  FRESH: 60 * 1000, // 1 minute
  
  // Yellow: API fetch age between 1-3 minutes
  WARNING: 180 * 1000, // 3 minutes
  
  // Red: API fetch age over 3 minutes (implicit, anything above WARNING)
} as const;

/**
 * Refresh Button Animation Durations (in milliseconds)
 * Different speeds for cache checks vs API calls
 */
export const REFRESH_ANIMATION_DURATIONS = {
  // Fast animation for cache checks
  CACHE_CHECK: 500, // 0.5 seconds per rotation
  
  // Normal animation for API calls (Material-UI default)
  API_CALL: 1400, // 1.4 seconds per rotation
} as const;
```

**Logic**:
```typescript
function getButtonColor(): 'success' | 'warning' | 'error' | 'default' {
  // Check disabled conditions first
  if (!apiKey || !agencyId || !networkOnline || apiStatus !== 'online') {
    return 'default'; // Grey for disabled states
  }
  
  // If no API fetch has occurred yet
  if (lastApiFetchTime === null) {
    return 'default'; // Grey for initial state
  }
  
  // Calculate API fetch age in milliseconds
  const apiFetchAge = Date.now() - lastApiFetchTime;
  
  // Apply three-color thresholds using constants
  if (apiFetchAge < API_FETCH_FRESHNESS_THRESHOLDS.FRESH) {
    return 'success'; // Green: < 1 minute
  } else if (apiFetchAge < API_FETCH_FRESHNESS_THRESHOLDS.WARNING) {
    return 'warning'; // Yellow: 1-3 minutes
  } else {
    return 'error'; // Red: > 3 minutes
  }
}
```

### API Fetch Time Tracking

**Current State**: Vehicle store already tracks `lastApiFetch`

**Location**: All data stores have:
```typescript
interface DataStore {
  lastUpdated: number | null;   // Updated by any data change (API, predictions, etc.)
  lastApiFetch: number | null;   // Updated ONLY by actual API calls
}
```

**For Refresh Button**: Read from `vehicleStore.lastApiFetch`

**Subscription**: Use Data Freshness Monitor's existing subscription mechanism

**Enhancement Needed**: Data Freshness Monitor should expose `lastApiFetch` in its status:

```typescript
interface ApiFreshnessStatus {
  status: 'fresh' | 'stale';
  vehicleApiAge: number;         // Age of vehicle API fetch
  staticApiAge: number;          // Age of static data API fetch
  isRefreshing: boolean;
  nextAutoRefreshIn: number;     // Seconds until next auto-refresh
  lastApiFetchTime: number | null; // NEW: Expose for button color calculation
}
```

### Refresh Operation Type Tracking

**Enhancement to Manual Refresh Service**:

```typescript
interface RefreshOperationType {
  type: 'cache-check' | 'api-call';
  storeName: string;
}

interface ManualRefreshService {
  // Existing methods...
  getCurrentOperationType: () => RefreshOperationType | null;
  subscribeToOperationType: (callback: (type: RefreshOperationType | null) => void) => () => void;
}
```

**Purpose**: Enable differentiated animation speeds based on operation type

### Animation Configuration

**Cache Check Animation**:
- Duration: 0.5 seconds per rotation
- Implementation: Custom CircularProgress with `sx={{ animationDuration: `${REFRESH_ANIMATION_DURATIONS.CACHE_CHECK}ms` }}`
- Use constant: `REFRESH_ANIMATION_DURATIONS.CACHE_CHECK`

**API Call Animation**:
- Duration: 1.4 seconds per rotation (Material-UI default)
- Implementation: Standard CircularProgress or with `sx={{ animationDuration: `${REFRESH_ANIMATION_DURATIONS.API_CALL}ms` }}`
- Use constant: `REFRESH_ANIMATION_DURATIONS.API_CALL`

**Color Preservation**:
- Store current color before refresh starts
- Pass color to CircularProgress via `color` prop
- Update color only after refresh completes

## Data Models

### API Timestamp State

```typescript
// Already exists in all data stores
interface DataStore {
  lastUpdated: number | null;   // Any data change
  lastApiFetch: number | null;   // Only API calls
}
```

**Storage**: Already persisted via Zustand persist middleware

**Updates**: Already handled by store refresh methods

**Access**: Read from `vehicleStore.lastApiFetch` for button color

### Button State

```typescript
interface ButtonState {
  color: 'success' | 'warning' | 'error' | 'default';
  isRefreshing: boolean;
  operationType: 'cache-check' | 'api-call' | null;
  apiFetchAge: number; // milliseconds since last API fetch
  nextAutoRefresh: number; // seconds until next auto-refresh
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Color Threshold Boundaries

*For any* API fetch timestamp, the button color should be:
- Green when age < 60,000ms (1 minute)
- Yellow when age >= 60,000ms and < 180,000ms (1-3 minutes)
- Red when age >= 180,000ms (3+ minutes)

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Color Based on API Fetch Time

*For any* combination of API fetch time, GPS timestamp, and data update time, the button color should be determined solely by the API fetch time, not the other timestamps

**Validates: Requirements 1.5**

### Property 3: Disabled State Conditions

*For any* combination of configuration states (apiKey, agencyId, networkOnline, apiStatus), the button should be grey/disabled if and only if any of these conditions are true:
- apiKey is null
- agencyId is null
- networkOnline is false
- apiStatus is 'offline' or 'error'

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Color Preservation During Refresh

*For any* color state (green/yellow/red), when a refresh operation starts, the button should maintain that color throughout the spinning animation until the refresh completes

**Validates: Requirements 3.1, 3.2, 3.3, 3.5**

### Property 5: Color Update After Refresh

*For any* refresh operation, when the operation completes successfully, the button color should update to reflect the new API fetch time (which should be current time, resulting in green)

**Validates: Requirements 3.4**

### Property 6: Concurrent Refresh Prevention

*For any* sequence of rapid button clicks, only one refresh operation should be in progress at a time, with subsequent clicks being ignored until the current operation completes

**Validates: Requirements 9.2**

### Property 7: Timestamp Persistence

*For any* API fetch timestamp, after storing it and reloading the page, the retrieved timestamp should equal the stored timestamp

**Validates: Requirements 8.4**

### Property 8: Age Calculation Accuracy

*For any* API fetch timestamp and current time, the calculated age should equal (current time - fetch time) in milliseconds, with proper handling of null timestamps

**Validates: Requirements 8.2**

### Property 9: Tooltip Content Completeness

*For any* button state (enabled/disabled, refreshing/not refreshing), the tooltip should always contain relevant status information and, when enabled, include "Click to refresh" text

**Validates: Requirements 7.5**

### Property 10: API Timestamp Tracking

*For any* successful API call, the system should record the timestamp immediately after the call completes

**Validates: Requirements 8.1**

## Error Handling

### Missing Configuration

**Scenario**: No API key or agency configured

**Handling**:
- Button displays grey color
- Button is disabled
- Tooltip shows "Configure API key and agency to enable refresh"

### Network Offline

**Scenario**: Browser reports no network connectivity

**Handling**:
- Button displays grey color
- Button is disabled
- Tooltip shows "Network offline - refresh unavailable"

### API Offline/Error

**Scenario**: API is unreachable or returning errors

**Handling**:
- Button displays grey color
- Button is disabled
- Tooltip shows "API unavailable - refresh unavailable"

### No Timestamp Available

**Scenario**: App just started, no API fetch has occurred

**Handling**:
- Button displays grey color
- Button remains enabled
- Tooltip shows "No data yet - click to fetch"
- First click triggers initial data load

### Refresh Service Errors

**Scenario**: Refresh operation fails

**Handling**:
- Stop spinning animation
- Restore previous color
- Show error in tooltip
- Log error to console
- Don't update timestamp (keep old timestamp)

## Testing Strategy

### Unit Tests

**Color Calculation Tests**:
- Test green color for timestamps < 60 seconds old
- Test yellow color for timestamps 60-179 seconds old
- Test red color for timestamps >= 180 seconds old
- Test grey color for disabled conditions
- Test grey color for null timestamp

**Component Rendering Tests**:
- Test button renders with correct size (small)
- Test countdown dots are not rendered
- Test tooltip contains expected content
- Test spinning animation appears during refresh
- Test color preservation during refresh

**Integration Tests**:
- Test button updates when automatic refresh occurs
- Test button triggers manual refresh on click
- Test button prevents concurrent refreshes
- Test button integrates with config/status stores

**Accessibility Tests**:
- Test ARIA labels are present
- Test keyboard navigation works
- Test screen reader announcements
- Test color contrast ratios meet WCAG AA

### Property-Based Tests

Each property test should run minimum 100 iterations and be tagged with:
**Feature: refresh-icon-redesign, Property {number}: {property_text}**

**Property Test 1**: Color Threshold Boundaries
- Generate random timestamps across all age ranges
- Verify color matches expected value for each range
- Test boundary conditions (59s, 60s, 179s, 180s)

**Property Test 2**: Color Based on API Fetch Time
- Generate random combinations of timestamps
- Verify color is determined only by API fetch time
- Ensure GPS and data update times don't affect color

**Property Test 3**: Disabled State Conditions
- Generate random combinations of config states
- Verify button is disabled if any condition is true
- Verify button is enabled only when all conditions are false

**Property Test 4**: Color Preservation During Refresh
- Generate random initial colors
- Start refresh operation
- Verify color remains unchanged during refresh
- Test for all three colors (green/yellow/red)

**Property Test 5**: Color Update After Refresh
- Start with random initial color
- Complete refresh operation
- Verify color updates to green (fresh data)

**Property Test 6**: Concurrent Refresh Prevention
- Generate random sequences of rapid clicks
- Verify only one refresh operation runs
- Verify subsequent clicks are ignored

**Property Test 7**: Timestamp Persistence
- Generate random timestamps
- Store and reload
- Verify timestamps match

**Property Test 8**: Age Calculation Accuracy
- Generate random timestamps
- Calculate age
- Verify calculation is correct

**Property Test 9**: Tooltip Content Completeness
- Generate random button states
- Verify tooltip contains required content
- Verify "Click to refresh" appears when enabled

**Property Test 10**: API Timestamp Tracking
- Simulate API calls
- Verify timestamps are recorded
- Verify timestamps are accurate

### Manual Testing

**Visual Consistency**:
- Compare button size with GPS and API icons
- Verify vertical alignment in header
- Verify spacing matches other controls
- Test on different screen sizes

**Animation Testing**:
- Verify cache check animation is faster
- Verify API call animation is normal speed
- Verify color is preserved during animation
- Test animation smoothness

**Color Transition Testing**:
- Watch button transition from green → yellow → red over time
- Verify transitions happen at correct thresholds
- Verify transitions are smooth

## Implementation Notes

### Naming Conventions and Refactoring

**This design includes a comprehensive refactoring of timing constants and services** to create clear separation between API timing and GPS timing.

**API-Related** (measures when we called the API):
- `API_FETCH_FRESHNESS_THRESHOLDS` - Button color thresholds (NEW)
- `API_CACHE_DURATION` - Cache expiration (renamed from IN_MEMORY_CACHE_DURATIONS)
- `API_DATA_STALENESS_THRESHOLDS` - Staleness indicators (renamed from STALENESS_THRESHOLDS)
- `lastApiFetch` - Store field for API call timestamp
- `apiFetchAge` - Calculated age of API fetch

**GPS-Related** (measures when vehicle reported position):
- `GPS_DATA_AGE_THRESHOLDS.FRESH` - Fresh GPS (renamed from CURRENT_THRESHOLD)
- `GPS_DATA_AGE_THRESHOLDS.STALE` - Stale GPS (renamed from STALE_THRESHOLD)
- `GPS_DATA_AGE_THRESHOLDS.ERROR` - Error GPS (NEW - 30 minutes)
- `vehicle.timestamp` - GPS sensor timestamp
- `gpsAge` - Calculated age of GPS data

**Service Renames**:
- `DataFreshnessMonitor` → `ApiFreshnessMonitor`
- `calculateFreshness()` → `calculateApiFreshness()`
- `lastVehicleRefresh` → `lastVehicleApiFetch`
- `updateVehicleRefreshTime()` → `updateVehicleApiFetchTime()`

**These are independent systems** - API can be fresh while GPS is stale, or vice versa.

### Phase 1: Refactor Constants
1. Rename `IN_MEMORY_CACHE_DURATIONS` → `API_CACHE_DURATION`
2. Rename `STALENESS_THRESHOLDS` → `API_DATA_STALENESS_THRESHOLDS`
3. Rename `GPS_DATA_AGE_THRESHOLDS.CURRENT_THRESHOLD` → `GPS_DATA_AGE_THRESHOLDS.FRESH`
4. Rename `GPS_DATA_AGE_THRESHOLDS.STALE_THRESHOLD` → `GPS_DATA_AGE_THRESHOLDS.STALE`
5. Add `GPS_DATA_AGE_THRESHOLDS.ERROR` = 30 minutes
6. Add `API_FETCH_FRESHNESS_THRESHOLDS` (new)
7. Add `REFRESH_ANIMATION_DURATIONS` (new)
8. Update all usages across codebase
9. Test all affected components

### Phase 2: Refactor Services
1. Rename `DataFreshnessMonitor` → `ApiFreshnessMonitor`
2. Rename `calculateFreshness()` → `calculateApiFreshness()`
3. Rename `lastVehicleRefresh` → `lastVehicleApiFetch`
4. Rename `updateVehicleRefreshTime()` → `updateVehicleApiFetchTime()`
5. Update `ApiFreshnessStatus` interface
6. Update all imports and usages
7. Test monitor functionality

### Phase 3: Remove Countdown Dots
1. Delete `RefreshCountdownDots` component
2. Remove dots rendering from ManualRefreshButton
3. Keep countdown info in tooltip
4. Test visual appearance

### Phase 4: Update Color System
1. Add 'warning' color to button color type
2. Update `getButtonColor()` function with new thresholds
3. Add API timestamp tracking
4. Test color transitions

### Phase 5: Preserve Color During Refresh
1. Store current color before refresh starts
2. Pass color to CircularProgress
3. Update color only after refresh completes
4. Test color preservation

### Phase 6: Differentiate Animations
1. Add operation type tracking to refresh service
2. Create fast animation for cache checks
3. Use normal animation for API calls
4. Test animation speeds

### Phase 7: Update Button Size
1. Change size from 'medium' to 'small'
2. Remove explicit width/height overrides
3. Test alignment with other header controls
4. Verify visual consistency

### Phase 8: Update Tests
1. Update existing tests for new behavior
2. Add property-based tests
3. Add accessibility tests
4. Verify all tests pass

## Migration Strategy

**Direct Implementation** - No gradual migration, implement final design immediately:

1. Rename all constants in one commit
2. Rename all services in one commit
3. Update all usages in one commit
4. Test thoroughly
5. Deploy

**No backward compatibility layer needed** - This is an internal refactoring with no external API changes.
