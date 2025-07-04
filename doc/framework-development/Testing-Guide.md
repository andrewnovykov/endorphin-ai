# Testing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This is the **main testing guide** for Endorphin AI framework development. It provides an overview of all testing approaches and links to detailed guides for each testing method.

## Overview

Endorphin AI uses a comprehensive multi-tier testing strategy to ensure framework reliability across different environments and use cases:

```
Testing Strategy
├── 🧪 Development Testing    # Automated Jest tests during development
├── 📦 Package Testing        # Manual tarball testing before publishing  
├── 🚀 Post-Install Testing   # Published npm package validation
└── 📋 Publishing Process     # Step-by-step npm publishing guide
```

## Testing Types

### 1. 🧪 Development Testing (Automated)

**Purpose**: Validate framework code during development using automated Jest tests
**Framework**: Jest with TypeScript support
**Source**: TypeScript source code
**Runtime**: tsx + Node.js

**What it tests**:
- Unit tests for individual components
- Integration tests for workflows
- Code coverage analysis
- TypeScript compilation validation

📖 **Detailed Guide**: [Development-Testing-Guide.md](./Development-Testing-Guide.md)

**Quick Commands**:
```bash
npm test                    # Run all development tests
npm run test:coverage      # Generate coverage report
npm run type-check         # TypeScript validation
npm run lint               # Code quality checks
```

### 2. 📦 Package Testing (Manual Tarball)

**Purpose**: Test the compiled package using tarball before publishing to npm
**Framework**: Manual testing + automated bash scripts
**Source**: Compiled JavaScript package
**Runtime**: Node.js only (production environment)

**What it tests**:
- Package installation from tarball
- CLI functionality with compiled JavaScript
- Smart test structure execution (setup/data/task)
- Cost tracking and reporting
- Cross-platform compatibility

📖 **Detailed Guide**: [Package-Testing-Guide.md](./Package-Testing-Guide.md)

#### Manual Tarball Testing Process

This is the **manual testing folder** approach you requested:

```bash
# 1. Build and create tarball
npm run build
npm pack

# 2. Create manual test environment
mkdir manual-test
cd manual-test

# 3. Initialize npm project
npm init -y
npm pkg set type="module"

# 4. Install from local tarball (relative path)
npm install ../endorphin-ai-*.tgz

# 5. Test CLI functionality
npx endorphin --version
npx endorphin --help
npx endorphin init

# 6. Test core features
echo "OPENAI_API_KEY=your_key_here" > .env
npx endorphin list
npx endorphin run test HEALTH-001 --headless
npx endorphin generate report

# 7. Cleanup
cd ..
rm -rf manual-test
```

**Automated Scripts**:
```bash
# Run comprehensive package tests
cd dev-tests/package-tests
./run-all-tests.sh

# Run specific test categories
./run-tests-by-category.sh init
./run-tests-by-category.sh recorder
./run-tests-by-category.sh reporter
./run-tests-by-category.sh runner
```

### 3. 🚀 Post-Install Testing (Published Package)

**Purpose**: Validate the published npm package works correctly for end users
**Framework**: Jest + manual testing
**Source**: Published npm package
**Runtime**: Fresh environments (Docker, CI, local)

**What it tests**:
- Installation from npm registry
- End-user workflows
- Platform compatibility
- Performance validation
- Security auditing

📖 **Detailed Guide**: [Post-Install-Testing-Guide.md](./Post-Install-Testing-Guide.md)

**Quick Commands**:
```bash
# Test published package immediately
mkdir /tmp/npm-test
cd /tmp/npm-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai@latest
npx endorphin --version
```

### 4. 📋 NPM Publishing Process

**Purpose**: Step-by-step guide for safely publishing to npm registry
**Framework**: Manual process with validation steps
**Source**: Compiled package
**Runtime**: Production npm registry

**What it covers**:
- Pre-publishing validation
- Version management
- Package testing
- Publishing procedures
- Rollback strategies

📖 **Detailed Guide**: [NPM-Publishing-Guide.md](./NPM-Publishing-Guide.md)

## Complete Testing Workflow

### Before Making Changes

```bash
# 1. Run development tests
npm test

# 2. Check TypeScript compilation
npm run type-check

# 3. Validate code quality
npm run lint
```

### During Development

```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test files
npm test -- dev-tests/development/unit/specific.test.ts

# Generate coverage reports
npm run test:coverage
```

### Before Publishing

```bash
# 1. Build the package
npm run build

# 2. Run development tests
npm test

# 3. Run package testing (manual tarball)
cd dev-tests/package-tests
./run-all-tests.sh
cd ../..

# 4. Create and test tarball manually
npm pack
mkdir manual-test && cd manual-test
npm init -y && npm pkg set type="module"
npm install ../endorphin-ai-*.tgz
npx endorphin --version
npx endorphin init
cd .. && rm -rf manual-test

# 5. Version bump and publish
npm version patch  # or minor/major
npm publish
```

### After Publishing

```bash
# 1. Immediate post-install validation
mkdir /tmp/post-test && cd /tmp/post-test
npm init -y && npm pkg set type="module"
npm install endorphin-ai@latest
npx endorphin --version
npx endorphin init
cd / && rm -rf /tmp/post-test

# 2. Run comprehensive post-install tests
# See Post-Install-Testing-Guide.md for details
```

## Test Directory Structure

```
dev-tests/
├── development/             # Development testing (Jest)
│   ├── unit/               # Individual component tests
│   ├── integration/        # Workflow integration tests
│   └── coverage/           # Test coverage reports
├── package-tests/          # Package testing (Bash scripts)
│   ├── run-all-tests.sh    # Automated package test runner
│   ├── scripts/            # Individual test scripts
│   ├── results/            # Test execution results
│   └── tmp/                # Temporary test environments
└── post-install/           # Post-install testing
    └── validation-scripts/ # Published package tests
```

## Manual Testing Folder Setup

For your **manual test folder** workflow:

```bash
# Create dedicated manual testing directory
mkdir manual-test
cd manual-test

# Setup script (save as setup-manual-test.sh)
#!/bin/bash
set -e

echo "🧪 Setting up manual test environment..."

# Initialize npm project
npm init -y
npm pkg set type="module"

# Install from tarball (relative path)
TARBALL_PATH="../endorphin-ai-*.tgz"
echo "📦 Installing from tarball: $TARBALL_PATH"
npm install $TARBALL_PATH

echo "✅ Manual test environment ready!"
echo "🔍 Test commands:"
echo "  npx endorphin --version"
echo "  npx endorphin --help"
echo "  npx endorphin init"
echo "  npx endorphin list"

# Test basic functionality
echo "🧪 Running basic tests..."
npx endorphin --version
npx endorphin --help
npx endorphin init

echo "✅ Manual testing setup completed!"
```

## Testing Best Practices

### 1. Test Isolation
- Each test type validates different aspects
- Use fresh environments for package testing
- Clean up test directories after use

### 2. Comprehensive Coverage
- **Development**: Code logic and TypeScript compilation
- **Package**: Real user installation experience
- **Post-Install**: Published package validation
- **Manual**: Human verification of workflows

### 3. Environment Validation
- Test with multiple Node.js versions (18, 20, 22)
- Validate on different operating systems
- Test with different package managers (npm, yarn, pnpm)

### 4. Error Scenarios
- Test with invalid API keys
- Test with missing dependencies
- Test with corrupted packages
- Test network failure scenarios

### 5. Performance Monitoring
- Measure installation times
- Monitor CLI command performance
- Track memory usage during tests
- Validate package size

## Quality Gates

Before each release, ensure:

- [ ] **Development Tests**: All Jest tests passing
- [ ] **TypeScript**: Clean compilation without errors
- [ ] **Package Tests**: Manual tarball installation works
- [ ] **CLI Functionality**: All commands work with compiled JS
- [ ] **Smart Structure**: v0.9 setup/data/task functions work
- [ ] **Cost Tracking**: Token usage and pricing tracked
- [ ] **Report Generation**: HTML reports generate correctly
- [ ] **Cross-Platform**: Works on macOS, Linux, Windows
- [ ] **Documentation**: All guides updated and accurate

## Troubleshooting

### Common Issues

#### Package Installation Fails
```bash
# Check tarball contents
tar -tzf endorphin-ai-*.tgz | head -20

# Verify required files
tar -tzf endorphin-ai-*.tgz | grep "dist/bin/endorphin.js"
tar -tzf endorphin-ai-*.tgz | grep "package.json"
```

#### CLI Commands Don't Work
```bash
# Test TypeScript source (development)
npx tsx bin/endorphin.ts --version

# Test compiled JavaScript (production)
node dist/bin/endorphin.js --version
./dist/bin/endorphin.js --version

# Check file permissions
ls -la dist/bin/endorphin.js
```

#### Tests Fail Inconsistently
```bash
# Clear caches
npm test -- --clearCache
rm -rf node_modules/.cache

# Run tests in isolation
npm test -- --runInBand --forceExit
```

## Related Documentation

- 📖 [Contributing-Guide.md](./Contributing-Guide.md) - Complete contribution workflow
- 📖 [Development-Testing-Guide.md](./Development-Testing-Guide.md) - Automated Jest testing
- 📖 [Package-Testing-Guide.md](./Package-Testing-Guide.md) - Manual tarball testing
- 📖 [Post-Install-Testing-Guide.md](./Post-Install-Testing-Guide.md) - Published package testing
- 📖 [NPM-Publishing-Guide.md](./NPM-Publishing-Guide.md) - Publishing process
- 📖 [Development-Environment-Setup-Guide.md](./Development-Environment-Setup-Guide.md) - Environment setup
- 📖 [Framework-Architecture.md](./Framework-Architecture.md) - Framework design
- 📖 [Development-Guide.md](./Development-Guide.md) - Development workflow
- 📖 [VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md) - Debugging setup

This comprehensive testing approach ensures Endorphin AI works reliably across all environments and use cases! 🧪✅