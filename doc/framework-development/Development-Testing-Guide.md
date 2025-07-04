# Development Testing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This guide covers **automated testing during framework development** using Jest and the current testing infrastructure.

## Overview

Development testing validates the framework code during development using **automated Jest tests** that run against the **TypeScript source code** without requiring a build step.

## Test Structure

```
dev-tests/
├── development/             # Automated Jest tests
│   ├── unit/               # Unit tests for individual components
│   ├── integration/        # Integration tests for workflows
│   └── coverage/           # Test coverage reports
└── jest-setup.js           # Jest configuration and setup
```

## Running Development Tests

### Quick Commands

```bash
# Run all development tests
npm test

# Run unit tests only
npm test dev-tests/development/unit

# Run integration tests only
npm test dev-tests/development/integration

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- dev-tests/development/unit/config-manager.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose
```

### Test Categories

#### Unit Tests (`dev-tests/development/unit/`)

Tests individual components in isolation:

```bash
# Configuration system
npm test -- dev-tests/development/unit/config-loader-simple.test.ts

# Core framework components
npm test -- dev-tests/development/unit/test-framework-setup.test.ts
npm test -- dev-tests/development/unit/session-manager-setup.test.ts

# Token tracking and cost analysis
npm test -- dev-tests/development/unit/token-tracker.test.ts
npm test -- dev-tests/development/unit/pricing-config.test.ts

# Debug system
npm test -- dev-tests/development/unit/debug-manager.test.ts

# CLI functionality
npm test -- dev-tests/development/unit/init-command.test.ts

# Reporters
npm test -- dev-tests/development/unit/html-reporter.test.ts
npm test -- dev-tests/development/unit/console-reporter.test.ts
```

#### Integration Tests (`dev-tests/development/integration/`)

Tests component interactions and workflows:

```bash
# CLI functionality end-to-end
npm test -- dev-tests/development/integration/cli-functionality.test.ts

# Package distribution
npm test -- dev-tests/development/integration/package-distribution.test.ts

# Token tracking integration
npm test -- dev-tests/development/integration/token-tracking-integration.test.ts

# Critical runtime validation
npm test -- dev-tests/development/integration/critical-runtime.test.ts
```

## Test Environment Setup

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Verify Node.js version
node --version  # Should be 18+

# Check Jest configuration
cat jest.config.js
```

### Environment Variables for Testing

```bash
# .env for development testing
NODE_ENV=test
JEST_ENVIRONMENT=node

# Optional: Enable verbose logging in tests
ENDORPHIN_DEBUG=verbose
```

## Writing New Tests

### Unit Test Template

```typescript
// dev-tests/development/unit/my-component.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { MyComponentInterface } from '../../../framework/types/index.js';
import { MyComponent } from '../../../framework/core/my-component.js';

describe('MyComponent', () => {
  let component: MyComponent;

  beforeEach(() => {
    component = new MyComponent();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('core functionality', () => {
    it('should initialize correctly', () => {
      expect(component).toBeDefined();
      expect(component.isInitialized()).toBe(false);
    });

    it('should handle configuration', async () => {
      const config = { setting: 'value' };
      await component.configure(config);
      
      expect(component.getConfig()).toEqual(config);
    });
  });

  describe('error handling', () => {
    it('should throw on invalid input', () => {
      expect(() => {
        component.processInvalidInput(null);
      }).toThrow('Invalid input provided');
    });
  });
});
```

### Integration Test Template

```typescript
// dev-tests/development/integration/my-workflow.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestFramework } from '../../../framework/core/test-framework.js';
import type { TestConfig } from '../../../framework/types/index.js';

describe('MyWorkflow Integration', () => {
  let framework: TestFramework;

  beforeAll(async () => {
    framework = new TestFramework();
    await framework.initialize();
  });

  afterAll(async () => {
    await framework.cleanup();
  });

  it('should execute complete workflow', async () => {
    const testConfig: TestConfig = {
      id: 'TEST-001',
      name: 'Integration Test',
      description: 'Test integration workflow',
      priority: 'High',
      tags: ['integration'],
      task: 'Navigate to example.com'
    };

    const result = await framework.executeTest(testConfig);
    
    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(1);
  });
});
```

## Mocking Strategy

### Browser Mocking

```typescript
// Mock Playwright for unit tests
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(() => Promise.resolve({
      newPage: jest.fn(() => Promise.resolve({
        goto: jest.fn(),
        screenshot: jest.fn(),
        close: jest.fn()
      })),
      close: jest.fn()
    }))
  }
}));
```

### OpenAI API Mocking

```typescript
// Mock OpenAI for unit tests
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: 'Mocked AI response'
            }
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        }))
      }
    }
  }))
}));
```

### File System Mocking

```typescript
// Mock fs operations
jest.mock('fs', () => ({
  existsSync: jest.fn((path: string) => path.includes('valid')),
  readFileSync: jest.fn((path: string) => {
    if (path.includes('config')) {
      return JSON.stringify({ setting: 'value' });
    }
    return 'file content';
  }),
  writeFileSync: jest.fn()
}));
```

## Test Coverage

### Coverage Goals

- **Minimum**: 80% line coverage
- **Target**: 90%+ line coverage
- **Critical paths**: 100% coverage (config, test discovery, CLI)

### Generating Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open dev-tests/development/coverage/index.html

# View coverage summary
npm test -- --coverage --coverageReporters=text-summary
```

### Coverage Configuration

Coverage is configured in `jest.config.js`:

```javascript
module.exports = {
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'framework/**/*.ts',
    '!framework/**/*.d.ts',
    '!framework/**/types/**',
    '!framework/**/templates/**'
  ],
  coverageDirectory: 'dev-tests/development/coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Debugging Tests

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": [
        "--runInBand",
        "--no-cache",
        "${relativeFile}"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

### Console Debugging

```bash
# Run single test with debugging
node --inspect-brk node_modules/.bin/jest dev-tests/development/unit/specific.test.ts

# Run with verbose output
npm test -- --verbose --no-coverage

# Run failing tests only
npm test -- --onlyFailures

# Run tests matching pattern
npm test -- --testNamePattern="should handle configuration"
```

## Common Test Patterns

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Conditions

```typescript
it('should handle errors gracefully', async () => {
  await expect(myFunction()).rejects.toThrow('Expected error message');
});
```

### Testing Configuration Loading

```typescript
it('should load configuration correctly', () => {
  const config = loadConfig();
  expect(config).toHaveProperty('openaiApiKey');
  expect(config.browser.headless).toBe(true);
});
```

### Testing Smart Test Structure (v0.9)

```typescript
it('should execute smart test with setup and data', async () => {
  const smartTest = {
    id: 'SMART-001',
    name: 'Smart Test',
    setup: async () => ({ baseUrl: 'https://test.com' }),
    data: async () => ({ user: 'testuser' }),
    task: async (data, setupData) => `Navigate to ${setupData.baseUrl}`
  };

  const result = await framework.executeTest(smartTest);
  expect(result.setupResult).toEqual({ baseUrl: 'https://test.com' });
  expect(result.dataResult).toEqual({ user: 'testuser' });
});
```

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/development-tests.yml
name: Development Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - run: npm ci
    - run: npm test
    - run: npm run test:coverage
    
    - name: Upload coverage
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: dev-tests/development/coverage/
```

### Pre-commit Hooks

```bash
# Install husky for pre-commit hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Performance Testing

### Test Execution Time

```bash
# Measure test execution time
time npm test

# Run tests with performance timing
npm test -- --verbose --detectOpenHandles
```

### Memory Usage Monitoring

```bash
# Run tests with memory monitoring
node --max-old-space-size=4096 node_modules/.bin/jest
```

## Troubleshooting

### Common Issues

#### Tests Hanging
```bash
# Check for open handles
npm test -- --detectOpenHandles --forceExit

# Run with shorter timeout
npm test -- --testTimeout=10000
```

#### Module Resolution Errors
```bash
# Clear Jest cache
npm test -- --clearCache

# Check module paths
npm test -- --showConfig
```

#### TypeScript Compilation Errors
```bash
# Verify TypeScript configuration
npm run type-check

# Check Jest TypeScript setup
cat jest.config.js
```

### Debug Environment

```bash
# Enable debug logging
DEBUG=* npm test

# Run with Node.js debugging
node --inspect-brk node_modules/.bin/jest

# Test specific file with debugging
npm test -- --testPathPattern=config-manager --verbose
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use mocks for browser, API calls, file system
3. **Clear Test Names**: Describe what the test validates
4. **Setup/Teardown**: Use beforeEach/afterEach for clean state
5. **Error Testing**: Test both success and failure scenarios
6. **Type Safety**: Use TypeScript types in tests
7. **Coverage**: Aim for high coverage on critical paths
8. **Fast Execution**: Keep tests fast with proper mocking

This automated testing approach ensures framework reliability during development while maintaining fast feedback loops for developers.