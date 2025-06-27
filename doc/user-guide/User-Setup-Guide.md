# Endorphin AI User Setup Guide

_Last Updated: June 27, 2025 - v0.4.1+_

**Endorphin AI** is a natural language browser testing framework that lets you
write tests in plain English. This guide will help you get started as an end
user who wants to install and use the framework.

## 🚀 Quick Start

### 1. Installation

**Option A: Global Installation (Recommended)**

```bash
npm install -g endorphin-ai
```

**Option B: Project-Local Installation**

```bash
# In your project directory
npm install endorphin-ai

# Use with npx
npx endorphin --version
```

### 2. Verify Installation

```bash
# Check version (should show v0.4.1+)
endorphin --version

# Show help
endorphin --help

# Initialize your first project
endorphin init
```

### 3. Project Setup

**Option A: Use the init command (Recommended)**

```bash
mkdir my-endorphin-tests
cd my-endorphin-tests
endorphin init
```

**Option B: Manual setup**

```bash
mkdir my-endorphin-tests
cd my-endorphin-tests
npm init -y
```

### 4. Configure Your Project

The `endorphin init` command creates the necessary files. If you're setting up
manually, create these files:

**package.json** (ensure ES modules are enabled):

```json
{
  "name": "my-endorphin-tests",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "endorphin run test all",
    "test:smoke": "endorphin run test --tag smoke",
    "test:high": "endorphin run test --priority High"
  }
}
```

**endorphin.config.ts** (main configuration):

```typescript
export default {
  // OpenAI API Key (required for AI functionality)
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Browser settings
  browser: {
    headless: false, // Set to false to see the browser
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    slowMo: 500, // Slow down for demo purposes
  },

  // Test results configuration
  resultsDir: './test-results',

  // Environment-specific settings
  environments: {
    dev: {
      baseUrl: 'http://localhost:3000',
      browser: { headless: false },
    },
    staging: {
      baseUrl: 'https://staging.myapp.com',
      browser: { headless: true },
    },
    prod: {
      baseUrl: 'https://myapp.com',
      browser: { headless: true },
    },
  },
};
```

    model: 'gpt-4o',
    maxRetries: 3,
    temperature: 0.1,

}, };

````

### 5. Set Environment Variables

Create a `.env` file in your project root:
```bash
# .env file
OPENAI_API_KEY=your-openai-api-key-here
````

**Or set environment variables in your shell:**

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### 6. Create Your First Test

The `endorphin init` command creates an example test. If you're setting up
manually, create `tests/` directory and your first test:

**tests/example-test.ts**:

```typescript
export const EXAMPLE_TEST = {
  id: 'TEST-001',
  name: 'Example Website Test',
  description: 'A simple test to verify the example website loads correctly',
  priority: 'High' as const,
  tags: ['smoke', 'basic'],
  site: 'https://example.com',
  task: 'Navigate to https://example.com and verify that the page loads successfully and contains the word "Example" in the title',
};
```

### 7. Run Your Tests

```bash
# List all discovered tests
endorphin list

# Run a specific test by ID
endorphin run test TEST-001

# Run all tests
endorphin run test all

# Run tests by tag
endorphin run test --tag smoke

# Run tests by priority
endorphin run test --priority High
```

### 8. View Test Results

```bash
# Generate HTML report
endorphin generate report

# Open the latest report in browser
endorphin open report
```

## 📋 Essential Commands

### Project Management

```bash
endorphin init                    # Initialize new project with examples
endorphin --version               # Check version
endorphin --help                  # Show help
```

### Test Discovery & Execution

```bash
endorphin list                    # List all tests
endorphin list --tag smoke        # List tests with specific tag
endorphin list --priority High    # List high priority tests

endorphin run test TEST-001       # Run specific test
endorphin run test all            # Run all tests
endorphin run test --tag smoke    # Run tests by tag
endorphin run test --priority High # Run tests by priority
```

### Interactive Features

```bash
endorphin run test-recorder       # Start interactive test recorder
```

### Reports & Results

```bash
endorphin generate report         # Generate HTML report
endorphin open report             # Open latest report
endorphin cleanup results         # Clean up old test results
```

## 📝 Test Writing Guidelines

### Test Object Structure

Each test must export a constant with this structure:

```typescript
export const TEST_ID = {
  id: 'TEST-001', // Unique identifier (required)
  name: 'Test Name', // Human-readable name (required)
  description: 'What this test does', // Brief description (required)
  priority: 'High' as const, // 'High' | 'Medium' | 'Low' (required)
  tags: ['tag1', 'tag2'], // Array of tags for filtering (required)
  site: 'https://example.com', // Target website URL (required)

  // Optional test data
  testData: {
    username: 'user@example.com',
    password: 'password123',
    expectedTitle: 'Dashboard',
  },

  // Natural language instructions (required)
  task: 'Natural language instructions for the AI agent to follow',
};
```

### Writing Effective Tasks

The `task` field should contain clear, step-by-step instructions in natural
language:

**Good Examples:**

```typescript
// Simple navigation test
task: 'Navigate to https://example.com and verify the page loads successfully';

// Login flow test
task: `
1. Navigate to the login page
2. Fill in the username field with ${testData.username}
3. Fill in the password field with ${testData.password} 
4. Click the login button
5. Verify that the dashboard page loads and shows welcome message
`;

// E-commerce test
task: `
1. Go to the products page
2. Search for "laptop"
3. Click on the first laptop result
4. Add the laptop to cart
5. Go to cart and verify the item is there
6. Verify the price is displayed correctly
`;
```

**Best Practices:**

- ✅ Use clear, specific language
- ✅ Break complex flows into numbered steps
- ✅ Include verification steps ("verify that...")
- ✅ Reference testData variables when needed
- ✅ Be specific about which elements to interact with
- ❌ Avoid vague instructions like "test the website"
- ❌ Don't include technical implementation details

5. Verify that the page redirects to the dashboard
6. Verify that the user's name appears in the top navigation `;

````

## Configuration Options

### Browser Settings

```javascript
browser: {
  type: 'chromium',           // chromium, firefox, webkit
## 🏗️ Project Organization

### Recommended Directory Structure

````

my-endorphin-project/ ├── package.json # Include "type": "module" ├──
endorphin.config.ts # Main configuration ├── .env # Environment variables
(OPENAI_API_KEY) ├── tests/ # Test files directory │ ├── smoke/ │ │ ├──
basic-navigation.ts │ │ └── health-check.ts │ ├── auth/ │ │ ├── login-test.ts │
│ └── logout-test.ts │ └── e2e/ │ ├── checkout-flow.ts │ └──
user-registration.ts ├── test-data/ # Test data files (optional) │ ├──
users.json │ └── products.json └── test-results/ # Results (auto-generated) ├──
reports/ # HTML reports └── TEST-001_timestamp/ # Individual test results

````

### Multiple Test Files

You can organize tests in multiple files and subdirectories:

**tests/auth/login-test.ts:**
```typescript
export const LOGIN_TEST = {
  id: 'AUTH-001',
  name: 'User Login Test',
  description: 'Test successful user login',
  priority: 'High' as const,
  tags: ['auth', 'login', 'smoke'],
  site: 'https://myapp.com',
  task: 'Navigate to login page, enter credentials, and verify successful login'
};
````

**tests/smoke/health-check.ts:**

```typescript
export const HEALTH_CHECK = {
  id: 'HEALTH-001',
  name: 'Application Health Check',
  description: 'Verify the application is accessible and responsive',
  priority: 'High' as const,
  tags: ['smoke', 'health'],
  site: 'https://myapp.com',
  task: 'Navigate to the homepage and verify it loads within 5 seconds',
};
```

## ⚙️ Advanced Configuration

### Environment-Specific Settings

Configure different environments in `endorphin.config.ts`:

```typescript
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Default settings
  browser: {
    headless: false,
    timeout: 30000,
  },

  // Environment-specific overrides
  environments: {
    local: {
      baseUrl: 'http://localhost:3000',
      browser: { headless: false, slowMo: 1000 },
    },
    dev: {
      baseUrl: 'https://dev.myapp.com',
      browser: { headless: false },
    },
    staging: {
      baseUrl: 'https://staging.myapp.com',
      browser: { headless: true },
    },
    prod: {
      baseUrl: 'https://myapp.com',
      browser: { headless: true, timeout: 60000 },
    },
  },
};
```

**Run tests with specific environment:**

```bash
endorphin run test TEST-001 --env staging
```

### Browser Configuration

```typescript
browser: {
  headless: false,            // Show browser UI
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,             // Page load timeout
  slowMo: 500,               // Slow down for demos

  // Playwright-specific options
  args: ['--disable-web-security'], // Chrome args
  ignoreHTTPSErrors: true,
  recordVideo: false
}
```

### AI Model Configuration

```typescript
ai: {
  model: 'gpt-4o',            // Available: gpt-4o, gpt-4o-mini
  temperature: 0.1,           // Response randomness (0-1)
  maxTokens: 4000,           // Response length limit
  timeout: 60000             // AI request timeout
}
```

## 🐛 Troubleshooting

### Common Issues

#### Installation Problems

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g endorphin-ai

# Verify installation
endorphin --version
```

#### API Key Issues

```bash
# Check if API key is set
echo $OPENAI_API_KEY

# Set API key in .env file
echo "OPENAI_API_KEY=your-key-here" > .env
```

#### Test Discovery Issues

```bash
# Verify tests are discovered
endorphin list

# Check file structure and exports
# Ensure tests export constants correctly
```

#### Browser Issues

```bash
# Install Playwright browsers
npx playwright install

# Test browser launch
endorphin run test HEALTH-001 --debug
```

### Error Messages

**"No tests found"**

- Check that test files are in the `tests/` directory
- Verify test objects are exported with `export const`
- Ensure `package.json` has `"type": "module"`

**"OpenAI API key not found"**

- Set `OPENAI_API_KEY` environment variable
- Add key to `.env` file in project root
- Verify key in configuration file

**"Browser failed to launch"**

- Run `npx playwright install`
- Check browser configuration settings
- Try running with `--headless false` for debugging

## 📚 Next Steps

1. **Read the HTML Reporter Guide** - Learn how to generate and view test
   reports
2. **Try the Test Recorder** - Record tests interactively by giving natural
   language commands
3. **Explore Examples** - Check out the `examples/` directory for sample tests
4. **Join the Community** - Get help and share your experience

## 🔗 Related Documentation

- **[HTML Reporter Guide](./HTML-Reporter-Guide.md)** - Generate interactive
  test reports
- **[Test Recorder Guide](./Test-Recorder.md)** - Record tests interactively
- **[Global Setup Guide](./Global-Setup-Guide.md)** - Configure global
  setup/teardown
- **[Custom Tools Guide](./Custom-Tools-Guide.md)** - Extend the framework with
  custom tools

**Happy Testing with Endorphin AI! 🚀**

- Verify system permissions for browser automation

## Best Practices

1. **Use meaningful test IDs**: `LOGIN-001`, `CHECKOUT-002`
2. **Group tests with tags**: `["smoke", "login", "critical"]`
3. **Set appropriate priorities**: Use "High" for critical paths
4. **Write clear task descriptions**: Be specific about what to test
5. **Use test data files**: Keep test data separate from test logic
6. **Regular test maintenance**: Update tests when UI changes

## Getting Help

- Check the [Maintainers Guide](./Maintainers.md) for advanced usage
- Review example tests in the `examples/` directory
- Use `endorphin --help` for CLI reference
