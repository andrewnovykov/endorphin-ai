# Published Package Testing Guide

This guide is for testing the **published** Endorphin AI package from npm
registry.

## Prerequisites

- Node.js 18+ installed
- npm installed
- OpenAI API key (required for full testing)

## Quick Start

```bash
# 1. Create test directory
mkdir ~/endorphin-test
cd ~/endorphin-test

# 2. Install from npm
npm init -y
npm pkg set type="module"
npm install endorphin-ai

# 3. Initialize and test
npx endorphin init
npx endorphin list
```

## Detailed Testing Steps

### Step 1: Environment Setup

```bash
# Create clean test environment
mkdir ~/endorphin-test
cd ~/endorphin-test

# Initialize npm project
npm init -y

# Set ES module mode (required)
npm pkg set type="module"

# Verify Node.js version
node --version  # Should be 18+
```

### Step 2: Install Published Package

```bash
# Install latest version from npm
npm install endorphin-ai

# Verify installation
npx endorphin --version
npm list endorphin-ai
```

### Step 3: Get OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (starts with `sk-`)

### Step 4: Initialize Project

```bash
# Initialize Endorphin project
npx endorphin init
```

**Expected Results:**

- ✅ Creates `endorphin.config.js`
- ✅ Creates `tests/sample-test.js`
- ✅ Creates `.env`, `.gitignore`, `README-ENDORPHIN.md`
- ✅ Creates directories: `tests/`, `test-results/`, `test-recorder/`

### Step 5: Configure API Key

```bash
# Edit .env file
nano .env
# or
code .env
```

Replace `your_openai_api_key_here` with your actual API key:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 6: Test Discovery

```bash
# List available tests
npx endorphin list
```

**Expected Output:**

```
📋 Available Tests:
══════════════════════════════════════

🎯 High Priority:
  HEALTH-001: Framework Health Check [health, smoke, example]
    📄 File: sample-test.js
    📝 Verify basic framework functionality by navigating to example.com
```

### Step 7: Run Sample Test

```bash
# Run the health check test
npx endorphin run test HEALTH-001 --headless
```

**Expected Behavior:**

- Browser launches in headless mode
- Navigates to example.com
- Verifies page loads correctly
- Creates test results in `test-results/`
- Shows colorful console output with progress

### Step 8: Test HTML Reporter

```bash
# Generate HTML report
npx endorphin generate report

# List generated reports
npx endorphin generate report --list

# Open report in browser (optional)
npx endorphin generate report --open
```

### Step 9: Test Interactive Recorder

```bash
# Install Playwright browsers (required for recording)
npx playwright install

# Start interactive test recorder
npx endorphin run test-recorder
```

Follow the prompts to create a custom test.

### Step 10: Test CLI Commands

```bash
# Test all CLI functionality
npx endorphin --help
npx endorphin --version
npx endorphin list
npx endorphin list --tag smoke
npx endorphin list --priority High
npx endorphin run test all --headless
npx endorphin generate report --summary
```

## Full End-to-End Test

```bash
# Complete workflow test
npx endorphin init
npx endorphin list
npx endorphin run test HEALTH-001 --headless
npx endorphin generate report
npx endorphin run test-recorder  # Interactive - follow prompts
npx endorphin list  # Should show your recorded test
```

## API Usage Testing

### Test with Different Models

Edit `endorphin.config.js`:

```javascript
export default {
  ai: {
    model: 'gpt-4o', // or 'gpt-3.5-turbo'
    temperature: 0.1,
    maxRetries: 3,
  },
  // ... other config
};
```

### Test with Environment Variables

```bash
# Override config with environment variables
ENDORPHIN_HEADLESS=true npx endorphin run test HEALTH-001
ENDORPHIN_VIEWPORT=1920x1080 npx endorphin run test HEALTH-001
```

## Performance Testing

```bash
# Test with multiple tests
npx endorphin run test all

# Test with parallel execution (if supported)
npx endorphin run test all --parallel

# Measure execution time
time npx endorphin run test HEALTH-001 --headless
```

## Error Handling Testing

### Test Invalid API Key

```bash
# Temporarily set invalid API key
echo "OPENAI_API_KEY=invalid" > .env
npx endorphin run test HEALTH-001 --headless
# Should show clear error message

# Restore valid key
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

### Test Invalid Test ID

```bash
npx endorphin run test INVALID-TEST
# Should show "test not found" error
```

### Test Missing Configuration

```bash
# Rename config file
mv endorphin.config.js endorphin.config.js.backup
npx endorphin run test HEALTH-001
# Should use default configuration

# Restore config
mv endorphin.config.js.backup endorphin.config.js
```

## Success Criteria

✅ **Installation:** Package installs from npm without errors  
✅ **Initialization:** `init` command creates all required files  
✅ **Test Discovery:** `list` command shows available tests  
✅ **Test Execution:** Tests run successfully with real browser automation  
✅ **Reporting:** HTML reports generate and display correctly  
✅ **Recording:** Interactive test recorder works and creates new tests  
✅ **CLI Commands:** All commands work with proper help/error messages  
✅ **Configuration:** Config files load and environment variables work  
✅ **Error Handling:** Clear error messages for common issues

## Troubleshooting

### Package Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Check npm registry
npm view endorphin-ai

# Try specific version
npm install endorphin-ai@latest
```

### API Key Issues

```bash
# Verify API key format
cat .env | grep OPENAI_API_KEY
# Should start with "sk-"

# Test API key directly
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

### Browser Issues

```bash
# Install browsers
npx playwright install

# Test browser availability
npx playwright install --dry-run

# Run with visible browser
npx endorphin run test HEALTH-001  # (remove --headless)
```

## Performance Benchmarks

Expected performance for `HEALTH-001` test:

- **Execution Time:** 15-30 seconds
- **Memory Usage:** <500MB
- **Browser Launch:** <5 seconds
- **Test Completion:** <20 seconds
- **Report Generation:** <3 seconds

## Reporting Issues

When reporting issues, please in`clude:

1. **Environment:**

   ```bash
   node --version
   npm --version
   npx endorphin --version
   ```

2. **Operating System:** macOS/Windows/Linux version

3. **Full Error Output:** Complete command and error messages

4. **Configuration Files:** Contents of `endorphin.config.js` and `.env`
   (without API key)

5. **Reproduction Steps:** Exact commands that cause the issue

Submit issues at: https://github.com/andrewnovykov/endorphin-ai/issues
