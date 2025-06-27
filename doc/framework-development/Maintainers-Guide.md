# Maintainers Guide - Endorphin AI

_Last Updated: June 27, 2025 - v0.4.1+_

## 🎯 Overview

This guide is for developers who want to contribute to, maintain, or understand
the Endorphin AI natural language browser testing framework codebase.

**Framework State (v0.4.1+):**

- ✅ **TypeScript Development**: Full TypeScript codebase with strict typing
- ✅ **JavaScript Distribution**: Compiled JavaScript for production
- ✅ **Comprehensive Testing**: Automated pre-release and post-install testing
- ✅ **Production-Ready CLI**: No tsx dependency for end users
- ✅ **Complete Type Support**: Full TypeScript definitions included

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
- **TypeScript**: v5.8+ (installed as dev dependency)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/andrewnovykov/endorphin-ai.git
cd endorphin-ai

# Install dependencies
npm install

# Set up environment variables (create .env file)
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Build TypeScript to JavaScript
npm run build

# Verify installation with development tests
npm test

# Test compiled CLI functionality
./dist/bin/endorphin.js --help
node dist/bin/endorphin.js --version
```

### Project Structure

```
endorphin-ai/
├── bin/                      # CLI entry points
│   ├── endorphin.ts         # TypeScript CLI source
│   └── cli-handlers.ts      # CLI command handlers
├── framework/               # Core framework code (TypeScript)
│   ├── index.ts            # Main framework entry
│   ├── core/               # Core utilities
│   │   ├── config-loader.ts# Configuration system
│   │   ├── test-discovery.ts# Test file discovery
│   │   ├── browser-framework.ts# Browser automation
│   │   └── ...
│   ├── tools/              # Browser automation tools
│   ├── config/             # Framework configurations
│   ├── types/              # TypeScript type definitions
│   └── test-recorder/      # Interactive test recording
├── dist/                   # Compiled JavaScript (build output)
│   ├── bin/endorphin.js    # Compiled CLI
│   ├── framework/          # Compiled framework
│   └── ...
├── tests/                  # Testing infrastructure
│   ├── development/        # Framework unit & integration tests (Jest)
│   ├── pre-release/        # Pre-release testing (Jest)
│   ├── post-install/       # Post-install testing (Jest)
│   └── package-tests/      # Package integration tests
├── examples/               # User examples and templates
├── doc/                    # Documentation
└── roadmap/               # Development roadmap and progress
```

---

## 🏗 Building the Framework

### TypeScript Build Process

The framework is developed in **TypeScript** and compiled to **JavaScript** for
distribution:

```bash
# Clean build (recommended for releases)
npm run build:clean              # Remove dist/, rebuild fresh

# Standard build
npm run build                    # Compile TypeScript to JavaScript

# Development build with watch
npm run build:watch              # Auto-recompile on changes

# Type checking only (no output)
npm run type-check               # Verify TypeScript without compilation
```

### Build Output Structure

```
dist/                           # Compiled JavaScript
├── bin/
│   └── endorphin.js           # CLI entry (production-ready)
├── framework/
│   ├── index.js               # Main framework entry
│   ├── index.d.ts             # TypeScript definitions
│   ├── core/                  # Core utilities (compiled)
│   ├── tools/                 # Browser tools (compiled)
│   ├── types/                 # Type definitions
│   └── ...
└── ...
```

### Development vs Production

| Environment     | Source     | Runtime       | Purpose                  |
| --------------- | ---------- | ------------- | ------------------------ |
| **Development** | TypeScript | tsx + Node.js | Framework development    |
| **Testing**     | TypeScript | tsx + Node.js | Unit & integration tests |
| **Production**  | JavaScript | Node.js only  | End user experience      |

### Preparing for Distribution

```bash
# Complete build and validation workflow
npm run build:clean              # Clean build
npm run type-check               # Verify TypeScript
npm test                         # Development tests
npm run test:pre-release         # Pre-release validation
npm pack                         # Create package tarball

# Verify package contents
tar -tzf endorphin-ai-*.tgz | head -20
```

---

## 🧪 Testing the Framework

### Test Strategy Overview

The framework uses a comprehensive multi-tier testing approach:

| Test Type               | Framework      | Source      | Purpose                            |
| ----------------------- | -------------- | ----------- | ---------------------------------- |
| **Development**         | Jest           | TypeScript  | Framework unit & integration tests |
| **Pre-Release**         | Jest           | Compiled JS | Local package validation           |
| **Post-Install**        | Jest           | NPM package | Published package verification     |
| **Package Integration** | Custom scripts | Mixed       | Real-world scenarios               |

### Test Structure

```
tests/
├── development/             # Framework development tests (Jest)
│   ├── unit/               # Unit tests for individual components
│   ├── integration/        # Integration tests for workflows
│   └── setup.ts           # Test environment setup
├── pre-release/            # Pre-release validation (Jest)
│   ├── local-installation.test.ts    # Local package installation
│   ├── cli-functionality.test.ts     # CLI command testing
│   ├── framework-integration.test.ts # Core framework features
│   ├── e2e-testing.test.ts           # End-to-end capabilities
│   ├── test-recorder.test.ts         # Interactive recording
│   ├── test-reporter.test.ts         # Report generation
│   └── real-world-scenarios.test.ts  # Complete workflows
├── post-install/           # Post-install validation (Jest)
│   └── npm-package.test.ts # Published package testing
└── package-tests/          # Package integration (Bash scripts)
    └── run-all-tests.sh   # Integration test runner
```

### Running Framework Tests

```bash
# 🧪 Development Tests (TypeScript source)
npm test                     # All development tests
npm run test:dev            # Development tests only
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # Code coverage analysis

# 🚀 Pre-Release Tests (Compiled JavaScript)
npm run test:pre-release    # Complete pre-release validation
npm run test:pre-release -- --testNamePattern="CLI" # Specific test

# 📦 Post-Install Tests (Published package)
npm run test:post-install   # Published package validation

# 🔍 Integration Tests
npm run test:package        # Package integration scenarios
npm run test:all           # All test types
```

### Test Categories

#### 1. Development Tests (TypeScript Source)

- **Location**: `tests/development/`
- **Framework**: Jest with TypeScript support
- **Purpose**: Validate framework code during development
- **Runtime**: tsx + Node.js

**Examples:**

- Unit tests for configuration loading
- Integration tests for test discovery
- Browser framework automation tests
- CLI command functionality tests

#### 2. Pre-Release Tests (Compiled JavaScript)

- **Location**: `tests/pre-release/`
- **Framework**: Jest with compiled JavaScript
- **Purpose**: Validate package before publishing
- **Runtime**: Node.js (production environment)

**Test Suites:**

- `local-installation.test.ts` - Package installation validation
- `cli-functionality.test.ts` - CLI commands with compiled JS
- `framework-integration.test.ts` - Core framework features
- `e2e-testing.test.ts` - End-to-end testing capabilities
- `test-recorder.test.ts` - Interactive recording functionality
- `test-reporter.test.ts` - Report generation
- `real-world-scenarios.test.ts` - Complete user workflows

#### 3. Post-Install Tests (Published Package)

- **Location**: `tests/post-install/`
- **Framework**: Jest with NPM-installed package
- **Purpose**: Validate published package works correctly
- **Runtime**: Node.js with NPM package

#### 4. Package Integration Tests

- **Location**: `tests/package-tests/`
- **Framework**: Custom bash scripts
- **Purpose**: Real-world integration scenarios
- **Runtime**: Various environments

### Framework Test Results

Current test status (v0.4.1+):

- **Development Tests**: ~95% passing
- **Pre-Release Tests**: ~90% passing
- **Post-Install Tests**: ~90% passing
- **Total Test Coverage**: ~85%

Key test metrics to maintain:

- All CLI commands must work with compiled JavaScript
- Configuration loading must be robust across environments
- Test discovery must handle various file formats
- Browser automation must be reliable
- Package installation must work from local path
- TypeScript definitions must be complete and accurate

---

## 🏗 Architecture Overview

### Core Components (TypeScript)

#### 1. Configuration System (`framework/core/config-loader.ts`)

- Handles configuration loading and merging with TypeScript types
- Priority: CLI flags > User config > Environment > Defaults
- Supports environment-specific configurations
- Full type safety for configuration objects

#### 2. Test Discovery (`framework/core/test-discovery.ts`)

- Discovers and loads test files from user projects
- Validates test object structure with TypeScript interfaces
- Supports ES module imports with cache busting
- Type-safe test validation and filtering

#### 3. Browser Framework (`framework/core/browser-framework.ts`)

- Manages Playwright browser instances with typed interfaces
- Integrates with AI agent for natural language commands
- Handles test session management and result storage
- Type-safe browser automation and session tracking

#### 4. AI Tools (`framework/tools/`)

- Browser automation tools for AI agent with TypeScript types
- Screenshot, navigation, interaction tools
- Error handling and retry logic with typed error classes
- Modular tool architecture with clean interfaces

#### 5. Type System (`framework/types/`)

- Complete TypeScript type definitions
- Modular type organization by feature area
- Exported types for user consumption
- Strict typing for framework APIs

### Data Flow (TypeScript → JavaScript)

```
Development:
CLI (TS) → Config Loading (TS) → Test Discovery (TS) → Browser Framework (TS) → AI Execution (TS) → Results (TS)

Production:
CLI (JS) → Config Loading (JS) → Test Discovery (JS) → Browser Framework (JS) → AI Execution (JS) → Results (JS)
```

### Type Safety Benefits

- **Compile-time validation**: Catch errors before runtime
- **IntelliSense support**: Better developer experience
- **API consistency**: Enforced interfaces and contracts
- **Refactoring safety**: Confident code changes
- **Documentation**: Types serve as living documentation

---

## 🔄 Development Workflow

### Adding New Features

1. **Write Tests First** (TDD approach)

   ```bash
   # Create test file (TypeScript)
   touch tests/development/unit/new-feature.test.ts

   # Write failing tests with TypeScript types
   # Implement feature with TypeScript
   # Verify tests pass
   npm test
   ```

2. **Follow TypeScript Code Style**
   - Use strict TypeScript with full type annotations
   - Use ES6+ modules (`import/export`)
   - Prefer `async/await` over promises
   - Add JSDoc comments with TypeScript type annotations
   - Use descriptive variable names with proper types
   - Import types from `@types/` path alias

3. **Update Documentation**
   - Update relevant README sections
   - Add TypeScript examples if needed
   - Update this maintainers guide
   - Update type definitions documentation

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

- [ ] All development tests pass: `npm test`
- [ ] TypeScript compiles without errors: `npm run type-check`
- [ ] Build completes successfully: `npm run build`
- [ ] Pre-release tests pass: `npm run test:pre-release`
- [ ] No console errors in CLI: `./dist/bin/endorphin.js --help`
- [ ] Examples still work: Test with `examples/` directory
- [ ] Documentation updated
- [ ] Type definitions are complete and accurate

### Writing Good Framework Tests

#### 1. TypeScript Test Structure

```typescript
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import type { FeatureInterface } from '@types/feature.js';

describe('Feature Name', () => {
  let testInstance: FeatureInterface;

  beforeEach(() => {
    // Setup with proper TypeScript types
    testInstance = new FeatureClass();
  });

  afterEach(() => {
    // Cleanup
    testInstance = null;
  });

  describe('Specific Functionality', () => {
    it('should do specific thing', async () => {
      // Arrange
      const input: string = 'test input';

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

```typescript
// Mock Playwright with TypeScript
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(() => Promise.resolve(mockBrowser)),
  },
}));

// Mock file system with types
jest.mock('fs', () => ({
  existsSync: jest.fn((path: string) => true),
  readFileSync: jest.fn((path: string) => 'mock content'),
}));
```

#### 3. Testing CLI Commands (Pre-Release Style)

```typescript
import { execSync } from 'child_process';

it('should display help with compiled CLI', () => {
  // Test compiled JavaScript CLI (production-ready)
  const output = execSync('./dist/bin/endorphin.js --help', {
    encoding: 'utf8',
  });
  expect(output).toContain('Usage:');
});

it('should work without tsx dependency', () => {
  // Test direct Node.js execution
  const output = execSync('node dist/bin/endorphin.js --version', {
    encoding: 'utf8',
  });
  expect(output).toMatch(/\d+\.\d+\.\d+/);
});
```

### Test Coverage Goals

- **Minimum**: 80% line coverage
- **Target**: 90%+ line coverage
- **Critical paths**: 100% coverage (config loading, test discovery, CLI)
- **TypeScript coverage**: Type definitions and interfaces
- **Pre-release coverage**: All major user workflows
- **Integration coverage**: Real-world usage scenarios

---

## 🔍 Debugging

### Debug Mode

Enable debug output in CLI:

```bash
# Development debugging (TypeScript)
tsx bin/endorphin.ts list --debug

# Production debugging (compiled JavaScript)
./dist/bin/endorphin.js list --debug
node dist/bin/endorphin.js list --debug
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
# Debug config loading (development)
tsx bin/endorphin.ts list --debug

# Debug config loading (production)
./dist/bin/endorphin.js list --debug

# Look for "🔧 Loaded configuration:" output
```

#### 3. Browser Framework Issues

```bash
# Enable Playwright debug (development)
DEBUG=pw:api tsx bin/endorphin.ts run test TEST-001

# Enable Playwright debug (production)
DEBUG=pw:api ./dist/bin/endorphin.js run test TEST-001
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
# Run single test with debug (Jest)
npm test -- --testNamePattern="specific test"

# Debug specific test suite
npm run test:pre-release -- --testNamePattern="CLI functionality"

# Debug with Node inspector (development tests)
node --inspect-brk node_modules/.bin/jest tests/development/unit/specific.test.ts

# Debug pre-release tests
node --inspect-brk node_modules/.bin/jest tests/pre-release/cli-functionality.test.ts
```

---

## 🚀 Release Process

### Version Management

1. **Update Version**

   ```bash
   npm version patch  # for bug fixes (0.4.1 → 0.4.2)
   npm version minor  # for new features (0.4.1 → 0.5.0)
   npm version major  # for breaking changes (0.4.1 → 1.0.0)
   ```

2. **Run Full Test Suite**

   ```bash
   npm run build:clean         # Clean TypeScript build
   npm test                    # Development tests
   npm run test:pre-release    # Pre-release validation
   npm run test:coverage       # Code coverage analysis
   ```

3. **Update Documentation**
   - Update CHANGELOG.md
   - Update README.md if needed
   - Update examples if needed
   - Update TypeScript definitions documentation

4. **Test Package Distribution**

   ```bash
   # Build and pack package
   npm run build:clean
   npm pack

   # Test installation in temp directory
   mkdir temp-test && cd temp-test
   npm init -y
   npm install ../endorphin-ai-*.tgz

   # Test compiled CLI (production-ready)
   npx endorphin --version
   node node_modules/.bin/endorphin --version

   cd .. && rm -rf temp-test
   ```

5. **Comprehensive Pre-Release Testing**

   ```bash
   # Automated comprehensive testing
   npm run test:pre-release

   # Manual verification if needed
   ./tmp/test-endorphin/setup-user-project.sh
   ./tmp/test-endorphin/test-cli-commands.sh
   ./tmp/test-endorphin/cleanup.sh
   ```

6. **Publish**
   ```bash
   npm publish
   ```

### Release Checklist

- [ ] All development tests passing (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Clean build completes (`npm run build:clean`)
- [ ] Pre-release tests pass (`npm run test:pre-release`)
- [ ] Documentation updated
- [ ] Examples tested with packed version
- [ ] Version bumped
- [ ] CHANGELOG.md updated
- [ ] Git tags created
- [ ] Package tested in isolation
- [ ] CLI works without tsx dependency
- [ ] TypeScript definitions are complete

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
# Check TypeScript source
ls -la bin/endorphin.ts

# Check compiled output
ls -la dist/bin/endorphin.js

# Test TypeScript version (development)
tsx bin/endorphin.ts --version

# Test compiled version (production)
./dist/bin/endorphin.js --version
node dist/bin/endorphin.js --version

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

- **TypeScript compilation** - Use `npm run build:watch` during development
- **Test discovery** - Cache busting is needed for development but impacts
  performance
- **Browser management** - Reuse browser instances when possible
- **AI API calls** - Implement retry logic and rate limiting
- **File operations** - Use async operations to avoid blocking
- **Path alias resolution** - TypeScript path mapping optimizes imports

### Security Notes

- **OpenAI API keys** - Never commit to repository, use environment variables
- **User file access** - Validate paths to prevent directory traversal
- **Browser security** - Run in sandboxed mode when possible
- **TypeScript strict mode** - Prevents many runtime security issues
- **Package dependencies** - Regularly audit and update dependencies

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

_This guide focuses on TypeScript framework development. For related
documentation, see:_

- _Pre-release testing:
  `/doc/framework-development/Package-Testing-Scenarios.md`_
- _Publishing process: `/doc/framework-development/Publish-Guide.md`_
- _Framework architecture:
  `/doc/framework-development/Framework-Architecture.md`_
