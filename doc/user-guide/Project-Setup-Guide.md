_Last Updated: July 4, 2025 - v0.9.0_
# Project Setup Guide

Set up your Endorphin AI project in minutes.

## 🚀 Installation

### Option 1: Install in Your Project (Recommended)
```bash
cd my-project
npm install endorphin-ai
```

### Option 2: Global Installation
```bash
npm install -g endorphin-ai
```

## 📁 Project Setup

### Quick Setup with Init
```bash
npx endorphin-ai init
```

This creates:
- `endorphin.config.ts` - Configuration file
- `tests/` folder - For your test files
- `.env.example` - Environment variables template
- Example test file

### Manual Setup
If you prefer to set up manually:

1. **Create config file** (`endorphin.config.ts`):
```typescript
export default {
  browser: {
    headless: false,  // See the browser
    slowMo: 500      // Slow down for debugging
  }
};
```

2. **Create `.env` file**:
```bash
OPENAI_API_KEY=your_key_here
```

3. **Create tests folder**:
```bash
mkdir tests
```

## 🔑 OpenAI Setup

1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env` file:
```bash
OPENAI_API_KEY=sk-proj-abc123...
```

## 📝 Your First Test

Create `tests/my-first-test.ts`:

```typescript
export const GOOGLE_TEST = {
  id: 'TEST-001',
  name: 'Google Search Test',
  description: 'Search for something on Google',
  priority: 'High',
  tags: ['demo', 'search'],
  task: 'Go to google.com and search for "Endorphin AI"'
};
```

## ▶️ Run Your Test

```bash
# List all tests
npx endorphin-ai list

# Run specific test
npx endorphin-ai run test TEST-001

# Run all tests
npx endorphin-ai run test all
```

## 📊 View Results

```bash
# Generate report
npx endorphin-ai generate report

# Open in browser
npx endorphin-ai open report
```

## ⚙️ Configuration Options

### Basic Config
```typescript
// endorphin.config.ts
export default {
  // Browser settings
  browser: {
    headless: false,      // Show browser window
    viewport: {           // Browser size
      width: 1280,
      height: 720
    },
    timeout: 30000       // 30 seconds timeout
  },
  
  // Results folder
  resultsDir: './test-results'
};
```

### Environment-Specific Config
```typescript
export default {
  // Default settings
  browser: {
    headless: false
  },
  
  // Different environments
  environments: {
    local: {
      baseUrl: 'http://localhost:3000'
    },
    staging: {
      baseUrl: 'https://staging.myapp.com',
      browser: { headless: true }
    },
    production: {
      baseUrl: 'https://myapp.com',
      browser: { headless: true }
    }
  }
};
```

Use environments:
```bash
npx endorphin-ai run test TEST-001 --env staging
```

## 📂 Project Structure

```
my-project/
├── endorphin.config.ts    # Configuration
├── .env                   # API keys
├── package.json           # Dependencies
├── tests/                 # Test files
│   ├── smoke/            # Smoke tests
│   ├── auth/             # Authentication tests
│   └── e2e/              # End-to-end tests
└── test-results/         # Results (auto-created)
    ├── reports/          # HTML reports
    └── screenshots/      # Test screenshots
```

## 🎯 Best Practices

### Organize Tests by Feature
```
tests/
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   └── register.ts
├── shopping/
│   ├── browse.ts
│   ├── cart.ts
│   └── checkout.ts
└── smoke/
    └── health-check.ts
```

### Use Consistent Naming
- Test IDs: `AUTH-001`, `CART-002`, `CHECKOUT-003`
- Files: `login-test.ts`, `cart-test.ts`
- Tags: `['auth', 'critical']`, `['shopping', 'smoke']`

### Environment Variables
Keep sensitive data in `.env`:
```bash
OPENAI_API_KEY=sk-proj-xxx
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPass123!
```

Use in tests:
```typescript
testData: {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD
}
```

## 🚨 Troubleshooting

### "No tests found"
- Check tests are in `tests/` folder
- Verify files export test objects
- Ensure `export const` is used

### "API key not found"
- Check `.env` file exists
- Verify key starts with `sk-`
- No spaces around `=` in `.env`

### "Browser fails to launch"
```bash
# Install browsers
npx playwright install chromium
```

### Package.json Setup
Ensure ES modules are enabled:
```json
{
  "type": "module"
}
```

## 🎉 You're Ready!

Start writing tests:
- [Test Structure Guide](Test-Structure-Guide.md)
- [Test Writing Tips](Test-Writing-Tips.md)
- [Quick Start Examples](Quick-Start.md)

---

Need help? The basics are simple: install, configure, write tests, run!