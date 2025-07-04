<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN AI
  
  ## E2E Testing Reinvented with AI
</div>

Write tests in plain English. Let AI handle the automation.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="40" />
  <span style="margin: 10px 15px; font-size: 24px; display: inline-block; vertical-align: middle;">+</span>
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="40" />
</div>

A powerful TypeScript browser automation framework using AI-powered testing with
LangChain, OpenAI GPT-4o, and Playwright. Write tests in natural language and
let AI handle the complex automation.

---

## 🚀 Quick Start

### 📦 Installation

```bash
npm install endorphin-ai
```

### 🔑 Setup

1. **Create a `.env` file** with your OpenAI API key:

```bash
OPENAI_API_KEY=your_key_here
```

2. **Initialize your project**:

```bash
npx endorphin init
```

### ✨ Your First Test

Create `tests/my-test.ts`:

```typescript
import type { TestCase } from 'endorphin-ai';

export const GOOGLE_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Google Search Test',
  description: 'Search for something on Google',
  priority: 'High',
  tags: ['demo'],
  task: 'Go to google.com and search for "Endorphin AI"',
};
```

### ▶️ Run Your Test

```bash
# Run the test
npx endorphin run test TEST-001

# Generate beautiful reports
npx endorphin generate report
npx endorphin open report
```

**🎉 That's it!** You now have AI-powered testing with interactive reports.

---

## 🎯 Key Features

### 🤖 AI-Powered Testing

- **Natural language tests** - Write tests like you're explaining to a person
- **Smart element detection** - AI finds buttons, forms, and content
  automatically
- **Self-healing tests** - Adapts to UI changes without breaking
- **Dynamic test data** - Generate data on-the-fly with async functions

### 📊 Beautiful Reports

- **Interactive HTML reports** with screenshots and step-by-step execution
- **Real-time filtering** and search to quickly find issues
- **Visual debugging** with click-to-zoom screenshots
- **Export capabilities** for sharing with your team

### 🛠️ Developer Experience

- **TypeScript-first** with full type safety
- **Zero configuration** - Works out of the box
- **Test recorder** - Create tests by demonstration
- **Global setup** - Prepare environments before tests

---

## 🔧 Smart Test Structure (New in v0.9)

Tests can now prepare data and environments automatically:

```typescript
export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Dynamic Login Test',
  description: 'Test login with generated data',
  priority: 'High',
  tags: ['auth'],

  // Setup runs before the test
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      timestamp: new Date().toISOString(),
    };
  },

  // Generate fresh data for each run
  data: async () => {
    return {
      email: `test_${Date.now()}@example.com`,
      password: 'SecurePass123!',
    };
  },

  // Use the data in your test
  task: async (data, setupData) => {
    return `
      Go to ${setupData.baseUrl}/login
      Enter email: ${data.email}
      Enter password: ${data.password}
      Click Sign In
      Verify welcome message appears
    `;
  },
};
```

---

## 🎮 Interactive Test Recorder

Create tests by showing the AI what to do:

```bash
npx endorphin run test-recorder
```

1. Browser opens
2. Type commands in plain English
3. Watch AI perform actions
4. Get ready-to-run test file

Example recording session:

```
> click the login button
✅ Clicked login button

> fill email with test@example.com
✅ Filled email field

> verify welcome message appears
✅ Verified welcome message

> done
✅ Test saved to tests/LOGIN-001.ts
```

---

## 📝 Writing Great Tests

### Simple Format

```typescript
task: 'Go to amazon.com, search for "laptop", verify results appear';
```

### Step-by-Step Format

```typescript
task: `
  1. Navigate to login page
  2. Enter email: test@example.com
  3. Enter password: mypassword
  4. Click Sign In button
  5. Verify dashboard loads
`;
```

### Natural Language Tips

- Be specific: "Click the blue Submit button" not "click button"
- Add waits: "Wait 2 seconds for page to load"
- Verify results: "Verify success message appears"
- Use real data: "Enter john@example.com" not "enter email"

---

## 📊 Interactive Reports

Generate beautiful reports with:

```bash
npx endorphin generate report
npx endorphin open report
```

### Report Features

- 🔍 **Search tests** by name or ID
- 📊 **Filter by status** (All/Passed/Failed)
- 📸 **Click screenshots** to zoom
- ⌨️ **Keyboard shortcuts** (Ctrl+F to search)
- 📄 **Export to JSON** for analysis

---

## ⚙️ Configuration

### Basic Config (`endorphin.config.ts`)

```typescript
export default {
  browser: {
    headless: false, // Show browser
    viewport: {
      // Browser size
      width: 1280,
      height: 720,
    },
  },

  // Global setup (runs before all tests)
  globalSetup: './global-setup.js',
};
```

### Environment Variables (`.env`)

```bash
OPENAI_API_KEY=your_key_here
HEADLESS=false
BASE_URL=https://myapp.com
```

---

## 📂 Project Structure

```
my-project/
├── .env                    # API keys
├── endorphin.config.ts     # Configuration
├── tests/                  # Test files
│   ├── auth/              # Login tests
│   ├── shopping/          # E-commerce tests
│   └── smoke/             # Critical tests
└── test-results/          # Generated reports
    └── reports/           # HTML reports
```

---

## 🏃 Common Commands

```bash
# Test execution
npx endorphin run test TEST-001     # Run specific test
npx endorphin run test all          # Run all tests
npx endorphin run test --tag smoke  # Run by tag

# Test creation
npx endorphin run test-recorder     # Interactive recorder
npx endorphin init                  # Initialize project

# Reports
npx endorphin generate report       # Generate HTML report
npx endorphin open report          # Open in browser
npx endorphin list                  # List all tests

# Cleanup
npx endorphin cleanup results       # Clean old results
npx endorphin cleanup reports       # Clean old reports
```

---

## 🆕 What's New in v0.9

- **🔧 Smart Test Structure**: Async `setup` and `data` functions
- **📝 Better Documentation**: User-friendly guides
- **🎯 Test Writing Tips**: Natural language best practices
- **🖼️ Enhanced Reports**: Interactive screenshots and filtering
- **⚡ Simplified Setup**: Easier project initialization

---

## 📚 Documentation

### For Users

- **[Quick Start Guide](./doc/user-guide/Quick-Start.md)** - Get started fast
- **[Project Setup Guide](./doc/user-guide/Project-Setup-Guide.md)** - Complete
  setup
- **[Test Structure Guide](./doc/user-guide/Test-Structure-Guide.md)** - Learn
  the new features
- **[Test Writing Tips](./doc/user-guide/Test-Writing-Tips.md)** - Write better
  tests
- **[HTML Reporter Guide](./doc/user-guide/HTML-Reporter-Guide.md)** - Beautiful
  reports
- **[Test Recorder Guide](./doc/user-guide/Test-Recorder.md)** - Interactive
  testing

### For Developers

- **[Framework Architecture](./doc/framework-development/Framework-Architecture.md)** -
  Technical details
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant development

---

## 🏆 Why Choose Endorphin AI?

| Traditional Testing    | Endorphin AI           |
| ---------------------- | ---------------------- |
| ❌ Brittle selectors   | ✅ AI finds elements   |
| ❌ Breaks with changes | ✅ Self-healing tests  |
| ❌ Complex setup       | ✅ Zero configuration  |
| ❌ Hard to maintain    | ✅ Plain English       |
| ❌ Basic reports       | ✅ Interactive reports |

---

## 🤝 Support

### 📚 Get Help

- Check the **[documentation](./doc/)**
- Search
  **[existing issues](https://github.com/andrewnovykov/endorphin-ai/issues)**
- Create a
  **[new issue](https://github.com/andrewnovykov/endorphin-ai/issues/new)**

### 📄 License

**GNU Affero General Public License v3.0**

- **Open Source**: Free under AGPLv3
- **Commercial**: Licenses available

📧 Contact: [iam@andrewnovykov.com](mailto:iam@andrewnovykov.com)

---

<div align="center">
  <p><strong>⚡ Happy Vibetesting!</strong></p>
  <p>
    <a href="#-quick-start">Get Started</a> • 
    <a href="./doc/user-guide/Quick-Start.md">Documentation</a> • 
    <a href="https://github.com/andrewnovykov/endorphin-ai/issues">Support</a>
  </p>
</div>
