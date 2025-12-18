# Troubleshooting Guide

Quick navigation to common issues and solutions.

## 🚨 Most Common Issues

### App Won't Load
→ See [Common Issues](common-issues.md#page-not-loading)

### API Authentication Errors  
→ See [API & Authentication](api-authentication.md#authentication-errors)

### No Buses Showing
→ See [Station & Route Issues](station-route-issues.md#wrong-missing-buses)

### Mobile/PWA Problems
→ See [Mobile & PWA Issues](mobile-pwa-issues.md)

## 📂 Issue Categories

### [Common Issues](common-issues.md)
- Setup problems
- Data issues  
- UI problems
- Performance issues

### [API & Authentication](api-authentication.md)
- Authentication errors
- Network issues
- Data problems
- Debug tools

### [Station & Route Issues](station-route-issues.md)
- Station display problems
- Route management issues
- Vehicle filtering problems

### [Mobile & PWA Issues](mobile-pwa-issues.md)
- Mobile browser problems
- PWA installation issues
- Touch and theme problems

### [Performance & Caching](performance-caching.md)
- Storage quota issues
- Cache inconsistencies
- Performance problems
- Service worker issues

### [Testing & Development](testing-development.md)
- Test failures
- Development server issues
- Build problems

### [Emergency Recovery](emergency-recovery.md)
- Complete app reset
- Last resort procedures
- Recovery scenarios

## 🔧 Quick Diagnostic Steps

### First Try
1. Refresh page (F5)
2. Check internet connection
3. Wait 30 seconds

### Still Broken?
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Try incognito mode

### Last Resort
1. Clear all site data
2. Restart browser
3. Re-setup from scratch

## 🆘 Emergency Reset

If nothing else works:
```javascript
// Paste in browser console
localStorage.clear();
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
location.reload(true);
```