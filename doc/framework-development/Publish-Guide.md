# NPM Package Publish Guide - Endorphin AI

_Last Updated: January 2025 - v0.6.0+_

## 🎯 Overview

This guide covers the complete process for publishing new versions of the
Endorphin AI package to NPM. The framework uses **TypeScript for development**
and **ships compiled JavaScript** for universal compatibility and optimal
performance.

The publishing workflow includes **comprehensive CI/CD testing** and 
**security validation** to ensure robust and reliable releases.

**What's New in v0.6.0+:**

- ✅ **Complete CI/CD Pipeline**: Multi-platform testing (Windows, Linux, macOS) 
- ✅ **Security-First Publishing**: Automated vulnerability scanning and fixes
- ✅ **Cross-Platform CLI**: Production-ready JavaScript CLI without tsx dependency
- ✅ **Full TypeScript Support**: Complete type definitions and strict type checking
- ✅ **Multi-Environment Testing**: Development, pre-release, post-install validation
- ✅ **Automated Package Validation**: GitHub Actions integration with comprehensive testing

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

**Required Configuration for v0.6.0+:**

- [ ] `"main": "dist/framework/index.js"` (compiled JavaScript entry)
- [ ] `"bin": {"endorphin": "./dist/bin/endorphin.js", "endorphin-ai": "./dist/bin/endorphin.js"}` (dual CLI names)
- [ ] `"types": "dist/framework/index.d.ts"` (TypeScript definitions)
- [ ] `"files": ["dist/", "examples/", "README.md", "LICENSE.md", "MIGRATION-GUIDE.md"]` (essential files only)
- [ ] `"type": "module"` (ES modules for modern Node.js)
- [ ] `"engines": {"node": ">=16.0.0"}` (Node.js version requirement)
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

Current version: `0.6.0`

#### Version Increment Rules

- **Patch (0.6.1)**: Bug fixes, minor improvements, no breaking changes
- **Minor (0.7.0)**: New features, enhancements, backward compatible
- **Major (1.0.0)**: Breaking changes, major architecture updates

### Update Version

```bash
# Automated version bump with git tag
npm version patch    # 0.6.0 → 0.6.1
npm version minor    # 0.6.0 → 0.7.0
npm version major    # 0.6.0 → 1.0.0

# Manual version (no git operations)
npm version 0.6.1 --no-git-tag-version
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
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:package         # Package integration scenarios

# 🔍 CLI validation with compiled JavaScript
echo "Testing compiled CLI (production-ready):"
./dist/bin/endorphin.js --version
./dist/bin/endorphin.js help | head -10

# Verify no tsx dependency at runtime
node dist/bin/endorphin.js --version || echo "❌ CLI requires Node.js runtime fixes"

# 🔒 Security audit and vulnerability check
npm audit --audit-level=high
npm audit fix --force  # Fix critical/high vulnerabilities if found
```

**Current Testing Structure:**

The Endorphin AI project uses a comprehensive multi-layer testing approach:

1. **Development Tests** (`tests/development/`)
   - **Unit Tests**: Framework components, utilities, core functionality
   - **Integration Tests**: Component interaction, config loading, CLI commands
   - **Coverage Reports**: Code coverage analysis and reporting

2. **Package Tests** (`tests/package-tests/`)
   - **Local Installation**: Package installation and dependency validation
   - **CLI Functionality**: Command-line interface testing
   - **Integration Scenarios**: Real-world usage patterns

3. **Pre-Release Tests** (`tests/pre-release/`)
   - **Local Installation Validation**: Automated package testing
   - **Framework Integration**: Core framework functionality
   - **Real-World Scenarios**: Complete workflow validation
   - **CLI Testing**: Production CLI validation

4. **Post-Install Tests** (`tests/post-install/`)
   - **Published Package Verification**: NPM registry validation
   - **End-User Scenarios**: Installation and usage testing
   - **Interactive CLI Testing**: User experience validation

### Step 3: Validate Pre-Release Package (Automated)

The automated pre-release testing system handles most validation automatically:

```bash
# 🎯 Run comprehensive package validation
npm run test:package

# This includes:
# ✅ Local package installation validation
# ✅ CLI functionality testing with compiled JavaScript
# ✅ Framework integration testing
# ✅ Real-world scenario validation

# Additional validation (if pre-release tests exist)
if [ -d "tests/pre-release" ]; then
  cd tests/pre-release && npm test
fi
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

# 🔒 Final security check before publish
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found. Fix before publishing:"
  npm audit fix --force
  npm audit --audit-level=high  # Re-check after fixes
fi

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
npm run test:unit                     # Unit tests
npm run test:integration              # Integration tests
npm run test:package                  # Package integration tests

# CLI validation
./dist/bin/endorphin.js --version     # Test compiled CLI
node dist/bin/endorphin.js --version  # Test without npx

# Package management
npm version patch|minor|major         # Bump version and create git tag
npm pack --dry-run                    # Preview package contents
npm publish                           # Publish to NPM
```

### Package.json Configuration (v0.6.0+)

```json
{
  "name": "endorphin-ai",
  "version": "0.6.0",
  "main": "dist/framework/index.js",
  "bin": {
    "endorphin": "./dist/bin/endorphin.js",
    "endorphin-ai": "./dist/bin/endorphin.js"
  },
  "types": "dist/framework/index.d.ts",
  "type": "module",
  "files": [
    "dist/",
    "examples/",
    "README.md",
    "LICENSE.md",
    "MIGRATION-GUIDE.md"
  ],
  "engines": {
    "node": ">=16.0.0"
  }
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

### Current Test Coverage

**Development Tests:**
- Unit tests for core framework components
- Integration tests for CLI and config loading
- Code coverage reports and analysis

**Package Tests:**
- Local installation validation scripts
- CLI functionality testing
- Real-world integration scenarios

**Pre-Release Tests:** (if available)
- Automated local package testing
- Framework integration validation
- Production-ready CLI testing

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
