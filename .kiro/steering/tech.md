# Cluj Bus App - Technical Stack

## Core Technologies
- **React 19.2.0** with TypeScript for type safety
- **Vite** as build tool with Rolldown optimization
- **Material-UI (MUI) 7.3.6** for component library and theming
- **Zustand 5.0.9** for lightweight state management
- **Tailwind CSS 4.1.18** for utility-first styling
- **Leaflet + React-Leaflet** for map functionality

## Testing & Quality
- **Vitest** for unit and integration testing
- **Testing Library** for component testing
- **ESLint + TypeScript ESLint** for code quality
- **Fast-check** for property-based testing

## API & Data
- **Axios** for HTTP requests
- **Tranzy API** for all transit data (live vehicles + schedules via proxy)
- **Service Worker** for offline functionality

## Build Configuration
- **Vite config** includes API proxies to avoid CORS
- **Code splitting** with manual chunks for vendors
- **Terser minification** for production builds
- **Source maps disabled** in production for performance

## Common Commands

### Development
```bash
npm run dev          # Start development server (port 5175)
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run all tests once (vitest --run)
npm run test:watch   # Run tests in watch mode (vitest)
npm run test:ui      # Run tests with visual UI (vitest --ui)
```

### 🚨 CRITICAL TEST COMMAND RULES (AI Assistant Must Follow)

**PACKAGE.JSON TEST SCRIPT: `"test": "vitest --run"`**
**The --run flag is ALREADY INCLUDED in the npm test script!**

### ✅ CORRECT Test Commands
```bash
npm test                    # Run all tests (--run already included)
npm test -- vehicleStore    # Run specific test files (NO --run needed)
npm test -- --coverage     # Run with coverage (NO --run needed)
npm test -- --reporter=verbose  # Verbose output (NO --run needed)
npm run test:watch         # Watch mode (uses different script)
npm run test:ui            # Visual test runner
```

### ❌ FORBIDDEN Commands (Will Cause Duplicate --run Error)
```bash
npm test -- --run          # ❌ DUPLICATE --run ERROR
npm test -- --run vehicleStore  # ❌ DUPLICATE --run ERROR
npm test -- --run --coverage    # ❌ DUPLICATE --run ERROR
```

### Test Commands Reference
- **`npm test`** - Single test run, exits after completion (vitest --run)
- **`npm run test:watch`** - Watch mode, re-runs tests on file changes (vitest)
- **`npm run test:ui`** - Visual test runner with browser interface
- **`npm test -- <pattern>`** - Run specific test files (e.g., `npm test -- vehicleStore`)
- **`npm test -- --reporter=verbose`** - Run tests with detailed output
- **`npm test -- --coverage`** - Run tests with coverage report
- **`npm test -- --clearCache`** - Clear test cache before running
- **`npm test -- --update`** - Update test snapshots

### AI Assistant Test Command Rules
- ❌ **NEVER EVER** add `--run` when using `npm test` - it's already in the script
- ❌ **NO** `--verbose` option exists - use `--reporter=verbose`
- ❌ **NO** `npm run test:coverage` script - use `npm test -- --coverage`
- ❌ **NO** `--grep` option - use `--testNamePattern` for pattern matching
- ✅ **ALWAYS** use `npm test -- <pattern>` for specific tests (NO --run)
- ✅ **REMEMBER** the `--` separator passes args to vitest
- ✅ **CHECK** package.json if unsure about script definitions

### 🚨 CRITICAL TEST PERFORMANCE RULES (AI Assistant Must Follow)

**MAXIMUM TEST EXECUTION TIME: 1 MINUTE**

### ✅ REQUIRED Test Performance Actions
- **Cancel tests immediately** if they run longer than 1 minute
- **Consider test failed** if execution exceeds 60 seconds
- **Report timeout issue** to user with specific test pattern that failed
- **Suggest test optimization** or splitting large test suites

### ❌ FORBIDDEN Test Performance Practices
```bash
# ❌ NEVER let tests run over 1 minute
npm test -- --timeout=120000     # ❌ Don't increase timeouts
npm test -- someSlowPattern      # ❌ Cancel if over 60s
npm test -- --coverage           # ❌ Cancel if over 60s
```

### Test Performance Guidelines
- **Individual tests**: Should complete in seconds, not minutes
- **Test suites**: Full suite should run under 30 seconds ideally
- **Specific patterns**: Even targeted tests shouldn't exceed 1 minute
- **Coverage reports**: Should be fast or run separately

### When Tests Timeout (Over 1 minute)
1. **Immediately cancel** the test execution
2. **Report to user**: "Tests exceeded 1-minute limit and were cancelled"
3. **Identify the issue**: Slow test files, infinite loops, or performance problems
4. **Suggest solutions**: Split tests, optimize code, or check for blocking operations
5. **Never wait longer**: 1 minute is the absolute maximum

### Code Quality
```bash
npm run lint         # Run ESLint
npm run analyze      # Generate codebase statistics report
```

## API Proxy Configuration
Development server proxies API requests:
- `/api/tranzy` → `https://api.tranzy.ai` (single data source for all transit data)

## Performance Optimizations
- React deduplication in Vite config
- Manual chunk splitting for vendors
- HMR and WebSocket disabled for stability
- Dependency optimization for core libraries

## Version Management

### When to Update Version
**CRITICAL: Update app version for all major changes including:**
- New features or significant improvements
- Bug fixes that affect user experience
- Performance optimizations
- API changes or integrations
- UI/UX improvements
- Security updates

### Version Update Process
1. **Update package.json version** using semantic versioning (semver)
2. **Run version update script** to sync across all files
3. **Test locally** to verify version appears correctly
4. **Deploy to production** with new version visible to users

### Commands
```bash
# For major changes (recommended workflow):
node scripts/update-version.js    # Updates timestamp-based version in SW and HTML
npm version patch                 # Updates semantic version in package.json

# Alternative semantic versioning:
npm version patch         # Bug fixes (1.0.0 → 1.0.1)
npm version minor         # New features (1.0.0 → 1.1.0)  
npm version major         # Breaking changes (1.0.0 → 2.0.0)
```

### AI Assistant Workflow
**When making major changes, always:**
1. Run `node scripts/update-version.js` to update cache-busting version
2. Update `package.json` version appropriately (patch/minor/major)
3. Mention version update in commit/summary

### Version Display
- Version shown in app footer via MaterialVersionControl component
- Helps users and developers track which version is running
- Essential for debugging and support

## Development Server Management

### AI Assistant Process Management Rules
**CRITICAL: Always use Kiro's built-in process management tools instead of system commands**

#### **Required Workflow for Starting Dev Server:**
1. **Always check existing processes first** using `listProcesses()`
2. **Look for "npm run dev" process** in the results
3. **Handle based on process state:**
   - **If running and under Kiro control:** Do nothing, inform user server is available at http://localhost:5175
   - **If running but NOT under Kiro control:** Ask user to restart the server manually, don't attempt to control it
   - **If stopped:** Restart using `controlBashProcess` with action="start"
   - **If not found:** Start new process using `controlBashProcess` with action="start"
4. **Never use aggressive system commands** like `lsof`, `kill -9`, or `pkill`
5. **Never attempt to control external processes** unless explicitly asked by the user

#### **Process Management Commands:**
```javascript
// Check existing processes
listProcesses()

// Start dev server (if none exists or stopped)
controlBashProcess({
  action: "start",
  command: "npm run dev",
  path: "." // workspace root
})

// Stop dev server (if needed)
controlBashProcess({
  action: "stop", 
  processId: <processId from listProcesses>
})
```

#### **Error Handling:**
- **Port conflict from external process:** Ask user to manually stop the conflicting process
- **Process start failure:** Check package.json and dependencies before retrying
- **Never force-kill processes:** Respect user's running processes

#### **User Communication:**
- **Process already running (under Kiro control):** "Dev server is already running at http://localhost:5175"
- **Process already running (external):** "Dev server appears to be running externally. Please restart it manually if you need me to manage it."
- **Restarting stopped process:** "Restarting existing dev server process..."
- **Starting new process:** "Starting development server..."
- **External conflict:** "Port 5175 appears to be in use by another process. Please stop it manually and try again."

#### **Benefits of This Approach:**
- ✅ Clean, controlled process management
- ✅ No aggressive system commands
- ✅ Respects user's existing processes
- ✅ Leverages Kiro's built-in infrastructure
- ✅ Provides clear user feedback
- ✅ Handles all scenarios gracefully

## Clean Architecture Philosophy

### 🚨 CRITICAL: No Backward Compatibility or Legacy Support

**ALWAYS aim for clean, fresh architecture with full cleanup when refactoring**

#### **Core Principles:**
- **Clean slate approach**: Remove old code completely, don't maintain compatibility layers
- **Full cleanup**: Delete deprecated files, unused imports, and legacy patterns
- **Fresh architecture**: Design new solutions from scratch rather than patching old ones
- **No migrations**: Replace systems entirely rather than gradual transitions
- **Complete removal**: When refactoring, remove all traces of old implementation

#### **Refactoring Rules:**
- ❌ **NEVER maintain backward compatibility** - Clean break from old patterns
- ❌ **NEVER create migration layers** - Replace systems completely
- ❌ **NEVER keep deprecated code** - Delete old implementations entirely
- ❌ **NEVER support legacy patterns** - Force adoption of new architecture
- ❌ **NEVER gradual transitions** - Make complete architectural changes

#### **Implementation Approach:**
- ✅ **Complete replacement**: Remove old system, implement new one
- ✅ **Full cleanup**: Delete all related old files and imports
- ✅ **Fresh patterns**: Use modern approaches without legacy constraints
- ✅ **Clean interfaces**: Design new APIs without old system baggage
- ✅ **Immediate adoption**: Switch to new architecture in single change

#### **Benefits of Clean Architecture:**
- **Simplified codebase**: No legacy code or compatibility layers
- **Modern patterns**: Use latest best practices without constraints
- **Reduced complexity**: Single implementation path, no branching logic
- **Better performance**: No overhead from compatibility layers
- **Easier maintenance**: Clean, consistent architecture throughout
- **Faster development**: No need to support multiple patterns

#### **Examples:**
```typescript
// ❌ BAD: Maintaining compatibility
class NewService {
  // New implementation
  newMethod() { ... }
  
  // Legacy support - DON'T DO THIS
  @deprecated
  oldMethod() { return this.newMethod(); }
}

// ✅ GOOD: Clean replacement
class NewService {
  // Only new implementation
  newMethod() { ... }
}
// Delete old service file completely
```

#### **Refactoring Workflow:**
1. **Design new architecture** - Plan complete replacement
2. **Implement new system** - Build fresh solution
3. **Update all usage** - Change all references at once
4. **Delete old code** - Remove files, imports, and patterns completely
5. **Clean up tests** - Update tests for new architecture only
6. **Update documentation** - Document new approach, remove old references

**Remember: Clean architecture means clean breaks. No legacy support, no backward compatibility, no gradual migrations. Always aim for the cleanest, most modern solution.**

## Minimal Code Generation Philosophy

### 🚨 CRITICAL: Avoid Creating New Code Unless Absolutely Necessary

**ALWAYS prioritize smart, lean, lightweight approaches with minimal code generation**

#### **Core Principles:**
- **Reuse over create**: Extend existing code rather than writing new files
- **Minimal implementation**: Write only essential code, avoid verbose solutions
- **Smart solutions**: Find clever approaches that require less code
- **Lightweight patterns**: Prefer simple solutions over complex architectures
- **Critical file size limit**: Files over 200 lines require serious reconsideration

#### **Code Generation Rules:**
- ❌ **NEVER create new files** unless absolutely necessary for functionality
- ❌ **NEVER write verbose implementations** - Keep code concise and focused
- ❌ **NEVER generate files over 200 lines** without critical justification
- ❌ **NEVER create duplicate functionality** - Reuse existing patterns
- ❌ **NEVER over-engineer solutions** - Simple is better than complex

#### **Implementation Approach:**
- ✅ **Extend existing files**: Add functionality to current components/services
- ✅ **Reuse patterns**: Leverage existing architecture and utilities
- ✅ **Minimal additions**: Write only the essential code needed
- ✅ **Smart abstractions**: Create reusable utilities instead of duplicating code
- ✅ **Lean solutions**: Prefer configuration over code generation

#### **File Size Guidelines:**
- **Target**: Under 100 lines for new files
- **Warning**: 100-200 lines requires justification
- **Critical**: Over 200 lines needs serious reconsideration
- **Exception**: Only for absolutely necessary core functionality

#### **Before Creating New Code, Ask:**
1. **Can I extend existing functionality?** - Modify current files instead
2. **Can I reuse existing patterns?** - Leverage current architecture
3. **Can I solve this with configuration?** - Avoid code with smart config
4. **Can I make this simpler?** - Reduce complexity and lines of code
5. **Is this absolutely necessary?** - Challenge the need for new code

#### **Smart Alternatives to New Code:**
- **Configuration-driven**: Use JSON/config files instead of code
- **Composition patterns**: Combine existing components creatively
- **Utility functions**: Small, reusable helpers instead of large classes
- **Hook extensions**: Extend existing React hooks with new behavior
- **Type-only additions**: Use TypeScript types instead of runtime code

#### **Examples:**
```typescript
// ❌ BAD: Creating new 300-line service
class ComplexNewService {
  // 300 lines of new code...
}

// ✅ GOOD: Extending existing service with minimal addition
// Add 10-20 lines to existing service instead
const existingService = {
  ...currentService,
  newMethod: () => { /* minimal implementation */ }
}
```

#### **Code Review Checklist:**
- ✅ **File under 200 lines?** - If not, split or reconsider
- ✅ **Reusing existing patterns?** - Don't reinvent the wheel
- ✅ **Minimal implementation?** - No unnecessary complexity
- ✅ **Absolutely necessary?** - Challenge every new file creation
- ✅ **Smart solution?** - Could this be done with less code?

**Remember: The best code is no code. The second best code is minimal, smart, reusable code that extends existing functionality rather than creating new complexity.**