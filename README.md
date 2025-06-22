<div align="center">
  <img src="./doc/images/endorphin.jpg" alt="Endorphin Logo" width="200" />
  
   <h1 style="font-size: 4rem; font-weight: bold; margin: 30px 0 10px 0; color: #8A2BE2;">ENDORPHIN</h1>
  
  <h2 style="font-size: 1.5rem; margin: 10px 0 30px 0;">E2E Testing Reinvented with AI</h2>
</div>

Write tests in plain English. Let AI generate, validate, and fix them automatically.

A powerful, modular browser automation framework using AI-powered testing with LangChain, OpenAI GPT-4o, and Playwright. Provides intelligent browser automation with automatic element detection, visual validation, and comprehensive test management.

## 🚀 Quick Start

### Installation
```bash
npm install -g endorphin-ai
```

### Setup
1. Create your project directory:
   ```bash
   mkdir my-test-project && cd my-test-project
   ```

2. Set up your `.env` file with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

3. Create tests directory:
   ```bash
   mkdir tests
   ```

4. Create your first test file `tests/login-test.js`:
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

### Usage Commands

#### 🧪 Run Specific Test
```bash
endorphin run test QE-001
```

#### 🏷️ Run Tests by Category
```bash
# Authentication tests
endorphin run test --tag authentication

# High priority tests  
endorphin run test --priority High

# Smoke tests
endorphin run test --tag smoke
```

#### 🎯 Run All Tests
```bash
endorphin run test all
```

#### 🎬 Test Recorder Mode
```bash
# Interactive test creation
endorphin run test-recorder
```

## 🏗️ Framework Architecture

### Modular Structure
```
framework/
├── test-framework.js            # Main entry point
├── index.js                     # Modular exports
├── config/                      # Configuration files
│   ├── agent-config.js          # AI agent settings
│   ├── browser-config.js        # Browser configuration
│   └── paths.js                 # Directory paths
├── core/                        # Core components
│   ├── browser-framework.js     # Main framework class
│   ├── config-loader.js         # Configuration management
│   ├── test-discovery.js        # Test discovery & execution
│   ├── test-manager.js          # Test management
│   ├── test-runner.js           # Test execution
│   └── test-session.js          # Session tracking
├── tools/                       # Browser automation tools
│   ├── navigation.js            # Page navigation
│   ├── interaction.js           # Clicks, form filling
│   ├── verification.js          # Element verification
│   ├── content.js               # Page content analysis
│   └── utilities.js             # Screenshots, waits
├── demos/                       # Framework demonstrations
├── interactive/                 # Interactive testing tools
└── testing/                     # Testing utilities
```

## ⚙️ Configuration

### Default Configuration
Endorphin AI works out of the box with sensible defaults, but you can customize it by creating an `endorphin.config.js` file in your project root:

```javascript
// endorphin.config.js
export default {
  // Browser configuration
  browser: {
    type: 'chromium',           // chromium, firefox, webkit
    headless: true,             // Run browser in headless mode
    viewport: {                 // Browser viewport size
      width: 1280,
      height: 720
    },
    timeout: 30000             // Default timeout in milliseconds
  },

  // AI configuration
  ai: {
    model: 'gpt-4o-mini',      // OpenAI model to use
    temperature: 0.1,          // AI creativity (0-1)
    maxRetries: 3              // Max retries for AI calls
  },

  // Test execution configuration
  execution: {
    timeout: 60000,            // Test timeout in milliseconds
    parallel: 1,               // Number of parallel tests
    screenshots: true,         // Take screenshots on failure
    testsDirectory: './tests', // Directory containing test files
    dataDirectory: './data'    // Directory containing test data
  },

  // Environment-specific settings
  environments: {
    development: {
      baseUrl: 'http://localhost:3000'
    },
    staging: {
      baseUrl: 'https://staging.example.com'
    },
    production: {
      baseUrl: 'https://example.com'
    }
  }
};
```

### CLI Options
You can override configuration with CLI flags:

```bash
# Run with different browser
endorphin run test all --browser firefox

# Run in non-headless mode
endorphin run test QE-001 --no-headless

# Set custom viewport
endorphin run test all --viewport 1920x1080

# Run tests in parallel
endorphin run test all --parallel 3

# Use different AI model
endorphin run test all --model gpt-4

# Set environment
endorphin run test all --env staging
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

## ⚙️ Configuration

### Optional: endorphin.config.js
```javascript
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

## 🔧 Configuration

### Browser Configuration (`framework/config/browser-config.js`)
- Browser launch options (headless mode, viewport size)
- Timeouts and delays
- Screenshot settings
- Page loading options

### AI Agent Configuration (`framework/config/agent-config.js`)
- OpenAI API settings
- Model selection (GPT-4o)
- Recursion limits and timeouts
- Stop phrases for test completion
- Execution timing settings

### Path Configuration (`framework/config/paths.js`)
- Test result directories
- Recording locations
- Screenshot storage

## 📊 Test Results

Each test execution creates:
- **📁 Session Directory**: `test-result/[test-id]_[timestamp]/`
- **📝 Session Data**: `test-session.json` with complete execution details
- **📊 Summary**: `summary.json` with test outcomes
- **📸 Screenshots**: Automatic visual documentation
- **🔄 Step Logs**: Detailed execution tracking

### Example Test Output
```
🎯 Running Task: QE-001 - Basic Login Test
📝 Task: Test the login functionality with valid credentials
⏰ Started at: 2025-06-19T05:36:37.705Z

📁 Created test session: qe-001_2025-06-19T05-36-37-706Z
🌍 Navigate to: https://qafromla.herokuapp.com
📸 Screenshot taken: step-1-navigation.png
🔍 Found login elements
📝 Filling login form...
✅ Login successful - test completed!

📊 Result: PASSED
📁 Results: test-result/qe-001_2025-06-19T05-36-37-706Z
```

## 🎮 Interactive Features

### Custom Test Creation
```bash
npm run interactive
```
Create tests on-the-fly with guided prompts:
- Custom navigation tasks
- Form filling scenarios  
- Login test automation
- Content verification

### Framework Demonstration
```bash
npm run interactive-demo
```
Runs pre-built demonstration tests showcasing:
- Navigation capabilities
- Form interaction
- Content analysis
- Result tracking

## 🔍 Browser Automation Tools

The framework includes intelligent tools powered by AI:

### Navigation Tools
- **navigate**: Smart URL navigation with wait conditions
- **getPageContent**: Intelligent HTML analysis for element detection

### Interaction Tools  
- **click**: AI-powered element clicking with automatic waiting
- **fill**: Smart form filling with focus management
- **clearField**: Intelligent field clearing before input

### Verification Tools
- **verifyElement**: Element visibility and interaction verification
- **getElementInfo**: Detailed element analysis and properties

### Utility Tools
- **wait**: Configurable delays and timing control
- **screenshot**: High-quality visual documentation

## 🎮 Command Examples

### Basic Commands
```bash
# Run specific test
endorphin run test QE-001

# Run all tests
endorphin run test all

# Run by priority
endorphin run test --priority High
endorphin run test --priority Medium

# Run by tags
endorphin run test --tag authentication
endorphin run test --tag smoke
endorphin run test --tag checkout

# Interactive test creation
endorphin run test-recorder
```

### Multiple Tag Support
```bash
# Run tests matching any of these tags
endorphin run test --tag "authentication,smoke"

# Run high priority authentication tests
endorphin run test --priority High --tag authentication
```

## 🚀 Getting Started Examples

### Quick Smoke Test
```bash
endorphin run test --tag smoke
```

### Authentication Testing
```bash
endorphin run test --tag authentication
```

### Complete Test Suite
```bash
endorphin run test all
```

### Create Custom Test
```bash
endorphin run test-recorder
# Follow prompts to create your own test
```

### Example Test File
Create `tests/my-first-test.js`:
```javascript
export const QE001 = {
  id: "QE-001",
  name: "Homepage Navigation Test", 
  description: "Verify main navigation works correctly",
  priority: "High",
  tags: ["navigation", "smoke"],
  site: "https://example.com/",
  task: `Navigate to https://example.com/. 
  Click on "About" link in navigation. 
  Wait 2 seconds for page load. 
  Verify page title contains "About".
  Take a screenshot.`
};
```

Then run it:
```bash
endorphin run test QE-001
```

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

## License

Endorphin is licensed under the GNU Affero General Public License, Version 3 (AGPLv3). The full license text is available in the `LICENSE` file.

For organizations that cannot use AGPLv3-licensed software, commercial licenses are available. Please contact us at [iam@andrewnovykov.com] for more information.