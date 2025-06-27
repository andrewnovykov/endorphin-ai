# Custom Tools Guide - Endorphin AI

_Last Updated: June 27, 2025 - v0.4.1+_

## 🎯 Overview

Endorphin AI allows you to create custom tools to extend the framework's
capabilities beyond the built-in browser automation tools. Custom tools enable
you to add specialized functionality specific to your testing needs, such as API
interactions, database operations, file manipulations, or integration with
third-party services.

## 📋 Table of Contents

1. [Tool Architecture](#tool-architecture)
2. [Creating Your First Custom Tool](#creating-your-first-custom-tool)
3. [Tool Function Structure](#tool-function-structure)
4. [Configuration Setup](#configuration-setup)
5. [Advanced Tool Examples](#advanced-tool-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

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
touch api-tools.js
```

### Step 2: Basic Tool Template

Create `tools/api-tools.js`:

```javascript
// Required imports for all custom tools
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Example: Simple API GET request tool
 */
export function createApiGetTool(framework) {
  return tool(
    async ({ url, headers = {} }) => {
      const stepDesc = `API GET request to: ${url}`;
      console.log(`🌐 ${stepDesc}`);

      try {
        // Perform the API call
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        });

        const data = await response.json();
        const result = `API GET successful. Status: ${response.status}, Data: ${JSON.stringify(data, null, 2)}`;

        // Log the test step (important for test reporting)
        framework.logTestStep(
          stepDesc,
          'apiGet',
          { url, headers },
          result,
          true
        );

        return result;
      } catch (error) {
        const errorMsg = `API GET failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'apiGet',
          { url, headers },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'apiGet',
      description:
        'Perform a GET request to an API endpoint and return the response data.',
      schema: z.object({
        url: z.string().describe('The API endpoint URL to call'),
        headers: z
          .record(z.string())
          .optional()
          .describe('Optional HTTP headers'),
      }),
    }
  );
}

/**
 * Example: Database query tool (placeholder)
 */
export function createDatabaseQueryTool(framework) {
  return tool(
    async ({ query, database = 'default' }) => {
      const stepDesc = `Execute database query: ${query}`;
      console.log(`🗄️ ${stepDesc}`);

      try {
        // This is a placeholder - implement your actual database logic
        const mockResult = { rows: [], count: 0 };

        const result = `Database query executed successfully. Found ${mockResult.count} rows.`;
        framework.logTestStep(
          stepDesc,
          'databaseQuery',
          { query, database },
          result,
          true
        );

        return result;
      } catch (error) {
        const errorMsg = `Database query failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'databaseQuery',
          { query, database },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'databaseQuery',
      description:
        'Execute a SQL query against the database and return results.',
      schema: z.object({
        query: z.string().describe('SQL query to execute'),
        database: z
          .string()
          .optional()
          .describe("Database name (defaults to 'default')"),
      }),
    }
  );
}
```

### Step 3: Configure Custom Tools

Update your `endorphin.config.ts`:

```javascript
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: {
    headless: false,
    slowMo: 500,
  },
  resultsDir: './test-results',

  // Add custom tools configuration
  customTools: [
    // Path to your custom tools directory
    './tools',
  ],
};
```

### Step 4: Test Your Custom Tool

Create a test that uses your custom tool:

```javascript
// tests/api-test.js
export const API_TEST = {
  id: 'CUSTOM-001',
  name: 'API Integration Test',
  description: 'Test custom API tool functionality',
  priority: 'High',
  tags: ['api', 'custom-tools'],
  site: 'https://jsonplaceholder.typicode.com',
  task: 'Navigate to the JSONPlaceholder API site, then use the API tool to fetch user data from /users/1 endpoint',
};
```

---

## 🔧 Tool Function Structure

### Required Function Format

All custom tools must follow this exact structure:

```javascript
export function createYourToolName(framework) {
  return tool(
    async (parameters) => {
      // Your tool implementation
    },
    {
      name: 'toolName',
      description: 'Tool description for AI',
      schema: z.object({
        // Parameter definitions
      }),
    }
  );
}
```

### Framework Object

The `framework` parameter provides access to:

```javascript
// Browser page object (Playwright)
framework.page;

// Test session information
framework.currentTestSession;

// Logging function
framework.logTestStep(description, action, parameters, result, success);

// Screenshot function
framework.takeStepScreenshot(description);

// Configuration access
framework.config;
```

### Parameter Schema

Use Zod for parameter validation:

```javascript
schema: z.object({
  // Required string parameter
  url: z.string().describe('API endpoint URL'),

  // Optional number with default
  timeout: z
    .number()
    .optional()
    .default(5000)
    .describe('Request timeout in ms'),

  // Optional object
  headers: z.record(z.string()).optional().describe('HTTP headers'),

  // Enum values
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).describe('HTTP method'),

  // Array of strings
  tags: z.array(z.string()).optional().describe('Request tags'),

  // Boolean flag
  validateSsl: z
    .boolean()
    .optional()
    .default(true)
    .describe('Validate SSL certificates'),
});
```

---

## 📁 Configuration Setup

### Method 1: Directory-based Loading (Recommended)

```typescript
// endorphin.config.ts
export default {
  // ... other config

  customTools: [
    './tools', // Load all tools from tools/ directory
    './custom-tools', // Load from multiple directories
    './integrations',
  ],
};
```

Directory structure:

```
your-project/
├── tools/
│   ├── api-tools.ts      # API-related tools
│   ├── database-tools.ts # Database tools
│   └── file-tools.js     # File manipulation tools
├── custom-tools/
│   └── special-tools.js  # Project-specific tools
└── endorphin.config.ts
```

### Method 2: Individual File Loading

```typescript
// endorphin.config.ts
export default {
  // ... other config

  customTools: [
    './tools/api-tools.ts',
    './tools/database-tools.ts',
    './integrations/slack-tools.js',
  ],
};
```

### Method 3: Mixed Configuration

```typescript
// endorphin.config.ts
export default {
  // ... other config

  customTools: [
    './tools', // Load entire directory
    './special/custom-tool.ts', // Load specific file
    './integrations', // Load another directory
  ],
};
```

---

## 🛠 Advanced Tool Examples

### 1. File Operations Tool

```javascript
// tools/file-tools.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export function createFileReadTool(framework) {
  return tool(
    async ({ filePath, encoding = 'utf8' }) => {
      const stepDesc = `Read file: ${filePath}`;
      console.log(`📄 ${stepDesc}`);

      try {
        const absolutePath = path.resolve(filePath);
        const content = await fs.readFile(absolutePath, encoding);

        const result = `File read successfully. Size: ${content.length} characters`;
        framework.logTestStep(
          stepDesc,
          'fileRead',
          { filePath, encoding },
          result,
          true
        );

        return content;
      } catch (error) {
        const errorMsg = `Failed to read file: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'fileRead',
          { filePath, encoding },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'fileRead',
      description: 'Read the contents of a file from the filesystem.',
      schema: z.object({
        filePath: z.string().describe('Path to the file to read'),
        encoding: z
          .string()
          .optional()
          .describe('File encoding (default: utf8)'),
      }),
    }
  );
}

export function createFileWriteTool(framework) {
  return tool(
    async ({ filePath, content, encoding = 'utf8' }) => {
      const stepDesc = `Write file: ${filePath}`;
      console.log(`✏️ ${stepDesc}`);

      try {
        const absolutePath = path.resolve(filePath);
        await fs.writeFile(absolutePath, content, encoding);

        const result = `File written successfully. Size: ${content.length} characters`;
        framework.logTestStep(
          stepDesc,
          'fileWrite',
          { filePath, contentLength: content.length },
          result,
          true
        );

        return result;
      } catch (error) {
        const errorMsg = `Failed to write file: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'fileWrite',
          { filePath, contentLength: content.length },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'fileWrite',
      description: 'Write content to a file on the filesystem.',
      schema: z.object({
        filePath: z.string().describe('Path where to write the file'),
        content: z.string().describe('Content to write to the file'),
        encoding: z
          .string()
          .optional()
          .describe('File encoding (default: utf8)'),
      }),
    }
  );
}
```

### 2. HTTP API Tools

```javascript
// tools/http-tools.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createHttpPostTool(framework) {
  return tool(
    async ({ url, body, headers = {}, timeout = 10000 }) => {
      const stepDesc = `HTTP POST to: ${url}`;
      console.log(`📤 ${stepDesc}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();
        const result = `HTTP POST successful. Status: ${response.status}, Response: ${JSON.stringify(responseData)}`;

        framework.logTestStep(
          stepDesc,
          'httpPost',
          { url, body, headers },
          result,
          response.ok
        );

        return {
          status: response.status,
          data: responseData,
          success: response.ok,
        };
      } catch (error) {
        const errorMsg = `HTTP POST failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'httpPost',
          { url, body, headers },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'httpPost',
      description: 'Send a POST request with JSON data to an HTTP endpoint.',
      schema: z.object({
        url: z.string().describe('The HTTP endpoint URL'),
        body: z.any().describe('The JSON data to send in the request body'),
        headers: z
          .record(z.string())
          .optional()
          .describe('Additional HTTP headers'),
        timeout: z
          .number()
          .optional()
          .describe('Request timeout in milliseconds'),
      }),
    }
  );
}

export function createWebhookTool(framework) {
  return tool(
    async ({ webhookUrl, payload, secret }) => {
      const stepDesc = `Send webhook to: ${webhookUrl}`;
      console.log(`🔗 ${stepDesc}`);

      try {
        const headers = {
          'Content-Type': 'application/json',
        };

        // Add webhook signature if secret provided
        if (secret) {
          const crypto = await import('crypto');
          const signature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
          headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const result = `Webhook sent successfully. Status: ${response.status}`;
        framework.logTestStep(
          stepDesc,
          'webhook',
          { webhookUrl, payload },
          result,
          response.ok
        );

        return result;
      } catch (error) {
        const errorMsg = `Webhook failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'webhook',
          { webhookUrl, payload },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'webhook',
      description:
        'Send a webhook payload to a specified URL with optional signature.',
      schema: z.object({
        webhookUrl: z.string().describe('The webhook URL to send to'),
        payload: z.any().describe('The payload data to send'),
        secret: z
          .string()
          .optional()
          .describe('Secret key for webhook signature'),
      }),
    }
  );
}
```

### 3. Environment & Configuration Tool

```javascript
// tools/env-tools.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createEnvironmentTool(framework) {
  return tool(
    async ({ variable, defaultValue }) => {
      const stepDesc = `Get environment variable: ${variable}`;
      console.log(`🌍 ${stepDesc}`);

      try {
        const value = process.env[variable] || defaultValue;

        if (!value) {
          const errorMsg = `Environment variable ${variable} not found and no default provided`;
          framework.logTestStep(
            stepDesc,
            'getEnv',
            { variable },
            errorMsg,
            false
          );
          throw new Error(errorMsg);
        }

        const result = `Environment variable retrieved: ${variable}=${value}`;
        framework.logTestStep(stepDesc, 'getEnv', { variable }, result, true);

        return value;
      } catch (error) {
        const errorMsg = `Failed to get environment variable: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'getEnv',
          { variable },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'getEnv',
      description: 'Get an environment variable value with optional default.',
      schema: z.object({
        variable: z.string().describe('Name of the environment variable'),
        defaultValue: z
          .string()
          .optional()
          .describe('Default value if variable not found'),
      }),
    }
  );
}

export function createConfigTool(framework) {
  return tool(
    async ({ key, section }) => {
      const stepDesc = `Get config value: ${section ? section + '.' : ''}${key}`;
      console.log(`⚙️ ${stepDesc}`);

      try {
        let value;
        if (section) {
          value = framework.config[section]?.[key];
        } else {
          value = framework.config[key];
        }

        if (value === undefined) {
          const errorMsg = `Configuration key not found: ${section ? section + '.' : ''}${key}`;
          framework.logTestStep(
            stepDesc,
            'getConfig',
            { key, section },
            errorMsg,
            false
          );
          throw new Error(errorMsg);
        }

        const result = `Configuration retrieved: ${JSON.stringify(value)}`;
        framework.logTestStep(
          stepDesc,
          'getConfig',
          { key, section },
          result,
          true
        );

        return value;
      } catch (error) {
        const errorMsg = `Failed to get configuration: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'getConfig',
          { key, section },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'getConfig',
      description: 'Get a configuration value from the Endorphin config.',
      schema: z.object({
        key: z.string().describe('Configuration key name'),
        section: z
          .string()
          .optional()
          .describe('Configuration section (for nested values)'),
      }),
    }
  );
}
```

### 4. Wait & Timing Tools

```javascript
// tools/timing-tools.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createAdvancedWaitTool(framework) {
  return tool(
    async ({ condition, timeout = 30000, interval = 1000, description }) => {
      const stepDesc = description || `Wait for condition: ${condition}`;
      console.log(`⏳ ${stepDesc}`);

      try {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
          try {
            // Evaluate condition in browser context
            const result = await framework.page.evaluate(condition);

            if (result) {
              const successMsg = `Condition met after ${Date.now() - startTime}ms`;
              framework.logTestStep(
                stepDesc,
                'advancedWait',
                { condition, timeout },
                successMsg,
                true
              );
              return successMsg;
            }
          } catch (evalError) {
            // Continue waiting if evaluation fails
          }

          await new Promise((resolve) => setTimeout(resolve, interval));
        }

        const errorMsg = `Timeout waiting for condition after ${timeout}ms`;
        framework.logTestStep(
          stepDesc,
          'advancedWait',
          { condition, timeout },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      } catch (error) {
        const errorMsg = `Advanced wait failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'advancedWait',
          { condition, timeout },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'advancedWait',
      description:
        'Wait for a custom JavaScript condition to become true in the browser.',
      schema: z.object({
        condition: z
          .string()
          .describe('JavaScript expression that should evaluate to true'),
        timeout: z
          .number()
          .optional()
          .describe('Maximum wait time in milliseconds'),
        interval: z
          .number()
          .optional()
          .describe('Check interval in milliseconds'),
        description: z
          .string()
          .optional()
          .describe("Description of what we're waiting for"),
      }),
    }
  );
}

export function createDelayTool(framework) {
  return tool(
    async ({ milliseconds, reason }) => {
      const stepDesc = `Delay for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
      console.log(`⏱️ ${stepDesc}`);

      try {
        await new Promise((resolve) => setTimeout(resolve, milliseconds));

        const result = `Delayed for ${milliseconds}ms successfully`;
        framework.logTestStep(
          stepDesc,
          'delay',
          { milliseconds, reason },
          result,
          true
        );

        return result;
      } catch (error) {
        const errorMsg = `Delay failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'delay',
          { milliseconds, reason },
          errorMsg,
          false
        );
        throw new Error(errorMsg);
      }
    },
    {
      name: 'delay',
      description: 'Add a fixed delay/pause in test execution.',
      schema: z.object({
        milliseconds: z.number().describe('Number of milliseconds to delay'),
        reason: z
          .string()
          .optional()
          .describe('Reason for the delay (for documentation)'),
      }),
    }
  );
}
```

---

## 📝 Best Practices

### 1. Tool Naming Conventions

```javascript
// ✅ Good: Clear, descriptive names
createApiGetTool;
createDatabaseQueryTool;
createFileReadTool;
createSlackNotificationTool;

// ❌ Avoid: Generic or unclear names
createTool;
createHelper;
createUtility;
```

### 2. Error Handling

```javascript
export function createExampleTool(framework) {
  return tool(
    async ({ parameter }) => {
      const stepDesc = `Example operation: ${parameter}`;
      console.log(`🔧 ${stepDesc}`);

      try {
        // Your tool logic here
        const result = await performOperation(parameter);

        // ✅ Always log successful operations
        framework.logTestStep(stepDesc, 'example', { parameter }, result, true);
        return result;
      } catch (error) {
        // ✅ Always log failures
        const errorMsg = `Operation failed: ${error.message}`;
        framework.logTestStep(
          stepDesc,
          'example',
          { parameter },
          errorMsg,
          false
        );

        // ✅ Throw descriptive errors
        throw new Error(errorMsg);
      }
    },
    {
      // Tool configuration...
    }
  );
}
```

### 3. Schema Validation

```javascript
// ✅ Good: Descriptive schema with proper types
schema: z.object({
  url: z.string().url().describe('Valid HTTP URL for the API endpoint'),
  timeout: z
    .number()
    .min(1000)
    .max(60000)
    .optional()
    .describe('Request timeout (1-60 seconds)'),
  retries: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .default(3)
    .describe('Number of retry attempts'),
  headers: z
    .record(z.string())
    .optional()
    .describe('Custom HTTP headers as key-value pairs'),
});

// ❌ Avoid: Minimal or unclear schemas
schema: z.object({
  url: z.string(),
  timeout: z.number().optional(),
});
```

### 4. Documentation

```javascript
/**
 * Creates a tool for sending Slack notifications
 * Requires SLACK_WEBHOOK_URL environment variable
 *
 * @param {Object} framework - Endorphin framework instance
 * @returns {Object} LangChain tool for Slack notifications
 */
export function createSlackNotificationTool(framework) {
  return tool(
    async ({ message, channel, username = 'Endorphin AI' }) => {
      // Implementation...
    },
    {
      name: 'slackNotify',
      description:
        'Send a notification message to a Slack channel via webhook. Useful for test completion alerts or error notifications.',
      schema: z.object({
        message: z.string().describe('The message text to send to Slack'),
        channel: z
          .string()
          .optional()
          .describe('Slack channel name (with or without #)'),
        username: z
          .string()
          .optional()
          .describe('Display name for the bot message'),
      }),
    }
  );
}
```

### 5. Testing Custom Tools

Create dedicated tests for your custom tools:

```javascript
// tests/custom-tool-test.js
export const CUSTOM_TOOL_TEST = {
  id: 'TOOL-001',
  name: 'Custom API Tool Test',
  description: 'Test the custom API tool functionality',
  priority: 'Medium',
  tags: ['custom-tools', 'api'],
  site: 'https://jsonplaceholder.typicode.com',
  testData: {
    apiEndpoint: 'https://jsonplaceholder.typicode.com/users/1',
  },
  task: `
    1. Navigate to the JSONPlaceholder website
    2. Use the custom API tool to fetch user data from the /users/1 endpoint
    3. Verify the response contains user information
    4. Use the file tool to save the response to a temporary file
  `,
};
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Tool Not Loading

**Problem**: Custom tool doesn't appear in available tools

**Solutions**:

```bash
# Check file path is correct
ls -la tools/your-tool.js

# Verify export function format
grep "export function create" tools/your-tool.js

# Check configuration
node -e "console.log(JSON.stringify(require('./endorphin.config.ts').default.customTools, null, 2))"
```

#### 2. Import Errors

**Problem**: `Cannot resolve module` or import errors

**Solutions**:

```javascript
// ✅ Use correct imports at top of file
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// ✅ For Node.js modules, use dynamic imports if needed
const fs = await import('fs/promises');
const path = await import('path');
```

#### 3. Schema Validation Errors

**Problem**: Tool parameters not validating correctly

**Debug**:

```javascript
// Add logging to see what parameters are received
export function createDebugTool(framework) {
  return tool(
    async (params) => {
      console.log('Received parameters:', JSON.stringify(params, null, 2));
      // ... rest of implementation
    },
    {
      // ... tool config
    }
  );
}
```

#### 4. Framework Integration Issues

**Problem**: `framework.page` or other framework methods not available

**Check**:

```javascript
export function createTestTool(framework) {
  return tool(
    async () => {
      // ✅ Verify framework has required properties
      console.log('Framework properties:', Object.keys(framework));
      console.log('Page available:', !!framework.page);
      console.log('Current session:', !!framework.currentTestSession);

      // ... tool implementation
    },
    {
      // ... tool config
    }
  );
}
```

### Debug Mode

Enable debug logging for custom tools:

```bash
# Run with debug flag
npx endorphin run test YOUR-TEST --debug

# Check what tools are loaded
npx endorphin list --debug
```

### Testing Tool Loading

Create a simple test tool to verify everything works:

```javascript
// tools/debug-tool.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createDebugTool(framework) {
  return tool(
    async ({ message }) => {
      console.log(`🐛 Debug Tool: ${message}`);
      framework.logTestStep(
        'Debug Tool Test',
        'debug',
        { message },
        `Debug message: ${message}`,
        true
      );
      return `Debug tool working! Message: ${message}`;
    },
    {
      name: 'debug',
      description: 'Simple debug tool to test custom tool loading.',
      schema: z.object({
        message: z.string().describe('Debug message to display'),
      }),
    }
  );
}
```

Test with:

```javascript
export const DEBUG_TEST = {
  id: 'DEBUG-001',
  name: 'Debug Tool Test',
  description: 'Test that custom tools are loading correctly',
  priority: 'Low',
  tags: ['debug'],
  site: 'https://example.com',
  task: "Navigate to example.com and use the debug tool with message 'Hello Custom Tools!'",
};
```

---

## 🔮 Feature Status

> **⚠️ Implementation Note**: Custom tools feature is currently in development.
> This guide serves as both documentation and specification for the upcoming
> implementation.

**Current Status**: Planning & Design Phase **Target Release**: Next minor
version **Implementation Tasks**:

- [ ] Tool discovery and loading system
- [ ] Configuration parsing for `customTools` array
- [ ] Integration with existing tool system
- [ ] Error handling and validation
- [ ] Documentation and examples

---

_This guide will be updated as the custom tools feature is implemented. Check
back for the latest information and examples._
