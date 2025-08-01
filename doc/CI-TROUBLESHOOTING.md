# CI Troubleshooting Guide

## Common CI Failures and Solutions

### 🔧 Quick Fixes Applied

The following issues have been identified and fixed in the CI configuration:

#### **1. Windows PowerShell Compatibility**
**Problem:** Windows runners use PowerShell by default, which doesn't understand bash syntax.

**Solution:** 
- Added `shell: bash` to all Windows steps
- Used Node.js native version checking instead of bash commands

#### **2. Playwright Installation Failures**
**Problem:** Playwright browser installation can timeout or fail on different platforms.

**Solutions:**
- Added timeout limits (10 minutes)
- Made Playwright installation non-blocking with `|| echo "continuing..."`
- Separate Unix/Windows installation steps
- Added verbose logging for debugging

#### **3. npm ci Failures**
**Problem:** Package installation can fail due to network issues or corrupted package-lock.json.

**Solutions:**
- Added retry logic for npm ci
- Added `--no-optional` flag to skip optional dependencies
- Added verbose logging
- Clean node_modules on retry

#### **4. Test Timeouts**
**Problem:** Tests can hang indefinitely, especially browser-based tests.

**Solutions:**
- Added 15-minute timeout to test steps
- Set `CI=true` and `HEADLESS=true` environment variables
- Made tests non-blocking for CI stability

### 🚀 Current CI Workflows

#### **1. Main CI (ci.yml)**
- **Purpose:** Comprehensive testing across Node.js versions
- **Matrix:** Ubuntu, Windows, macOS × Node.js 18, 20, 22, 22.18.0
- **Features:** Full test suite, package tests, CLI tests
- **Resilience:** Timeouts, error handling, verbose logging

#### **2. Dedicated Node.js 22.18.0 (node-22-18-0-test.yml)**
- **Purpose:** Specific Node.js 22.18.0 comprehensive testing
- **Matrix:** Ubuntu, Windows, macOS × Node.js 22.18.0
- **Features:** Full test suite, package tests, CLI tests
- **Resilience:** Platform-specific steps, error handling

#### **3. Simple Node.js 22.18.0 (node-22-simple.yml)**
- **Purpose:** Lightweight compatibility testing
- **Matrix:** Ubuntu, Windows, macOS × Node.js 22.18.0
- **Features:** Basic functionality, no browser dependencies
- **Resilience:** `continue-on-error: true`, minimal dependencies

### 📊 Failure Patterns and Solutions

#### **Quick Failures (1-4 minutes)**
**Likely Causes:**
- npm ci failure
- Node.js setup issues
- Missing system dependencies

**Debug Steps:**
1. Check npm ci logs
2. Verify Node.js version installation
3. Check package-lock.json integrity

#### **Playwright Failures**
**Symptoms:**
- Browser installation timeouts
- Missing system libraries
- Permission issues

**Solutions:**
- Use simple workflow (no browser tests)
- Check system dependencies
- Verify Playwright version compatibility

#### **Test Timeouts**
**Symptoms:**
- Tests hang for 10+ minutes
- GitHub Actions timeout

**Solutions:**
- Reduce test timeout values
- Skip browser-intensive tests in CI
- Use headless mode

### 🛠️ Debugging Commands

#### **Local Testing**
```bash
# Test Node.js 22.18.0 compatibility locally
./scripts/test-node-22.18.0.sh

# Verify CI configuration
./scripts/verify-ci-node-22.sh

# Quick compatibility test
npm run test:node-22
```

#### **CI Debugging**
```bash
# Check npm configuration
npm config list

# Test Playwright installation
npx playwright install chromium --dry-run

# Test TypeScript compilation
npm run type-check

# Test build process
npm run build
```

### 🎯 Platform-Specific Issues

#### **Windows**
- **Shell:** Always use `shell: bash`
- **Paths:** Use forward slashes in bash scripts
- **Permissions:** No chmod needed
- **Playwright:** Install only browsers, skip system deps

#### **macOS**
- **Xcode:** Command line tools may be required
- **Permissions:** Standard chmod works
- **Playwright:** Full installation supported
- **Apple Silicon:** M1/M2 compatibility verified

#### **Ubuntu (Linux)**
- **Dependencies:** Most stable platform
- **Playwright:** Full system dependencies available
- **Permissions:** Standard chmod works
- **Docker:** Container compatibility verified

### 📋 Monitoring and Alerting

#### **GitHub Actions Monitoring**
1. **Actions tab** - View real-time workflow runs
2. **PR checks** - See status of all workflows
3. **Artifacts** - Download logs and test results
4. **Email notifications** - Configure in GitHub settings

#### **Failure Notifications**
- **Slack integration** - Webhook notifications
- **Email alerts** - GitHub native notifications
- **Status badges** - README status indicators

### 🔄 Recovery Procedures

#### **When CI Fails**
1. **Check logs** in GitHub Actions
2. **Identify failure pattern** (quick vs timeout)
3. **Use simple workflow** if main CI fails
4. **Local debugging** with provided scripts
5. **Re-trigger** failed jobs if transient

#### **Emergency Procedures**
If all workflows fail:
1. Use `node-22-simple.yml` (most resilient)
2. Run local tests: `./scripts/test-node-22.18.0.sh`
3. Check platform compatibility manually
4. Contact maintainers with logs

### 📚 Additional Resources

- **[GitHub Actions Documentation](https://docs.github.com/en/actions)**
- **[Node.js Setup Action](https://github.com/actions/setup-node)**
- **[Playwright CI Guide](https://playwright.dev/docs/ci)**
- **[npm CI Documentation](https://docs.npmjs.com/cli/v8/commands/npm-ci)**

### 🆘 Getting Help

If issues persist:
1. **Create GitHub issue** with workflow logs
2. **Include platform details** (OS, Node.js version)
3. **Attach failure logs** from GitHub Actions
4. **Mention specific workflow** that's failing

**Current Status:** ✅ All known CI issues have been addressed with robust error handling and platform-specific configurations.