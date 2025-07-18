# GitHub Actions Workflows Guide

## 🔄 Available Workflows

### 1. CI (`ci.yml`) - Main CI Pipeline
**Triggers:** Pull requests and pushes to `main`/`develop`
- **Development Tests**: TypeScript, ESLint, Jest tests with Playwright browsers
- **Package Tests**: Tarball testing in isolated environment  
- **Integration Tests**: Cross-platform matrix (Ubuntu, Windows, macOS) × Node.js (18, 20, 22)
- **Security Checks**: npm audit, dependency validation
- **E2E Smoke Tests**: Health check with real API calls

### 2. Manual Run (`test-suite.yml`) - On-Demand Testing
**Triggers:** Manual workflow dispatch
- Choose test filter (all, smoke, regression, priority levels)
- Specify individual test ID to run
- Configure parallel worker count
- Generates HTML and performance reports

### 3. Scheduled Tests (`scheduled-tests.yml`) - Nightly Automation  
**Triggers:** Daily at 2 AM UTC
- Smoke tests and high-priority test execution
- Creates GitHub issues on failure
- Extended artifact retention (30 days)

### 4. Deploy Reports (`deploy-reports.yml`) - GitHub Pages
**Triggers:** After test completion
- Automatic deployment to GitHub Pages
- Public access to test reports and metrics

## 📊 Viewing Test Reports

### Option 1: Download from GitHub Actions (Immediate)

1. Go to the **Actions** tab in your repository
2. Click on the workflow run you want to view
3. Scroll down to **Artifacts** section
4. Download `html-reports-{node-version}` artifact
5. Extract the ZIP file
6. Open the HTML files in your browser:
   - `report-*.html` - Interactive test report with screenshots
   - `performance-report-*.html` - Performance metrics and charts

### Option 2: GitHub Pages (Automatic Deployment)

If you enable GitHub Pages:

1. Go to Settings → Pages
2. Set source to "GitHub Actions"
3. After tests run, reports are automatically published to:
   ```
   https://[your-username].github.io/[repo-name]/
   ```

### Option 3: Job Summary (Quick Overview)

1. Click on any workflow run
2. The **Summary** page shows:
   - List of generated reports
   - Quick statistics
   - Download instructions

## 📈 Report Types

### Test Report (`report-*.html`)
- Test execution details
- Pass/fail status for each test
- Screenshots at each step
- AI agent thinking and decisions
- Token usage and costs
- Execution timeline

### Performance Report (`performance-report-*.html`)
- Memory usage over time
- CPU utilization
- Interactive charts
- Memory optimizer status
- GC and cleanup metrics
- Peak/average statistics

## 🔧 Configuration

### Required Secrets
```
OPENAI_API_KEY - Your OpenAI API key
```

### Performance Optimizations
All workflows include:
- `ENDORPHIN_MEMORY_OPTIMIZER=true` - Reduces memory usage
- `ENDORPHIN_DISABLE_IMAGES=true` - Faster execution in CI
- `ENDORPHIN_PERF_MONITORING=true` - Generates performance reports

## 💡 Tips

1. **Performance reports** are generated automatically when memory optimizer OR performance monitoring is enabled
2. **Test reports** include screenshots - they can be large for long tests
3. **Artifacts** are kept for 7 days (30 days for scheduled tests)
4. **GitHub Pages** deployment happens automatically after test runs