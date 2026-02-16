# 🎯 AI Agent Prompting Guide

_Last Updated: July 4, 2025 - v0.9.0_

## 📝 Overview

This guide helps you write effective natural language instructions for Endorphin
AI's test framework. The AI agent uses specific tools to automate browser
interactions, and using the right language patterns helps it select the correct
tools and parameters.

**Key Benefits:**

- 🤖 **Natural Language** - Write tests in plain English
- 🎯 **Smart Tool Selection** - AI chooses the right browser automation tools
- ✅ **Reliable Execution** - Consistent, repeatable test automation
- 🔍 **Visual Verification** - Screenshots and element validation included

## 🔧 Available Tools

The framework provides these main tool categories:

| Tool Category        | Purpose                 | Key Tools                                |
| -------------------- | ----------------------- | ---------------------------------------- |
| **Navigation**       | Page navigation         | `navigate`                               |
| **Content Analysis** | Page content inspection | `getPageContent` (raw HTML only; accessibility tree is auto-injected) |
| **Interaction**      | User interactions       | `click`, `fill`, `clearField`            |
| **Verification**     | Element validation      | `verifyElement`, `getElementInfo`        |
| **Utilities**        | Support actions         | `wait`, `screenshot`                     |

---

## 🌍 Navigation Prompting

### Tool: `navigate`

**Purpose**: Navigate to URLs with enhanced loading options

### Effective Prompts:

```
✅ GOOD:
- "Navigate to https://example.com"
- "Go to https://login.site.com"
- "Open the website https://shop.com"
- "Visit https://app.com and wait for network to be idle"

❌ AVOID:
- "Browse to..." (unclear)
- "Check out..." (ambiguous)
- Relative URLs without context
```

### Advanced Navigation:

```
- "Navigate to https://example.com and wait for complete page load"
- "Go to https://spa-app.com and wait for DOM content to load"
- "Visit https://slow-site.com and wait for network idle"
```

---

## 🔘 Click Actions

### Tool: `click`

**Purpose**: Click buttons, links, and interactive elements

### Button/Link Clicking:

```
✅ GOOD PATTERNS:
- "Click on [button text]" → Uses text strategy
- "Click the 'Log In' button"
- "Click the 'Sign In' button"
- "Click on 'Submit'"
- "Click the 'Add to Cart' button"
- "Click 'Continue'"

🎯 SPECIFIC EXAMPLES:
- "Click on Log In" → Finds button with "Log In" text
- "Click the Sign In button" → Finds "Sign In" button
- "Click Submit" → Finds "Submit" button
- "Click the Register link" → Finds "Register" link text
```

### CSS Selector Clicking:

```
✅ FOR COMPLEX ELEMENTS:
- "Click the element with selector #login-btn"
- "Click the CSS selector .submit-button"
- "Click using selector input[type='submit']"
- "Click the element button.primary"

🎯 WHEN TO USE CSS:
- No visible text on the button
- Multiple similar buttons
- Icon-only buttons
- Custom styled elements
```

### Role-Based Clicking:

```
✅ SEMANTIC ELEMENTS:
- "Click the button labeled 'Login'" → Uses role strategy
- "Click the link 'Home'" → Uses role strategy
- "Click the checkbox 'Remember me'" → Uses role strategy
```

---

## 📝 Form Filling

### Tool: `fill`

**Purpose**: Fill input fields with text

### Email Fields:

```
✅ GOOD PATTERNS:
- "Fill email field with user@example.com"
- "Enter user@example.com in the email field"
- "Type test@domain.com in email input"
- "Fill the email address field with admin@site.com"

🔧 SELECTORS USED:
- input[type="email"]
- input[name="email"]
- #email
- [placeholder*="email"]
```

### Password Fields:

```
✅ GOOD PATTERNS:
- "Fill password field with mypassword123"
- "Enter password123 in password field"
- "Type secretpass in the password input"
- "Fill password with mysecretkey"

🔧 SELECTORS USED:
- input[type="password"]
- input[name="password"]
- #password
- [placeholder*="password"]
```

### Text Fields:

```
✅ GOOD PATTERNS:
- "Fill username field with john_doe"
- "Enter 'John Smith' in the name field"
- "Type 'Software Engineer' in job title field"
- "Fill search box with 'laptop computers'"

🔧 AUTO-DETECTED SELECTORS:
- input[name="username"]
- input[name="firstname"]
- input[name="search"]
- #search, .search-input
```

### Advanced Form Filling:

```
✅ ADVANCED OPTIONS:
- "Fill email field with user@test.com and press Enter"
- "Type slowly 'password123' in password field"
- "Clear the username field and enter 'newuser'"
- "Fill address field without clearing existing text"
```

---

## 🔍 Verification & Validation

### Tool: `verifyElement`

**Purpose**: Check if elements exist and are in expected states

### Element Existence:

```
✅ GOOD PATTERNS:
- "Verify the login form is visible"
- "Check if success message appears"
- "Confirm the error message is displayed"
- "Validate that user profile is shown"

🎯 SPECIFIC EXAMPLES:
- "Verify element .success-message is visible"
- "Check if #user-menu is present on page"
- "Confirm button 'Logout' is visible"
```

### Page Content Verification:

```
✅ CONTENT CHECKS:
- "Verify page contains 'Welcome back'"
- "Check if 'Login successful' message appears"
- "Confirm page title contains 'Dashboard'"
- "Validate that username 'John' is displayed"
```

### Tool: `getElementInfo`

**Purpose**: Get detailed information about elements

```
✅ INSPECTION PATTERNS:
- "Get information about the login button"
- "Inspect the email input field details"
- "Check properties of element #user-profile"
- "Analyze the form submission button"
```

---

## 📄 Content Analysis

### Tool: `getPageContent`

**Purpose**: Analyze page content for decision making

```
✅ ANALYSIS PATTERNS:
- "Analyze the current page content"
- "Get page content to find login elements"
- "Inspect page HTML for form fields"
- "Check page content for error messages"

🎯 WHEN TO USE:
- Finding elements on complex pages
- Determining next steps based on page state
- Debugging failed interactions
- Understanding page structure
```

---

## ⏱️ Timing & Waits

### Tool: `wait`

**Purpose**: Add delays and wait for elements

### Time-based Waits:

```
✅ GOOD PATTERNS:
- "Wait 2 seconds for page to load"
- "Wait 3000 milliseconds for animation"
- "Pause for 1 second"
- "Wait 5 seconds for data to load"

🎯 COMMON SCENARIOS:
- After clicking submit buttons
- During page transitions
- After form submissions
- For animations to complete
```

### Element-based Waits:

```
✅ ELEMENT WAITING:
- "Wait for success message to appear"
- "Wait until loading spinner disappears"
- "Wait for dashboard to be visible"
- "Wait for element #content to load"

🔧 STATES:
- visible (default)
- hidden
- attached
- detached
```

---

## 📸 Screenshots & Documentation

### Tool: `screenshot`

**Purpose**: Capture visual documentation

```
✅ SCREENSHOT PATTERNS:
- "Take a screenshot"
- "Capture screenshot of login form"
- "Take full page screenshot"
- "Screenshot the error message"

🎯 AUTOMATIC SCREENSHOTS:
- Taken after each major action
- Captured when errors occur
- Saved with descriptive names
- Stored in test results folder
```

---

## 🎯 Complete Test Example

Here's a well-structured test task using effective prompting:

```javascript
export const LOGIN_TEST = {
  id: 'AUTH-001',
  name: 'Login Flow Test',
  description: 'Test complete login functionality',
  priority: 'High',
  tags: ['authentication', 'smoke'],
  site: 'https://example.com/login',
  task: `
    Navigate to https://example.com/login.
    Wait 2 seconds for page to fully load.
    
    Fill email field with test@example.com.
    Fill password field with password123.
    
    Click the 'Sign In' button.
    Wait 3 seconds for login to process.
    
    Verify that user dashboard is visible.
    Check if welcome message contains 'Welcome back'.
    
    Take a screenshot of the logged-in state.
    
    Confirm login was successful by checking page content.
  `,
};
```

---

## 🚨 Common Pitfalls & Solutions

### ❌ Vague Instructions

```
BAD: "Do login stuff"
GOOD: "Fill email with user@test.com, fill password with pass123, click Sign In"
```

### ❌ Missing Wait Times

```
BAD: "Click submit and verify success"
GOOD: "Click submit button, wait 3 seconds, verify success message appears"
```

### ❌ Ambiguous Element References

```
BAD: "Click the button"
GOOD: "Click the 'Login' button" or "Click button with CSS selector #login-btn"
```

### ❌ No Error Handling Context

```
BAD: "Fill form and submit"
GOOD: "Fill email field, fill password field, click submit, verify no error messages appear"
```

---

## 🎭 Advanced Prompting Strategies

### Sequential Actions:

```
"First, navigate to the login page.
Then, fill in the credentials.
Next, submit the form.
Finally, verify successful login."
```

### Conditional Logic:

```
"Check if user is already logged in.
If not logged in, perform login process.
If already logged in, verify dashboard is visible."
```

### Error Scenarios:

```
"Attempt login with invalid credentials.
Verify error message 'Invalid username or password' appears.
Confirm form fields are still visible for retry."
```

### Multi-step Workflows:

```
"Navigate to registration page.
Fill all required fields with test data.
Submit registration form.
Wait for confirmation email message.
Verify account was created successfully."
```

---

## ✅ Best Practices Summary

1. **Be Specific**: Use exact button text and clear element descriptions
2. **Include Waits**: Add appropriate wait times for page loads and transitions
3. **Verify Actions**: Always verify the result of important actions
4. **Use Natural Language**: Write as you would instruct a human tester
5. **Structure Steps**: Break complex flows into clear, sequential steps
6. **Handle Errors**: Include verification steps to catch failures
7. **Document State**: Use screenshots to capture important moments

Remember: The AI agent is intelligent but benefits from clear, specific
instructions that map well to the available browser automation tools.
