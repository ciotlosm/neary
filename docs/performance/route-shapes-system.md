# Route Shapes System

## Overview

The route shapes system provides accurate distance calculations for vehicle arrival time predictions. It uses a **bulk caching strategy** with localStorage persistence and intelligent refresh logic.

## Architecture

**Three-Layer System:**

1. **Storage Layer** (`shapeStore.ts` - Zustand)
   - Centralized state management
   - localStorage persistence with Map↔Array serialization
   - Cache-first loading with background refresh
   - Exponential backoff retry logic (100ms, 200ms, 400ms)

2. **API Layer** (`shapesService.ts`)
   - Bulk fetch: `GET /shapes` (no shape_id parameter)
   - Single endpoint for all shapes
   - Network error detection and timeout handling (30s)

3. **Processing Layer** (`shapeProcessingUtils.ts`)
   - Validates shape data structure
   - Groups shape points by shape_id
   - Converts to RouteShape format with segments
   - Generates FNV-1a hash for change detection

## Data Flow

```
App Start
    ↓
useShapeInitialization hook
    ↓
shapeStore.initializeShapes()
    ├─ Check localStorage for cached shapes
    ├─ If fresh (< 24h): Load immediately + background refresh
    ├─ If stale (> 24h): Fetch immediately
    └─ If missing: Fetch immediately
    ↓
shapesService.getAllShapes()
    ├─ Fetch all shapes in bulk
    ├─ Retry with exponential backoff on network errors
    └─ Return TranzyShapeResponse[]
    ↓
shapeProcessingUtils.processAllShapes()
    ├─ Validate shape data
    ├─ Group by shape_id
    ├─ Convert to RouteShape format
    └─ Return Map<string, RouteShape>
    ↓
Store in localStorage + in-memory Map
    ↓
Available to stationFilterStrategies.ts
```

## Key Components

### ShapeStore (Zustand)

**State:**
- `shapes`: Map<string, RouteShape> - O(1) lookup by shape_id
- `loading`: boolean - fetch in progress
- `error`: string | null - error message
- `lastUpdated`: number | null - timestamp of last successful fetch
- `dataHash`: string | null - FNV-1a hash for change detection
- `retryCount`: number - failed retry attempts

**Methods:**
- `initializeShapes()`: Load cached or fetch fresh
- `getShape(shapeId)`: Get single shape by ID
- `refreshShapes()`: Force background refresh
- `clearShapes()`: Clear all data
- `isDataFresh(maxAgeMs)`: Check if cache is fresh
- `hasShape(shapeId)`: Check if shape exists
- `isDataExpired()`: Check if cache expired

**Cache Duration:** 24 hours (CACHE_DURATIONS.SHAPES)

**localStorage Serialization:**
```typescript
// Map → Array for JSON
shapes: Array.from(shapes)  // [['shape_1', {...}], ['shape_2', {...}]]

// Array → Map on load
shapes: new Map(parsed.state.shapes)
```

### RouteShape Format

```typescript
interface RouteShape {
  id: string;                    // shape_id from API
  points: Coordinates[];         // [lat, lon] for each point
  segments: ShapeSegment[];      // Pre-calculated segments
}

interface ShapeSegment {
  start: Coordinates;            // Start point
  end: Coordinates;              // End point
  distance: number;              // Distance in meters
}
```

## Usage in Station Filtering

**File:** `stationFilterStrategies.ts`

```typescript
// Get shapes from centralized store
const shapeStore = useShapeStore.getState();
const routeShapes = new Map<string, RouteShape>();

// Collect shapes for vehicles serving filtered stations
for (const shapeId of uniqueShapeIds) {
  const shape = shapeStore.getShape(shapeId);
  if (shape) {
    routeShapes.set(shapeId, shape);
  }
}

// Pass to vehicle metadata calculation
addStationMetadata(
  station,
  stopTimes,
  vehicles,
  allRoutes,
  favoriteRouteIds,
  favoritesStoreAvailable,
  trips,
  stops,
  routeShapes  // ← Route shapes for accurate calculations
);
```

## Usage in Vehicle Arrival Calculations

**File:** `stationVehicleUtils.ts`

```typescript
// Get route shape for vehicle's trip
let routeShape: RouteShape | undefined;
if (routeShapes && trip && trip.shape_id) {
  routeShape = routeShapes.get(trip.shape_id);
}

// Calculate arrival time with shape
const arrivalResult = calculateVehicleArrivalTime(
  vehicle,
  targetStop,
  trips,
  stopTimes,
  stops,
  routeShape  // ← Enables accurate distance calculation
);
```

## Distance Calculation Methods

**With Route Shape (High Confidence):**
1. Project vehicle position to route shape
2. Project target stop to route shape
3. Calculate distance along shape between projections
4. Add projection distances
5. Result: High confidence (±50m)

**Without Route Shape (Medium Confidence - Fallback):**
1. Calculate distance via intermediate stops
2. Sum distances between consecutive stops
3. Result: Medium confidence (±200m)

## Why Shapes Store Might Be Empty

**Scenarios:**

1. **App First Load**
   - No localStorage data yet
   - Shapes fetching in progress
   - Solution: Wait for `initializeShapes()` to complete

2. **Network Error During Fetch**
   - API unreachable
   - Timeout (30s)
   - Solution: Retry with exponential backoff, use fallback calculations

3. **Invalid Shape Data**
   - API returns malformed data
   - Validation fails
   - Solution: Log warning, continue with fallback method

4. **localStorage Quota Exceeded**
   - Device storage full
   - Solution: Clear old cache, continue with in-memory only

5. **Stale Data (> 24h)**
   - Cache expired
   - Background refresh triggered
   - Solution: Use cached data while refreshing

## Fallback Behavior

When shapes are unavailable:

```typescript
// stationVehicleUtils.ts
if (targetStop && stops.length > 0) {
  try {
    const arrivalResult = calculateVehicleArrivalTime(
      vehicle,
      targetStop,
      trips,
      stopTimes,
      stops,
      routeShape  // undefined if no shape available
    );
    
    // calculateVehicleArrivalTime automatically:
    // - Uses route shape if available (high confidence)
    // - Falls back to stop segments if not (medium confidence)
  } catch (error) {
    console.warn('Failed to calculate arrival time:', error);
    // Continue without arrival time data
  }
}
```

## Error Handling

**Network Errors:**
- Detected: ECONNABORTED, NETWORK_ERROR, no response
- Action: Retry with exponential backoff
- Fallback: Use cached data if available

**Validation Errors:**
- Invalid shape_id, coordinates, or sequence
- Action: Filter out invalid shapes, log warning
- Fallback: Continue with valid shapes only

**Storage Errors:**
- localStorage quota exceeded
- Action: Clear old cache, continue with in-memory
- Fallback: In-memory only (lost on page reload)

## Performance Characteristics

**Memory:**
- Map<string, RouteShape> for O(1) lookup
- Typical: 5-15MB for all shapes
- localStorage: ~10-20MB limit

**Network:**
- Single bulk request vs. individual requests
- Typical: 2-5MB response
- Cached: 0 bytes after first load

**CPU:**
- Hash generation: O(n) where n = total shape points
- Projection: O(m) where m = segments in shape
- Typical: <100ms for all calculations

## Debugging

**Check Shape Store State:**
```typescript
const shapeStore = useShapeStore.getState();
console.log('Shapes loaded:', shapeStore.shapes.size);
console.log('Last updated:', new Date(shapeStore.lastUpdated));
console.log('Data hash:', shapeStore.dataHash);
console.log('Error:', shapeStore.error);
```

**Check localStorage:**
```javascript
const stored = localStorage.getItem('shape-store');
const parsed = JSON.parse(stored);
console.log('Cached shapes:', parsed.state.shapes.length);
```

**Monitor Arrival Calculations:**
```typescript
// Enable development logging
if (process.env.NODE_ENV === 'development') {
  console.log(`🗺️ Loading route shapes for ${stations} stations`);
  console.log(`✅ Route shapes loaded: ${loaded}/${total}`);
  console.log(`⚠️ Missing route shape for vehicle ${id}`);
  console.log(`⚠️ Fallback calculation for vehicle ${id}`);
}
```