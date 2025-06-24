# Complete Testing Guide - Endorphin AI

*Last Updated: June 23, 2025*

## 🎯 Testing Overview

Endorphin AI has comprehensive testing coverage across multiple dimensions:

- **Framework Tests**: Unit and integration tests for internal code (Vitest)
- **Package Tests**: End-to-end testing from user perspective (Bash scripts)
- **Coverage Goal**: 90% code coverage for framework components

## 📊 Quick Testing Commands

### Essential Commands (5 minutes)
```bash
# Run all framework tests with coverage
npm run test:coverage

# Run essential package tests
npm run test:package

# Check if coverage meets 90% threshold
npm run test:coverage:check
```

### Complete Test Suite (15 minutes)
```bash
# Full framework + package testing
npm run test:all

# Detailed package testing
npm run test:package:full

# Critical isolation test
npm run test:package:isolation
```

## 🗂️ Test Structure

```
tests/
├── framework-tests/          # Framework internal testing (Vitest)
│   ├── *.test.js            # Unit & integration tests
│   ├── coverage/            # Coverage reports (90% goal)
│   ├── html/                # HTML test results
│   └── setup.js             # Test environment setup
│
├── package-tests/           # End-to-end package testing (Bash)
│   ├── setup-user-project.sh       # 🛠️ User environment setup
│   ├── test-cli-commands.sh        # 🧪 CLI functionality
│   ├── test-recorder-location.sh   # 🔒 File isolation (CRITICAL)
│   ├── test-console-reporter.sh    # 📊 Console output
│   ├── test-html-reporter.sh       # 📝 HTML reports
│   ├── test-web-ui.sh              # 🌐 Web interface
│   ├── test-execution-api.sh       # 🎯 Execution API
│   ├── test-search-api.sh          # 🔍 Search functionality
│   ├── test-all-reporters.sh       # 📋 All reporting systems
│   └── quick-commands.sh           # ⚡ Essential tests only
│
└── debug-test.js            # Debug utilities
```

## 🚀 Framework Testing (Vitest)

### Running Framework Tests

```bash
# Run all framework tests
npm test

# Run with coverage (90% goal)
npm run test:coverage

# Run specific test file
npm test -- browser-framework.test.js

# Run tests matching pattern
npm test -- --grep "CLI"

# Watch mode for development
npm run test:watch

# UI mode for interactive testing
npm run test:ui
```

### Framework Test Categories

#### Core Framework Tests
- **`browser-framework.test.js`** - Browser automation core
- **`config-loader.test.js`** - Configuration loading
- **`test-discovery.test.js`** - Test file discovery
- **`test-runner.test.js`** - Test execution engine

#### CLI & Integration Tests
- **`cli-commands.test.js`** - CLI command parsing
- **`cli-integration.test.js`** - End-to-end CLI testing
- **`cli-graceful-shutdown.test.js`** - Process termination

#### Web UI Tests
- **`web-server.test.js`** - Web UI server
- **`web-ui-e2e.test.js`** - Web UI end-to-end
- **`web-ui-execution.test.js`** - Web UI test execution
- **`react-frontend-integration.test.js`** - React UI integration

#### Reporting Tests
- **`console-reporter.test.js`** - Console output formatting
- **`html-reporter.test.js`** - HTML report generation
- **`websocket-reporter.test.js`** - WebSocket reporting

#### Recorder Tests
- **`test-recorder.test.js`** - Test recorder core
- **`test-recorder-integration.test.js`** - Test recorder integration

### Coverage Requirements

**Target: 90% Coverage**
```bash
# Check current coverage
npm run test:coverage

# Coverage thresholds:
- Lines: 90%
- Functions: 90%
- Branches: 90%
- Statements: 90%

# Critical modules (95% target):
- framework/core/**
```

### Writing Framework Tests

#### Test File Template
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
    // Cleanup resources
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      const result = instance.methodName('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const result = instance.methodName(null);
      expect(result).toBeNull();
    });

    it('should throw error for invalid input', () => {
      expect(() => instance.methodName(undefined)).toThrow();
    });
  });
});
```

## 📦 Package Testing (End-to-End)

### Running Package Tests

```bash
# Navigate to package tests
cd tests/package-tests

# Essential package tests (5 minutes)
./quick-commands.sh

# Complete package testing (15 minutes)
./setup-user-project.sh
./test-cli-commands.sh
./test-recorder-location.sh
./test-all-reporters.sh
./test-web-ui.sh

# Cleanup test environment
rm -rf tmp/
```

### Package Test Scripts

#### 🔥 Critical Tests
```bash
# File isolation (MOST IMPORTANT)
./test-recorder-location.sh
# ✅ Recorder creates files in user project only
# ✅ No files leak to framework directory

# CLI functionality
./test-cli-commands.sh
# ✅ All CLI commands work from user perspective
# ✅ Configuration loading works
# ✅ Error handling is graceful
```

#### 🎯 Core Functionality
```bash
# Console reporting
./test-console-reporter.sh

# HTML reporting
./test-html-reporter.sh

# Web UI testing
./test-web-ui.sh

# Execution API
./test-execution-api.sh

# Search functionality
./test-search-api.sh
```

#### 🛠️ Environment Setup
```bash
# Setup isolated user environment
./setup-user-project.sh
# Creates: tmp/test-endorphin/
# Installs: endorphin-ai from local framework
# Configures: API key, config files, test structure
```

### Package Test Coverage

#### User Journey Coverage: 100%
- ✅ **Installation**: NPM install, global, npx
- ✅ **Initialization**: Project setup, config creation
- ✅ **Test Discovery**: Finding user test files
- ✅ **Test Execution**: Running tests end-to-end
- ✅ **Reporting**: Console, HTML, Web UI output
- ✅ **Error Handling**: Graceful failure scenarios
- ✅ **File Isolation**: Critical user project separation

#### CLI Coverage: 100%
```bash
# All commands tested:
npx endorphin --version
npx endorphin --help
npx endorphin list
npx endorphin run test TEST-ID
npx endorphin run test --tag TAG
npx endorphin run test --priority PRIORITY
npx endorphin run test all
npx endorphin run test-recorder
```

## 🔄 Complete Testing Workflow

### Pre-Commit Testing (5 minutes)
```bash
# Quick verification before committing
npm run test:coverage:check    # Framework coverage ≥ 90%
npm run test:package          # Essential package tests
```

### Pre-Release Testing (15 minutes)
```bash
# Complete testing before release
npm run test:all              # Framework + package tests
npm run test:package:full     # Complete package verification
```

### Development Testing
```bash
# During development
npm run test:watch            # Framework tests in watch mode
cd tests/package-tests && ./quick-commands.sh  # Quick package verification
```

### CI/CD Testing
```bash
# For continuous integration
npm run test:ci               # Framework tests with JSON output
cd tests/package-tests && ./test-cli-commands.sh  # Package verification
```

## 📊 Coverage Reports & Analysis

### Framework Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open tests/framework-tests/coverage/index.html

# Coverage locations:
- HTML: tests/framework-tests/coverage/
- JSON: tests/framework-tests/coverage/coverage-final.json
- Console: npm run test:coverage:check
```

### Coverage Targets by Module
```
framework/core/     95%+ (Critical)
framework/config/   90%
framework/tools/    90%
framework/web/      85%
bin/               85%
```

### Package Coverage Verification
```bash
# Verify all user workflows
cd tests/package-tests
./test-all-reporters.sh

# Critical isolation test
./test-recorder-location.sh
```

## 🐛 Testing Best Practices

### Framework Test Guidelines
```javascript
// ✅ Good: Descriptive test names
it('should load config file when it exists', () => {});
it('should throw error when config file is invalid JSON', () => {});

// ❌ Bad: Vague test names
it('should work', () => {});
it('config test', () => {});

// ✅ Good: Proper async testing
it('should load config asynchronously', async () => {
  const config = await configLoader.loadConfig();
  expect(config).toBeDefined();
});

// ✅ Good: Error testing
it('should reject when file is invalid', async () => {
  await expect(configLoader.loadConfig('invalid.js'))
    .rejects.toThrow('Invalid config');
});
```

### Package Test Guidelines
```bash
#!/bin/bash
# ✅ Good: Error handling
set -e  # Exit on error

# ✅ Good: Clear test steps
echo "🧪 Testing Feature X"
test_feature() {
  echo "  Testing specific functionality..."
  # Test implementation
  echo "  ✅ Feature works"
}

# ✅ Good: Cleanup
cleanup() {
  cd ../..
  rm -rf "$TEST_DIR"
}
```

## 🚨 Common Issues & Solutions

### Framework Testing Issues

#### File Path Problems
```javascript
// ❌ Problem: Relative paths
import module from '../framework/core/module.js';

// ✅ Solution: Absolute paths or proper setup
import { resolve } from 'path';
const modulePath = resolve(process.cwd(), 'framework/core/module.js');
```

#### Async Race Conditions
```javascript
// ❌ Problem: Not awaiting async
it('should create file', () => {
  createFile('test.txt');
  expect(fileExists('test.txt')).toBe(true); // May fail
});

// ✅ Solution: Await async operations
it('should create file', async () => {
  await createFile('test.txt');
  expect(await fileExists('test.txt')).toBe(true);
});
```

### Package Testing Issues

#### File Isolation Problems
```bash
# ❌ Problem: Files created in framework directory
ls -la ../../test-recorder/  # Should be empty

# ✅ Solution: Verify isolation
./test-recorder-location.sh  # Automated verification
```

#### Environment Cleanup
```bash
# ❌ Problem: Leaving test artifacts
# No cleanup after tests

# ✅ Solution: Always cleanup
cleanup() {
  cd ../..
  rm -rf tmp/
}
trap cleanup EXIT
```

## 📋 Testing Checklist

### Before Every Commit
- [ ] Framework tests pass (`npm test`)
- [ ] Coverage ≥ 90% (`npm run test:coverage:check`)
- [ ] Essential package tests pass (`npm run test:package`)
- [ ] No console errors in tests

### Before Every Release
- [ ] Complete framework test suite passes
- [ ] Full package test suite passes (`npm run test:package:full`)
- [ ] File isolation verified (`npm run test:package:isolation`)
- [ ] Cross-platform compatibility checked
- [ ] Documentation updated with new tests

### Monthly Maintenance
- [ ] Review coverage reports
- [ ] Update test dependencies
- [ ] Remove obsolete tests
- [ ] Optimize slow tests
- [ ] Add tests for new features

## 🎯 Summary

**Framework Testing (90% Coverage Goal)**
- Unit & integration tests with Vitest
- Comprehensive coverage of all core modules
- Located in `tests/framework-tests/`

**Package Testing (100% User Journey Coverage)**
- End-to-end testing from user perspective
- Bash scripts for complete workflow verification
- Located in `tests/package-tests/`

**Critical Success Metrics**
- ✅ Framework coverage ≥ 90%
- ✅ All CLI commands tested
- ✅ File isolation verified (no framework contamination)
- ✅ All user workflows covered
- ✅ Error handling tested

**Essential Commands**
```bash
npm run test:coverage        # Framework tests (90% goal)
npm run test:package        # Package tests (essential)
npm run test:all           # Complete test suite
```

---

*This guide ensures comprehensive testing coverage for both framework development and package usage scenarios. Follow these guidelines to maintain high code quality and user experience.*
