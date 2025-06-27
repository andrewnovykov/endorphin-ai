# Development Testing Guide

This guide is for **developers** testing the current development version of Endorphin AI from source code.

## Prerequisites

- Node.js 18+ installed
- npm installed  
- Git repository cloned locally
- Terminal/command line access

## Quick Start (5 minutes)

```bash
# 1. Navigate to the Endorphin AI repository
cd /path/to/endorphin-ai

# 2. Install dependencies (if not already done)
npm install

# 3. Build and test current development version
npm run test:local
```

That's it! The `npm run test:local` command will:
- Build the current code
- Create a package tarball in `dist/`
- Run comprehensive package tests
- Validate all functionality

## Detailed Step-by-Step Testing

### Step 1: Repository Setup

```bash
# Clone repository (if needed)
git clone https://github.com/andrewnovykov/endorphin-ai
cd endorphin-ai

# Install dependencies
npm install

# Verify Node.js version
node --version  # Should be 18+
```

### Step 2: Build Current Version

```bash
# Build TypeScript to JavaScript
npm run build

# Create package tarball for testing
npm run pack:local
```

This creates `dist/endorphin-ai-0.5.0.tgz` with the current development code.

### Step 3: Create Test Environment

```bash
# Create a clean test directory outside the repo
mkdir ~/endorphin-test-dev
cd ~/endorphin-test-dev

# Initialize npm project
npm init -y

# Set to ES module mode
npm pkg set type="module"
```

### Step 4: Install Development Package

```bash
# Install from local tarball
npm install /path/to/endorphin-ai/dist/endorphin-ai-0.5.0.tgz

# Verify installation
npx endorphin --version
# Should show: Endorphin AI v0.5.0
```

### Step 5: Initialize Project

```bash
# Initialize Endorphin project
npx endorphin init
```

**Expected Results:**
- ✅ Creates `endorphin.config.js` (not `.ts`)
- ✅ Creates `tests/sample-test.js` (not `.ts`)  
- ✅ Creates `.env`, `.gitignore`, `README-ENDORPHIN.md`
- ✅ Creates directories: `tests/`, `test-results/`, `test-recorder/`

### Step 6: Test Discovery

```bash
# List available tests
npx endorphin list
```

**Expected Output:**
```
📋 Available Tests:
🔍 Discovering tests in: .../tests
📋 Found 1 test file(s):
   📄 sample-test.js
   ✓ HEALTH-001: Framework Health Check
✅ Loaded 1 test(s) total

🎯 High Priority:
  HEALTH-001: Framework Health Check [health, smoke, example]
    📄 File: sample-test.js
    📝 Verify basic framework functionality...
```

- ✅ No TypeScript loading errors
- ✅ Finds `.js` test files
- ✅ Loads test definitions correctly

### Step 7: Test Execution (Optional - Requires API Key)

```bash
# Add API key to .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Run sample test in headless mode
npx endorphin run test HEALTH-001 --headless
```

**Without API Key:** Commands will execute but fail with "Missing API key" error. This is expected and confirms the CLI is working.

### Step 8: Test Reporter

```bash
# Try to generate report (will show "no test results" message)
npx endorphin generate report
```

**Expected:** Command executes and shows helpful message about running tests first.

### Step 9: Verify CLI Commands

```bash
# Test all CLI commands
npx endorphin --help
npx endorphin --version
npx endorphin list
npx endorphin generate report --list
```

All commands should execute without errors and show appropriate output/help.

## Automated Testing

For comprehensive validation, run the automated test suite:

```bash
# From the repository root
npm run test:local
```

This runs the same tests that validate the package before release.

## Common Issues & Solutions

### "Command does nothing" / No output

**Symptoms:** Commands execute but show no output or seem to hang.

**Solutions:**
1. **Check ES modules:** Ensure test project has `"type": "module"` in `package.json`
2. **Check file extensions:** All config and test files should be `.js`, not `.ts`
3. **Use direct execution:** Try `node node_modules/endorphin-ai/dist/bin/endorphin.js list`
4. **Check API key:** Some commands require valid OpenAI API key for full execution

### TypeScript Loading Errors

**Symptoms:** `Error: Unknown file extension ".ts"`

**Solutions:**
1. Re-run `npx endorphin init` - should create `.js` files
2. Check that installed package has `.js` examples (not `.ts`)
3. Verify `npm run pack:local` was run to get latest build

### Module Import Errors

**Symptoms:** `Cannot find package '@core/...'` errors

**Solutions:**
1. Re-run `npm run build` to ensure imports are resolved
2. Check that TypeScript compilation completed successfully
3. Verify `dist/` directory contains compiled JavaScript

### Package Not Found

**Symptoms:** `npx endorphin` command not found

**Solutions:**
1. Verify installation: `npm list endorphin-ai`
2. Check tarball exists: `ls /path/to/endorphin-ai/dist/*.tgz`
3. Reinstall: `npm install /path/to/endorphin-ai/dist/endorphin-ai-0.5.0.tgz`

## Development Workflow

When making changes to the framework:

1. **Make code changes**
2. **Test changes:**
   ```bash
   npm run test:local
   ```
3. **Manual verification:**
   ```bash
   cd ~/endorphin-test-dev
   npm install /path/to/endorphin-ai/dist/endorphin-ai-0.5.0.tgz --force
   npx endorphin list  # Test your changes
   ```

## Testing Without API Key

For development testing without an OpenAI API key:

1. **CLI Commands:** All work without API key
2. **Test Discovery:** Works without API key  
3. **Init/List/Help:** All work without API key
4. **Test Execution:** Will fail gracefully with clear error message
5. **Reporters:** Work with mock/existing test results

## Expected Success Indicators

✅ **Installation:** Package installs without npm errors  
✅ **Initialization:** Creates `.js` files, not `.ts` files  
✅ **Discovery:** `npx endorphin list` shows tests without errors  
✅ **CLI:** All commands execute and show appropriate output  
✅ **Configuration:** Config files load without syntax errors  
✅ **Error Handling:** Clear error messages for missing API key, etc.

If all these work, your development version is ready for testing/release!