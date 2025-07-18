/**
 * Browser Process Monitor
 * Tracks CPU and memory usage of browser processes spawned by Playwright
 */

import pidtree from 'pidtree';
import { spawnSync } from 'child_process';
import { platform } from 'os';

export interface BrowserProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  parent?: number;
}

export interface BrowserProcessSample {
  timestamp: number;
  processes: BrowserProcessInfo[];
  totalMemory: number;
  totalCpu: number;
}

export interface BrowserProcessMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  samples: BrowserProcessSample[];
  peakMemory: number;
  avgMemory: number;
  peakCpu: number;
  avgCpu: number;
  processCount: number;
}

export class BrowserProcessMonitor {
  private browserPids: Set<number> = new Set();
  private samples: BrowserProcessSample[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  private isMonitoring: boolean = false;
  private samplingInterval: NodeJS.Timeout | null = null;
  private enabled: boolean = false;

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? (
      process.env.ENDORPHIN_BROWSER_MONITORING === 'true' || 
      process.env.ENDORPHIN_PERF_MONITORING === 'true' ||
      process.env.ENDORPHIN_MEMORY_OPTIMIZER === 'true'
    );
  }

  /**
   * Add a browser process PID to monitor
   */
  addBrowserProcess(pid: number): void {
    if (!this.enabled) return;
    
    this.browserPids.add(pid);
    console.log(`🔍 Tracking browser process: ${pid}`);
  }

  /**
   * Remove a browser process PID from monitoring
   */
  removeBrowserProcess(pid: number): void {
    if (!this.enabled) return;
    
    this.browserPids.delete(pid);
    console.log(`🔍 Stopped tracking browser process: ${pid}`);
  }

  /**
   * Start monitoring browser processes
   */
  start(): void {
    if (!this.enabled) return;
    
    this.startTime = Date.now();
    this.isMonitoring = true;
    this.samples = [];
    
    // Take initial sample
    this.takeSample();
    
    // Start sampling every 2 seconds
    this.samplingInterval = setInterval(() => {
      this.takeSample();
    }, 2000);
    
    console.log('🔍 Browser process monitoring started');
  }

  /**
   * Stop monitoring and return metrics
   */
  stop(): BrowserProcessMetrics {
    if (!this.enabled) {
      return this.getEmptyMetrics();
    }
    
    this.endTime = Date.now();
    this.isMonitoring = false;
    
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
    
    // Take final sample
    this.takeSample();
    
    const metrics = this.calculateMetrics();
    
    console.log('🔍 Browser process monitoring stopped');
    console.log(`   Duration: ${(metrics.duration / 1000).toFixed(2)}s`);
    console.log(`   Peak Memory: ${metrics.peakMemory.toFixed(1)}MB`);
    console.log(`   Peak CPU: ${metrics.peakCpu.toFixed(1)}%`);
    console.log(`   Process Count: ${metrics.processCount}`);
    
    return metrics;
  }

  /**
   * Take a sample of current browser process usage
   */
  private async takeSample(): Promise<void> {
    if (!this.isMonitoring || !this.enabled) return;
    
    const timestamp = Date.now();
    const processes: BrowserProcessInfo[] = [];
    let totalMemory = 0;
    let totalCpu = 0;
    
    try {
      // Get all browser processes (including child processes)
      const allPids = new Set<number>();
      
      // Add direct browser PIDs
      for (const pid of this.browserPids) {
        allPids.add(pid);
        
        // Get child processes
        try {
          const childPids = await pidtree(pid);
          for (const childPid of childPids) {
            allPids.add(childPid);
          }
        } catch (error) {
          // Process might have ended, continue
        }
      }
      
      // Get process info for all PIDs
      for (const pid of allPids) {
        try {
          const processInfo = await this.getProcessInfo(pid);
          if (processInfo) {
            processes.push(processInfo);
            totalMemory += processInfo.memory;
            totalCpu += processInfo.cpu;
          }
        } catch (error) {
          // Process might have ended, continue
        }
      }
      
      const sample: BrowserProcessSample = {
        timestamp,
        processes,
        totalMemory,
        totalCpu,
      };
      
      this.samples.push(sample);
      
      // Keep only last 100 samples to prevent memory bloat
      if (this.samples.length > 100) {
        this.samples.shift();
      }
      
    } catch (error) {
      console.warn('Failed to take browser process sample:', error);
    }
  }

  /**
   * Get process information for a specific PID
   */
  private async getProcessInfo(pid: number): Promise<BrowserProcessInfo | null> {
    try {
      const os = platform();
      let processInfo: BrowserProcessInfo | null = null;
      
      if (os === 'darwin') {
        // macOS - use ps command
        const result = spawnSync('ps', ['-p', pid.toString(), '-o', 'pid,ppid,comm,%cpu,%mem'], { encoding: 'utf8' });
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          if (lines.length > 1) {
            const data = lines[1].trim().split(/\s+/);
            if (data.length >= 5) {
              processInfo = {
                pid: parseInt(data[0]),
                name: data[2],
                cpu: parseFloat(data[3]),
                memory: parseFloat(data[4]) * 10, // Convert %mem to approximate MB
                parent: parseInt(data[1])
              };
            }
          }
        }
      } else if (os === 'linux') {
        // Linux - use ps command
        const result = spawnSync('ps', ['-p', pid.toString(), '-o', 'pid,ppid,comm,%cpu,%mem'], { encoding: 'utf8' });
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          if (lines.length > 1) {
            const data = lines[1].trim().split(/\s+/);
            if (data.length >= 5) {
              processInfo = {
                pid: parseInt(data[0]),
                name: data[2],
                cpu: parseFloat(data[3]),
                memory: parseFloat(data[4]) * 10, // Convert %mem to approximate MB
                parent: parseInt(data[1])
              };
            }
          }
        }
      } else if (os === 'win32') {
        // Windows - use tasklist command
        const result = spawnSync('tasklist', ['/fi', `PID eq ${pid}`, '/fo', 'csv'], { encoding: 'utf8' });
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          if (lines.length > 1) {
            const data = lines[1].split(',').map(field => field.replace(/"/g, ''));
            if (data.length >= 5) {
              const memoryKB = parseInt(data[4].replace(/,/g, ''));
              processInfo = {
                pid: parseInt(data[1]),
                name: data[0],
                cpu: 0, // CPU not available in tasklist
                memory: memoryKB / 1024, // Convert KB to MB
              };
            }
          }
        }
      }
      
      return processInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate metrics from collected samples
   */
  private calculateMetrics(): BrowserProcessMetrics {
    if (this.samples.length === 0) {
      return this.getEmptyMetrics();
    }
    
    const memories = this.samples.map(sample => sample.totalMemory);
    const cpus = this.samples.map(sample => sample.totalCpu);
    const processCounts = this.samples.map(sample => sample.processes.length);
    
    const peakMemory = Math.max(...memories);
    const avgMemory = memories.reduce((sum, mem) => sum + mem, 0) / memories.length;
    const peakCpu = Math.max(...cpus);
    const avgCpu = cpus.reduce((sum, cpu) => sum + cpu, 0) / cpus.length;
    const processCount = Math.max(...processCounts);
    
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
      samples: this.samples,
      peakMemory,
      avgMemory,
      peakCpu,
      avgCpu,
      processCount,
    };
  }

  /**
   * Get empty metrics when monitoring is disabled
   */
  private getEmptyMetrics(): BrowserProcessMetrics {
    return {
      startTime: 0,
      endTime: 0,
      duration: 0,
      samples: [],
      peakMemory: 0,
      avgMemory: 0,
      peakCpu: 0,
      avgCpu: 0,
      processCount: 0,
    };
  }

  /**
   * Get current browser process usage
   */
  getCurrentUsage(): { memory: number; cpu: number; processCount: number } {
    if (!this.enabled || this.samples.length === 0) {
      return { memory: 0, cpu: 0, processCount: 0 };
    }
    
    const latestSample = this.samples[this.samples.length - 1];
    return {
      memory: latestSample.totalMemory,
      cpu: latestSample.totalCpu,
      processCount: latestSample.processes.length,
    };
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Format browser process usage for display
   */
  static formatUsage(memory: number, cpu: number, processCount: number): string {
    return `Memory: ${memory.toFixed(1)}MB, CPU: ${cpu.toFixed(1)}%, Processes: ${processCount}`;
  }
}

/**
 * Global browser process monitor instance
 */
export const globalBrowserProcessMonitor = new BrowserProcessMonitor();