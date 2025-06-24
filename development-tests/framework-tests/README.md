# Framework Tests

This directory contains comprehensive tests for the Endorphin AI framework using
**Vitest**.

## Setup

First, make sure all dependencies are installed from the project root:

```bash
# From project root
npm install

# Or install vitest specifically if needed
npm install --save-dev vitest @vitest/ui
```

## Running Tests

```bash
# Run all framework tests (from project root)
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npx vitest development-tests/framework-tests/browser-framework.test.js

# Run all framework tests
npx vitest development-tests/framework-tests/
```

## Test Structure

```
development-tests/framework-tests/
├── README.md                           # This file
├── setup.js                           # Global test setup
├── browser-framework.test.js          # Core browser automation tests
├── config-loader.test.js              # Configuration system tests
├── test-discovery.test.js             # Test file discovery tests
├── test-runner.test.js                # Test execution tests
├── enhanced-browser-framework.test.js # Enhanced framework features
├── final-integration.test.js          # End-to-end integration tests
├── installation.test.js               # Installation and setup tests
├── init-command.test.js               # CLI init command tests
└── test-recorder-integration.test.js  # Test recorder tests
```

## Test Categories

### Unit Tests

- **Purpose**: Test individual functions and classes
- **Files**: `config-loader.test.js`, `test-discovery.test.js`
- **Focus**: Core functionality, error handling, edge cases

### Integration Tests

- **Purpose**: Test component interactions
- **Files**: `browser-framework.test.js`, `enhanced-browser-framework.test.js`
- **Focus**: Browser automation, AI agent integration, test execution

### End-to-End Tests

- **Purpose**: Test complete workflows
- **Files**: `final-integration.test.js`, `installation.test.js`
- **Focus**: CLI commands, configuration loading, test discovery

### CLI Tests

- **Purpose**: Test command-line interface
- **Files**: `init-command.test.js`
- **Focus**: Help commands, version display, project initialization

## Writing Tests

Follow these patterns when adding new tests:

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Feature Name', () => {
  let testInstance;

  beforeEach(() => {
    // Setup before each test
    testInstance = new FeatureClass();
  });

  afterEach(() => {
    // Cleanup after each test
    testInstance = null;
  });

  describe('Specific Functionality', () => {
    it('should do specific thing', async () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = await testInstance.method(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe('expected value');
    });
  });
});
```

## Mocking Guidelines

### External Dependencies

```javascript
// Mock Playwright
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(() => Promise.resolve(mockBrowser)),
  },
}));

// Mock file system
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => 'mock content'),
}));
```

### Framework Components

```javascript
// Mock browser framework
vi.mock('../../framework/core/browser-framework.js', () => ({
  EnhancedBrowserTestFramework: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    cleanup: vi.fn(),
    runTask: vi.fn(),
  })),
}));
```

## Test Environment

Tests run with these environment variables:

- `NODE_ENV=test`
- `VITEST=true`
- `ENDORPHIN_HEADLESS=true`
- `ENDORPHIN_VIEWPORT_WIDTH=1280`
- `ENDORPHIN_VIEWPORT_HEIGHT=720`

## Coverage Requirements

Maintain these coverage thresholds:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## Debugging Tests

```bash
# Run tests with debug output
npm test -- --reporter=verbose

# Run single test file with logs
npx vitest --run development-tests/framework-tests/browser-framework.test.js --reporter=verbose

# Debug specific test
npx vitest --run --no-coverage --reporter=verbose -t "should initialize framework"
```

## Test Data

Use the `examples/tests/` directory for test fixtures:

- `QE-001-basic-login.js` - Sample authentication test
- `QE-002-navigation.js` - Sample navigation test
- `QE-003-form-interaction.js` - Sample form test

## Common Issues

### Browser Tests Failing

- Ensure Playwright browsers are installed: `npx playwright install`
- Check headless mode is enabled in test environment
- Verify mock setup for browser automation

### Module Import Issues

- Use `vi.mock()` before imports
- Ensure proper file paths in dynamic imports
- Check ES module compatibility

### Async Test Problems

- Always `await` async operations
- Use proper timeout values for long-running tests
- Handle promise rejections correctly

## Contributing

When adding new tests:

1. Follow the naming convention: `feature-name.test.js`
2. Add comprehensive test coverage
3. Include both success and error scenarios
4. Update this README if adding new test categories
5. Ensure all tests pass before submitting
