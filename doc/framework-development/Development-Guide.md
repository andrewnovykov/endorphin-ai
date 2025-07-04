# Endorphin AI Framework - Development Guide

_Last Updated: July 4, 2025 - v0.9.0_

This guide covers everything you need to know for developing and contributing to the Endorphin AI Framework.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Test Development](#test-development)
4. [Framework Testing](#framework-testing)
5. [Debugging Guide](#debugging-guide)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/andrewnovykov/endorphin-ai.git
cd endorphin-ai
npm install
```

### 2. Create Environment File
```bash
echo "OPENAI_API_KEY=your_key_here" > .env
```

### 3. Run Framework Tests
```bash
# Run all development tests
npm test

# Run your first test (requires API key)
npx tsx bin/endorphin.ts run test HEALTH-001
```

## Development Setup

### Required Files
1. **`.env`** - OpenAI API key
2. **`endorphin.config.ts`** - Project configuration
3. **`tests/`** - Your test files directory

### Environment Variables (v0.9)
```bash
# .env for development
OPENAI_API_KEY=your_key_here      # Required for AI agent
HEADLESS=false                    # See browser actions
BASE_URL=https://example.com      # Override test URLs
ENDORPHIN_DEBUG=verbose           # Enable detailed debug logging
```

## Test Development

### Running User Tests (No Build Required)

#### Run Specific Test
```bash
# Using test ID
npx tsx bin/endorphin.ts run test HEALTH-001

# With non-headless mode
HEADLESS=false npx tsx bin/endorphin.ts run test HEALTH-001
```

#### List Available Tests
```bash
# See all discovered tests
npx tsx bin/endorphin.ts list
```

#### Generate Reports
```bash
# Generate HTML report
npx tsx bin/endorphin.ts generate report
```

### Test Locations

Tests are discovered from:
- **Examples**: `examples/tests/` (provided tests)
- **Your Tests**: `tests/` (your custom tests)

Example test IDs:
- `HEALTH-001` → `examples/tests/HEALTH-001.ts`
- `SAMPLE-001` → `examples/tests/SAMPLE-001.ts`

## Framework Testing

### Current Testing Structure (v0.9)

#### Development Tests (`dev-tests/development/`)
```bash
# Run all Jest tests
npm test

# Unit tests only
npm test dev-tests/development/unit

# Integration tests only
npm test dev-tests/development/integration

# With coverage
npm run test:coverage
```

#### Package Tests (`dev-tests/package-tests/`)
```bash
# Test the actual built package
cd dev-tests/package-tests
./run-all-tests.sh

# Test specific category
./run-tests-by-category.sh recorder
./run-tests-by-category.sh reporter
```

### Creating Tests (v0.9 Structure)

#### Smart Test with Setup & Data
```typescript
// tests/smart-test.ts
export const SMART_TEST: TestCase = {
  id: 'SMART-001',
  name: 'Smart Login Test',
  description: 'Test with dynamic setup and data',
  priority: 'High',
  tags: ['login', 'smart'],
  
  // NEW v0.9: Environment setup
  setup: async () => {
    return {
      baseUrl: process.env.BASE_URL || 'https://staging.app.com',
      timestamp: new Date().toISOString()
    };
  },
  
  // NEW v0.9: Dynamic data generation
  data: async () => {
    return {
      email: `test_${Date.now()}@example.com`,
      password: 'SecurePass123!'
    };
  },
  
  // NEW v0.9: Function-based task
  task: async (data, setupData) => {
    return `
      Navigate to ${setupData.baseUrl}/login
      Fill email field with ${data.email}
      Fill password field with ${data.password}
      Click Sign In button
      Verify dashboard loads successfully
    `;
  }
};
```

#### Static Test (Traditional)
```typescript
// tests/basic-test.ts
export const BASIC_TEST: TestCase = {
  id: 'BASIC-001',
  name: 'Basic Navigation Test',
  description: 'Simple static test',
  priority: 'High',
  tags: ['smoke'],
  task: 'Navigate to google.com and verify page loads'
};
```

## Debugging Guide

### 1. VS Code Debugging Setup

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Endorphin Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/bin/endorphin.ts",
      "args": ["run", "test", "HEALTH-001"],
      "runtimeArgs": ["--loader", "tsx/esm"],
      "env": {
        "ENDORPHIN_DEBUG": "verbose",
        "ENDORPHIN_BROWSER_HEADLESS": "false"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Test Recorder",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/bin/endorphin.ts",
      "args": ["run", "test-recorder"],
      "runtimeArgs": ["--loader", "tsx/esm"],
      "env": {
        "ENDORPHIN_DEBUG": "verbose"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 2. Console Debugging
```bash
# Enable verbose debug logging
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001

# See browser actions (non-headless)
HEADLESS=false npx tsx bin/endorphin.ts run test HEALTH-001

# Combined debugging
ENDORPHIN_DEBUG=verbose HEADLESS=false npx tsx bin/endorphin.ts run test HEALTH-001

# Override base URL
BASE_URL=https://staging.app.com npx tsx bin/endorphin.ts run test LOGIN-001
```

### 3. Debug Logging in Tests
```typescript
const debugTest: TestCase = {
  id: 'DEBUG-001',
  name: 'Debug Test',
  
  setup: async () => {
    console.log('🔍 DEBUG: Setup starting...');
    const data = { url: 'https://test.com' };
    console.log('🔍 DEBUG: Setup data:', data);
    return data;
  },
  
  data: async () => {
    console.log('🔍 DEBUG: Generating data...');
    return { testValue: 'debug-value' };
  },
  
  task: async (data, setupData) => {
    console.log('🔍 DEBUG: Task data:', data);
    console.log('🔍 DEBUG: Setup data:', setupData);
    return `Navigate to ${setupData.url}`;
  }
};
```

## Common Development Tasks

### 1. Test Recorder
```bash
# Run test recorder interactively
npx tsx bin/endorphin.ts run test-recorder
```

### 2. Generate Reports
```bash
# Generate HTML report with cost tracking
npx tsx bin/endorphin.ts generate report
```

### 3. Framework Development Cycle
```bash
# 1. Edit framework code
vim framework/core/test-framework.ts

# 2. Run development tests
npm test

# 3. Test with real scenario
npx tsx bin/endorphin.ts run test HEALTH-001

# 4. Test package integration
cd dev-tests/package-tests && ./run-all-tests.sh
```

### 4. Quick Test Development
```bash
# 1. Create test file
vim tests/my-test.ts

# 2. List tests to verify discovery
npx tsx bin/endorphin.ts list

# 3. Run test with debugging
ENDORPHIN_DEBUG=verbose HEADLESS=false npx tsx bin/endorphin.ts run test MY-TEST-001
```

## Troubleshooting

### Test Not Found
```bash
# List all discovered tests
npx tsx bin/endorphin.ts list

# Check test file structure - ensure proper export:
export const MY_TEST: TestCase = { id, name, task, ... };
```

### Import Errors
```bash
# For framework imports
import type { TestCase } from 'endorphin-ai';

# For custom imports in tests
import { MyHelper } from './helpers/my-helper.js';
```

### Browser Issues
```bash
# Install browsers if needed
npx playwright install

# Run in visible mode
HEADLESS=false npx tsx bin/endorphin.ts run test HEALTH-001
```

### Framework Test Failures
```bash
# Run specific test file
npm test -- dev-tests/development/unit/config-loader.test.ts

# Debug with verbose output
npm test -- --verbose

# Clear Jest cache
npm test -- --clearCache
```

## Development vs Distribution

### Development Mode (v0.9)
- **TypeScript source execution** with tsx
- **No build step** for development
- **Jest testing** for framework validation
- **Real package testing** with bash scripts

### Distribution Mode
```bash
# For publishing npm package
npm run build              # Compile TypeScript → JavaScript
npm run lint               # Code quality check
npm run type-check         # TypeScript validation

# Test the built package
cd dev-tests/package-tests
./run-all-tests.sh
```

## Tips and Best Practices (v0.9)

1. **Run framework tests first** - Use `npm test` before developing
2. **Use smart test structure** - Leverage setup/data/task functions
3. **Test cost tracking** - Monitor token usage in reports
4. **Use non-headless mode** - Set `HEADLESS=false` to see browser
5. **Test package integration** - Use `dev-tests/package-tests/`
6. **Keep tests focused** - One scenario per test
7. **Tag appropriately** - Use consistent tagging strategy

## Framework Development Commands

```bash
# Development workflow
npm test                                    # Run Jest tests
npx tsx bin/endorphin.ts run test HEALTH-001  # Test with real scenario
cd dev-tests/package-tests && ./run-all-tests.sh  # Package validation

# Distribution workflow
npm run build
npm run lint
npm run type-check
```

## Next Steps

1. Run `npm test` to validate framework
2. Create tests using v0.9 smart structure
3. Test with real scenarios using tsx
4. Validate package with bash tests

Happy framework development! 🚀