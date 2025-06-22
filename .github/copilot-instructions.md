# GitHub Copilot Instructions for Endorphin AI

## Project Context
This is Endorphin AI - a natural language browser testing framework that uses AI to execute test instructions written in plain English.

## Code Style & Patterns
- Use ES6+ modules with `import/export`
- Prefer async/await over promises
- Use descriptive variable names
- Add JSDoc comments for functions
- Use consistent error handling with try/catch

## Framework Architecture
- `bin/endorphin.js` - CLI entry point
- `framework/test-framework.js` - Main framework
- `framework/core/` - Core utilities (config, discovery, etc.)
- `examples/` - User examples and templates
- `dev-tests/` - Vitest test files

## Configuration System
- Uses `endorphin.config.js` in user project root
- Config structure follows the pattern in `examples/endorphin.config.js`
- CLI flags override config file settings
- Support for multiple environments (dev, staging, prod)

## Test File Format
Users create test files with this structure:
```javascript
export const TEST_ID = {
  id: "TEST-001",
  name: "Test Name",
  description: "What this test does",
  priority: "High|Medium|Low",
  tags: ["tag1", "tag2"],
  site: "https://example.com",
  testData: { /* any test data */ },
  task: "Natural language instructions for the AI"
};
```

## CLI Commands
- `endorphin run test TEST-ID` - Run specific test
- `endorphin run test --tag smoke` - Run by tag
- `endorphin run test --priority High` - Run by priority
- `endorphin run test all` - Run all tests
- `endorphin run test-recorder` - Start test recorder
- `endorphin list` - List available tests

## Dependencies
- Core: Playwright for browser automation
- Testing: Vitest for framework tests
- AI: OpenAI API for natural language processing
- Config: Custom config loader in `framework/core/config-loader.js`

## Do NOT suggest:
- Complex programmatic test writing (users write simple objects)
- Importing framework code in user tests
- Creating test files in framework directory
- Using Jest (we use Vitest)
- Adding dependencies without discussion

## DO suggest:
- Simple, readable code
- Natural language task descriptions
- Configuration-driven behavior
- Error handling improvements
- Performance optimizations