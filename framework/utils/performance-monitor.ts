/**
 * Performance monitoring utilities for test execution
 * Tracks CPU and memory usage during test runs
 */

import type { PerformanceMetrics, MemorySample, CpuSample } from '../types/test.js';
import { globalBrowserProcessMonitor, type BrowserProcessMetrics } from './browser-process-monitor.js';

export class PerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;
  private startMemory: NodeJS.MemoryUsage | null = null;
  private startCpu: NodeJS.CpuUsage | null = null;
  private memorySamples: MemorySample[] = [];
  private cpuSamples: CpuSample[] = [];
  private peakMemory: NodeJS.MemoryUsage | null = null;
  private samplingInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  /**
   * Start performance monitoring
   */
  start(): void {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
    this.startCpu = process.cpuUsage();
    this.memorySamples = [];
    this.cpuSamples = [];
    this.peakMemory = this.startMemory;
    this.isMonitoring = true;

    // Start browser process monitoring
    globalBrowserProcessMonitor.start();

    // Start sampling every 500ms
    this.samplingInterval = setInterval(() => {
      this.takeSample();
    }, 500);

    // Take initial sample
    this.takeSample();
  }

  /**
   * Stop performance monitoring and return metrics
   */
  stop(): PerformanceMetrics {
    this.endTime = Date.now();
    this.isMonitoring = false;

    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }

    // Take final sample
    this.takeSample();

    // Stop browser process monitoring
    const browserMetrics = globalBrowserProcessMonitor.stop();

    const endMemory = process.memoryUsage();
    const endCpu = process.cpuUsage(this.startCpu || undefined);

    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
      memoryUsage: {
        start: this.startMemory!,
        end: endMemory,
        peak: this.peakMemory!,
        samples: this.memorySamples,
      },
      cpuUsage: {
        start: this.startCpu!,
        end: endCpu,
        samples: this.cpuSamples,
      },
      browserProcessMetrics: browserMetrics,
    };
  }

  /**
   * Take a memory and CPU sample
   */
  private takeSample(): void {
    if (!this.isMonitoring) return;

    const timestamp = Date.now();
    const currentMemory = process.memoryUsage();
    const currentCpu = process.cpuUsage(this.startCpu || undefined);

    // Add memory sample
    this.memorySamples.push({
      timestamp,
      usage: currentMemory,
    });

    // Add CPU sample
    this.cpuSamples.push({
      timestamp,
      usage: currentCpu,
    });

    // Update peak memory
    if (this.peakMemory && currentMemory.heapUsed > this.peakMemory.heapUsed) {
      this.peakMemory = currentMemory;
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Get current CPU usage
   */
  getCurrentCpuUsage(): NodeJS.CpuUsage {
    return process.cpuUsage(this.startCpu || undefined);
  }

  /**
   * Format memory usage for display
   */
  static formatMemoryUsage(usage: NodeJS.MemoryUsage): string {
    const formatBytes = (bytes: number): string => {
      const sizes = ['B', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    return `Heap: ${formatBytes(usage.heapUsed)}/${formatBytes(usage.heapTotal)}, External: ${formatBytes(usage.external)}, RSS: ${formatBytes(usage.rss)}`;
  }

  /**
   * Format CPU usage for display
   */
  static formatCpuUsage(usage: NodeJS.CpuUsage): string {
    return `User: ${(usage.user / 1000).toFixed(2)}ms, System: ${(usage.system / 1000).toFixed(2)}ms`;
  }

  /**
   * Calculate memory usage difference
   */
  static calculateMemoryDiff(start: NodeJS.MemoryUsage, end: NodeJS.MemoryUsage): NodeJS.MemoryUsage {
    return {
      rss: end.rss - start.rss,
      heapTotal: end.heapTotal - start.heapTotal,
      heapUsed: end.heapUsed - start.heapUsed,
      external: end.external - start.external,
      arrayBuffers: end.arrayBuffers - start.arrayBuffers,
    };
  }

  /**
   * Calculate CPU usage percentage (approximate)
   */
  static calculateCpuPercentage(usage: NodeJS.CpuUsage, duration: number): number {
    const totalCpuTime = usage.user + usage.system;
    const totalRealTime = duration * 1000; // Convert to microseconds
    return (totalCpuTime / totalRealTime) * 100;
  }

  /**
   * Generate performance summary text
   */
  generateSummary(): string {
    if (!this.startMemory || !this.startCpu) {
      return 'Performance monitoring not started';
    }

    const endMemory = process.memoryUsage();
    const endCpu = process.cpuUsage(this.startCpu);
    const duration = this.endTime - this.startTime;

    const memoryDiff = PerformanceMonitor.calculateMemoryDiff(this.startMemory, endMemory);
    const cpuPercentage = PerformanceMonitor.calculateCpuPercentage(endCpu, duration);

    return `
Performance Summary:
- Duration: ${(duration / 1000).toFixed(2)}s
- Memory Change: ${PerformanceMonitor.formatMemoryUsage(memoryDiff)}
- Peak Memory: ${PerformanceMonitor.formatMemoryUsage(this.peakMemory!)}
- CPU Usage: ${PerformanceMonitor.formatCpuUsage(endCpu)} (${cpuPercentage.toFixed(2)}%)
- Samples: ${this.memorySamples.length} memory, ${this.cpuSamples.length} CPU
    `.trim();
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Run a function with performance monitoring
 */
export async function runWithPerformanceMonitoring<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const monitor = new PerformanceMonitor();
  
  if (label) {
    console.log(`📊 Starting performance monitoring for: ${label}`);
  }
  
  monitor.start();
  
  try {
    const result = await fn();
    const metrics = monitor.stop();
    
    if (label) {
      console.log(`📊 Performance monitoring completed for: ${label}`);
      console.log(`   Duration: ${(metrics.duration / 1000).toFixed(2)}s`);
      console.log(`   Memory: ${PerformanceMonitor.formatMemoryUsage(metrics.memoryUsage.end)}`);
      console.log(`   CPU: ${PerformanceMonitor.formatCpuUsage(metrics.cpuUsage.end)}`);
    }
    
    return { result, metrics };
  } catch (error) {
    monitor.stop();
    throw error;
  }
}

/**
 * Test suite performance tracker
 */
export class TestSuitePerformanceTracker {
  private startTime: number = 0;
  private endTime: number = 0;
  private testMetrics: Map<string, PerformanceMetrics> = new Map();
  private suiteMonitor: PerformanceMonitor = new PerformanceMonitor();

  /**
   * Start test suite monitoring
   */
  startSuite(): void {
    this.startTime = Date.now();
    this.suiteMonitor.start();
    console.log(`📊 Test suite performance monitoring started`);
  }

  /**
   * Record test performance metrics
   */
  recordTestMetrics(testId: string, metrics: PerformanceMetrics): void {
    this.testMetrics.set(testId, metrics);
  }

  /**
   * End test suite monitoring
   */
  endSuite(): PerformanceMetrics {
    this.endTime = Date.now();
    const metrics = this.suiteMonitor.stop();
    
    console.log(`📊 Test suite performance monitoring completed`);
    console.log(`   Total Duration: ${(metrics.duration / 1000).toFixed(2)}s`);
    console.log(`   Tests Monitored: ${this.testMetrics.size}`);
    console.log(`   Peak Memory: ${PerformanceMonitor.formatMemoryUsage(metrics.memoryUsage.peak)}`);
    
    return metrics;
  }

  /**
   * Get all test metrics
   */
  getAllTestMetrics(): Map<string, PerformanceMetrics> {
    return this.testMetrics;
  }

  /**
   * Get suite summary
   */
  getSuiteSummary(): {
    totalDuration: number;
    testCount: number;
    averageTestDuration: number;
    suiteMetrics: PerformanceMetrics;
  } {
    const suiteMetrics = this.suiteMonitor.stop();
    const testDurations = Array.from(this.testMetrics.values()).map(m => m.duration);
    const totalTestDuration = testDurations.reduce((sum, duration) => sum + duration, 0);
    
    return {
      totalDuration: this.endTime - this.startTime,
      testCount: this.testMetrics.size,
      averageTestDuration: testDurations.length > 0 ? totalTestDuration / testDurations.length : 0,
      suiteMetrics,
    };
  }
}

/**
 * Global test suite performance tracker
 */
export const globalTestSuiteTracker = new TestSuitePerformanceTracker();