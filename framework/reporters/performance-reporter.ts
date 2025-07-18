/**
 * Enhanced Performance Report Generator
 * Creates a comprehensive HTML report for performance metrics including per-test data
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CIPerformanceMetrics } from '../core/ci-performance.js';
import type { PerformanceMetrics, TestSession } from '../types/test.js';

export interface TestPerformanceData {
  testId: string;
  testName: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  attempts: number;
  memoryUsage: {
    start: number;
    end: number;
    peak: number;
  };
  cpuUsage: {
    userTime: number;
    systemTime: number;
    percentage: number;
  };
  performanceMetrics?: {
    browserProcessMetrics?: {
      startTime: number;
      endTime: number;
      duration: number;
      samples: Array<{
        timestamp: number;
        processes: Array<{
          pid: number;
          name: string;
          cpu: number;
          memory: number;
          parent?: number;
        }>;
        totalMemory: number;
        totalCpu: number;
      }>;
      peakMemory: number;
      avgMemory: number;
      peakCpu: number;
      avgCpu: number;
      processCount: number;
    };
  };
}

export class PerformanceReporter {
  /**
   * Collect performance data from separate performance.json files
   */
  async collectTestPerformanceData(testResultsDir: string = 'test-results'): Promise<TestPerformanceData[]> {
    const testResultsMap = new Map<string, TestPerformanceData>();
    
    try {
      if (!fs.existsSync(testResultsDir)) {
        return [];
      }

      const sessionDirs = fs.readdirSync(testResultsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(testResultsDir, dirent.name));

      for (const sessionDir of sessionDirs) {
        const performanceFile = path.join(sessionDir, 'performance.json');
        
        if (fs.existsSync(performanceFile)) {
          try {
            const performanceData = JSON.parse(fs.readFileSync(performanceFile, 'utf8'));
            
            const testData: TestPerformanceData = {
              testId: performanceData.testId,
              testName: performanceData.testName,
              duration: performanceData.duration,
              status: performanceData.status === 'SUCCESS' ? 'passed' : 'failed',
              attempts: performanceData.attempts,
              memoryUsage: {
                start: performanceData.memoryUsage.start,
                end: performanceData.memoryUsage.end,
                peak: performanceData.memoryUsage.peak,
              },
              cpuUsage: {
                userTime: performanceData.cpuUsage.userTime,
                systemTime: performanceData.cpuUsage.systemTime,
                percentage: performanceData.cpuUsage.percentage,
              },
            };
            
            // Aggregate by test ID - combine attempts for the same test
            const existingData = testResultsMap.get(testData.testId);
            if (existingData) {
              // Merge attempts data - keep the final result but aggregate metrics
              testResultsMap.set(testData.testId, this.mergeTestPerformanceData(existingData, testData));
            } else {
              testResultsMap.set(testData.testId, testData);
            }
          } catch (error) {
            console.warn(`Failed to parse performance file: ${performanceFile}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to collect test performance data:', error);
    }

    return Array.from(testResultsMap.values());
  }

  /**
   * Convert TestSession to TestPerformanceData
   */
  private convertToTestPerformanceData(session: TestSession): TestPerformanceData | null {
    if (!session.performanceMetrics) {
      return null;
    }

    const metrics = session.performanceMetrics;
    const status = session.status === 'SUCCESS' ? 'passed' : 
                   session.status === 'FAILED' ? 'failed' : 'skipped';

    // Calculate CPU percentage
    const cpuUsage = metrics.cpuUsage;
    const duration = metrics.duration;
    const totalCpuTime = cpuUsage.end.user + cpuUsage.end.system;
    const cpuPercentage = duration > 0 ? (totalCpuTime / (duration * 1000)) * 100 : 0;

    return {
      testId: session.testId,
      testName: session.testName,
      duration: session.duration || metrics.duration,
      status,
      attempts: session.totalAttempts || 1,
      memoryUsage: {
        start: metrics.memoryUsage.start.heapUsed,
        end: metrics.memoryUsage.end.heapUsed,
        peak: metrics.memoryUsage.peak.heapUsed,
      },
      cpuUsage: {
        userTime: cpuUsage.end.user,
        systemTime: cpuUsage.end.system,
        percentage: cpuPercentage,
      },
    };
  }

  /**
   * Merge two TestPerformanceData objects for the same test (combine attempts)
   */
  private mergeTestPerformanceData(existing: TestPerformanceData, newData: TestPerformanceData): TestPerformanceData {
    // Use the latest status (final result)
    const finalStatus = newData.status === 'passed' ? 'passed' : 
                       existing.status === 'passed' ? 'passed' : 
                       newData.status;
    
    // Combine attempts
    const totalAttempts = existing.attempts + newData.attempts;
    
    // Use the final duration (from the last attempt)
    const finalDuration = newData.duration;
    
    // Use peak memory from both attempts
    const peakMemory = Math.max(existing.memoryUsage.peak, newData.memoryUsage.peak);
    
    // Use final CPU usage
    const finalCpuUsage = newData.cpuUsage;
    
    return {
      testId: existing.testId,
      testName: existing.testName,
      duration: finalDuration,
      status: finalStatus,
      attempts: totalAttempts,
      memoryUsage: {
        start: existing.memoryUsage.start, // Use initial start
        end: newData.memoryUsage.end, // Use final end
        peak: peakMemory, // Use peak from all attempts
      },
      cpuUsage: finalCpuUsage,
    };
  }

  /**
   * Generate a comprehensive HTML performance report with per-test data
   */
  generateReport(metrics: CIPerformanceMetrics, outputDir: string = 'test-results', testResults?: TestPerformanceData[]): string {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `performance-report-${timestamp}.html`);

    const html = this.generateHtmlContent(metrics, testResults);
    
    fs.writeFileSync(reportPath, html, 'utf8');
    
    console.log(`📊 Performance report generated: ${reportPath}`);
    
    return reportPath;
  }

  private generateHtmlContent(metrics: CIPerformanceMetrics, testResults?: TestPerformanceData[]): string {
    // Calculate duration from test results if available, otherwise use system metrics
    let duration: string;
    if (testResults && testResults.length > 0) {
      const totalTestDuration = testResults.reduce((sum, test) => sum + test.duration, 0);
      duration = (totalTestDuration / 1000).toFixed(1);
    } else {
      duration = metrics.endTime ? 
        ((metrics.endTime - metrics.startTime) / 1000).toFixed(1) : 
        ((Date.now() - metrics.startTime) / 1000).toFixed(1);
    }

    const _optimizerStatus = metrics.memoryOptimizerEnabled ? 'ON' : 'OFF';
    const optimizerBadge = metrics.memoryOptimizerEnabled ? 
      '<span class="badge enabled">ENABLED</span>' : 
      '<span class="badge disabled">DISABLED</span>';

    // Generate timeline data for chart
    const chartData = this.generateChartData(metrics.samples, testResults);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - Endorphin AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: #6c5ce7;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card .icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #2d3436;
            margin-bottom: 5px;
        }
        
        .stat-card .label {
            color: #636e72;
            font-size: 14px;
        }
        
        .charts-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .charts-container h3 {
            margin-bottom: 20px;
            color: #2d3436;
        }
        
        .component-section {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .component-section h3 {
            margin-bottom: 20px;
            color: #2d3436;
            font-size: 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        
        .component-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .component-charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
            .component-charts-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
        
        .chart-wrapper {
            position: relative;
            height: 350px;
            width: 100%;
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e9ecef;
        }
        
        .chart-wrapper h4 {
            margin: 0 0 15px 0;
            color: #2d3436;
            font-size: 16px;
            text-align: center;
        }
        
        .performance-table .sortable {
            cursor: pointer;
            user-select: none;
            position: relative;
        }
        
        .performance-table .sortable:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .sort-icon {
            margin-left: 5px;
            color: #999;
            font-size: 12px;
        }
        
        .performance-table .sortable.asc .sort-icon::after {
            content: ' ↑';
            color: #007bff;
        }
        
        .performance-table .sortable.desc .sort-icon::after {
            content: ' ↓';
            color: #007bff;
        }
        
        .chart-canvas {
            position: absolute !important;
            top: 45px;
            left: 20px;
            width: calc(100% - 40px) !important;
            height: calc(100% - 65px) !important;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge.enabled {
            background: #00b894;
            color: white;
        }
        
        .badge.disabled {
            background: #636e72;
            color: white;
        }
        
        .optimizer-info {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .optimizer-info h3 {
            margin-bottom: 15px;
            color: #2d3436;
        }
        
        .timestamp {
            text-align: center;
            color: #636e72;
            font-size: 14px;
            margin-top: 20px;
        }

        .table-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            overflow-x: auto;
        }

        .table-container h3 {
            margin-bottom: 20px;
            color: #2d3436;
        }

        .performance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .performance-table th,
        .performance-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }

        .performance-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #2d3436;
            position: sticky;
            top: 0;
        }

        .performance-table tbody tr:hover {
            background-color: #f8f9fa;
        }

        .status-passed {
            color: #00b894;
            font-weight: bold;
        }

        .status-failed {
            color: #e17055;
            font-weight: bold;
        }

        .status-skipped {
            color: #636e72;
            font-weight: bold;
        }

        .memory-stat {
            font-family: monospace;
            font-size: 12px;
        }

        .cpu-stat {
            font-family: monospace;
            font-size: 12px;
        }

        .duration-stat {
            font-weight: bold;
            color: #6c5ce7;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Report</h1>
            <div class="subtitle">Endorphin AI Test Execution Performance</div>
        </div>
        
        <div class="optimizer-info">
            <h3>🔧 Memory Optimizer Status</h3>
            <p>Memory Optimizer: ${optimizerBadge}</p>
            <p style="margin-top: 10px; color: #636e72; font-size: 14px;">
                Memory optimization ${metrics.memoryOptimizerEnabled ? 'reduces browser memory usage through advanced Chrome flags and resource management.' : 'was not enabled. Enable with ENDORPHIN_MEMORY_OPTIMIZER=true'}
            </p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="icon">⏱️</div>
                <div class="value">${duration}s</div>
                <div class="label">Test Duration</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">🧪</div>
                <div class="value">${testResults?.length || metrics.testCount}</div>
                <div class="label">Tests Executed</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">💾</div>
                <div class="value">${metrics.peakMemoryMB.toFixed(1)}MB</div>
                <div class="label">Peak Memory</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">📈</div>
                <div class="value">${metrics.avgMemoryMB.toFixed(1)}MB</div>
                <div class="label">Average Memory</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">⚡</div>
                <div class="value">${metrics.peakCpuPercent.toFixed(1)}%</div>
                <div class="label">Peak CPU</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">🔄</div>
                <div class="value">${metrics.avgCpuPercent.toFixed(1)}%</div>
                <div class="label">Average CPU</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">🗑️</div>
                <div class="value">${metrics.gcCount}</div>
                <div class="label">GC Triggers</div>
            </div>
            
            <div class="stat-card">
                <div class="icon">🧹</div>
                <div class="value">${metrics.cleanupCount}</div>
                <div class="label">Cleanups</div>
            </div>
        </div>

        <!-- Node.js Process Section -->
        <div class="component-section">
            <h3>🔧 Node.js Process Performance</h3>
            <div class="component-stats-grid">
                <div class="stat-card">
                    <div class="icon">⏱️</div>
                    <div class="value">${duration}s</div>
                    <div class="label">Duration</div>
                </div>
                <div class="stat-card">
                    <div class="icon">💾</div>
                    <div class="value">${(metrics.peakMemoryMB).toFixed(1)}MB</div>
                    <div class="label">Peak Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">📈</div>
                    <div class="value">${(metrics.avgMemoryMB).toFixed(1)}MB</div>
                    <div class="label">Avg Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">⚡</div>
                    <div class="value">${(metrics.peakCpuPercent).toFixed(1)}%</div>
                    <div class="label">Peak CPU</div>
                </div>
                <div class="stat-card">
                    <div class="icon">🔄</div>
                    <div class="value">${(metrics.avgCpuPercent).toFixed(1)}%</div>
                    <div class="label">Avg CPU</div>
                </div>
            </div>
            <div class="component-charts-grid">
                <div class="chart-wrapper">
                    <h4>💾 Memory Usage</h4>
                    <canvas id="nodejsMemoryChart" class="chart-canvas"></canvas>
                </div>
                <div class="chart-wrapper">
                    <h4>⚡ CPU Usage</h4>
                    <canvas id="nodejsCpuChart" class="chart-canvas"></canvas>
                </div>
            </div>
        </div>

        <!-- Browser Process Section -->
        <div class="component-section">
            <h3>🌐 Browser Process Performance</h3>
            <div class="component-stats-grid">
                <div class="stat-card">
                    <div class="icon">🧪</div>
                    <div class="value">${testResults?.length || 0}</div>
                    <div class="label">Tests</div>
                </div>
                <div class="stat-card">
                    <div class="icon">💾</div>
                    <div class="value">${this.getBrowserPeakMemory(testResults).toFixed(1)}MB</div>
                    <div class="label">Peak Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">📈</div>
                    <div class="value">${this.getBrowserAvgMemory(testResults).toFixed(1)}MB</div>
                    <div class="label">Avg Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">⚡</div>
                    <div class="value">${this.getBrowserPeakCpu(testResults).toFixed(1)}%</div>
                    <div class="label">Peak CPU</div>
                </div>
                <div class="stat-card">
                    <div class="icon">🔄</div>
                    <div class="value">${this.getBrowserAvgCpu(testResults).toFixed(1)}%</div>
                    <div class="label">Avg CPU</div>
                </div>
            </div>
            <div class="component-charts-grid">
                <div class="chart-wrapper">
                    <h4>💾 Memory Usage</h4>
                    <canvas id="browserMemoryChart" class="chart-canvas"></canvas>
                </div>
                <div class="chart-wrapper">
                    <h4>⚡ CPU Usage</h4>
                    <canvas id="browserCpuChart" class="chart-canvas"></canvas>
                </div>
            </div>
        </div>

        <!-- System Total Section -->
        <div class="component-section">
            <h3>💻 System Total Performance</h3>
            <div class="component-stats-grid">
                <div class="stat-card">
                    <div class="icon">⏱️</div>
                    <div class="value">${duration}s</div>
                    <div class="label">Duration</div>
                </div>
                <div class="stat-card">
                    <div class="icon">💾</div>
                    <div class="value">${(metrics.peakMemoryMB + this.getBrowserPeakMemory(testResults)).toFixed(1)}MB</div>
                    <div class="label">Peak Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">📈</div>
                    <div class="value">${(metrics.avgMemoryMB + this.getBrowserAvgMemory(testResults)).toFixed(1)}MB</div>
                    <div class="label">Avg Memory</div>
                </div>
                <div class="stat-card">
                    <div class="icon">⚡</div>
                    <div class="value">${Math.min(metrics.peakCpuPercent + this.getBrowserPeakCpu(testResults), 100).toFixed(1)}%</div>
                    <div class="label">Peak CPU</div>
                </div>
                <div class="stat-card">
                    <div class="icon">🔄</div>
                    <div class="value">${Math.min(metrics.avgCpuPercent + this.getBrowserAvgCpu(testResults), 100).toFixed(1)}%</div>
                    <div class="label">Avg CPU</div>
                </div>
                <div class="stat-card">
                    <div class="icon">🗑️</div>
                    <div class="value">${metrics.gcCount}</div>
                    <div class="label">GC Triggers</div>
                </div>
                <div class="stat-card">
                    <div class="icon">🧹</div>
                    <div class="value">${metrics.cleanupCount}</div>
                    <div class="label">Cleanups</div>
                </div>
            </div>
            <div class="component-charts-grid">
                <div class="chart-wrapper">
                    <h4>💾 Memory Usage</h4>
                    <canvas id="systemMemoryChart" class="chart-canvas"></canvas>
                </div>
                <div class="chart-wrapper">
                    <h4>⚡ CPU Usage</h4>
                    <canvas id="systemCpuChart" class="chart-canvas"></canvas>
                </div>
            </div>
        </div>

        ${testResults && testResults.length > 0 ? this.generateTestPerformanceTable(testResults) : ''}

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        // Table sorting functionality
        let currentSort = { column: null, direction: 'asc' };
        
        function initTableSorting() {
            const sortableHeaders = document.querySelectorAll('.performance-table .sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const sortKey = this.dataset.sort;
                    sortTable(sortKey);
                });
            });
        }
        
        function sortTable(column) {
            const table = document.querySelector('.performance-table tbody');
            const rows = Array.from(table.querySelectorAll('tr'));
            
            // Toggle direction
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            // Sort rows
            rows.sort((a, b) => {
                let aValue, bValue;
                
                switch (column) {
                    case 'testId':
                        aValue = a.dataset.testId;
                        bValue = b.dataset.testId;
                        break;
                    case 'testName':
                        aValue = a.dataset.testName;
                        bValue = b.dataset.testName;
                        break;
                    case 'status':
                        aValue = a.dataset.status;
                        bValue = b.dataset.status;
                        break;
                    case 'duration':
                        aValue = parseFloat(a.dataset.duration);
                        bValue = parseFloat(b.dataset.duration);
                        break;
                    case 'attempts':
                        aValue = parseInt(a.dataset.attempts);
                        bValue = parseInt(b.dataset.attempts);
                        break;
                    case 'memory':
                        aValue = parseFloat(a.dataset.memory);
                        bValue = parseFloat(b.dataset.memory);
                        break;
                    case 'cpu':
                        aValue = parseFloat(a.dataset.cpu);
                        bValue = parseFloat(b.dataset.cpu);
                        break;
                    default:
                        return 0;
                }
                
                if (currentSort.direction === 'desc') {
                    return aValue < bValue ? 1 : -1;
                } else {
                    return aValue > bValue ? 1 : -1;
                }
            });
            
            // Update header styles
            const headers = document.querySelectorAll('.performance-table .sortable');
            headers.forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            
            const activeHeader = document.querySelector(\`[data-sort="\${column}"]\`);
            if (activeHeader) {
                activeHeader.classList.add(currentSort.direction);
            }
            
            // Re-append sorted rows
            table.innerHTML = '';
            rows.forEach(row => table.appendChild(row));
        }

        // Chart contexts - 6 separate charts
        const nodejsMemoryCtx = document.getElementById('nodejsMemoryChart').getContext('2d');
        const nodejsCpuCtx = document.getElementById('nodejsCpuChart').getContext('2d');
        const browserMemoryCtx = document.getElementById('browserMemoryChart').getContext('2d');
        const browserCpuCtx = document.getElementById('browserCpuChart').getContext('2d');
        const systemMemoryCtx = document.getElementById('systemMemoryChart').getContext('2d');
        const systemCpuCtx = document.getElementById('systemCpuChart').getContext('2d');
        
        const chartData = ${chartData};
        
        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1);
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        };

        // Node.js Memory Chart
        const nodejsMemoryChart = new Chart(nodejsMemoryCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Memory (MB)',
                    data: chartData.nodejs.memory,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });

        // Node.js CPU Chart
        const nodejsCpuChart = new Chart(nodejsCpuCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'CPU (%)',
                    data: chartData.nodejs.cpu,
                    borderColor: '#a29bfe',
                    backgroundColor: 'rgba(162, 155, 254, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'CPU (%)'
                        },
                        max: 100
                    }
                }
            }
        });

        // Browser Memory Chart
        const browserMemoryChart = new Chart(browserMemoryCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Memory (MB)',
                    data: chartData.browser.memory,
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });

        // Browser CPU Chart
        const browserCpuChart = new Chart(browserCpuCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'CPU (%)',
                    data: chartData.browser.cpu,
                    borderColor: '#55a3ff',
                    backgroundColor: 'rgba(85, 163, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'CPU (%)'
                        },
                        max: 100
                    }
                }
            }
        });

        // System Memory Chart
        const systemMemoryChart = new Chart(systemMemoryCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Memory (MB)',
                    data: chartData.system.memory,
                    borderColor: '#fd79a8',
                    backgroundColor: 'rgba(253, 121, 168, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });

        // System CPU Chart
        const systemCpuChart = new Chart(systemCpuCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'CPU (%)',
                    data: chartData.system.cpu,
                    borderColor: '#fdcb6e',
                    backgroundColor: 'rgba(253, 203, 110, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        title: {
                            display: true,
                            text: 'CPU (%)'
                        },
                        max: 100
                    }
                }
            }
        });
        
        // Force resize to prevent charts growing
        nodejsMemoryChart.resize();
        nodejsCpuChart.resize();
        browserMemoryChart.resize();
        browserCpuChart.resize();
        systemMemoryChart.resize();
        systemCpuChart.resize();
        
        // Initialize table sorting when page loads
        initTableSorting();
    </script>
</body>
</html>`;
  }

  private generateChartData(samples: Array<{ timestamp: number; memoryMB: number; cpuPercent: number }>, testResults?: any[]): string {
    if (samples.length === 0) {
      return JSON.stringify({
        labels: [],
        nodejs: { memory: [], cpu: [] },
        browser: { memory: [], cpu: [] },
        system: { memory: [], cpu: [] }
      });
    }

    // Limit data points to prevent chart overload
    const maxPoints = 50;
    let processedSamples = samples;
    
    // If we have too many samples, downsample them
    if (samples.length > maxPoints) {
      const step = Math.ceil(samples.length / maxPoints);
      processedSamples = [];
      for (let i = 0; i < samples.length; i += step) {
        processedSamples.push(samples[i]);
      }
      // Always include the last sample
      if (processedSamples[processedSamples.length - 1] !== samples[samples.length - 1]) {
        processedSamples.push(samples[samples.length - 1]);
      }
    }

    const startTime = samples[0].timestamp;
    
    // Generate labels
    const labels = processedSamples.map(sample => {
      const secondsElapsed = Math.round((sample.timestamp - startTime) / 1000);
      return `${secondsElapsed}s`;
    });

    // Node.js process metrics (original CI monitoring data)
    const nodejsMemory = processedSamples.map(sample => Math.round(sample.memoryMB * 10) / 10);
    const nodejsCpu = processedSamples.map(sample => Math.round(sample.cpuPercent * 10) / 10);

    // Browser process metrics (from test results if available)
    let browserMemory = new Array(processedSamples.length).fill(0);
    let browserCpu = new Array(processedSamples.length).fill(0);
    
    if (testResults && testResults.length > 0) {
      // Use browser process data from test results
      for (let i = 0; i < processedSamples.length; i++) {
        const timestamp = processedSamples[i].timestamp;
        
        // Find matching test result data
        for (const test of testResults) {
          if (test.performanceMetrics && test.performanceMetrics.browserProcessMetrics) {
            const browserMetrics = test.performanceMetrics.browserProcessMetrics;
            const closestSample = this.findClosestBrowserSample(browserMetrics.samples, timestamp);
            if (closestSample) {
              browserMemory[i] = Math.round(closestSample.totalMemory * 10) / 10;
              browserCpu[i] = Math.round(closestSample.totalCpu * 10) / 10;
            }
          } else if (test.memoryUsage && test.cpuUsage) {
            // Fallback to test-level metrics
            browserMemory[i] = Math.round((test.memoryUsage.peak / 1024 / 1024) * 10) / 10;
            browserCpu[i] = Math.round(test.cpuUsage.percentage * 10) / 10;
          }
        }
      }
    }

    // System total metrics (Node.js + Browser)
    const systemMemory = nodejsMemory.map((nodeMemory, i) => 
      Math.round((nodeMemory + browserMemory[i]) * 10) / 10
    );
    const systemCpu = nodejsCpu.map((nodeCpu, i) => 
      Math.round(Math.min(nodeCpu + browserCpu[i], 100) * 10) / 10 // Cap at 100%
    );

    const chartData = {
      labels,
      nodejs: {
        memory: nodejsMemory,
        cpu: nodejsCpu
      },
      browser: {
        memory: browserMemory,
        cpu: browserCpu
      },
      system: {
        memory: systemMemory,
        cpu: systemCpu
      }
    };

    return JSON.stringify(chartData);
  }

  /**
   * Find the closest browser process sample to a given timestamp
   */
  private findClosestBrowserSample(samples: any[], timestamp: number): any | null {
    if (!samples || samples.length === 0) return null;
    
    let closest = samples[0];
    let minDiff = Math.abs(samples[0].timestamp - timestamp);
    
    for (const sample of samples) {
      const diff = Math.abs(sample.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = sample;
      }
    }
    
    return closest;
  }

  /**
   * Get browser peak memory from test results
   */
  private getBrowserPeakMemory(testResults?: TestPerformanceData[]): number {
    if (!testResults || testResults.length === 0) return 0;
    
    let peakMemory = 0;
    for (const test of testResults) {
      if (test.performanceMetrics?.browserProcessMetrics) {
        peakMemory = Math.max(peakMemory, test.performanceMetrics.browserProcessMetrics.peakMemory);
      } else if (test.memoryUsage) {
        peakMemory = Math.max(peakMemory, test.memoryUsage.peak / 1024 / 1024);
      }
    }
    return peakMemory;
  }

  /**
   * Get browser average memory from test results
   */
  private getBrowserAvgMemory(testResults?: TestPerformanceData[]): number {
    if (!testResults || testResults.length === 0) return 0;
    
    const memories: number[] = [];
    for (const test of testResults) {
      if (test.performanceMetrics?.browserProcessMetrics) {
        memories.push(test.performanceMetrics.browserProcessMetrics.avgMemory);
      } else if (test.memoryUsage) {
        memories.push(test.memoryUsage.peak / 1024 / 1024);
      }
    }
    return memories.length > 0 ? memories.reduce((sum, mem) => sum + mem, 0) / memories.length : 0;
  }

  /**
   * Get browser peak CPU from test results
   */
  private getBrowserPeakCpu(testResults?: TestPerformanceData[]): number {
    if (!testResults || testResults.length === 0) return 0;
    
    let peakCpu = 0;
    for (const test of testResults) {
      if (test.performanceMetrics?.browserProcessMetrics) {
        peakCpu = Math.max(peakCpu, test.performanceMetrics.browserProcessMetrics.peakCpu);
      } else if (test.cpuUsage) {
        peakCpu = Math.max(peakCpu, test.cpuUsage.percentage);
      }
    }
    return peakCpu;
  }

  /**
   * Get browser average CPU from test results
   */
  private getBrowserAvgCpu(testResults?: TestPerformanceData[]): number {
    if (!testResults || testResults.length === 0) return 0;
    
    const cpus: number[] = [];
    for (const test of testResults) {
      if (test.performanceMetrics?.browserProcessMetrics) {
        cpus.push(test.performanceMetrics.browserProcessMetrics.avgCpu);
      } else if (test.cpuUsage) {
        cpus.push(test.cpuUsage.percentage);
      }
    }
    return cpus.length > 0 ? cpus.reduce((sum, cpu) => sum + cpu, 0) / cpus.length : 0;
  }

  /**
   * Generate HTML table for per-test performance data
   */
  private generateTestPerformanceTable(testResults: TestPerformanceData[]): string {
    const tableRows = testResults.map(test => {
      const statusClass = `status-${test.status}`;
      const durationSeconds = (test.duration / 1000).toFixed(2);
      const memoryUsed = ((test.memoryUsage.peak - test.memoryUsage.start) / 1024 / 1024).toFixed(1);
      const cpuPercentage = test.cpuUsage.percentage.toFixed(1);
      
      return `
        <tr data-test-id="${test.testId}" 
            data-test-name="${test.testName}" 
            data-status="${test.status}" 
            data-duration="${test.duration}" 
            data-attempts="${test.attempts}"
            data-memory="${test.memoryUsage.peak}"
            data-cpu="${test.cpuUsage.percentage}">
          <td>${test.testId}</td>
          <td>${test.testName}</td>
          <td><span class="${statusClass}">${test.status.toUpperCase()}</span></td>
          <td><span class="duration-stat">${durationSeconds}s</span></td>
          <td><strong>${test.attempts}</strong></td>
          <td>
            <div class="memory-stat">
              <div>Start: ${(test.memoryUsage.start / 1024 / 1024).toFixed(1)} MB</div>
              <div>Peak: ${(test.memoryUsage.peak / 1024 / 1024).toFixed(1)} MB</div>
              <div>Used: ${memoryUsed} MB</div>
            </div>
          </td>
          <td>
            <div class="cpu-stat">
              <div>User: ${(test.cpuUsage.userTime / 1000).toFixed(1)}ms</div>
              <div>System: ${(test.cpuUsage.systemTime / 1000).toFixed(1)}ms</div>
              <div>Usage: ${cpuPercentage}%</div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="table-container">
        <h3>📋 Per-Test Performance Data</h3>
        <div style="overflow-x: auto;">
          <table class="performance-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="testId">Test ID <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="testName">Test Name <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="status">Status <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="duration">Duration <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="attempts">Attempts <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="memory">Memory Usage <span class="sort-icon">↕</span></th>
                <th class="sortable" data-sort="cpu">CPU Usage <span class="sort-icon">↕</span></th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <p style="margin-top: 10px; color: #636e72; font-size: 12px;">
          Showing performance data for ${testResults.length} test${testResults.length === 1 ? '' : 's'}
        </p>
      </div>
    `;
  }
}