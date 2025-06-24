# Framework Testing Guide - Endorphin AI

*Last Updated: June 23, 2025*

## 🎯 Overview

This guide covers comprehensive testing of the Endorphin AI framework itself - internal code, modules, and components. This is separate from package testing (testing the published NPM package) and user testing (using the framework to test websites).

**Testing Goal: 90% Code Coverage**

## 📊 Current Test Coverage Status

```bash
# Run coverage report
npm run test:coverage

# Coverage targets (90% goal)
- Lines: 90%+ ✅
- Functions: 90%+ ✅  
- Branches: 90%+ ✅
- Statements: 90%+ ✅
```

## 🗂️ Test Structure

### Framework Tests (`tests/framework-tests/`)
- **Purpose**: Test internal framework components
- **Technology**: Vitest
- **Coverage**: Core framework modules
- **Location**: `/tests/framework-tests/`

### Package Tests (`tests/package-tests/`)
- **Purpose**: Test NPM package functionality from user perspective
- **Technology**: Bash scripts + Manual testing
- **Coverage**: End-to-end package usage
- **Location**: `/tests/package-tests/`

### Current Test Files

#### Framework Tests (Vitest)
```
tests/framework-tests/
├── browser-framework.test.js           # Browser automation core
├── cli-commands.test.js                # CLI command parsing
├── cli-graceful-shutdown.test.js       # Graceful process termination
├── cli-integration.test.js             # End-to-end CLI testing
├── config-loader.test.js               # Configuration loading
├── console-reporter.test.js            # Console output formatting
├── enhanced-browser-framework.test.js  # Advanced browser features
├── final-integration.test.js           # Complete workflow testing
├── html-reporter.test.js               # HTML report generation
├── init-command.test.js                # Project initialization
├── installation.test.js               # Package installation
├── react-frontend-integration.test.js # React UI integration
├── test-discovery.test.js              # Test file discovery
├── test-recorder-integration.test.js   # Test recorder integration
├── test-recorder.test.js               # Test recorder core
├── test-runner.test.js                 # Test execution engine
├── web-server.test.js                  # Web UI server
├── web-ui-e2e.test.js                 # Web UI end-to-end
├── web-ui-execution.test.js           # Web UI test execution
├── web-ui-react-serving.test.js       # React serving
├── web-ui-search.test.js              # Web UI search functionality
├── websocket-reporter.test.js         # WebSocket reporting
└── setup.js                          # Test environment setup
```

#### Package Tests (Bash Scripts)
```
tests/package-tests/
├── setup-user-project.sh              # Create user test environment
├── test-cli-commands.sh                # Test CLI from user perspective
├── test-recorder-location.sh          # Verify file isolation
├── test-console-reporter.sh           # Test console output
├── test-html-reporter.sh              # Test HTML reporting
├── test-web-ui.sh                     # Test web interface
├── test-execution-api.sh              # Test execution API
├── test-search-api.sh                 # Test search functionality
└── quick-commands.sh                  # Quick test commands
```

## 🚀 Running Tests

### Quick Commands

```bash
# Run all framework tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- browser-framework.test.js

# Run tests in watch mode
npm run test:watch

# Run package tests (bash scripts)
cd tests/package-tests
./setup-user-project.sh
./test-cli-commands.sh
```

### Detailed Test Commands

#### Framework Testing (Vitest)
```bash
# Full test suite with coverage
npm run test:coverage

# Run specific test categories
npm test -- --grep "Browser Framework"
npm test -- --grep "CLI"
npm test -- --grep "Web UI"

# Run tests with verbose output
npm test -- --reporter=verbose

# Generate HTML coverage report
npm run test:coverage
open tests/framework-tests/coverage/index.html
```

#### Package Testing (End-to-End)
```bash
# Setup isolated user environment
cd tests/package-tests
./setup-user-project.sh

# Test CLI functionality
./test-cli-commands.sh

# Test recorder file isolation (critical)
./test-recorder-location.sh

# Test all reporters
./test-all-reporters.sh

# Test web UI
./test-web-ui.sh

# Cleanup test environment
rm -rf tmp/
```

## 📝 Writing Tests

### Framework Test Guidelines

#### 1. Test File Structure
```javascript
// tests/framework-tests/example.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YourModule } from '../../framework/core/your-module.js';

describe('YourModule', () => {
  let instance;

  beforeEach(() => {
    instance = new YourModule();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('method1', () => {
    it('should handle normal case', () => {
      const result = instance.method1('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const result = instance.method1(null);
      expect(result).toBeNull();
    });

    it('should throw error for invalid input', () => {
      expect(() => instance.method1(undefined)).toThrow();
    });
  });
});
```

#### 2. Test Categories

**Unit Tests** - Test individual functions/classes
```javascript
describe('ConfigLoader', () => {
  it('should load default config', () => {
    const config = new ConfigLoader();
    expect(config.defaultConfig).toBeDefined();
  });
});
```

**Integration Tests** - Test component interactions
```javascript
describe('TestRunner Integration', () => {
  it('should run test with browser framework', async () => {
    const runner = new TestRunner();
    const browser = new BrowserFramework();
    const result = await runner.runTest(testObj, browser);
    expect(result.success).toBe(true);
  });
});
```

**End-to-End Tests** - Test complete workflows
```javascript
describe('Complete Workflow', () => {
  it('should discover, run, and report tests', async () => {
    // Setup test files
    // Run discovery
    // Execute tests
    // Verify reports
  });
});
```

#### 3. Coverage Requirements

**90% Coverage Target**
- **Lines**: Every line of code should be executed
- **Functions**: Every function should be called
- **Branches**: All if/else paths should be tested
- **Statements**: All statements should be executed

**Coverage Exclusions**
```javascript
// vitest.config.js
coverage: {
  exclude: [
    'framework/**/index.js',     // Re-export files
    'framework/demos/**',        // Demo files
    'framework/interactive/**',  // Interactive tools
    'legacy/**',                // Legacy code
  ]
}
```

#### 4. Mock Guidelines

**File System Mocking**
```javascript
import { vi } from 'vitest';
import fs from 'fs/promises';

vi.mock('fs/promises');

it('should handle file read error', async () => {
  fs.readFile.mockRejectedValue(new Error('File not found'));
  // Test error handling
});
```

**Process Mocking**
```javascript
it('should handle process exit', () => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
  // Test code that calls process.exit()
  expect(exitSpy).toHaveBeenCalledWith(1);
});
```

### Package Test Guidelines

#### 1. Bash Script Structure
```bash
#!/bin/bash
# tests/package-tests/test-example.sh

set -e  # Exit on error

echo "🧪 Testing Example Feature"

# Setup
TEST_DIR="tmp/test-example"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Test implementation
test_feature() {
  echo "  Testing feature..."
  # Your test code here
  echo "  ✅ Feature works"
}

# Cleanup
cleanup() {
  cd ../..
  rm -rf "$TEST_DIR"
}

# Main execution
test_feature
cleanup

echo "✅ Example test completed"
```

#### 2. Critical Package Tests

**File Isolation Test** (Most Important)
```bash
# Verify test recorder creates files in user project only
test_recorder_isolation() {
  echo "🔍 Testing recorder file isolation..."
  
  # Run recorder briefly
  timeout 5s npx endorphin run test-recorder || true
  
  # Check user project (should have files)
  if [ -d "test-recorder" ]; then
    echo "  ✅ Files created in user project"
  else
    echo "  ❌ No files in user project"
    exit 1
  fi
  
  # Check framework (should be empty)
  if [ -d "../../test-recorder" ]; then
    echo "  ❌ Files leaked to framework directory"
    exit 1
  else
    echo "  ✅ No files in framework directory"
  fi
}
```

## 🎯 Coverage Goals & Metrics

### Target Coverage: 90%

#### Current Coverage by Module
```bash
# Generate detailed coverage report
npm run test:coverage

# Expected coverage levels:
- framework/core/: 95%+
- framework/config/: 90%+
- framework/tools/: 85%+
- framework/web/: 80%+
- bin/: 90%+
```

#### Coverage Monitoring
```bash
# Check if coverage meets threshold
npm run test:coverage:check

# Generate coverage badge
npm run coverage:badge

# Upload coverage to service (if configured)
npm run coverage:upload
```

### Quality Gates

Before merging code:
- [ ] All tests pass
- [ ] Coverage ≥ 90%
- [ ] No critical package isolation issues
- [ ] Web UI tests pass
- [ ] CLI integration tests pass

## 🔧 Test Environment Setup

### Development Environment
```bash
# Install test dependencies
npm install

# Setup test environment
npm run test:setup

# Run initial test suite
npm test
```

### CI/CD Environment
```yaml
# .github/workflows/test.yml
- name: Run Framework Tests
  run: |
    npm ci
    npm run test:coverage
    
- name: Run Package Tests
  run: |
    cd tests/package-tests
    ./setup-user-project.sh
    ./test-cli-commands.sh
    ./test-recorder-location.sh
```

### Local Development Workflow
```bash
# 1. Make changes to framework code
vim framework/core/your-module.js

# 2. Write/update tests
vim tests/framework-tests/your-module.test.js

# 3. Run tests locally
npm test -- your-module.test.js

# 4. Check coverage
npm run test:coverage

# 5. Run package tests if CLI/user-facing changes
cd tests/package-tests
./quick-commands.sh
```

## 🐛 Testing Best Practices

### 1. Test Naming Convention
```javascript
// Good: Descriptive test names
it('should load config file when it exists', () => {});
it('should throw error when config file is invalid JSON', () => {});
it('should use default config when no file exists', () => {});

// Bad: Vague test names
it('should work', () => {});
it('config test', () => {});
```

### 2. Test Organization
```javascript
describe('ConfigLoader', () => {
  describe('constructor', () => {
    // Constructor tests
  });
  
  describe('loadConfig', () => {
    describe('when config file exists', () => {
      // Happy path tests
    });
    
    describe('when config file does not exist', () => {
      // Error handling tests
    });
  });
});
```

### 3. Async Testing
```javascript
// Good: Proper async handling
it('should load config asynchronously', async () => {
  const config = await configLoader.loadConfig();
  expect(config).toBeDefined();
});

// Good: Error testing
it('should reject when file is invalid', async () => {
  await expect(configLoader.loadConfig('invalid.js'))
    .rejects.toThrow('Invalid config');
});
```

### 4. Setup/Teardown
```javascript
describe('FileOperations', () => {
  beforeEach(async () => {
    // Create test files
    await fs.mkdir('test-temp', { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up test files
    await fs.rm('test-temp', { recursive: true, force: true });
  });
});
```

## 📊 Test Reports

### Coverage Reports
```bash
# Generate HTML coverage report
npm run test:coverage
open tests/framework-tests/coverage/index.html

# Coverage locations:
- HTML: tests/framework-tests/coverage/
- JSON: tests/framework-tests/coverage/coverage-final.json
- Text: Console output
```

### Test Results
```bash
# HTML test results
npm test -- --reporter=html
open tests/framework-tests/html/index.html

# JUnit XML (for CI)
npm test -- --reporter=junit --outputFile=test-results.xml
```

## 🚨 Common Testing Issues

### 1. File Path Issues
```javascript
// Problem: Relative paths in tests
import module from '../framework/core/module.js';

// Solution: Use absolute imports or proper test setup
import { resolve } from 'path';
const modulePath = resolve(process.cwd(), 'framework/core/module.js');
```

### 2. Async Race Conditions
```javascript
// Problem: Not waiting for async operations
it('should create file', () => {
  createFile('test.txt');
  expect(fileExists('test.txt')).toBe(true); // May fail
});

// Solution: Await async operations
it('should create file', async () => {
  await createFile('test.txt');
  expect(await fileExists('test.txt')).toBe(true);
});
```

### 3. Process Exit in Tests
```javascript
// Problem: process.exit() breaks tests
function handleError() {
  process.exit(1); // Kills test runner
}

// Solution: Mock or conditional exit
function handleError() {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Test error');
  } else {
    process.exit(1);
  }
}
```

## 📋 Testing Checklist

### Before Committing
- [ ] All framework tests pass
- [ ] Coverage ≥ 90%
- [ ] Package isolation tests pass
- [ ] No console errors in tests
- [ ] Test names are descriptive
- [ ] Edge cases are covered

### Before Releasing
- [ ] Full test suite passes
- [ ] Package tests in clean environment
- [ ] Cross-platform compatibility verified
- [ ] Performance regression tests
- [ ] Documentation tests updated

### Regular Maintenance
- [ ] Review coverage reports monthly
- [ ] Update tests for new features
- [ ] Remove obsolete tests
- [ ] Optimize slow tests
- [ ] Update test dependencies

---

*This guide ensures comprehensive testing of the Endorphin AI framework with 90% coverage goals. Follow the guidelines for writing effective tests and maintaining high code quality.*