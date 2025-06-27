# NPM Package Publish Guide - Endorphin AI

_Last Updated: January 3, 2025 - v0.4.1+_

## 🎯 Overview

This guide covers the complete process for publishing new versions of the
Endorphin AI package to NPM. The framework uses **TypeScript for development**
and **ships compiled JavaScript** for universal compatibility and optimal
performance.

The publishing workflow now includes **automated pre-release testing** to
validate the local development version before publishing, ensuring robust and
reliable releases.

**What's New in v0.4.1+:**

- ✅ **Comprehensive Pre-Release Testing**: Automated validation of local
  package installation, CLI functionality, and framework features
- ✅ **Production-Ready CLI**: Compiled JavaScript CLI that works without tsx
  dependency
- ✅ **Complete Type Support**: Full TypeScript definitions for framework and
  tools
- ✅ **Robust Build Process**: TypeScript compilation with path alias resolution
- ✅ **Enhanced Package Validation**: Automated testing of package structure and
  functionality

## 🧪 Testing Strategy Overview

| Test Phase       | Purpose                        | Source              | Runtime        |
| ---------------- | ------------------------------ | ------------------- | -------------- |
| **Development**  | Unit & integration tests       | TypeScript source   | tsx/Jest       |
| **Pre-Release**  | Local package validation       | Compiled JavaScript | Node.js        |
| **Post-Install** | Published package verification | NPM registry        | Node.js        |
| **Package**      | Integration scenarios          | Mixed               | Custom scripts |

## 📦 Package Architecture

### TypeScript Development → JavaScript Distribution

```
Development (TypeScript)          Production (JavaScript)
├── framework/                 →  ├── dist/framework/         # Compiled JS + .d.ts
├── bin/endorphin.ts          →  ├── dist/bin/endorphin.js   # CLI entry point
├── framework/types/          →  ├── dist/framework/types/   # Type definitions
└── examples/                  →  └── examples/               # User templates (copied)
```

**Key Points:**

- **Develop in TypeScript** with strict types and path aliases (`@core/`,
  `@tools/`, etc.)
- **Ship compiled JavaScript** for universal Node.js compatibility
- **Include complete type definitions** for full TypeScript support
- **CLI compiles to standalone JavaScript** (no tsx dependency for end users)
- **Maintain source maps** for debugging support

## 📋 Pre-Publication Checklist

### 1. Build and Compile TypeScript

```bash
# Clean build to ensure fresh compilation
npm run build:clean

# Verify TypeScript compilation without errors
npm run type-check

# Check compiled output structure
ls -la dist/
ls -la dist/bin/
ls -la dist/framework/

# Verify critical compiled files exist
test -f dist/bin/endorphin.js && echo "✅ CLI compiled"
test -f dist/framework/index.js && echo "✅ Framework compiled"
test -f dist/framework/index.d.ts && echo "✅ Type definitions generated"
```

### 2. Run Comprehensive Test Suite

```bash
# 🧪 Development Tests (TypeScript source)
npm test                    # Jest unit & integration tests
npm run test:dev           # Development-specific tests
npm run test:coverage      # Code coverage analysis

# 🚀 Pre-Release Tests (Local package installation & CLI validation)
npm run test:pre-release   # Automated local testing workflow

# 📦 Post-Install Tests (Published package simulation)
npm run test:post-install  # Test published package behavior

# 🔍 Package-Specific Tests (Integration scenarios)
npm run test:package       # Integration test scripts
```

**Pre-Release Test Coverage:**

- ✅ Local package installation from source
- ✅ CLI functionality with compiled JavaScript
- ✅ Framework integration and core features
- ✅ E2E testing capabilities
- ✅ Test recorder functionality
- ✅ HTML report generation
- ✅ Real-world testing scenarios

### 3. Validate CLI and Package Structure

```bash
# Test CLI compilation and execution (standalone JavaScript)
./dist/bin/endorphin.js --version
./dist/bin/endorphin.js --help
./dist/bin/endorphin.js help

# Verify compiled CLI doesn't require tsx (production ready)
node dist/bin/endorphin.js --version

# Verify package structure for distribution
npm pack --dry-run | head -20

# Test complete local installation workflow (automated)
npm run test:pre-release

# Manual local installation test (if needed)
cd /tmp && mkdir test-install-$(date +%s) && cd test-install-*
npm init -y
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai
npx endorphin --version    # Should work without tsx dependency
npx endorphin --help       # Should show help
npx endorphin init         # Should create project files
ls -la                     # Verify files created
cd / && rm -rf /tmp/test-install-*
```

### 4. Verify Documentation and Examples

- [ ] README.md reflects current functionality
- [ ] User guides are up to date
- [ ] Framework development docs are current
- [ ] Examples in `/examples/` work with current version
- [ ] TypeScript definitions are complete
- [ ] API documentation matches implementation

### 5. Validate Package Configuration

```bash
# Check package.json configuration
cat package.json | jq '{
  name, version, main, bin, types, files,
  dependencies: .dependencies | keys,
  devDependencies: .devDependencies | keys
}'

# Verify critical package.json fields
echo "Main entry: $(node -p 'require("./package.json").main')"
echo "CLI binary: $(node -p 'require("./package.json").bin.endorphin')"
echo "Types: $(node -p 'require("./package.json").types')"
echo "Files: $(node -p 'require("./package.json").files')"
```

**Required Configuration for v0.4.1+:**

- [ ] `"main": "dist/framework/index.js"` (compiled JavaScript entry)
- [ ] `"bin": {"endorphin": "./dist/bin/endorphin.js"}` (compiled CLI, no tsx)
- [ ] `"types": "dist/framework/index.d.ts"` (TypeScript definitions)
- [ ] `"files": ["dist/", "framework/", "bin/", "examples/", ...]` (include
      dist/)
- [ ] `"type": "module"` (ES modules for modern Node.js)
- [ ] Dependencies are up to date and secure

**Critical Build Artifacts:**

```bash
# Verify all required files exist
ls -la dist/bin/endorphin.js                    # CLI entry
ls -la dist/framework/index.js                  # Main entry
ls -la dist/framework/index.d.ts                # Type definitions
ls -la dist/framework/types/                    # Type definitions directory
ls -la dist/framework/core/                     # Core framework
ls -la dist/framework/tools/                    # Browser tools
```

## 🔢 Version Management

### Semantic Versioning (SemVer)

Current version: `0.4.1`

#### Version Increment Rules

- **Patch (0.4.2)**: Bug fixes, minor improvements, no breaking changes
- **Minor (0.5.0)**: New features, enhancements, backward compatible
- **Major (1.0.0)**: Breaking changes, major architecture updates

### Update Version

```bash
# Automated version bump with git tag
npm version patch    # 0.4.1 → 0.4.2
npm version minor    # 0.4.1 → 0.5.0
npm version major    # 0.4.1 → 1.0.0

# Manual version (no git operations)
npm version 0.4.2 --no-git-tag-version
```

## 🚀 Publication Process

### Step 1: Prepare for Release

```bash
# Ensure clean working directory
git checkout main
git pull origin main
git status  # Should be clean

# Verify current version and build status
echo "Current version: $(node -p 'require("./package.json").version')"
echo "TypeScript compilation status:"
npm run type-check
```

### Step 2: Build and Test Complete Workflow

```bash
# 🏗️ Clean build process
npm run build:clean          # Remove old dist/, rebuild fresh

# 🧪 Comprehensive automated testing workflow
npm test                     # Development tests (TypeScript source)
npm run test:pre-release     # Automated local package tests (JavaScript)
npm run test:package         # Integration test scenarios

# 🔍 CLI validation with compiled JavaScript
echo "Testing compiled CLI (production-ready):"
./dist/bin/endorphin.js --version
./dist/bin/endorphin.js help | head -10

# Verify no tsx dependency at runtime
node dist/bin/endorphin.js --version || echo "❌ CLI requires Node.js runtime fixes"
```

**Pre-Release Testing Details:**

The `npm run test:pre-release` command runs comprehensive automated tests:

1. **Local Installation Test** (`local-installation.test.ts`)
   - Tests local package installation from development source
   - Verifies package.json configuration
   - Validates file structure and dependencies

2. **CLI Functionality Test** (`cli-functionality.test.ts`)
   - Tests all CLI commands with compiled JavaScript
   - Validates help, version, list, init commands
   - Ensures CLI works without tsx dependency

3. **E2E Testing** (`e2e-testing.test.ts`)
   - Tests browser automation and AI integration
   - Validates framework core functionality
   - Tests tool execution and result handling

4. **Test Recorder** (`test-recorder.test.ts`)
   - Validates interactive test recording
   - Tests session recording and playback
   - Ensures recorder isolation and cleanup

5. **Test Reporter** (`test-reporter.test.ts`)
   - Tests HTML report generation
   - Validates console reporting
   - Checks report formatting and content

6. **Real-World Scenarios** (`real-world-scenarios.test.ts`)
   - Tests complete workflows end-to-end
   - Validates realistic usage patterns
   - Tests integration with example projects

### Step 3: Validate Pre-Release Package (Automated)

The automated pre-release testing system handles most validation automatically:

```bash
# 🎯 Run automated pre-release validation
npm run test:pre-release

# This automated workflow includes:
# ✅ Local package installation from development source
# ✅ CLI functionality testing with compiled JavaScript
# ✅ Framework integration testing
# ✅ E2E testing capabilities validation
# ✅ Test recorder functionality verification
# ✅ HTML report generation testing
# ✅ Real-world scenario validation
```

**Manual Pre-Release Validation (if needed):**

```bash
# 📦 Manual test if automated tests fail or need debugging
echo "🧪 Manual local package installation test..."

# Create isolated test environment
TEST_DIR="/tmp/endorphin-prerelease-$(date +%s)"
mkdir -p "$TEST_DIR" && cd "$TEST_DIR"

# Test local installation from development source
npm init -y
npm install "$OLDPWD"  # Install from project directory

# Verify CLI functionality without tsx dependency
echo "Testing CLI commands:"
npx endorphin --version      # Should show version
npx endorphin help           # Should show help
npx endorphin list || echo "No tests found (expected in empty project)"

# Test project initialization
npx endorphin init
ls -la  # Should show created files (endorphin.config.ts, etc.)

# Test CLI with Node.js directly (no npx)
node node_modules/.bin/endorphin --version

# Verify TypeScript support
if command -v tsc >/dev/null 2>&1; then
  echo "Testing TypeScript integration:"
  node -e "
    try {
      const config = require('endorphin-ai/dist/framework/index.js');
      console.log('✅ JavaScript import works');
      console.log('Available exports:', Object.keys(config));
    } catch(e) {
      console.log('❌ JavaScript import failed:', e.message);
    }
  "

  # Test TypeScript definitions if available
  if test -f node_modules/endorphin-ai/dist/framework/index.d.ts; then
    echo "✅ TypeScript definitions found"
  else
    echo "❌ TypeScript definitions missing"
  fi
fi

# Test framework functionality
echo "Testing framework functionality:"
npx endorphin list || echo "✅ No tests found in empty project (expected)"

# Cleanup
cd "$OLDPWD" && rm -rf "$TEST_DIR" "$PACKAGE_FILE"
echo "✅ Manual pre-release package validation completed"
```

### Step 4: Update Version and Create Git Tag

```bash
# Choose version increment type
echo "Current: $(node -p 'require("./package.json").version')"
read -p "Version increment (patch/minor/major/specific): " VERSION_TYPE

if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  # Specific version provided
  npm version "$VERSION_TYPE"
elif [[ "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  # Standard increment
  npm version "$VERSION_TYPE"
else
  echo "❌ Invalid version type"
  exit 1
fi

# This automatically:
# 1. Updates package.json version
# 2. Creates git commit with version bump
# 3. Creates git tag (e.g., v0.4.2)
```

### Step 5: Verify Final Package Contents

```bash
# 📋 Pack and inspect package contents
npm pack
PACKAGE_FILE=$(ls endorphin-ai-*.tgz)
echo "📦 Package: $PACKAGE_FILE"

# Inspect package structure
echo "📂 Package contents:"
tar -tzf "$PACKAGE_FILE" | grep -E '^package/(dist|examples|README)' | head -20

# Verify critical files are included
echo "🔍 Verifying critical files:"
tar -tzf "$PACKAGE_FILE" | grep -q "package/dist/bin/endorphin.js" && echo "✅ CLI binary included"
tar -tzf "$PACKAGE_FILE" | grep -q "package/dist/framework/index.js" && echo "✅ Main entry included"
tar -tzf "$PACKAGE_FILE" | grep -q "package/dist/framework/index.d.ts" && echo "✅ Type definitions included"
tar -tzf "$PACKAGE_FILE" | grep -q "package/examples/" && echo "✅ Examples included"

# Check package size
PACKAGE_SIZE=$(ls -lh "$PACKAGE_FILE" | awk '{print $5}')
echo "📏 Package size: $PACKAGE_SIZE"
```

### Step 6: Test Final Packaged Version

```bash
# 🧪 Test the exact package that will be published
echo "🔬 Testing packaged version..."

TEST_DIR="/tmp/endorphin-package-test-$(date +%s)"
mkdir -p "$TEST_DIR" && cd "$TEST_DIR"

# Install from local tarball (simulates npm install exactly)
npm init -y
npm install "$OLDPWD/$PACKAGE_FILE"

# Test functionality exactly as end users will experience
echo "Testing end-user experience:"
npx endorphin --version     # Should work without tsx
npx endorphin help | head -3 # Should show help
npx endorphin init          # Should create config files
ls -la | grep -E '\.(ts|js|md)$' || true

# Test direct Node.js execution (no npx wrapper)
echo "Testing direct Node.js execution:"
node node_modules/.bin/endorphin --version

# Verify TypeScript support
if command -v tsc >/dev/null 2>&1; then
  echo "Testing TypeScript integration:"
  node -e "
    try {
      const config = require('endorphin-ai/dist/framework/index.js');
      console.log('✅ JavaScript import works');
      console.log('Available exports:', Object.keys(config));
    } catch(e) {
      console.log('❌ JavaScript import failed:', e.message);
    }
  "

  # Test TypeScript definitions if available
  if test -f node_modules/endorphin-ai/dist/framework/index.d.ts; then
    echo "✅ TypeScript definitions found"
  else
    echo "❌ TypeScript definitions missing"
  fi
fi

# Test framework functionality
echo "Testing framework functionality:"
npx endorphin list || echo "✅ No tests found in empty project (expected)"

# Cleanup
cd "$OLDPWD" && rm -rf "$TEST_DIR" "$PACKAGE_FILE"
```

### Step 7: Publish to NPM

```bash
# 🔐 Verify NPM authentication
npm whoami  # Verify correct account
npm config get registry  # Should be https://registry.npmjs.org/

# Login if needed
npm login

# 🚀 Publish the package
echo "🚀 Publishing to NPM..."
npm publish

# For pre-release versions (optional)
npm publish --tag beta     # npm install endorphin-ai@beta
npm publish --tag alpha    # npm install endorphin-ai@alpha
npm publish --tag next     # npm install endorphin-ai@next
```

### Step 8: Push Git Changes and Verify

```bash
# 📤 Push version commit and tags to git
git push origin main
git push origin --tags

# ✅ Verify publication on NPM
echo "🔍 Verifying NPM publication..."
sleep 10  # Wait for NPM propagation

# Check package info
npm view endorphin-ai version
npm view endorphin-ai dist-tags

# Test fresh installation from NPM
echo "🧪 Testing fresh NPM installation..."
VERIFY_DIR="/tmp/endorphin-verify-$(date +%s)"
mkdir -p "$VERIFY_DIR" && cd "$VERIFY_DIR"

npm init -y
npm install endorphin-ai@latest
npx endorphin --version
npx endorphin help | head -3

cd "$OLDPWD" && rm -rf "$VERIFY_DIR"
echo "✅ NPM publication verified"
```

## 📚 Quick Reference

### Essential Commands

```bash
# Build and compile
npm run build:clean                    # Clean build TypeScript → JavaScript
npm run type-check                     # Verify TypeScript compilation

# Testing workflow
npm test                              # Development tests (TypeScript)
npm run test:pre-release              # Local package tests (JavaScript)
npm run test:post-install             # Published package tests
npm run test:package                  # Integration tests

# CLI validation
./dist/bin/endorphin.js --version     # Test compiled CLI
node dist/bin/endorphin.js --version  # Test without npx

# Package management
npm version patch|minor|major         # Bump version and create git tag
npm pack --dry-run                    # Preview package contents
npm publish                           # Publish to NPM
```

### Package.json Configuration (v0.4.1+)

```json
{
  "name": "endorphin-ai",
  "version": "0.4.1",
  "main": "dist/framework/index.js",
  "bin": {
    "endorphin": "./dist/bin/endorphin.js"
  },
  "types": "dist/framework/index.d.ts",
  "type": "module",
  "files": [
    "dist/",
    "framework/",
    "bin/",
    "examples/",
    "README.md",
    "LICENSE.md"
  ]
}
```

### Critical Build Artifacts

```
dist/
├── bin/
│   └── endorphin.js          # Compiled CLI (production-ready)
├── framework/
│   ├── index.js              # Main framework entry
│   ├── index.d.ts            # TypeScript definitions
│   ├── core/                 # Core utilities (compiled)
│   ├── tools/                # Browser tools (compiled)
│   └── types/                # Type definitions
└── ...                       # Other compiled modules
```

### Pre-Release Test Coverage

- **Local Installation** (`local-installation.test.ts`)
- **CLI Functionality** (`cli-functionality.test.ts`)
- **Framework Integration** (`framework-integration.test.ts`)
- **E2E Testing** (`e2e-testing.test.ts`)
- **Test Recorder** (`test-recorder.test.ts`)
- **HTML Reporter** (`test-reporter.test.ts`)
- **Real-World Scenarios** (`real-world-scenarios.test.ts`)

### Troubleshooting Quick Fixes

```bash
# CLI not found after install
ls -la dist/bin/endorphin.js          # Verify compiled CLI exists
cat package.json | jq '.bin'          # Check bin field

# TypeScript import errors
npm run build:clean                    # Rebuild from scratch
grep -r "\.ts'" dist/                  # Check for TS imports in JS

# Package validation fails
npm pack --dry-run | grep dist/        # Verify dist/ included
test -f dist/framework/index.d.ts      # Check type definitions
```

---

_The Endorphin AI framework is designed for reliability and ease of use. This
publishing guide ensures every release meets the highest quality standards
through comprehensive automated testing._
