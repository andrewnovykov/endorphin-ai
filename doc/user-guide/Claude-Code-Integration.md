# Claude Code Integration Guide

_Last Updated: February 14, 2026 - v1.1.0_

Use **Claude Code** to write and fix Endorphin AI tests with AI assistance. This guide shows you how to set up the integration and use the three pre-built skills.

## What is Claude Code Integration?

Claude Code Integration turns the Endorphin AI test recorder into a programmable API that Claude Code can invoke directly. This enables:

- **Autonomous test creation** - Describe what you want to test in one sentence; Claude sees the page and auto-generates all steps
- **Autonomous test repair** - Claude diagnoses failures and rewrites broken steps using current page state
- **Interactive recording** - Launch the test recorder from Claude Code

No need to manually write test files or debug failures - Claude Code does it for you.

### Autonomous Mode

Claude Code can **see the page** through the accessibility tree returned in every CLI response. This enables:

- **Zero-step authoring**: Say "write a login test at https://app.com with user@test.com / pass123" and Claude generates all steps automatically
- **Self-correcting**: When a step fails, Claude reads `errorDetails.availableElements` and retries with the correct element name
- **Page-aware**: After each step, Claude reads `pageState.accessibilityTree` to decide what to do next

## 🚀 Quick Start

### Step 1: Install Claude Code Integration

In your Endorphin AI project directory, run:

```bash
npx endorphin-ai init-claude-skill
```

This creates:
- `.claude/commands/write-test.md` - AI-assisted test creation
- `.claude/commands/fix-test.md` - Intelligent test repair
- `.claude/commands/record-test.md` - Interactive recorder launcher
- `.claude/CLAUDE.md` - Documentation for Claude Code

### Step 2: Open Project in Claude Code

Visit [claude.ai/code](https://claude.ai/code) and open your project.

### Step 3: Try Your First Skill

In Claude Code, type:

```
/write-test Create a login test
```

Claude Code will guide you through creating the test interactively.

## 📋 Available Skills

### `/write-test` - Create New Tests (Autonomous)

Autonomously creates a complete test from a high-level description. Claude reads the page and auto-generates all steps.

**Usage:**

```
/write-test <test description with URL and test data>
```

**What it does:**

1. Extracts test metadata from your description (URL, credentials, goal)
2. Creates a recording session and reads the initial page state
3. Analyzes the accessibility tree to see all page elements
4. Auto-generates steps based on the test goal and current page
5. Handles failures by reading available elements and retrying
6. Generates the final test file

**Example Session:**

```
You: /write-test Create a login test at https://app.com with user@test.com / password123

Claude: Creating test LOGIN-001 "User Login Flow"...

[Creates session, reads page state]
I see: textbox "Email", textbox "Password", button "Sign In"

Step 1: Fill the Email field with user@test.com → Success
Step 2: Fill the Password field with password123 → Success
Step 3: Click the 'Sign In' button → Success

[Page changed to dashboard]
I see: heading "Welcome back", link "Home", link "Profile"

Step 4: Verify 'Welcome back' is visible → Success

Test created! 4 steps recorded.
File: tests/login-001-recorded-test.ts
Run: npx endorphin-ai run test LOGIN-001
```

### `/fix-test` - Fix Failing Tests (Autonomous)

Autonomously diagnoses a failing test and re-records it with fixes.

**Usage:**

```
/fix-test <TEST-ID>
```

**What it does:**

1. Reads the test file and runs it to get failure details
2. Identifies the broken step and error message
3. Re-creates a session and fast-forwards through passing steps
4. At the failing step, reads the page state and compares with the error
5. Rewrites the step using actual available elements
6. Generates the fixed test file

**Example Session:**

```
You: /fix-test HEALTH-001

Claude: Reading test file... 5 steps found.
Running test... Step 4 failed: "Element not found: button 'Submit'"

Re-recording with fix:
Step 1: Navigate to URL → Success
Step 2: Fill email → Success
Step 3: Fill password → Success

[At failed step, reads page state]
I see: button "Sign In", button "Cancel" (no "Submit" button)
Diagnosis: Button renamed from "Submit" to "Sign In"

Step 4 (fixed): Click the 'Sign In' button → Success
Step 5: Verify 'Welcome' → Success

Test fixed! File: tests/health-001-recorded-test.ts
Verify: npx endorphin-ai run test HEALTH-001
```

### `/record-test` - Launch Interactive Recorder

Starts the interactive test recorder with visual feedback.

**Usage:**

```
/record-test
```

**What it does:**

Launches `npx endorphin-ai run test-recorder` in your terminal.

The interactive recorder:
1. Prompts for test metadata
2. Opens a browser window
3. Guides you through recording steps
4. Saves the test file when you're done

See [Test-Recorder.md](./Test-Recorder.md) for interactive recorder details.

## 🔧 Recorder CLI API

The skills use a programmatic API that you can also use directly.

### `recorder create` - Create Recording Session

```bash
npx endorphin-ai recorder create \
  --id <TEST-ID> \
  --name "<Test Name>" \
  --description "<Description>" \
  --priority <High|Medium|Low> \
  --tags <tag1,tag2> \
  --url <URL> \
  --data key=value
```

**Output (JSON):**
```json
{
  "sessionId": "TEST-042-1739548800123",
  "testId": "TEST-042",
  "testName": "Login Test",
  "recordingPath": "/path/to/test-recorder/TEST-042-1739548800123",
  "pageState": {
    "url": "https://app.com/login",
    "title": "Login",
    "accessibilityTree": "- WebArea \"Login\"\n  - textbox \"Email\"\n  - textbox \"Password\"\n  - button \"Log In\""
  }
}
```

### `recorder add-step` - Add Step to Session

```bash
npx endorphin-ai recorder add-step \
  --session <sessionId> \
  --step "<natural language step description>"
```

**Output (JSON, success):**
```json
{
  "sessionId": "TEST-042-1739548800123",
  "stepNumber": 3,
  "description": "Click the login button",
  "success": true,
  "result": "Clicked button 'Login'",
  "beforeScreenshot": "/path/to/before.png",
  "afterScreenshot": "/path/to/after.png",
  "pageState": {
    "url": "https://app.com/dashboard",
    "title": "Dashboard",
    "accessibilityTree": "- WebArea \"Dashboard\"\n  - heading \"Welcome\" (level 1)"
  }
}
```

**Output (JSON, failure):**
```json
{
  "stepNumber": 2,
  "success": false,
  "result": "Element not found",
  "errorDetails": {
    "failedAction": "click",
    "reason": "Element not found: button 'Submit'",
    "availableElements": ["button 'Log In'", "textbox 'Email'", "textbox 'Password'"]
  },
  "pageState": {
    "url": "https://app.com/login",
    "title": "Login",
    "accessibilityTree": "- WebArea \"Login\"\n  - textbox \"Email\"\n  - button \"Log In\""
  }
}
```

### `recorder generate` - Generate Test File

```bash
npx endorphin-ai recorder generate \
  --session <sessionId> \
  --output-dir tests/
```

**Output (JSON):**
```json
{
  "sessionId": "TEST-042-1739548800123",
  "testFilePath": "/path/to/tests/test-042-recorded-test.ts",
  "htmlReportPath": "/path/to/test-recorder/TEST-042-1739548800123/recording-report.html",
  "totalSteps": 5,
  "duration": 45000
}
```

### `recorder list` - List All Sessions

```bash
npx endorphin-ai recorder list
```

**Output (JSON):**
```json
{
  "sessions": [
    {
      "sessionId": "TEST-042-1739548800123",
      "testId": "TEST-042",
      "testName": "Login Test",
      "createdAt": "2026-02-14T10:30:00.123Z",
      "stepCount": 5,
      "status": "completed"
    }
  ]
}
```

### `recorder status` - Get Session Status

```bash
npx endorphin-ai recorder status --session <sessionId>
```

**Output (JSON):**
```json
{
  "sessionId": "TEST-042-1739548800123",
  "testId": "TEST-042",
  "testName": "Login Test",
  "createdAt": "2026-02-14T10:30:00.123Z",
  "stepCount": 5,
  "status": "completed",
  "recordingPath": "/path/to/test-recorder/TEST-042-1739548800123",
  "testFilePath": "/path/to/tests/test-042-recorded-test.ts"
}
```

## 📝 CLI API Example

Create a complete test using the CLI API:

```bash
# Create session
SESSION=$(npx endorphin-ai recorder create \
  --id LOGIN-001 \
  --name "Login Test" \
  --url https://app.example.com/login | jq -r '.sessionId')

# Add steps
npx endorphin-ai recorder add-step --session $SESSION --step "Fill email with test@example.com"
npx endorphin-ai recorder add-step --session $SESSION --step "Fill password with secret123"
npx endorphin-ai recorder add-step --session $SESSION --step "Click Sign In button"
npx endorphin-ai recorder add-step --session $SESSION --step "Verify 'Welcome' is visible"

# Generate test
npx endorphin-ai recorder generate --session $SESSION --output-dir tests/
```

## 💡 Best Practices

### Be Specific in Test Steps

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

### Keep Test Data Organized

When creating tests with `/write-test`, provide test data as key-value pairs:

```
Test Data: email=test@example.com
Test Data: password=secret123
Test Data: username=testuser
```

This data is saved with the test and can be referenced in steps.

## 🚨 Troubleshooting

### Skill Not Found

**Problem:** Claude Code says skill not found

**Solution:**
1. Verify `.claude/commands/` exists
2. Check skill files exist: `ls -la .claude/commands/`
3. Re-run `npx endorphin-ai init-claude-skill`

### Browser Not Opening

**Problem:** Recording session created but browser doesn't open

**Solution:**
1. Check your config has `headless: false`:
   ```typescript
   // endorphin.config.ts
   export default {
     browser: {
       headless: false
     }
   };
   ```
2. Verify Playwright browsers are installed:
   ```bash
   npx playwright install chromium
   ```

### AI Not Responding

**Problem:** Steps hang or timeout

**Solution:**
- Check your OpenAI API key in `.env`
- Verify internet connection
- Check API credits/quota
- Try with a simpler step description

### Session Not Found

**Problem:** `recorder add-step` fails with "Session not found"

**Solution:**
1. List all sessions: `npx endorphin-ai recorder list`
2. Verify session ID is correct
3. Check `test-recorder/` directory exists

### Commands Not Working

**Problem:** Steps fail to execute

**Solution:**
- Be more specific ("click the Submit button" not "click")
- Wait between actions ("wait 2 seconds")
- Use exact text you see on screen
- Check for typos in selector descriptions

### JSON Output Errors

**Problem:** CLI output is not valid JSON

**Solution:**
- User messages go to stderr (not stdout)
- Only JSON goes to stdout
- Parse with `jq` or `JSON.parse()`
- Check exit code: 0 = success, 1 = error

## 📂 Session Persistence

Recording sessions are saved in `test-recorder/{sessionId}/`:

```
test-recorder/
└── LOGIN-001-1739548800123/
    ├── session-state.json        # Session metadata + current state
    ├── recording-session.json    # Final session summary
    ├── steps/
    │   ├── 001-fill-email-field/
    │   │   ├── before.png
    │   │   ├── after.png
    │   │   └── step-data.json
    │   ├── 002-fill-password-field/
    │   │   └── ...
    └── recording-report.html     # Generated on completion
```

**Session states:**
- `in-progress` - Session is active, can add more steps
- `completed` - Test file generated, session closed

**Note:** Completed sessions cannot be modified. Create a new session to re-record.

## 🔄 Comparison: Interactive vs. Claude Code

| Feature | Interactive Recorder | Claude Code Skills |
|---------|---------------------|-------------------|
| **Launch** | `npx endorphin-ai run test-recorder` | `/write-test` in Claude Code |
| **Step Input** | Terminal prompts | Claude Code conversation |
| **Workflow** | Manual step-by-step | AI-guided with suggestions |
| **Test Repair** | Manual analysis | Automated with `/fix-test` |
| **Browser** | Opens automatically | Opens automatically |
| **Screenshots** | Captured for each step | Captured for each step |
| **Test File** | Generated at end | Generated at end |
| **Use Case** | Direct control | AI assistance + automation |

Both methods produce identical test files and use the same underlying recorder.

## 📚 Related Guides

- [Test-Recorder.md](./Test-Recorder.md) - Interactive test recorder guide
- [Test-Writing-Tips.md](./Test-Writing-Tips.md) - Best practices for writing tests
- [HTML-Reporter-Guide.md](./HTML-Reporter-Guide.md) - View test results

## 🎓 Learning Path

1. **Start with `/record-test`** - Get familiar with the interactive recorder
2. **Try `/write-test`** - Experience AI-guided test creation
3. **Use `/fix-test`** - Learn intelligent test repair
4. **Explore CLI API** - Automate test creation in scripts

## 🆘 Getting Help

- **GitHub Issues** - Report bugs or request features
- **GitHub Discussions** - Community help and questions
- **CLAUDE.md** - Full API reference in `.claude/CLAUDE.md`

---

**Ready to start?** Run `npx endorphin-ai init-claude-skill` and try `/write-test`! 🚀

_Claude Code integration available since v1.1.0._
