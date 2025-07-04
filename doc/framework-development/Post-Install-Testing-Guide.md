# Post-Install Testing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This guide covers **testing the published npm package** after it has been published to the npm registry. This validates that end users can successfully install and use Endorphin AI from npm.

## Overview

Post-install testing validates that the **published npm package** works correctly by:

1. Installing from the npm registry (`npm install endorphin-ai`)
2. Testing in fresh, clean environments
3. Validating end-user workflows
4. Ensuring no dependencies on development tools

## Testing Strategy

### Immediate Post-Publish Testing

```bash
# Test immediately after publishing
npm view endorphin-ai version
npm view endorphin-ai

# Install latest published version
mkdir /tmp/post-install-test
cd /tmp/post-install-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai@latest

# Verify installation
npx endorphin --version
```

### Automated Post-Install Validation

Create automated tests that run after publishing:

```bash
# Create test script for CI/CD
#!/bin/bash
# post-install-validation.sh

set -e

echo "🧪 Starting post-install validation..."

# Create fresh test environment
TEST_DIR="/tmp/endorphin-post-install-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize npm project
npm init -y
npm pkg set type="module"

echo "📦 Installing published package..."
npm install endorphin-ai@latest

echo "🔍 Testing CLI commands..."
npx endorphin --version
npx endorphin --help

echo "🚀 Testing initialization..."
npx endorphin init

echo "📋 Testing test discovery..."
npx endorphin list

echo "✅ Post-install validation completed successfully!"

# Cleanup
cd /
rm -rf "$TEST_DIR"
```

## Fresh Environment Testing

### Docker Container Testing

Test in completely isolated Docker environments:

```dockerfile
# Dockerfile.post-install-test
FROM node:20-alpine

WORKDIR /app

# Install package from npm
RUN npm init -y
RUN npm pkg set type="module"
RUN npm install endorphin-ai

# Test basic functionality
RUN npx endorphin --version
RUN npx endorphin --help
RUN npx endorphin init
RUN npx endorphin list

CMD ["echo", "Post-install test completed"]
```

```bash
# Build and run test
docker build -f Dockerfile.post-install-test -t endorphin-post-install-test .
docker run --rm endorphin-post-install-test
```

### Cloud Environment Testing

Test in cloud environments (GitHub Codespaces, GitPod, etc.):

```yaml
# .github/workflows/post-install-test.yml
name: Post-Install Test

on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  test-published-package:
    runs-on: ubuntu-latest
    
    steps:
    - name: Create test environment
      run: |
        mkdir endorphin-test
        cd endorphin-test
        npm init -y
        npm pkg set type="module"
        
    - name: Install published package
      run: |
        cd endorphin-test
        npm install endorphin-ai@latest
        
    - name: Test CLI functionality
      run: |
        cd endorphin-test
        npx endorphin --version
        npx endorphin --help
        npx endorphin init
        npx endorphin list
        
    - name: Test with sample test
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        cd endorphin-test
        echo "OPENAI_API_KEY=$OPENAI_API_KEY" > .env
        npx endorphin run test HEALTH-001 --headless || echo "Expected to fail without proper setup"
        
    - name: Validate package contents
      run: |
        cd endorphin-test
        ls -la node_modules/endorphin-ai/
        test -f node_modules/endorphin-ai/dist/bin/endorphin.js
        test -f node_modules/endorphin-ai/dist/framework/index.js
        test -f node_modules/endorphin-ai/dist/framework/index.d.ts
```

## End-User Workflow Testing

### Scenario 1: Complete Beginner

Simulate a developer who has never used Endorphin AI:

```bash
# Fresh system simulation
mkdir /tmp/beginner-test
cd /tmp/beginner-test

# Install package
npm init -y
npm pkg set type="module"
npm install endorphin-ai

# Follow documentation exactly
npx endorphin --help
npx endorphin init

# Check what was created
ls -la
cat endorphin.config.ts
ls -la tests/
cat tests/sample-test.ts

# Try to run a test
npx endorphin list
echo "OPENAI_API_KEY=sk-dummy" > .env
npx endorphin run test HEALTH-001 --headless

# Generate report
npx endorphin generate report
ls -la test-results/
```

### Scenario 2: Existing Project Integration

Test adding Endorphin AI to an existing project:

```bash
# Create existing project
mkdir /tmp/existing-project
cd /tmp/existing-project

# Setup existing project structure
npm init -y
npm pkg set type="module"
mkdir src tests
echo "console.log('My App');" > src/app.js
echo "export const myTest = () => 'test';" > tests/unit.test.js

# Add Endorphin AI
npm install endorphin-ai

# Initialize Endorphin
npx endorphin init

# Verify it doesn't conflict with existing structure
ls -la
ls -la tests/  # Should have both unit.test.js and sample-test.ts
```

### Scenario 3: Different Package Managers

Test with different package managers:

```bash
# Yarn testing
mkdir /tmp/yarn-test
cd /tmp/yarn-test
yarn init -y
yarn add endorphin-ai
yarn endorphin --version

# pnpm testing
mkdir /tmp/pnpm-test
cd /tmp/pnpm-test
pnpm init -y
pnpm add endorphin-ai
pnpm endorphin --version

# npm alternative registries
mkdir /tmp/registry-test
cd /tmp/registry-test
npm init -y
npm install endorphin-ai --registry https://registry.npmjs.org/
npx endorphin --version
```

## Version Compatibility Testing

### Test Multiple Node.js Versions

```bash
# Node 18 testing
nvm use 18
mkdir /tmp/node18-test
cd /tmp/node18-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai
npx endorphin --version

# Node 20 testing
nvm use 20
mkdir /tmp/node20-test
cd /tmp/node20-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai
npx endorphin --version

# Node 22 testing
nvm use 22
mkdir /tmp/node22-test
cd /tmp/node22-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai
npx endorphin --version
```

### Test Version Updates

```bash
# Test upgrading from previous version
mkdir /tmp/upgrade-test
cd /tmp/upgrade-test
npm init -y
npm pkg set type="module"

# Install previous version (if exists)
npm install endorphin-ai@0.8.0  # Example previous version
npx endorphin init

# Upgrade to latest
npm install endorphin-ai@latest
npx endorphin --version

# Test that existing config still works
npx endorphin list
```

## Platform-Specific Testing

### macOS Testing

```bash
# Test on macOS
system_profiler SPSoftwareDataType | grep "System Version"

mkdir /tmp/macos-test
cd /tmp/macos-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai

# Test macOS-specific functionality
npx endorphin init
npx endorphin list
npx endorphin run test HEALTH-001 --headless
```

### Linux Testing

```bash
# Test on Linux (Ubuntu/Debian)
lsb_release -a

mkdir /tmp/linux-test
cd /tmp/linux-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai

# Test Linux-specific functionality
npx endorphin init
npx endorphin list

# Test Playwright browser installation
npx playwright install
npx endorphin run test HEALTH-001 --headless
```

### Windows Testing (WSL)

```bash
# Test in WSL environment
wsl --version

mkdir /tmp/wsl-test
cd /tmp/wsl-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai

# Test Windows/WSL-specific functionality
npx endorphin init
npx endorphin list
```

## Integration Testing

### Test with Popular Frameworks

#### Next.js Integration

```bash
# Create Next.js project
npx create-next-app@latest nextjs-endorphin-test
cd nextjs-endorphin-test

# Add Endorphin AI
npm install endorphin-ai

# Add test scripts to package.json
npm pkg set scripts.test:e2e="endorphin run test all"

# Initialize and test
npx endorphin init
npm run test:e2e
```

#### React Integration

```bash
# Create React project
npx create-react-app react-endorphin-test
cd react-endorphin-test

# Add Endorphin AI
npm install endorphin-ai

# Initialize and test
npx endorphin init
npx endorphin list
```

#### Express.js Integration

```bash
# Create Express project
mkdir express-endorphin-test
cd express-endorphin-test
npm init -y
npm pkg set type="module"
npm install express

# Add Endorphin AI
npm install endorphin-ai

# Initialize and test local server testing
npx endorphin init
# Edit tests to point to localhost:3000
npx endorphin list
```

## Performance Validation

### Installation Speed

```bash
# Measure installation time
time npm install endorphin-ai

# Check package size
npm list endorphin-ai --depth=0
du -sh node_modules/endorphin-ai/
```

### Runtime Performance

```bash
# Measure command execution times
time npx endorphin --version
time npx endorphin --help
time npx endorphin init
time npx endorphin list
```

## Security Testing

### Audit Published Package

```bash
# Install and audit
npm install endorphin-ai
npm audit

# Check for security vulnerabilities
npm audit --audit-level high

# Validate package integrity
npm view endorphin-ai integrity
```

### Check Dependencies

```bash
# List all dependencies
npm list endorphin-ai --all

# Check for outdated dependencies
npm outdated endorphin-ai

# Verify no development dependencies in production
npm list endorphin-ai --production
```

## Error Scenarios

### Network Issues

```bash
# Test with slow network
npm install endorphin-ai --registry https://registry.npmjs.org/

# Test with network timeout
npm install endorphin-ai --fetch-timeout=1000

# Test offline behavior (if cached)
npm install endorphin-ai --offline
```

### Permission Issues

```bash
# Test global installation permissions
sudo npm install -g endorphin-ai
endorphin --version
sudo npm uninstall -g endorphin-ai

# Test local installation in restricted directory
mkdir /tmp/restricted-test
chmod 755 /tmp/restricted-test
cd /tmp/restricted-test
npm install endorphin-ai
```

## Quality Assurance Checklist

### Package Integrity
- [ ] Package installs from npm without errors
- [ ] All required files present in package
- [ ] TypeScript definitions included
- [ ] CLI binary executable
- [ ] No development dependencies in production

### Functionality
- [ ] CLI commands work correctly
- [ ] Project initialization creates proper files
- [ ] Test discovery functions
- [ ] Smart test structure works (setup/data/task)
- [ ] Cost tracking functional
- [ ] Report generation works

### Compatibility
- [ ] Works with Node.js 18, 20, 22
- [ ] Compatible with npm, yarn, pnpm
- [ ] Functions on macOS, Linux, Windows
- [ ] Integrates with popular frameworks
- [ ] No conflicts with existing projects

### Performance
- [ ] Installation completes in reasonable time
- [ ] Commands execute quickly
- [ ] Memory usage acceptable
- [ ] Package size reasonable

### Security
- [ ] No security vulnerabilities
- [ ] Dependencies up to date
- [ ] No sensitive information exposed
- [ ] Package integrity verified

## Continuous Monitoring

### Automated Post-Release Testing

```bash
# Create monitoring script
#!/bin/bash
# monitor-published-package.sh

echo "🔍 Monitoring published package..."

# Check package availability
LATEST_VERSION=$(npm view endorphin-ai version)
echo "Latest version: $LATEST_VERSION"

# Test installation
TEST_DIR="/tmp/endorphin-monitor-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

npm init -y
npm pkg set type="module"
npm install endorphin-ai@latest

# Basic functionality test
npx endorphin --version > /dev/null
npx endorphin init > /dev/null
npx endorphin list > /dev/null

echo "✅ Package monitoring completed successfully"

# Cleanup
cd /
rm -rf "$TEST_DIR"
```

### GitHub Actions Monitoring

```yaml
# .github/workflows/monitor-published.yml
name: Monitor Published Package

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    
    steps:
    - name: Test published package
      run: |
        mkdir monitor-test
        cd monitor-test
        npm init -y
        npm pkg set type="module"
        npm install endorphin-ai@latest
        npx endorphin --version
        npx endorphin init
        npx endorphin list
        
    - name: Notify on failure
      if: failure()
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: '🚨 Published package monitoring failed',
            body: 'The published npm package failed basic functionality tests. Please investigate.'
          })
```

## Rollback Procedures

If post-install testing reveals issues:

### Immediate Response

```bash
# Check current published version
npm view endorphin-ai version

# If critical issue found, deprecate version
npm deprecate endorphin-ai@current-version "Critical issue found, please use previous version"

# Point users to previous working version
npm view endorphin-ai versions --json
```

### Fix and Republish

```bash
# Fix the issue in codebase
# Run full test suite
npm test
cd dev-tests/package-tests && ./run-all-tests.sh

# Rebuild and republish
npm run build
npm version patch
npm publish

# Validate fix with post-install testing
./post-install-validation.sh
```

## Best Practices

1. **Immediate Testing**: Test within 5 minutes of publishing
2. **Multiple Environments**: Test in Docker, CI, and local environments
3. **Version Matrix**: Test with multiple Node.js versions
4. **Real Workflows**: Simulate actual user scenarios
5. **Automated Monitoring**: Set up continuous monitoring
6. **Quick Response**: Have rollback procedures ready
7. **Documentation**: Keep testing results for future reference

This comprehensive post-install testing ensures published packages work perfectly for all end users across different environments and use cases.