# Critical Issues Fix & Test Framework Overhaul - Complete Roadmap

## Overview
This document outlines the comprehensive plan to fix all critical runtime issues and overhaul the test framework to prevent future failures.

## Status: ✅ Phase 1 Complete - Function-Based Tasks & Debug Logging

### ✅ Completed: Enhanced Test Framework Features

1. **Function-Based Tasks Implementation**
   - ✅ Added `TestTaskFunction` type supporting `(data?, setupData?) => string`
   - ✅ Updated `TestConfig.task` to accept both string and function
   - ✅ Updated browser engine to execute task functions with generated data
   - ✅ Updated example tests to use new function-based approach
   - ✅ Maintained backward compatibility with string tasks

2. **Enhanced Debug Logging**
   - ✅ Added global setup execution logging with `ENDORPHIN_DEBUG` control
   - ✅ Added custom tool debug logging with name and parameters
   - ✅ Added comprehensive environment variables (30+ options)
   - ✅ Created detailed environment variables documentation

3. **Example Updates**
   - ✅ `sample-test.ts` now uses function-based task with data access
   - ✅ `ui-demo.ts` now uses function-based task with generated data
   - ✅ Both examples demonstrate data flow: setup() → data() → task(data, setupData)

## Phase 2: Critical Runtime Issues (Still Pending)

### 🔴 CRITICAL: Fix __dirname Error in HTML Reporter
- **Status**: NOT FIXED
- **Issue**: `__dirname is not defined` in ES modules
- **Location**: HTML reporter generation
- **Impact**: HTML reports cannot be generated
- **Fix Required**: Replace `__dirname` with `import.meta.url` and `fileURLToPath`

### 🔴 CRITICAL: Fix MaxListenersExceeded Warning (Still Occurring)
- **Status**: PARTIALLY FIXED
- **Issue**: "Possible EventTarget memory leak detected. 11 abort listeners"
- **Root Cause**: AbortSignal listeners not being cleaned up properly
- **Current Status**: Added some cleanup but warning still appears
- **Fix Required**: Complete AbortController cleanup in browser operations

### 🔴 CRITICAL: Fix Test Recorder Data Format (Regression)
- **Status**: PARTIALLY FIXED IN FRAMEWORK, BROKEN IN RECORDER
- **Issue**: Test recorder still generating `"testData": {}` instead of `data: async () => {}`
- **Location**: Test recorder output generation
- **Evidence**: User reports recorder still creates old format
- **Fix Required**: Update test recorder to generate new format

### 🔴 CRITICAL: Fix Dual Browser Problem (Still Exists)
- **Status**: PARTIALLY FIXED
- **Issue**: Multiple browser instances still being created
- **Evidence**: User confirms "double browser problem still exist"
- **Fix Required**: Deeper framework architecture fix for proper singleton

### 🔴 CRITICAL: Fix Test Abort Issues
- **Status**: NOT FIXED
- **Issue**: Tests failing with "Aborted" error
- **Evidence**: Error logs show "❌ Test HEALTH-001 failed: Aborted"
- **Root Cause**: Timeout/signal handling problems
- **Priority**: Critical for test reliability

## Phase 3: Test Framework Overhaul (Pending)

### 🟡 Fix Jest Configuration Issues
- **Issue**: ts-jest preset not found, module resolution problems
- **Impact**: Integration tests cannot run properly
- **Fix Required**: Complete Jest config overhaul with proper ES module support

### 🟡 Replace Useless Unit Tests with Integration Tests
- **Issue**: Current tests are mocked and don't catch real problems
- **Evidence**: 421/421 tests passed but framework was completely broken
- **Solution**: 
  - Keep only essential unit tests
  - Focus on integration tests that test real functionality
  - Add build validation tests
  - Add package distribution tests

### 🟡 Add Critical Runtime Validation Tests
- **Tests Needed**:
  - Template path resolution
  - Browser instance management
  - Event listener cleanup
  - Module import resolution
  - CLI functionality
  - HTML report generation

### 🟡 Fix Package Dependencies
- **Issue**: Missing dependencies causing import failures
- **Evidence**: "Cannot find package 'dotenv'" and similar errors
- **Fix Required**: Audit and fix all dependencies, dev dependencies

## Phase 4: Framework Architecture Fixes (Pending)

### 🟡 ES Module Compatibility
- **Issue**: Mixed CJS/ESM causing import/export problems
- **Fix Required**: Ensure consistent ES module usage throughout

### 🟡 Browser Management Architecture
- **Issue**: Browser instances not properly managed
- **Fix Required**: Implement singleton pattern for browser management

### 🟡 AbortController/Signal Management
- **Issue**: Improper cleanup causing memory leaks
- **Fix Required**: Proper lifecycle management for all async operations

### 🟡 Error Handling Improvements
- **Issue**: Tests failing silently or with unclear errors
- **Fix Required**: Better error reporting and handling

## Phase 5: Build & Distribution Fixes (Pending)

### 🟡 Fix Build Process
- **Issue**: Build not properly handling ES modules
- **Fix Required**: Update TypeScript compilation and import fixing

### 🟡 Fix Package.json Dependencies
- **Issue**: Circular dependency and missing dependencies
- **Fix Required**: Clean up dependencies, remove circular references

### 🟡 Fix Template & Asset Copying
- **Issue**: Templates not properly copied in distribution
- **Fix Required**: Update build script for proper asset handling

## Implementation Priority Order

### Immediate (This Week)
1. **Fix __dirname Error** - Blocks HTML report generation
2. **Fix MaxListenersExceeded** - Memory leak issue
3. **Fix Test Recorder Data Format** - User-facing feature broken
4. **Fix Dual Browser Issue** - Resource waste and confusion

### High Priority (Next Week)
1. **Fix Test Abort Issues** - Test reliability critical
2. **Jest Configuration Overhaul** - Enable proper testing
3. **Add Integration Tests** - Prevent future regressions
4. **Build Process Fixes** - Distribution reliability

### Medium Priority (Following Weeks)
1. **Framework Architecture Improvements**
2. **Package Dependencies Cleanup**
3. **Error Handling Improvements**
4. **Documentation Updates**

## Success Criteria

### Phase 2 Success (Critical Fixes)
- [ ] `npm run build && npm pack` succeeds without errors
- [ ] HTML reports generate successfully
- [ ] No MaxListenersExceeded warnings
- [ ] Test recorder generates correct data format
- [ ] Only one browser instance opens per test
- [ ] Tests complete without "Aborted" errors

### Phase 3 Success (Test Framework)
- [ ] Jest tests run without configuration errors
- [ ] Integration tests catch real runtime failures
- [ ] Build validation tests pass
- [ ] Package distribution tests pass

### Phase 4 Success (Architecture)
- [ ] Clean ES module usage throughout
- [ ] Proper browser instance management
- [ ] No memory leaks
- [ ] Clear error messages

### Phase 5 Success (Distribution)
- [ ] Successful npm package creation
- [ ] Proper template/asset copying
- [ ] Clean dependency tree

## Evidence of Issues (User Reports)

From `roadmap/todo/error.md`:
```
❌ Test HEALTH-001 failed: Aborted
❌ Error: __dirname is not defined
also double browser problem still exist
also test recorder create "testData": { "email": "papapin777@gmail.com" } 
but should create data: async () => { return { "email": "papapin777@gmail.com" } }
```

## Next Actions

1. **Immediate**: Fix __dirname error in HTML reporter
2. **Then**: Complete MaxListenersExceeded cleanup
3. **Then**: Fix test recorder data format generation
4. **Then**: Investigate and fix dual browser issue
5. **Then**: Debug and fix test abort issues

This roadmap will be updated as issues are resolved and new problems are discovered.