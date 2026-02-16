_Last Updated: July 4, 2025 - v0.9.0_
# Test Recorder Guide

Create tests by showing the AI what to do in plain English.

## 🎯 What is Test Recorder?

Test Recorder lets you create tests interactively by:
- Typing commands in plain English
- Watching the AI perform actions in a browser
- Getting a test file automatically created

No coding required!

## 🚀 Quick Start

Start recording:
```bash
npx endorphin-ai run test-recorder
```

You'll see:
1. A browser window opens
2. Questions about your test
3. A prompt to type commands

## 📝 Recording a Test

### Step 1: Test Details
The recorder asks for:
```
Test ID: LOGIN-001
Test Name: User Login Test  
Description: Test the login process
Priority: High
Tags: login, auth
Site URL: https://myapp.com
```

### Step 2: Give Commands
Type what you want the AI to do:
```
> click the login button
✅ Clicked login button

> fill email with test@example.com  
✅ Filled email field

> fill password with mypassword
✅ Filled password field

> click submit
✅ Clicked submit button

> verify welcome message appears
✅ Verified welcome message

> done
✅ Test saved to tests/LOGIN-001.ts
```

### Step 3: Run Your Test
```bash
npx endorphin-ai run test LOGIN-001
```

## 💬 Command Examples

### Navigation
```
go to the homepage
navigate to settings page
visit https://example.com
```

### Clicking
```
click the submit button
click on "Sign In"
press the login link
```

### Filling Forms
```
fill email with john@example.com
type "John Smith" in name field
enter password123 in password field
```

### Verification
```
verify login was successful
check if error message appears
confirm dashboard is visible
```

### Waiting
```
wait 2 seconds
wait for page to load
wait until spinner disappears
```

### Finishing
```
done
finish
stop recording
```

## 📸 What Gets Recorded

### Screenshots
Every action creates before/after screenshots:
```
test-recorder/LOGIN-001_2025-01-04/
├── step-001-click-login/
│   ├── before.png
│   └── after.png
├── step-002-fill-email/
│   ├── before.png
│   └── after.png
```

### Test File
A ready-to-run test file:
```typescript
export const LOGIN_001 = {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test the login process',
  priority: 'High',
  tags: ['login', 'auth', 'recorded'],
  url: 'https://myapp.com',
  task: `
    Click the login button
    Fill email with test@example.com
    Fill password with mypassword
    Click submit
    Verify welcome message appears
  `
};
```

## 💡 Tips for Better Recording

### Be Specific
```
❌ "click button"
✅ "click the blue Submit button"
```

### Add Verifications
```
❌ Just clicking around
✅ "verify success message shows"
```

### Use Real Data
```
❌ "type something"
✅ "type john.doe@company.com"
```

### Think Step by Step
```
❌ "do the login"
✅ "click login, fill email, fill password, submit"
```

## 🚨 Troubleshooting

### Browser Not Opening
Check your config has `headless: false`:
```typescript
// endorphin.config.ts
export default {
  browser: {
    headless: false
  }
};
```

### AI Not Responding
- Check your OpenAI API key in `.env`
- Verify internet connection
- Make sure you have API credits

### Test Not Found
After recording:
```bash
# List all tests
npx endorphin-ai list

# Check tests folder
ls tests/
```

### Commands Not Working
- Be more specific ("click the Submit button" not "click")
- Wait between actions ("wait 2 seconds")
- Use exact text you see on screen

## 🎯 Best Practices

1. **Start Simple**: Record basic flows first
2. **Test Happy Paths**: Get the normal flow working
3. **Add Edge Cases**: Record error scenarios separately  
4. **Use Good Names**: Make test IDs descriptive
5. **Verify Results**: Always check actions worked

## 📚 Next Steps

- [Write Tests Manually](Test-Structure-Guide.md)
- [Test Writing Tips](Test-Writing-Tips.md)
- [View Test Reports](HTML-Reporter-Guide.md)

---

Test Recorder makes creating tests as easy as telling someone what to click!

---

## 🤖 Non-Interactive Mode (CLI API)

The test recorder also provides a programmable CLI API for automated test creation. This is used by Claude Code skills and can be invoked directly.

### Available Commands

```bash
# Create recording session
npx endorphin-ai recorder create --id TEST-ID --name "Test Name" --url https://example.com

# Add steps to session
npx endorphin-ai recorder add-step --session SESSION-ID --step "Click login button"

# Generate test file
npx endorphin-ai recorder generate --session SESSION-ID --output-dir tests/

# List all sessions
npx endorphin-ai recorder list

# Get session status
npx endorphin-ai recorder status --session SESSION-ID
```

### Full Example

```bash
# Create session and capture session ID
SESSION=$(npx endorphin-ai recorder create \
  --id LOGIN-001 \
  --name "Login Test" \
  --url https://app.example.com/login | jq -r '.sessionId')

# Add steps
npx endorphin-ai recorder add-step --session $SESSION --step "Fill email with test@example.com"
npx endorphin-ai recorder add-step --session $SESSION --step "Fill password with secret123"
npx endorphin-ai recorder add-step --session $SESSION --step "Click Sign In button"
npx endorphin-ai recorder add-step --session $SESSION --step "Verify 'Welcome' is visible"

# Generate test file
npx endorphin-ai recorder generate --session $SESSION --output-dir tests/
```

### When to Use CLI API

- **Automation** - Create tests from scripts or CI/CD pipelines
- **Claude Code Integration** - Use `/write-test` skill for AI-guided test creation
- **Batch Test Creation** - Generate multiple tests programmatically
- **Custom Workflows** - Build custom test creation tools

### When to Use Interactive Mode

- **Manual Testing** - Direct control over each step
- **Visual Feedback** - See browser actions in real-time
- **Learning** - Understand how the recorder works
- **Complex Scenarios** - Situations requiring human judgment

For full CLI API documentation, see [Claude-Code-Integration.md](./Claude-Code-Integration.md).