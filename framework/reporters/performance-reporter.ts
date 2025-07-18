/**
 * Simple Performance Report Generator
 * Creates a standalone HTML report for performance metrics
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CIPerformanceMetrics } from '../core/ci-performance.js';

export class PerformanceReporter {
  /**
   * Generate a simple HTML performance report
   */
  async generateReport(metrics: CIPerformanceMetrics, outputDir: string = 'test-results'): Promise<string> {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `performance-report-${timestamp}.html`);

    const html = this.generateHtmlContent(metrics);
    
    fs.writeFileSync(reportPath, html, 'utf8');
    
    console.log(`📊 Performance report generated: ${reportPath}`);
    
    return reportPath;
  }

  private generateHtmlContent(metrics: CIPerformanceMetrics): string {
    const duration = metrics.endTime ? 
      ((metrics.endTime - metrics.startTime) / 1000).toFixed(1) : 
      ((Date.now() - metrics.startTime) / 1000).toFixed(1);

    const optimizerStatus = metrics.memoryOptimizerEnabled ? 'ON' : 'OFF';
    const optimizerBadge = metrics.memoryOptimizerEnabled ? 
      '<span class="badge enabled">ENABLED</span>' : 
      '<span class="badge disabled">DISABLED</span>';

    // Generate timeline data for chart
    const chartData = this.generateChartData(metrics.samples);
    
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
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .chart-container h3 {
            margin-bottom: 20px;
            color: #2d3436;
        }
        
        .chart-wrapper {
            position: relative;
            height: 300px;
            width: 100%;
        }
        
        #performanceChart {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
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
                <div class="value">${metrics.testCount}</div>
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

        <div class="chart-container">
            <h3>📊 Performance Timeline</h3>
            <div class="chart-wrapper">
                <canvas id="performanceChart"></canvas>
            </div>
            <p style="margin-top: 10px; color: #636e72; font-size: 12px; text-align: center;">
                ${metrics.samples.length > 50 ? `Showing ${Math.min(51, metrics.samples.length)} of ${metrics.samples.length} samples for clarity` : `Showing all ${metrics.samples.length} samples`}
            </p>
        </div>

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        const chartData = ${chartData};
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Memory (MB)',
                        data: chartData.memory,
                        borderColor: '#6c5ce7',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                        tension: 0.4,
                        yAxisID: 'memory',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'CPU (%)',
                        data: chartData.cpu,
                        borderColor: '#00b894',
                        backgroundColor: 'rgba(0, 184, 148, 0.1)',
                        tension: 0.4,
                        yAxisID: 'cpu',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                interaction: {
                    mode: 'index',
                    intersect: false,
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
                    memory: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        },
                        beginAtZero: true
                    },
                    cpu: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'CPU (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // Force resize to prevent chart growing
        chart.resize();
    </script>
</body>
</html>`;
  }

  private generateChartData(samples: Array<{ timestamp: number; memoryMB: number; cpuPercent: number }>): string {
    if (samples.length === 0) {
      return JSON.stringify({
        labels: [],
        memory: [],
        cpu: []
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
    
    const chartData = {
      labels: processedSamples.map(sample => {
        const secondsElapsed = Math.round((sample.timestamp - startTime) / 1000);
        return `${secondsElapsed}s`;
      }),
      memory: processedSamples.map(sample => Math.round(sample.memoryMB * 10) / 10),
      cpu: processedSamples.map(sample => Math.round(sample.cpuPercent * 10) / 10)
    };

    return JSON.stringify(chartData);
  }
}