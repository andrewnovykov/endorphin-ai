# Custom Tools

This directory contains custom tools for your Endorphin AI project.

## 🛠️ Available Tools

### JSONPlaceholder API Tool (`jsonplaceholder-api.ts`)
A working example tool that demonstrates API testing with a real public service.

**Features:**
- Test JSONPlaceholder API endpoints (posts, users, comments, etc.)
- Support for GET, POST, PUT, DELETE methods
- Automatic error handling and logging
- Real API responses for testing

**Usage in tests:**
```yaml
steps:
  - action: Get all posts from JSONPlaceholder API using /posts endpoint
  - action: Get user with ID 1 using /users/1 endpoint  
  - action: Create a new post with title "My Test Post" and body "This is a test post"
  - action: Update post 1 with new title "Updated Post"
```

## 📝 Creating New Tools

To create a new custom tool:

```bash
npx endorphin create tool my-new-tool --template basic
```

Available templates:
- `basic` - Simple tool template
- `ui` - UI automation tool for browser interactions
- `api` - API testing tool template

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
- [Tool Development Documentation](https://github.com/andrewnovykov/endorphin-ai#tool-development)
- [API Examples](https://github.com/andrewnovykov/endorphin-ai#api-testing)