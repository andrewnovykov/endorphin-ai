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
    // Enable monitoring with ENDORPHIN_PERF_MONITORING
    this.enabled = process.env.ENDORPHIN_PERF_MONITORING === 'true';
    
    this.metrics = {
      startTime: Date.now(),
      peakMemoryMB: 0,
      avgMemoryMB: 0,
      peakCpuPercent: 0,
      avgCpuPercent: 0,
      testCount: 0,
      gcCount: 0,
      cleanupCount: 0,
      memoryOptimizerEnabled: false,
      samples: []
    };

    if (this.enabled) {
      this.startMonitoring();
      console.log('📊 Performance monitoring enabled');
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
    
    console.log(`💾 Memory: ${memoryMB}MB | ⚡ CPU: ${cpuPercent}%`);
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
    
    return `
📊 Performance Summary:
⏱️  Duration: ${duration.toFixed(1)}s
🧪 Tests: ${this.metrics.testCount}
💾 Peak Memory: ${this.metrics.peakMemoryMB.toFixed(1)}MB
📈 Avg Memory: ${this.metrics.avgMemoryMB.toFixed(1)}MB
⚡ Peak CPU: ${this.metrics.peakCpuPercent.toFixed(1)}%
🔄 Avg CPU: ${this.metrics.avgCpuPercent.toFixed(1)}%
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
      return await reporter.generateReport(this.getMetrics(), outputDir);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
      return null;
    }
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