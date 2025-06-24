# Test Package Guide - Endorphin AI

_Last Updated: June 22, 2025_

## 🎯 Overview

This guide covers testing the Endorphin AI package from a user's perspective -
installing it as a dependency and running tests with it. This is different from
testing the framework's internal code.

## 🚀 Quick Start with Automated Scripts

We've created automated bash scripts in `tmp/test-endorphin/` for easy package
testing:

### Available Scripts

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

```bash
# Full test workflow
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
```

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
cat > endorphin.config.js << 'EOF'
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
cat > tests/basic-test.js << 'EOF'
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

#### Local Development Installation

```bash
# Install from local path (for pre-release testing)
npm install /path/to/endorphin-ai

# Or from tarball
npm pack /path/to/endorphin-ai
npm install endorphin-ai-*.tgz
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
cat > endorphin.config.js << 'EOF'
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

#### Vite Project

```bash
# Create Vite project
npm create vite@latest my-vite-app
cd my-vite-app
npm install

# Install endorphin-ai
npm install endorphin-ai

# Create test configuration
# ... similar setup as above
```

### 7. Error Scenario Testing

Test how the package handles various error conditions:

#### Missing Configuration

```bash
# Test without config file
rm endorphin.config.js
npx endorphin list  # Should show appropriate error

# Test with invalid config
echo "invalid javascript" > endorphin.config.js
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

## 🔧 Package Testing Automation

### Automated Test Scripts (Recommended)

We provide ready-made bash scripts in `tmp/test-endorphin/` for comprehensive
package testing:

#### `setup-user-project.sh`

- Creates isolated user project environment
- Installs endorphin-ai from local framework
- Creates proper configuration files
- Uses API key from framework's `.env`
- Sets up test directory structure

#### `test-recorder-location.sh`

- **Critical Test**: Verifies test recorder creates files in user project
- Ensures no artifacts leak into framework directory
- Tests proper user project isolation
- Shows before/after directory states

#### `test-cli-commands.sh`

- Tests all CLI commands work from user project
- Verifies package installation
- Tests configuration loading
- Validates test discovery

#### `run-user-tests.sh`

- Executes user project tests
- Validates generated test files
- Tests end-to-end functionality

#### `cleanup.sh`

- Removes generated files
- Preserves bash scripts
- Resets test environment

### Script Features

- **API Key Sharing**: Uses framework's `.env` file automatically
- **Isolated Testing**: Creates separate user project environment
- **Comprehensive Coverage**: Tests installation, CLI, recorder, execution
- **Easy Cleanup**: One command to reset everything
- **Gitignore Ready**: Only scripts are tracked, generated files ignored

### Legacy Manual Testing

### Legacy Automated Test Script

For reference, here's a traditional approach (use our bash scripts instead):

```bash
#!/bin/bash
# package-test.sh (LEGACY - Use tmp/test-endorphin/ scripts instead)

set -e

echo "🧪 Starting Endorphin AI Package Testing"

# Create temp directory
TEST_DIR=$(mktemp -d)
echo "📁 Test directory: $TEST_DIR"
cd "$TEST_DIR"

# Initialize project
echo "🚀 Initializing test project..."
npm init -y > /dev/null 2>&1

# Install package
echo "📦 Installing endorphin-ai..."
npm install endorphin-ai > /dev/null 2>&1

# Create config
echo "⚙️ Creating configuration..."
cat > endorphin.config.js << 'EOF'
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: { headless: true },
  resultsDir: "./test-results"
};
EOF

# Create test
echo "📝 Creating test files..."
mkdir tests
cat > tests/package-test.js << 'EOF'
export const PACKAGE_TEST = {
  id: "PKG-001",
  name: "Package Installation Test",
  description: "Verify package works after installation",
  priority: "High",
  tags: ["package", "installation"],
  site: "https://httpbin.org/get",
  task: "Navigate to httpbin and verify the page loads"
};
EOF

# Test commands
echo "🔍 Testing CLI commands..."
npx endorphin --version
npx endorphin list
echo "✅ Basic commands work"

# Run test (if API key available)
if [ -n "$OPENAI_API_KEY" ]; then
  echo "🤖 Running AI test..."
  npx endorphin run test PKG-001
  echo "✅ AI test completed"
else
  echo "⚠️ Skipping AI test (no API key)"
fi

# Cleanup
echo "🧹 Cleaning up..."
cd /
rm -rf "$TEST_DIR"

echo "✅ Package testing completed successfully!"
```

### CI/CD Integration

Example GitHub Actions workflow for package testing:

```yaml
# .github/workflows/package-test.yml
name: Package Testing

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  package-test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Build package
        run: npm run build

      - name: Pack package
        run: npm pack

      - name: Test package installation
        run: |
          mkdir package-test
          cd package-test
          npm init -y
          npm install ../endorphin-ai-*.tgz
          npx endorphin --version
          npx endorphin list || true
```

## 📋 Testing Checklist

### Pre-Release Testing (Automated)

```bash
# Quick automated testing
./tmp/test-endorphin/setup-user-project.sh      # ✅ Setup user environment
./tmp/test-endorphin/test-cli-commands.sh        # ✅ CLI commands work
./tmp/test-endorphin/test-recorder-location.sh   # ✅ Recorder file location
./tmp/test-endorphin/run-user-tests.sh          # ✅ Test execution
./tmp/test-endorphin/cleanup.sh                 # ✅ Clean environment
```

### Pre-Release Testing (Manual Checklist)

- [ ] Fresh installation in empty directory (`setup-user-project.sh`)
- [ ] All CLI commands work (`test-cli-commands.sh`)
- [ ] Configuration loading works
- [ ] Test discovery works
- [ ] **Test recorder creates files in user project, not framework**
      (`test-recorder-location.sh`)
- [ ] Error handling is graceful
- [ ] Cross-platform compatibility
- [ ] Multiple Node.js versions
- [ ] NPX usage works
- [ ] Global installation works
- [ ] Package scripts integration works

### Post-Release Testing

- [ ] Install from NPM registry
- [ ] Version matches expected
- [ ] All functionality works as published
- [ ] Documentation examples work
- [ ] No missing dependencies
- [ ] Test recorder isolation still works

### Critical Tests

- [ ] **File Location Test**: Recorder creates files in user project only
- [ ] **API Key Inheritance**: Uses framework's `.env` automatically
- [ ] **Package Isolation**: No cross-contamination between framework and user
      files

---

_This guide should be run before every release to ensure package quality. Use
the automated scripts in `tmp/test-endorphin/` for efficient testing._
