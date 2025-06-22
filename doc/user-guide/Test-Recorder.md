# Endorphin AI Test Recorder

The Test Recorder allows you to create automated tests by recording your browser interactions in natural language. The AI agent performs the actions while capturing screenshots and metadata for each step.

## Quick Start

### For Framework Development
```bash
# In the endorphin-ai repository
node bin/endorphin.js run test-recorder
```

### For End Users
```bash
# In your project directory
npx endorphin run test-recorder
```

## How It Works

1. **Interactive Setup**: Answer prompts to define your test
2. **Visual Recording**: Browser opens in headed mode, watch the AI perform actions
3. **Natural Language Commands**: Give simple instructions like "click login button"
4. **Automatic Screenshots**: Before/after images captured for each step
5. **Test Generation**: Creates a runnable Endorphin test file

## Interactive Session Example

```
🎬 Interactive Test Recorder
══════════════════════════════════════════════════
Record browser interactions step by step!
Commands:
• Type natural language commands (e.g., "click login button")
• Type "done" to stop recording and generate test
• Each step will be recorded with screenshots
══════════════════════════════════════════════════

📋 Test Data Collection
════════════════════════════════════════
Test ID (e.g., QE-012): QE-LOGIN-001
Test Name: User Login Test
Test Description: Test user login functionality with valid credentials
Priority (High/Medium/Low): High
Tags (comma-separated): authentication, login, smoke
Site URL: https://qafromla.herokuapp.com/

🚀 Initializing browser...
🌐 Navigating to: https://qafromla.herokuapp.com/

🎬 Next step: click the login link
[AI performs action, screenshots captured]

🎬 Next step: fill email field with test@example.com
[AI performs action, screenshots captured]

🎬 Next step: fill password field with password123
[AI performs action, screenshots captured]

🎬 Next step: click the submit button
[AI performs action, screenshots captured]

🎬 Next step: verify login success message appears
[AI performs action, screenshots captured]

🎬 Next step: done
```

## Generated Artifacts

### Directory Structure
```
test-recorder/QE-LOGIN-001-[timestamp]/
├── test-session.json          # Session metadata
├── summary.json               # Recording summary
└── steps/
    ├── 001-navigate-to-site/
    │   ├── step-info.json     # Step details
    │   ├── before.png         # Screenshot before action
    │   └── after.png          # Screenshot after action
    ├── 002-click-the-login-link/
    │   ├── step-info.json
    │   ├── before.png
    │   └── after.png
    ├── 003-fill-email-field/
    │   ├── step-info.json
    │   ├── before.png
    │   └── after.png
    └── 004-fill-password-field/
        ├── step-info.json
        ├── before.png
        └── after.png
```

### Generated Test File
```javascript
// tests/qe-login-001-recorded-test.js
export const QE_LOGIN_001 = {
  id: "QE-LOGIN-001",
  name: "User Login Test",
  description: "Test user login functionality with valid credentials",
  priority: "High",
  tags: ["authentication", "login", "smoke", "recorded"],
  site: "https://qafromla.herokuapp.com/",
  testData: {},
  task: `Test the user login functionality:
1. Navigate to https://qafromla.herokuapp.com/
2. Click the login link
3. Fill email field with test@example.com
4. Fill password field with password123
5. Click the submit button
6. Verify login success message appears`
};
```

## Running Recorded Tests

Once a test is generated, you can run it using standard Endorphin commands:

```bash
# Run specific recorded test
npx endorphin run test QE-LOGIN-001

# Run all recorded tests
npx endorphin run test --tag recorded

# List all available tests
npx endorphin list
```

## Configuration

### Environment Variables
```bash
# Browser settings
HEADLESS=false                 # Keep browser visible
ENDORPHIN_HEADLESS=false       # New config system support

# AI Configuration
OPENAI_API_KEY=your_key_here   # Required for AI agent

# Base URL for testing
BASE_URL=https://your-app.com/
```

### Config File (endorphin.config.js)
```javascript
export default {
  browser: {
    headless: false,           // Visible browser during recording
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    slowMo: 500               // Slow down for better visibility
  },
  
  recorder: {
    outputDirectory: "./test-recorder",
    screenshotFormat: "png",
    stepDelay: 1000           // Wait between steps
  },
  
  ai: {
    model: "gpt-4o",
    temperature: 0.1
  }
};
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `click button` | Click on a button or link |
| `fill field with text` | Type text into input fields |
| `select option from dropdown` | Select dropdown options |
| `verify text appears` | Check for text presence |
| `scroll down` | Scroll page content |
| `wait for element` | Wait for element to appear |
| `take screenshot` | Capture current page state |
| `done` | Finish recording and generate test |

## Tips for Effective Recording

1. **Be Specific**: Use descriptive commands like "click the blue submit button"
2. **Verify Actions**: Add verification steps to check expected outcomes
3. **Natural Language**: Write commands as you would explain to a person
4. **Step by Step**: Break complex workflows into individual steps
5. **Test Data**: Use realistic test data in your commands

## Troubleshooting

### Browser Not Opening
- Check `HEADLESS=false` in `.env`
- Verify `ENDORPHIN_HEADLESS=false` is set
- Ensure Playwright is properly installed

### AI Not Responding
- Verify `OPENAI_API_KEY` is set correctly
- Check network connectivity
- Ensure sufficient OpenAI API credits

### Generated Test Not Working
- Verify test file is in `tests/` directory
- Check that test ID matches filename pattern
- Run `npx endorphin list` to confirm test is discovered

## Advanced Features

### Custom Test Data
```
🎬 Next step: fill email field with {{testUser.email}}
🎬 Next step: fill password field with {{testUser.password}}
```

### Multiple Environments
```
🎬 Next step: navigate to {{baseUrl}}/login
```

### Error Handling
```
🎬 Next step: if login fails, take screenshot and continue
```

The Test Recorder creates comprehensive test artifacts that can be used for debugging, test maintenance, and collaboration with your team.