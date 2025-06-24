# Writing Tests Guide - Endorphin AI

*Last Updated: June 23, 2025*

## 🎯 Overview

This guide covers how to write effective tests for Endorphin AI framework. We have two types of tests:

1. **Framework Tests** - Testing internal framework code (Vitest)
2. **Package Tests** - Testing end-to-end user experience (Bash scripts)

**Coverage Goal: 90% for framework tests**

## 📝 Writing Framework Tests (Vitest)

### Test File Location
All framework tests are organized by functionality in `tests/framework-tests/`:

```
tests/framework-tests/
├── 📁 core/                     # Core framework functionality
│   ├── test-discovery.test.js   # Test file discovery & loading
│   ├── test-runner.test.js      # Test execution engine
│   └── init-command.test.js     # Project initialization
│
├── 📁 config/                   # Configuration system
│   └── config-loader.test.js    # Config loading & merging
│
├── 📁 cli/                      # Command line interface
│   ├── cli-commands.test.js     # CLI command parsing
│   ├── cli-integration.test.js  # End-to-end CLI testing
│   └── cli-graceful-shutdown.test.js # Process termination
│
├── 📁 browser/                  # Browser automation & recording
│   ├── browser-framework.test.js      # Core browser operations
│   ├── enhanced-browser-framework.test.js # Advanced features
│   ├── test-recorder.test.js           # Test recorder core
│   ├── test-recorder-integration.test.js # Recorder integration
│   └── validate-test-recorder.js       # Recorder validation
│
├── 📁 web/                      # Web UI & server
│   ├── web-server.test.js       # Web server functionality
│   ├── web-ui-e2e.test.js      # End-to-end web UI tests
│   ├── web-ui-execution.test.js # Web UI test execution
│   ├── web-ui-search.test.js    # Search functionality
│   ├── web-ui-react-serving.test.js # React serving
│   └── react-frontend-integration.test.js # React UI integration
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
├── 📄 setup.js                  # Test environment setup
├── 📁 coverage/                 # Coverage reports (90% goal)
└── 📁 html/                     # Test result reports
```

### Choosing the Right Test Folder

When writing new tests, place them in the appropriate folder based on functionality:

| **Folder** | **Use For** | **Examples** |
|------------|-------------|--------------|
| **`core/`** | Core framework functionality, test discovery, execution engine | `test-discovery.test.js`, `test-runner.test.js` |
| **`config/`** | Configuration loading, merging, validation | `config-loader.test.js`, `environment-config.test.js` |
| **`cli/`** | Command line interface, argument parsing | `cli-commands.test.js`, `cli-integration.test.js` |
| **`browser/`** | Browser automation, Playwright integration, test recording | `browser-framework.test.js`, `test-recorder.test.js` |
| **`web/`** | Web UI, server functionality, React frontend | `web-server.test.js`, `web-ui-execution.test.js` |
| **`reporters/`** | Output formatting, report generation | `console-reporter.test.js`, `html-reporter.test.js` |
| **`integration/`** | End-to-end workflows, full system tests | `final-integration.test.js`, `installation.test.js` |

### Test File Naming Convention

Follow this naming pattern for consistency:

```
[module-name].test.js        # Unit tests for a specific module
[feature-name]-integration.test.js # Integration tests
[component-name]-e2e.test.js # End-to-end tests
```

**Examples:**
- `config/config-loader.test.js` - Tests the ConfigLoader class
- `cli/cli-integration.test.js` - Tests complete CLI workflows  
- `web/web-ui-e2e.test.js` - Tests entire web UI user journeys

### Basic Test Structure

```javascript
// tests/framework-tests/example-module.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExampleModule } from '../../framework/core/example-module.js';

describe('ExampleModule', () => {
  let instance;

  beforeEach(() => {
    // Setup before each test
    instance = new ExampleModule();
  });

  afterEach(() => {
    // Cleanup after each test
    if (instance.cleanup) {
      instance.cleanup();
    }
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      expect(instance).toBeDefined();
      expect(instance.config).toBeDefined();
    });

    it('should accept custom config', () => {
      const customConfig = { option: 'value' };
      const customInstance = new ExampleModule(customConfig);
      expect(customInstance.config.option).toBe('value');
    });
  });

  describe('methodName', () => {
    it('should handle normal input', () => {
      const result = instance.methodName('normal input');
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(instance.methodName('')).toBe('');
      expect(instance.methodName(null)).toBeNull();
      expect(instance.methodName(undefined)).toBeUndefined();
    });

    it('should throw error for invalid input', () => {
      expect(() => instance.methodName(-1)).toThrow('Invalid input');
    });
  });
});
```

### Testing Async Functions

```javascript
describe('async operations', () => {
  it('should load config file', async () => {
    const config = await instance.loadConfig('test-config.js');
    expect(config).toBeDefined();
    expect(config.loaded).toBe(true);
  });

  it('should handle file not found', async () => {
    await expect(instance.loadConfig('non-existent.js'))
      .rejects.toThrow('Config file not found');
  });

  it('should timeout after specified time', async () => {
    const promise = instance.longRunningOperation();
    await expect(promise).rejects.toThrow('Timeout');
  }, 10000); // 10 second timeout
});
```

### Mocking Dependencies

```javascript
import { vi } from 'vitest';
import fs from 'fs/promises';

// Mock file system
vi.mock('fs/promises');

describe('file operations', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should read file successfully', async () => {
    // Setup mock
    fs.readFile.mockResolvedValue('file content');
    
    const content = await instance.readConfigFile('config.js');
    
    expect(fs.readFile).toHaveBeenCalledWith('config.js', 'utf8');
    expect(content).toBe('file content');
  });

  it('should handle file read error', async () => {
    // Setup mock to throw error
    fs.readFile.mockRejectedValue(new Error('File not found'));
    
    await expect(instance.readConfigFile('config.js'))
      .rejects.toThrow('File not found');
  });
});
```

### Testing CLI Commands

```javascript
import { vi } from 'vitest';

describe('CLI commands', () => {
  let consoleSpy;
  let exitSpy;

  beforeEach(() => {
    // Mock console and process
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original functions
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should display help message', () => {
    instance.showHelp();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Usage: endorphin')
    );
  });

  it('should exit with code 1 on error', () => {
    instance.handleError('Test error');
    
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Test error')
    );
  });
});
```

### Testing Browser Operations

```javascript
import { vi } from 'vitest';

describe('BrowserFramework', () => {
  let browserMock;
  let pageMock;

  beforeEach(() => {
    // Mock Playwright objects
    pageMock = {
      goto: vi.fn(),
      click: vi.fn(),
      type: vi.fn(),
      waitForSelector: vi.fn(),
      screenshot: vi.fn(),
    };

    browserMock = {
      newPage: vi.fn().mockResolvedValue(pageMock),
      close: vi.fn(),
    };

    // Mock playwright launch
    vi.mock('playwright', () => ({
      chromium: {
        launch: vi.fn().mockResolvedValue(browserMock),
      },
    }));
  });

  it('should navigate to URL', async () => {
    await instance.navigateTo('https://example.com');
    
    expect(pageMock.goto).toHaveBeenCalledWith('https://example.com');
  });

  it('should handle navigation error', async () => {
    pageMock.goto.mockRejectedValue(new Error('Navigation failed'));
    
    await expect(instance.navigateTo('invalid-url'))
      .rejects.toThrow('Navigation failed');
  });
});
```

### Coverage Best Practices

#### Aim for 90% Coverage
```javascript
// ✅ Good: Test all code paths
describe('conditional logic', () => {
  it('should handle condition A', () => {
    const result = instance.processData({ type: 'A' });
    expect(result.processed).toBe(true);
  });

  it('should handle condition B', () => {
    const result = instance.processData({ type: 'B' });
    expect(result.alternative).toBe(true);
  });

  it('should handle default case', () => {
    const result = instance.processData({ type: 'unknown' });
    expect(result.default).toBe(true);
  });
});
```

#### Test Error Handling
```javascript
// ✅ Good: Test error scenarios
describe('error handling', () => {
  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network timeout');
    networkError.code = 'TIMEOUT';
    
    mockHttpClient.get.mockRejectedValue(networkError);
    
    const result = await instance.fetchData();
    expect(result.error).toBe('Network timeout occurred');
    expect(result.retryable).toBe(true);
  });
});
```

#### Test Edge Cases
```javascript
// ✅ Good: Test boundary conditions
describe('validation', () => {
  it('should handle empty strings', () => {
    expect(instance.validate('')).toBe(false);
  });

  it('should handle null values', () => {
    expect(instance.validate(null)).toBe(false);
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    expect(instance.validate(longString)).toBe(false);
  });
});
```

## 🔧 Writing Package Tests (Bash Scripts)

### Test File Location
All package tests go in `tests/package-tests/`:

```
tests/package-tests/
├── test-feature-name.sh     # Your test script
├── setup-user-project.sh   # Environment setup
└── quick-commands.sh        # Essential tests
```

### Basic Test Script Structure

```bash
#!/bin/bash
# tests/package-tests/test-example-feature.sh

set -e  # Exit on any error

echo "🧪 Testing Example Feature"

# Configuration
TEST_DIR="tmp/test-example"
FRAMEWORK_DIR="../.."

# Setup test environment
setup_test() {
    echo "  🛠️  Setting up test environment..."
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Install endorphin-ai from local framework
    npm init -y > /dev/null 2>&1
    npm install "$FRAMEWORK_DIR" > /dev/null 2>&1
    
    echo "  ✅ Test environment ready"
}

# Test the feature
test_feature() {
    echo "  🔍 Testing feature functionality..."
    
    # Your test implementation here
    npx endorphin --version
    if [ $? -eq 0 ]; then
        echo "  ✅ Feature works correctly"
    else
        echo "  ❌ Feature test failed"
        exit 1
    fi
}

# Verify expected behavior
verify_behavior() {
    echo "  🔍 Verifying expected behavior..."
    
    # Check if expected files exist
    if [ -f "expected-file.txt" ]; then
        echo "  ✅ Expected file created"
    else
        echo "  ❌ Expected file missing"
        exit 1
    fi
    
    # Check file contents
    if grep -q "expected content" "expected-file.txt"; then
        echo "  ✅ File content is correct"
    else
        echo "  ❌ File content is incorrect"
        exit 1
    fi
}

# Cleanup test environment
cleanup() {
    echo "  🧹 Cleaning up..."
    cd ../..
    rm -rf "$TEST_DIR"
    echo "  ✅ Cleanup completed"
}

# Error handling
handle_error() {
    echo "  ❌ Test failed: $1"
    cleanup
    exit 1
}

# Main execution
main() {
    setup_test || handle_error "Setup failed"
    test_feature || handle_error "Feature test failed"
    verify_behavior || handle_error "Behavior verification failed"
    cleanup
    
    echo "✅ Example feature test completed successfully"
}

# Run the test
main
```

### Testing CLI Commands

```bash
# Test CLI command functionality
test_cli_commands() {
    echo "  🧪 Testing CLI commands..."
    
    # Test version command
    if npx endorphin --version > /dev/null 2>&1; then
        echo "    ✅ Version command works"
    else
        echo "    ❌ Version command failed"
        return 1
    fi
    
    # Test help command
    if npx endorphin --help | grep -q "Usage:"; then
        echo "    ✅ Help command works"
    else
        echo "    ❌ Help command failed"
        return 1
    fi
    
    # Test list command
    if npx endorphin list > /dev/null 2>&1; then
        echo "    ✅ List command works"
    else
        echo "    ❌ List command failed"
        return 1
    fi
}
```

### Testing File Isolation (Critical)

```bash
# Test that files are created in user project, not framework
test_file_isolation() {
    echo "  🔒 Testing file isolation (CRITICAL)..."
    
    # Record initial state
    USER_FILES_BEFORE=$(ls -la 2>/dev/null | wc -l)
    FRAMEWORK_FILES_BEFORE=$(ls -la ../../test-recorder/ 2>/dev/null | wc -l || echo "0")
    
    # Run test recorder briefly
    timeout 5s npx endorphin run test-recorder > /dev/null 2>&1 || true
    
    # Check user project (should have new files)
    USER_FILES_AFTER=$(ls -la test-recorder/ 2>/dev/null | wc -l || echo "0")
    if [ "$USER_FILES_AFTER" -gt "0" ]; then
        echo "    ✅ Files created in user project"
    else
        echo "    ❌ No files created in user project"
        return 1
    fi
    
    # Check framework directory (should be unchanged)
    FRAMEWORK_FILES_AFTER=$(ls -la ../../test-recorder/ 2>/dev/null | wc -l || echo "0")
    if [ "$FRAMEWORK_FILES_AFTER" -eq "$FRAMEWORK_FILES_BEFORE" ]; then
        echo "    ✅ No files leaked to framework directory"
    else
        echo "    ❌ Files leaked to framework directory"
        echo "    Framework files before: $FRAMEWORK_FILES_BEFORE"
        echo "    Framework files after: $FRAMEWORK_FILES_AFTER"
        return 1
    fi
}
```

### Testing Error Scenarios

```bash
# Test error handling
test_error_scenarios() {
    echo "  🔍 Testing error scenarios..."
    
    # Test invalid command
    if npx endorphin invalid-command 2>&1 | grep -q "Unknown command"; then
        echo "    ✅ Invalid command handled gracefully"
    else
        echo "    ❌ Invalid command not handled properly"
        return 1
    fi
    
    # Test missing config
    mv endorphin.config.js endorphin.config.js.bak 2>/dev/null || true
    if npx endorphin list 2>&1 | grep -q "config"; then
        echo "    ✅ Missing config handled gracefully"
    else
        echo "    ❌ Missing config not handled properly"
        return 1
    fi
    mv endorphin.config.js.bak endorphin.config.js 2>/dev/null || true
}
```

## 🎯 Test Quality Guidelines

### Framework Test Quality

#### ✅ Good Test Practices
```javascript
// Descriptive test names
it('should load config file when it exists and is valid JSON', () => {});

// Test one thing at a time
it('should validate email format', () => {
  expect(validator.isValidEmail('test@example.com')).toBe(true);
});

// Use proper assertions
expect(result).toEqual({ expected: 'object' }); // Deep equality
expect(result).toBe('exact value');             // Strict equality
expect(result).toBeNull();                      // Specific null check
```

#### ❌ Poor Test Practices
```javascript
// Vague test names
it('should work', () => {});

// Testing multiple things
it('should validate and format email', () => {
  // Tests both validation AND formatting
});

// Weak assertions
expect(result).toBeTruthy(); // Too generic
```

### Package Test Quality

#### ✅ Good Package Test Practices
```bash
# Clear error handling
set -e  # Exit on error

# Descriptive output
echo "  🔍 Testing specific functionality..."

# Proper cleanup
cleanup() {
    cd ../..
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

# Verification of expected behavior
if [ -f "expected-file" ]; then
    echo "  ✅ Expected file created"
else
    echo "  ❌ Expected file missing"
    exit 1
fi
```

#### ❌ Poor Package Test Practices
```bash
# No error handling
# Script continues on errors

# Unclear output
echo "Testing stuff..."

# No cleanup
# Leaves test artifacts

# No verification
# Doesn't check if test actually worked
```

## 📊 Coverage Monitoring

### Check Current Coverage
```bash
# Run tests with coverage
npm run test:coverage

# Check if coverage meets 90% threshold
npm run test:coverage:check

# View detailed HTML report
open tests/framework-tests/coverage/index.html
```

### Coverage Configuration
Located in `vitest.config.js`:

```javascript
coverage: {
  thresholds: {
    global: {
      branches: 90,    // 90% goal
      functions: 90,   // 90% goal
      lines: 90,       // 90% goal
      statements: 90,  // 90% goal
    }
  }
}
```

## 🚀 Running Your Tests

### Framework Tests
```bash
# Run specific test file
npm test -- your-module.test.js

# Run tests matching pattern
npm test -- --grep "your feature"

# Run with coverage
npm run test:coverage
```

### Package Tests
```bash
# Navigate to package tests
cd tests/package-tests

# Run your test script
./test-your-feature.sh

# Run with other tests
./quick-commands.sh
```

### Complete Test Suite
```bash
# Run everything
npm run test:verify

# Or step by step
npm run test:coverage
npm run test:package:full
```

## 📋 Test Checklist

### Before Writing Tests
- [ ] Understand what you're testing
- [ ] Identify edge cases and error scenarios
- [ ] Plan test structure and organization
- [ ] Consider dependencies and mocking needs

### While Writing Tests
- [ ] Use descriptive test names
- [ ] Test one behavior per test
- [ ] Include setup and cleanup
- [ ] Test both success and failure paths
- [ ] Aim for 90% coverage

### Before Committing
- [ ] All tests pass
- [ ] Coverage meets 90% threshold
- [ ] Tests are readable and maintainable
- [ ] No unused imports or dead code
- [ ] Proper error handling

---

*This guide helps you write effective tests that ensure Endorphin AI framework quality and reliability. Follow these guidelines to maintain our 90% coverage goal and comprehensive user journey testing.*
