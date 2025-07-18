/**
 * Simple CI Performance Monitoring
 * Lightweight performance tracking that can be safely enabled in CI environments
 */

export interface CIPerformanceMetrics {
  startTime: number;
  endTime?: number;
  peakMemoryMB: number;
  avgMemoryMB: number;
  peakCpuPercent: number;
  avgCpuPercent: number;
  testCount: number;
  gcCount: number;
  cleanupCount: number;
  memoryOptimizerEnabled: boolean;
  samples: PerformanceSample[];
}

export interface PerformanceSample {
  timestamp: number;
  memoryMB: number;
  cpuPercent: number;
}

export class CIPerformanceMonitor {
  private metrics: CIPerformanceMetrics;
  private memorySnapshots: number[] = [];
  private cpuSnapshots: number[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private consoleInterval: NodeJS.Timeout | null = null;
  private enabled: boolean;
  private lastCpuUsage: NodeJS.CpuUsage | null = null;

  constructor() {
    // Enable monitoring with ENDORPHIN_MEMORY_OPTIMIZER or ENDORPHIN_PERF_MONITORING
    this.enabled = process.env.ENDORPHIN_MEMORY_OPTIMIZER === 'true' || 
                   process.env.ENDORPHIN_PERF_MONITORING === 'true';
    
    this.metrics = {
      startTime: Date.now(),
      peakMemoryMB: 0,
      avgMemoryMB: 0,
      peakCpuPercent: 0,
      avgCpuPercent: 0,
      testCount: 0,
      gcCount: 0,
      cleanupCount: 0,
      memoryOptimizerEnabled: process.env.ENDORPHIN_MEMORY_OPTIMIZER === 'true',
      samples: []
    };

    if (this.enabled) {
      this.startMonitoring();
      console.log('📊 Performance monitoring enabled');
      if (this.metrics.memoryOptimizerEnabled) {
        console.log('🔧 Memory optimizer: ON');
      }
    }
  }

  private startMonitoring(): void {
    // Initialize CPU tracking
    this.lastCpuUsage = process.cpuUsage();
    
    // Sample performance every 10 seconds to reduce data volume
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, 10000);
    
    // Show console updates every 20 seconds
    this.consoleInterval = setInterval(() => {
      this.showConsoleUpdate();
    }, 20000);
  }

  private collectPerformanceData(): void {
    const memUsage = process.memoryUsage();
    const memoryMB = memUsage.heapUsed / 1024 / 1024;
    
    // Calculate CPU usage (simplified approximation)
    let cpuPercent = 0;
    if (this.lastCpuUsage) {
      const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
      // Convert microseconds to percentage (approximate)
      cpuPercent = Math.min(((currentCpuUsage.user + currentCpuUsage.system) / 50000), 100); // Normalize to reasonable range
    }
    this.lastCpuUsage = process.cpuUsage();
    
    // Store snapshots
    this.memorySnapshots.push(memoryMB);
    this.cpuSnapshots.push(cpuPercent);
    
    // Store sample for report
    this.metrics.samples.push({
      timestamp: Date.now(),
      memoryMB: Math.round(memoryMB * 10) / 10,
      cpuPercent: Math.round(cpuPercent * 10) / 10
    });
    
    // Update peaks
    if (memoryMB > this.metrics.peakMemoryMB) {
      this.metrics.peakMemoryMB = memoryMB;
    }
    if (cpuPercent > this.metrics.peakCpuPercent) {
      this.metrics.peakCpuPercent = cpuPercent;
    }
    
    // Keep only last 20 snapshots (last 1.5 minutes)
    if (this.memorySnapshots.length > 20) {
      this.memorySnapshots.shift();
      this.cpuSnapshots.shift();
    }
    
    // Calculate averages
    this.metrics.avgMemoryMB = this.memorySnapshots.reduce((sum, mem) => sum + mem, 0) / this.memorySnapshots.length;
    this.metrics.avgCpuPercent = this.cpuSnapshots.reduce((sum, cpu) => sum + cpu, 0) / this.cpuSnapshots.length;
  }

  private showConsoleUpdate(): void {
    if (!this.enabled) return;
    
    const memoryMB = Math.round(this.metrics.avgMemoryMB);
    const cpuPercent = Math.round(this.metrics.avgCpuPercent);
    const optimizerStatus = this.metrics.memoryOptimizerEnabled ? 'ON' : 'OFF';
    
    console.log(`💾 Memory: ${memoryMB}MB | ⚡ CPU: ${cpuPercent}% | 🔧 Optimizer: ${optimizerStatus}`);
  }

  recordTestStart(): void {
    if (this.enabled) {
      this.metrics.testCount++;
    }
  }

  recordGC(): void {
    if (this.enabled) {
      this.metrics.gcCount++;
      console.log(`🗑️ GC triggered (${this.metrics.gcCount} total)`);
    }
  }

  recordCleanup(): void {
    if (this.enabled) {
      this.metrics.cleanupCount++;
    }
  }

  getMetrics(): CIPerformanceMetrics {
    return {
      ...this.metrics,
      endTime: Date.now()
    };
  }

  generateSummary(): string {
    if (!this.enabled) {
      return 'Performance monitoring disabled';
    }

    const duration = (Date.now() - this.metrics.startTime) / 1000;
    const optimizerStatus = this.metrics.memoryOptimizerEnabled ? 'ON' : 'OFF';
    
    return `
📊 Performance Summary:
⏱️  Duration: ${duration.toFixed(1)}s
🧪 Tests: ${this.metrics.testCount}
💾 Peak Memory: ${this.metrics.peakMemoryMB.toFixed(1)}MB
📈 Avg Memory: ${this.metrics.avgMemoryMB.toFixed(1)}MB
⚡ Peak CPU: ${this.metrics.peakCpuPercent.toFixed(1)}%
🔄 Avg CPU: ${this.metrics.avgCpuPercent.toFixed(1)}%
🔧 Memory Optimizer: ${optimizerStatus}
🗑️  GC Triggers: ${this.metrics.gcCount}
🧹 Cleanups: ${this.metrics.cleanupCount}
    `.trim();
  }

  async generateHtmlReport(outputDir: string = 'test-results'): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const { PerformanceReporter } = await import('../reporters/performance-reporter.js');
      const reporter = new PerformanceReporter();
      
      // Collect per-test performance data
      const testResults = await reporter.collectTestPerformanceData(outputDir);
      
      // Enhance metrics with aggregated test data
      const enhancedMetrics = this.aggregateTestPerformanceData(testResults);
      
      return reporter.generateReport(enhancedMetrics, outputDir, testResults);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
      return null;
    }
  }

  /**
   * Aggregate individual test performance data into overall metrics
   */
  private aggregateTestPerformanceData(testResults: any[]): CIPerformanceMetrics {
    const baseMetrics = this.getMetrics();
    
    if (!testResults || testResults.length === 0) {
      return baseMetrics;
    }

    // Calculate aggregated metrics from individual tests
    const totalDuration = testResults.reduce((sum, test) => sum + test.duration, 0);
    const memoryUsages = testResults.map(test => test.memoryUsage.peak / 1024 / 1024); // Convert to MB
    const cpuPercentages = testResults.map(test => test.cpuUsage.percentage);
    
    const peakMemoryMB = Math.max(...memoryUsages);
    const avgMemoryMB = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
    const peakCpuPercent = Math.max(...cpuPercentages);
    const avgCpuPercent = cpuPercentages.reduce((sum, cpu) => sum + cpu, 0) / cpuPercentages.length;
    
    // Generate samples from test data for charts
    const samples = this.generateSamplesFromTestData(testResults);
    
    return {
      ...baseMetrics,
      testCount: testResults.length,
      peakMemoryMB: Math.max(baseMetrics.peakMemoryMB, peakMemoryMB),
      avgMemoryMB: Math.max(baseMetrics.avgMemoryMB, avgMemoryMB),
      peakCpuPercent: Math.max(baseMetrics.peakCpuPercent, peakCpuPercent),
      avgCpuPercent: Math.max(baseMetrics.avgCpuPercent, avgCpuPercent),
      samples: samples.length > 0 ? samples : baseMetrics.samples,
      endTime: baseMetrics.endTime || Date.now()
    };
  }

  /**
   * Generate performance samples from test data for charts
   */
  private generateSamplesFromTestData(testResults: any[]): PerformanceSample[] {
    const samples: PerformanceSample[] = [];
    
    // Sort tests by timestamp
    const sortedTests = testResults.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Create samples from individual test performance data
    for (const test of sortedTests) {
      if (test.performanceMetrics && test.performanceMetrics.memoryUsage && test.performanceMetrics.memoryUsage.samples) {
        const testSamples = test.performanceMetrics.memoryUsage.samples.map((sample: any) => ({
          timestamp: sample.timestamp,
          memoryMB: sample.usage.heapUsed / 1024 / 1024,
          cpuPercent: Math.min(test.cpuUsage.percentage, 100) // Cap at 100%
        }));
        samples.push(...testSamples);
      }
    }
    
    // If no samples from tests, create synthetic samples
    if (samples.length === 0 && sortedTests.length > 0) {
      const startTime = Date.now() - (sortedTests.length * 30000); // Assume 30s per test
      
      for (let i = 0; i < sortedTests.length; i++) {
        const test = sortedTests[i];
        const timestamp = startTime + (i * 30000);
        
        samples.push({
          timestamp,
          memoryMB: test.memoryUsage.peak / 1024 / 1024,
          cpuPercent: Math.min(test.cpuUsage.percentage, 100)
        });
      }
    }
    
    return samples;
  }

  dispose(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.consoleInterval) {
      clearInterval(this.consoleInterval);
      this.consoleInterval = null;
    }

    if (this.enabled) {
      console.log(this.generateSummary());
      // Note: HTML report generation is now handled by TestRunner to ensure it completes
    }
  }
}

// Global instance for easy access
export const ciPerformanceMonitor = new CIPerformanceMonitor();

// Cleanup on process exit
process.on('exit', () => {
  ciPerformanceMonitor.dispose();
});

process.on('SIGINT', () => {
  ciPerformanceMonitor.dispose();
  process.exit(0);
});

process.on('SIGTERM', () => {
  ciPerformanceMonitor.dispose();
  process.exit(0);
});