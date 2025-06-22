import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * ReportGenerator - Generates HTML reports from test result data
 * Handles template processing and asset generation for interactive reports
 */
export class ReportGenerator {
  /**
   * Create a new ReportGenerator instance
   * @param {string} templatesDir - Path to the HTML templates directory
   * @param {string} outputDir - Path where generated reports will be saved
   */
  constructor(templatesDir, outputDir) {
    this.templatesDir = templatesDir;
    this.outputDir = outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate an HTML report from report data
   * @param {Object} reportData - Aggregated report data from TestResultsParser
   * @param {string} filename - Output filename (default: 'report.html')
   * @returns {string} Path to the generated report file
   */
  async generateReport(reportData, filename = 'report.html') {
    try {
      // Load HTML template
      const templatePath = path.join(this.templatesDir, 'report-template.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

      // Process template with report data
      htmlTemplate = this.processTemplate(htmlTemplate, reportData);

      // Write the processed HTML
      const outputPath = path.join(this.outputDir, filename);
      fs.writeFileSync(outputPath, htmlTemplate, 'utf8');

      // Copy static assets (CSS, JS)
      await this.copyStaticAssets();

      // Copy screenshots for included test results
      await this.copyScreenshots(reportData);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Process HTML template by replacing placeholders with actual data
   * @param {string} template - HTML template string
   * @param {Object} reportData - Report data to inject
   * @returns {string} Processed HTML
   */
  processTemplate(template, reportData) {
    // Replace basic data placeholders
    template = template.replace(/{{generatedAt}}/g, new Date(reportData.generatedAt).toLocaleString());
    template = template.replace(/{{totalTests}}/g, reportData.totalTests);
    template = template.replace(/{{totalRuns}}/g, reportData.totalRuns);
    template = template.replace(/{{successfulRuns}}/g, reportData.successfulRuns);
    template = template.replace(/{{failedRuns}}/g, reportData.failedRuns);
    template = template.replace(/{{successRate}}/g, reportData.successRate);

    // Generate test statistics table
    const testStatsHtml = this.generateTestStatsTable(reportData.testStats);
    template = template.replace(/{{testStatsTable}}/g, testStatsHtml);

    // Generate recent results table
    const recentResultsHtml = this.generateRecentResultsTable(reportData.results);
    template = template.replace(/{{recentResultsTable}}/g, recentResultsHtml);

    // Generate detailed test data for modals (JSON)
    const testDataJson = JSON.stringify(reportData.results, null, 2);
    template = template.replace(/{{testDataJson}}/g, testDataJson);

    return template;
  }

  /**
   * Generate HTML table for test statistics
   * @param {Array} testStats - Array of test statistics
   * @returns {string} HTML table string
   */
  generateTestStatsTable(testStats) {
    if (!testStats || testStats.length === 0) {
      return '<tr><td colspan="6" class="text-center text-muted">No test data available</td></tr>';
    }

    return testStats.map(stat => {
      const successRatePercent = stat.totalRuns > 0 ? Math.round((stat.successfulRuns / stat.totalRuns) * 100) : 0;
      const statusClass = successRatePercent >= 90 ? 'success' : successRatePercent >= 70 ? 'warning' : 'danger';
      
      return `
        <tr>
          <td>
            <strong>${this.escapeHtml(stat.testId)}</strong><br>
            <small class="text-muted">${this.escapeHtml(stat.testName)}</small>
          </td>
          <td><span class="badge bg-primary">${stat.totalRuns}</span></td>
          <td><span class="badge bg-success">${stat.successfulRuns}</span></td>
          <td><span class="badge bg-danger">${stat.failedRuns}</span></td>
          <td>
            <div class="progress" style="height: 20px;">
              <div class="progress-bar bg-${statusClass}" 
                   style="width: ${successRatePercent}%">
                ${successRatePercent}%
              </div>
            </div>
          </td>
          <td>
            <small>${new Date(stat.lastRun).toLocaleString()}</small><br>
            <small class="text-muted">Avg: ${stat.averageDuration}ms</small>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Generate HTML table for recent test results
   * @param {Array} results - Array of recent test results
   * @returns {string} HTML table string
   */
  generateRecentResultsTable(results) {
    if (!results || results.length === 0) {
      return '<tr><td colspan="6" class="text-center text-muted">No recent results available</td></tr>';
    }

    return results.map((result, index) => {
      const session = result.session;
      const summary = result.summary;
      const statusClass = session.status === 'SUCCESS' ? 'success' : 'danger';
      const statusIcon = session.status === 'SUCCESS' ? '✓' : '✗';
      
      return `
        <tr class="test-result-row" data-result-index="${index}">
          <td>
            <strong>${this.escapeHtml(session.testId)}</strong><br>
            <small class="text-muted">${this.escapeHtml(session.testName)}</small>
          </td>
          <td>
            <span class="badge bg-${statusClass}">
              ${statusIcon} ${session.status}
            </span>
          </td>
          <td><small>${new Date(session.startTime).toLocaleString()}</small></td>
          <td>${session.duration || 0}ms</td>
          <td>
            <span class="badge bg-info">${session.steps ? session.steps.length : 0}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-details-btn" 
                    data-result-index="${index}">
              View Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Copy static assets (CSS, JS) to output directory
   */
  async copyStaticAssets() {
    const assets = ['styles.css', 'scripts.js'];
    
    for (const asset of assets) {
      const srcPath = path.join(this.templatesDir, asset);
      const destPath = path.join(this.outputDir, asset);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Copy screenshots from test results to output directory
   * @param {Object} reportData - Report data containing test results
   */
  async copyScreenshots(reportData) {
    const screenshotsDir = path.join(this.outputDir, 'screenshots');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    for (const result of reportData.results) {
      if (result.screenshots && result.screenshots.length > 0) {
        const resultScreenshotsDir = path.join(screenshotsDir, result.resultDir);
        
        if (!fs.existsSync(resultScreenshotsDir)) {
          fs.mkdirSync(resultScreenshotsDir, { recursive: true });
        }

        for (const screenshot of result.screenshots) {
          const srcPath = path.join(result.screenshotsPath, screenshot);
          const destPath = path.join(resultScreenshotsDir, screenshot);
          
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    }
  }

  /**
   * Generate a lightweight summary report (for quick overview)
   * @param {Object} reportData - Report data
   * @returns {string} Path to generated summary report
   */
  async generateSummaryReport(reportData) {
    // Safely handle results array
    const results = Array.isArray(reportData.results) ? reportData.results : [];
    
    const summaryData = {
      generatedAt: reportData.generatedAt,
      totalTests: reportData.totalTests,
      totalRuns: reportData.totalRuns,
      successfulRuns: reportData.successfulRuns,
      failedRuns: reportData.failedRuns,
      successRate: reportData.successRate,
      testStats: reportData.testStats || [],
      results: results.slice(0, 10) // Only last 10 results for summary
    };

    return this.generateReport(summaryData, 'summary-report.html');
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return text;
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Clean up old report files
   * @param {number} maxAge - Maximum age in days (default: 30)
   * @returns {Object} Cleanup summary
   */
  cleanupOldReports(maxAge = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    
    let removedCount = 0;
    const removedFiles = [];

    try {
      const files = fs.readdirSync(this.outputDir);
      
      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && stats.mtime < cutoffDate && file.endsWith('.html')) {
          fs.unlinkSync(filePath);
          removedCount++;
          removedFiles.push(file);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old reports:', error);
    }

    return { removedCount, removedFiles };
  }
}
