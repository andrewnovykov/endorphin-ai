# NPM Package Publish Guide - Endorphin AI

*Last Updated: June 22, 2025*

## 🎯 Overview

This guide covers the complete process for publishing new versions of the Endorphin AI package to NPM. Follow these steps to ensure a smooth and reliable release process.

## 📋 Pre-Publication Checklist

### 1. Run Full Test Suite
```bash
# Run all framework tests
npm test

# Run specific test suites
npm run test:recorder
npm run test:coverage

# Run integration tests
npm run framework:test
```

### 2. Test Package Installation (Critical)
```bash
# Use our automated testing scripts
./tmp/test-endorphin/setup-user-project.sh
./tmp/test-endorphin/test-cli-commands.sh
./tmp/test-endorphin/test-recorder-location.sh
./tmp/test-endorphin/cleanup.sh
```

### 3. Verify Documentation
- [ ] README.md is up to date
- [ ] User guides reflect current functionality
- [ ] Framework development docs are current
- [ ] Examples work with current version

### 4. Check Package Configuration
- [ ] `package.json` version is correct
- [ ] `files` array includes all necessary files
- [ ] Dependencies are up to date
- [ ] License information is correct

## 🔢 Version Management

### Semantic Versioning (SemVer)
Current version: `0.1.0`

#### Version Increment Rules
- **Patch (0.1.1)**: Bug fixes, minor improvements
- **Minor (0.2.0)**: New features, non-breaking changes
- **Major (1.0.0)**: Breaking changes, major releases

### Update Version
```bash
# Patch version (0.1.0 → 0.1.1)
npm version patch

# Minor version (0.1.0 → 0.2.0)
npm version minor

# Major version (0.1.0 → 1.0.0)
npm version major

# Specific version
npm version 0.1.1
```

## 🚀 Publication Process

### Step 1: Prepare for Release
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Check git status (should be clean)
git status

# Verify current version
npm version --no-git-tag-version
```

### Step 2: Run Pre-Publication Tests
```bash
# Full test suite
npm test

# Package testing
echo "🧪 Testing package installation..."
./tmp/test-endorphin/setup-user-project.sh
./tmp/test-endorphin/test-cli-commands.sh
./tmp/test-endorphin/test-recorder-location.sh

# Verify test recorder creates files in USER project, not framework
if [ -d "test-recorder" ] && [ "$(ls -A test-recorder)" ]; then
  echo "❌ ERROR: test-recorder directory has files in framework!"
  exit 1
else
  echo "✅ Test recorder isolation verified"
fi

./tmp/test-endorphin/cleanup.sh
```

### Step 3: Update Version and Create Git Tag
```bash
# Update version (creates git tag automatically)
npm version patch  # or minor/major

# This command:
# 1. Updates package.json version
# 2. Creates git commit with version bump
# 3. Creates git tag (e.g., v0.1.1)
```
🔧 Method 1: Direct Version Set (Recommended)
###  Set specific version directly
npm version 0.3.0 --no-git-tag-version

# Then create the git commit and tag manually
git add package.json
git commit -m "0.3.0"
git tag v0.3.0


### Step 4: Verify Package Contents
```bash
# Pack the package to see what will be published
npm pack

# Check contents
tar -tzf endorphin-ai-*.tgz

# Verify file structure
tar -xzf endorphin-ai-*.tgz
ls -la package/

# Cleanup
rm endorphin-ai-*.tgz
rm -rf package/
```

### Step 5: Test Packed Package
```bash
# Create test environment
mkdir temp-package-test
cd temp-package-test

# Pack and install from tarball
npm pack ../
npm init -y
npm install endorphin-ai-*.tgz

# Test basic functionality
npx endorphin --version
npx endorphin list || true

# Cleanup
cd ..
rm -rf temp-package-test
```

### Step 6: Publish to NPM
```bash
# Login to NPM (if not already logged in)
npm login

# Verify you're logged in with correct account
npm whoami

# Publish the package
npm publish

# For beta/alpha releases
npm publish --tag beta
npm publish --tag alpha
```

### Step 7: Push Changes to Git
```bash
# Push the version commit and tag
git push origin main
git push origin --tags
```

### Step 8: Verify Publication
```bash
# Check on NPM registry
npm view endorphin-ai

# Test installation from NPM
mkdir test-npm-install
cd test-npm-install
npm init -y
npm install endorphin-ai
npx endorphin --version
cd ..
rm -rf test-npm-install
```

## 🔧 Automated Publication Script

Create a complete automation script:

```bash
#!/bin/bash
# publish.sh

set -e

echo "🚀 Endorphin AI Publication Script"
echo "=================================="

# Verify we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Must be on main branch. Currently on: $BRANCH"
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Uncommitted changes detected. Please commit or stash."
  git status
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Run tests
echo "🧪 Running test suite..."
npm test

# Package testing
echo "📦 Testing package installation..."
./tmp/test-endorphin/setup-user-project.sh
./tmp/test-endorphin/test-cli-commands.sh
./tmp/test-endorphin/test-recorder-location.sh

# Verify no files in framework test-recorder
if [ -d "test-recorder" ] && [ "$(ls -A test-recorder)" ]; then
  echo "❌ ERROR: Files found in framework test-recorder directory!"
  ls -la test-recorder/
  ./tmp/test-endorphin/cleanup.sh
  exit 1
fi

./tmp/test-endorphin/cleanup.sh
echo "✅ Package testing completed"

# Get version type from user
echo "📝 Current version: $(npm version --no-git-tag-version)"
read -p "Version increment (patch/minor/major): " VERSION_TYPE

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "❌ Invalid version type. Use: patch, minor, or major"
  exit 1
fi

# Update version and create tag
echo "🔢 Updating version ($VERSION_TYPE)..."
NEW_VERSION=$(npm version $VERSION_TYPE)
echo "✅ Updated to version: $NEW_VERSION"

# Pack and verify
echo "📦 Packing and verifying package..."
npm pack
PACKAGE_FILE=$(ls endorphin-ai-*.tgz)
echo "📋 Package contents:"
tar -tzf $PACKAGE_FILE | head -20

# Test packed package
echo "🧪 Testing packed package..."
mkdir temp-package-test
cd temp-package-test
npm init -y > /dev/null 2>&1
npm install ../$PACKAGE_FILE > /dev/null 2>&1
VERSION_CHECK=$(npx endorphin --version)
echo "✅ Package test version: $VERSION_CHECK"
cd ..
rm -rf temp-package-test $PACKAGE_FILE

# Confirm publication
echo "🚨 Ready to publish $NEW_VERSION to NPM"
read -p "Continue with publication? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "❌ Publication cancelled"
  exit 0
fi

# Publish
echo "🚀 Publishing to NPM..."
npm publish

# Push to git
echo "📤 Pushing to git..."
git push origin main
git push origin --tags

# Verify publication
echo "✅ Verifying publication..."
sleep 5  # Wait for NPM to propagate
npm view endorphin-ai version

echo "🎉 Publication completed successfully!"
echo "📦 Package: endorphin-ai@$NEW_VERSION"
echo "🔗 NPM: https://www.npmjs.com/package/endorphin-ai"
echo "🔗 Git: https://github.com/andrewnovykov/endorphin-ai/releases/tag/$NEW_VERSION"
```

## 📊 Post-Publication Tasks

### 1. Create GitHub Release
```bash
# Go to GitHub releases page
open https://github.com/andrewnovykov/endorphin-ai/releases

# Or use GitHub CLI
gh release create v0.1.1 \
  --title "Endorphin AI v0.1.1" \
  --notes "Release notes here"
```

### 2. Update Documentation
- [ ] Update README with new version examples
- [ ] Update installation instructions if needed
- [ ] Add changelog entry
- [ ] Update migration guide if breaking changes

### 3. Test Installation from NPM
```bash
# Test fresh installation
mkdir npm-test
cd npm-test
npm init -y
npm install endorphin-ai@latest
npx endorphin --version
npx endorphin list
cd ..
rm -rf npm-test
```

### 4. Notify Users
- [ ] Update documentation with new features
- [ ] Post release notes if significant changes
- [ ] Update any example repositories

## 🚨 Emergency Procedures

### Unpublish a Version (24h window)
```bash
# Only within 24 hours of publication
npm unpublish endorphin-ai@0.1.1

# Unpublish entire package (use with extreme caution)
npm unpublish endorphin-ai --force
```

### Deprecate a Version
```bash
# Deprecate a specific version
npm deprecate endorphin-ai@0.1.0 "Please upgrade to 0.1.1"

# Deprecate all versions below a certain version
npm deprecate endorphin-ai@"<0.1.1" "Please upgrade to 0.1.1 or higher"
```

### Fix Critical Issues
```bash
# For critical bugs, immediately publish patch
npm version patch
# Fix the issue
npm test
npm publish
git push origin main --tags
```

## 📋 Release Checklist Template

Copy this checklist for each release:

### Pre-Release
- [ ] All tests pass (`npm test`)
- [ ] Package testing passes (`./tmp/test-endorphin/` scripts)
- [ ] Test recorder isolation verified
- [ ] Documentation updated
- [ ] Version number chosen (patch/minor/major)
- [ ] Git status clean
- [ ] On main branch

### Release
- [ ] Version bumped (`npm version`)
- [ ] Package contents verified (`npm pack`)
- [ ] Packed package tested
- [ ] Published to NPM (`npm publish`)
- [ ] Git pushed with tags
- [ ] NPM publication verified

### Post-Release
- [ ] GitHub release created
- [ ] Fresh NPM installation tested
- [ ] Documentation updated with new version
- [ ] Users notified if needed

## 🔐 Security Considerations

### NPM Authentication
```bash
# Use npm tokens for CI/CD
npm token create --read-only
npm token create --publish

# Set in environment
export NPM_TOKEN="your-token-here"
```

### Two-Factor Authentication
- Enable 2FA on your NPM account
- Use `npm publish --otp=123456` if required

### Package Signing
```bash
# Sign packages (optional)
npm publish --dry-run
npm audit signatures
```

---

*Always test thoroughly before publishing. A good release is better than a fast release.*