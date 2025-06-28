# Custom Tools Examples

This directory contains examples of custom tools for Endorphin AI.

## Available Example Tools

### 1. API Testing Tool (`api-tool.ts`)
- Makes HTTP requests (GET, POST, PUT, DELETE)
- Validates API responses
- Logs API interactions as test steps

### 2. File Operations Tools (`file-tool.ts`)
- `read-file`: Read file contents
- `write-file`: Write content to files
- Useful for test data management

## Using Custom Tools

1. Copy these tools to your project
2. Add them to your `endorphin.config.ts`:

```typescript
export default {
  customTools: [
    './custom-tools/api-tool.ts',
    './custom-tools/file-tool.ts',
  ],
  // ... other config
};
```

3. The AI agent can now use these tools in your tests:

```yaml
steps:
  - action: Make a GET request to https://api.example.com/users
  - action: Read the test data from ./test-data/users.json
  - action: Write the API response to ./results/api-response.json
```

## Creating Your Own Tools

Follow the pattern in these examples:

1. Import required dependencies
2. Create a function that accepts the framework instance
3. Return a LangChain tool with:
   - Implementation function
   - Name and description
   - Zod schema for parameters
4. Log test steps using `framework.logTestStep()`

See the [Custom Tools Guide](../../doc/guides/custom-tools-guide.md) for detailed documentation.