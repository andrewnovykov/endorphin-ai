# Framework Development Testing

*Last Updated: June 23, 2025*

## 🎯 Purpose

This directory contains **unit and integration tests for framework development**. These tests are for developers working on the Endorphin AI framework itself.

## 🔧 What We Test Here

- ✅ Internal framework modules and components
- ✅ Core functionality (browser framework, test discovery, configuration)
- ✅ CLI command parsing and logic
- ✅ Web UI server and API endpoints
- ✅ Test execution engine and reporting systems
- ✅ Error handling and edge cases

**Coverage Goal: 90%**

## 🚀 Quick Start

### Run All Framework Tests
```bash
# From project root
npm test

# With coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Run Specific Tests
```bash
# Specific test file
npm test -- browser-framework.test.js

# Tests matching pattern
npm test -- --grep "CLI"

# Interactive UI mode
npm run test:ui
```

## 📁 Test Organization

Tests are organized by functionality:

```
tests/framework-tests/
├── 📁 core/                     # Core framework functionality
│   ├── test-discovery.test.js   # Test file discovery & loading
│   ├── test-runner.test.js      # Test execution engine
│   └── init-command.test.js     # Project initialization
│
├── 📁 config/                   # Configuration system
│   ├── config-loader.test.js    # Config loading & merging
│   └── browser-config.test.js   # Browser configuration
│
├── 📁 cli/                      # Command line interface
│   ├── cli-commands.test.js     # CLI command parsing
│   ├── cli-integration.test.js  # End-to-end CLI testing
│   └── cli-graceful-shutdown.test.js # Process termination
│
├── 📁 browser/                  # Browser automation & recording
│   ├── browser-framework.test.js      # Core browser operations
│   ├── enhanced-browser-framework.test.js # Advanced features
│   └── test-recorder.test.js           # Test recorder core
│
├── 📁 web/                      # Web UI & server
│   ├── web-server.test.js       # Web server functionality
│   ├── web-ui-e2e.test.js      # End-to-end web UI tests
│   └── web-ui-execution.test.js # Web UI test execution
│
├── 📁 reporters/                # Reporting systems
│   ├── console-reporter.test.js # Console output formatting
│   ├── html-reporter.test.js    # HTML report generation
│   └── websocket-reporter.test.js # WebSocket reporting
│
├── 📁 integration/              # Integration & end-to-end
│   ├── final-integration.test.js # Complete workflow testing
│   └── installation.test.js     # Package installation
│
└── 📄 setup.js                  # Test environment setup
```

## 🧪 Test Types

### Unit Tests
Test individual functions and classes:
```javascript
describe('ConfigLoader', () => {
  it('should load default config', () => {
    const loader = new ConfigLoader();
    const config = loader.getDefaultConfig();
    expect(config).toBeDefined();
  });
});
```

### Integration Tests
Test component interactions:
```javascript
describe('TestRunner Integration', () => {
  it('should run test with browser framework', async () => {
    const runner = new TestRunner();
    const result = await runner.runTest(mockTest);
    expect(result.success).toBe(true);
  });
});
```

### End-to-End Tests
Test complete workflows:
```javascript
describe('Complete Workflow', () => {
  it('should discover, run, and report tests', async () => {
    // Test full framework workflow
  });
});
```

## 📊 Coverage Requirements

### Target: 90% Coverage

```bash
# Check current coverage
npm run test:coverage

# Coverage thresholds:
- Lines: 90%
- Functions: 90%
- Branches: 90%
- Statements: 90%
```

### Coverage by Module
- **framework/core/**: 95%+ (Critical)
- **framework/config/**: 90%+
- **framework/tools/**: 90%+
- **framework/web/**: 85%+
- **bin/**: 85%+

## 🔧 Writing Tests

### Test File Template
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

### Async Testing
```javascript
it('should load config asynchronously', async () => {
  const config = await configLoader.loadConfig();
  expect(config).toBeDefined();
});

it('should reject when file is invalid', async () => {
  await expect(configLoader.loadConfig('invalid.js'))
    .rejects.toThrow('Invalid config');
});
```

### Mocking Dependencies
```javascript
import { vi } from 'vitest';
import fs from 'fs/promises';

vi.mock('fs/promises');

beforeEach(() => {
  vi.clearAllMocks();
});

it('should handle file read error', async () => {
  fs.readFile.mockRejectedValue(new Error('File not found'));
  // Test error handling
});
```

## 🎯 Best Practices

### Test Naming
```javascript
// ✅ Good: Descriptive test names
it('should load config file when it exists', () => {});
it('should throw error when config file is invalid JSON', () => {});

// ❌ Bad: Vague test names
it('should work', () => {});
it('config test', () => {});
```

### Test Organization
```javascript
describe('ConfigLoader', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {});
  });

  describe('loadConfig', () => {
    it('should load valid config file', () => {});
    it('should handle missing config file', () => {});
  });
});
```

### Error Testing
```javascript
// Test both success and failure paths
it('should handle valid input', () => {
  expect(validator.validate('valid')).toBe(true);
});

it('should reject invalid input', () => {
  expect(() => validator.validate(null)).toThrow();
});
```

## 📋 Development Workflow

### During Development
```bash
# Watch mode for continuous testing
npm run test:watch

# Test specific file you're working on
npm test -- your-module.test.js

# Check coverage for your changes
npm run test:coverage
```

### Before Committing
```bash
# Run all tests
npm test

# Ensure coverage meets 90% threshold
npm run test:coverage:check

# Fix any failing tests
```

### Adding New Tests
1. Create test file in appropriate subfolder
2. Follow naming convention: `module-name.test.js`
3. Write comprehensive tests covering all scenarios
4. Ensure tests pass and coverage is maintained
5. Add to relevant test suites

## 🚨 Common Issues

### Repository Contamination (CRITICAL)
```javascript
// ❌ NEVER: Create test artifacts in main repo
const testResultsDir = './test-results';        // Creates in repo root!
const recorderDir = './test-recorder';          // Creates in repo root!

// ✅ ALWAYS: Use temporary directories for tests
import { tmpdir } from 'os';
import { mkdtemp } from 'fs/promises';
const tempDir = await mkdtemp(path.join(tmpdir(), 'endorphin-test-'));
const testResultsDir = path.join(tempDir, 'test-results');
const recorderDir = path.join(tempDir, 'test-recorder');
```

**Rule**: Framework tests must NEVER create `test-recorder/` or `test-results/` in the main repository. These folders should only exist in `tests/tmp/test-endorphin/` (user project).

### File Path Problems
```javascript
// ❌ Problem: Relative paths in tests
import module from '../framework/core/module.js';

// ✅ Solution: Use proper imports
import { resolve } from 'path';
const modulePath = resolve(process.cwd(), 'framework/core/module.js');
```

### Async Race Conditions
```javascript
// ❌ Problem: Not waiting for async operations
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

### Process Exit in Tests
```javascript
// ❌ Problem: process.exit() breaks tests
function handleError() {
  process.exit(1); // Kills test runner
}

// ✅ Solution: Mock or conditional exit
function handleError() {
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  throw new Error('Test error');
}
```

## 📊 Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage
open tests/framework-tests/coverage/index.html

# Coverage locations:
- HTML: tests/framework-tests/coverage/
- JSON: tests/framework-tests/coverage/coverage-final.json
- Console: npm run test:coverage:check
```

---

**📚 For package testing (user perspective), see:** `tests/package-tests/README.md`
