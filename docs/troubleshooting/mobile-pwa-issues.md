# Mobile & PWA Issues

## 📱 Progressive Web App Problems

### Dark Mode Not Persisting in PWA (iPhone Add to Home Screen)
**Problem**: Dark mode setting doesn't stay when exiting and re-entering the browser/PWA

**Root Cause**: Theme persistence issues in PWA mode due to localStorage timing and theme flash prevention

**Solution Applied (December 2024)**:
- **Enhanced theme store persistence**: Changed storage key to `cluj-bus-theme` for better PWA isolation
- **Immediate theme application**: Added `onRehydrateStorage` callback to apply theme immediately on load
- **Document root theme attribute**: Added `data-theme` attribute to prevent theme flash
- **PWA meta theme-color**: Dynamic theme-color meta tag updates based on current theme
- **Theme initialization**: Improved theme detection and application on app startup

**Technical Changes**:
- Updated `themeStore.ts` with better PWA persistence
- Added theme initialization in `main.tsx` with React useEffect
- Updated `manifest.json` and `index.html` with correct theme colors
- Added document-level theme attributes for consistent theming

**Prevention**: Always test PWA functionality on actual mobile devices, not just desktop browser dev tools

### PWA Theme Color Not Matching App Theme
**Problem**: PWA status bar color doesn't match the app's current theme (light/dark)

**Solution Applied**: 
- Updated `manifest.json` theme_color to match Material Design primary color
- Added dynamic meta theme-color updates in `main.tsx`
- Updated `index.html` meta theme-color to correct value

**Prevention**: Keep PWA manifest colors in sync with app theme colors

## 🗺️ GPS & Location Issues

### GPS Location Not Refreshing on Manual Refresh
**Problem**: Pressing the refresh button doesn't update GPS location for user

**Root Cause**: Location refresh logic was checking permission status instead of always attempting fresh location

**Solution Applied (December 2024)**:
- **Always attempt GPS refresh**: Modified RefreshControl to always try location refresh regardless of permission status
- **Force fresh location**: Set `maximumAge: 0` in geolocation options to prevent cached location
- **Increased timeout**: Extended GPS timeout to 20 seconds for better reliability
- **Better error handling**: Improved GPS error logging while continuing with data refresh

**Technical Changes**:
- Updated `RefreshControl.tsx` to always call `requestLocation()`
- Modified `LocationService.getCurrentPosition()` to force fresh location
- Added better GPS refresh logging for debugging
- Maintained graceful fallback when GPS fails

**Prevention**: Test location refresh on actual mobile devices with GPS enabled

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

### Location Permission Issues
**Problem**: App can't access GPS location on mobile devices

**Common Causes**:
1. **Browser permissions denied**: User blocked location access
2. **HTTPS requirement**: Location API requires secure connection
3. **iOS Safari restrictions**: Special handling needed for iOS
4. **Android Chrome issues**: Permission prompts may be blocked

**Solutions**:

**For Permission Denied**:
1. **Check browser settings**: Go to site settings and enable location
2. **Clear site data**: Reset permissions and try again
3. **Use manual location**: Set home/work locations as fallback

**For HTTPS Issues**:
1. **Development**: Use `localhost` (automatically trusted)
2. **Production**: Ensure site uses HTTPS
3. **Testing**: Use ngrok or similar for HTTPS tunneling

**For iOS Safari**:
1. **Enable location services**: Settings → Privacy → Location Services
2. **Enable Safari location**: Settings → Safari → Location Services
3. **Allow site permission**: When prompted, tap "Allow"

**For Android Chrome**:
1. **Check site permissions**: Chrome → Site Settings → Location
2. **Clear Chrome data**: If permissions are stuck
3. **Update Chrome**: Ensure latest version

## 📱 Mobile Browser Issues

### Safari Issues
**Problem**: Various display and functionality issues in Safari

**Common Issues & Solutions**:

**Location not working**:
- Check Safari location permissions in iOS Settings
- Ensure site has HTTPS or is localhost
- Try refreshing the page after granting permission

**Service worker issues**:
- Safari has stricter service worker policies
- Try clearing Safari cache: Settings → Safari → Clear History and Website Data
- Check if service worker is registered in Safari DevTools

**Display problems**:
- Safari sometimes has CSS viewport issues
- Check for `-webkit-` prefixed CSS properties
- Test with Safari's responsive design mode

**Touch events**:
- Safari handles touch events differently
- Ensure touch targets are at least 44px
- Test scrolling and pinch-to-zoom functionality

### Chrome Mobile Issues
**Problem**: Performance or display issues in Chrome mobile

**Common Issues & Solutions**:

**Memory usage**:
- Chrome mobile can use lots of RAM with auto-refresh
- Disable auto-refresh when not actively using
- Close other browser tabs to free memory

**Performance issues**:
- Enable "Lite mode" in Chrome settings for slower connections
- Disable JavaScript if experiencing crashes
- Clear Chrome cache and data

**Display issues**:
- Check viewport meta tag is correct
- Test with Chrome DevTools mobile simulation
- Verify touch targets are appropriately sized

### Mobile Data & Connectivity
**Problem**: App doesn't work well on mobile data connections

**Solutions**:

**For Slow Connections**:
1. **Increase refresh intervals**: Set to 60+ seconds to reduce data usage
2. **Use WiFi when possible**: Switch to WiFi for better performance
3. **Enable data saver**: Use browser's data saving features
4. **Cache optimization**: App caches data to reduce repeated downloads

**For Intermittent Connections**:
1. **Offline support**: App works with cached data when offline
2. **Auto-retry**: App automatically retries failed requests
3. **Connection indicator**: Shows current connectivity status
4. **Manual refresh**: Use pull-to-refresh when connection returns

## 🎨 Theme & Display Issues

### Theme Flash on Mobile
**Problem**: Brief flash of wrong theme when opening app on mobile

**Root Cause**: Theme loading timing issues on slower mobile devices

**Solution Applied**:
- Added `data-theme` attribute to document root
- Implemented immediate theme application in `main.tsx`
- Enhanced theme store with `onRehydrateStorage` callback
- Improved theme initialization sequence

**Prevention**: Always test theme persistence on actual mobile devices

### Responsive Design Issues
**Problem**: App doesn't display correctly on different screen sizes

**Common Issues & Solutions**:

**Text too small**:
- Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Ensure minimum font sizes for mobile readability
- Test with browser zoom at 150-200%

**Buttons too small**:
- Ensure touch targets are at least 44px (iOS) or 48dp (Android)
- Add adequate spacing between interactive elements
- Test with actual finger touches, not mouse clicks

**Layout overflow**:
- Check for fixed widths that don't scale
- Use responsive units (rem, %, vw/vh) instead of px
- Test on various screen sizes and orientations

**Map display issues**:
- Leaflet maps may need special mobile handling
- Check touch events for map interaction
- Ensure map controls are touch-friendly

## 🔧 Mobile-Specific Debugging

### Mobile DevTools Access
**Problem**: Hard to debug issues on actual mobile devices

**Solutions**:

**For iOS Safari**:
1. **Enable Web Inspector**: Settings → Safari → Advanced → Web Inspector
2. **Connect to Mac**: Use Safari DevTools on Mac with connected iPhone
3. **Remote debugging**: Use Safari's Develop menu → iPhone → page

**For Android Chrome**:
1. **Enable USB debugging**: Developer options → USB debugging
2. **Chrome DevTools**: chrome://inspect on desktop Chrome
3. **Remote debugging**: Connect via USB and inspect device

**Alternative Methods**:
1. **Console logging**: Add `console.log()` statements for mobile debugging
2. **Alert debugging**: Use `alert()` for quick mobile debugging (not recommended for production)
3. **Remote logging**: Use services like LogRocket or Sentry for mobile error tracking

### Mobile Performance Testing
**Problem**: App performance issues specific to mobile devices

**Testing Methods**:

**Chrome DevTools Mobile Simulation**:
1. **Open DevTools**: F12 → Toggle device toolbar
2. **Select device**: Choose iPhone/Android preset
3. **Throttle network**: Simulate 3G/4G speeds
4. **CPU throttling**: Simulate slower mobile processors

**Real Device Testing**:
1. **Test on actual devices**: iOS and Android devices
2. **Various network conditions**: WiFi, 4G, 3G, poor signal
3. **Battery optimization**: Test with low battery mode enabled
4. **Memory constraints**: Test with other apps running

**Performance Metrics**:
- **First Contentful Paint**: Should be under 2 seconds on mobile
- **Largest Contentful Paint**: Should be under 4 seconds on mobile
- **Cumulative Layout Shift**: Should be under 0.1
- **First Input Delay**: Should be under 100ms

## 📲 Add to Home Screen Issues

### PWA Installation Problems
**Problem**: "Add to Home Screen" option not appearing or not working

**Requirements Check**:
1. **HTTPS**: Site must use HTTPS (or localhost for development)
2. **Manifest**: Valid `manifest.json` with required fields
3. **Service Worker**: Registered and active service worker
4. **Icons**: Proper icon sizes in manifest
5. **Display mode**: Set to `standalone` or `fullscreen`

**Debugging Steps**:

**Check Manifest**:
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Registered' : 'Not registered');
});

// Check manifest
fetch('/manifest.json').then(r => r.json()).then(console.log);
```

**Chrome DevTools**:
1. **Application tab**: Check manifest and service worker status
2. **Lighthouse**: Run PWA audit for detailed requirements
3. **Console**: Look for manifest or service worker errors

**iOS Safari Specific**:
- iOS requires user gesture to show "Add to Home Screen"
- Must be in Safari (not other browsers)
- Check if site meets Apple's PWA requirements

**Android Chrome Specific**:
- Chrome shows install prompt automatically when criteria met
- Can be triggered programmatically with `beforeinstallprompt` event
- Check Chrome's install criteria in DevTools

### PWA Update Issues
**Problem**: PWA doesn't update to new version after deployment

**Root Cause**: Service worker caching strategy preventing updates

**Solutions**:
1. **Force refresh**: Use Ctrl+Shift+R (hard refresh)
2. **Clear cache**: DevTools → Application → Clear site data
3. **Update service worker**: Check for updates in Settings
4. **Unregister SW**: DevTools → Application → Service Workers → Unregister

**Prevention**:
- Implement proper service worker update strategy
- Show update notifications to users
- Test update process before deployment

---

**Mobile Testing Checklist**:
- ✅ Test on actual iOS and Android devices
- ✅ Verify GPS and location services work
- ✅ Check theme persistence in PWA mode
- ✅ Test touch interactions and gestures
- ✅ Verify responsive design at different screen sizes
- ✅ Test with poor network conditions
- ✅ Check PWA installation and updates
- ✅ Verify offline functionality works