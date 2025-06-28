# 🔧 Custom Tools Development Guide

This guide covers everything you need to know about creating, configuring, and using custom tools in Endorphin AI.

## Table of Contents

- [🌟 Overview](#-overview)
- [🚀 Quick Start](#-quick-start)
- [📝 Creating Tools](#-creating-tools)
- [🛠️ Tool Templates](#️-tool-templates)
- [⚙️ Configuration](#️-configuration)
- [✅ Validation & Testing](#-validation--testing)
- [🐛 Error Handling](#-error-handling)
- [📖 Best Practices](#-best-practices)
- [🎯 Examples](#-examples)
- [🔍 Troubleshooting](#-troubleshooting)

## 🌟 Overview

Custom tools extend Endorphin AI's capabilities by allowing you to create your own AI-powered testing functionality. Tools are TypeScript functions that integrate seamlessly with the framework's AI agents.

### Key Features

- ✅ **TypeScript-first** - Full type safety and IntelliSense support
- ✅ **LangChain integration** - Compatible with AI agents and tool calling
- ✅ **Schema validation** - Zod-based input validation
- ✅ **Framework access** - Direct access to browser automation and logging
- ✅ **Error handling** - Comprehensive error reporting and recovery
- ✅ **Hot reload** - Changes detected automatically during development

### Use Cases

- **API Testing** - Validate REST APIs, GraphQL endpoints, webhooks
- **Database Operations** - Query databases, validate data integrity
- **File Operations** - Read/write files, process CSV/JSON data
- **Custom Validations** - Business logic validation, data transformation
- **Third-party Integrations** - Connect to external services and tools

## 🚀 Quick Start

### 1. Initialize Project with Custom Tools

```bash
# Create a new project with custom tools included
npx endorphin-ai init

# This creates:
# ├── tools/
# │   ├── jsonplaceholder-api.ts    # Working API tool example
# │   └── README.md                 # Getting started guide
# └── endorphin.config.ts           # Configuration with customTools enabled
```

### 2. Create Your First Tool

```bash
# Create a basic tool
npx endorphin create tool my-first-tool

# Create from template
npx endorphin create tool api-validator --template api
```

### 3. Validate and Test

```bash
# Validate all tools
npx endorphin validate tools

# List available tools
npx endorphin list tools --verbose
```

### 4. Use in Tests

```typescript
// tests/my-test.ts
export const API_TEST: TestCase = {
  id: 'API-001',
  name: 'Test Custom API Tool',
  task: `
    Use the jsonplaceholder-api tool to:
    1. Get user data from /users/1
    2. Validate the response contains name and email
    3. Verify the user ID matches the request
  `,
};
```

## 📝 Creating Tools

### Basic Tool Structure

Every custom tool is a TypeScript function that returns a LangChain-compatible tool:

```typescript
// tools/example-tool.ts
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createExampleTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'example-tool',
    description: 'An example custom tool',
    schema: z.object({
      input: z.string().describe('Input parameter'),
      options: z.object({
        timeout: z.number().default(5000),
      }).optional(),
    }),
    call: async ({ input, options = {} }) => {
      // Log the action for debugging
      framework.logTestStep(`Example tool called with: ${input}`);
      
      // Your tool logic here
      const result = await processInput(input, options);
      
      // Return structured result
      return {
        success: true,
        result,
        message: `Processed: ${input}`,
      };
    },
  };
}

async function processInput(input: string, options: any) {
  // Implementation details
  return `Processed: ${input}`;
}
```

### Tool Function Naming

Tools are discovered by their function names. Use one of these patterns:

```typescript
// ✅ Recommended patterns (automatically discovered)
export function createMyTool(framework) { /* ... */ }
export function createApiValidatorTool(framework) { /* ... */ }
export function createDatabaseTool(framework) { /* ... */ }

// ✅ Default export (also discovered)
export default function(framework) { /* ... */ }

// ❌ Not discovered (wrong naming pattern)
export function myTool(framework) { /* ... */ }
export function validateApi(framework) { /* ... */ }
```

### Schema Definition

Use Zod schemas for input validation and auto-generated documentation:

```typescript
import { z } from 'zod';

const schema = z.object({
  // Required string parameter
  endpoint: z.string().describe('API endpoint to test'),
  
  // Enum with default value
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  
  // Optional parameters
  headers: z.record(z.string()).optional().describe('HTTP headers'),
  
  // Nested objects
  validation: z.object({
    status: z.number().default(200),
    required_fields: z.array(z.string()).default([]),
  }).optional(),
  
  // Union types
  body: z.union([
    z.string(),
    z.object({}),
    z.array(z.any()),
  ]).optional(),
});
```

### Framework Access

The framework parameter provides access to browser automation and utilities:

```typescript
export function createBrowserTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'browser-helper',
    description: 'Browser automation helper',
    schema: z.object({
      action: z.enum(['screenshot', 'navigate', 'wait']),
      target: z.string().optional(),
    }),
    call: async ({ action, target }) => {
      switch (action) {
        case 'screenshot':
          const screenshot = await framework.takeStepScreenshot();
          framework.logTestStep('Screenshot taken');
          return { screenshot, message: 'Screenshot captured' };
          
        case 'navigate':
          if (!target) throw new Error('Target URL required for navigation');
          await framework.currentPage?.goto(target);
          framework.logTestStep(`Navigated to ${target}`);
          return { url: target, message: `Navigated to ${target}` };
          
        case 'wait':
          const duration = parseInt(target || '1000');
          await new Promise(resolve => setTimeout(resolve, duration));
          framework.logTestStep(`Waited ${duration}ms`);
          return { duration, message: `Waited ${duration}ms` };
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
  };
}
```

## 🛠️ Tool Templates

Endorphin AI provides templates to quickly create common tool types:

### Basic Template

```bash
npx endorphin create tool my-tool --template basic
```

Creates a minimal tool structure with:
- Basic input validation
- Simple processing logic
- Error handling
- Documentation comments

### API Template

```bash
npx endorphin create tool api-validator --template api
```

Creates an API testing tool with:
- HTTP request handling
- Response validation
- Status code checking
- JSON parsing
- Header management

### UI Template

```bash
npx endorphin create tool ui-helper --template ui
```

Creates a UI automation tool with:
- Element selection
- User interactions
- Screenshot capabilities
- Page navigation
- Wait conditions

### Template Customization

Templates use placeholder variables that get replaced:

```typescript
// Template: {{TOOL_NAME}} → my-validator
// Template: {{TOOL_NAME_PASCAL}} → MyValidator
// Template: {{TOOL_DESCRIPTION}} → My Validator Tool
```

## ⚙️ Configuration

### Project Configuration

Add custom tools to your `endorphin.config.ts`:

```typescript
import type { FrameworkConfig } from 'endorphin-ai';

const config: FrameworkConfig = {
  // Enable all tools from directory
  customTools: ['./tools'],
  
  // Multiple directories
  customTools: [
    './tools',
    './shared-tools',
    './project-specific-tools',
  ],
  
  // Specific files
  customTools: [
    './tools/api-validator.ts',
    './tools/database-helper.ts',
  ],
  
  // Mixed approach
  customTools: [
    './tools',              // All tools in directory
    './external/special-tool.ts', // Specific file
  ],
  
  // Other configuration...
  openaiApiKey: process.env.OPENAI_API_KEY,
  testDirectory: './tests',
};

export default config;
```

### Tool Discovery

Tools are discovered automatically from configured paths:

```bash
# Directory structure
tools/
├── api-tools.ts          # ✅ Discovered
├── database/
│   ├── postgres.ts       # ✅ Discovered (recursive)
│   └── mongo.ts          # ✅ Discovered
├── validation.ts         # ✅ Discovered
├── helper.test.ts        # ❌ Ignored (test file)
├── README.md             # ❌ Ignored (not .ts/.js/.mjs)
└── node_modules/         # ❌ Ignored (excluded directory)
```

### Environment Variables

Tools can access environment variables and configuration:

```typescript
export function createDatabaseTool(framework: EnhancedBrowserTestFramework) {
  const config = framework.frameworkConfig;
  
  return {
    name: 'database-connector',
    description: 'Connect to database',
    schema: z.object({
      query: z.string(),
    }),
    call: async ({ query }) => {
      // Access environment variables
      const dbUrl = process.env.DATABASE_URL;
      
      // Access framework configuration  
      const testData = config.testData;
      
      // Your database logic here
      return { result: 'Database query executed' };
    },
  };
}
```

## ✅ Validation & Testing

### Tool Validation

Validate tools during development:

```bash
# Validate all tools
npx endorphin validate tools

# Output includes:
# ✅ Successfully loaded tools:
#    - api-validator: API endpoint validation
#    - database-helper: Database operations
# 
# 📊 Validation Summary:
#    Configured paths: 1
#    Files scanned: 5
#    Tools loaded: 2
#    Total errors: 0
```

### Validation with Errors

When validation fails, you get detailed error information:

```bash
npx endorphin validate tools

# ❌ Validation Errors:
# 
# TOOL_VALIDATION_ERROR (1 errors):
#   - Invalid tool structure: Tool must have a string name property
#     File: ./tools/broken-tool.ts
#     Function: createBrokenTool
# 
# TOOL_CONFLICT_ERROR (1 errors):
#   - Tool name conflict: api-validator already exists
#     File: ./tools/duplicate-tool.ts
#     Function: createApiValidatorTool
```

### Listing Tools

See all available tools (built-in + custom):

```bash
# Basic list
npx endorphin list tools

# 🔧 Built-in Tools:
#    - navigate: Navigate to a URL
#    - click: Click on an element
#    - fill: Fill in a form field
# 
# 🔧 Custom Tools:
#    - api-validator: Validate API responses
#    - database-helper: Database operations

# Detailed information
npx endorphin list tools --verbose

# Shows schemas, file paths, and statistics
```

### Manual Testing

Test tools directly in your code:

```typescript
// tools/test-my-tool.ts (development only)
import { createMyTool } from './my-tool.js';

// Create mock framework for testing
const mockFramework = {
  logTestStep: (step: string) => console.log(`LOG: ${step}`),
  takeStepScreenshot: async () => null,
  currentPage: null,
  frameworkConfig: {},
} as any;

// Test the tool
const tool = createMyTool(mockFramework);

async function testTool() {
  try {
    const result = await tool.call({
      input: 'test data',
    });
    console.log('Tool result:', result);
  } catch (error) {
    console.error('Tool error:', error);
  }
}

testTool();
```

## 🐛 Error Handling

### Tool Error Types

The framework provides structured error handling:

```typescript
import { ToolValidationError, ToolExecutionError } from 'endorphin-ai';

export function createRobustTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'robust-tool',
    description: 'Tool with comprehensive error handling',
    schema: z.object({
      input: z.string(),
    }),
    call: async ({ input }) => {
      try {
        // Validate inputs
        if (!input || input.trim().length === 0) {
          throw new ToolValidationError('Input cannot be empty', {
            input,
            toolName: 'robust-tool',
          });
        }
        
        // Process with error handling
        const result = await processWithRetry(input);
        
        framework.logTestStep(`Successfully processed: ${input}`);
        return { success: true, result };
        
      } catch (error) {
        // Log the error
        framework.logTestStep(`Error processing ${input}: ${error.message}`);
        
        // Re-throw with context
        if (error instanceof ToolValidationError) {
          throw error; // Re-throw validation errors as-is
        }
        
        throw new ToolExecutionError(`Failed to process input: ${error.message}`, {
          input,
          originalError: error.name,
          toolName: 'robust-tool',
        });
      }
    },
  };
}

async function processWithRetry(input: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await riskyOperation(input);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      );
    }
  }
}
```

### Error Recovery

Tools can implement fallback strategies:

```typescript
export function createResilientTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'resilient-tool',
    description: 'Tool with fallback strategies',
    schema: z.object({
      endpoint: z.string(),
      fallback_endpoint: z.string().optional(),
    }),
    call: async ({ endpoint, fallback_endpoint }) => {
      try {
        // Primary strategy
        return await primaryMethod(endpoint);
      } catch (primaryError) {
        framework.logTestStep(`Primary method failed: ${primaryError.message}`);
        
        if (fallback_endpoint) {
          try {
            // Fallback strategy
            framework.logTestStep(`Trying fallback endpoint: ${fallback_endpoint}`);
            return await fallbackMethod(fallback_endpoint);
          } catch (fallbackError) {
            throw new ToolExecutionError(
              `Both primary and fallback methods failed`,
              {
                primaryError: primaryError.message,
                fallbackError: fallbackError.message,
                endpoint,
                fallback_endpoint,
              }
            );
          }
        }
        
        throw primaryError;
      }
    },
  };
}
```

### Debugging Tools

Add debugging capabilities to your tools:

```typescript
export function createDebugTool(framework: EnhancedBrowserTestFramework) {
  const isDebug = process.env.DEBUG === 'true';
  
  return {
    name: 'debug-tool',
    description: 'Tool with debugging support',
    schema: z.object({
      action: z.string(),
      debug: z.boolean().default(false),
    }),
    call: async ({ action, debug }) => {
      const enableDebug = debug || isDebug;
      
      if (enableDebug) {
        framework.logTestStep(`DEBUG: Starting action: ${action}`);
        console.log('Debug info:', { action, timestamp: new Date().toISOString() });
      }
      
      try {
        const result = await performAction(action);
        
        if (enableDebug) {
          framework.logTestStep(`DEBUG: Action completed successfully`);
          console.log('Debug result:', result);
        }
        
        return result;
      } catch (error) {
        if (enableDebug) {
          framework.logTestStep(`DEBUG: Action failed: ${error.message}`);
          console.error('Debug error:', error);
        }
        throw error;
      }
    },
  };
}
```

## 📖 Best Practices

### 1. Tool Design Principles

**Single Responsibility**
```typescript
// ✅ Good - focused responsibility
export function createEmailValidatorTool(framework) {
  return {
    name: 'email-validator',
    description: 'Validate email addresses',
    // ... focused on email validation only
  };
}

// ❌ Bad - too many responsibilities  
export function createUtilityTool(framework) {
  return {
    name: 'utility-tool',
    description: 'Does everything - email, database, API, files',
    // ... trying to do too much
  };
}
```

**Clear Naming**
```typescript
// ✅ Good - clear, descriptive names
createDatabaseQueryTool
createRestApiValidatorTool
createCsvFileParserTool

// ❌ Bad - vague or confusing names
createHelperTool
createUtilTool
createStuffTool
```

**Comprehensive Schemas**
```typescript
// ✅ Good - detailed schema with descriptions
const schema = z.object({
  endpoint: z.string()
    .url()
    .describe('Full URL of the API endpoint to test'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE'])
    .default('GET')
    .describe('HTTP method to use'),
  headers: z.record(z.string())
    .optional()
    .describe('Optional HTTP headers as key-value pairs'),
});

// ❌ Bad - minimal schema without descriptions
const schema = z.object({
  url: z.string(),
  method: z.string(),
});
```

### 2. Error Handling

**Graceful Degradation**
```typescript
export function createRobustApiTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'robust-api-tool',
    description: 'API tool with graceful error handling',
    schema: z.object({
      endpoint: z.string(),
      timeout: z.number().default(5000),
    }),
    call: async ({ endpoint, timeout }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(endpoint, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Return structured error info instead of throwing
          return {
            success: false,
            status: response.status,
            error: `HTTP ${response.status}: ${response.statusText}`,
            endpoint,
          };
        }
        
        const data = await response.json();
        return {
          success: true,
          status: response.status,
          data,
          endpoint,
        };
        
      } catch (error) {
        // Handle different error types gracefully
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: `Request timeout after ${timeout}ms`,
            endpoint,
          };
        }
        
        return {
          success: false,
          error: error.message,
          endpoint,
        };
      }
    },
  };
}
```

**Meaningful Error Messages**
```typescript
// ✅ Good - specific, actionable error messages
if (!response.ok) {
  throw new Error(
    `API request failed: ${response.status} ${response.statusText}. ` +
    `Check the endpoint URL and authentication. ` +
    `Response: ${await response.text()}`
  );
}

// ❌ Bad - vague error message
if (!response.ok) {
  throw new Error('Request failed');
}
```

### 3. Performance Optimization

**Async/Await Best Practices**
```typescript
// ✅ Good - parallel operations when possible
export function createParallelTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'parallel-checker',
    description: 'Check multiple endpoints in parallel',
    schema: z.object({
      endpoints: z.array(z.string()),
    }),
    call: async ({ endpoints }) => {
      // Process all endpoints in parallel
      const promises = endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint);
          return { endpoint, status: response.status, success: true };
        } catch (error) {
          return { endpoint, error: error.message, success: false };
        }
      });
      
      const results = await Promise.all(promises);
      
      return {
        total: endpoints.length,
        successful: results.filter(r => r.success).length,
        results,
      };
    },
  };
}

// ❌ Bad - sequential operations
export function createSequentialTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'sequential-checker',
    description: 'Check endpoints one by one',
    call: async ({ endpoints }) => {
      const results = [];
      
      // Inefficient - processes one at a time
      for (const endpoint of endpoints) {
        const result = await fetch(endpoint);
        results.push(result);
      }
      
      return results;
    },
  };
}
```

**Resource Management**
```typescript
export function createResourceAwareTool(framework: EnhancedBrowserTestFramework) {
  // Reuse connections when possible
  const httpAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 10,
  });
  
  return {
    name: 'resource-aware-tool',
    description: 'Tool that manages resources efficiently',
    call: async ({ endpoint }) => {
      try {
        const response = await fetch(endpoint, {
          agent: httpAgent, // Reuse connections
        });
        
        return await response.json();
      } finally {
        // Clean up resources when needed
        // httpAgent.destroy() // Only when completely done
      }
    },
  };
}
```

### 4. Testing and Validation

**Unit Testing Your Tools**
```typescript
// tools/__tests__/my-tool.test.ts
import { createMyTool } from '../my-tool.js';

describe('MyTool', () => {
  const mockFramework = {
    logTestStep: jest.fn(),
    takeStepScreenshot: jest.fn().mockResolvedValue(null),
    currentPage: null,
    frameworkConfig: {},
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate input correctly', async () => {
    const tool = createMyTool(mockFramework);
    
    await expect(
      tool.call({ input: '' })
    ).rejects.toThrow('Input cannot be empty');
  });

  it('should process valid input', async () => {
    const tool = createMyTool(mockFramework);
    
    const result = await tool.call({ input: 'test data' });
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('test data');
    expect(mockFramework.logTestStep).toHaveBeenCalled();
  });
});
```

**Integration Testing**
```typescript
// Create a simple test to verify tool integration
export const TOOL_TEST: TestCase = {
  id: 'TOOL-001',
  name: 'Test Custom Tool Integration',
  description: 'Verify custom tools work in real test execution',
  task: `
    Use the api-validator tool to test the JSONPlaceholder API:
    1. Call GET /users/1
    2. Verify the response contains user data
    3. Check that the status is 200
  `,
};
```

## 🎯 Examples

### Example 1: API Testing Tool

```typescript
// tools/api-testing-tool.ts
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createApiTestingTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'api-tester',
    description: 'Comprehensive API testing and validation',
    schema: z.object({
      endpoint: z.string().url().describe('API endpoint URL'),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
      headers: z.record(z.string()).optional(),
      body: z.any().optional(),
      expected_status: z.number().default(200),
      expected_fields: z.array(z.string()).default([]),
      timeout: z.number().default(10000),
    }),
    call: async ({
      endpoint,
      method,
      headers = {},
      body,
      expected_status,
      expected_fields,
      timeout,
    }) => {
      framework.logTestStep(`Testing ${method} ${endpoint}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        };
        
        if (body && method !== 'GET') {
          options.body = JSON.stringify(body);
        }
        
        const response = await fetch(endpoint, options);
        clearTimeout(timeoutId);
        
        const responseData = await response.json();
        
        // Validate status code
        if (response.status !== expected_status) {
          throw new Error(
            `Expected status ${expected_status}, got ${response.status}`
          );
        }
        
        // Validate required fields
        for (const field of expected_fields) {
          if (!(field in responseData)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        framework.logTestStep(
          `✅ API test passed: ${method} ${endpoint} returned ${response.status}`
        );
        
        return {
          success: true,
          status: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
          validation: {
            status_check: true,
            field_checks: expected_fields.map(field => ({
              field,
              present: field in responseData,
            })),
          },
        };
        
      } catch (error) {
        framework.logTestStep(`❌ API test failed: ${error.message}`);
        
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        
        throw error;
      }
    },
  };
}
```

### Example 2: Database Tool

```typescript
// tools/database-tool.ts
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createDatabaseTool(framework: EnhancedBrowserTestFramework) {
  // Mock database for this example - replace with real database connection
  const mockDatabase = new Map<string, any>();
  
  return {
    name: 'database-operations',
    description: 'Database operations for testing',
    schema: z.object({
      operation: z.enum(['create', 'read', 'update', 'delete', 'query']),
      table: z.string().describe('Database table name'),
      data: z.any().optional().describe('Data for create/update operations'),
      id: z.string().optional().describe('Record ID for read/update/delete'),
      query: z.string().optional().describe('SQL query for custom operations'),
    }),
    call: async ({ operation, table, data, id, query }) => {
      framework.logTestStep(`Database ${operation} on table: ${table}`);
      
      const key = `${table}:${id}`;
      
      try {
        switch (operation) {
          case 'create':
            if (!data) throw new Error('Data required for create operation');
            const newId = Date.now().toString();
            const newRecord = { id: newId, ...data, created_at: new Date() };
            mockDatabase.set(`${table}:${newId}`, newRecord);
            
            framework.logTestStep(`✅ Created record with ID: ${newId}`);
            return {
              success: true,
              operation: 'create',
              id: newId,
              record: newRecord,
            };
            
          case 'read':
            if (!id) throw new Error('ID required for read operation');
            const record = mockDatabase.get(key);
            
            if (!record) {
              throw new Error(`Record not found: ${key}`);
            }
            
            framework.logTestStep(`✅ Found record: ${id}`);
            return {
              success: true,
              operation: 'read',
              id,
              record,
            };
            
          case 'update':
            if (!id || !data) {
              throw new Error('ID and data required for update operation');
            }
            
            const existing = mockDatabase.get(key);
            if (!existing) {
              throw new Error(`Record not found for update: ${key}`);
            }
            
            const updated = { ...existing, ...data, updated_at: new Date() };
            mockDatabase.set(key, updated);
            
            framework.logTestStep(`✅ Updated record: ${id}`);
            return {
              success: true,
              operation: 'update',
              id,
              record: updated,
            };
            
          case 'delete':
            if (!id) throw new Error('ID required for delete operation');
            
            if (!mockDatabase.has(key)) {
              throw new Error(`Record not found for delete: ${key}`);
            }
            
            mockDatabase.delete(key);
            
            framework.logTestStep(`✅ Deleted record: ${id}`);
            return {
              success: true,
              operation: 'delete',
              id,
            };
            
          case 'query':
            if (!query) throw new Error('Query required for query operation');
            
            // Simple query simulation - in real implementation, execute SQL
            const allRecords = Array.from(mockDatabase.entries())
              .filter(([k]) => k.startsWith(`${table}:`))
              .map(([, v]) => v);
              
            framework.logTestStep(`✅ Query executed, found ${allRecords.length} records`);
            return {
              success: true,
              operation: 'query',
              query,
              count: allRecords.length,
              records: allRecords,
            };
            
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        framework.logTestStep(`❌ Database operation failed: ${error.message}`);
        throw error;
      }
    },
  };
}
```

### Example 3: File Operations Tool

```typescript
// tools/file-operations-tool.ts
import { z } from 'zod';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { dirname, resolve } from 'path';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createFileOperationsTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'file-operations',
    description: 'File system operations for testing',
    schema: z.object({
      operation: z.enum(['read', 'write', 'exists', 'create-dir']),
      path: z.string().describe('File or directory path'),
      content: z.string().optional().describe('Content for write operations'),
      encoding: z.string().default('utf8').describe('File encoding'),
    }),
    call: async ({ operation, path, content, encoding }) => {
      framework.logTestStep(`File operation: ${operation} on ${path}`);
      
      const resolvedPath = resolve(path);
      
      try {
        switch (operation) {
          case 'read':
            const fileContent = await readFile(resolvedPath, encoding);
            
            framework.logTestStep(`✅ Read file: ${path} (${fileContent.length} chars)`);
            return {
              success: true,
              operation: 'read',
              path: resolvedPath,
              content: fileContent,
              size: fileContent.length,
            };
            
          case 'write':
            if (content === undefined) {
              throw new Error('Content required for write operation');
            }
            
            // Ensure directory exists
            await mkdir(dirname(resolvedPath), { recursive: true });
            
            await writeFile(resolvedPath, content, encoding);
            
            framework.logTestStep(`✅ Wrote file: ${path} (${content.length} chars)`);
            return {
              success: true,
              operation: 'write',
              path: resolvedPath,
              size: content.length,
            };
            
          case 'exists':
            try {
              await access(resolvedPath);
              framework.logTestStep(`✅ File exists: ${path}`);
              return {
                success: true,
                operation: 'exists',
                path: resolvedPath,
                exists: true,
              };
            } catch {
              framework.logTestStep(`ℹ️ File does not exist: ${path}`);
              return {
                success: true,
                operation: 'exists',
                path: resolvedPath,
                exists: false,
              };
            }
            
          case 'create-dir':
            await mkdir(resolvedPath, { recursive: true });
            
            framework.logTestStep(`✅ Created directory: ${path}`);
            return {
              success: true,
              operation: 'create-dir',
              path: resolvedPath,
            };
            
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        framework.logTestStep(`❌ File operation failed: ${error.message}`);
        throw error;
      }
    },
  };
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Tool Not Discovered

**Problem**: Tool functions not being found during validation.

**Solutions**:
```typescript
// ✅ Correct function naming patterns
export function createMyTool(framework) { /* ... */ }  // Discovered
export function createApiToolTool(framework) { /* ... */ }  // Discovered
export default function(framework) { /* ... */ }  // Discovered

// ❌ Incorrect naming patterns
export function myTool(framework) { /* ... */ }  // Not discovered
export const tool = (framework) => { /* ... */ }  // Not discovered
```

#### 2. Module Import Errors

**Problem**: TypeScript compilation or import errors.

**Solutions**:
```typescript
// ✅ Correct imports
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

// ✅ Proper file extension in imports (for other local files)
import { helper } from './helper.js';  // Note: .js extension in TypeScript

// ❌ Common mistakes
import { z } from 'zod/lib';  // Wrong zod import
import { EnhancedBrowserTestFramework } from 'endorphin-ai';  // Missing 'type'
import { helper } from './helper';  // Missing .js extension
```

#### 3. Schema Validation Errors

**Problem**: Input validation failing or not working as expected.

**Solutions**:
```typescript
// ✅ Comprehensive schema with descriptions
const schema = z.object({
  endpoint: z.string().url().describe('Valid URL required'),
  timeout: z.number().min(100).max(30000).default(5000),
  retries: z.number().int().min(0).max(5).default(3),
});

// ✅ Handle validation errors gracefully
call: async (input) => {
  try {
    const validated = schema.parse(input);
    return await processInput(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
  }
}
```

#### 4. Runtime Errors

**Problem**: Tools throwing unhandled errors during execution.

**Solutions**:
```typescript
// ✅ Comprehensive error handling
call: async ({ endpoint }) => {
  try {
    const response = await fetch(endpoint);
    return await response.json();
  } catch (error) {
    // Handle different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${endpoint}`);
    }
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout while connecting to ${endpoint}`);
    }
    
    throw new Error(`Unexpected error: ${error.message}`);
  }
}
```

### Debugging Tips

#### 1. Enable Debug Logging

```bash
# Enable debug mode
DEBUG=true npx endorphin validate tools

# Or in your tool code
const isDebug = process.env.DEBUG === 'true';
if (isDebug) {
  console.log('Debug info:', { input, timestamp: new Date() });
}
```

#### 2. Test Tools in Isolation

```typescript
// Create a minimal test script
import { createMyTool } from './tools/my-tool.js';

const mockFramework = {
  logTestStep: console.log,
  takeStepScreenshot: async () => null,
  currentPage: null,
  frameworkConfig: {},
} as any;

const tool = createMyTool(mockFramework);

// Test with different inputs
async function test() {
  try {
    const result = await tool.call({ test: 'input' });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

#### 3. Validate Configuration

```bash
# Check tool discovery
npx endorphin list tools --verbose

# Validate specific configuration
npx endorphin validate tools
```

#### 4. Check File Permissions

```bash
# Ensure tool files are readable
ls -la tools/
chmod +r tools/*.ts
```

### Getting Help

If you're still having issues:

1. **Check the Console Output**: Tool validation provides detailed error messages
2. **Review the Examples**: Compare your code with working examples
3. **Test in Isolation**: Create minimal test cases to isolate the problem
4. **Check Dependencies**: Ensure all imports and dependencies are correct
5. **Open an Issue**: If you found a bug, report it on GitHub

---

## 🎉 Conclusion

Custom tools in Endorphin AI provide a powerful way to extend your testing capabilities. With proper implementation, validation, and error handling, you can create robust, reusable tools that integrate seamlessly with AI-powered testing.

Remember to:
- ✅ Follow TypeScript best practices
- ✅ Implement comprehensive error handling
- ✅ Use descriptive schemas and documentation
- ✅ Test your tools thoroughly
- ✅ Keep tools focused and single-purpose

Happy testing! 🚀