# Maintainers Guide - Endorphin AI

*Last Updated: June 22, 2025*

## 🎯 Overview

This guide is for developers who want to contribute to, maintain, or understand the Endorphin AI natural language browser testing framework codebase.

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Building the Framework](#building-the-framework)
3. [Testing the Framework](#testing-the-framework)
4. [Architecture Overview](#architecture-overview)
5. [Development Workflow](#development-workflow)
6. [Debugging](#debugging)
7. [Release Process](#release-process)
8. [Troubleshooting](#troubleshooting)

---

## 🛠 Development Setup

### Prerequisites

- **Node.js**: v18+ (recommended: v20+)
- **npm**: v8+ (comes with Node.js)
- **Git**: Latest version
- **OpenAI API Key**: For AI functionality testing

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/endorphin-ai.git
cd endorphin-ai

# Install dependencies
npm install

# Set up environment variables (create .env file)
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Verify installation
npm test

# Test CLI functionality
node bin/endorphin.js --help
```

### Project Structure

```
endorphin-ai/
├── bin/endorphin.js          # CLI entry point
├── framework/                # Core framework code
│   ├── core/                # Core utilities
│   │   ├── config-loader.js # Configuration system
│   │   ├── test-discovery.js# Test file discovery
│   │   ├── browser-framework.js # Browser automation
│   │   └── ...
│   ├── tools/               # AI tools for browser automation
│   └── config/              # Framework configurations
├── dev-tests/               # Framework tests (Vitest)
├── examples/                # User examples and templates
├── doc/                     # Documentation
└── test-recorder/           # Test recording utilities
```

---

## 🏗 Building the Framework

### Build Process

The framework uses ES modules and doesn't require a traditional build step, but here are the preparation steps:

```bash
# Install all dependencies
npm install

# Verify the framework structure
npm run verify-structure

# Run linting (if configured)
npm run lint

# Run type checking (if using TypeScript)
npm run type-check
```

### Preparing for Distribution

```bash
# Clean any previous build artifacts
rm -rf dist/ build/

# Run all tests to ensure quality
npm test

# Pack the package for testing
npm pack

# This creates endorphin-ai-X.X.X.tgz for local testing
```

---

## 🧪 Testing the Framework

### Test Structure

We use **Vitest** for all framework testing with the following test organization:

```
dev-tests/
├── setup.js                 # Global test setup
├── browser-framework.test.js      # Browser automation tests
├── cli-commands.test.js           # CLI functionality tests
├── config-loader.test.js          # Configuration system tests
├── enhanced-browser-framework.test.js # Enhanced framework tests
├── final-integration.test.js      # End-to-end integration tests
├── installation.test.js          # Installation and setup tests
├── test-discovery.test.js         # Test file discovery tests
└── test-runner.test.js            # Test execution tests
```

### Running Framework Tests

```bash
# Run all framework tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run specific test file
npx vitest dev-tests/config-loader.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode (no watch, single run)
npm run test:ci

# Generate HTML test report
npm test && npx vite preview --outDir dev-tests/html
```

### Test Categories

#### 1. Unit Tests
- **Location**: Individual test files
- **Purpose**: Test individual functions and classes
- **Example**: `config-loader.test.js` tests configuration loading

#### 2. Integration Tests
- **Location**: `final-integration.test.js`, `installation.test.js`
- **Purpose**: Test complete workflows
- **Example**: Full CLI workflow from config to test execution

#### 3. CLI Tests
- **Location**: `cli-commands.test.js`
- **Purpose**: Test command-line interface functionality
- **Example**: Help command, version display, test listing

#### 4. Browser Framework Tests
- **Location**: `browser-framework.test.js`, `enhanced-browser-framework.test.js`
- **Purpose**: Test browser automation and AI integration
- **Example**: Browser launch, page management, test execution

### Framework Test Results

Current test status:
- **Total Tests**: 98
- **Passing**: 93
- **Success Rate**: 94.9%

Key test metrics to maintain:
- All CLI commands must work
- Configuration loading must be robust
- Test discovery must handle various file formats
- Browser automation must be reliable

---

## 🏗 Architecture Overview

### Core Components

#### 1. Configuration System (`framework/core/config-loader.js`)
- Handles configuration loading and merging
- Priority: CLI flags > User config > Environment > Defaults
- Supports environment-specific configurations

#### 2. Test Discovery (`framework/core/test-discovery.js`)
- Discovers and loads test files from user projects
- Validates test object structure
- Supports ES module imports with cache busting

#### 3. Browser Framework (`framework/core/browser-framework.js`)
- Manages Playwright browser instances
- Integrates with AI agent for natural language commands
- Handles test session management and result storage

#### 4. AI Tools (`framework/tools/`)
- Browser automation tools for AI agent
- Screenshot, navigation, interaction tools
- Error handling and retry logic

### Data Flow

```
CLI Command → Config Loading → Test Discovery → Browser Framework → AI Execution → Results
```

---

## 🔄 Development Workflow

### Adding New Features

1. **Write Tests First** (TDD approach)
   ```bash
   # Create test file
   touch dev-tests/new-feature.test.js
   
   # Write failing tests
   # Implement feature
   # Verify tests pass
   npm test
   ```

2. **Follow Code Style**
   - Use ES6+ modules (`import/export`)
   - Prefer `async/await` over promises
   - Add JSDoc comments for functions
   - Use descriptive variable names

3. **Update Documentation**
   - Update relevant README sections
   - Add examples if needed
   - Update this maintainers guide

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Run tests before pushing
npm test

# Push and create PR
git push origin feature/new-feature
```

### Code Quality Checks

Before committing, ensure:
- [ ] All tests pass: `npm test`
- [ ] No console errors in CLI: `node bin/endorphin.js --help`
- [ ] Examples still work: Test with `examples/` directory
- [ ] Documentation updated

### Writing Good Framework Tests

#### 1. Test Structure
```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Feature Name', () => {
  let testInstance;

  beforeEach(() => {
    // Setup
    testInstance = new FeatureClass();
  });

  afterEach(() => {
    // Cleanup
    testInstance = null;
  });

  describe('Specific Functionality', () => {
    it('should do specific thing', async () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = await testInstance.method(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe('expected value');
    });
  });
});
```

#### 2. Mocking External Dependencies

```javascript
// Mock Playwright
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(() => Promise.resolve(mockBrowser))
  }
}));

// Mock file system
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => 'mock content')
}));
```

#### 3. Testing CLI Commands

```javascript
import { execSync } from 'child_process';

it('should display help', () => {
  const output = execSync('node bin/endorphin.js --help', { 
    encoding: 'utf8' 
  });
  expect(output).toContain('Usage:');
});
```

### Test Coverage Goals

- **Minimum**: 80% line coverage
- **Target**: 90%+ line coverage
- **Critical paths**: 100% coverage (config loading, test discovery, CLI)

---

## 🔍 Debugging

### Debug Mode

Enable debug output in CLI:
```bash
node bin/endorphin.js list --debug
```

### Common Debug Scenarios

#### 1. Test Discovery Issues
```bash
# Add debug logging to test-discovery.js
console.log('🔍 Found exports:', Object.keys(module));
console.log('🔎 Checking export:', exportName, typeof exportValue);
```

#### 2. Configuration Problems
```bash
# Debug config loading
node bin/endorphin.js list --debug
# Look for "🔧 Loaded configuration:" output
```

#### 3. Browser Framework Issues
```bash
# Enable Playwright debug
DEBUG=pw:api node bin/endorphin.js run test TEST-001
```

#### 4. AI Agent Problems
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Enable verbose AI logging (in code)
console.log('🤖 AI Response:', response);
```

### Debugging Tests

```bash
# Run single test with debug
npx vitest dev-tests/specific.test.js --reporter=verbose

# Debug test with Node inspector
node --inspect-brk node_modules/.bin/vitest dev-tests/specific.test.js
```

---

## 🚀 Release Process

### Version Management

1. **Update Version**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Run Full Test Suite**
   ```bash
   npm test
   npm run test:coverage
   ```

3. **Update Documentation**
   - Update CHANGELOG.md
   - Update README.md if needed
   - Update examples if needed

4. **Test Package Distribution**
   ```bash
   # Pack and test locally
   npm pack
   
   # Test installation in temp directory
   mkdir temp-test && cd temp-test
   npm init -y
   npm install ../endorphin-ai-*.tgz
   npx endorphin --version
   cd .. && rm -rf temp-test
   ```

5. **Publish**
   ```bash
   npm publish
   ```

### Release Checklist

- [ ] All framework tests passing
- [ ] Documentation updated
- [ ] Examples tested with packed version
- [ ] Version bumped
- [ ] CHANGELOG.md updated
- [ ] Git tags created
- [ ] Package tested in isolation

---

## 🚨 Troubleshooting

### Common Development Issues

#### 1. "Module not found" errors
```bash
# Check Node.js version
node --version  # Should be v18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. ES Module import issues
```bash
# Verify package.json has type: "module"
grep '"type"' package.json

# Check file extensions are .js
find . -name "*.mjs" # Should be empty
```

#### 3. Test failures after changes
```bash
# Reset test environment
rm -rf dev-tests/results
npm test

# Check for cached modules
# Tests use cache busting: `?t=${Date.now()}`
```

#### 4. CLI not working
```bash
# Check bin permissions
ls -la bin/endorphin.js

# Test directly
node bin/endorphin.js --version

# Test in development mode
npm link
endorphin --version
npm unlink
```

#### 5. Browser automation issues
```bash
# Install browsers for Playwright
npx playwright install

# Check browser availability
npx playwright --version
```

### Getting Help

1. **Check existing tests** - Look for similar functionality
2. **Run with debug flags** - Use `--debug` for more output
3. **Check the logs** - Test output often contains helpful info
4. **Review this guide** - Common solutions are documented here

---

## 📝 Development Tips

### Best Practices

1. **Always write tests first** - TDD approach ensures robust code
2. **Use meaningful commit messages** - Follow conventional commits
3. **Keep functions small** - Easier to test and maintain
4. **Handle errors gracefully** - User experience is important
5. **Document complex logic** - Future maintainers will thank you

### Performance Considerations

- **Test discovery** - Cache busting is needed for development but impacts performance
- **Browser management** - Reuse browser instances when possible
- **AI API calls** - Implement retry logic and rate limiting
- **File operations** - Use async operations to avoid blocking

### Security Notes

- **OpenAI API keys** - Never commit to repository
- **User file access** - Validate paths to prevent directory traversal
- **Browser security** - Run in sandboxed mode when possible

---

## 🎯 Contribution Guidelines

### For New Contributors

1. **Read this guide completely**
2. **Set up development environment**
3. **Run the test suite**
4. **Try the framework with examples**
5. **Start with small fixes/features**

### For Maintainers

1. **Review PRs thoroughly**
2. **Ensure tests are comprehensive**
3. **Maintain backward compatibility**
4. **Update documentation**
5. **Monitor performance impact**

---

*This guide focuses on framework development. For package testing from a user perspective, see `/doc/dev/test-pkg.md`.*
