<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E Testing Reinvented with AI
</div>

Write tests in plain English. Let AI generate, validate, and fix them automatically.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="40" />
  <span style="margin: 10px 15px; font-size: 24px; display: inline-block; vertical-align: middle;">+</span>
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="40" />
</div>

A powerful, modular browser automation framework using AI-powered testing with LangChain, OpenAI GPT-4o, and Playwright. Provides intelligent browser automation with automatic element detection, visual validation, and comprehensive test management.

## 🚀 Quick Start

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_WATCH_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000" alt="Watch Demo" />
  </a>
  <br />
  <sub><i>See Endorphin AI in action - 10 minute demo</i></sub>
</div>

### Installation
```bash
# Install Endorphin AI
npm install endorphin-ai
```

### Setup (New - Automated!)
1. Create and initialize your project:
   ```bash
   mkdir my-test-project && cd my-test-project
   npx endorphin init
   ```

2. Set up your OpenAI API key:
   ```bash
   # Edit the .env file and add your API key
   # OPENAI_API_KEY=your_api_key_here
   ```

3. Run your first test:
   ```bash
   npx endorphin run test HEALTH-001
   ```

4. Generate an interactive HTML report:
   ```bash
   npx endorphin generate report
   npx endorphin open report
   ```

That's it! Your project is ready with a sample test, configuration, all necessary directories, and beautiful HTML reporting.

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

6. Create your first test file `tests/login-test.js`:
   ```javascript
   export const QE001 = {
     id: "QE-001",
     name: "Basic Login Test", 
     description: "Test the login functionality with valid credentials",
     priority: "High",
     tags: ["authentication", "login", "smoke"],
     site: "https://qafromla.herokuapp.com/",
     testData: {
       originalEmail: "papapin888@gmail.com",
       originalPassword: "lalalend"
     },
     task: `Navigate to https://qafromla.herokuapp.com/. 
     Click on "Log In" button. Wait 2 seconds for page load. 
     Fill email field with "papapin888@gmail.com". 
     Fill password field with "lalalend". 
     Click "Sign In" button. Wait 3 seconds for page load. 
     Verify login was successful by checking page content.`
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

## 🔄 Updating Endorphin AI

### For Existing Projects
```bash
# Update to the latest version
npm update endorphin-ai

# Or install a specific version
npm install endorphin-ai@latest

# Check your current version
npx endorphin --version

# Get help and see new features
npx endorphin --help
```

### Migration Notes
- **v0.3.0+**: Introduces `endorphin init` command for new projects
- **v0.2.x**: Existing projects continue to work without changes
- **Backward Compatibility**: All existing tests and configurations remain compatible

## 🚀 Project Initialization

### New Projects (Recommended)
```bash
# Quick setup for new projects
mkdir my-test-project && cd my-test-project
npx endorphin init
```

The `init` command creates:
- ✅ `tests/` directory with sample test  
- ✅ `test-results/` for test outputs
- ✅ `test-recorder/` for recorded tests
- ✅ `.env` file with API key placeholder
- ✅ `endorphin.config.js` with optimized settings
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
# ├── tests/sample-test.js     # Ready-to-run example test
# ├── .env                     # API key configuration
# ├── endorphin.config.js      # Framework settings
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

Endorphin AI generates beautiful, interactive HTML reports that provide comprehensive insights into your test execution results.

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
For detailed usage instructions, advanced features, and best practices, see the **[HTML Reporter User Guide](./doc/user-guide/HTML-Reporter-Guide.md)**.

## 🏗️ Framework Architecture

Endorphin AI is built with a modular, extensible architecture designed for reliability and maintainability. 

📖 **[View detailed Framework Architecture documentation](./doc/Framework-Architecture.md)**

### Key Components
- **Core Framework**: Main test execution engine and session management
- **Browser Tools**: Intelligent automation tools powered by AI
- **Configuration System**: Flexible, hierarchical configuration management
- **Test Discovery**: Automatic test file detection and loading
- **Interactive Tools**: Real-time test creation and debugging

## ⚙️ Configuration

### Default Configuration
Endorphin AI works out of the box with sensible defaults, but you can customize it by creating an `endorphin.config.js` file in your project root:

```javascript
// endorphin.config.js
export default {
  // Global test settings
  defaultTimeout: 30000,
  headless: false,
  viewport: { width: 1280, height: 720 },
  
  // Default test data
  testData: {
    baseUrl: "https://staging.example.com",
    adminEmail: "admin@example.com"
  },
  
  // Result settings
  screenshots: true,
  recordVideo: false
};
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
```javascript
// tests/auth-tests.js
export const LOGIN_TEST = {
  id: "AUTH-001",
  tags: ["authentication", "smoke"],
  priority: "High",
  // ...
};

export const LOGOUT_TEST = {
  id: "AUTH-002", 
  tags: ["authentication"],
  priority: "Medium",
  // ...
};
```

## 📁 Project Structure

Your project should look like this:

```
my-test-project/
├── .env                    # OpenAI API key
├── tests/                  # Your test files
│   ├── login-test.js      # Authentication tests
│   ├── checkout-test.js   # E-commerce tests
│   └── navigation-test.js # UI/Navigation tests
├── endorphin.config.js    # Optional configuration
└── package.json           # Project config
```

## 📝 Test File Format

Each test file should export test objects with this structure:

```javascript
export const QE001 = {
  id: "QE-001",                    // Unique test identifier
  name: "Basic Login Test",        // Human readable name
  description: "Test login functionality with valid credentials",
  priority: "High",               // High, Medium, Low
  tags: ["authentication", "login", "smoke"],  // Categories
  site: "https://example.com/",   // Target website
  testData: {                     // Test data (optional)
    email: "test@example.com",
    password: "password123"
  },
  task: `Your test instructions in plain English...`
};

// Multiple tests per file
export const QE002 = {
  id: "QE-002",
  name: "Registration Test",
  // ... more test config
};
```

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

Intelligent AI-powered tools for navigation, interaction, verification, and utilities.

📖 **[View detailed tool documentation](./doc/Framework-Architecture.md#browser-automation-tools)**

## 🎉 Features

✅ **AI-Powered**: GPT-4o analyzes page structure for intelligent automation  
✅ **Visual Testing**: Automatic screenshot capture and visual validation  
✅ **Modular Design**: Clean, maintainable, extensible architecture  
✅ **Session Tracking**: Comprehensive test execution logging  
✅ **Interactive Mode**: Real-time test creation and execution  
✅ **Flexible Configuration**: Easily customizable browser and AI settings  
✅ **Comprehensive Reporting**: Detailed results with visual documentation  
✅ **Error Handling**: Robust retry mechanisms and failure recovery  

The framework is production-ready and provides a solid foundation for scalable browser automation testing!

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

## 🧪 Testing & Development

Endorphin AI has comprehensive testing coverage to ensure reliability and quality.

### Framework Testing (90% Coverage Goal)
```bash
# Run all framework tests with coverage
npm run test:coverage

# Run specific test categories
npm test -- --grep "CLI"
npm test -- --grep "Browser Framework"

# Watch mode for development
npm run test:watch

# Check coverage threshold (90% goal)
npm run test:coverage:check
```

### Package Testing (End-to-End)
```bash
# Quick package verification (5 minutes)
npm run test:package

# Complete package testing (15 minutes)  
npm run test:package:full

# Critical file isolation test
npm run test:package:isolation
```

### Complete Test Suite
```bash
# Run everything (framework + package)
npm run test:all

# For CI/CD environments
npm run test:ci
```

### Test Structure
- **`tests/framework-tests/`** - Internal framework testing (Vitest)
- **`tests/package-tests/`** - End-to-end package testing (Bash scripts)
- **Coverage Reports** - `tests/framework-tests/coverage/`

For detailed testing information, see [`tests/README.md`](tests/README.md).

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
- **v0.3.0**: Added `endorphin init` command for instant project setup
- **v0.2.x**: Core framework with AI-powered testing
- **v0.1.x**: Initial release with basic functionality

### Breaking Changes
Endorphin AI follows semantic versioning:
- **Major versions** (1.0.0): May include breaking changes
- **Minor versions** (0.3.0): New features, backward compatible  
- **Patch versions** (0.2.1): Bug fixes, backward compatible

## License

Endorphin is licensed under the GNU Affero General Public License, Version 3 (AGPLv3). The full license text is available in the `LICENSE` file.

For organizations that cannot use AGPLv3-licensed software, commercial licenses are available. Please contact us at [iam@andrewnovykov.com] for more information.