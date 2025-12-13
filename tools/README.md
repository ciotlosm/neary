# 🛠️ Development Tools

This directory contains various tools and utilities for development, debugging, and testing.

## 📁 Directory Structure

```
tools/
├── 📂 debug/           # Debug utilities and diagnostic tools
├── 📂 test/            # Test scripts and verification tools
└── 📄 README.md        # This file
```

## 🔍 Debug Tools (`/debug/`)

### Configuration Debugging
- **`debug-config.js`** - Validate app configuration and settings
- **`check-config.html`** - Interactive configuration validation tool

### System Debugging
- **`debug-favorites.js`** - Test and debug the favorites system
- **`debug-schedule-issue.js`** - Diagnose schedule service problems

### Usage
```bash
# Run debug scripts from project root
node tools/debug/debug-config.js
node tools/debug/debug-favorites.js
```

## 🧪 Test Tools (`/test/`)

### API Testing
- **`test-api-linking.js`** - Test API connectivity and responses
- **`test-ctp-cluj-proxy.js`** - Verify CTP Cluj proxy functionality
- **`test-tranzy-api.js`** - Test Tranzy API integration

### Schedule Testing
- **`test-route-42-schedule.js`** - Verify Route 42 schedule data
- **`test-schedule-pattern.js`** - Test schedule generation patterns
- **`test-official-schedule-integration.js`** - Test official schedule integration

### Route Testing
- **`test-route-mapping.js`** - Verify route ID/label mapping
- **`test-route-data.js`** - Test route data retrieval and processing

### Integration Testing
- **`test-app-functionality.js`** - End-to-end functionality testing
- **`test-final-verification.js`** - Complete system verification

### Browser Testing
- **`test-schedule-browser.html`** - Browser-based schedule testing interface

### Usage
```bash
# Run test scripts from project root
node tools/test/test-api-linking.js
node tools/test/test-route-42-schedule.js

# Open browser tests
open tools/test/test-schedule-browser.html
```

## 🎯 Common Use Cases

### Debugging Configuration Issues
1. Run `node tools/debug/debug-config.js`
2. Open `tools/debug/check-config.html` in browser
3. Check console for configuration validation results

### Testing API Integration
1. Run `node tools/test/test-api-linking.js`
2. Verify proxy functionality with `test-ctp-cluj-proxy.js`
3. Test specific routes with `test-route-42-schedule.js`

### Verifying Schedule Data
1. Use `test-schedule-pattern.js` to verify schedule generation
2. Run `test-official-schedule-integration.js` for official data
3. Check browser interface with `test-schedule-browser.html`

### Complete System Verification
1. Run `node tools/test/test-final-verification.js`
2. Check all systems are working correctly
3. Verify no runtime errors or data issues

## 📝 Adding New Tools

### Debug Tools
Create new debug scripts in `/debug/` directory:
```javascript
// tools/debug/debug-new-feature.js
console.log('🔍 Debugging New Feature...');

async function debugNewFeature() {
  try {
    // Debug logic here
    console.log('✅ Debug completed successfully');
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugNewFeature();
```

### Test Tools
Create new test scripts in `/test/` directory:
```javascript
// tools/test/test-new-feature.js
console.log('🧪 Testing New Feature...');

async function testNewFeature() {
  try {
    // Test logic here
    console.log('✅ All tests passed');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
  }
}

testNewFeature();
```

## 🔧 Tool Development Guidelines

### Script Structure
1. **Clear logging** with emojis and status indicators
2. **Error handling** with try/catch blocks
3. **Descriptive output** showing what's being tested
4. **Success/failure indicators** for easy interpretation

### Naming Convention
- **Debug tools**: `debug-[feature-name].js`
- **Test tools**: `test-[feature-name].js`
- **Browser tools**: `[tool-name].html`

### Documentation
- Include clear comments explaining what each tool does
- Add usage examples in this README
- Document any prerequisites or setup requirements

## 🚀 Integration with Development Workflow

These tools are designed to support the development workflow:

1. **During Development** - Use debug tools to diagnose issues
2. **Before Commits** - Run relevant test tools to verify functionality
3. **During Debugging** - Use specific tools to isolate problems
4. **For Verification** - Use comprehensive test suites to validate changes

The tools complement the main test suite (`npm test`) by providing focused, standalone utilities for specific debugging and testing scenarios.