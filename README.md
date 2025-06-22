<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E Testing Reinvented with AI
</div>

Write tests in plain English. Let AI generate, validate, and fix them automatically.

A powerful, modular browser automation framework using AI-powered testing with LangChain, OpenAI GPT-4o, and Playwright. Provides intelligent browser automation with automatic element detection, visual validation, and comprehensive test management.

## 🚀 Quick Start

### Installation
```bash
# Local installation (recommended)
npm install endorphin-ai

# Global installation (optional)
npm install -g endorphin-ai
```

### Setup
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

### Usage Commands

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

## License

Endorphin is licensed under the GNU Affero General Public License, Version 3 (AGPLv3). The full license text is available in the `LICENSE` file.

For organizations that cannot use AGPLv3-licensed software, commercial licenses are available. Please contact us at [iam@andrewnovykov.com] for more information.