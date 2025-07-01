# Custom Tools Guide - Endorphin AI

_Last Updated: July 1, 2025 - v0.8.0+_

## 🎯 Overview

Endorphin AI allows you to create custom tools to extend the framework's
capabilities beyond the built-in browser automation tools. Custom tools enable
you to add specialized UI automation functionality specific to your testing needs,
such as complex form filling, specialized navigation patterns, or application-specific
workflows.

## 📋 Table of Contents

1. [Tool Architecture](#tool-architecture)
2. [Creating Your First Custom Tool](#creating-your-first-custom-tool)
3. [Tool Function Structure](#tool-function-structure)
4. [Configuration Setup](#configuration-setup)
5. [Advanced Tool Examples](#advanced-tool-examples)
6. [Using generateData()](#using-generatedata)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🏗 Tool Architecture

### How Custom Tools Work

Custom tools in Endorphin AI are built using LangChain's tool system and
integrate seamlessly with the AI agent. When you write natural language test
instructions, the AI can automatically select and use your custom tools
alongside the built-in browser automation tools.

```
Test Instruction → AI Agent → Tool Selection → Tool Execution → Result
```

### Tool Components

Each custom tool consists of:

- **Function Implementation**: The actual logic your tool performs
- **Tool Wrapper**: LangChain tool wrapper with metadata
- **Schema Definition**: Input parameter validation using Zod
- **Framework Integration**: Access to browser, logging, and test session

---

## 🚀 Creating Your First Custom Tool

### Step 1: Create Tools Directory Structure

```bash
# Create custom tools directory in your project
mkdir -p tools
cd tools

# Create your first tool file
touch login-ui-tool.js
```

### Step 2: Basic Tool Template

Create `tools/login-ui-tool.js`:

```javascript
// Required imports for all custom tools
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Example: Login UI automation tool
 */
export function createLoginTool(framework) {
  return tool(
    async ({ email, password, submitSelector = 'button[type="submit"]' }) => {
      const stepDesc = `Login with email: ${email}`;
      console.log(`🔐 ${stepDesc}`);

      // Check browser is available
      if (!framework.currentPage) {
        throw new Error('No browser page available');
      }

      const page = framework.currentPage;

      try {
        // Fill login form
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click(submitSelector);
        await page.waitForTimeout(2000);

        // Log the test step (important for test reporting)
        framework.logTestStep(
          stepDesc,
          'login-ui',
          { email },
          'Login successful',
          true
        );

        return `✅ Successfully logged in as ${email}`;
      } catch (error) {
        framework.logTestStep(
          stepDesc,
          'login-ui',
          { email },
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'login-ui',
      description: 'Automate login process with email and password',
      schema: z.object({
        email: z.string().email().describe('User email address'),
        password: z.string().describe('User password'),
        submitSelector: z.string().optional().describe('Submit button selector'),
      }),
    }
  );
}
```

### Step 3: Export Tool Function

Important: The function must follow the naming pattern `create*Tool` to be
automatically discovered.

### Step 4: Configure Your Tools

In your project's `endorphin.config.js`:

```javascript
export default {
  // Other configuration...
  customTools: [
    './tools', // Directory containing tool files
    // OR specific files:
    // './tools/login-ui-tool.js',
    // './tools/form-filler-tool.js',
  ],
};
```

---

## 🛠 Tool Function Structure

### Required Components

1. **Import Dependencies**

```javascript
import { tool } from '@langchain/core/tools';
import { z } from 'zod'; // For schema validation
```

2. **Function Signature**

```javascript
export function createYourToolNameTool(framework) {
  // Tool implementation
}
```

3. **Tool Definition**

```javascript
return tool(
  async (params) => {
    // Tool logic here
  },
  {
    name: 'tool-name',
    description: 'What this tool does',
    schema: z.object({
      // Parameter definitions
    }),
  }
);
```

### Accessing Browser Page

Always check if the browser page is available:

```javascript
if (!framework.currentPage) {
  throw new Error('No browser page available. Make sure a browser session is active.');
}

const page = framework.currentPage;
```

### Logging Test Steps

Use the framework's logging for proper test reporting:

```javascript
framework.logTestStep(
  'Step description',
  'tool-name',
  inputParams,
  'Result or error message',
  success // boolean
);
```

---

## ⚙️ Configuration Setup

### Basic Configuration

```javascript
// endorphin.config.js
export default {
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
  customTools: [
    './tools', // Load all tools from directory
  ],
};
```

### Advanced Configuration

```javascript
export default {
  customTools: [
    // Mix directories and specific files
    './tools',
    './special-tools/critical-tool.js',
    '/absolute/path/to/tools',
  ],
};
```

---

## 🎯 Advanced Tool Examples

### Form Filler Tool

```javascript
export function createFormFillerTool(framework) {
  return tool(
    async ({ fields }) => {
      if (!framework.currentPage) {
        throw new Error('No browser page available');
      }

      const page = framework.currentPage;
      
      try {
        for (const field of fields) {
          switch (field.type) {
            case 'text':
              await page.fill(field.selector, field.value);
              break;
            case 'select':
              await page.selectOption(field.selector, field.value);
              break;
            case 'checkbox':
              if (field.value) {
                await page.check(field.selector);
              } else {
                await page.uncheck(field.selector);
              }
              break;
          }
          await page.waitForTimeout(100); // Small delay between fields
        }

        framework.logTestStep(
          'Form filled successfully',
          'form-filler',
          { fieldCount: fields.length },
          'All fields filled',
          true
        );

        return `✅ Filled ${fields.length} form fields`;
      } catch (error) {
        throw error;
      }
    },
    {
      name: 'form-filler',
      description: 'Fill multiple form fields at once',
      schema: z.object({
        fields: z.array(z.object({
          selector: z.string(),
          value: z.string(),
          type: z.enum(['text', 'select', 'checkbox']).default('text'),
        })),
      }),
    }
  );
}
```

### Navigation Tool

```javascript
export function createNavigationTool(framework) {
  return tool(
    async ({ menuPath }) => {
      if (!framework.currentPage) {
        throw new Error('No browser page available');
      }

      const page = framework.currentPage;
      
      try {
        // Navigate through menu items
        for (const menuItem of menuPath) {
          await page.click(`text="${menuItem}"`);
          await page.waitForTimeout(500);
        }

        const pathStr = menuPath.join(' → ');
        framework.logTestStep(
          `Navigated through: ${pathStr}`,
          'navigation',
          { menuPath },
          'Navigation successful',
          true
        );

        return `✅ Navigated to: ${pathStr}`;
      } catch (error) {
        throw error;
      }
    },
    {
      name: 'navigation',
      description: 'Navigate through menu items',
      schema: z.object({
        menuPath: z.array(z.string()).describe('Path of menu items to click'),
      }),
    }
  );
}
```

---

## 🎲 Using generateData()

The framework provides a built-in `generateData()` utility for creating realistic test data with AI:

### Basic Usage

```javascript
import { generateData } from 'endorphin-ai';

export function createUserRegistrationTool(framework) {
  return tool(
    async ({ userType }) => {
      // Generate test data using AI
      const userData = await generateData(
        framework,
        {
          firstName: "string",
          lastName: "string",
          email: "string",
          phone: "string",
          password: "string"
        },
        `Generate realistic ${userType} user data for registration`
      );

      // Token usage is automatically logged:
      // 🪙 Data generation used 156 tokens ($0.0024)

      const page = framework.currentPage;
      
      // Use generated data
      await page.fill('#firstName', userData.firstName);
      await page.fill('#lastName', userData.lastName);
      await page.fill('#email', userData.email);
      await page.fill('#phone', userData.phone);
      await page.fill('#password', userData.password);
      
      return `✅ Registered user: ${userData.email}`;
    },
    {
      name: 'user-registration',
      description: 'Register a new user with AI-generated data',
      schema: z.object({
        userType: z.string().describe('Type of user (e.g., admin, customer)'),
      }),
    }
  );
}
```

### Advanced Data Generation

```javascript
// Generate multiple items
import { generateDataArray } from 'endorphin-ai';

const products = await generateDataArray(
  framework,
  {
    name: "string",
    price: "number",
    category: "string",
    inStock: "boolean"
  },
  5, // Generate 5 products
  "Generate diverse e-commerce products"
);
```

---

## 📚 Best Practices

### 1. Error Handling

Always provide clear error messages:

```javascript
if (!page.locator(selector).isVisible()) {
  throw new Error(`Element not found: ${selector}. Make sure you're on the correct page.`);
}
```

### 2. Configurable Selectors

Make selectors configurable for flexibility:

```javascript
export function createLoginTool(framework) {
  return tool(
    async ({ 
      email, 
      password,
      emailSelector = 'input[name="email"]',
      passwordSelector = 'input[name="password"]',
      submitSelector = 'button[type="submit"]'
    }) => {
      // Use configurable selectors
      await page.fill(emailSelector, email);
      await page.fill(passwordSelector, password);
      await page.click(submitSelector);
    },
    // Schema includes optional selector overrides
  );
}
```

### 3. Proper Waits

Use appropriate wait strategies:

```javascript
// Wait for element
await page.waitForSelector(selector, { timeout: 10000 });

// Wait for navigation
await page.waitForLoadState('networkidle');

// Small delays between actions
await page.waitForTimeout(200);
```

### 4. Logging Everything

Log all significant actions:

```javascript
framework.logTestStep('Starting form fill', 'form-tool');
// ... perform actions ...
framework.logTestStep('Form submitted', 'form-tool', { formId }, 'Success', true);
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Tool Not Found**
   - Check function name follows `create*Tool` pattern
   - Verify file exports the function
   - Check customTools path in config

2. **Browser Page Not Available**
   - Ensure test has navigated to a page first
   - Check framework.currentPage before using

3. **Selector Not Found**
   - Use more specific selectors
   - Add wait before interaction
   - Make selectors configurable

### Debug Tips

```javascript
// Add debug logging
console.log('Tool called with params:', params);
console.log('Current URL:', await page.url());
console.log('Page title:', await page.title());

// Take screenshot on error
try {
  // ... tool logic ...
} catch (error) {
  await framework.takeStepScreenshot('error-screenshot');
  throw error;
}
```

### Testing Your Tools

Create a simple test to verify your tool works:

```yaml
# tests/tool-test.yaml
id: TOOL-TEST-001
name: Test Custom Login Tool
task: |
  1. Navigate to https://example.com/login
  2. Use login-ui tool to login with:
     - Email: test@example.com
     - Password: password123
  3. Verify login was successful
```

---

## 🚀 Future: Built-in API Tools

API testing tools will be built into the framework in a future release. For now, 
focus on UI automation tools that interact with the browser through `framework.currentPage`.

See the [API Tools Implementation Plan](../API-Tools-Implementation.md) for details
on upcoming built-in API testing capabilities.

---

## 📚 Additional Resources

- [Framework Architecture](../Framework-Architecture.md)
- [Example Custom Tools](../../examples/custom-tools/)
- [TypeScript Type Definitions](../../framework/types/)

---

_Need help? Check the [examples directory](../../examples/custom-tools/) for working tool implementations._