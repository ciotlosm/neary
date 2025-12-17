# Emergency Recovery Procedures

## 🚨 When All Else Fails

### Complete App Reset (Nuclear Option)
**Use this when the app is completely broken and nothing else works**

**Step 1: Clear All Browser Data**
```bash
# In browser DevTools Console (F12):
# 1. Clear all localStorage
localStorage.clear();

# 2. Clear all caches
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));

# 3. Unregister all service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
});

# 4. Clear session storage
sessionStorage.clear();

# 5. Hard refresh
location.reload(true);
```

**Step 2: Manual Browser Reset**
If console commands don't work:
1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Click "Storage" in left sidebar**
4. **Click "Clear site data"**
5. **Check all boxes** (Local storage, Session storage, Cache storage, etc.)
6. **Click "Clear site data"**
7. **Close and reopen browser**

**Step 3: Complete Browser Reset**
If the app is still broken:
1. **Close all browser windows**
2. **Clear browser cache completely**:
   - Chrome: Settings → Privacy → Clear browsing data → All time
   - Safari: Safari → Clear History → All History
   - Firefox: Settings → Privacy → Clear Data
3. **Restart browser**
4. **Navigate to app URL**

### Service Worker Recovery
**When service worker is causing persistent issues**

**Method 1: DevTools Unregistration**
1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Click "Service Workers" in left sidebar**
4. **For each registered worker**:
   - Click "Unregister"
   - Wait for confirmation
5. **Go to "Cache Storage"**
6. **Delete all caches**
7. **Refresh page**

**Method 2: Programmatic Unregistration**
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Found', registrations.length, 'service workers');
  return Promise.all(registrations.map(registration => {
    console.log('Unregistering:', registration.scope);
    return registration.unregister();
  }));
}).then(() => {
  console.log('All service workers unregistered');
  return caches.keys();
}).then(names => {
  console.log('Clearing', names.length, 'caches');
  return Promise.all(names.map(name => caches.delete(name)));
}).then(() => {
  console.log('All caches cleared');
  location.reload();
});
```

**Method 3: Force Service Worker Update**
```javascript
// Force service worker update
navigator.serviceWorker.getRegistration().then(registration => {
  if (registration) {
    registration.update().then(() => {
      console.log('Service worker update triggered');
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
});
```

### Development Server Recovery
**When development environment is broken**

**Method 1: Restart Development Server**
```bash
# 1. Stop dev server (Ctrl+C or Cmd+C)
# 2. Clear development caches
rm -rf .vite dist

# 3. Restart dev server
npm run dev

# If port is still in use:
lsof -ti:5175 | xargs kill -9  # macOS/Linux
# Or use different port:
npm run dev -- --port 3000
```

**Method 2: Clear Node Modules**
```bash
# 1. Stop dev server
# 2. Clear node modules and lock file
rm -rf node_modules package-lock.json

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall dependencies
npm install

# 5. Restart dev server
npm run dev
```

**Method 3: Reset Development Environment**
```bash
# 1. Check Node version
node --version  # Should be 18+

# 2. Update npm
npm install -g npm@latest

# 3. Clear all caches
npm cache clean --force
rm -rf node_modules package-lock.json .vite dist

# 4. Fresh install
npm install

# 5. Verify build works
npm run build

# 6. Start development
npm run dev
```

### Git Recovery Procedures
**When code changes broke the app**

**Method 1: Rollback All Changes**
```bash
# Check what changed
git status
git diff

# Rollback all uncommitted changes
git checkout -- .

# If you have staged changes:
git reset --hard HEAD

# Restart dev server
npm run dev
```

**Method 2: Reset to Last Working Commit**
```bash
# See recent commits
git log --oneline -10

# Create backup of current state
git branch backup-broken-state

# Reset to last working commit
git reset --hard COMMIT_HASH

# Clean up any untracked files
git clean -fd

# Reinstall dependencies (in case package.json changed)
npm install

# Restart dev server
npm run dev
```

**Method 3: Restore Specific Files**
```bash
# Restore specific file from last commit
git checkout HEAD -- src/path/to/file.tsx

# Restore from specific commit
git checkout COMMIT_HASH -- src/path/to/file.tsx

# Restore entire directory
git checkout HEAD -- src/components/
```

## 🔧 Specific Recovery Scenarios

### "White Screen of Death"
**App loads but shows blank white screen**

**Diagnosis**:
1. **Check browser console** for JavaScript errors
2. **Look for React errors** in console
3. **Check network tab** for failed resource loads

**Recovery Steps**:
```bash
# 1. Hard refresh
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 2. Clear browser cache
# DevTools → Application → Clear site data

# 3. Check for JavaScript errors in console
# Look for uncaught exceptions or React errors

# 4. If in development, restart dev server
npm run dev

# 5. If still broken, reset to last working state
git log --oneline -5
git reset --hard WORKING_COMMIT_HASH
```

### "App Stuck Loading"
**App shows loading screen indefinitely**

**Diagnosis**:
1. **Check API calls** in Network tab
2. **Look for authentication errors** (401/403)
3. **Check service worker** status

**Recovery Steps**:
```javascript
// 1. Check API configuration
const config = JSON.parse(localStorage.getItem('config') || '{}');
console.log('API Key configured:', !!config.state?.apiKey);

// 2. Check for stuck promises or infinite loops
// Look for repeated API calls in Network tab

// 3. Force refresh API configuration
localStorage.removeItem('config');
location.reload();

// 4. If still stuck, clear all data
localStorage.clear();
location.reload();
```

### "Cannot Connect to API"
**All API calls failing consistently**

**Diagnosis**:
1. **Check internet connection**
2. **Verify API key validity**
3. **Check Tranzy API status**

**Recovery Steps**:
```bash
# 1. Test internet connection
ping google.com

# 2. Test API directly
curl -H "X-API-Key: YOUR_API_KEY" https://api.tranzy.ai/v1/opendata/agencies

# 3. Check API key in app
# Go to Settings → Re-enter API key

# 4. If in development, check proxy
# Restart dev server: npm run dev

# 5. Clear API cache
localStorage.removeItem('api-cache');
location.reload();
```

### "App Version Mismatch"
**App shows old version after deployment**

**Recovery Steps**:
```javascript
// 1. Force service worker update
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.update();
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
});

// 2. Clear all caches
caches.keys().then(names => 
  Promise.all(names.map(name => caches.delete(name)))
).then(() => location.reload());

// 3. If still showing old version, manual cache clear
// DevTools → Application → Storage → Clear site data
```

## 🆘 Last Resort Procedures

### Complete Browser Reset
**When nothing else works**

**Chrome**:
1. **Close all Chrome windows**
2. **Go to Chrome Settings**
3. **Advanced → Reset and clean up**
4. **Restore settings to original defaults**
5. **Restart Chrome**
6. **Navigate to app**

**Safari**:
1. **Close all Safari windows**
2. **Safari → Preferences → Privacy**
3. **Manage Website Data → Remove All**
4. **Safari → Clear History → All History**
5. **Restart Safari**
6. **Navigate to app**

**Firefox**:
1. **Close all Firefox windows**
2. **Firefox → Preferences → Privacy & Security**
3. **Clear Data → Clear**
4. **Or use Refresh Firefox feature**
5. **Restart Firefox**
6. **Navigate to app**

### Operating System Level Reset
**When browser issues persist**

**Clear DNS Cache**:
```bash
# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns

# Linux
sudo systemctl restart systemd-resolved
```

**Reset Network Settings**:
```bash
# macOS
sudo ifconfig en0 down
sudo ifconfig en0 up

# Windows
netsh winsock reset
netsh int ip reset

# Linux
sudo systemctl restart NetworkManager
```

### Hardware Level Issues
**When software resets don't work**

**Check System Resources**:
1. **Available RAM**: Ensure sufficient memory
2. **Disk space**: Ensure adequate storage
3. **CPU usage**: Check for high CPU processes
4. **Network connectivity**: Test with other devices

**System Restart**:
1. **Save all work**
2. **Close all applications**
3. **Restart computer**
4. **Test app after restart**

## 📋 Recovery Checklist

### Before Calling for Help
**Complete this checklist first**:

- [ ] **Hard refresh**: Ctrl+Shift+R / Cmd+Shift+R
- [ ] **Clear browser cache**: DevTools → Application → Clear site data
- [ ] **Check console errors**: F12 → Console tab for error messages
- [ ] **Test in incognito**: Try app in private/incognito mode
- [ ] **Try different browser**: Test in Chrome, Safari, Firefox
- [ ] **Restart browser**: Close and reopen browser completely
- [ ] **Check internet**: Verify other websites work
- [ ] **Restart computer**: If all else fails

### Information to Gather
**Collect this information for support**:

- **Error messages**: Exact text from browser console
- **Browser and version**: Chrome 91, Safari 14, etc.
- **Operating system**: macOS, Windows, Linux
- **Steps to reproduce**: What you did before the error
- **When it started**: Did it work before? When did it break?
- **Recovery attempts**: What you've already tried

### Emergency Contacts
**When to escalate**:

- **Persistent issues**: Problem survives complete reset
- **Data corruption**: App configuration keeps getting corrupted
- **System-wide issues**: Multiple apps/browsers affected
- **Security concerns**: Suspicious behavior or unauthorized access

---

**Remember**: Most issues can be resolved with the procedures above. Start with the simplest solutions (hard refresh, clear cache) before attempting more drastic measures (complete reset, git rollback).