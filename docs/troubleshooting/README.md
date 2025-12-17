# Troubleshooting Guide

This troubleshooting guide is organized into specific categories for easier navigation. Choose the section that matches your issue:

## 📁 Troubleshooting Categories

### 🚨 [Common Issues](./common-issues.md)
- "No Active Buses" Error
- Build & Development Issues
- Setup and Configuration Problems
- Most frequently encountered issues

### 🔧 [API & Authentication](./api-authentication.md)
- API Key Configuration Issues
- Authentication Errors (401/403)
- Network and Connectivity Problems
- Rate Limiting and Performance Issues

### 🗺️ [Station & Route Issues](./station-route-issues.md)
- Station View Problems
- Route Display Issues
- Live Tracking Problems
- Schedule Data Issues

### 📱 [Mobile & PWA Issues](./mobile-pwa-issues.md)
- Progressive Web App Problems
- Mobile Browser Issues
- GPS and Location Services
- Dark Mode and Theme Issues

### ⚡ [Performance & Caching](./performance-caching.md)
- Storage Quota Issues
- Service Worker Problems
- Cache Management
- App Update Issues

### 🧪 [Testing & Development](./testing-development.md)
- Test Failures
- Development Server Issues
- Build Problems
- Debug Tools

### 🆘 [Emergency Recovery](./emergency-recovery.md)
- Complete App Reset
- Service Worker Recovery
- Cache Clearing Procedures
- When All Else Fails

## 🔍 Quick Diagnosis

### Step 1: Identify Your Issue Type
- **App won't start**: Check [Testing & Development](./testing-development.md)
- **No data showing**: Check [API & Authentication](./api-authentication.md)
- **Wrong stations/routes**: Check [Station & Route Issues](./station-route-issues.md)
- **Mobile problems**: Check [Mobile & PWA Issues](./mobile-pwa-issues.md)
- **Slow performance**: Check [Performance & Caching](./performance-caching.md)
- **App completely broken**: Check [Emergency Recovery](./emergency-recovery.md)

### Step 2: Use Debug Tools
- **Browser Console**: Press F12 and check for error messages
- **Debug Tool**: Open `http://localhost:5175/debug.html` (development mode)
- **Network Tab**: Check for failed API requests

### Step 3: Try Quick Fixes
1. **Refresh the page** (Ctrl+R / Cmd+R)
2. **Clear browser cache** (DevTools → Application → Clear site data)
3. **Check API key** (Settings → Verify API key is entered)
4. **Restart dev server** (if in development: stop and run `npm run dev`)

## 🔧 Debug Tools

### Built-in Debug Panel
Available in development mode at the bottom of the Station view:
- Shows current data status
- Provides console commands
- Displays error information

### Nearby Station Debug Tool
**Location**: `http://localhost:5175/debug.html`
- Configuration validation
- API key testing
- Location services testing
- Data fetching verification

### Browser Console Commands
```javascript
// Check configuration
const config = JSON.parse(localStorage.getItem('config') || '{}');
console.log('API Key:', config.state?.config?.apiKey ? 'SET' : 'MISSING');

// Debug nearby view
debugNearbyViewWithData()  // Uses current app data
```

## 📊 Health Check Indicators

### System Status
- **Green "Online"**: Network + API both working
- **Red "Offline"**: No network connection  
- **Red "API Error"**: Network OK but API unavailable

### Data Quality
- **Live vehicles**: Red dots on map (when available)
- **Schedule data**: Departure times showing
- **No console errors**: Browser console is clean

## 🆘 Getting Help

### Before Asking for Help
1. Check the appropriate troubleshooting section above
2. Look at browser console for error messages
3. Try the quick fixes listed
4. Use the debug tools to gather information

### Providing Debug Information
When reporting issues, include:
- **Error message** (exact text from console)
- **Steps to reproduce** (what you did before the error)
- **Browser and version** (Chrome 91, Safari 14, etc.)
- **App version** (from Settings → Version info)
- **Debug tool output** (if applicable)

---

**Remember**: Most issues are covered in the specific troubleshooting sections above. Start with the category that matches your problem type.