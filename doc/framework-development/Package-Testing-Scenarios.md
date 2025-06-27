# Package Testing Guide - Endorphin AI

_Last Updated: June 27, 2025 - v0.4.1+_

## 🎯 Overview

This guide covers testing the Endorphin AI package from a user's perspective -
installing it as a dependency and running tests with it. This comprehensive
testing approach ensures the **compiled JavaScript package** works correctly in
real user environments.

**Key Testing Areas:**

- 📦 **Package Installation**: Local path, npm registry, and tarball
  installation
- 🖥️ **CLI Functionality**: All commands work with compiled JavaScript (no tsx
  dependency)
- 🔧 **Framework Integration**: Core features, browser automation, and AI tools
- 📊 **Test Recorder**: Interactive recording and session management
- 📈 **Reporting**: HTML and console report generation
- 🌍 **Real-World Scenarios**: Complete workflows in various project types

## 🧪 Testing Strategy

| Test Type        | Purpose                    | Installation Source                         | Runtime               |
| ---------------- | -------------------------- | ------------------------------------------- | --------------------- |
| **Pre-Release**  | Validate development build | Local path (`npm install /path/to/project`) | Node.js + compiled JS |
| **Post-Install** | Validate published package | NPM registry (`npm install endorphin-ai`)   | Node.js + compiled JS |
| **Integration**  | Test real-world usage      | Mixed (local + registry)                    | Various environments  |

## 🚀 Quick Start with Automated Testing

### Comprehensive Pre-Release Testing

The framework now includes a robust automated pre-release testing system using
**Jest** to validate the compiled JavaScript package:

```bash
# Run comprehensive automated tests
npm run test:pre-release

# This runs 6 comprehensive test suites:
# ✅ Local Installation (local-installation.test.ts)
# ✅ CLI Functionality (cli-functionality.test.ts)
# ✅ Framework Integration (framework-integration.test.ts)
# ✅ E2E Testing (e2e-testing.test.ts)
# ✅ Test Recorder (test-recorder.test.ts)
# ✅ Test Reporter (test-reporter.test.ts)
# ✅ Real-World Scenarios (real-world-scenarios.test.ts)
```

### Legacy Bash Scripts (Still Available)

For manual testing and debugging, we maintain bash scripts in
`tmp/test-endorphin/`:

#### Available Scripts

```bash
# Setup user project environment
./tmp/test-endorphin/setup-user-project.sh

# Test test-recorder location (creates files in user project, not framework)
./tmp/test-endorphin/test-recorder-location.sh

# Test CLI commands
./tmp/test-endorphin/test-cli-commands.sh

# Run user tests
./tmp/test-endorphin/run-user-tests.sh

# Clean up test environment
./tmp/test-endorphin/cleanup.sh
```

### Example Usage

**Automated Testing (Recommended):**

```bash
# Full automated pre-release testing
npm run build:clean               # Compile TypeScript → JavaScript
npm run test:pre-release          # Run comprehensive automated tests

# Individual test suites (for debugging)
npm run test:pre-release -- --testNamePattern="CLI functionality"
npm run test:pre-release -- --testNamePattern="Local installation"
npm run test:pre-release -- --testNamePattern="Framework integration"
```

**Manual Testing with Bash Scripts:**

```bash
# Full manual test workflow
cd /path/to/endorphin-ai

# 1. Setup test environment
./tmp/test-endorphin/setup-user-project.sh

# 2. Test that recorder creates files in USER project (not framework)
./tmp/test-endorphin/test-recorder-location.sh

# 3. Test CLI functionality
./tmp/test-endorphin/test-cli-commands.sh

# 4. Cleanup when done
./tmp/test-endorphin/cleanup.sh
```

**Build and Package Testing:**

```bash
# Test complete build → package → install workflow
npm run build:clean                    # Build compiled JavaScript
npm pack                              # Create package tarball
npm run test:pre-release              # Test local installation
npm run test:post-install             # Test published behavior
```

./tmp/test-endorphin/cleanup.sh

````

## 📦 Package Testing Scenarios

## 🔍 Critical Test: Test Recorder File Location

**Important**: Verify that test recorder creates files in the USER'S project
directory, not in the framework directory.

### Manual Testing

```bash
# Setup test environment
./tmp/test-endorphin/setup-user-project.sh

# Run test recorder (will timeout after showing it starts)
cd tmp/test-endorphin
timeout 10s npx endorphin run test-recorder

# Check where files were created
echo "User project test-recorder directory:"
ls -la tmp/test-endorphin/test-recorder/ 2>/dev/null || echo "No files in user project ✅"

echo "Framework test-recorder directory:"
ls -la test-recorder/ 2>/dev/null || echo "No files in framework ✅"
````

### Automated Testing

```bash
# Use our automated script
./tmp/test-endorphin/test-recorder-location.sh
```

This test ensures that:

- ✅ Test recorder creates directories in user's project
- ✅ No artifacts are created in framework directory
- ✅ User project isolation is maintained

### 1. Fresh Installation Testing

Test the package installation and basic functionality:

```bash
# Create a fresh test directory
mkdir endorphin-test-project
cd endorphin-test-project

# Initialize npm project
npm init -y

# Install endorphin-ai package
npm install endorphin-ai

# Create basic config
cat > endorphin.config.ts << 'EOF'
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: {
    headless: false,
    slowMo: 500
  },
  resultsDir: "./test-results"
};
EOF

# Create a simple test
mkdir tests
cat > tests/basic-test.ts << 'EOF'
export const BASIC_TEST = {
  id: "TEST-001",
  name: "Basic Navigation Test",
  description: "Test basic website navigation",
  priority: "High",
  tags: ["smoke", "basic"],
  site: "https://example.com",
  task: "Navigate to the website and verify it loads successfully"
};
EOF

# Test the installation
npx endorphin list
npx endorphin run test TEST-001
```

### 2. Different Installation Methods

#### Global Installation

```bash
# Install globally
npm install -g endorphin-ai

# Test global command
endorphin --version
endorphin list

# Uninstall when done
npm uninstall -g endorphin-ai
```

#### NPX Usage (No Installation)

```bash
# Test direct npx usage
npx endorphin-ai@latest --version
npx endorphin-ai@latest list
npx endorphin-ai@latest run test TEST-001
```

#### Local Development Installation (Pre-Release Testing)

**Critical for v0.4.1+**: Test with compiled JavaScript package

```bash
# Method 1: Install from local path (requires build first)
npm run build:clean                        # Compile TypeScript → JavaScript
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai

# Method 2: Install from tarball (simulates npm publish)
npm pack                                   # Creates endorphin-ai-0.4.1.tgz
npm install endorphin-ai-*.tgz

# Method 3: Automated pre-release testing
npm run test:pre-release                   # Uses Method 1 automatically

# Verify installation works without tsx dependency
npx endorphin --version                    # Should work with Node.js only
node node_modules/.bin/endorphin --version # Direct Node.js execution
```

**Package Structure Validation:**

```bash
# Verify compiled artifacts are included
ls -la node_modules/endorphin-ai/dist/bin/endorphin.js      # CLI entry
ls -la node_modules/endorphin-ai/dist/framework/index.js     # Main entry
ls -la node_modules/endorphin-ai/dist/framework/index.d.ts   # Type definitions
ls -la node_modules/endorphin-ai/examples/                   # User templates

# Verify package.json points to compiled files
cat node_modules/endorphin-ai/package.json | jq '.main'      # Should be dist/framework/index.js
cat node_modules/endorphin-ai/package.json | jq '.bin'       # Should be dist/bin/endorphin.js
```

### 3. Configuration Testing

Test different configuration scenarios:

#### Environment Variables

```bash
# Test with environment variables
export OPENAI_API_KEY="your-key-here"
export ENDORPHIN_HEADLESS=true
export ENDORPHIN_SLOW_MO=1000

npx endorphin run test TEST-001
```

#### Multiple Environments

```bash
# Create environment-specific configs
cat > endorphin.config.ts << 'EOF'
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,

  environments: {
    dev: {
      browser: { headless: false, slowMo: 500 },
      baseUrl: "http://localhost:3000"
    },
    staging: {
      browser: { headless: true },
      baseUrl: "https://staging.example.com"
    },
    prod: {
      browser: { headless: true },
      baseUrl: "https://example.com"
    }
  }
};
EOF

# Test different environments
npx endorphin run test TEST-001 --env dev
npx endorphin run test TEST-001 --env staging
npx endorphin run test TEST-001 --env prod
```

### 4. Test File Validation

Create and test various test file formats:

#### Valid Test File

```javascript
export const VALID_TEST = {
  id: 'TEST-002',
  name: 'Valid Test Example',
  description: 'This test should pass validation',
  priority: 'Medium',
  tags: ['validation', 'example'],
  site: 'https://httpbin.org',
  testData: {
    username: 'testuser',
    password: 'testpass',
  },
  task: 'Navigate to the site and check the response',
};
```

#### Invalid Test Files (for error testing)

```javascript
// Missing required fields
export const INVALID_TEST_1 = {
  name: 'Missing ID Test',
  // Missing id, description, priority, etc.
};

// Wrong data types
export const INVALID_TEST_2 = {
  id: 123, // Should be string
  name: 'Wrong Type Test',
  description: 'Test with wrong data types',
  priority: 'Invalid', // Should be High/Medium/Low
  tags: 'should-be-array',
  site: 'https://example.com',
  task: 'Test with wrong types',
};
```

### 5. CLI Command Testing

Test all CLI commands with the installed package:

```bash
# Version and help
npx endorphin --version
npx endorphin --help
npx endorphin run --help

# List commands
npx endorphin list
npx endorphin list --format json
npx endorphin list --tag smoke
npx endorphin list --priority High

# Run commands
npx endorphin run test TEST-001
npx endorphin run test --tag smoke
npx endorphin run test --priority High
npx endorphin run test all

# Validation (when implemented)
npx endorphin validate
npx endorphin validate tests/specific-test.js
```

### 6. Integration with Different Project Types

#### Next.js Project

```bash
# Create Next.js project
npx create-next-app@latest my-nextjs-app
cd my-nextjs-app

# Install endorphin-ai
npm install endorphin-ai

# Add to package.json scripts
npm pkg set scripts.test:e2e="endorphin run test all"
npm pkg set scripts.test:smoke="endorphin run test --tag smoke"

# Create tests directory and config
mkdir tests
# ... add test files and config

# Run tests
npm run test:e2e
```

#### Express.js Project

```bash
# Create Express project
mkdir my-express-app
cd my-express-app
npm init -y
npm install express

# Install endorphin-ai
npm install endorphin-ai

# Create test setup for local server
cat > tests/local-server-test.js << 'EOF'
export const LOCAL_SERVER_TEST = {
  id: "LOCAL-001",
  name: "Local Server Test",
  description: "Test the local Express server",
  priority: "High",
  tags: ["local", "server"],
  site: "http://localhost:3000",
  task: "Navigate to the local server and verify it responds"
};
EOF
```

#### React Project (Create React App)

```bash
# Create React project
npx create-react-app@latest my-react-app
cd my-react-app

# Install endorphin-ai
npm install endorphin-ai

# Add test scripts to package.json
npm pkg set scripts.test:e2e="endorphin run test all"
npm pkg set scripts.test:smoke="endorphin run test --tag smoke"

# Create test configuration
mkdir tests
cat > endorphin.config.ts << 'EOF'
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: {
    headless: false,
    slowMo: 500
  },
  resultsDir: "./test-results"
};
EOF

# Create basic React app test
cat > tests/react-app-test.ts << 'EOF'
export const REACT_APP_TEST = {
  id: "REACT-001",
  name: "React App Test",
  description: "Test the React application",
  priority: "High",
  tags: ["react", "ui"],
  site: "http://localhost:3000",
  task: "Navigate to the React app and verify it loads successfully"
};
EOF

# Start React app and run tests
npm start &
sleep 5
npm run test:e2e
```

### 7. Error Scenario Testing

Test how the package handles various error conditions:

#### Missing Configuration

```bash
# Test without config file
rm endorphin.config.ts
npx endorphin list  # Should show appropriate error

# Test with invalid config
echo "invalid javascript" > endorphin.config.ts
npx endorphin list  # Should handle syntax error gracefully
```

#### Network Issues

```bash
# Test with unreachable site
cat > tests/network-error-test.js << 'EOF'
export const NETWORK_ERROR_TEST = {
  id: "ERROR-001",
  name: "Network Error Test",
  description: "Test handling of network errors",
  priority: "Low",
  tags: ["error-handling"],
  site: "https://definitely-does-not-exist-website-12345.com",
  task: "Try to navigate to a non-existent website"
};
EOF

npx endorphin run test ERROR-001
```

#### Invalid API Key

```bash
# Test with invalid OpenAI API key
export OPENAI_API_KEY="invalid-key"
npx endorphin run test TEST-001
```

### 8. Performance Testing

Test package performance under various conditions:

#### Large Test Suite

```bash
# Generate multiple test files
for i in {1..20}; do
  cat > tests/test-${i}.js << EOF
export const TEST_${i} = {
  id: "PERF-${i}",
  name: "Performance Test ${i}",
  description: "Test ${i} for performance testing",
  priority: "Low",
  tags: ["performance"],
  site: "https://httpbin.org",
  task: "Quick navigation test ${i}"
};
EOF
done

# Run all tests and measure time
time npx endorphin run test all
```

#### Memory Usage

```bash
# Monitor memory usage during test execution
# (requires additional monitoring tools)
npx endorphin run test all &
PID=$!
while kill -0 $PID 2>/dev/null; do
  ps -p $PID -o pid,vsz,rss,comm
  sleep 5
done
```

### 9. Cross-Platform Testing

Test the package on different operating systems:

#### Windows Testing

```cmd
REM Install and test on Windows
npm install endorphin-ai
npx endorphin --version
npx endorphin list

REM Test with Windows paths
npx endorphin run test TEST-001
```

#### macOS Testing

```bash
# Install and test on macOS
npm install endorphin-ai
npx endorphin --version
npx endorphin list

# Test with macOS paths
npx endorphin run test TEST-001
```

#### Linux Testing

```bash
# Install and test on Linux
npm install endorphin-ai
npx endorphin --version
npx endorphin list

# Test with Linux paths
npx endorphin run test TEST-001
```

### 10. Version Compatibility Testing

Test different Node.js versions:

```bash
# Test with different Node versions (using nvm)
nvm use 18
npm install endorphin-ai
npx endorphin --version

nvm use 20
npm install endorphin-ai
npx endorphin --version

nvm use 22
npm install endorphin-ai
npx endorphin --version
```

## 🧪 Automated Pre-Release Test Coverage (v0.4.1+)

### Test Suite Overview

The comprehensive automated testing system validates all aspects of the package:

#### 1. Local Installation Test (`local-installation.test.ts`)

- ✅ Package installs from development source
- ✅ Package.json configuration is correct
- ✅ Required files are included in package
- ✅ Dependencies resolve correctly
- ✅ CLI binary is executable

#### 2. CLI Functionality Test (`cli-functionality.test.ts`)

- ✅ `endorphin --version` works without tsx
- ✅ `endorphin --help` displays correctly
- ✅ `endorphin help` shows command help
- ✅ `endorphin list` discovers tests
- ✅ `endorphin init` creates config files
- ✅ CLI works with Node.js directly (no npx)

#### 3. Framework Integration Test (`framework-integration.test.ts`)

- ✅ Core framework loads and initializes
- ✅ Configuration system works
- ✅ Test discovery functions correctly
- ✅ Browser automation tools load
- ✅ TypeScript definitions are available

#### 4. E2E Testing Test (`e2e-testing.test.ts`)

- ✅ Browser launches successfully
- ✅ AI integration works
- ✅ Test execution completes
- ✅ Results are stored correctly
- ✅ Screenshots are captured

#### 5. Test Recorder Test (`test-recorder.test.ts`)

- ✅ Interactive recorder starts
- ✅ Session recording works
- ✅ Files created in user project (not framework)
- ✅ Recorder cleanup functions
- ✅ User project isolation maintained

#### 6. Test Reporter Test (`test-reporter.test.ts`)

- ✅ HTML reports generate correctly
- ✅ Console reporting works
- ✅ Report formatting is correct
- ✅ Results data is complete
- ✅ Report files are created in user directory

#### 7. Real-World Scenarios Test (`real-world-scenarios.test.ts`)

- ✅ Complete user workflows
- ✅ Integration with example projects
- ✅ Multi-test execution
- ✅ Configuration override scenarios
- ✅ Error handling and recovery

### Running Specific Test Suites

```bash
# Run individual test suites for debugging
npm run test:pre-release -- --testNamePattern="Local installation"
npm run test:pre-release -- --testNamePattern="CLI functionality"
npm run test:pre-release -- --testNamePattern="Framework integration"
npm run test:pre-release -- --testNamePattern="E2E testing"
npm run test:pre-release -- --testNamePattern="Test recorder"
npm run test:pre-release -- --testNamePattern="Test reporter"
npm run test:pre-release -- --testNamePattern="Real-world scenarios"
```

### Test Environment Setup

The automated tests create isolated environments for each test:

```bash
# Test directories are created dynamically
/tmp/endorphin-test-*               # Temporary test environments
├── package.json                    # Generated npm project
├── endorphin.config.ts             # Test configuration
├── tests/                          # Generated test files
└── node_modules/                   # Installed package
```

### Validation Checks

Each test suite performs comprehensive validation:

```typescript
// Example validation patterns used in tests
describe('Package Installation', () => {
  it('should install package successfully', async () => {
    // Verify installation
    expect(fs.existsSync('node_modules/endorphin-ai')).toBe(true);

    // Verify CLI binary
    expect(fs.existsSync('node_modules/.bin/endorphin')).toBe(true);

    // Verify main entry
    expect(
      fs.existsSync('node_modules/endorphin-ai/dist/framework/index.js')
    ).toBe(true);

    // Test CLI execution
    const result = execSync('npx endorphin --version', { encoding: 'utf8' });
    expect(result).toMatch(/\d+\.\d+\.\d+/);
  });
});
```

## 📋 Testing Checklist

### Pre-Release Testing (Automated - Recommended)

```bash
# 🏗️ Build and prepare package
npm run build:clean                           # ✅ Compile TypeScript → JavaScript
npm run type-check                            # ✅ Verify TypeScript compilation

# 🧪 Comprehensive automated testing
npm run test:pre-release                      # ✅ Run all 7 test suites
npm run test                                  # ✅ Development tests pass
npm run test:package                          # ✅ Integration tests pass

# 🔍 Manual verification (if needed)
./dist/bin/endorphin.js --version             # ✅ CLI executes without tsx
node dist/bin/endorphin.js --version          # ✅ Direct Node.js execution
npm pack --dry-run | grep dist/               # ✅ Compiled files included
```

### Pre-Release Testing (Manual - For Debugging)

```bash
# 📦 Manual package testing workflow
./tmp/test-endorphin/setup-user-project.sh      # ✅ Setup user environment
./tmp/test-endorphin/test-cli-commands.sh        # ✅ CLI commands work
./tmp/test-endorphin/test-recorder-location.sh   # ✅ Recorder file location
./tmp/test-endorphin/run-user-tests.sh          # ✅ Test execution
./tmp/test-endorphin/cleanup.sh                 # ✅ Clean environment
```

### Pre-Release Validation Checklist

#### Package Structure (v0.4.1+)

- [ ] `dist/bin/endorphin.js` exists (compiled CLI)
- [ ] `dist/framework/index.js` exists (main entry)
- [ ] `dist/framework/index.d.ts` exists (TypeScript definitions)
- [ ] `examples/` directory included for users
- [ ] `package.json` points to compiled files

#### CLI Functionality

- [ ] `npx endorphin --version` works without tsx
- [ ] `node dist/bin/endorphin.js --version` works directly
- [ ] `npx endorphin --help` displays help
- [ ] `npx endorphin list` discovers tests
- [ ] `npx endorphin init` creates config files

#### Framework Integration

- [ ] Package installs from local path successfully
- [ ] Configuration loading works
- [ ] Test discovery functions correctly
- [ ] Browser automation tools accessible
- [ ] TypeScript definitions work

#### Critical Tests

- [ ] **Test recorder creates files in user project only** (not framework)
- [ ] **CLI works without tsx dependency** (production-ready)
- [ ] **Package isolation maintained** (no cross-contamination)
- [ ] **All automated tests pass** (`npm run test:pre-release`)

### Post-Release Testing (NPM Registry Validation)

```bash
# 📦 Test published package
npm run test:post-install                     # ✅ Published package tests

# 🔍 Manual verification
mkdir /tmp/npm-test && cd /tmp/npm-test
npm init -y
npm install endorphin-ai@latest               # ✅ Install from NPM
npx endorphin --version                       # ✅ CLI works
npx endorphin init                            # ✅ Init creates files
npx endorphin list                            # ✅ Lists tests (or shows none)
cd / && rm -rf /tmp/npm-test
```

### Testing Matrix

| Test Type        | Installation Source | CLI Runtime           | Purpose                    |
| ---------------- | ------------------- | --------------------- | -------------------------- |
| **Pre-Release**  | Local path          | Node.js + compiled JS | Validate before publishing |
| **Post-Install** | NPM registry        | Node.js + compiled JS | Validate after publishing  |
| **Development**  | TypeScript source   | tsx + Node.js         | Framework development      |
| **Integration**  | Mixed sources       | Various               | Real-world scenarios       |

---

## 📚 Quick Reference

### Essential Commands

```bash
# Automated testing (recommended)
npm run test:pre-release              # Full pre-release test suite
npm run test:post-install             # Published package testing
npm run test:package                  # Integration testing

# Manual testing (for debugging)
./tmp/test-endorphin/setup-user-project.sh      # Setup environment
./tmp/test-endorphin/test-cli-commands.sh        # Test CLI
./tmp/test-endorphin/test-recorder-location.sh   # Test recorder isolation
./tmp/test-endorphin/cleanup.sh                 # Cleanup

# Build and package
npm run build:clean                   # Compile TypeScript → JavaScript
npm pack                             # Create package tarball
npm install $(pwd)                   # Install from local path
```

### Testing Priorities

1. **🏗️ Build First**: Always compile TypeScript before testing
2. **🧪 Automated Tests**: Use `npm run test:pre-release` for comprehensive
   validation
3. **🔍 CLI Validation**: Ensure CLI works without tsx dependency
4. **📦 Package Structure**: Verify dist/ directory includes all required files
5. **🎯 User Isolation**: Test recorder creates files in user project only

### Success Criteria

- ✅ All automated pre-release tests pass
- ✅ CLI executes with Node.js only (no tsx)
- ✅ Package installs from local path successfully
- ✅ TypeScript definitions available for TS users
- ✅ Test recorder maintains user project isolation
- ✅ Framework works in real user environments

_This comprehensive testing approach ensures every release of Endorphin AI meets
the highest quality standards for reliability, usability, and developer
experience._

## 🔧 Troubleshooting Package Testing Issues

### Common Issues and Solutions

#### 1. CLI Command Not Found After Installation

**Problem**: `npx endorphin --version` fails with "command not found"

**Diagnosis**:

```bash
# Check if package installed correctly
ls -la node_modules/.bin/endorphin
ls -la node_modules/endorphin-ai/dist/bin/endorphin.js

# Check package.json bin field
cat node_modules/endorphin-ai/package.json | jq '.bin'
```

**Solutions**:

```bash
# 1. Verify package.json points to compiled CLI
# Should be: "bin": {"endorphin": "./dist/bin/endorphin.js"}

# 2. Check if dist/ directory exists in package
ls -la node_modules/endorphin-ai/dist/

# 3. Test direct Node.js execution
node node_modules/endorphin-ai/dist/bin/endorphin.js --version

# 4. Rebuild package from source
npm run build:clean && npm pack && npm install endorphin-ai-*.tgz
```

#### 2. TypeScript Runtime Errors

**Problem**: CLI fails with TypeScript-related errors

**Diagnosis**:

```bash
# Check if compiled files contain TypeScript imports
grep -r "\.ts'" node_modules/endorphin-ai/dist/

# Check if tsx is required at runtime
node -e "require('endorphin-ai')" 2>&1 | grep tsx
```

**Solutions**:

```bash
# 1. Ensure clean build process
npm run build:clean

# 2. Verify TypeScript compiles to JavaScript with .js extensions
ls -la dist/bin/endorphin.js
grep "from.*\.js" dist/bin/endorphin.js

# 3. Check package doesn't include TypeScript source in dist/
find node_modules/endorphin-ai/dist/ -name "*.ts" | grep -v "\.d\.ts"
```

#### 3. Pre-Release Tests Failing

**Problem**: `npm run test:pre-release` fails

**Diagnosis**:

```bash
# Run individual test suites to isolate issues
npm run test:pre-release -- --testNamePattern="Local installation"
npm run test:pre-release -- --testNamePattern="CLI functionality"

# Check test output for specific failures
npm run test:pre-release --verbose
```

**Solutions**:

```bash
# 1. Ensure package is built
npm run build:clean

# 2. Check if required directories exist
ls -la dist/bin/
ls -la dist/framework/

# 3. Verify test environment is clean
rm -rf /tmp/endorphin-test-*

# 4. Run tests with debugging
DEBUG=* npm run test:pre-release
```

#### 4. Test Recorder Creates Files in Wrong Location

**Problem**: Test recorder creates files in framework directory instead of user
project

**Diagnosis**:

```bash
# Check for files in framework directory
ls -la test-recorder/ 2>/dev/null || echo "No files in framework ✅"

# Check for files in user project
ls -la tmp/test-endorphin/test-recorder/ 2>/dev/null || echo "No files in user project ❌"
```

**Solutions**:

```bash
# 1. Run isolation test
./tmp/test-endorphin/test-recorder-location.sh

# 2. Ensure proper working directory handling in code
# Check framework/test-recorder/ code for process.cwd() usage

# 3. Verify user project configuration
cat tmp/test-endorphin/endorphin.config.ts
```

#### 5. Package Installation from Local Path Fails

**Problem**: `npm install /path/to/endorphin-ai` fails

**Diagnosis**:

```bash
# Check package.json validity
npm pack --dry-run

# Verify required files exist
ls -la dist/
ls -la package.json

# Check file permissions
ls -la dist/bin/endorphin.js
```

**Solutions**:

```bash
# 1. Ensure package.json files array includes dist/
cat package.json | jq '.files'

# 2. Build before installing
npm run build:clean
npm install $(pwd)

# 3. Use absolute path
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai

# 4. Try tarball method
npm pack && npm install endorphin-ai-*.tgz
```

#### 6. TypeScript Definitions Missing

**Problem**: TypeScript users can't import types

**Diagnosis**:

```bash
# Check if type definitions exist
ls -la node_modules/endorphin-ai/dist/framework/index.d.ts

# Check package.json types field
cat node_modules/endorphin-ai/package.json | jq '.types'
```

**Solutions**:

```bash
# 1. Ensure TypeScript compilation generates declarations
cat tsconfig.json | jq '.compilerOptions.declaration'

# 2. Rebuild with type generation
npm run build:clean

# 3. Verify types export properly
cat dist/framework/index.d.ts | head -10
```

### Debug Commands Quick Reference

```bash
# Package structure validation
ls -la node_modules/endorphin-ai/dist/bin/endorphin.js      # CLI
ls -la node_modules/endorphin-ai/dist/framework/index.js     # Main entry
ls -la node_modules/endorphin-ai/dist/framework/index.d.ts   # Types

# CLI testing
npx endorphin --version                                     # NPX execution
node node_modules/.bin/endorphin --version                 # Direct execution
./node_modules/endorphin-ai/dist/bin/endorphin.js --version # Direct path

# Test environment debugging
npm run test:pre-release -- --testNamePattern="CLI functionality" --verbose
./tmp/test-endorphin/test-cli-commands.sh                  # Manual CLI test
DEBUG=* npm run test:pre-release                           # Full debug output

# Package debugging
npm pack --dry-run | head -20                              # Package contents
cat package.json | jq '{main, bin, types, files}'         # Critical fields
npm list endorphin-ai                                      # Verify installation
```

### Getting Help

1. **Check automated tests first**: `npm run test:pre-release --verbose`
2. **Run manual scripts**: Use `./tmp/test-endorphin/` scripts for debugging
3. **Verify build artifacts**: Ensure `dist/` directory has all required files
4. **Test direct execution**: Use `node dist/bin/endorphin.js` to bypass npx
5. **Check this guide**: Common solutions are documented above
