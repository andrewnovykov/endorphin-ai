# Test Recorder - User Guide

Create automated tests by recording your browser interactions in natural
language. The AI agent performs the actions while you watch, capturing
everything needed to recreate your test.

## Quick Start

```bash
# In your project directory with Endorphin AI installed
npx endorphin run test-recorder
```

## How It Works

1. **Setup**: Answer a few questions about your test
2. **Record**: Give natural language commands like "click login button"
3. **Watch**: See the AI perform actions in a real browser
4. **Generate**: Get a ready-to-run test file automatically

## Step-by-Step Example

### 1. Start Recording

```bash
npx endorphin run test-recorder
```

### 2. Fill in Test Details

```
Test ID: QE-LOGIN-001
Test Name: User Login Test
Description: Test login with valid credentials
Priority: High
Tags: authentication, login, smoke
Site URL: https://myapp.com
```

### 3. Give Natural Language Commands

```
🎬 Next step: click the login link
🎬 Next step: fill email field with test@example.com
🎬 Next step: fill password field with password123
🎬 Next step: click the submit button
🎬 Next step: verify welcome message appears
🎬 Next step: done
```

### 4. Generated Test

Your test is automatically saved as `tests/qe-login-001-recorded-test.js` and
ready to run!

## What You Get

### Organized Screenshots

Every step creates before/after screenshots in organized folders:

```
test-recorder/QE-LOGIN-001-[timestamp]/
└── steps/
    ├── 001-click-the-login-link/
    │   ├── before.png
    │   └── after.png
    ├── 002-fill-email-field/
    └── 003-fill-password-field/
```

### Ready-to-Run Test File

```javascript
// tests/qe-login-001-recorded-test.js
export const QE_LOGIN_001 = {
  id: 'QE-LOGIN-001',
  name: 'User Login Test',
  tags: ['authentication', 'login', 'smoke', 'recorded'],
  site: 'https://myapp.com',
  task: `Test the user login functionality:
1. Click the login link
2. Fill email field with test@example.com  
3. Fill password field with password123
4. Click the submit button
5. Verify welcome message appears`,
};
```

## Running Your Recorded Tests

```bash
# Run your specific test
npx endorphin run test QE-LOGIN-001

# Run all recorded tests
npx endorphin run test --tag recorded

# See all available tests
npx endorphin list
```

## Command Examples

| What You Want To Do  | Command To Type                                |
| -------------------- | ---------------------------------------------- |
| Click a button       | `click the submit button`                      |
| Fill in text         | `fill email field with test@example.com`       |
| Select from dropdown | `select "United States" from country dropdown` |
| Check for text       | `verify "Welcome back!" appears on page`       |
| Navigate             | `go to the profile page`                       |
| Wait                 | `wait for the page to load`                    |
| Scroll               | `scroll down to see more content`              |
| Finish recording     | `done`                                         |

## Tips for Great Tests

### Be Specific

❌ `click button`  
✅ `click the blue submit button`

### Include Verifications

❌ Just actions  
✅ `verify login success message appears`

### Use Realistic Data

❌ `fill field with test`  
✅ `fill email field with john.doe@company.com`

### Break Down Complex Flows

❌ One long command  
✅ Step-by-step actions

## Setup Requirements

### Prerequisites

- Node.js 16+ installed
- Endorphin AI installed in your project
- OpenAI API key (for AI agent)

### Configuration

Create `endorphin.config.js` in your project:

```javascript
export default {
  browser: {
    headless: false, // See the browser during recording
    viewport: { width: 1280, height: 720 },
  },
  ai: {
    model: 'gpt-4o',
  },
};
```

Set your OpenAI API key:

```bash
# Add to your .env file
OPENAI_API_KEY=your_key_here
```

## Common Issues & Solutions

### "Browser not opening"

Make sure your config has `headless: false`:

```javascript
// endorphin.config.js
export default {
  browser: {
    headless: false, // This makes browser visible
  },
};
```

### "AI not responding"

- Check your OpenAI API key is correct
- Verify you have API credits available
- Check your internet connection

### "Test not found after recording"

- Check the `tests/` folder for your generated file
- Run `npx endorphin list` to see if it's discovered
- Verify the test ID matches the filename

### "Generated test won't run"

- Make sure you're in the project directory
- Check that Endorphin AI is properly installed
- Verify your config file is valid

## Advanced Features

### Using Test Data

```
🎬 Next step: fill email with {{user.email}}
🎬 Next step: fill password with {{user.password}}
```

### Environment-Specific URLs

```
🎬 Next step: navigate to {{baseUrl}}/dashboard
```

### Conditional Actions

```
🎬 Next step: if error message appears, take screenshot
```

## Best Practices

1. **Start Simple**: Begin with basic workflows, add complexity later
2. **Test Real Scenarios**: Use actual user journeys, not just happy paths
3. **Add Verifications**: Always check that actions worked as expected
4. **Use Descriptive Names**: Make test IDs and names clear and searchable
5. **Organize with Tags**: Use consistent tags for easy test management

## Getting Help

- Check the troubleshooting section above
- Review your generated test files for clues
- Use descriptive test names and IDs for easier debugging
- Look at the screenshot artifacts to see what actually happened

The Test Recorder makes it easy to create comprehensive automated tests without
writing code. Just describe what you want to test in plain English, and let the
AI do the work!
