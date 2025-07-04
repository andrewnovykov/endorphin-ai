# Endorphin AI Framework - Development Guide

This guide covers everything you need to know for developing and debugging with the Endorphin AI Framework during development (without building to dist).

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Running Tests During Development](#running-tests-during-development)
4. [Creating Tests](#creating-tests)
5. [Debugging Guide](#debugging-guide)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/endorphin-ai.git
cd endorphin-ai
npm install
```

### 2. Create Environment File
```bash
cp examples/.env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Run Your First Test (Development Mode)
```bash
# No build required! Run directly with tsx
npx tsx bin/endorphin.ts run test HEALTH-001
```

## Development Setup

### Required Files
1. **`.env`** - Your environment configuration
2. **`endorphin.config.ts`** - Project configuration (optional)
3. **`tests/`** - Your test files directory

### Development Environment Variables
```bash
# .env for development
OPENAI_API_KEY=your_key_here
ENDORPHIN_DEBUG=verbose          # Enable debug logging
ENDORPHIN_BROWSER_HEADLESS=false # See browser actions
ENDORPHIN_STEP_DELAY=2000        # Slower execution for debugging
```

## Running Tests During Development

### Direct TypeScript Execution (No Build Required)

#### Run Specific Test
```bash
# Using test ID
npx tsx bin/endorphin.ts run test HEALTH-001
npx tsx bin/endorphin.ts run test UI-DEMO-001

# With debug logging
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001
```

#### List Available Tests
```bash
# See all discovered tests
npx tsx bin/endorphin.ts run test list
```

#### Run All Tests
```bash
# Run all tests
npx tsx bin/endorphin.ts run test all

# Run with parallel execution
npx tsx bin/endorphin.ts run test all --parallel 2
```

#### Run Tests by Tag
```bash
# Run tests with specific tags
npx tsx bin/endorphin.ts run test --tags health-check
npx tsx bin/endorphin.ts run test --tags "smoke,regression"
```

### Test Locations

Tests are discovered from these locations:
- **Examples**: `examples/tests/` (provided tests)
- **Your Tests**: `tests/` (your custom tests)

Example test IDs and locations:
- `HEALTH-001` → `examples/tests/sample-test.ts`
- `UI-DEMO-001` → `examples/tests/ui-demo.ts`
- Your tests → `tests/your-test.ts`

## Creating Tests

### Basic Test Structure
```typescript
// tests/my-login-test.ts
import type { TestCase } from 'endorphin-ai';

const loginTest: TestCase = {
  id: 'LOGIN-001',
  name: 'Basic Login Test',
  description: 'Verify user can log in successfully',
  priority: 'High',
  tags: ['login', 'smoke'],
  
  task: `
    Navigate to https://my-app.com
    Click on "Login" button
    Enter "test@example.com" in email field
    Enter "password123" in password field
    Click "Submit" button
    Verify "Dashboard" text is visible
  `
};

export default loginTest;
```

### Advanced Test with Function-Based Task
```typescript
// tests/advanced-test.ts
import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';

const advancedTest: TestCase = {
  id: 'ADV-001',
  name: 'Advanced Test with Data Generation',
  description: 'Test with setup and generated data',
  priority: 'Medium',
  tags: ['advanced', 'data-driven'],
  
  // Setup function runs before test
  setup: async () => {
    console.log('🔧 Running test setup...');
    return {
      baseUrl: process.env.BASE_URL || 'https://my-app.com',
      timestamp: new Date().toISOString()
    };
  },
  
  // Data generation function
  data: async () => {
    console.log('📊 Generating test data...');
    const userData = await generateData({
      email: 'email',
      password: 'password',
      firstName: 'firstname',
      lastName: 'lastname'
    }, 'Generate realistic user data');
    
    return { user: userData };
  },
  
  // Task function receives data and setupData
  task: async (data, setupData) => {
    return `
      Navigate to ${setupData.baseUrl}
      Click on "Sign Up" button
      Fill "email" field with "${data.user.email}"
      Fill "password" field with "${data.user.password}"
      Fill "firstName" field with "${data.user.firstName}"
      Fill "lastName" field with "${data.user.lastName}"
      Click "Create Account" button
      Verify "Welcome ${data.user.firstName}" is visible
    `;
  }
};

export default advancedTest;
```

### Test Naming Conventions
- **ID Format**: `PREFIX-NUMBER` (e.g., `LOGIN-001`, `CHECKOUT-005`)
- **File Names**: Use descriptive names (e.g., `login-test.ts`, `checkout-flow.ts`)
- **Tags**: Use consistent tags for test organization

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
# Maximum debug output
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001

# See browser actions (non-headless)
ENDORPHIN_BROWSER_HEADLESS=false npx tsx bin/endorphin.ts run test UI-DEMO-001

# Slow down execution
ENDORPHIN_STEP_DELAY=3000 npx tsx bin/endorphin.ts run test LOGIN-001
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

# Debug test recorder
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test-recorder
```

### 2. Generate Reports
```bash
# Generate HTML report
npx tsx bin/endorphin.ts generate report

# Debug report generation
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts generate report
```

### 3. Quick Test Development Cycle
```bash
# 1. Create/edit your test file
vim tests/my-new-test.ts

# 2. List tests to verify discovery
npx tsx bin/endorphin.ts run test list

# 3. Run your test with debug
ENDORPHIN_DEBUG=verbose ENDORPHIN_BROWSER_HEADLESS=false \
  npx tsx bin/endorphin.ts run test MY-NEW-001

# 4. Fix issues and re-run immediately (no build needed!)
```

### 4. Framework Development
```bash
# Edit framework code
vim framework/automation/tools/interaction.ts

# Test immediately without building
npx tsx bin/endorphin.ts run test UI-DEMO-001
```

## Troubleshooting

### Test Not Found
```bash
# List all discovered tests
npx tsx bin/endorphin.ts run test list

# Check test file structure
# Ensure: 1) File exports default object
#         2) Object has required properties (id, name, task)
#         3) File is in tests/ or examples/tests/
```

### Import Errors
```bash
# For custom imports in tests
import { MyHelper } from './helpers/my-helper.js';  # Note: .js extension

# For framework imports
import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';
```

### Browser Issues
```bash
# Install browsers if needed
npx playwright install chromium

# Try different browser
ENDORPHIN_BROWSER_TYPE=firefox npx tsx bin/endorphin.ts run test HEALTH-001
```

### Debug Output Not Showing
```bash
# Ensure debug is enabled
export ENDORPHIN_DEBUG=verbose
npx tsx bin/endorphin.ts run test HEALTH-001

# Or inline
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001
```

## Development vs Production

### Development Mode (Using tsx)
- **Direct TypeScript execution**
- **No build step required**
- **Better error messages**
- **Instant code changes**
- **Full debugging support**

### Production Mode (Using dist)
```bash
# Only needed for:
# - Publishing npm package
# - Production deployment
# - CI/CD pipelines

npm run build
npm run test:package
```

## Tips and Best Practices

1. **Always use tsx during development** - No need to build
2. **Enable debug logging** when troubleshooting
3. **Use non-headless mode** to see what's happening
4. **Add console.log** in your test functions for debugging
5. **Keep tests focused** - One scenario per test
6. **Use descriptive IDs** - Makes debugging easier
7. **Tag appropriately** - Helps with test organization

## Next Steps

1. Create your first test in `tests/`
2. Run it with `npx tsx bin/endorphin.ts run test YOUR-TEST-ID`
3. Debug with `ENDORPHIN_DEBUG=verbose`
4. Iterate quickly without building!

Happy testing! 🚀