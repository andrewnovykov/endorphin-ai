# Custom Tools

This directory contains custom tools for your Endorphin AI project.

## 🛠️ Available Tools

### Login UI Tool (`login-ui-tool.ts`)
A working example tool that demonstrates UI automation for login functionality.

**Features:**
- Login automation with customizable selectors
- Browser session integration
- Error handling for missing elements
- Flexible selector configuration

**Usage in tests:**
```yaml
steps:
  - action: Use login-ui-tool to login with email "user@example.com" and password "password123"
  - action: Use login-ui-tool with custom selectors for your application
```

## 🎯 Using generateData()

The framework includes a built-in data generation utility. Use it OUTSIDE the test case definition:

```typescript
import { TestCase, generateData } from 'endorphin-ai';

// Generate test data outside the test case
const userData = await generateData(framework, {
  email: "string",
  password: "string"
}, "Generate realistic user credentials");

export const MY_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Example Test',
  task: `Login with email ${userData.email} and password ${userData.password}`,
  // ... other properties
};

// Token usage is logged automatically:
// 🪙 Data generation used 156 tokens ($0.0024)
```

## 📝 Creating New Tools

To create a new custom tool:

```bash
npx endorphin create tool my-new-tool --template ui
```

Available templates:
- `basic` - Simple tool template
- `ui` - UI automation tool for browser interactions
- `api` - API testing tool template (Note: API tools will be built-in in future)

## 🔧 Configuration

Your tools are automatically loaded because they're configured in `endorphin.config.ts`:

```typescript
export default {
  // ... other config
  customTools: [
    './tools'  // This directory
  ],
};
```

## 📚 Learn More

- [Custom Tools Guide](https://github.com/andrewnovykov/endorphin-ai#custom-tools)
- [UI Automation Best Practices](https://github.com/andrewnovykov/endorphin-ai#ui-automation)
- [Framework Documentation](https://github.com/andrewnovykov/endorphin-ai#documentation)