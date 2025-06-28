<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E Testing Reinvented with AI
</div>

Write tests in plain English. Let AI generate, validate, and fix them
automatically.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="40" />
  <span style="margin: 10px 15px; font-size: 24px; display: inline-block; vertical-align: middle;">+</span>
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="40" />
</div>

A powerful, modular browser automation framework using AI-powered testing with
LangChain, OpenAI GPT-4o, and Playwright. Provides intelligent browser
automation with automatic element detection, visual validation, and
comprehensive test management.

## 🎬 Watch Demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_WATCH_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Watch Demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 See Endorphin AI in Action - Complete Walkthrough</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Watch how AI writes and executes your tests<br />
    🔍 See intelligent element detection in real-time<br />
    📊 Explore beautiful HTML reports with screenshots<br />
    ⚡ From setup to test execution in 10 minutes
  </p>
</div>

---

## 🚀 Quick Start

### 📦 Installation & Setup

Get started in under 2 minutes:

```bash
# 1. Create your project
mkdir my-ai-tests && cd my-ai-tests

# 2. Install Endorphin AI
npm install endorphin-ai

# 3. Initialize with everything you need
npx endorphin init
```

**What you get:**
- ✅ Sample test ready to run
- ✅ Configuration files
- ✅ Project structure
- ✅ Environment setup

### 🔑 Add Your OpenAI API Key

```bash
# Edit the .env file that was created
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

*Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)*

### ▶️ Run Your First Test

```bash
# Run the sample health check test
npx endorphin run test HEALTH-001

# Generate a beautiful HTML report
npx endorphin generate report && npx endorphin open report
```

**🎉 That's it!** You now have:
- A working AI-powered test
- Interactive HTML reports with screenshots
- Complete project structure for scaling

### Manual Setup (Alternative)

If you prefer manual setup:

1. Create your project directory:

   ```bash
   mkdir my-test-project && cd my-test-project
   ```

2. Initialize with ES modules:

   ```bash
   npm init -y
   npm pkg set type="module"
   ```

3. Install Endorphin AI:

   ```bash
   npm install endorphin-ai
   ```

4. Set up your `.env` file with your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

5. Create tests directory:

   ```bash
   mkdir tests
   ```

6. Create your first test file `tests/login-test.ts`:

   ```typescript
   import type { TestCase } from 'endorphin-ai';

   export const QE001: TestCase = {
     id: 'QE-001',
     name: 'Basic Login Test',
     description: 'Test the login functionality with valid credentials',
     priority: 'High',
     tags: ['authentication', 'login', 'smoke'],
     site: 'https://qafromla.herokuapp.com/',
     testData: {
       originalEmail: 'papapin888@gmail.com',
       originalPassword: 'lalalend',
     },
     task: `Navigate to https://qafromla.herokuapp.com/. 
     Click on "Log In" button. Wait 2 seconds for page load. 
     Fill email field with "papapin888@gmail.com". 
     Fill password field with "lalalend". 
     Click "Sign In" button. Wait 3 seconds for page load. 
     Verify login was successful by checking page content.`,
   };
   ```

7. Add scripts to your `package.json`:
   ```json
   {
     "scripts": {
       "test": "endorphin run test all",
       "test:smoke": "endorphin run test --tag smoke",
       "test:auth": "endorphin run test --tag authentication",
       "test:single": "endorphin run test",
       "test:record": "endorphin run test-recorder"
     }
   }
   ```

## 🎯 Core Features

### 🤖 AI-Powered Testing
- **Write tests in plain English** - No complex selectors needed
- **Intelligent element detection** - AI finds buttons, forms, and content automatically
- **Self-healing tests** - Adapts to UI changes without breaking
- **Smart error recovery** - Automatically retries failed actions with different strategies

### 📊 Beautiful Reports
- **Interactive HTML reports** with screenshots and step-by-step execution
- **Real-time filtering and search** to quickly find issues
- **Visual debugging** with click-to-zoom screenshots
- **Export capabilities** for sharing with your team

### 🛠️ Developer Experience
- **Zero configuration** - Works out of the box
- **TypeScript support** with full type definitions
- **Multiple browsers** - Chrome, Firefox, Safari support
- **Parallel execution** for faster test runs
- **Hot reload** for rapid test development

### 🎮 Interactive Tools
- **Test Recorder** - Create tests by clicking through your app
- **Live debugging** - See exactly what the AI is doing
- **Custom test creation** with guided prompts
- **Session replay** to understand test failures

---

## 🔄 Staying Updated

### Current Version: v0.6.0

```bash
# Check your current version
npx endorphin --version

# Update to the latest version
npm update endorphin-ai

# Get help and see new features
npx endorphin --help
```

### What's New in v0.6.0
- ✅ **Enhanced CLI** with dual command names (`endorphin` and `endorphin-ai`)
- ✅ **Improved HTML Reports** with better filtering and search
- ✅ **Security-First** with automated vulnerability scanning
- ✅ **Cross-Platform CI/CD** support for Windows, Linux, and macOS
- ✅ **Production-Ready** compiled JavaScript without tsx dependency

## 🚀 Project Initialization

### New Projects (Recommended)

```bash
# Quick setup for new projects
mkdir my-test-project && cd my-test-project
npx endorphin init
```

The `init` command creates:

- ✅ `tests/` directory with sample TypeScript test
- ✅ `test-results/` for test outputs
- ✅ `test-recorder/` for recorded tests
- ✅ `.env` file with API key placeholder
- ✅ `endorphin.config.ts` with optimized TypeScript settings
- ✅ `tsconfig.json` for TypeScript compilation
- ✅ `.gitignore` with Endorphin-specific patterns
- ✅ `README-ENDORPHIN.md` quick start guide

### Existing Projects

For existing Endorphin projects, the `init` command is optional and safe:

- ✅ Never overwrites existing configuration files
- ✅ Only creates missing directories
- ✅ Adds helpful template files if needed

```bash
# Safe to run in existing projects
npx endorphin init
```

### Usage Commands

#### ℹ️ Version & Help

```bash
# Check current version
npx endorphin --version

# Get help and see all commands
npx endorphin --help

# Update to latest version
npm update endorphin-ai
```

#### 🎯 Initialize New Project

```bash
# Create a new Endorphin AI project with all necessary files
npx endorphin init

# What gets created:
# ├── tests/sample-test.ts     # Ready-to-run TypeScript test
# ├── .env                     # API key configuration
# ├── endorphin.config.ts      # Framework settings (TypeScript)
# ├── tsconfig.json            # TypeScript configuration
# ├── .gitignore              # Endorphin-specific ignores
# └── README-ENDORPHIN.md     # Quick start guide
```

#### 🧪 Run Specific Test

```bash
# Using npm scripts (recommended)
npm run test:single QE-001

# Using npx
npx endorphin run test QE-001

# Global installation
endorphin run test QE-001
```

#### 🏷️ Run Tests by Category

```bash
# Using npm scripts
npm run test:smoke
npm run test:auth

# Using npx/global
npx endorphin run test --tag authentication
npx endorphin run test --priority High
```

#### 🎯 Run All Tests

```bash
# Using npm scripts
npm test

# Using npx/global
npx endorphin run test all
```

#### 🎬 Test Recorder Mode

```bash
# Using npm scripts
npm run test:record

# Using npx/global
npx endorphin run test-recorder
```

## 📊 HTML Reports & Analytics

Endorphin AI generates beautiful, interactive HTML reports that provide
comprehensive insights into your test execution results.

### 🚀 Quick Report Generation

```bash
# Generate a full interactive HTML report
npx endorphin generate report

# Generate a lightweight summary report
npx endorphin generate report --summary

# Open the latest report in your browser
npx endorphin open report

# Open a specific report file
npx endorphin open report report-2025-06-22.html
```

### ✨ Report Features

#### 📈 **Interactive Dashboard**

- **Real-time Statistics**: Success rates, test counts, execution trends
- **Visual Progress Bars**: Easy-to-understand success rate indicators
- **Summary Cards**: Quick overview of test health

#### 🔍 **Advanced Search & Filtering**

- **Real-time Search**: Find tests by name or ID instantly
- **Status Filtering**: Filter by passed/failed tests with one click
- **Smart Results**: Shows "5 of 25 tests matching 'login' with status 'failed'"
- **Keyboard Shortcuts**: `Ctrl+F` to search, `Ctrl+3` for failed tests only

#### 🎯 **Detailed Test Analysis**

- **Step-by-Step Timeline**: See exactly what happened during test execution
- **Screenshot Galleries**: Visual debugging with click-to-zoom screenshots
- **Interactive Modals**: Deep dive into test execution details
- **Tool Call Tracking**: See which browser actions were performed

#### ⌨️ **Productivity Features**

- **Export to JSON**: Data-driven analysis and custom reporting
- **Print Support**: Documentation-ready printed reports
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Performance Optimized**: Fast loading even with large test suites

### 🛠️ Report Management

```bash
# Clean up old test results (keep 10 most recent per test)
npx endorphin cleanup results

# Keep only 5 most recent results per test
npx endorphin cleanup results 5

# Clean up old report files (older than 30 days)
npx endorphin cleanup reports

# Clean up report files older than 7 days
npx endorphin cleanup reports 7
```

### 📖 Complete Guide

For detailed usage instructions, advanced features, and best practices, see the
**[HTML Reporter User Guide](./doc/user-guide/HTML-Reporter-Guide.md)**.

## 🏗️ Framework Architecture

Endorphin AI is built with a modular, extensible architecture designed for
reliability and maintainability.

📖
**[View detailed Framework Architecture documentation](./doc/Framework-Architecture.md)**

### Key Components

- **Core Framework**: Main test execution engine and session management
- **Browser Tools**: Intelligent automation tools powered by AI
- **Configuration System**: Flexible, hierarchical configuration management
- **Test Discovery**: Automatic test file detection and loading
- **Interactive Tools**: Real-time test creation and debugging

## ⚙️ Configuration

### Default Configuration

Endorphin AI works out of the box with sensible defaults, but you can customize
it by creating an `endorphin.config.ts` file in your project root:

```typescript
// endorphin.config.ts
import type { FrameworkConfig } from 'endorphin-ai';

const config: FrameworkConfig = {
  // Global test settings
  defaultTimeout: 30000,
  headless: false,
  viewport: { width: 1280, height: 720 },

  // Default test data
  testData: {
    baseUrl: 'https://staging.example.com',
    adminEmail: 'admin@example.com',
  },

  // Result settings
  screenshots: true,
  recordVideo: false,
};

export default config;
```

### CLI Options

You can override configuration with CLI flags:

```bash
# Using npm scripts with -- to pass flags
npm test -- --browser firefox
npm run test:single QE-001 -- --no-headless

# Using npx/global
npx endorphin run test all --browser firefox
npx endorphin run test QE-001 --no-headless
npx endorphin run test all --viewport 1920x1080
npx endorphin run test all --parallel 3
npx endorphin run test all --model gpt-4
npx endorphin run test all --env staging
```

## 📝 Test Categories

You can organize your tests using tags and priorities:

### Common Tags

- `authentication` - Login, logout, registration tests
- `smoke` - Critical path tests that must pass
- `navigation` - Menu, links, page routing tests
- `forms` - Form filling and validation tests
- `checkout` - E-commerce purchase flow tests
- `search` - Search functionality tests
- `responsive` - Mobile/tablet/desktop tests

### Priority Levels

- `High` - Critical functionality, run on every build
- `Medium` - Important features, run daily
- `Low` - Nice-to-have features, run weekly

### Example Test Organization

```typescript
// tests/auth-tests.ts
import type { TestCase } from 'endorphin-ai';

export const LOGIN_TEST: TestCase = {
  id: 'AUTH-001',
  name: 'User Login Test',
  description: 'Test user authentication flow',
  tags: ['authentication', 'smoke'],
  priority: 'High',
  site: 'https://example.com',
  task: 'Navigate to login page and authenticate user...',
};

export const LOGOUT_TEST: TestCase = {
  id: 'AUTH-002',
  name: 'User Logout Test', 
  description: 'Test user logout functionality',
  tags: ['authentication'],
  priority: 'Medium',
  site: 'https://example.com',
  task: 'Log out the authenticated user...',
};
```

## 📁 Project Structure

Your project should look like this:

```
my-test-project/
├── .env                    # OpenAI API key
├── tests/                  # Your test files (TypeScript)
│   ├── login-test.ts      # Authentication tests
│   ├── checkout-test.ts   # E-commerce tests
│   └── navigation-test.ts # UI/Navigation tests
├── endorphin.config.ts    # Optional configuration (TypeScript)
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project config
```

## 📝 Test File Format

Each test file should export test objects with TypeScript types:

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001', // Unique test identifier
  name: 'Basic Login Test', // Human readable name
  description: 'Test login functionality with valid credentials',
  priority: 'High', // High, Medium, Low
  tags: ['authentication', 'login', 'smoke'], // Categories
  site: 'https://example.com/', // Target website
  testData: {
    // Test data (optional, fully typed)
    email: 'test@example.com',
    password: 'password123',
  },
  task: `Your test instructions in plain English...`,
};

// Multiple tests per file with full type safety
export const QE002: TestCase = {
  id: 'QE-002',
  name: 'Registration Test',
  description: 'Test user registration flow',
  priority: 'Medium',
  tags: ['authentication', 'registration'],
  site: 'https://example.com/',
  task: 'Test new user registration process...',
};
```

### 🎯 TypeScript Benefits

- ✅ **Full type safety** for test configuration
- ✅ **IntelliSense support** in your IDE  
- ✅ **Compile-time error checking**
- ✅ **Auto-completion** for test properties
- ✅ **Refactoring support** across your test suite

## 📊 Test Results

Each test execution creates:

- **📁 Session Directory**: `test-result/[test-id]_[timestamp]/`
- **📝 Session Data**: `test-session.json` with complete execution details
- **📊 Summary**: `summary.json` with test outcomes
- **📸 Screenshots**: Automatic visual documentation
- **🔄 Step Logs**: Detailed execution tracking

### Example Test Output

```
🎯 Running: QE-001 - Basic Login Test
📸 Screenshot taken: step-1-navigation.png
✅ Login successful - test completed!
📊 Result: PASSED
```

## 🎮 Interactive Features

### Custom Test Creation

```bash
# Using npm scripts
npm run test:record

# Using npx/global
npx endorphin run test-recorder
```

Create tests on-the-fly with guided prompts:

- Custom navigation tasks
- Form filling scenarios
- Login test automation
- Content verification

## 🔍 Browser Automation Tools

Intelligent AI-powered tools for navigation, interaction, verification, and
utilities.

📖
**[View detailed tool documentation](./doc/Framework-Architecture.md#browser-automation-tools)**

---

## 💡 Common Use Cases

### 🔐 Authentication Testing
```bash
# Test login flows across different user types
npx endorphin run test --tag authentication
```

### 🛒 E-commerce Workflows  
```bash
# Test complete purchase flows
npx endorphin run test --tag checkout
```

### 📱 Responsive Testing
```bash
# Test mobile, tablet, and desktop layouts
npx endorphin run test --tag responsive
```

### 🔍 Search & Navigation
```bash
# Test site search and menu navigation
npx endorphin run test --tag navigation
```

### 📊 Form Validation
```bash
# Test form submissions and validation
npx endorphin run test --tag forms
```

---

## 🏆 Why Choose Endorphin AI?

### Traditional E2E Testing vs Endorphin AI

| Traditional Testing | Endorphin AI |
|-------------------|-------------|
| ❌ Brittle CSS selectors | ✅ AI finds elements intelligently |
| ❌ Breaks with UI changes | ✅ Self-healing tests |
| ❌ Complex setup | ✅ Zero configuration |
| ❌ Hard to maintain | ✅ Plain English test descriptions |
| ❌ Basic reporting | ✅ Interactive HTML reports |
| ❌ Manual debugging | ✅ Visual debugging with screenshots |

### 🚀 Production Ready

✅ **Enterprise Scale**: Used in production environments  
✅ **Cross-Platform**: Windows, macOS, Linux support  
✅ **CI/CD Integration**: GitHub Actions, Jenkins, CircleCI  
✅ **Security First**: Automated vulnerability scanning  
✅ **Type Safe**: Full TypeScript support  
✅ **Extensible**: Modular architecture for custom needs

## 🎮 Complete CLI Reference

### Core Commands

#### Test Execution

```bash
# Run a specific test
npx endorphin run test TEST-001

# Run all tests
npx endorphin run test all

# Run tests by tag
npx endorphin run test --tag smoke
npx endorphin run test --tag authentication

# Run tests by priority
npx endorphin run test --priority High
npx endorphin run test --priority Medium
```

#### Test Creation & Recording

```bash
# Start interactive test recorder
npx endorphin run test-recorder

# List all available tests
npx endorphin list
```

#### Project Setup

```bash
# Initialize new project (recommended for new projects)
npx endorphin init

# Show help and available commands
npx endorphin --help
npx endorphin help

# Check current version
npx endorphin --version
```

### HTML Reports & Analytics

#### Report Generation

```bash
# Generate full interactive HTML report
npx endorphin generate report

# Generate lightweight summary report
npx endorphin generate report --summary
```

#### Report Management

```bash
# Open latest report in browser
npx endorphin open report

# Open specific report file
npx endorphin open report report-2025-06-22.html
npx endorphin open report summary-report.html
```

#### Cleanup Commands

```bash
# Clean old test results (keep 10 most recent per test)
npx endorphin cleanup results

# Keep only 5 most recent results per test
npx endorphin cleanup results 5

# Clean old report files (older than 30 days)
npx endorphin cleanup reports

# Clean report files older than 7 days
npx endorphin cleanup reports 7
```

### Advanced Options

#### Browser Configuration

```bash
# Use different browsers
npx endorphin run test all --browser firefox
npx endorphin run test all --browser webkit

# Headless/headed mode
npx endorphin run test all --no-headless
npx endorphin run test all --headless

# Custom viewport
npx endorphin run test all --viewport 1920x1080
npx endorphin run test all --viewport 1366x768
```

#### AI & Performance

```bash
# Use different AI models
npx endorphin run test all --model gpt-4
npx endorphin run test all --model gpt-4o-mini

# Parallel execution
npx endorphin run test all --parallel 3
npx endorphin run test all --parallel 5

# Environment selection
npx endorphin run test all --env staging
npx endorphin run test all --env production
```

### npm Scripts Integration

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "endorphin run test all",
    "test:smoke": "endorphin run test --tag smoke",
    "test:auth": "endorphin run test --tag authentication",
    "test:single": "endorphin run test",
    "test:record": "endorphin run test-recorder",
    "test:report": "endorphin generate report",
    "test:summary": "endorphin generate report --summary",
    "test:open": "endorphin open report",
    "test:cleanup": "endorphin cleanup results"
  }
}
```

Then use npm scripts:

```bash
npm test                # Run all tests
npm run test:smoke      # Run smoke tests
npm run test:report     # Generate HTML report
npm run test:open       # Open latest report
```

## 🔄 Staying Updated

### Check Your Version

```bash
# Check current installed version
npx endorphin --version

# Check latest available version on npm
npm view endorphin-ai version

# Check for outdated packages
npm outdated endorphin-ai
```

### Update to Latest

```bash
# Update to the latest version
npm update endorphin-ai

# Or force install latest
npm install endorphin-ai@latest

# Verify the update
npx endorphin --version
```

### Version History & Features

- **v0.6.0** *(Latest)*: Enhanced CLI, security-first publishing, cross-platform CI/CD
- **v0.5.0**: Advanced HTML reporting with interactive features
- **v0.4.0**: TypeScript-first experience with full type definitions
- **v0.3.0**: Added `endorphin init` command for instant project setup
- **v0.2.x**: Core framework with AI-powered testing
- **v0.1.x**: Initial release with basic functionality

### Compatibility & Migration

Endorphin AI maintains **backward compatibility** across versions:

- ✅ **All existing tests work** without modification
- ✅ **Configuration files** are automatically migrated
- ✅ **npm scripts** continue to function normally
- ✅ **Semantic versioning** ensures predictable updates

Update with confidence - your existing tests won't break!

---

## 🤝 Support & Community

### 📚 Documentation
- **[Quick Start Guide](./README.md)** - Get up and running quickly
- **[HTML Reporter Guide](./doc/user-guide/HTML-Reporter-Guide.md)** - Interactive reporting
- **[Framework Architecture](./doc/Framework-Architecture.md)** - Technical deep dive

### 🐛 Issues & Feature Requests
Found a bug or have a feature idea? [Open an issue](https://github.com/andrewnovykov/endorphin-ai/issues) on GitHub.

### 💬 Getting Help
- Check the **[documentation](./doc/)** first
- Search **[existing issues](https://github.com/andrewnovykov/endorphin-ai/issues)**
- Create a **[new issue](https://github.com/andrewnovykov/endorphin-ai/issues/new)** with details

---

## 📄 License

Endorphin AI is licensed under the **GNU Affero General Public License v3.0** (AGPLv3).

**For Open Source Projects**: Free to use under AGPLv3  
**For Commercial Projects**: Commercial licenses available

📧 Contact: [iam@andrewnovykov.com](mailto:iam@andrewnovykov.com) for licensing questions

---

<div align="center">
  <p><strong>⚡ Ready to revolutionize your testing?</strong></p>
  <p>
    <a href="#-installation--setup">Get Started Now</a> • 
    <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx">Watch Demo</a> • 
    <a href="./doc/">Documentation</a>
  </p>
</div>
