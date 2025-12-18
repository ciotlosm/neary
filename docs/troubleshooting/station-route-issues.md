# Station & Route Issues

## Station Display Problems

### Duplicate Vehicles
**Problem**: Multiple duplicate entries for same bus routes
**Solution**: Fixed vehicle-to-station assignment logic using proper trip_id mapping

### Location Required Error
**Problem**: Shows "Location Required" despite fallback location set
**Solution**: Implemented location fallback hierarchy (GPS → Home → Work → Default)

### Wrong/Missing Buses
**Problem**: Shows buses that don't serve the station or no buses at all
**Solution**: Use GTFS trip_id filtering instead of proximity-based filtering

### Empty Station View
**Problem**: Shows "No buses currently serve these stations" despite API data available
**Solution**: Use direct API calls instead of complex store dependencies

### Performance Issues
**Problem**: Slow station loading and inefficient filtering
**Solution**: Use bulk API calls and in-memory filtering instead of individual requests

## Route Management Problems

### Empty Favorite Routes
**Problem**: Settings page shows empty favorite routes list
**Solution**: Fixed `useRouteManager` to use proper API data fetching

### Heart Icon Not Updating
**Problem**: Clicking heart icon doesn't update UI immediately
**Solution**: Added store event listeners and optimistic UI updates

## Common Fixes

### Refresh Not Working
**Problem**: Refresh button doesn't update vehicle data
**Solution**: Use store subscriptions instead of direct API calls

### No Active Buses
**Problem**: App shows "No buses are currently serving nearby stations"
**Solution**: Check vehicle filtering pipeline and location settings