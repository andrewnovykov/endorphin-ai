# NPM Publishing Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This guide provides **step-by-step instructions** for publishing Endorphin AI to npm registry, including all preparation, validation, and post-publish steps.

## Prerequisites

### 1. NPM Account Setup

```bash
# Create npm account (if not exists)
# Go to https://www.npmjs.com/signup

# Login to npm
npm login

# Verify login
npm whoami
# Should show your npm username

# Check npm configuration
npm config list
```

### 2. Repository Access

```bash
# Verify you have push access to repository
git remote -v
git status

# Ensure you're on the main/develop branch
git branch
git checkout develop  # or main
```

### 3. Development Environment

```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify npm version
npm --version   # Should be 8+

# Install dependencies
npm install

# Verify development tests pass
npm test
```

## Pre-Publishing Checklist

### 1. Code Quality Validation

```bash
# Run full test suite
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Test coverage
npm run test:coverage
```

### 2. Package Testing

```bash
# Build the package
npm run build

# Verify build output
ls -la dist/bin/endorphin.js
ls -la dist/framework/index.js
ls -la dist/framework/index.d.ts

# Run package tests
cd dev-tests/package-tests
./run-all-tests.sh
cd ../..

# Verify test results
echo "✅ All package tests should pass"
```

### 3. Documentation Updates

```bash
# Update version in documentation (if needed)
# Check these files for version references:
grep -r "v0\." doc/
grep -r "version" README.md

# Update CHANGELOG.md
# Add new version section with changes

# Commit documentation updates
git add .
git commit -m "docs: update documentation for v0.9.x"
```

## Version Management

### 1. Determine Version Type

Choose version bump type based on changes:

- **Patch** (0.9.0 → 0.9.1): Bug fixes, small improvements
- **Minor** (0.9.0 → 0.10.0): New features, non-breaking changes  
- **Major** (0.9.0 → 1.0.0): Breaking changes

### 2. Update Version

```bash
# For patch release (bug fixes)
npm version patch

# For minor release (new features)
npm version minor

# For major release (breaking changes)
npm version major

# For pre-release (beta, alpha)
npm version prerelease --preid=beta

# Verify version updated
cat package.json | grep version
git log --oneline -1  # Should show version commit
```

### 3. Update Related Files

```bash
# Check if any files reference the old version
grep -r "0\.9\.0" . --exclude-dir=node_modules --exclude-dir=.git

# Update any hardcoded version references
# Common files to check:
# - README.md
# - doc/user-guide/*.md
# - doc/framework-development/*.md
# - CLAUDE.md

# Commit version updates
git add .
git commit -m "chore: update version references to $(cat package.json | jq -r .version)"
```

## Build and Package Preparation

### 1. Clean Build

```bash
# Clean any previous builds
rm -rf dist/

# Fresh build
npm run build

# Verify all required files are built
ls -la dist/
ls -la dist/bin/endorphin.js
ls -la dist/framework/index.js
ls -la dist/framework/index.d.ts
```

### 2. Package Content Validation

```bash
# Create package tarball for testing
npm pack

# Verify package contents
tar -tzf endorphin-ai-*.tgz | head -20

# Check package includes required files
tar -tzf endorphin-ai-*.tgz | grep "dist/bin/endorphin.js"
tar -tzf endorphin-ai-*.tgz | grep "dist/framework/index.js"
tar -tzf endorphin-ai-*.tgz | grep "package.json"
tar -tzf endorphin-ai-*.tgz | grep "README.md"

# Check package.json configuration
cat package.json | jq '.main'      # Should be dist/framework/index.js
cat package.json | jq '.bin'       # Should be dist/bin/endorphin.js
cat package.json | jq '.types'     # Should be dist/framework/index.d.ts
cat package.json | jq '.files'     # Should include dist/, examples/, etc.
```

### 3. Final Testing

```bash
# Test the tarball installation locally
mkdir /tmp/final-test
cd /tmp/final-test
npm init -y
npm pkg set type="module"

# Install from tarball
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz

# Test basic functionality
npx endorphin --version
npx endorphin init
npx endorphin list

# Cleanup
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
rm -rf /tmp/final-test
```

## Publishing Process

### 1. Dry Run

```bash
# Perform a dry run to see what would be published
npm publish --dry-run

# Review the output carefully
# Should show all files that will be included
# Verify no sensitive files are included
```

### 2. Publish to NPM

```bash
# Publish to npm registry
npm publish

# For beta/pre-release versions
npm publish --tag beta

# For scoped packages (if applicable)
npm publish --access public
```

### 3. Verify Publication

```bash
# Check package is available
npm view endorphin-ai

# Check latest version
npm view endorphin-ai version

# Check package details
npm view endorphin-ai versions --json
npm view endorphin-ai dist-tags
```

## Post-Publishing Validation

### 1. Immediate Testing

```bash
# Test installation from npm immediately
mkdir /tmp/npm-test
cd /tmp/npm-test
npm init -y
npm pkg set type="module"

# Install from npm
npm install endorphin-ai@latest

# Test basic functionality
npx endorphin --version
npx endorphin --help
npx endorphin init
npx endorphin list

# Cleanup
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
rm -rf /tmp/npm-test
```

### 2. Run Post-Install Test Suite

```bash
# Run comprehensive post-install testing
# Create and run post-install validation script

#!/bin/bash
# post-publish-validation.sh

set -e

echo "🧪 Starting post-publish validation..."

# Test multiple environments
for NODE_VERSION in 18 20 22; do
  echo "Testing with Node.js $NODE_VERSION..."
  
  # Create test environment
  TEST_DIR="/tmp/npm-validation-node$NODE_VERSION"
  mkdir -p "$TEST_DIR"
  cd "$TEST_DIR"
  
  # Use specific Node version (if nvm available)
  if command -v nvm &> /dev/null; then
    nvm use $NODE_VERSION
  fi
  
  # Test installation and basic functionality
  npm init -y
  npm pkg set type="module"
  npm install endorphin-ai@latest
  
  npx endorphin --version
  npx endorphin init
  npx endorphin list
  
  echo "✅ Node.js $NODE_VERSION test passed"
  
  # Cleanup
  cd /
  rm -rf "$TEST_DIR"
done

echo "✅ All post-publish validation completed!"
```

### 3. Monitor Package Health

```bash
# Check package download stats (after some time)
npm view endorphin-ai

# Monitor for issues
# Check npm package page: https://www.npmjs.com/package/endorphin-ai

# Set up monitoring alerts if needed
```

## Git Repository Management

### 1. Tag Release

```bash
# Create and push git tag
git tag v$(cat package.json | jq -r .version)
git push origin v$(cat package.json | jq -r .version)

# Or create annotated tag with message
git tag -a v$(cat package.json | jq -r .version) -m "Release v$(cat package.json | jq -r .version)"
git push origin v$(cat package.json | jq -r .version)
```

### 2. Update Repository

```bash
# Push version commits
git push origin develop  # or main

# Merge to main if publishing from develop
git checkout main
git merge develop
git push origin main
git checkout develop
```

### 3. Create GitHub Release

```bash
# Using GitHub CLI (if available)
gh release create v$(cat package.json | jq -r .version) \
  --title "Release v$(cat package.json | jq -r .version)" \
  --notes "Release notes for v$(cat package.json | jq -r .version)" \
  --draft

# Or create release manually on GitHub
# Go to: https://github.com/andrewnovykov/endorphin-ai/releases/new
```

## Rollback Procedures

### If Issues Found After Publishing

#### 1. Immediate Deprecation

```bash
# Deprecate problematic version
npm deprecate endorphin-ai@$(cat package.json | jq -r .version) "Critical issue found, please use previous version"

# Check previous working version
npm view endorphin-ai versions --json
```

#### 2. Quick Fix and Republish

```bash
# Fix the critical issue
# Run tests to verify fix
npm test
cd dev-tests/package-tests && ./run-all-tests.sh

# Bump version (patch)
npm version patch

# Rebuild and republish
npm run build
npm publish

# Test new version
mkdir /tmp/fix-test
cd /tmp/fix-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai@latest
npx endorphin --version

# Cleanup
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
rm -rf /tmp/fix-test
```

#### 3. Major Rollback (if needed)

```bash
# In extreme cases, unpublish (only within 24 hours)
npm unpublish endorphin-ai@$(cat package.json | jq -r .version)

# Note: This should be avoided as it breaks existing installations
```

## Release Communication

### 1. Update Documentation

```bash
# Update CHANGELOG.md with release notes
cat >> CHANGELOG.md << EOF

## [$(cat package.json | jq -r .version)] - $(date +%Y-%m-%d)

### Added
- New feature descriptions

### Changed
- Changed feature descriptions

### Fixed
- Bug fix descriptions

EOF

# Commit changelog
git add CHANGELOG.md
git commit -m "docs: add v$(cat package.json | jq -r .version) to changelog"
git push
```

### 2. Notify Community

```bash
# Update README if needed with new version examples
# Post on social media, Discord, etc. (if applicable)
# Send notification to users (if mailing list exists)
```

## Automation Scripts

### Complete Publishing Script

```bash
#!/bin/bash
# publish.sh - Complete publishing automation

set -e

echo "🚀 Starting Endorphin AI publishing process..."

# Pre-flight checks
echo "📋 Running pre-flight checks..."
npm test
npm run type-check
npm run lint
cd dev-tests/package-tests && ./run-all-tests.sh && cd ../..

# Build
echo "🏗️ Building package..."
npm run build

# Version bump (interactive)
echo "📝 Select version bump type:"
select VERSION_TYPE in "patch" "minor" "major" "prerelease"; do
  case $VERSION_TYPE in
    patch|minor|major|prerelease)
      npm version $VERSION_TYPE
      break
      ;;
    *)
      echo "Invalid option"
      ;;
  esac
done

# Package testing
echo "📦 Testing package..."
npm pack
mkdir /tmp/publish-test
cd /tmp/publish-test
npm init -y
npm pkg set type="module"
npm install /Users/papapin777/Documents/CODE/AI/endorphin-ai/endorphin-ai-*.tgz
npx endorphin --version
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
rm -rf /tmp/publish-test

# Confirmation
read -p "🤔 Ready to publish v$(cat package.json | jq -r .version)? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Publishing cancelled"
  exit 1
fi

# Publish
echo "📤 Publishing to npm..."
npm publish

# Post-publish validation
echo "✅ Running post-publish validation..."
sleep 10  # Wait for npm to propagate
mkdir /tmp/post-publish-test
cd /tmp/post-publish-test
npm init -y
npm pkg set type="module"
npm install endorphin-ai@latest
npx endorphin --version
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai
rm -rf /tmp/post-publish-test

# Git operations
echo "🏷️ Creating git tag and pushing..."
git tag v$(cat package.json | jq -r .version)
git push origin develop
git push origin v$(cat package.json | jq -r .version)

echo "🎉 Publishing completed successfully!"
echo "📦 Published: endorphin-ai@$(cat package.json | jq -r .version)"
echo "🔗 NPM: https://www.npmjs.com/package/endorphin-ai"
```

## Best Practices

### 1. Pre-Publishing
- ✅ Always run full test suite
- ✅ Test package installation locally
- ✅ Update documentation and version references
- ✅ Use semantic versioning correctly
- ✅ Review package contents with `npm pack`

### 2. Publishing
- ✅ Use `npm publish --dry-run` first
- ✅ Publish during business hours for quick response
- ✅ Have rollback plan ready
- ✅ Monitor immediately after publishing

### 3. Post-Publishing
- ✅ Test installation from npm immediately
- ✅ Create git tags and GitHub releases
- ✅ Update community and documentation
- ✅ Monitor for issues in first 24 hours

### 4. Version Management
- ✅ Follow semantic versioning (semver)
- ✅ Use pre-release versions for testing
- ✅ Keep CHANGELOG.md updated
- ✅ Tag releases in git

### 5. Security
- ✅ Never commit API keys or secrets
- ✅ Review package contents before publishing
- ✅ Use npm audit before publishing
- ✅ Monitor for security vulnerabilities

## Troubleshooting

### Common Publishing Issues

#### 1. Version Already Exists
```bash
# Error: version already published
npm version patch  # Bump version
npm publish
```

#### 2. Authentication Issues
```bash
# Re-login to npm
npm logout
npm login
npm whoami
```

#### 3. Permission Denied
```bash
# Check package ownership
npm owner ls endorphin-ai

# Add collaborator if needed
npm owner add username endorphin-ai
```

#### 4. Package Size Too Large
```bash
# Check package size
npm pack
ls -lh endorphin-ai-*.tgz

# Review .npmignore file
cat .npmignore

# Remove unnecessary files
```

This comprehensive guide ensures successful and safe publishing of Endorphin AI to npm registry! 🚀