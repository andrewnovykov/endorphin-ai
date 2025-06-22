# Endorphin AI User Setup Guide

## Quick Start

### 1. Installation
```bash
npm install -g endorphin-ai
```

### 2. Initialize Your Project
```bash
mkdir my-tests
cd my-tests
npm init -y
```

### 3. Configure ES Modules
Add to your `package.json`:
```json
{
  "type": "module"
}
```

### 4. Create Configuration
Create `endorphin.config.js`:
```javascript
export default {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  execution: {
    timeout: 30000,
    testsDirectory: './tests'
  },
  ai: {
    model: 'gpt-4o-mini',
    temperature: 0.1
  }
};
```

### 5. Set Environment Variables
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 6. Create Test Directory
```bash
mkdir tests
```

### 7. Write Your First Test
Create `tests/my-first-test.js`:
```javascript
export const MY_FIRST_TEST = {
  id: "TEST-001",
  name: "My First Test",
  description: "A simple test to verify the page loads",
  priority: "High",
  tags: ["smoke", "basic"],
  site: "https://example.com",
  task: "Navigate to https://example.com and verify that the page title contains 'Example'"
};
```

### 8. Run Your Tests
```bash
# List all tests
endorphin list

# Run a specific test
endorphin run test TEST-001

# Run by tag
endorphin run test --tag smoke

# Run by priority
endorphin run test --priority High

# Run all tests
endorphin run test all
```

## Test Writing Guidelines

### Test Object Structure
Each test must export a constant with this structure:
```javascript
export const TEST_ID = {
  id: "TEST-001",              // Unique identifier
  name: "Test Name",           // Human-readable name
  description: "What it does", // Brief description
  priority: "High|Medium|Low", // Test priority
  tags: ["tag1", "tag2"],      // Array of tags for filtering
  site: "https://...",         // Target website
  testData: {                  // Optional test data
    username: "user@example.com",
    password: "password123"
  },
  task: "Natural language instructions for the AI agent"
};
```

### Writing Effective Tasks
- Use clear, specific instructions
- Break complex flows into steps
- Include verification steps
- Reference test data when needed

Example:
```javascript
task: `
1. Navigate to the login page at ${site}/login
2. Fill in the username field with ${testData.username}
3. Fill in the password field with ${testData.password}
4. Click the login button
5. Verify that the page redirects to the dashboard
6. Verify that the user's name appears in the top navigation
`
```

## Configuration Options

### Browser Settings
```javascript
browser: {
  type: 'chromium',           // chromium, firefox, webkit
  headless: true,             // Run without UI
  viewport: {
    width: 1280,
    height: 720
  },
  timeout: 30000              // Page load timeout
}
```

### AI Settings
```javascript
ai: {
  model: 'gpt-4o-mini',       // OpenAI model
  temperature: 0.1,           // Response randomness (0-1)
  maxTokens: 2000            // Response length limit
}
```

### Execution Settings
```javascript
execution: {
  timeout: 30000,             // Test timeout in ms
  testsDirectory: './tests',  // Test files location
  screenshots: true,          // Take screenshots
  parallel: false            // Run tests in parallel
}
```

## CLI Commands

### Basic Commands
```bash
endorphin --help              # Show help
endorphin --version           # Show version
endorphin list                # List all tests
```

### Running Tests
```bash
endorphin run test TEST-001           # Run specific test
endorphin run test --tag smoke        # Run by tag
endorphin run test --priority High    # Run by priority
endorphin run test all                # Run all tests
```

### CLI Flags
```bash
--headless true/false         # Override headless mode
--viewport 1920x1080          # Override viewport size
--model gpt-4                 # Override AI model
--environment dev             # Use specific environment
--debug                       # Enable debug output
```

## Directory Structure

Your project should look like this:
```
my-test-project/
├── package.json              # Include "type": "module"
├── endorphin.config.js       # Main configuration
├── tests/                    # Test files directory
│   ├── login-test.js
│   ├── checkout-test.js
│   └── ...
├── data/                     # Test data files (optional)
│   ├── users.json
│   └── products.json
└── test-result/              # Results (auto-generated)
    └── ...
```

## Troubleshooting

### ES Module Issues
Ensure your `package.json` includes:
```json
{
  "type": "module"
}
```

### API Key Issues
Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key"
```

### Test Not Found
- Check that test files are in the `testsDirectory`
- Verify test objects are exported correctly
- Ensure test IDs are unique

### Browser Issues
- Install required browsers: `npx playwright install`
- Check browser type in configuration
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
