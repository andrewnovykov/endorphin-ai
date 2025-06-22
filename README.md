# Enhanced Browser Test Framework

A powerful, modular browser automation framework using AI-powered testing with LangChain, OpenAI GPT-4o, and Playwright. Provides intelligent browser automation with automatic element detection, visual validation, and comprehensive test management.

## 🚀 Quick Start

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

### Basic Usage

#### 📋 List Available Tests
```bash
npm run enhanced:list
# or
node framework/enhanced-test-framework.js --list
```

#### 🧪 Run a Specific Test
```bash
# Run by test ID
npm run enhanced:QE-001    # Basic Login Test
npm run enhanced:QE-002    # Registration Flow Test

# Or use the framework directly
node framework/enhanced-test-framework.js --test QE-001
```

#### 🏷️ Run Tests by Category
```bash
# Authentication tests
node framework/enhanced-test-framework.js --tag authentication

# High priority tests
node framework/enhanced-test-framework.js --priority High

# Smoke tests
node framework/enhanced-test-framework.js --tag smoke
```

#### 🎯 Run All Tests
```bash
npm run enhanced:all
# or
node framework/enhanced-test-framework.js --all
```

### Interactive Mode
```bash
# Interactive test creation
npm run interactive

# Pre-built interactive demo
npm run interactive-demo
```

## 🏗️ Framework Architecture

### Modular Structure
```
framework/
├── enhanced-test-framework.js   # Main entry point
├── index.js                     # Modular exports
├── config/                      # Configuration files
│   ├── agent-config.js          # AI agent settings
│   ├── browser-config.js        # Browser configuration
│   └── paths.js                 # Directory paths
├── core/                        # Core components
│   ├── browser-framework.js     # Main framework class
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

## 🎯 Available Test Cases

### 🔐 Authentication Tests
- **QE-001**: Basic Login Test (High priority)
- **QE-002**: Registration Flow Test (High priority) 
- **QE-010**: Logout Functionality Test (High priority)

### 📝 Content Management
- **QE-003**: Article Creation Test (Medium priority)
- **QE-007**: Comment System Test (Low priority)

### 🧭 Navigation & UI
- **QE-004**: Navigation Test (Medium priority)
- **QE-008**: Responsive Design Test (Medium priority)
- **QE-SIMPLE**: Simple Navigation Test (High priority)

### ⚙️ Functionality Tests
- **QE-005**: Search Functionality Test (Medium priority)
- **QE-006**: Profile Management Test (Medium priority)
- **QE-009**: Form Validation Test (High priority)

## 🛠️ Programmatic Usage

### Basic Framework Usage
```javascript
import { EnhancedBrowserTestFramework } from './framework/index.js';

const framework = new EnhancedBrowserTestFramework();
await framework.initialize();

// Run a simple task
const result = await framework.runTask(
  "Navigate to https://example.com and take a screenshot",
  "My Custom Test"
);

console.log('Test result:', result.status);
await framework.cleanup();
```

### Advanced Usage with Individual Tools
```javascript
import { 
  EnhancedBrowserTestFramework,
  BROWSER_CONFIG,
  AGENT_CONFIG 
} from './framework/index.js';

const framework = new EnhancedBrowserTestFramework();
await framework.initialize();

// Access configuration
console.log('Browser timeout:', BROWSER_CONFIG.defaultTimeout);
console.log('AI model:', AGENT_CONFIG.openai.modelName);

// Run custom test with specific data
const customTest = {
  id: 'CUSTOM-001',
  name: 'My Custom Test',
  task: 'Navigate to site and verify elements',
  testData: { uid: 'test_user_123' }
};

const result = await framework.runSingleTest(customTest);
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

## 📦 NPM Scripts

### Framework Operations
```bash
npm run enhanced:list          # List all tests
npm run enhanced:all           # Run all tests  
npm run enhanced:QE-001        # Run specific test
npm run enhanced:auth          # Run authentication tests
npm run enhanced:smoke         # Run smoke tests
npm run enhanced:high          # Run high priority tests
```

### Interactive Features
```bash
npm run interactive            # Interactive test creation
npm run interactive-demo       # Pre-built demonstrations
```

### Testing & Validation
```bash
npm run test-framework         # Test framework functionality
npm run verify-format          # Verify test file formats
```

## 🚀 Getting Started Examples

### Quick Smoke Test
```bash
npm run enhanced:QE-SIMPLE
```

### Authentication Testing
```bash
npm run enhanced:auth
```

### Complete Test Suite
```bash
npm run enhanced:all
```

### Create Custom Test
```bash
npm run interactive
# Follow prompts to create your own test
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