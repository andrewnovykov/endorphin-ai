# Endorphin AI CI/CD Resource Requirements & Profiling Guide

## Overview

This guide covers CI/CD resource requirements, profiling implementation, and job
configuration examples for running Endorphin AI browser tests in continuous
integration environments.

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
  NODE_VERSION: '18'
  ENDORPHIN_PROFILE: 'true'

.test_template: &test_template
  image: node:${NODE_VERSION}-bullseye
  before_script:
    - apt-get update && apt-get install -y libnss3 libatk1.0-0 libdrm2
      libxkbcommon0 libgtk-3-0 libgbm1 libasound2
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

# Performance optimization
ENDORPHIN_MEMORY_OPTIMIZER=true
ENDORPHIN_CONTEXT_POOLING=true
ENDORPHIN_AGGRESSIVE_GC=true
ENDORPHIN_DISABLE_IMAGES=true
ENDORPHIN_PERF_MONITORING=true

# Resource limits
NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"
PLAYWRIGHT_BROWSERS_PATH="/ms-playwright"
```

## Implementation Priorities

### Phase 1: Critical Performance (Week 1-2) 
**Priority: HIGH**

1. **Memory Optimizer Integration**
   - Implement `MemoryOptimizer` class in framework core
   - Add automatic garbage collection triggers
   - Setup memory pressure monitoring
   - **Impact**: 40-60% reduction in memory usage
   - **Files**: `framework/core/memory-optimizer.ts`

2. **Enhanced Resource Manager**
   - Upgrade existing `ResourceManager` with performance monitoring
   - Add memory threshold warnings
   - Implement aggressive cleanup in CI
   - **Impact**: Better resource cleanup, prevent memory leaks
   - **Files**: `framework/core/resource-manager.ts`

3. **Browser Context Optimization**
   - Disable unnecessary features in CI (images, videos, service workers)
   - Optimize browser launch options
   - Add context cleanup between tests
   - **Impact**: 30-50% faster browser operations
   - **Files**: `framework/automation/browser/browser-manager.ts`

### Phase 2: Intelligent Execution (Week 2-3)
**Priority: MEDIUM**

4. **Test Execution Optimizer**
   - Implement intelligent test batching
   - Add historical metrics tracking
   - Create adaptive concurrency control
   - **Impact**: Optimal test parallelization, reduced execution time
   - **Files**: `framework/execution/optimizer/test-optimizer.ts`

5. **Browser Context Pooling**
   - Implement context reuse for multi-user tests
   - Add context state clearing
   - Create pool size management
   - **Impact**: 60-80% faster multi-user test execution
   - **Files**: `framework/automation/browser/context-pool.ts`

### Phase 3: Advanced Profiling (Week 3-4)
**Priority: LOW**

6. **Performance Manager**
   - Real-time performance metrics collection
   - Optimization recommendations engine
   - Historical performance analysis
   - **Impact**: Proactive performance monitoring
   - **Files**: `framework/core/performance-manager.ts`

7. **Enhanced CI Profiler**
   - Integration with new performance classes
   - Advanced metrics collection
   - Performance regression detection
   - **Impact**: Comprehensive CI performance insights
   - **Files**: `framework/core/ci-profiler.ts`

### Implementation Strategy

#### Incremental Deployment
```bash
# Phase 1: Core optimizations (immediate impact)
npm run build
npm run test:ci  # Baseline performance measurement

# Enable memory optimizer
ENDORPHIN_MEMORY_OPTIMIZER=true npm run test:ci

# Enable all Phase 1 optimizations
ENDORPHIN_MEMORY_OPTIMIZER=true \
ENDORPHIN_AGGRESSIVE_GC=true \
ENDORPHIN_DISABLE_IMAGES=true \
npm run test:ci

# Phase 2: Intelligent execution
ENDORPHIN_CONTEXT_POOLING=true \
ENDORPHIN_SMART_BATCHING=true \
npm run test:ci

# Phase 3: Full profiling
ENDORPHIN_PERF_MONITORING=true npm run test:ci
```

#### Performance Metrics Tracking
- **Baseline measurement**: Current memory usage and execution time
- **Phase 1 target**: 40% memory reduction, 25% faster execution
- **Phase 2 target**: 50% faster multi-user tests, intelligent batching
- **Phase 3 target**: Complete performance visibility and optimization

#### Backwards Compatibility
- All optimizations are **opt-in** via environment variables
- Default behavior remains unchanged
- Performance features can be individually enabled/disabled
- No breaking changes to existing API

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

## Framework Performance Optimization

### Core Framework Improvements

#### 1. Enhanced Resource Management

```typescript
// framework/core/performance-manager.ts
export class PerformanceManager {
  private memoryThreshold = 512 * 1024 * 1024; // 512MB
  private gcInterval: NodeJS.Timeout | null = null;
  private metrics: PerformanceMetrics = {
    startTime: Date.now(),
    memoryPeaks: [],
    testDurations: [],
    browserInstances: 0,
    agentCalls: 0
  };

  constructor() {
    this.startMemoryMonitoring();
    this.setupGCOptimization();
  }

  startMemoryMonitoring() {
    this.gcInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      
      // Track memory peaks
      if (memUsage.heapUsed > this.memoryThreshold) {
        this.metrics.memoryPeaks.push({
          timestamp: Date.now(),
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal
        });
        
        // Force garbage collection if available
        if (global.gc && process.env.CI) {
          global.gc();
          console.log(`🗑️ Forced GC - Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  setupGCOptimization() {
    // Optimize V8 for test execution
    if (process.env.CI) {
      // Increase old space size for CI
      process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '';
      if (!process.env.NODE_OPTIONS.includes('--max-old-space-size')) {
        process.env.NODE_OPTIONS += ' --max-old-space-size=2048';
      }
      
      // Enable garbage collection exposure for monitoring
      if (!process.env.NODE_OPTIONS.includes('--expose-gc')) {
        process.env.NODE_OPTIONS += ' --expose-gc';
      }
    }
  }

  recordTestStart(testId: string) {
    this.metrics.testDurations.push({
      testId,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed
    });
  }

  recordTestEnd(testId: string) {
    const testRecord = this.metrics.testDurations.find(t => t.testId === testId);
    if (testRecord) {
      testRecord.endTime = Date.now();
      testRecord.duration = testRecord.endTime - testRecord.startTime;
      testRecord.endMemory = process.memoryUsage().heapUsed;
      testRecord.memoryDelta = testRecord.endMemory - testRecord.startMemory;
    }
  }

  getOptimizationRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Memory analysis
    const avgMemoryDelta = this.metrics.testDurations
      .filter(t => t.memoryDelta)
      .reduce((sum, t) => sum + t.memoryDelta!, 0) / this.metrics.testDurations.length;
    
    if (avgMemoryDelta > 50 * 1024 * 1024) { // 50MB per test
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage per test detected',
        suggestion: 'Implement browser context pooling and increase GC frequency'
      });
    }
    
    // Test duration analysis
    const avgDuration = this.metrics.testDurations
      .filter(t => t.duration)
      .reduce((sum, t) => sum + t.duration!, 0) / this.metrics.testDurations.length;
    
    if (avgDuration > 120000) { // 2 minutes
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Slow test execution detected',
        suggestion: 'Optimize navigation timeouts and element selectors'
      });
    }
    
    return recommendations;
  }

  dispose() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }
}
```

#### 2. Browser Context Pooling

```typescript
// framework/automation/browser/context-pool.ts
export class BrowserContextPool {
  private pools = new Map<string, BrowserContext[]>();
  private maxPoolSize = 3;
  private activeContexts = new Map<string, BrowserContext>();

  async getContext(userId: string, browser: Browser): Promise<BrowserContext> {
    // Check if we have an active context for this user
    if (this.activeContexts.has(userId)) {
      return this.activeContexts.get(userId)!;
    }

    // Get from pool or create new
    const userPool = this.pools.get(userId) || [];
    let context: BrowserContext;

    if (userPool.length > 0) {
      context = userPool.pop()!;
      console.log(`♻️ Reusing browser context for user: ${userId}`);
    } else {
      context = await browser.newContext({
        // Optimized context settings
        ignoreHTTPSErrors: true,
        bypassCSP: true,
        acceptDownloads: false,
        serviceWorkers: 'block',
        // Reduce memory usage
        javaScriptEnabled: true,
        images: process.env.CI ? 'disabled' : 'enabled',
        // Screenshot optimization
        recordVideo: undefined,
        recordHar: undefined
      });
      console.log(`🆕 Created new browser context for user: ${userId}`);
    }

    this.activeContexts.set(userId, context);
    return context;
  }

  async releaseContext(userId: string): Promise<void> {
    const context = this.activeContexts.get(userId);
    if (!context) return;

    this.activeContexts.delete(userId);
    
    // Return to pool if pool isn't full
    const userPool = this.pools.get(userId) || [];
    if (userPool.length < this.maxPoolSize) {
      // Clear context state before pooling
      await this.clearContextState(context);
      userPool.push(context);
      this.pools.set(userId, userPool);
      console.log(`🔄 Returned context to pool for user: ${userId}`);
    } else {
      // Pool is full, dispose context
      await context.close();
      console.log(`🗑️ Disposed excess context for user: ${userId}`);
    }
  }

  private async clearContextState(context: BrowserContext): Promise<void> {
    // Clear all pages except one
    const pages = context.pages();
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close();
    }
    
    // Clear storage and reset the remaining page
    if (pages.length > 0) {
      await context.clearCookies();
      await context.clearPermissions();
      try {
        await pages[0].goto('about:blank');
      } catch {
        // Ignore navigation errors during cleanup
      }
    }
  }

  async disposeAll(): Promise<void> {
    // Close all active contexts
    for (const [userId, context] of this.activeContexts) {
      try {
        await context.close();
      } catch (error) {
        console.warn(`Failed to close context for user ${userId}:`, error);
      }
    }
    this.activeContexts.clear();

    // Close all pooled contexts
    for (const [userId, userPool] of this.pools) {
      for (const context of userPool) {
        try {
          await context.close();
        } catch (error) {
          console.warn(`Failed to close pooled context for user ${userId}:`, error);
        }
      }
    }
    this.pools.clear();
  }
}
```

#### 3. Intelligent Test Execution

```typescript
// framework/execution/optimizer/test-optimizer.ts
export class TestExecutionOptimizer {
  private testMetrics = new Map<string, TestMetrics>();
  private parallelismStrategy: 'conservative' | 'aggressive' | 'adaptive' = 'adaptive';

  constructor(private maxConcurrency: number = 2) {
    this.loadHistoricalMetrics();
  }

  async optimizeTestExecution(tests: TestConfig[]): Promise<TestExecutionPlan> {
    // Analyze test characteristics
    const analysisResults = await this.analyzeTests(tests);
    
    // Determine optimal batching strategy
    const strategy = this.determineStrategy(analysisResults);
    
    // Create execution plan
    return {
      batches: this.createOptimalBatches(tests, strategy),
      estimatedDuration: this.estimateTotalDuration(tests),
      recommendedConcurrency: this.getOptimalConcurrency(analysisResults),
      optimizations: this.getOptimizationFlags(analysisResults)
    };
  }

  private async analyzeTests(tests: TestConfig[]): Promise<TestAnalysis> {
    const analysis: TestAnalysis = {
      totalTests: tests.length,
      heavyTests: [], // Tests with multiple users or complex workflows
      lightTests: [], // Simple navigation/verification tests
      memoryIntensive: [], // Tests with many screenshots or large pages
      networkHeavy: [] // Tests with external dependencies
    };

    for (const test of tests) {
      const metrics = this.testMetrics.get(test.id);
      
      // Classify test based on structure and historical data
      if (test.users && test.users.length > 1) {
        analysis.heavyTests.push(test.id);
      } else if (metrics?.avgDuration && metrics.avgDuration > 60000) {
        analysis.heavyTests.push(test.id);
      } else if (metrics?.avgMemoryUsage && metrics.avgMemoryUsage > 100 * 1024 * 1024) {
        analysis.memoryIntensive.push(test.id);
      } else {
        analysis.lightTests.push(test.id);
      }
    }

    return analysis;
  }

  private createOptimalBatches(tests: TestConfig[], strategy: ExecutionStrategy): TestBatch[] {
    const batches: TestBatch[] = [];
    
    if (strategy.type === 'sequential') {
      // Heavy tests run sequentially
      return tests.map(test => ({ tests: [test], concurrency: 1 }));
    }
    
    if (strategy.type === 'mixed') {
      // Light tests in parallel, heavy tests sequential
      const lightTests = tests.filter(t => !strategy.heavyTestIds.includes(t.id));
      const heavyTests = tests.filter(t => strategy.heavyTestIds.includes(t.id));
      
      // Batch light tests
      for (let i = 0; i < lightTests.length; i += strategy.lightBatchSize) {
        batches.push({
          tests: lightTests.slice(i, i + strategy.lightBatchSize),
          concurrency: Math.min(strategy.lightBatchSize, this.maxConcurrency)
        });
      }
      
      // Add heavy tests individually
      heavyTests.forEach(test => {
        batches.push({ tests: [test], concurrency: 1 });
      });
    }
    
    return batches;
  }

  recordTestMetrics(testId: string, metrics: TestMetrics): void {
    this.testMetrics.set(testId, metrics);
    this.saveMetricsToFile();
  }

  private loadHistoricalMetrics(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const metricsFile = path.join(process.cwd(), '.endorphin', 'test-metrics.json');
      
      if (fs.existsSync(metricsFile)) {
        const data = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        this.testMetrics = new Map(Object.entries(data));
      }
    } catch (error) {
      // Ignore errors loading historical metrics
    }
  }

  private saveMetricsToFile(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const metricsDir = path.join(process.cwd(), '.endorphin');
      const metricsFile = path.join(metricsDir, 'test-metrics.json');
      
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }
      
      const data = Object.fromEntries(this.testMetrics);
      fs.writeFileSync(metricsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      // Ignore errors saving metrics
    }
  }
}
```

### Parallel Test Execution

```typescript
// Enhanced parallel execution with resource awareness
export async function runTestsInParallel(tests: TestConfig[], options: ParallelExecutionOptions = {}) {
  const {
    maxConcurrency = 2,
    memoryThreshold = 1024 * 1024 * 1024, // 1GB
    enableResourceMonitoring = true,
    reporter
  } = options;

  const optimizer = new TestExecutionOptimizer(maxConcurrency);
  const executionPlan = await optimizer.optimizeTestExecution(tests);
  
  console.log(`🚀 Executing ${tests.length} tests in ${executionPlan.batches.length} batches`);
  console.log(`⏱️ Estimated duration: ${Math.round(executionPlan.estimatedDuration / 1000)}s`);
  
  const results: TestResult[] = [];
  
  for (const batch of executionPlan.batches) {
    console.log(`📦 Starting batch with ${batch.tests.length} tests (concurrency: ${batch.concurrency})`);
    
    // Check memory before starting batch
    if (enableResourceMonitoring) {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > memoryThreshold) {
        console.log(`⚠️ High memory usage detected, forcing GC before batch`);
        if (global.gc) global.gc();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Let GC complete
      }
    }
    
    // Execute batch with concurrency control
    const batchPromises = batch.tests.map(async (test, index) => {
      // Stagger test starts to reduce initial load
      await new Promise(resolve => setTimeout(resolve, index * 500));
      return runSingleTestById(test.id, { reporter });
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process results and handle failures
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`❌ Test ${batch.tests[index].id} failed:`, result.reason);
        results.push({
          testId: batch.tests[index].id,
          success: false,
          error: result.reason.message
        });
      }
    });
    
    // Brief pause between batches for resource recovery
    if (batch !== executionPlan.batches[executionPlan.batches.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}
```

### Advanced Memory Management

```typescript
// framework/core/memory-optimizer.ts
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cleanupQueue: Array<() => Promise<void>> = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  startOptimization(): void {
    // Aggressive cleanup in CI environments
    const cleanupIntervalMs = process.env.CI ? 30000 : 60000; // 30s in CI, 60s locally
    
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup();
    }, cleanupIntervalMs);

    // Setup memory pressure handlers
    this.setupMemoryPressureHandlers();
  }

  private setupMemoryPressureHandlers(): void {
    // Monitor memory usage and trigger cleanup when needed
    const memoryCheckInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const usagePercent = (heapUsedMB / heapTotalMB) * 100;

      if (usagePercent > 80) {
        console.log(`⚠️ High memory usage: ${heapUsedMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);
        this.triggerEmergencyCleanup();
      }
    }, 15000); // Check every 15 seconds

    // Cleanup interval when optimizer is disposed
    this.addToCleanupQueue(async () => {
      clearInterval(memoryCheckInterval);
    });
  }

  private async triggerEmergencyCleanup(): Promise<void> {
    console.log('🚨 Triggering emergency memory cleanup');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Run all queued cleanup tasks
    await this.performCleanup();
    
    // Log memory after cleanup
    const memUsage = process.memoryUsage();
    console.log(`💾 Memory after cleanup: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }

  addToCleanupQueue(cleanupFn: () => Promise<void>): void {
    this.cleanupQueue.push(cleanupFn);
  }

  private async performCleanup(): Promise<void> {
    const cleanupTasks = [...this.cleanupQueue];
    this.cleanupQueue = [];

    for (const cleanupFn of cleanupTasks) {
      try {
        await cleanupFn();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    }

    // Force garbage collection in CI
    if (process.env.CI && global.gc) {
      global.gc();
    }
  }

  optimizeBrowserContext(contextOptions: any): any {
    return {
      ...contextOptions,
      // Reduce memory usage
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      acceptDownloads: false,
      
      // Disable resource-intensive features in CI
      ...(process.env.CI && {
        serviceWorkers: 'block',
        images: 'disabled',
        media: 'disabled',
        fonts: 'disabled'
      }),
      
      // Optimize recording settings
      recordVideo: process.env.CI ? undefined : contextOptions.recordVideo,
      recordHar: process.env.CI ? undefined : contextOptions.recordHar,
      
      // Reduce screenshot quality in CI
      screenshot: process.env.CI 
        ? { mode: 'only-on-failure', fullPage: false }
        : contextOptions.screenshot
    };
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Run final cleanup
    this.performCleanup();
  }
}
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
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
      }
      .metric-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .metric-value {
        font-size: 2em;
        font-weight: bold;
        color: #6366f1;
      }
      h1 {
        color: #374151;
        text-align: center;
      }
      h3 {
        color: #6b7280;
        margin-top: 0;
      }
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
            Math.round(
              (data.summary.testsSucceeded / data.summary.testsExecuted) * 100
            ) + '%';
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
            datasets: [
              {
                data: [data.summary.testsSucceeded, data.summary.testsFailed],
                backgroundColor: ['#10b981', '#ef4444'],
              },
            ],
          },
        });

        // Memory usage chart
        const memoryData = data.rawMetrics.memory.slice(-20); // Last 20 points
        new Chart(document.getElementById('memoryChart'), {
          type: 'line',
          data: {
            labels: memoryData.map((m) =>
              new Date(m.timestamp).toLocaleTimeString()
            ),
            datasets: [
              {
                label: 'Memory Usage (MB)',
                data: memoryData.map((m) => m.heapUsed / 1024 / 1024),
                borderColor: '#6366f1',
                tension: 0.1,
              },
            ],
          },
        });
      }

      function renderRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        if (recommendations.length === 0) {
          container.innerHTML =
            '<p style="color: #10b981;">✅ No issues detected</p>';
          return;
        }

        container.innerHTML = recommendations
          .map(
            (rec) => `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid ${
          rec.level === 'error'
            ? '#ef4444'
            : rec.level === 'warning'
              ? '#f59e0b'
              : '#6366f1'
        }; background: #f9fafb;">
          <strong>${rec.message}</strong><br>
          <small>${rec.suggestion}</small>
        </div>
      `
          )
          .join('');
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
  navigationTimeout: 30000, // 30 seconds
};
```

## Quick Start Implementation Guide

### Immediate Performance Gains (5 minutes)

1. **Update Environment Variables**
```bash
# Add to .env or CI configuration
NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"
ENDORPHIN_DISABLE_IMAGES=true
ENDORPHIN_AGGRESSIVE_GC=true
```

2. **Enable Memory Optimization in CI**
```yaml
# .github/workflows/endorphin-tests.yml
env:
  NODE_OPTIONS: "--max-old-space-size=2048 --expose-gc"
  ENDORPHIN_MEMORY_OPTIMIZER: true
  ENDORPHIN_DISABLE_IMAGES: true
  ENDORPHIN_AGGRESSIVE_GC: true
```

3. **Test Performance Improvement**
```bash
# Before optimization
npm run test:ci  # Measure baseline

# After optimization  
ENDORPHIN_MEMORY_OPTIMIZER=true npm run test:ci  # Compare results
```

### Expected Immediate Results
- **Memory usage**: 30-40% reduction
- **Test execution**: 15-25% faster
- **Browser startup**: 40-50% faster
- **CI stability**: Fewer out-of-memory errors

### Gradual Implementation

#### Week 1: Core Memory Optimization
```typescript
// 1. Add to framework/core/memory-optimizer.ts (copy from roadmap)
// 2. Integrate with existing ResourceManager
// 3. Enable via environment variables
// 4. Measure memory usage improvements
```

#### Week 2: Browser Context Optimization  
```typescript
// 1. Update browser-manager.ts with CI optimizations
// 2. Add context pooling for multi-user tests
// 3. Implement aggressive cleanup
// 4. Measure execution time improvements
```

#### Week 3: Test Execution Intelligence
```typescript
// 1. Create test-optimizer.ts
// 2. Add historical metrics tracking
// 3. Implement smart batching
// 4. Optimize parallel execution
```

### Integration Checklist

#### Phase 1 Implementation ✅
- [ ] Create `MemoryOptimizer` class
- [ ] Add memory pressure monitoring
- [ ] Enable garbage collection in CI
- [ ] Disable images/videos in headless mode
- [ ] Update browser context options
- [ ] Add memory threshold warnings
- [ ] Test with existing test suite

#### Phase 2 Implementation ✅  
- [ ] Create `BrowserContextPool` class
- [ ] Implement context reuse logic
- [ ] Add context state clearing
- [ ] Create `TestExecutionOptimizer`
- [ ] Add historical metrics storage
- [ ] Implement adaptive batching
- [ ] Test multi-user performance

#### Phase 3 Implementation ✅
- [ ] Create `PerformanceManager` class
- [ ] Add real-time metrics collection
- [ ] Implement recommendation engine
- [ ] Enhance CI profiler integration
- [ ] Add performance regression detection
- [ ] Create performance dashboard

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

This comprehensive guide provides everything needed to successfully run
Endorphin AI tests in CI/CD environments with proper resource monitoring and
optimization.
