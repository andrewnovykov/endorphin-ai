# Endorphin AI CI/CD Resource Requirements & Profiling Guide

## Overview

This guide covers CI/CD resource requirements, profiling implementation, and job configuration examples for running Endorphin AI browser tests in continuous integration environments.

## Hardware Requirements

### Minimum CI Runner Specs
```yaml
# GitHub Actions / GitLab CI
resources:
  cpu: 2 cores
  memory: 4GB RAM
  disk: 20GB SSD
  network: Stable internet connection
```

### Recommended CI Runner Specs
```yaml
# For optimal performance
resources:
  cpu: 4 cores
  memory: 8GB RAM
  disk: 50GB SSD
  network: High-speed connection
  gpu: Not required (browser runs in headless mode)
```

### Resource Usage Breakdown
- **Playwright Browser**: 1-2GB RAM per browser instance
- **Node.js Process**: 200-500MB RAM
- **AI Processing**: 100-300MB RAM (API calls to OpenAI)
- **Screenshots/Videos**: 100MB-1GB disk per test run
- **Build Cache**: 1-5GB disk

## CI Configuration Examples

### GitHub Actions (`/.github/workflows/endorphin-tests.yml`)
```yaml
name: Endorphin AI Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    # Resource optimization
    strategy:
      matrix:
        node-version: [18, 20]
        shard: [1, 2, 3] # Parallel test execution
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Setup test environment
        run: |
          mkdir -p test-results
          mkdir -p test-recorder
      
      - name: Run Endorphin tests with profiling
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CI: true
          ENDORPHIN_PROFILE: true
          ENDORPHIN_SHARD: ${{ matrix.shard }}
          ENDORPHIN_TOTAL_SHARDS: 3
        run: |
          # Start resource monitoring
          ./scripts/ci-monitor.sh &
          MONITOR_PID=$!
          
          # Run tests with timeout
          timeout 30m npm run test:ci || exit 1
          
          # Stop monitoring
          kill $MONITOR_PID
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.shard }}
          path: |
            test-results/
            test-recorder/
            profiling-data/
          retention-days: 30
      
      - name: Upload resource metrics
        uses: actions/upload-artifact@v4
        with:
          name: resource-metrics-${{ matrix.shard }}
          path: resource-metrics.json
```

### GitLab CI (`/.gitlab-ci.yml`)
```yaml
stages:
  - test

variables:
  NODE_VERSION: "18"
  ENDORPHIN_PROFILE: "true"

.test_template: &test_template
  image: node:${NODE_VERSION}-bullseye
  before_script:
    - apt-get update && apt-get install -y libnss3 libatk1.0-0 libdrm2 libxkbcommon0 libgtk-3-0 libgbm1 libasound2
    - npm ci
    - npx playwright install chromium
  script:
    - ./scripts/ci-monitor.sh &
    - MONITOR_PID=$!
    - timeout 30m npm run test:ci
    - kill $MONITOR_PID
  artifacts:
    when: always
    paths:
      - test-results/
      - profiling-data/
      - resource-metrics.json
    expire_in: 30 days

endorphin_tests:
  <<: *test_template
  parallel:
    matrix:
      - ENDORPHIN_SHARD: [1, 2, 3]
  variables:
    ENDORPHIN_TOTAL_SHARDS: 3
```

### Docker Container for CI (`/docker/ci.Dockerfile`)
```dockerfile
FROM node:18-bullseye-slim

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application code
COPY . .

# Create directories for test artifacts
RUN mkdir -p test-results test-recorder profiling-data

# Set resource limits
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PLAYWRIGHT_BROWSERS_PATH="/ms-playwright"

# Default command
CMD ["npm", "run", "test:ci"]
```

## Resource Profiling Implementation

### CI Profiler (`/framework/core/ci-profiler.js`)
```javascript
/**
 * CI Resource Profiler for Endorphin AI
 * Monitors CPU, memory, and test execution metrics
 */
export class CIProfiler {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      endTime: null,
      cpu: [],
      memory: [],
      tests: [],
      browser: {
        launches: 0,
        crashes: 0,
        memoryLeaks: 0
      },
      ai: {
        apiCalls: 0,
        totalTokens: 0,
        avgResponseTime: 0
      }
    };
    
    this.interval = null;
  }

  start() {
    console.log('🔍 Starting CI profiler...');
    
    // Monitor system resources every 5 seconds
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, 5000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    this.metrics.endTime = Date.now();
    this.generateReport();
  }

  collectMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memory.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    });
    
    this.metrics.cpu.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
  }

  recordTestStart(testId) {
    this.metrics.tests.push({
      testId,
      startTime: Date.now(),
      endTime: null,
      status: 'running',
      memoryAtStart: process.memoryUsage().heapUsed
    });
  }

  recordTestEnd(testId, status, error = null) {
    const test = this.metrics.tests.find(t => t.testId === testId);
    if (test) {
      test.endTime = Date.now();
      test.status = status;
      test.duration = test.endTime - test.startTime;
      test.memoryAtEnd = process.memoryUsage().heapUsed;
      test.memoryDelta = test.memoryAtEnd - test.memoryAtStart;
      test.error = error;
    }
  }

  recordBrowserLaunch() {
    this.metrics.browser.launches++;
  }

  recordBrowserCrash() {
    this.metrics.browser.crashes++;
  }

  recordAICall(tokens, responseTime) {
    this.metrics.ai.apiCalls++;
    this.metrics.ai.totalTokens += tokens;
    this.metrics.ai.avgResponseTime = 
      (this.metrics.ai.avgResponseTime + responseTime) / 2;
  }

  generateReport() {
    const duration = this.metrics.endTime - this.metrics.startTime;
    const maxMemory = Math.max(...this.metrics.memory.map(m => m.heapUsed));
    const avgMemory = this.metrics.memory.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memory.length;
    
    const report = {
      summary: {
        totalDuration: duration,
        testsExecuted: this.metrics.tests.length,
        testsSucceeded: this.metrics.tests.filter(t => t.status === 'success').length,
        testsFailed: this.metrics.tests.filter(t => t.status === 'failed').length,
        maxMemoryUsage: maxMemory,
        avgMemoryUsage: avgMemory,
        browserLaunches: this.metrics.browser.launches,
        browserCrashes: this.metrics.browser.crashes,
        aiApiCalls: this.metrics.ai.apiCalls,
        totalTokensUsed: this.metrics.ai.totalTokens
      },
      recommendations: this.generateRecommendations(),
      rawMetrics: this.metrics
    };

    // Save report
    const fs = await import('fs');
    fs.writeFileSync('profiling-data/ci-report.json', JSON.stringify(report, null, 2));
    
    // Log summary
    this.logSummary(report.summary);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const maxMemory = Math.max(...this.metrics.memory.map(m => m.heapUsed));
    const avgTestDuration = this.metrics.tests.reduce((sum, t) => sum + (t.duration || 0), 0) / this.metrics.tests.length;

    // Memory recommendations
    if (maxMemory > 1024 * 1024 * 1024) { // > 1GB
      recommendations.push({
        type: 'memory',
        level: 'warning',
        message: 'High memory usage detected. Consider running fewer parallel tests.',
        suggestion: 'Reduce concurrency or increase CI runner memory.'
      });
    }

    // Performance recommendations
    if (avgTestDuration > 60000) { // > 1 minute
      recommendations.push({
        type: 'performance',
        level: 'info',
        message: 'Tests are taking longer than expected.',
        suggestion: 'Consider optimizing test steps or using faster selectors.'
      });
    }

    // Browser recommendations
    if (this.metrics.browser.crashes > 0) {
      recommendations.push({
        type: 'stability',
        level: 'error',
        message: 'Browser crashes detected.',
        suggestion: 'Check for memory leaks or update Playwright version.'
      });
    }

    return recommendations;
  }

  logSummary(summary) {
    console.log('\n📊 CI Profiling Summary:');
    console.log(`⏱️  Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`🧪 Tests: ${summary.testsSucceeded}✅ ${summary.testsFailed}❌`);
    console.log(`💾 Peak Memory: ${(summary.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🌐 Browser Launches: ${summary.browserLaunches}`);
    console.log(`🤖 AI API Calls: ${summary.aiApiCalls} (${summary.totalTokensUsed} tokens)`);
  }
}
```

### Resource Monitor Script (`/scripts/ci-monitor.sh`)
```bash
#!/bin/bash
# Monitor system resources during CI execution

LOG_FILE="resource-metrics.json"
echo '{"metrics": [' > $LOG_FILE

while true; do
  TIMESTAMP=$(date +%s)
  
  # Get CPU usage
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  
  # Get memory usage
  MEM=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
  
  # Get disk usage
  DISK=$(df / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
  
  # Get Node.js process info
  NODE_PID=$(pgrep -f "node.*endorphin" | head -1)
  if [ ! -z "$NODE_PID" ]; then
    NODE_MEM=$(ps -p $NODE_PID -o rss= | awk '{print $1/1024}' 2>/dev/null || echo "0")
    NODE_CPU=$(ps -p $NODE_PID -o %cpu= 2>/dev/null || echo "0")
  else
    NODE_MEM="0"
    NODE_CPU="0"
  fi
  
  # Write metrics
  echo "  {" >> $LOG_FILE
  echo "    \"timestamp\": $TIMESTAMP," >> $LOG_FILE
  echo "    \"cpu_total\": $CPU," >> $LOG_FILE
  echo "    \"memory_total\": $MEM," >> $LOG_FILE
  echo "    \"disk_usage\": $DISK," >> $LOG_FILE
  echo "    \"node_memory_mb\": $NODE_MEM," >> $LOG_FILE
  echo "    \"node_cpu\": $NODE_CPU" >> $LOG_FILE
  echo "  }," >> $LOG_FILE
  
  sleep 10
done
```

### Integration with Framework

#### Update Console Reporter (`/framework/core/console-reporter.js`)
```javascript
// Add profiling support to existing console reporter
import { CIProfiler } from './ci-profiler.js';

export class ConsoleReporter {
  constructor(options = {}) {
    // ...existing code...
    
    // Initialize profiler in CI
    if (process.env.CI && process.env.ENDORPHIN_PROFILE) {
      this.profiler = new CIProfiler();
      this.profiler.start();
    }
  }

  startSession() {
    // ...existing code...
    
    if (this.profiler) {
      console.log('🔍 Profiling enabled for CI environment');
    }
  }

  reportTestStart(testId, testName) {
    // ...existing code...
    
    if (this.profiler) {
      this.profiler.recordTestStart(testId);
    }
  }

  reportTestResult(testId, result) {
    // ...existing code...
    
    if (this.profiler) {
      this.profiler.recordTestEnd(
        testId, 
        result.success ? 'success' : 'failed',
        result.error
      );
    }
  }

  endSession() {
    // ...existing code...
    
    if (this.profiler) {
      this.profiler.stop();
    }
  }
}
```

## CI Configuration Options

### Package.json Scripts
```json
{
  "scripts": {
    "test:ci": "ENDORPHIN_PROFILE=true endorphin run test all --headless --timeout 1800000",
    "test:ci:shard": "endorphin run test all --shard ${ENDORPHIN_SHARD}/${ENDORPHIN_TOTAL_SHARDS}",
    "test:ci:smoke": "endorphin run test --tag smoke --headless",
    "test:ci:critical": "endorphin run test --priority High --headless"
  }
}
```

### Environment Variables
```bash
# Core settings
OPENAI_API_KEY=your_api_key
CI=true
NODE_ENV=test

# Endorphin specific
ENDORPHIN_PROFILE=true
ENDORPHIN_HEADLESS=true
ENDORPHIN_TIMEOUT=30m
ENDORPHIN_MAX_RETRIES=2
ENDORPHIN_PARALLEL_TESTS=2

# Resource limits
NODE_OPTIONS="--max-old-space-size=2048"
PLAYWRIGHT_BROWSERS_PATH="/ms-playwright"
```

## Cost Analysis

### GitHub Actions (Public repos - Free)
```yaml
Resource Limits:
  - 2,000 minutes/month free
  - 2-core CPU, 7GB RAM, 14GB SSD
  - Additional: $0.008/minute

Endorphin AI Usage:
  - ~5-10 minutes per test run
  - ~200-400 test runs per month within free tier
```

### GitHub Actions (Private repos)
```yaml
Costs:
  - Linux: $0.008/minute
  - Windows: $0.016/minute
  - macOS: $0.08/minute

Monthly Estimate (500 test runs):
  - 5 min avg × 500 runs = 2,500 minutes
  - 2,500 × $0.008 = $20/month
```

### GitLab CI (SaaS)
```yaml
Costs:
  - Shared runners: 400 minutes/month free
  - Additional: $10/month for 2,000 minutes
  - Premium: $19/month for 10,000 minutes

Monthly Estimate (500 test runs):
  - 5 min avg × 500 runs = 2,500 minutes
  - Premium plan recommended
```

### Self-hosted Runners
```yaml
Hardware Investment:
  - Basic server: $100-200/month
  - High-performance: $300-500/month
  - Cloud instance: $50-100/month

Benefits:
  - No usage limits
  - Faster execution
  - Custom configuration
  - Better resource control
```

## Performance Optimization

### Parallel Test Execution
```javascript
// Add to framework/core/test-discovery.js
export async function runTestsInParallel(tests, options = {}) {
  const { maxConcurrency = 2, reporter } = options;
  const chunks = chunkArray(tests, maxConcurrency);
  
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(test => runSingleTestById(test.id, { reporter }))
    );
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

### Resource Cleanup
```javascript
// Add browser cleanup
afterEach(async () => {
  if (global.browser) {
    await global.browser.close();
    global.browser = null;
  }
  
  // Force garbage collection in CI
  if (process.env.CI && global.gc) {
    global.gc();
  }
});
```

### Memory Management
```javascript
// Optimize browser context
const browserContext = await browser.newContext({
  // Reduce memory usage
  ignoreHTTPSErrors: true,
  bypassCSP: true,
  
  // Disable unnecessary features
  javaScriptEnabled: true,
  acceptDownloads: false,
  
  // Limit resources
  serviceWorkers: 'block',
  
  // Video/screenshot optimization
  recordVideo: process.env.CI ? undefined : { dir: 'test-results/videos' },
  screenshot: { mode: 'only-on-failure', fullPage: false }
});
```

## Monitoring Dashboard

### Simple HTML Dashboard (`/monitoring/ci-dashboard.html`)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Endorphin CI Metrics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
    .metric-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 2em; font-weight: bold; color: #6366f1; }
    h1 { color: #374151; text-align: center; }
    h3 { color: #6b7280; margin-top: 0; }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>Endorphin AI CI Metrics</h1>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Test Success Rate</h3>
        <div class="metric-value" id="successRate">--</div>
        <canvas id="successRateChart" width="400" height="200"></canvas>
      </div>
      
      <div class="metric-card">
        <h3>Memory Usage</h3>
        <div class="metric-value" id="peakMemory">--</div>
        <canvas id="memoryChart" width="400" height="200"></canvas>
      </div>
      
      <div class="metric-card">
        <h3>Test Duration</h3>
        <div class="metric-value" id="avgDuration">--</div>
        <canvas id="durationChart" width="400" height="200"></canvas>
      </div>
      
      <div class="metric-card">
        <h3>Resource Recommendations</h3>
        <div id="recommendations">
          <p>Loading recommendations...</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Load and display CI metrics
    async function loadMetrics() {
      try {
        const response = await fetch('/profiling-data/ci-report.json');
        const data = await response.json();
        
        // Update summary values
        document.getElementById('successRate').textContent = 
          Math.round((data.summary.testsSucceeded / data.summary.testsExecuted) * 100) + '%';
        document.getElementById('peakMemory').textContent = 
          Math.round(data.summary.maxMemoryUsage / 1024 / 1024) + 'MB';
        document.getElementById('avgDuration').textContent = 
          Math.round(data.summary.totalDuration / 1000) + 's';
        
        // Render charts
        renderCharts(data);
        
        // Show recommendations
        renderRecommendations(data.recommendations);
        
      } catch (error) {
        console.error('Failed to load metrics:', error);
      }
    }
    
    function renderCharts(data) {
      // Success rate chart
      new Chart(document.getElementById('successRateChart'), {
        type: 'doughnut',
        data: {
          labels: ['Passed', 'Failed'],
          datasets: [{
            data: [data.summary.testsSucceeded, data.summary.testsFailed],
            backgroundColor: ['#10b981', '#ef4444']
          }]
        }
      });
      
      // Memory usage chart
      const memoryData = data.rawMetrics.memory.slice(-20); // Last 20 points
      new Chart(document.getElementById('memoryChart'), {
        type: 'line',
        data: {
          labels: memoryData.map(m => new Date(m.timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Memory Usage (MB)',
            data: memoryData.map(m => m.heapUsed / 1024 / 1024),
            borderColor: '#6366f1',
            tension: 0.1
          }]
        }
      });
    }
    
    function renderRecommendations(recommendations) {
      const container = document.getElementById('recommendations');
      if (recommendations.length === 0) {
        container.innerHTML = '<p style="color: #10b981;">✅ No issues detected</p>';
        return;
      }
      
      container.innerHTML = recommendations.map(rec => `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid ${
          rec.level === 'error' ? '#ef4444' : 
          rec.level === 'warning' ? '#f59e0b' : '#6366f1'
        }; background: #f9fafb;">
          <strong>${rec.message}</strong><br>
          <small>${rec.suggestion}</small>
        </div>
      `).join('');
    }
    
    // Load metrics on page load
    loadMetrics();
    
    // Refresh every 30 seconds
    setInterval(loadMetrics, 30000);
  </script>
</body>
</html>
```

## Troubleshooting Common Issues

### Memory Issues
```bash
# If you see "JavaScript heap out of memory"
export NODE_OPTIONS="--max-old-space-size=4096"

# For severe memory issues
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size"
```

### Browser Launch Failures
```bash
# Install missing dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y libnss3 libatk1.0-0 libdrm2 libxkbcommon0 libgtk-3-0 libgbm1

# For Alpine Linux
apk add --no-cache nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont
```

### Timeout Issues
```javascript
// Increase timeouts for CI
const config = {
  testTimeout: 180000, // 3 minutes
  browserTimeout: 60000, // 1 minute
  navigationTimeout: 30000 // 30 seconds
};
```

## Best Practices

### Resource Optimization
1. **Use headless mode** in CI environments
2. **Limit parallel tests** based on available memory
3. **Clean up browser contexts** after each test
4. **Use sharding** for large test suites
5. **Cache dependencies** (node_modules, browsers)

### Reliability
1. **Retry failed tests** up to 2 times
2. **Use stable selectors** in test instructions
3. **Add explicit waits** for dynamic content
4. **Monitor for flaky tests** and fix them
5. **Use screenshots** for debugging failures

### Cost Management
1. **Run smoke tests** on every commit
2. **Full test suite** only on main branch
3. **Use cron jobs** for nightly comprehensive tests
4. **Optimize test execution time** regularly
5. **Consider self-hosted runners** for high usage

This comprehensive guide provides everything needed to successfully run Endorphin AI tests in CI/CD environments with proper resource monitoring and optimization.