# Node.js Compatibility Guide

## Supported Node.js Versions

Endorphin AI is actively tested and supported on the following Node.js versions:

### Production Support
- **Node.js 18.x** - LTS (Long Term Support)
- **Node.js 20.x** - Current LTS
- **Node.js 22.x** - Current Active
- **Node.js 22.18.0** - Specifically tested

### Minimum Requirements
- **Node.js 16.0.0+** - Minimum supported version
- **npm 8.0.0+** - Package manager requirement

## CI/CD Testing Matrix

Our Continuous Integration pipeline tests across:

### Operating Systems
- **Ubuntu Latest** (Linux)
- **Windows Latest** 
- **macOS Latest**

### Node.js Versions
- `18.x` - LTS baseline
- `20.x` - Current LTS
- `22.x` - Latest stable
- `22.18.0` - Explicit version testing

## Testing Node.js 22.18.0 Locally

### Installation
```bash
# Using nvm (recommended)
nvm install 22.18.0
nvm use 22.18.0

# Using n (alternative)
n 22.18.0

# Using fnm (fast alternative)
fnm install 22.18.0
fnm use 22.18.0
```

### Verification
```bash
# Verify Node.js version
node --version  # Should output: v22.18.0

# Test framework compatibility
npm run test:node-22

# Run full test suite
npm test
npm run test:package
```

## CI/CD Configuration

### GitHub Actions Workflows

1. **Main CI Pipeline** (`.github/workflows/ci.yml`)
   - Tests Node.js 18, 20, 22, and 22.18.0
   - Cross-platform testing (Ubuntu, Windows, macOS)
   - Full test suite execution

2. **Node.js 22.18.0 Specific** (`.github/workflows/node-22-18-0-test.yml`)
   - Dedicated workflow for Node.js 22.18.0
   - Comprehensive compatibility testing
   - Weekly scheduled runs

### Manual CI Trigger

You can manually trigger Node.js 22.18.0 testing by:

1. **Push to main/develop branches** - Automatic trigger
2. **Create pull request** - Automatic trigger  
3. **GitHub Actions UI** - Manual workflow dispatch
4. **Weekly schedule** - Every Monday at 6 AM UTC

## Known Compatibility Issues

### Node.js 22.x Specific
- ✅ **ESM modules** - Fully supported
- ✅ **TypeScript compilation** - Compatible
- ✅ **Playwright integration** - Working
- ✅ **OpenAI API** - Compatible
- ✅ **Jest testing** - All tests pass

### Node.js Version Features Used
- **ES2022 features** - Top-level await, private fields
- **ESM imports/exports** - Module system
- **AbortController** - Request cancellation
- **Fetch API** - HTTP requests (Node.js 18+)

## Troubleshooting

### Version Mismatch Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild native dependencies
npm rebuild
```

### Platform-Specific Issues

#### Windows
- Ensure PowerShell execution policy allows scripts
- Use Git Bash for shell commands in CI

#### macOS
- Xcode command line tools may be required
- Apple Silicon (M1/M2) compatibility verified

#### Linux
- Additional system dependencies for Playwright
- ChromiumSandbox permissions in containers

## Development Workflow

### Local Testing
```bash
# Test on current Node.js version
npm test

# Test package functionality
npm run test:package

# Test with specific Node.js version
nvm use 22.18.0 && npm test
```

### CI/CD Monitoring
- Monitor GitHub Actions runs
- Check compatibility reports
- Review test artifacts for failures

## Version Policy

### Support Timeline
- **Current LTS** - Full support and testing
- **Previous LTS** - Compatibility maintained
- **Current Active** - Latest features tested
- **Specific versions** - Critical versions explicitly tested

### Deprecation Notice
Node.js versions reaching end-of-life will be:
1. Marked as deprecated in documentation
2. Removed from CI testing matrix
3. Support dropped in next major release

## Resources

- [Node.js Release Schedule](https://nodejs.org/en/about/releases/)
- [GitHub Actions Node.js Setup](https://github.com/actions/setup-node)
- [nvm Installation Guide](https://github.com/nvm-sh/nvm#installation-and-update)
- [Endorphin AI CI Pipeline](/.github/workflows/ci.yml)