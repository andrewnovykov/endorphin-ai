# Development Testing Guide

This guide is for **developers** testing the current development version of
Endorphin AI from source code.

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

- Build TypeScript source to JavaScript in `dist/`
- Create a package tarball in `dist/`
- Run comprehensive package tests
- Validate all functionality

⚠️ **Important**: For manual testing, always use **direct node execution**
instead of `npx` commands to avoid binary linking issues.

## TypeScript-First Experience

🎯 **Major Change**: Endorphin AI now provides a **TypeScript-first user experience**:

- ✅ Users write `endorphin.config.ts` (TypeScript configuration)
- ✅ Users write `tests/my-test.ts` (TypeScript test files)
- ✅ Framework automatically handles TypeScript compilation using `tsx`
- ✅ No build step required for end users
- 🔧 **Framework still distributes compiled JavaScript** for compatibility

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
# Build TypeScript source to JavaScript dist/ folder
npm run build

# Create package tarball for testing
npm run pack:local
```

This creates `dist/endorphin-ai-0.5.0.tgz` with the current development code.

**🔧 Why `dist/` is still needed:**
- Package distribution requires compiled JavaScript
- CLI binary points to `dist/bin/endorphin.js`
- npm package main entry is `dist/framework/index.js`
- Users get TypeScript experience, framework ships JavaScript

### Step 3: Create Test Environment

```bash
# IMPORTANT: Use absolute paths to avoid directory issues
# Create test directory in the project tmp folder
cd /path/to/endorphin-ai
mkdir -p tmp/manual-test
cd tmp/manual-test

# Initialize npm project
npm init -y

# Set to ES module mode
npm pkg set type="module"
```

**Note**: Using `tmp/manual-test` keeps the test isolated and prevents directory
access issues.

### Step 4: Install Development Package

```bash
# Install from local tarball
npm install ../../dist/endorphin-ai-0.5.0.tgz

# Verify installation using direct node execution
node node_modules/endorphin-ai/dist/bin/endorphin.js --version
# Should show: Endorphin AI v0.5.0
```

### Step 5: Initialize Project (TypeScript Experience)

```bash
# Initialize Endorphin project using direct node execution
node node_modules/endorphin-ai/dist/bin/endorphin.js init
```

**Expected Results (TypeScript-First Experience):**

- ✅ Creates `endorphin.config.ts` (TypeScript config file)
- ✅ Creates `tests/sample-test.ts` (TypeScript test file)
- ✅ Creates `.env`, `.gitignore`, `README-ENDORPHIN.md`
- ✅ Creates directories: `tests/`, `test-results/`, `test-recorder/`

### Step 6: Test Discovery (TypeScript Loading)

```bash
# List available tests using direct node execution
node node_modules/endorphin-ai/dist/bin/endorphin.js list
```

**Expected Output:**

```
📋 Available Tests:
🔍 Discovering tests in: .../tests
📋 Found 1 test file(s):
   📄 sample-test.ts
   ✓ HEALTH-001: Framework Health Check
✅ Loaded 1 test(s) total

🎯 High Priority:
  HEALTH-001: Framework Health Check [health, smoke, example]
    📄 File: sample-test.ts
    📝 Verify basic framework functionality...
```

**✅ TypeScript Magic Happens Here:**
- Framework automatically detects `.ts` files
- Uses `tsx` to compile TypeScript on-the-fly
- No build step required for users
- Full TypeScript IntelliSense and type checking

### Step 7: Verify TypeScript Configuration

```bash
# Check that TypeScript config was created
cat endorphin.config.ts
```

**Expected:** Valid TypeScript configuration with proper exports and types.

```bash
# Check that TypeScript test was created
cat tests/sample-test.ts
```

**Expected:** TypeScript test file with proper type annotations.

### Step 8: Test Execution (Optional - Requires API Key)

```bash
# Add API key to .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Run sample test in headless mode using direct node execution
node node_modules/endorphin-ai/dist/bin/endorphin.js run test HEALTH-001 --headless
```

**Without API Key:** Commands will execute but fail with "Missing API key"
error. This is expected and confirms the CLI is working.

### Step 9: Test Reporter

```bash
# Try to generate report (will show "no test results" message)
node node_modules/endorphin-ai/dist/bin/endorphin.js generate report
```

**Expected:** Command executes and shows helpful message about running tests
first.

### Step 10: Test Interactive Test Recorder

The test recorder is a key feature that allows users to create tests interactively. Test it thoroughly:

```bash
# Start the interactive test recorder
node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder
```

**Expected Interactive Flow:**

1. **Test Data Collection Phase:**
   ```
   📋 Test Data Collection
   ════════════════════════════════════════
   Test ID (e.g., QE-012): TEST-RECORDER-001
   Test Name: Recorder Test
   Test Description: Testing the interactive recorder functionality
   Priority (High/Medium/Low) [Medium]: High
   Tags (comma-separated): recorder, interactive
   Site URL [https://qafromla.herokuapp.com/]: https://demo.playwright.dev/todomvc
   
   🔧 Test Data (for form filling, login, etc.)
   Press Enter to skip any field
   User ID: 
   Email: 
   Password: 
   First Name: 
   Last Name: 
   ```

2. **Framework Initialization:**
   ```
   🚀 Initializing browser...
   🛠️ Setting up browser automation tools...
   🤖 Setting up AI agent...
   ✅ Framework initialized successfully!
   ```

3. **Interactive Command Phase:**
   ```
   🌐 Navigating to: https://demo.playwright.dev/todomvc
   
   💬 Ready for interactive commands!
   Type your commands or "done" to finish recording.
   
   🎬 Next step: add a todo item "Test recording"
   🤖 Processing: "add a todo item "Test recording""
   
   🎬 Next step: mark the todo as completed
   🤖 Processing: "mark the todo as completed"
   
   🎬 Next step: done
   🛑 Stopping recording...
   ```

4. **Test Generation:**
   ```
   📝 Generating test file...
   ✅ Test recorded and saved to: test-recorder/TEST-RECORDER-001.ts
   ```

**What to Test:**

✅ **Data Collection**: All prompts work and accept input  
✅ **Browser Launch**: Framework initializes without errors  
✅ **Navigation**: Navigates to specified URL correctly  
✅ **AI Processing**: Commands are processed by AI agent  
✅ **Recording**: Steps are recorded with proper metadata  
✅ **File Generation**: Test file is created in test-recorder directory  
✅ **Error Handling**: Graceful handling of invalid commands  
✅ **Exit**: Clean exit when typing "done"  

**Testing Without API Key:**
```bash
# Test recorder behavior without API key
# Should fail gracefully with clear error message about missing OPENAI_API_KEY
```

**Verify Generated Test File:**
```bash
# Check that test file was created
ls test-recorder/
cat test-recorder/TEST-RECORDER-001.ts
```

**Expected Generated Test Structure:**
```typescript
export const TEST_RECORDER_001 = {
  id: 'TEST-RECORDER-001',
  name: 'Recorder Test',
  description: 'Testing the interactive recorder functionality',
  priority: 'High',
  tags: ['recorder', 'interactive'],
  site: 'https://demo.playwright.dev/todomvc',
  testData: {},
  task: `Recorded test session:
1. Navigate to https://demo.playwright.dev/todomvc
2. add a todo item "Test recording"
3. mark the todo as completed`,
};
```

### Step 11: Verify CLI Commands

```bash
# Test all CLI commands using direct node execution
node node_modules/endorphin-ai/dist/bin/endorphin.js --help
node node_modules/endorphin-ai/dist/bin/endorphin.js --version
node node_modules/endorphin-ai/dist/bin/endorphin.js list
node node_modules/endorphin-ai/dist/bin/endorphin.js generate report --list
```

All commands should execute without errors and show appropriate output/help.

## Architecture: TypeScript UX + JavaScript Distribution

```
Source Code (framework/)     Distribution (dist/)      User Experience
├── *.ts files              ├── *.js files            ├── *.ts files
├── TypeScript source       ├── Compiled JS           ├── No build needed
└── Development             └── npm package           └── tsx auto-compile
```

**Key Points:**
1. **Framework Development**: Write TypeScript in `framework/` folder
2. **Distribution**: Build compiles to `dist/` for npm package
3. **User Experience**: Users write TypeScript, framework handles compilation
4. **No User Build Step**: `tsx` handles TypeScript execution automatically

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

1. **Check ES modules:** Ensure test project has `"type": "module"` in
   `package.json`
2. **NPX binary linking issue:** Use direct execution instead:

   ```bash
   # Instead of: npx endorphin init
   node node_modules/endorphin-ai/dist/bin/endorphin.js init

   # Instead of: npx endorphin list
   node node_modules/endorphin-ai/dist/bin/endorphin.js list
   ```

3. **Reinstall package:** Force reinstall the tarball:
   ```bash
   npm install /path/to/endorphin-ai/dist/endorphin-ai-0.5.0.tgz --force
   ```
4. **Check API key:** Some commands require valid OpenAI API key for full
   execution

### Directory Access Errors

**Symptoms:** `getcwd: cannot access parent directories: No such file or directory` or `Error: ENOENT: no such file or directory, uv_cwd`

**Cause:** The test directory was deleted while you're still in it (often by cleanup scripts).

**Solutions:**

1. **Navigate back and recreate:**
   ```bash
   # Return to main project
   cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
   
   # Remove and recreate test directory
   rm -rf tmp/manual-test
   mkdir -p tmp/manual-test
   cd tmp/manual-test
   
   # Reinitialize
   npm init -y
   npm pkg set type="module"
   npm install ../../dist/endorphin-ai-0.5.0.tgz
   ```

2. **Use absolute paths:** Always navigate with full paths to prevent issues
3. **Avoid cleanup:** Don't run `npm run cleanup` while in test directories

### TypeScript Loading Errors

**Symptoms:** `Error: Unknown file extension ".ts"` or `Cannot find module 'tsx'`

**Solutions:**

1. **Verify tsx dependency:** Framework should include `tsx` as dependency
   ```bash
   # Check if tsx is available in the installed package
   ls node_modules/endorphin-ai/node_modules/tsx
   ```
2. **Re-run init:** Delete and recreate TypeScript files
   ```bash
   rm -f endorphin.config.* tests/*.ts
   node node_modules/endorphin-ai/dist/bin/endorphin.js init
   ```
3. **Check package build:** Ensure `npm run pack:local` was run with latest TypeScript support
4. **Fallback test:** Framework should gracefully fallback if TypeScript loading fails

### Test Recorder Issues

**Symptoms:** Test recorder hangs, doesn't respond, or crashes during interaction

**Solutions:**

1. **Check API Key:** Ensure OPENAI_API_KEY is set in .env file
   ```bash
   # Verify API key is present
   grep OPENAI_API_KEY .env
   ```

2. **Browser Launch Issues:** If browser doesn't launch
   ```bash
   # Install Playwright browsers
   npx playwright install
   ```

3. **Interactive Input Hanging:** If prompts don't respond to input
   - Try using different terminal (iTerm2, Terminal.app, etc.)
   - Check if running in CI environment (not supported)
   - Ensure stdin/stdout are properly connected

4. **AI Agent Timeout:** If commands take too long to process
   ```bash
   # Run with shorter timeout
   node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder --timeout 30000
   ```

5. **File Generation Fails:** If test file isn't created
   ```bash
   # Check if test-recorder directory exists and is writable
   ls -la test-recorder/
   touch test-recorder/test-write-permissions
   ```

6. **Memory Issues:** For long recording sessions
   ```bash
   # Run with increased memory
   node --max-old-space-size=4096 node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder
   ```

**Expected Behavior Validation:**
- ✅ Prompts appear and accept input
- ✅ Browser launches in visible mode
- ✅ Navigation to specified URL works
- ✅ AI agent processes commands within reasonable time
- ✅ Each command produces visible browser actions
- ✅ Recording saves to test-recorder/ directory
- ✅ Generated TypeScript file has proper structure

### Module Import Errors

**Symptoms:** `Cannot find package '@core/...'` errors

**Solutions:**

1. Re-run `npm run build` to ensure imports are resolved correctly
2. Check that TypeScript compilation completed successfully
3. Verify `dist/` directory contains all compiled JavaScript files
4. Ensure package.json `"main"` points to correct compiled entry point

### Package Not Found

**Symptoms:** `npx endorphin` command not found

**Solutions:**

1. Verify installation: `npm list endorphin-ai`
2. Check tarball exists: `ls /path/to/endorphin-ai/dist/*.tgz`
3. Reinstall: `npm install /path/to/endorphin-ai/dist/endorphin-ai-0.5.0.tgz`

## Development Workflow

When making changes to the framework:

1. **Make code changes** in `framework/` directory (TypeScript source)
2. **Test changes:**
   ```bash
   npm run test:local
   ```
3. **Manual verification:**
   ```bash
   # Navigate to project root first
   cd /path/to/endorphin-ai
   
   # Rebuild and repack
   npm run pack:local
   
   # Recreate clean test environment
   rm -rf tmp/manual-test
   mkdir -p tmp/manual-test
   cd tmp/manual-test
   
   # Setup and install
   npm init -y
   npm pkg set type="module"
   npm install ../../dist/endorphin-ai-0.5.0.tgz
   
   # Test your changes using direct execution
   node node_modules/endorphin-ai/dist/bin/endorphin.js init
   node node_modules/endorphin-ai/dist/bin/endorphin.js list
   
   # Test the interactive recorder (requires API key)
   echo "OPENAI_API_KEY=your-key-here" > .env
   node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder
   ```

### Quick Test Recorder Validation

For rapid test recorder validation during development:

```bash
# Quick non-interactive test (simulates user input)
echo -e "QUICK-TEST\nQuick Test\nTesting recorder\nHigh\nrecorder\nhttps://example.com\n\n\n\n\n\ndone" | node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder

# Verify test file was created
ls test-recorder/QUICK-TEST.ts
```

## Testing Without API Key

For development testing without an OpenAI API key:

1. **CLI Commands:** All work without API key
2. **Test Discovery:** Works without API key (TypeScript compilation)
3. **Init/List/Help:** All work without API key
4. **Test Execution:** Will fail gracefully with clear error message
5. **Reporters:** Work with mock/existing test results

## Expected Success Indicators

✅ **Installation:** Package installs without npm errors  
✅ **TypeScript-First Init:** Creates `.ts` config and test files  
✅ **TypeScript Discovery:** Lists `.ts` test files without compilation errors  
✅ **CLI Execution:** All commands execute using direct node execution  
✅ **Auto-Compilation:** Framework loads TypeScript files seamlessly  
✅ **Test Execution:** Sample test runs and completes successfully  
✅ **Test Recorder:** Interactive recorder launches and accepts commands  
✅ **File Generation:** Recorder creates valid TypeScript test files  
✅ **Error Handling:** Clear error messages for missing API key, etc.  
✅ **No User Build:** Users never need to run build commands  

## Framework Distribution Model

```
┌─────────────────┐    ├─ npm run build ─┤    ┌─────────────────┐
│   TypeScript    │    │                  │    │   JavaScript    │
│   Source Code   │────┤   Compilation    │───▶│   Distribution  │
│  (framework/)   │    │                  │    │     (dist/)     │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   npm pack      │───▶│  Published NPM  │
                       │   (dist/*.tgz)  │    │    Package      │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  TypeScript UX  │
                                               │  for End Users  │
                                               │ (*.ts files)    │
                                               └─────────────────┘
```

If all these work, your development version is ready for testing/release!