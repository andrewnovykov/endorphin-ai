# Custom Tools

This directory contains custom tools for your Endorphin AI tests. Custom tools extend the framework's capabilities with specialized functionality for your application.

## What are Custom Tools?

Custom tools are JavaScript/TypeScript functions that the AI agent can call during test execution. They provide domain-specific functionality beyond the built-in tools like `navigate`, `click`, and `fill`.

## Example Tools

### `login-ui-tool.ts`
A login tool that handles common authentication flows:
- Supports customizable field selectors
- Handles various login page layouts
- Provides detailed logging and error handling

## Creating Your Own Tools

### 1. Tool Structure
```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createMyTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: { /* your parameters */ }) => {
      // Your tool implementation
      const page = framework.currentPage;
      // ... tool logic
      return 'Tool result message';
    },
    {
      name: 'my-tool',
      description: 'Description of what your tool does',
      schema: z.object({
        // Define your parameters with Zod schema
        param1: z.string().describe('Description of param1'),
        param2: z.number().optional().describe('Optional parameter'),
      }),
    }
  );
}
```

### 2. Tool Guidelines

**Function Naming**: Export functions named `createXxxTool` where `Xxx` describes the tool's purpose.

**Error Handling**: Always include try-catch blocks and use `framework.logTestStep()` for logging.

**Page Access**: Use `framework.currentPage` to access the Playwright page object.

**Screenshots**: Take screenshots at key moments using `framework.takeStepScreenshot()`.

**Return Values**: Return descriptive strings about what the tool accomplished.

### 3. Common Patterns

**Form Interaction**:
```typescript
// Fill form fields
await page.locator('#username').fill(params.username);
await page.locator('#email').fill(params.email);

// Submit form
await page.locator('button[type="submit"]').click();
```

**Wait for Elements**:
```typescript
// Wait for element to appear
await page.locator('.success-message').waitFor();

// Wait for navigation
await page.waitForURL('**/dashboard');
```

**Data Extraction**:
```typescript
// Extract text content
const result = await page.locator('.result').textContent();

// Extract multiple elements
const items = await page.locator('.item').allTextContents();
```

## Using Tools in Tests

Once created, tools are automatically discovered and available to the AI agent:

```typescript
// In your test file
export default {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test user login functionality',
  task: `
    Navigate to https://my-app.com/login
    Use the login tool with email "user@example.com" and password "securepassword123"
    Verify the user is redirected to the dashboard
  `
};
```

## Tool Development Tips

1. **Start Simple**: Begin with basic functionality and add complexity gradually
2. **Test Thoroughly**: Create tests specifically for your custom tools
3. **Document Well**: Add clear descriptions and parameter documentation
4. **Handle Errors**: Provide meaningful error messages for troubleshooting
5. **Use TypeScript**: Take advantage of type safety for better development experience

## Creating New Tools

Use the CLI to generate new tool templates:

```bash
# Create a new UI automation tool
npx endorphin create tool my-tool --template ui

# Create a basic tool
npx endorphin create tool my-tool --template basic
```

## Configuration

Your tools are automatically loaded because they're configured in `endorphin.config.ts`:

```typescript
export default {
  // ... other config
  customTools: [
    './tools'  // This directory
  ],
};
```

## Learn More

Check out the Endorphin AI documentation for more examples and advanced tool development patterns.