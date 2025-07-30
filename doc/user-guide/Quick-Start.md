_Last Updated: July 4, 2025 - v0.9.0_
# Quick Start Guide

Welcome to Endorphin AI! This guide will get you up and running in minutes.

## 🚀 What is Endorphin AI?

Endorphin AI is a browser testing tool that understands plain English. Just tell it what to test, and it handles the rest.

## 📦 Installation

```bash
npm install endorphin-ai
```

## 🔑 Setup

1. Create a `.env` file with your OpenAI key:
```bash
OPENAI_API_KEY=your_key_here
```

2. Initialize your project:
```bash
npx endorphin-ai init
```

## ✨ Your First Test

Create a test file `tests/my-first-test.ts`:

```typescript
import type { TestCase } from 'endorphin-ai';

export const MY_FIRST_TEST: TestCase = {
  id: 'TEST-001',
  name: 'My First Test',
  description: 'Check if Google search works',
  priority: 'High',
  tags: ['demo'],
  
  task: 'Go to google.com and search for "Endorphin AI"'
};
```

Run it:
```bash
npx endorphin-ai run test TEST-001
```

## 🎯 Smart Tests with Data

Tests can prepare data and set up environments automatically:

```typescript
export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test login with generated credentials',
  priority: 'High',
  tags: ['auth', 'login'],
  
  // Setup runs before the test
  setup: async () => {
    return {
      testUrl: 'https://myapp.com',
      timestamp: new Date().toISOString()
    };
  },
  
  // Generate test data dynamically
  data: async () => {
    return {
      username: `test_${Date.now()}@example.com`,
      password: 'SecurePass123!'
    };
  },
  
  // Use the data in your test
  task: async (data, setupData) => {
    return `
      Go to ${setupData.testUrl}
      Click "Login"
      Enter username: ${data.username}
      Enter password: ${data.password}
      Click "Submit"
      Verify welcome message appears
    `;
  }
};
```

## 🛠️ Built-in Tools

Endorphin AI includes 12 tools that understand natural language:

- **navigate** - Go to websites
- **click** - Click buttons and links
- **fill** - Type in forms
- **verifyElement** - Check if things exist
- **screenshot** - Take pictures
- **wait** - Pause between actions

See all tools:
```bash
npx endorphin-ai list tools
```

## 📊 Interactive Reports

After running tests, generate beautiful reports:

```bash
# Generate report
npx endorphin-ai generate report

# Open in browser
npx endorphin-ai open report
```

### Report Features:
- 🖼️ Click screenshots to zoom
- 🔍 Search tests by name
- 📈 Filter by passed/failed
- ⌨️ Keyboard shortcuts (Ctrl+F to search)

## 💡 Tips

### Simple Test Format
```typescript
task: 'Go to amazon.com, search for "laptop", verify results appear'
```

### Step-by-Step Format
```typescript
task: `
  1. Navigate to linkedin.com
  2. Click "Sign in"
  3. Enter email: test@example.com
  4. Enter password: mypassword
  5. Click "Sign in" button
  6. Verify dashboard loads
`
```

### Dynamic Data
```typescript
data: async () => ({
  email: `user_${Date.now()}@test.com`,
  product: 'iPhone 15',
  quantity: Math.floor(Math.random() * 5) + 1
})
```

## 🏃 Quick Commands

```bash
# Run a specific test
npx endorphin-ai run test TEST-ID

# Run all tests
npx endorphin-ai run all

# Generate report
npx endorphin-ai generate report

# List available tools
npx endorphin-ai list tools

# Create a new test
npx endorphin-ai create test
```

## 🆘 Need Help?

- Check test results in `test-results/` folder
- Reports are in `test-results/reports/`
- Screenshots help debug failures
- Use `--verbose` for detailed output

## 📚 Next Steps

1. [Write Your Own Tests](Test-Structure-Guide.md)
2. [Configure Your Project](Project-Setup-Guide.md)
3. [Explore HTML Reports](HTML-Reporter-Guide.md)
4. [Advanced Testing Tips](Test-Writing-Tips.md)

---

**That's it!** You're ready to test with AI. Happy testing! 🎉