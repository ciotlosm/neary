# API & Authentication Issues

## 🔍 Step 1: Identify the Error Type

### Authentication Errors (401/403)
**Symptoms:**
- Console: `[SYSTEM] [API] API request without authentication`
- Console: `[SYSTEM] [APP] API authentication failed (403 Forbidden)`
- Console: `📊 Data: {agencyId: 2, stopId: undefined, tripId: undefined, forceRefresh: false, retryAttempt: 0}`
- App shows loading screens but never progresses

### Network/Connectivity Errors (500/timeout)
**Symptoms:**
- Console: `Failed to get live vehicles, trying cache`
- Console: `AxiosError` with network timeout
- App shows "API Error" in connectivity indicator
- Intermittent loading failures

### Data/Parsing Errors (200 but invalid data)
**Symptoms:**
- Console: `Failed to parse API response`
- Console: `Invalid data format received`
- App loads but shows "No data available" messages
- Partial data loading (some endpoints work, others don't)

### Rate Limiting Errors (429)
**Symptoms:**
- Console: `Too Many Requests (429)`
- Console: `Rate limit exceeded`
- App works initially but stops responding after heavy usage

### Configuration Errors (App-level)
**Symptoms:**
- Console: `Agency not configured`
- Console: `No config-store found in localStorage`
- Setup wizard appears repeatedly
- App shows "Configuration required" messages

## 🛠 Step 2: Systematic Troubleshooting Process

### Phase 1: Quick Diagnostics (2 minutes)

**1.1 Check Browser Console (F12)**
```javascript
// Look for these specific error patterns:
// ✅ Good: "Vehicle data fetched successfully"
// ❌ Bad: "API request without authentication"
// ❌ Bad: "Failed to fetch vehicle data: 403 Forbidden"
// ❌ Bad: "AxiosError: Network Error"
```

**1.2 Check Network Tab**
- Look for failed requests to `/api/tranzy/v1/opendata/*`
- Check response status codes (401, 403, 429, 500, etc.)
- Verify request headers include proper authentication

**1.3 Check Connectivity Indicator**
- **Green "Online"**: Network + API both working
- **Red "Offline"**: No network connection
- **Red "API Error"**: Network OK but API unavailable

### Phase 2: Configuration Verification (3 minutes)

**2.1 Verify API Key Setup**
```javascript
// In browser console, check configuration:
const config = JSON.parse(localStorage.getItem('config-store') || '{}');
console.log('API Key configured:', !!config.state?.apiKey);
console.log('Agency ID:', config.state?.agencyId);
console.log('City:', config.state?.cityName);
```

**2.2 Check Setup Completion**
- Go to Settings → Check if API key field is populated
- Verify city is set to "Cluj-Napoca"
- Confirm setup wizard was completed (no setup screens appear)

**2.3 Test API Key Validity**
- Use diagnostic tool: `tools/debug/check-api-status.html`
- Or manually test: Try entering API key again in Settings
- Check Tranzy.ai account status and key permissions

### Phase 3: Timing and Initialization Issues (5 minutes)

**3.1 Check Initialization Sequence**
```javascript
// Look for these console messages in order:
// 1. "Setting up API configuration..."
// 2. "Initialization complete"
// 3. "Vehicle data fetched successfully"

// If you see API calls before "Initialization complete":
// This indicates a timing issue - data hooks running too early
```

**3.2 Force Proper Initialization**
```bash
# Method 1: Refresh after setup
# If you just completed setup, refresh the browser page

# Method 2: Clear and restart
# Clear browser data for the site and restart setup
```

**3.3 Check for Race Conditions**
- If errors occur immediately on app load: Timing issue
- If errors occur during user actions: Configuration issue
- If errors are intermittent: Network/rate limiting issue

### Phase 4: Advanced Diagnostics (10 minutes)

**4.1 Deep API Analysis**
```javascript
// Check raw API responses in Network tab:
// GET /api/tranzy/v1/opendata/agencies - Should return Cluj agency
// GET /api/tranzy/v1/opendata/routes?agency_id=2 - Should return routes
// GET /api/tranzy/v1/opendata/vehicles?agency_id=2 - Should return vehicles

// Look for response patterns:
// 401: API key missing or malformed
// 403: API key invalid or expired
// 429: Rate limit exceeded
// 500: Tranzy API server issues
```

**4.2 Cache and Storage Analysis**
```javascript
// Check browser storage:
// Application tab → Local Storage → Check for:
// - config-store (app configuration)
// - cluj-bus-theme (theme settings)
// - debug logs and cache entries

// Clear if corrupted:
localStorage.clear();
// Then refresh and reconfigure
```

**4.3 Service Worker Interference**
```javascript
// Check if service worker is causing issues:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active service workers:', registrations.length);
  // If > 0, try clearing service worker cache
});
```

## 🎯 Step 3: Specific Error Solutions

### Authentication Errors (Most Common)

#### "API request without authentication" (Critical Architecture Issue - FIXED December 17, 2024)
**Root Cause**: Data hooks were using different API service instances than the initialization system.

**The Problem**: 
- App initialization calls `enhancedTranzyApi.setApiKey()` on singleton instance
- Data hooks call `tranzyApiService()` factory which creates NEW instances without API key
- Result: Data hooks make unauthenticated requests even after proper setup

**Solution Applied**: 
- Modified all data hooks to use `enhancedTranzyApi` singleton instance
- Ensures all parts of the system share the same authenticated API service
- Fixed files: `useStationData.ts`, `useVehicleData.ts`, `useRouteData.ts`, `useStopTimesData.ts`

**If Still Experiencing Issues**:
1. **Clear browser cache**: Old cached code might still be running
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check console**: Should no longer see "API request without authentication"
4. **Verify fix**: Look for successful API calls in Network tab

#### "403 Forbidden" with Valid API Key
**Root Cause**: API key format issues or account problems.

**Solutions:**
1. **Re-enter API key**: Delete and re-enter in Settings
2. **Check key format**: Ensure no extra spaces or characters
3. **Verify account**: Log into Tranzy.ai and check key status
4. **Test directly**: Use diagnostic tool to test key validity

#### "No config-store found in localStorage"
**Root Cause**: App hasn't been set up or storage was cleared.

**Solutions:**
1. **Complete setup wizard**: Should appear automatically
2. **Clear browser data**: If wizard doesn't appear, clear site data and refresh
3. **Manual setup**: Go through complete setup process with API key + city

### Network and Connectivity Errors

#### "Failed to get live vehicles, trying cache"
**Root Cause**: Network issues or Tranzy API service problems.

**Diagnostic Steps:**
1. **Check internet**: Verify other websites work
2. **Test API directly**: Try `https://api.tranzy.ai/v1/opendata/vehicles` in browser
3. **Check Tranzy status**: Visit Tranzy.ai for service announcements
4. **Verify proxy**: Ensure dev server proxy is working (`/api/tranzy` → `https://api.tranzy.ai`)

**Solutions:**
- **Network issues**: Restart router, try different connection
- **API issues**: Wait for Tranzy service recovery
- **Proxy issues**: Restart dev server (`npm run dev`)
- **Rate limiting**: Reduce refresh frequency in Settings

#### Intermittent Connection Issues
**Root Cause**: Unstable network or rate limiting.

**Solutions:**
1. **Increase refresh intervals**: Set to 60+ seconds in Settings
2. **Avoid rapid refreshes**: Don't repeatedly press refresh button
3. **Check request patterns**: Look for excessive API calls in Network tab
4. **Use WiFi**: Switch from mobile data if unstable

### Data and Parsing Errors

#### "Invalid data format received"
**Root Cause**: API response structure changes or corrupted data.

**Diagnostic Steps:**
1. **Check API responses**: Look at raw JSON in Network tab
2. **Compare with expected format**: Verify against API documentation
3. **Check for partial responses**: Some endpoints might be returning errors

**Solutions:**
- **Clear cache**: Force fresh data fetch
- **Update app**: Check if app version is outdated
- **Report issue**: If API format changed, this needs developer attention

#### "No data available" with Successful API Calls
**Root Cause**: Data filtering or processing issues.

**Diagnostic Steps:**
1. **Check data processing**: Look for filtering logs in console
2. **Verify GTFS relationships**: Ensure trip_id chains are intact
3. **Check vehicle filtering**: Look for vehicles with null trip_ids

**Solutions:**
- **Normal behavior**: Vehicles with `trip_id: null` are correctly filtered out
- **Check operational hours**: Some routes may not be active
- **Verify route selection**: Ensure you're looking at active routes

### Rate Limiting and Performance

#### "Too Many Requests (429)"
**Root Cause**: Exceeded Tranzy API rate limits.

**Immediate Solutions:**
1. **Wait**: Rate limits usually reset within minutes
2. **Reduce frequency**: Increase auto-refresh intervals
3. **Avoid rapid actions**: Don't repeatedly trigger refreshes

**Prevention:**
- Set auto-refresh to 30+ seconds
- Use manual refresh sparingly
- Monitor API usage patterns

#### App Performance Degradation
**Root Cause**: Memory leaks or excessive API calls.

**Solutions:**
1. **Restart browser tab**: Clear memory and reset connections
2. **Check memory usage**: DevTools → Performance tab
3. **Disable auto-refresh**: Temporarily reduce background activity
4. **Clear browser cache**: Remove accumulated data

## 🚨 Step 4: Emergency Recovery Procedures

### Complete App Reset
```bash
# Nuclear option - reset everything
# 1. Clear all browser data for the site
# 2. Unregister service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
});
# 3. Clear all caches
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
# 4. Clear localStorage
localStorage.clear();
# 5. Refresh page and reconfigure
```

### Service Worker Issues
```bash
# If service worker is causing problems:
# 1. Open DevTools → Application → Service Workers
# 2. Click "Unregister" for all workers
# 3. Clear all caches in Storage section
# 4. Refresh page
```

### Development Server Issues
```bash
# If running in development mode:
# 1. Stop dev server (Ctrl+C)
# 2. Clear node modules if needed
rm -rf node_modules package-lock.json
npm install
# 3. Restart dev server
npm run dev
```

## 📊 Step 5: Monitoring and Prevention

### Health Check Indicators
- **Green connectivity indicator**: All systems working
- **Console free of errors**: No red error messages
- **Data loading properly**: Stations and vehicles appear
- **Refresh working**: Manual refresh updates data

### Preventive Measures
1. **Stable internet**: Use reliable WiFi connection
2. **Valid API key**: Keep Tranzy account active
3. **Reasonable refresh rates**: Don't set intervals too low
4. **Regular updates**: Keep app version current
5. **Browser maintenance**: Clear cache periodically

### Monitoring Tools
- **Browser DevTools**: Primary diagnostic tool
- **Diagnostic script**: `tools/debug/check-api-status.html`
- **Network tab**: Monitor API request patterns
- **Console logs**: Watch for error patterns
- **Settings panel**: Check configuration status

## 🔄 Step 6: When to Escalate

### Report to Developers When:
- API format appears to have changed
- Consistent errors across multiple users
- New error patterns not covered in this guide
- App architecture issues (timing problems)

### Include in Reports:
- **Exact error messages** from console
- **Steps to reproduce** the issue
- **Browser and version** information
- **Network conditions** (WiFi/mobile, speed)
- **API key status** (valid/invalid, account type)
- **App version** from Settings

## 🔧 Architecture Issues

### Architecture Violation: Direct API Calls Bypassing Cache System
**Problem**: Multiple components and services making direct Tranzy API calls instead of using the cache-aware methods, undermining performance and causing unnecessary API requests

**Root Cause**: Components were calling `enhancedTranzyApi.getX()` methods without the `forceRefresh = false` parameter, or bypassing the cache system entirely

**Critical Violations Found**:
- **`useVehicleProcessing.ts`**: Direct calls to `getStops()`, `getVehicles()`, `getRoutes()`, `getStopTimes()`, `getTrips()`
- **Component layer**: `BusRouteMapModal.tsx`, `StationMapModal.tsx` bypassing cache for shape data
- **Service layer**: Multiple services bypassing cache in `agencyService.ts`, `routeMappingService.ts`, `favoriteBusService.ts`, `routePlanningService.ts`
- **Store layer**: `favoriteBusStore.ts` not using cache-aware route fetching
- **Performance impact**: Unnecessary API requests, slower response times, potential rate limiting

**Solution Applied (December 2024)**:
- **Fixed cache parameters**: Added explicit `forceRefresh = false` to all API calls that should use cache
- **Updated hook calls**: Modified `useVehicleProcessing` to use cache-aware methods
- **Service layer fixes**: Updated `agencyService` and `routeMappingService` to respect cache
- **Architecture enforcement**: All data access should go through cache-aware methods

**Cache-Aware Method Signatures**:
```typescript
// ✅ Correct - uses cache by default
await enhancedTranzyApi.getStops(agencyId, false);
await enhancedTranzyApi.getRoutes(agencyId, false);
await enhancedTranzyApi.getVehicles(agencyId); // cache by default
await enhancedTranzyApi.getStopTimes(agencyId, undefined, undefined, false);

// ❌ Incorrect - bypasses cache
await enhancedTranzyApi.getStops(agencyId, true); // force refresh
```

**Architecture Rules**:
1. **Always use cache**: Default to `forceRefresh = false` unless explicitly refreshing
2. **Store-first**: Components should prefer store data over direct API calls
3. **Cache invalidation**: Only use `forceRefresh = true` in refresh actions
4. **Service layer**: Services must respect cache unless specifically refreshing data

---

**Remember**: Most API errors are configuration or timing issues. Follow the systematic approach above before assuming there's a deeper problem.