# Station & Route Issues

## 🗺️ Station Display Problems

### Station Display Showing Duplicate Vehicles
**Problem**: Station display showing multiple duplicate entries for the same bus routes and stations

**Root Cause**: Vehicle assignment logic was showing all vehicles for each station group instead of filtering vehicles by which stations they actually serve

**Solution**: Fixed vehicle-to-station assignment logic
- Updated vehicle filtering to check which stations each vehicle's trip actually serves
- Added proper trip_id to stop_times mapping for accurate vehicle-station relationships
- Fixed TypeScript interface issues with LiveVehicle vs raw API response data
- Added station name deduplication to handle multiple stations with same names

**Code Changes**:
- Fixed `StationDisplay.tsx` vehicle grouping logic
- Updated type imports from `Vehicle` to `LiveVehicle`
- Fixed property access for transformed vehicle data structure
- Added `_internalDirection` field for UI display logic

### Station View Shows "Location Required" Despite Fallback Location Set
**Problem**: Station view displays "Location Required - Please enable location services" even when fallback location is configured

**Root Cause**: StationDisplay component only checked GPS location, ignored fallback location hierarchy

**Solution**: Implemented proper location fallback logic in StationDisplay
- Created `getEffectiveLocation()` utility function with priority: GPS → Home → Work → Default → Cluj center
- Updated StationDisplay to use effective location instead of GPS-only location
- Added fallback location dependencies to React useMemo for proper updates

### Station View Shows Wrong Buses or No Buses
**Problem**: Station view shows buses that don't actually stop at the displayed stations, or shows no buses despite routes serving those stations

**Root Cause**: Using proximity-based filtering instead of proper GTFS trip_id matching
- Proximity approach shows buses that happen to be nearby but don't serve the station
- Missing proper trip_id filtering based on stop_times data

**Solution**: Implemented proper GTFS trip_id filtering approach
- **Step 1**: Get stop_times data to find which trips serve target stations
- **Step 2**: Extract trip_ids for trips that stop at these stations  
- **Step 3**: Filter live vehicles by those trip_ids only
- **Step 4**: Enrich with route information and display results
- **Added proper loading states** and debug logging for troubleshooting

**Technical Details**:
- Tranzy API `/opendata/stop_times` returns `trip_id`, `stop_id`, and `stop_sequence`
- 127 out of 130 vehicle trip_ids match with stop_times trip_ids
- Proper approach: Use trip_id relationships to show only buses that serve the stations
- Enriches vehicle data with route names and descriptions from `/opendata/routes`

### Station View Shows Empty Despite API Data Available
**Problem**: Station view displays "No buses currently serve these stations" even though API calls are successful and return vehicle data

**Root Cause**: StationDisplay component was using `useEnhancedBusStore` which requires complex configuration and location setup, but the store was returning empty arrays due to initialization issues

**Symptoms**:
- API calls to `/stops`, `/routes`, and `/vehicles` are successful (200 status)
- Console shows stores returning `null` or empty arrays
- No `/stop_times` API calls being made
- Debug logs show `targetStationsLength: 0, vehiclesLength: 0`

**Solution**: Modified StationDisplay to fetch vehicle data directly instead of relying on enhanced bus store
- **Removed dependency** on `useEnhancedBusStore` which was designed for favorite buses
- **Added direct API calls** to fetch vehicles using `enhancedTranzyApi.getVehicles()`
- **Simplified data flow** from API → component state → processing → display
- **Fixed timing issues** by ensuring vehicle data is available before processing

**Technical Changes**:
- Replaced `useEnhancedBusStore` with direct `useState` for vehicles
- Added dedicated `fetchVehicles` useEffect for API calls
- Updated vehicle filtering to work with raw `Vehicle[]` data instead of `EnhancedVehicleInfo[]`
- Maintained proper trip_id filtering logic for station-vehicle matching

### Station View Overcomplicated Vehicle Processing
**Problem**: Station view had complex GTFS sequence analysis that was slow and error-prone

**Root Cause**: Overcomplicated logic trying to determine vehicle arrival/departure status using sequence analysis

**Solution**: Simplified to basic vehicle-station relationship check
- **Simple Logic**: Station ID → Vehicle trip_id → Check if station is in trip's stops
- **Removed Complexity**: Eliminated route ID mapping, sequence analysis, arrival/departure logic
- **Direct Relationship**: Just show vehicles whose trips serve the closest station
- **Better Performance**: Much faster processing with fewer API calls

### Station View Inefficient Vehicle Filtering
**Problem**: Station view was making individual API calls for each vehicle to check if it serves a station

**Root Cause**: Wrong approach - checking each vehicle's trip individually instead of bulk filtering

**Solution**: Implemented efficient bulk filtering approach
- **Step 1**: Get all stop_times once (bulk API call)
- **Step 2**: Filter stop_times by target station IDs to get relevant trip_ids
- **Step 3**: Filter vehicles by those trip_ids (in-memory filtering)
- **Result**: Much faster with fewer API calls

### Station View Showing Stations with No Buses
**Problem**: Station view displays nearby stations (like "Test_CJ") that show "No buses currently at this station" message

**Root Cause**: Station filtering logic only considered distance proximity (within 2km) but didn't verify if any vehicles actually serve those stations

**Solution Applied (December 2024)**: Modified station display logic to only show stations with active bus service
- **Changed rendering approach**: Only display stations that have vehicles serving them (from `stationVehicleGroups`)
- **Removed "always show stations" logic**: Eliminated code that displayed all nearby stations regardless of bus service
- **Added vehicle-station validation**: Stations are only shown after confirming vehicles serve them via trip_id matching
- **Improved user experience**: Users no longer see empty stations, only stations with actual bus service

**Technical Changes**:
- Updated `StationDisplay.tsx` rendering logic to iterate over `stationVehicleGroups` instead of `targetStations`
- Added `.filter(Boolean)` to remove null entries from station list
- Modified station filtering to include preliminary vehicle proximity check (5km radius)
- Maintained proper distance information by cross-referencing with `targetStations`

### Station View Not Updating After Cache Refresh
**Problem**: In the nearest station view, pressing the refresh button (top right) updates the cache but vehicles don't update their data until switching to favorites view and back

**Root Cause**: The `useVehicleProcessing` hook was fetching data directly from the API instead of subscribing to store updates. When the refresh button updates the store cache, the hook doesn't know about those updates because it's not listening to the store.

**Solution Applied (December 2024)**: Modified `useVehicleProcessing` hook to use store data instead of direct API calls
- **Added store subscription**: Hook now subscribes to `useEnhancedBusStore` for vehicle data
- **Converted store data**: Added logic to convert store vehicles to the format expected by the hook
- **Maintained fallback**: If no store data available, falls back to direct API calls
- **Added refresh trigger**: Hook triggers store refresh if data is older than 5 minutes
- **Fixed reactivity**: Vehicle data now updates immediately when store is refreshed

**Technical Changes**:
- Updated `useVehicleProcessing.ts` to import and use `useEnhancedBusStore`
- Added `storeVehicles`, `storeIsLoading`, and `lastUpdate` from store
- Modified vehicle fetching logic to convert store data to `LiveVehicle[]` format
- Added automatic store refresh trigger for stale data
- Updated loading states to include store loading state

## 🚌 Route Display Issues

### Favorite Routes Not Showing in Settings Despite Valid API Key
**Problem**: Settings page shows empty favorite routes list even though API key is valid and tested

**Root Cause**: The `useRouteManager` hook had a placeholder implementation for `loadAvailableRoutes` that just set an empty array instead of actually fetching routes from the API.

**Solution Applied (December 2024)**: Fixed `useRouteManager` to use `useRouteData` hook for proper route loading
- **Replaced placeholder logic**: Removed empty `loadAvailableRoutes` function
- **Added proper data fetching**: Now uses `useRouteData` hook which calls Tranzy API
- **Fixed type definitions**: Updated to use proper `Route` type from `tranzyApi`
- **Added null safety**: Added proper null checks for `availableRoutes` data
- **Maintained caching**: Routes are cached for 10 minutes to improve performance

**Technical Changes**:
- Updated `src/hooks/controllers/useRouteManager.ts` to import and use `useRouteData`
- Replaced manual state management with hook-based data fetching
- Added proper loading states and error handling from the data hook
- Fixed all null/undefined checks in computed values

**Verification Steps**:
1. Go to Settings → Favorites tab
2. Should see "Loading available routes..." while fetching
3. Should display available routes for selection after loading
4. Should show current favorite routes at the top
5. Check browser console for successful API calls to `/api/tranzy/v1/opendata/routes`

**If still not working**:
- Check browser console for API errors
- Verify API key is properly set in configuration
- Ensure agency ID is configured (should be "2" for Cluj)
- Try refreshing the page to clear any cached empty state

### Heart Icon Click Not Updating UI in Favorites Settings
**Problem**: Clicking the heart icon to add/remove favorite routes saves the change but the UI doesn't update immediately - routes don't move between favorites and available lists

**Root Cause**: The `useRouteManager` hook wasn't properly listening to config store changes, so when favorites were added/removed, the local state didn't update to reflect the changes.

**Solution Applied (December 2024)**: Enhanced `useRouteManager` with proper store event listening and optimistic UI updates
- **Added store event listener**: Now listens to `CONFIG_CHANGED` events for real-time updates
- **Optimistic UI updates**: Local state updates immediately when heart icon is clicked for better UX
- **Proper dependency tracking**: Fixed useEffect dependencies to trigger on actual config changes
- **Enhanced logging**: Added debug logs to track state updates and store events

**Technical Changes**:
- Added `useStoreEvent` hook to listen for `StoreEvents.CONFIG_CHANGED`
- Updated `handleToggleRoute` to optimistically update local state before store operations
- Fixed useEffect dependencies to include `config?.favoriteBuses`
- Added comprehensive logging for debugging state synchronization

**User Experience**: Heart icon clicks now provide immediate visual feedback - routes instantly move between favorites and available lists

## 🚌 Route Display Issues

### Route 42 Not Showing 15:45 Departure
**Problem**: Expected departure time missing from schedule

**Status**: ✅ **FIXED** - Route 42 now includes 15:45 departure

**If still missing**:
1. **Check current time**: Schedule might be filtered by time of day
2. **Refresh data**: Pull down to refresh or wait for auto-refresh
3. **Verify route direction**: Make sure you're looking at the right direction

### Wrong Route Numbers
**Problem**: Route shows as "40" instead of "42"

**Explanation**: 
- **Tranzy API uses Route ID**: "40"
- **CTP Cluj uses Route Label**: "42"
- **App should show**: "42" (the user-facing number)

**If showing wrong number**: This indicates a bug in the route mapping logic.

### Vehicle Label Discrepancy
**Problem**: Different vehicle numbers shown in tooltip vs map popup (e.g., "354" in tooltip, "Bus 223" in popup)

**Root Cause**: Inconsistent use of vehicle identifiers - tooltip used `label` field, popup used `vehicleId` field

**Solution**: Standardized to use vehicle `label` field consistently
- Updated `FavoriteBusInfo` interface to include `label` field from API
- Changed all `vehicleLabel` references to use `bus.label` instead of `bus.routeName`
- Updated map popup to show `Bus {bus.label}` with fallback to `vehicleId`

## 🔍 Nearby View Issues

### No Stations Found or Empty Station List
**Problem**: Nearby view shows "No stations found nearby" or displays empty station list despite being in Cluj-Napoca

**Root Cause**: Station filtering logic may be rejecting stations due to distance, route associations, or GTFS data issues

#### Debugging Tools

**1. Browser Console Debug Functions** (Development Mode):
```javascript
// In browser console (F12), run:
debugNearbyViewWithData()  // Uses current app data automatically
debugData                  // Access all current app data
debugNearbyView(userLocation, stations, routes, stopTimes, trips)  // Manual debug
```

**2. Built-in Debug Panel** (Development Mode):
The debug panel is automatically available in development mode at the bottom of the Station view:
- Shows current data status (location, stations, routes, vehicles, etc.)
- Provides ready-to-use console commands
- Displays current nearby view status and any errors
- Safe to use even when data is still loading (handles null/undefined gracefully)

**3. Debug Script** (standalone):
```bash
# Run the debug script with sample data
node debug-nearby-view.js
```

#### Common Issues & Solutions

**Issue A: No GPS Location**
```
❌ GPS location is required for nearby view
```
**Solution**: Enable location services or set a fallback location in settings

**Issue B: No Stations in Radius**
```
📊 Stations in radius: 0 (Search radius: 2000m)
```
**Solution**: 
- Increase search radius in configuration
- Verify you're in Cluj-Napoca area
- Check if station data is loaded correctly

**Issue C: No Stations Data Available**
```
📊 Total stations: 0
📊 Stations in radius: 0
📊 Stations with routes: 0
```
**Root Cause**: The nearby view system isn't getting stations data from the correct source.

**Solution Applied (December 2024)**: Fixed debug hook to use the same data sources as the nearby view controller:
- Uses `useStationData`, `useVehicleData`, `useRouteData`, `useStopTimesData` hooks
- These hooks fetch data directly from the Tranzy API with proper caching
- No longer relies on enhanced bus store which only contains vehicle data

**Issue D: Stations Have No Route Associations**
```
📊 Stations with routes: 0
🗺️ GTFS data: Stop times: ❌ (0), Trips: ❌ (0)
```
**Solution**:
- Verify GTFS data (stopTimes/trips) is being loaded
- Check if station IDs match between stations and stopTimes
- Ensure trip IDs in stopTimes match trip IDs in trips
- Verify route IDs in trips match route IDs in routes

**Issue E: Station ID Mismatches**
```
✗ Station Name: No route associations found
  Stop times: 0
```
**Solution**:
- Check if station.id matches stopTime.stopId exactly
- Verify data types (string vs number) match
- Look for leading/trailing spaces in IDs

**Issue F: GTFS Data Chain Broken**
```
💡 GTFS trips data is missing. Route associations may be inaccurate.
```
**Solution**:
- Ensure trips data is loaded: `stopTime.tripId → trip.id → trip.routeId → route.id`
- Check the complete data chain: stations → stopTimes → trips → routes

**Debug Output Example**:
```
📍 USER LOCATION: 46.7712, 23.6236
📊 OVERVIEW:
   Total stations: 4
   Stations in radius: 4
   Stations with routes: 3
   Selected stations: 2

🏁 SELECTION RESULTS:
   ✅ Closest: Piața Unirii 1 (37m, Routes: 24, 35)
   ✅ Second: Piața Unirii 2 (77m, Routes: 24)

📋 DETAILED ANALYSIS:
   1. ✅ Piața Unirii 1 (37m, Routes: 24, 35, Stop times: 2)
   2. ✅ Piața Unirii 2 (77m, Routes: 24, Stop times: 1)
   3. ❌ Isolated Station (112m, no_routes, Stop times: 0)
   4. ❌ Piața Mărăști (1444m, threshold_exceeded, Routes: 35)
```

### Stations Show No Buses Despite Route Associations
**Problem**: Nearby view shows stations but displays "No buses currently serve these stations"

**Root Cause**: Vehicle filtering logic may not be matching vehicles to stations correctly

#### Debugging Steps

**1. Check Vehicle-Station Matching**:
```javascript
// In console, check if vehicles have trip_ids that match station stop_times
console.log('Vehicles with trip_ids:', vehicles.filter(v => v.tripId).length);
console.log('Stop times for stations:', stopTimes.filter(st => stationIds.includes(st.stopId)).length);
```

**2. Verify GTFS Trip Chain**:
- Vehicles must have `tripId` that exists in trips data
- Trips must have `routeId` that exists in routes data
- StopTimes must connect `tripId` to `stopId` (station)

**3. Check Vehicle Data Quality**:
```javascript
// Check vehicle data structure
vehicles.forEach(v => {
  if (!v.tripId) console.log('Vehicle missing tripId:', v.id);
  if (!v.routeId) console.log('Vehicle missing routeId:', v.id);
});
```

**Common Solutions**:
- **No trip_ids**: Vehicles with `tripId: null` are filtered out (correct behavior)
- **Trip ID mismatches**: Ensure vehicle `tripId` exists in trips data
- **Route ID mismatches**: Verify route mapping between vehicles and routes
- **Timing issues**: Check if vehicles are actually scheduled to serve those stations

### Nearby View Performance Issues
**Problem**: Nearby view takes long time to load or causes app to freeze

**Root Cause**: Large datasets or inefficient filtering algorithms

#### Performance Debugging

**1. Check Dataset Sizes**:
```javascript
console.log('Dataset sizes:', {
  stations: stations.length,
  routes: routes.length,
  vehicles: vehicles.length,
  stopTimes: stopTimes?.length || 0,
  trips: trips?.length || 0
});
```

**2. Monitor Processing Time**:
The debug tools show processing time metrics:
```
⚙️ Performance: Station selection completed in 45ms
```

**3. Enable Performance Monitoring**:
```javascript
// Check performance metrics in debug report
const report = debugNearbyView(userLocation, stations, routes, stopTimes, trips);
console.log('Performance metrics:', report.performanceMetrics);
```

**Solutions**:
- **Large datasets**: Performance optimizations automatically apply for >100 stations or >50 vehicles
- **Slow filtering**: Check if GTFS data relationships are properly indexed
- **Memory issues**: Clear browser cache and restart if needed

### Distance Threshold Issues
**Problem**: Expected second station not showing or wrong stations selected

**Root Cause**: Distance threshold configuration or calculation issues

**Debugging**:
```javascript
// Check distance calculations
const distance = calculateStationProximity(station1, station2);
console.log('Distance between stations:', distance, 'Threshold:', NEARBY_STATION_DISTANCE_THRESHOLD);
```

**Configuration Check**:
- Default distance threshold: 200m
- Default search radius: 2000m
- Check if custom thresholds are set in controller options

**Solutions**:
- Adjust `customDistanceThreshold` in NearbyViewController options
- Verify distance calculation accuracy with known station locations
- Check if `enableSecondStation` option is enabled

### GPS Stability Issues
**Problem**: Station selection keeps changing with small GPS movements

**Root Cause**: GPS stability logic not working correctly or too sensitive

**Debugging**:
```javascript
// Check stability metrics
const controller = nearbyViewController;
const metrics = controller.getStabilityMetrics();
console.log('Stability metrics:', metrics);
```

**Configuration Options**:
- `stabilityMode: 'strict'` - More stable, allows more overrides
- `stabilityMode: 'normal'` - Balanced approach (default)
- `stabilityMode: 'flexible'` - Less stable, forces new selections more often

**Solutions**:
- Adjust stability mode based on GPS accuracy needs
- Check `enableStabilityTracking` option
- Use `forceNewSelection()` method when needed

## 🚌 Favorite Buses Data Issues

### "Route information unavailable" or "No real-time data available"
**Problem**: Favorite buses show error messages instead of vehicle data

**Major Fix Applied (December 2024)**: Fixed Tranzy API vehicle lookup issue

**Root Cause**: Tranzy API vehicles endpoint design inconsistency:
- `/routes` endpoint: Uses internal route IDs (e.g., `route_id: 40` for `route_short_name: "42"`)
- `/vehicles` endpoint: Uses route short names in the route_id field (e.g., `route_id: "42"`)

**Solution Applied**: Modified `favoriteBusService.ts` to look up vehicles using route short names instead of internal route IDs.

**Verification**: Check console logs for:
- `🗺️ DEBUGGING: Route mapping found` with explanation about API design
- `🚌 DEBUGGING: Vehicle cache lookup results` showing `routesWithVehicles` populated
- Route correction showing proper vehicle lookup strategy

#### Debugging Steps Using DevTools

1. **Open Browser DevTools** (F12 or right-click → Inspect)

2. **Go to Console Tab** and look for debugging messages with these prefixes:
   - `🔍 DEBUGGING: Agency lookup` - Check if agency ID is found
   - `🗺️ DEBUGGING: Route mapping found` - Check if route mapping works
   - `🔄 DEBUGGING: Route correction summary` - See route ID corrections
   - `🚛 DEBUGGING: Raw vehicles received` - Check if vehicles are fetched from API
   - `🚛 DEBUGGING: Vehicle filtering results` - See how many vehicles pass filtering
   - `🚌 DEBUGGING: Vehicle cache lookup results` - Check final vehicle availability

3. **Common Issues & Solutions**:

   **Agency Not Found**:
   ```
   ❌ No agency found for city: Cluj-Napoca
   ```
   **Solution**: Check API key configuration and city name

   **Route Mapping Failed**:
   ```
   ❌ DEBUGGING: No route mapping found for favorite route: {routeName: "42"}
   ```
   **Solution**: Route "42" doesn't exist in API. Check available routes in Settings.

   **No Vehicles with Valid Trip IDs**:
   ```
   🚛 DEBUGGING: Vehicle filtering results: {
     totalVehicles: 150,
     activeVehicles: 0,
     filteredOut: 150,
     filterReasons: {noTripId: 145, noRouteId: 5}
   }
   ```
   **Solution**: All vehicles have `tripId: null`, indicating operational issues. This is correct behavior - the route has no active vehicles with proper GTFS data.

   **Route ID Mismatch**:
   ```
   🚌 DEBUGGING: Vehicle cache lookup results: {
     requestedRoutes: ["123"],
     routesWithVehicles: ["456", "789"],
     vehicleBreakdown: []
   }
   ```
   **Solution**: Requested route ID "123" doesn't match available vehicle route IDs. Check route mapping service.

4. **Manual Testing Steps**:

   **Check Raw API Data**:
   - Open Network tab in DevTools
   - Look for requests to `/api/tranzy/v1/opendata/vehicles`
   - Check response to see if vehicles have `trip_id` values
   - Vehicles with `trip_id: null` are filtered out (this is correct)

   **Check Route Mapping**:
   - Look for requests to route mapping service
   - Verify route "42" maps to correct API route ID
   - Check if mapped route ID exists in vehicle data

   **Check Configuration**:
   - Go to Application tab → Local Storage
   - Look for `config-store` entry
   - Verify `favoriteBuses` array contains correct route names
   - Verify `agencyId` is set (should be "2" for Cluj)

5. **Expected Behavior**:
   - **If no vehicles have valid `trip_id`**: "Route information unavailable" is correct
   - **If route mapping fails**: Route doesn't exist in current GTFS data
   - **If agency lookup fails**: API key or configuration issue

### Performance Issues with Favorite Buses
**Problem**: Favorite buses take long time to load or cause app to freeze

**Debugging**: Check console for:
- Multiple rapid API calls (indicates caching issues)
- Large vehicle datasets being processed
- Memory usage in DevTools Performance tab

**Solution**: 
- Verify cache is working properly
- Check if auto-refresh intervals are too aggressive
- Ensure proper cleanup of subscriptions

### Cache Issues
**Problem**: Favorite buses show stale data or don't update

**Debugging**: Look for cache-related logs:
- Cache hit/miss ratios
- Cache age information
- Force refresh triggers

**Solution**:
- Clear browser cache and localStorage
- Check cache TTL settings
- Verify auto-refresh is working

## 🔧 Live Tracking Issues

### Vehicles with Null route_id and trip_id
**Problem**: Debug logs show vehicles with `route_id: null` and `trip_id: null` that don't appear in the app

**Explanation**: This is **normal and expected behavior**. Vehicles without route assignment occur when:
- **Vehicle not in active service** - Bus is running but not assigned to a route (returning to depot, on break, between shifts)
- **GPS tracking without trip assignment** - Vehicle's GPS is active but driver hasn't started their scheduled trip
- **Data sync issues** - Vehicle's AVL system hasn't synced with trip assignment system
- **Maintenance/testing mode** - Vehicle being tested or moved without being on scheduled route

**Why they're filtered out**:
- Vehicles without `route_id` can't be matched to stops or schedules
- They don't provide useful information to passengers
- They would show as "Unknown" route with no destination

**Debug logging**: The app now logs these vehicles for debugging purposes:
```
Vehicles without route assignment: {
  count: 5,
  vehicles: [
    { id: 5, label: "851", position: { lat: 46.7857, lon: 23.6279 } }
  ]
}
```

**This is correct behavior** - passenger apps should only show vehicles that are actively serving routes.

### Live Tracking Not Working
**Problem**: No red dots showing live buses

**Possible Causes**:
1. **No buses currently running** - check if it's operating hours
2. **API key issues** - live data requires valid Tranzy API key
3. **Network issues** - check internet connection
4. **Route not supported** - not all routes have live tracking
5. **All vehicles unassigned** - all vehicles have `route_id: null` (see above)

**Solutions**:
1. **Check operational hours**: Most routes run 6 AM - 11 PM
2. **Verify API key**: Go to Settings and confirm API key is valid
3. **Test network**: Try refreshing or check other websites
4. **Check route coverage**: Some routes may have limited live tracking
5. **Check debug logs**: Look for "Vehicles without route assignment" messages

### "No Schedule Data Available"
**Problem**: Routes show no departure times

**Root Cause**: This was a major issue caused by station name mismatches between CTP Cluj website and Tranzy API.

**Fixed**: The app now provides route-level timing for any station request, so this should no longer occur.

**If it still happens**:
1. **Refresh the page** - data might be temporarily unavailable
2. **Check route number** - ensure it's a valid CTP Cluj route
3. **Try different time** - some routes have limited schedules

---

**Prevention**: 
- Always use GTFS relationships (trip_id matching) instead of GPS proximity for station-vehicle associations
- Verify that vehicles actually serve the stations before displaying them
- Ensure each view triggers its own data refresh instead of relying on other components
- Use bulk operations and in-memory filtering instead of individual API calls in loops