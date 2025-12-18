# Testing & Development Issues

## Test Failures

### Duplicate --run Flag Error
**Problem**: `npm test -- --run` fails with duplicate flag error
**Solution**: Use `npm test` (--run already included in script)

### Import Path Errors
**Problem**: Tests fail with "Failed to resolve import" errors
**Solution**: Check relative import paths are correct

### localStorage Key Mismatches
**Problem**: Tests expect wrong localStorage keys
**Solution**: Update test expectations to match actual store keys

### Async Test Timeouts
**Problem**: Integration tests timeout on async operations
**Solution**: Increase timeout or skip problematic tests with `it.skip()`

### Property-Based Test Failures
**Problem**: Fast-check tests fail with mock errors
**Solution**: Ensure mocks are properly configured

## Development Server Issues

### Port Already in Use
**Problem**: Dev server fails to start on port 5175
**Solution**: Kill existing process or use different port

### Memory Issues
**Problem**: Tests crash with JavaScript heap out of memory
**Solution**: Reduce test iterations and add proper cleanup

## Common Fixes

### Clear Test Cache
```bash
npm test -- --clearCache
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Test Status
```bash
npm test -- --reporter=verbose
```