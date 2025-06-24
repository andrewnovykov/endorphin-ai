# Test Recorder - Framework Development Guide

This guide is for developers working on the Endorphin AI framework itself,
contributing to the test recorder functionality, or debugging recorder issues.

## Development Setup

### Running Test Recorder in Development

```bash
# In the endorphin-ai repository root
node bin/endorphin.js run test-recorder

# Alternative: Direct execution
node framework/interactive/enhanced-interactive-recorder.js
```

### Development Environment Configuration

```bash
# .env file in framework root
HEADLESS=false                 # Old config system
ENDORPHIN_HEADLESS=false       # New config system
OPENAI_API_KEY=your_key_here   # Required for AI agent
BASE_URL=https://qafromla.herokuapp.com/
```

## Architecture Overview

### Core Components

1. **CLI Entry Point** (`bin/endorphin.js`)
   - Handles `run test-recorder` command
   - Loads configuration and passes to recorder

2. **Enhanced Interactive Recorder**
   (`framework/interactive/enhanced-interactive-recorder.js`)
   - Main entry point for recording sessions
   - Handles user input and coordinates with TestRecorder

3. **TestRecorder Class** (`framework/core/test-recorder.js`)
   - Core recording logic
   - Screenshot capture and artifact generation
   - Test file generation

4. **Browser Framework** (`framework/core/browser-framework.js`)
   - Playwright integration
   - AI agent setup and execution

### Configuration System

The framework uses a dual configuration system:

```javascript
// Old system (framework/config/browser-config.js)
BROWSER_CONFIG = {
  launchOptions: {
    headless: process.env.HEADLESS === 'true'
  }
}

// New system (framework/core/config-loader.js)
ConfigLoader.loadEnvironmentConfig() {
  if (process.env.ENDORPHIN_HEADLESS !== undefined) {
    envConfig.browser = { headless: process.env.ENDORPHIN_HEADLESS === 'true' };
  }
}
```

## Development Workflow

### Testing the Recorder

```bash
# Run unit tests
npm run test:recorder

# Run integration tests
vitest run dev-tests/test-recorder-integration.test.js

# Validate implementation
node dev-tests/validate-test-recorder.js
```

### Key Development Files

- `framework/core/test-recorder.js` - Main recorder implementation
- `framework/interactive/enhanced-interactive-recorder.js` - User interface
- `dev-tests/test-recorder*.test.js` - Test suites
- `bin/endorphin.js` - CLI integration

## Implementation Details

### TestRecorder Methods

```javascript
class TestRecorder {
  // Initialize recording session
  async startRecording()

  // Record individual steps with screenshots
  async recordStep(description, type, data, result)

  // Generate final test file
  async generateTestFile()

  // Show visual feedback in browser
  async showBrowserFeedback(message, type)

  // Clean up and finalize
  async stopRecording()
}
```

### Directory Structure Created

```
test-recorder/[recording-id]/
├── test-session.json          # Session metadata
├── summary.json               # Recording summary
└── steps/
    └── [step-number]-[description]/
        ├── step-info.json     # Step details
        ├── before.png         # Pre-action screenshot
        └── after.png          # Post-action screenshot
```

### Generated Test Format

```javascript
export const TEST_ID = {
  id: 'TEST-ID',
  name: 'Test Name',
  description: 'Description',
  priority: 'High|Medium|Low',
  tags: ['tag1', 'tag2', 'recorded'], // Always includes "recorded"
  site: 'https://example.com',
  testData: {},
  task: 'Natural language test instructions',
};
```

## Debugging Common Issues

### Browser Not Opening (Headless Mode)

1. Check both environment variables are set:

   ```bash
   HEADLESS=false
   ENDORPHIN_HEADLESS=false
   ```

2. Verify config is passed to framework:

   ```javascript
   // In enhanced-interactive-recorder.js
   const framework = new EnhancedBrowserTestFramework(config);
   ```

3. Check ConfigLoader priority:
   - CLI flags (highest)
   - User config file
   - Environment variables
   - Defaults (lowest)

### Configuration Loading Issues

```javascript
// Debug config loading
const config = await getConfig(cliFlags);
console.log('Loaded config:', JSON.stringify(config, null, 2));
```

### AI Agent Not Responding

- Verify OpenAI API key is valid
- Check network connectivity
- Monitor API usage/limits
- Check browser framework initialization

### Screenshot Capture Failures

- Ensure sufficient disk space
- Check write permissions in recording directory
- Verify Playwright browser is properly launched

## Testing Framework

### Unit Tests (`dev-tests/test-recorder.test.js`)

- TestRecorder class instantiation
- Method functionality
- File system operations
- Configuration handling

### Integration Tests (`dev-tests/test-recorder-integration.test.js`)

- End-to-end recording workflow
- Browser integration
- File generation
- CLI integration

### Test Coverage Areas

- ✅ Configuration loading
- ✅ Recording session initialization
- ✅ Step recording with screenshots
- ✅ Test file generation
- ✅ Cleanup and finalization
- ✅ Error handling

## Contributing Guidelines

### Adding New Features

1. Add unit tests first (TDD approach)
2. Implement feature in TestRecorder class
3. Add integration tests
4. Update CLI interface if needed
5. Update documentation

### Code Style

- Use ES6+ modules with import/export
- Prefer async/await over promises
- Add JSDoc comments for public methods
- Use descriptive variable names
- Consistent error handling with try/catch

### Pull Request Checklist

- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No breaking changes to public API
- [ ] CLI integration works
- [ ] Manual testing completed

## Performance Considerations

### Screenshot Optimization

- PNG format for clarity
- Full page vs viewport screenshots
- Async capture to avoid blocking

### Memory Management

- Clean up browser resources
- Limit concurrent operations
- Garbage collection for large recordings

### File System

- Atomic file operations
- Directory creation error handling
- Cleanup of temporary files

## Troubleshooting Development Issues

### Vitest Test Failures

```bash
# Run specific test file
vitest run dev-tests/test-recorder.test.js

# Run with debug output
DEBUG=1 vitest run dev-tests/test-recorder.test.js

# Watch mode for development
vitest --watch dev-tests/test-recorder*.test.js
```

### Browser Launch Issues

```bash
# Install Playwright browsers
npx playwright install

# Test browser launch
node -e "
const { chromium } = require('playwright');
chromium.launch({ headless: false }).then(browser => {
  console.log('Browser launched successfully');
  browser.close();
});
"
```

### Import/Export Issues

- Ensure all imports use `.js` extensions
- Check for circular dependencies
- Verify module.exports vs export default

This development guide provides the technical depth needed for framework
contributors while the user guide focuses on practical usage.
