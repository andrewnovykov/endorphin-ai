# TODO: Fix Framework CLI and ES Module Issues

## Current Issues Identified
1. ❌ CLI command should be `endorphin` not `endorphin-ai` 
2. ❌ ES Module loading errors: "Unexpected token 'export'"
3. ❌ Config loader doesn't handle ES modules properly
4. ❌ Test discovery fails to load test files with ES modules
5. ❌ Framework tests still have failures (31 failed, 71 passed)

## Step-by-Step Implementation Plan

### ✅ Step 1: Create Todo File
- [x] Create `ai-instructions/todo-1o.md`
- [x] Document current issues and plan

### ✅ Step 2: Update Package.json CLI Command
- [x] Verify `"endorphin": "bin/endorphin.js"` in package.json is correct
- [x] Update copilot instructions to reflect `endorphin` command
- [x] Test CLI command works

### ✅ Step 3: Fix Config Loader for ES Modules (COMPLETED)
- [x] Framework already has `pathToFileURL` usage
- [x] Framework already has proper ES module import handling
- [x] Framework already has cache busting for development
- [x] Config loading works correctly

### ✅ Step 4: Fix Test Discovery for ES Modules (COMPLETED)
- [x] Updated `framework/core/test-discovery.js` for ES module imports
- [x] Added config parameter support to all discovery functions
- [x] Fixed test validation to support execute functions
- [x] Test discovery now works with real examples
- [x] All test discovery tests passing

### 🔧 Step 5: Fix Browser Framework Constructor Issues
- [x] Fixed constructor to accept config parameter
- [x] Added getBrowserType method
- [x] Updated initialization to use instance config
- [ ] Test browser framework tests

### ✅ Step 6: Update CLI Help Text
- [x] Change all references from `endorphin-ai` to `endorphin`
- [x] Update examples in help text
- [x] Test help command

### 🔄 Step 6: Fix Framework Constructor Config Issue
- [ ] Fix `EnhancedBrowserTestFramework` constructor to accept config
- [ ] Update browser framework tests to match actual implementation
- [ ] Test framework initialization

### 🔄 Step 7: Create User Setup Guide
- [ ] Create setup instructions for ES modules
- [ ] Document package.json requirements
- [ ] Test complete user workflow

### 🔄 Step 8: Run Health Check
- [ ] Test CLI functionality
- [ ] Test config loading
- [ ] Test test discovery  
- [ ] Test framework tests
- [ ] Verify overall framework health

### ✅ Step 9: Create in doc folder doc Mainteiners.md and explain how to test and how to dev this app
- [x] Created comprehensive Maintainers.md guide
- [x] Documented development setup and prerequisites
- [x] Explained testing framework and test categories
- [x] Detailed architecture overview and data flow
- [x] Provided development workflow and best practices
- [x] Added debugging guides and troubleshooting
- [x] Documented release process and contribution guidelines

## Current Status
- **Started**: Step 1 ✅
- **In Progress**: Step 2
- **Next**: Steps 3-8
