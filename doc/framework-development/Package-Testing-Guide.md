# Package Testing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This guide covers **manual testing of the compiled package** using the tarball approach before publishing to npm. This validates the actual user experience with the compiled JavaScript package.

## Overview

Package testing validates that the **compiled JavaScript package** works correctly in real user environments by:

1. Building the TypeScript source to JavaScript
2. Creating a package tarball 
3. Installing and testing the tarball manually
4. Running automated bash script tests

## Test Structure

```
dev-tests/package-tests/         # Package testing infrastructure
├── run-all-tests.sh            # Main test runner (automated)
├── run-tests-by-category.sh    # Run specific test categories
├── scripts/                    # Individual test scripts
│   ├── init/                   # Init command tests
│   ├── recorder/               # Test recorder tests  
│   ├── reporter/               # Report generation tests
│   └── runner/                 # Test execution tests
├── results/                    # Test execution results and logs
├── tmp/                        # Temporary test environments
└── config/                     # Test configuration
```

## Manual Testing Workflow

### Step 1: Build Package

```bash
# Navigate to framework root
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai

# Build TypeScript to JavaScript
npm run build

# Verify build output
ls -la dist/bin/endorphin.js
ls -la dist/framework/index.js

# Create package tarball
npm pack

# Verify tarball created
ls -la endorphin-ai-*.tgz
```

### Step 2: Create Test Environment

```bash
# Create isolated test directory  
mkdir -p /tmp/manual-package-test
cd /tmp/manual-package-test

# Initialize npm project
npm init -y
npm pkg set type="module"

# Install from local tarball (use absolute path)
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz

# Verify installation
ls -la node_modules/endorphin-ai/
ls -la node_modules/.bin/endorphin
```

### Step 3: Test CLI Commands

```bash
# Test version command
npx endorphin --version
node node_modules/.bin/endorphin --version

# Test help command  
npx endorphin --help
npx endorphin help

# Test init command
npx endorphin init

# Verify files created
ls -la
cat endorphin.config.ts
ls -la tests/
```

### Step 4: Test Core Functionality

```bash
# Add API key (if testing with real AI)
echo "OPENAI_API_KEY=your_key_here" > .env

# List tests
npx endorphin list

# Test discovery
npx endorphin list --verbose

# Run a test (requires API key)
npx endorphin run test HEALTH-001 --headless

# Generate report
npx endorphin generate report
```

### Step 5: Test Interactive Recorder

```bash
# Install Playwright browsers
npx playwright install

# Test recorder (interactive - requires manual input)
npx endorphin run test-recorder

# Verify recorder creates files in USER project
ls -la test-recorder/
```

### Step 6: Validate Package Contents

```bash
# Check package structure
tar -tzf /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz | head -20

# Verify compiled files included
tar -tzf /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz | grep "dist/bin/endorphin.js"
tar -tzf /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz | grep "dist/framework/index.js"

# Check TypeScript definitions
tar -tzf /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz | grep "\.d\.ts"
```

## Automated Testing with Bash Scripts

### Run All Tests

```bash
# Navigate to package tests directory
cd dev-tests/package-tests

# Run complete test suite
./run-all-tests.sh

# View results
./view-results.sh
```

### Run Specific Test Categories

```bash
# Test initialization
./run-tests-by-category.sh init

# Test recorder functionality  
./run-tests-by-category.sh recorder

# Test report generation
./run-tests-by-category.sh reporter

# Test CLI commands
./run-tests-by-category.sh runner
```

### Test Categories Explained

#### 1. Environment Setup Tests
- Package installation validation
- Directory structure verification
- Dependency resolution
- CLI binary availability

#### 2. Init Command Tests (`scripts/init/`)
- Project initialization
- File creation validation
- Configuration setup
- Template generation

#### 3. Test Recorder Tests (`scripts/recorder/`)
- Interactive recorder startup
- File location validation (user project vs framework)
- Session recording functionality
- Test file generation

#### 4. CLI Commands Tests (`scripts/runner/`)
- Version and help commands
- Test discovery and listing
- Test execution (with mocked AI)
- Error handling

#### 5. Report Generation Tests (`scripts/reporter/`)
- Console reporter functionality
- HTML report generation
- Asset copying and paths
- Report data structure

## Manual Testing Scenarios

### Scenario 1: Fresh User Experience

Simulate a brand new user installing Endorphin AI:

```bash
# Create completely fresh environment
rm -rf /tmp/fresh-user-test
mkdir /tmp/fresh-user-test
cd /tmp/fresh-user-test

# Install package
npm init -y
npm pkg set type="module"
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz

# Follow getting started workflow
npx endorphin init
npx endorphin list
echo "OPENAI_API_KEY=sk-test" > .env
npx endorphin run test HEALTH-001 --headless

# Verify user experience
echo "✅ Fresh user test completed"
```

### Scenario 2: TypeScript Project Integration

Test integration with existing TypeScript projects:

```bash
# Create TypeScript project
mkdir /tmp/ts-project-test
cd /tmp/ts-project-test

npm init -y
npm pkg set type="module"
npm install typescript @types/node
npx tsc --init

# Install Endorphin AI
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz

# Test TypeScript integration
npx endorphin init
# Verify endorphin.config.ts is created (TypeScript)
file endorphin.config.ts
```

### Scenario 3: Different Node.js Versions

```bash
# Test with Node 18
nvm use 18
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz
npx endorphin --version

# Test with Node 20  
nvm use 20
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz
npx endorphin --version

# Test with Node 22
nvm use 22
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz
npx endorphin --version
```

### Scenario 4: Global Installation

```bash
# Test global installation
npm install -g /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz

# Test global command
endorphin --version
endorphin init

# Cleanup
npm uninstall -g endorphin-ai
```

## Testing Smart Test Structure (v0.9)

### Test Setup/Data/Task Functions

Create a test with smart structure:

```typescript
// tests/smart-test.ts
export const SMART_TEST = {
  id: 'SMART-001',
  name: 'Smart Test Example',
  description: 'Test smart test structure',
  priority: 'High',
  tags: ['smart'],
  
  setup: async () => {
    return {
      baseUrl: process.env.BASE_URL || 'https://example.com',
      timestamp: new Date().toISOString()
    };
  },
  
  data: async () => {
    return {
      testId: `test_${Date.now()}`,
      value: Math.random()
    };
  },
  
  task: async (data, setupData) => {
    return `Navigate to ${setupData.baseUrl} with test ID ${data.testId}`;
  }
};
```

Test execution:

```bash
# Run smart test
npx endorphin run test SMART-001

# Verify setup/data results in debug output or reports
npx endorphin generate report
```

## Cost Tracking Testing

Test the cost tracking features:

```bash
# Run test with cost tracking enabled
ENDORPHIN_DEBUG=verbose npx endorphin run test HEALTH-001

# Generate report and check cost information
npx endorphin generate report

# Look for cost data in HTML report
grep -i "cost\|token" test-results/reports/report-*.html
```

## Error Scenarios Testing

### Test Invalid API Key

```bash
# Test with invalid API key
echo "OPENAI_API_KEY=invalid-key" > .env
npx endorphin run test HEALTH-001

# Should show clear error message
```

### Test Missing Dependencies

```bash
# Test without Playwright browsers
rm -rf ~/.cache/ms-playwright/
npx endorphin run test HEALTH-001

# Should show browser installation message
```

### Test Corrupted Package

```bash
# Test with missing files (simulate corruption)
rm node_modules/endorphin-ai/dist/bin/endorphin.js
npx endorphin --version

# Should fail gracefully
```

## Performance Testing

### Execution Time Measurement

```bash
# Measure init command performance
time npx endorphin init

# Measure test discovery performance
time npx endorphin list

# Measure test execution performance
time npx endorphin run test HEALTH-001 --headless
```

### Memory Usage Testing

```bash
# Monitor memory usage during test execution
npx endorphin run test HEALTH-001 --headless &
PID=$!

# Monitor memory (requires activity monitor or htop)
while kill -0 $PID 2>/dev/null; do
  ps -p $PID -o pid,vsz,rss,comm
  sleep 2
done
```

## Cross-Platform Testing

### macOS Testing

```bash
# Test on macOS
system_profiler SPSoftwareDataType | grep "System Version"
npx endorphin init
npx endorphin list
```

### Linux Testing (Docker)

```bash
# Test in Linux container
docker run -it --rm -v $(pwd):/app node:20 bash
cd /app
npm install endorphin-ai-*.tgz
npx endorphin --version
```

### Windows Testing (WSL)

```bash
# Test in WSL environment
wsl --version
npx endorphin init
npx endorphin list
```

## Validation Checklist

### Package Installation
- [ ] Package installs without errors
- [ ] CLI binary is executable
- [ ] Required dependencies resolve
- [ ] TypeScript definitions available

### CLI Functionality
- [ ] `--version` works
- [ ] `--help` displays correctly
- [ ] `init` creates proper files
- [ ] `list` discovers tests
- [ ] Commands work with direct node execution

### Core Features
- [ ] Test discovery works
- [ ] Smart test structure executes (setup/data/task)
- [ ] Cost tracking functional
- [ ] Report generation works
- [ ] Debug mode accessible

### Test Recorder
- [ ] Recorder starts without errors
- [ ] Files created in user project (not framework)
- [ ] Interactive prompts work
- [ ] Generated tests are valid

### Error Handling
- [ ] Clear error messages for missing API key
- [ ] Graceful handling of missing browsers
- [ ] Proper error reporting for invalid tests
- [ ] Network error handling

### Performance
- [ ] Init completes in < 5 seconds
- [ ] Test discovery completes in < 3 seconds
- [ ] CLI commands respond quickly
- [ ] Memory usage reasonable

## Results Analysis

### Test Logs Location

```bash
# View recent test results
ls -la dev-tests/package-tests/results/

# View latest test session
ls -la dev-tests/package-tests/results/$(ls -t dev-tests/package-tests/results/ | head -1)/

# Check specific test category results
cat dev-tests/package-tests/results/latest/Init_Command.log
cat dev-tests/package-tests/results/latest/Test_Recorder_Functionality.log
```

### Success Criteria

A successful package test should show:

- ✅ All automated tests passing
- ✅ Clean package installation
- ✅ All CLI commands working
- ✅ Test recorder creating files in correct location
- ✅ Smart test structure executing properly
- ✅ Cost tracking recording data
- ✅ Reports generating correctly

### Failure Investigation

If tests fail:

1. **Check logs**: `dev-tests/package-tests/results/latest/`
2. **Manual verification**: Follow manual testing steps
3. **Isolate issue**: Run single test category
4. **Environment check**: Verify Node.js, npm versions
5. **Package integrity**: Check tarball contents

## Best Practices

1. **Always test from tarball**: Simulates real user installation
2. **Use isolated environments**: Prevent environment contamination
3. **Test all major workflows**: Init, test, record, report
4. **Validate file locations**: Ensure user project isolation
5. **Check error scenarios**: Test graceful failure handling
6. **Verify performance**: Ensure acceptable execution times
7. **Cross-platform testing**: Test on different OS/Node versions
8. **Document issues**: Record any problems for fixing

This comprehensive package testing ensures the compiled JavaScript package works perfectly for end users before publishing to npm.