# VS Code Debugging Guide for Endorphin AI

_Last Updated: January 4, 2025 - v0.9.0_

This guide shows you how to debug your Endorphin AI tests using Visual Studio Code and access the powerful debug object with detailed test information.

## Quick Setup

### 1. Enable Debug Mode
```bash
# Add to your .env file
ENDORPHIN_DEBUG=true
```

### 2. VS Code Launch Configuration
Create `.vscode/launch.json` in your project:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Endorphin Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/endorphin-ai/dist/bin/endorphin.js",
      "args": ["run", "test", "YOUR-TEST-ID"],
      "env": {
        "ENDORPHIN_DEBUG": "true",
        "HEADLESS": "false",
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      },
      "console": "integratedTerminal",
      "stopOnEntry": false
    },
    {
      "name": "Debug Test Recorder",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/endorphin-ai/dist/bin/endorphin.js",
      "args": ["run", "test-recorder"],
      "env": {
        "ENDORPHIN_DEBUG": "true",
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 3. Run Your Test in Debug Mode
1. Set a breakpoint anywhere in your test file
2. Press `F5` or select "Debug Endorphin Test" from the debug panel
3. When execution pauses, open the **Debug Console**
4. You now have access to the `endorphinDebug` object!

## The Debug Object

When `ENDORPHIN_DEBUG=true`, Endorphin AI creates a global debug object with comprehensive test information:

### 🔍 Quick Overview
```javascript
// In VS Code Debug Console:
endorphinDebug
```

**Available Properties:**
- `endorphinDebug.framework` - Framework instance
- `endorphinDebug.session` - Current test session data  
- `endorphinDebug.config` - Framework configuration
- `endorphinDebug.tools` - Available automation tools
- `endorphinDebug.utils` - Debug utility functions
- `endorphinDebug.version` - Framework version

## 🛠 Debug Utilities

### Session Information
```javascript
// Get current test session summary
endorphinDebug.utils.getSessionData()

// Get test setup result (v0.9 smart tests)
endorphinDebug.utils.getSetupResult()

// Get data generation result (v0.9 smart tests)  
endorphinDebug.utils.getDataGenerationResult()

// Clear current session
endorphinDebug.utils.clearSession()
```

### Tool Inspection
```javascript
// List all available tools with details
endorphinDebug.utils.inspectTools()

// Get tool statistics
endorphinDebug.utils.getToolStats()

// Get specific tool by name
endorphinDebug.utils.getToolByName('navigate')
endorphinDebug.utils.getToolByName('click')

// List all tool names
endorphinDebug.tools.map(t => t.name)
```

### Browser Information
```javascript
// Get current browser URL
endorphinDebug.utils.getCurrentUrl()

// Take a screenshot
await endorphinDebug.utils.takeScreenshot()

// Get framework status
endorphinDebug.utils.getFrameworkStatus()
```

## 💡 Practical Examples

### Example 1: Inspect Smart Test Data (v0.9)
```javascript
// When debugging a test with setup() and data() functions
const sessionData = endorphinDebug.utils.getSessionData()
console.log('Session:', sessionData)

const setupResult = endorphinDebug.utils.getSetupResult()
console.log('Setup result:', setupResult)

const dataResult = endorphinDebug.utils.getDataGenerationResult()  
console.log('Generated data:', dataResult)
```

### Example 2: Examine Tool Usage
```javascript
// See all available tools
const tools = endorphinDebug.utils.inspectTools()
console.table(tools)

// Check tool statistics
const stats = endorphinDebug.utils.getToolStats()
console.log('Tool stats:', stats)

// Examine a specific tool
const navTool = endorphinDebug.utils.getToolByName('navigate')
console.log('Navigate tool:', navTool.description)
```

### Example 3: Monitor Test Execution
```javascript
// Check current execution state
const session = endorphinDebug.session
if (session) {
  console.log(`Test: ${session.testName}`)
  console.log(`Status: ${session.status}`)
  console.log(`Steps: ${session.steps.length}`)
  console.log(`Screenshots: ${session.screenshotCounter}`)
  console.log(`Duration: ${session.duration}ms`)
}
```

### Example 4: Debug Browser Issues  
```javascript
// Check browser state
console.log('Current URL:', endorphinDebug.utils.getCurrentUrl())
console.log('Framework status:', endorphinDebug.utils.getFrameworkStatus())

// Take a screenshot to see current state
endorphinDebug.utils.takeScreenshot().then(path => {
  console.log('Screenshot saved:', path)
})
```

## 🎯 Common Debugging Scenarios

### Test Not Finding Elements
```javascript
// Check current page state
endorphinDebug.utils.getCurrentUrl()
await endorphinDebug.utils.takeScreenshot()

// Inspect available tools
endorphinDebug.utils.getToolByName('getPageContent')
```

### Smart Test Issues (v0.9)
```javascript
// Check setup and data results
const setup = endorphinDebug.utils.getSetupResult()
const data = endorphinDebug.utils.getDataGenerationResult()

console.log('Setup provided:', setup)
console.log('Data generated:', data)

// Verify they're being passed to task correctly
const session = endorphinDebug.utils.getSessionData()
console.log('Session details:', session)
```

### Tool Execution Problems
```javascript
// List all tools and their status
endorphinDebug.utils.inspectTools().forEach(tool => {
  console.log(`${tool.name}: ${tool.isLoaded ? '✅' : '❌'}`)
})

// Get detailed tool stats
console.log(endorphinDebug.utils.getToolStats())
```

### Cost and Token Tracking
```javascript
// Access session for token information
const session = endorphinDebug.session
if (session) {
  session.steps.forEach((step, i) => {
    if (step.tokenUsage) {
      console.log(`Step ${i+1}: ${step.tokenUsage.totalTokens} tokens ($${step.tokenUsage.cost})`)
    }
  })
}
```

## 🔧 Advanced Debugging

### Configuration Inspection
```javascript
// View complete framework configuration
console.log(endorphinDebug.config)

// Check specific settings
console.log('Browser config:', endorphinDebug.config.browser)
console.log('AI config:', endorphinDebug.config.ai)
console.log('Pricing config:', endorphinDebug.config.pricing)
```

### Framework Instance Access
```javascript
// Access framework methods (advanced)
const framework = endorphinDebug.framework

// Get managers
const browserManager = framework.getBrowserManager()
const toolManager = framework.getToolManager()
const sessionManager = framework.getSessionManager()

console.log('Browser initialized:', browserManager.isInitialized())
console.log('Available tools:', toolManager.getTools().length)
```

## 📝 Step-by-Step Debugging Workflow

### 1. Set Up Debug Environment
```bash
# In your .env file
ENDORPHIN_DEBUG=true
HEADLESS=false
OPENAI_API_KEY=your_key_here
```

### 2. Create Debug Configuration
- Add the VS Code launch.json configuration above
- Replace "YOUR-TEST-ID" with your actual test ID

### 3. Start Debugging
1. Open your test file in VS Code
2. Set a breakpoint in your test task
3. Press `F5` to start debugging
4. Test will pause at your breakpoint

### 4. Explore in Debug Console
```javascript
// Quick health check
endorphinDebug.utils.getSessionData()
endorphinDebug.utils.getFrameworkStatus()

// Detailed exploration
endorphinDebug.utils.inspectTools()
endorphinDebug.session
```

### 5. Continue Execution
- Press `F10` (Step Over) to go step by step
- Press `F5` (Continue) to run to next breakpoint
- Use Debug Console to inspect state at any time

## 🚨 Troubleshooting

### Debug Object Not Available
```bash
# Ensure debug mode is enabled
ENDORPHIN_DEBUG=true npm run test:your-test

# Check environment variables in debug console
process.env.ENDORPHIN_DEBUG
```

### Limited Debug Information
```javascript
// Check if session is active
endorphinDebug.session

// If null, ensure you're debugging during test execution
// Set breakpoint inside test task, not in setup
```

### VS Code Not Stopping at Breakpoints
1. Ensure you're using the correct launch configuration
2. Set breakpoints in your test files, not framework files
3. Check that `ENDORPHIN_DEBUG=true` is set

## 💡 Pro Tips

1. **Best Breakpoint Locations**: Set breakpoints inside your test `task` function for full debug access
2. **Browser Visibility**: Use `HEADLESS=false` to see browser actions while debugging
3. **Combined Debugging**: Use both VS Code debugger AND browser dev tools simultaneously  
4. **Session Data**: Access `endorphinDebug.session` for comprehensive test execution data
5. **Tool Debugging**: Use `inspectTools()` to verify which automation tools are available

## 🎯 Example Debugging Session

```javascript
// 1. Check test is running
endorphinDebug.utils.getSessionData()
// → { sessionId: 'xxx', testName: 'My Test', status: 'running', steps: 3, ... }

// 2. Inspect current data (v0.9 smart tests)
endorphinDebug.utils.getSetupResult()
// → { baseUrl: 'https://staging.app.com', timestamp: '2025-01-04T...' }

endorphinDebug.utils.getDataGenerationResult()
// → { email: 'test_12345@example.com', password: 'SecurePass123!' }

// 3. Check browser state
endorphinDebug.utils.getCurrentUrl()
// → 'https://staging.app.com/login'

// 4. Examine available tools
endorphinDebug.utils.inspectTools().filter(t => t.name.includes('click'))
// → [{ name: 'click', description: 'Click on elements', type: 'framework', ... }]

// 5. Take screenshot for visual confirmation
await endorphinDebug.utils.takeScreenshot()
// → 'path/to/screenshot.png'
```

This powerful debugging system gives you complete visibility into your test execution, making it easy to diagnose issues and understand exactly what's happening at each step!