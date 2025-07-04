# CI/CD Setup Guide for Endorphin AI

_Last Updated: January 4, 2025 - v0.9.0_

This guide shows you how to set up GitHub Actions to run your Endorphin AI tests automatically in CI/CD pipelines.

## Quick Setup

### 1. Basic GitHub Actions Workflow

Create `.github/workflows/endorphin-tests.yml` in your project:

```yaml
name: Endorphin AI Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  endorphin-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run Endorphin AI tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
      run: |
        npx endorphin run test all
        
    - name: Generate test report
      if: always()
      run: npx endorphin generate report
      
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: endorphin-test-results
        path: |
          test-results/
          !test-results/**/*.png
        retention-days: 30
        
    - name: Upload screenshots
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: endorphin-screenshots
        path: test-results/**/*.png
        retention-days: 7
```

### 2. Add OpenAI API Key Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OPENAI_API_KEY`
5. Value: Your OpenAI API key (starts with `sk-`)
6. Click **Add secret**

### 3. Test Your Setup

```bash
# Commit and push your workflow file
git add .github/workflows/endorphin-tests.yml
git commit -m "Add Endorphin AI CI/CD workflow"
git push
```

Your tests will now run automatically on every push and pull request!

## Advanced Configurations

### Multiple Environments

```yaml
name: Endorphin AI Tests - Multi Environment

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  endorphin-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run tests for ${{ matrix.environment }}
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
        BASE_URL: ${{ matrix.environment == 'production' && 'https://app.com' || 'https://staging.app.com' }}
      run: |
        echo "Testing against: $BASE_URL"
        npx endorphin run test all
        
    - name: Generate test report
      if: always()
      run: npx endorphin generate report
      
    - name: Upload test results for ${{ matrix.environment }}
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: endorphin-results-${{ matrix.environment }}
        path: test-results/
        retention-days: 30
```

### Scheduled Tests (Nightly)

```yaml
name: Endorphin AI - Nightly Tests

on:
  schedule:
    # Run every night at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  nightly-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install
      
    - name: Run comprehensive test suite
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
        ENDORPHIN_DEBUG: verbose
      run: |
        # Run all tests with verbose logging
        npx endorphin run test all
        
    - name: Generate detailed report
      if: always()
      run: npx endorphin generate report
      
    - name: Upload nightly results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: nightly-test-results-${{ github.run_number }}
        path: test-results/
        retention-days: 90
        
    - name: Notify on failure
      if: failure()
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🚨 Nightly Endorphin AI tests failed! Check the workflow run for details.'
          })
```

### Test Specific Tags or Priorities

```yaml
name: Endorphin AI - Targeted Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run smoke tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
      run: |
        # Run only smoke tests for quick feedback
        npx endorphin list --tag smoke
        npx endorphin run test --tag smoke
        
    - name: Generate report
      if: always()
      run: npx endorphin generate report
      
  regression-tests:
    runs-on: ubuntu-latest
    needs: smoke-tests
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install
      
    - name: Run regression tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
      run: |
        # Run comprehensive regression tests
        npx endorphin run test --priority High
        npx endorphin run test --tag regression
        
    - name: Generate comprehensive report
      if: always()
      run: npx endorphin generate report
      
    - name: Upload regression results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: regression-test-results
        path: test-results/
        retention-days: 30
```

### Cross-Platform Testing

```yaml
name: Endorphin AI - Cross Platform

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  cross-platform-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run tests on ${{ matrix.os }}
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
      run: npx endorphin run test --tag smoke
      
    - name: Upload results for ${{ matrix.os }}-node${{ matrix.node-version }}
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: results-${{ matrix.os }}-node${{ matrix.node-version }}
        path: test-results/
        retention-days: 14
```

## Smart Test Structure Support (v0.9)

For tests using the new setup/data/task structure:

```yaml
name: Endorphin AI - Smart Tests

on:
  push:
    branches: [ main, develop ]

jobs:
  smart-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run smart tests with setup/data functions
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
        BASE_URL: https://staging.myapp.com
        NODE_ENV: ci
      run: |
        # List tests to verify discovery
        npx endorphin list
        
        # Run tests that use setup() and data() functions
        npx endorphin run test all
        
    - name: Generate report with cost tracking
      if: always()
      run: npx endorphin generate report
      
    - name: Display cost summary
      if: always()
      run: |
        if [ -f test-results/reports/report-*.html ]; then
          echo "📊 Test execution completed. Check artifacts for cost analysis."
        fi
        
    - name: Upload smart test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: smart-test-results
        path: |
          test-results/
          !test-results/**/*.png
        retention-days: 30
```

## Cost Management in CI

### Token Usage Monitoring

```yaml
name: Endorphin AI - Cost Monitoring

on:
  push:
    branches: [ main ]

jobs:
  cost-monitored-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install chromium
      
    - name: Run tests with cost tracking
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        HEADLESS: true
        ENDORPHIN_DEBUG: verbose
      run: |
        echo "🚀 Starting Endorphin AI tests with cost tracking..."
        npx endorphin run test all
        
    - name: Generate cost report
      if: always()
      run: |
        npx endorphin generate report
        echo "💰 Cost tracking report generated"
        
    - name: Extract cost summary
      if: always()
      run: |
        # Look for cost information in test results
        if [ -f test-results/reports/report-*.html ]; then
          echo "📊 Test execution complete. Check HTML report for detailed cost analysis."
          echo "🔍 Report includes token usage, costs per test, and AI decision history."
        fi
        
    - name: Upload cost analysis
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: cost-analysis-report
        path: test-results/reports/
        retention-days: 30
```

## Environment Variables Reference

Common environment variables for CI:

```yaml
env:
  # Required
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  
  # Browser settings
  HEADLESS: true                    # Run browser in headless mode
  
  # Test configuration
  BASE_URL: https://staging.app.com # Override test URLs
  
  # Debug settings
  ENDORPHIN_DEBUG: verbose          # Enable detailed logging
  
  # CI environment
  NODE_ENV: ci                      # Set environment to CI
  CI: true                          # Standard CI flag
```

## Troubleshooting CI Issues

### Common Problems and Solutions

#### 1. Tests timeout in CI
```yaml
- name: Run tests with extended timeout
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    HEADLESS: true
  timeout-minutes: 30  # Increase timeout
  run: npx endorphin run test all
```

#### 2. Browser installation issues
```yaml
- name: Install browsers with dependencies
  run: |
    npx playwright install-deps
    npx playwright install chromium
```

#### 3. API key issues
```yaml
- name: Verify API key
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: |
    if [ -z "$OPENAI_API_KEY" ]; then
      echo "❌ OPENAI_API_KEY not set"
      exit 1
    fi
    echo "✅ API key is configured"
```

#### 4. Debug CI failures
```yaml
- name: Run tests with debug output
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    HEADLESS: true
    ENDORPHIN_DEBUG: verbose
  run: |
    # List tests first
    npx endorphin list
    
    # Run with verbose output
    npx endorphin run test all
```

## Security Best Practices

### 1. API Key Management
- ✅ Store `OPENAI_API_KEY` in GitHub Secrets
- ✅ Never commit API keys to code
- ✅ Use environment-specific secrets for different stages
- ✅ Rotate API keys regularly

### 2. Branch Protection
```yaml
# Only run expensive tests on specific branches
on:
  push:
    branches: [ main ]  # Limit to main branch
  pull_request:
    branches: [ main ]  # And PRs to main
```

### 3. Cost Control
```yaml
# Limit test execution to prevent runaway costs
- name: Run limited test suite for PR
  if: github.event_name == 'pull_request'
  run: npx endorphin run test --tag smoke

- name: Run full suite for main branch
  if: github.ref == 'refs/heads/main'
  run: npx endorphin run test all
```

## Example Project Structure

```
my-project/
├── .github/
│   └── workflows/
│       ├── endorphin-tests.yml     # Main test workflow
│       ├── nightly-tests.yml       # Scheduled comprehensive tests
│       └── smoke-tests.yml         # Quick smoke tests for PRs
├── tests/
│   ├── smoke/
│   │   └── health-check.ts         # Quick health checks
│   ├── regression/
│   │   └── user-flows.ts           # Comprehensive user flows
│   └── e2e/
│       └── critical-paths.ts       # End-to-end critical paths
├── endorphin.config.ts             # Endorphin configuration
├── package.json
└── README.md
```

## Getting Started Checklist

- [ ] Create `.github/workflows/endorphin-tests.yml`
- [ ] Add `OPENAI_API_KEY` to GitHub Secrets
- [ ] Configure `endorphin.config.ts` for CI environment
- [ ] Test workflow with a simple test
- [ ] Add appropriate tags to your tests (`smoke`, `regression`, etc.)
- [ ] Set up artifact upload for test results
- [ ] Configure notifications for failures
- [ ] Consider cost management for token usage

## Advanced Features

### Slack Notifications
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    channel: '#tests'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Test Result Comments on PRs
```yaml
- name: Comment test results on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      if (fs.existsSync('test-results/summary.json')) {
        const summary = JSON.parse(fs.readFileSync('test-results/summary.json'));
        github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: `## 🤖 Endorphin AI Test Results\n\n✅ Passed: ${summary.passed}\n❌ Failed: ${summary.failed}\n💰 Cost: $${summary.totalCost}`
        });
      }
```

This comprehensive setup will give you robust CI/CD testing with Endorphin AI, including cost tracking, smart test support, and proper artifact management! 🚀