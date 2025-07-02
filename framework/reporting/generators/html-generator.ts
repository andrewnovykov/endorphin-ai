/**
 * HTML Report Generator
 * Handles HTML template processing and report generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ParsedTestResult, ReportData } from '../processors/results-parser.js';

/**
 * Get templates directory - works both in development and when installed as package
 */
function getTemplatesDir(): string {
  // Get the directory path of the current file (ES modules compatible)
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);

  // Try multiple possible paths for templates
  const possiblePaths = [
    // When running from source (development)
    path.join(process.cwd(), 'framework', 'templates'),
    // When installed as npm package (from node_modules)
    path.join(currentDir, '..', '..', 'templates'),
    // When running from dist (built version)
    path.join(currentDir, '..', 'templates'),
    // Fallback: relative to this file
    path.resolve(currentDir, '../../templates'),
  ];

  for (const templatePath of possiblePaths) {
    if (fs.existsSync(path.join(templatePath, 'reporter', 'report-template.html'))) {
      return templatePath;
    }
  }

  throw new Error(`Templates directory not found. Searched paths: ${possiblePaths.join(', ')}`);
}

export interface ReportOptions {
  filename?: string;
  template?: string;
  includeScreenshots?: boolean;
  includeTokenUsage?: boolean;
  resultDirs?: string[];
}

/**
 * HTML Report Generator
 * Generates interactive HTML reports from parsed test data
 */
export class HtmlGenerator {
  private reportsDir: string;
  private templatesDir: string;

  constructor(reportsDir: string) {
    this.reportsDir = reportsDir;
    this.templatesDir = getTemplatesDir();

    // Ensure reports directory exists
    try {
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not create reports directory: ${message}`);
    }
  }

  /**
   * Generate HTML report from report data
   */
  async generateReport(reportData: ReportData, options: ReportOptions = {}): Promise<string> {
    try {
      const filename = options.filename || `report-${new Date().toISOString().split('T')[0]}.html`;
      const templateName = options.template || 'report-template.html';

      // Load HTML template
      const templatePath = path.join(this.templatesDir, 'reporter', templateName);
      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

      // Process template with report data
      htmlTemplate = this.processTemplate(htmlTemplate, reportData, options);

      // Write the processed HTML
      const outputPath = path.join(this.reportsDir, filename);
      fs.writeFileSync(outputPath, htmlTemplate, 'utf8');

      // Copy static assets (CSS, JS)
      await this.copyStaticAssets();

      // Copy screenshots if enabled
      if (options.includeScreenshots !== false) {
        await this.copyScreenshots(reportData);
      }

      return outputPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate HTML report: ${message}`);
    }
  }

  /**
   * Process the HTML template with report data
   */
  private processTemplate(template: string, data: ReportData, _options: ReportOptions): string {
    let processedTemplate = template;

    // Calculate token summary from all results
    const totalTokens = data.testResults.reduce((total: number, result: ParsedTestResult) => {
      return total + (result.tokenSummary?.totalTokens || 0);
    }, 0);
    const totalCost = data.testResults.reduce((total: number, result: ParsedTestResult) => {
      return total + (result.tokenSummary?.totalCost || 0);
    }, 0);

    // Replace summary data
    const replacements = {
      '{{totalTests}}': data.summary.totalTests.toString(),
      '{{totalRuns}}': data.summary.totalTests.toString(),
      '{{successfulRuns}}': data.summary.passedTests.toString(),
      '{{failedRuns}}': data.summary.failedTests.toString(),
      '{{successRate}}': data.summary.successRate.toFixed(1),
      '{{totalTokens}}': totalTokens.toLocaleString(),
      '{{totalCost}}': totalCost.toFixed(4),
      '{{generatedAt}}': new Date().toLocaleString(),
      '{{testStatsTable}}': this.generateTestStatsTable(data.testResults),
      '{{recentResultsTable}}': this.generateRecentResultsTable(data.testResults),
      '{{testDataJson}}': JSON.stringify(data.testResults, null, 2),
    };

    // Apply all replacements
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      processedTemplate = processedTemplate.replace(regex, value);
    }

    return processedTemplate;
  }

  /**
   * Generate test statistics table HTML
   */
  private generateTestStatsTable(testResults: ParsedTestResult[]): string {
    if (testResults.length === 0) {
      return '<tr><td colspan="6" class="text-center">No test results available</td></tr>';
    }

    // Group results by test name for aggregated statistics
    const testStats: Record<
      string,
      {
        testName: string;
        totalRuns: number;
        successfulRuns: number;
        failedRuns: number;
        avgDuration: number;
        lastRun: string;
      }
    > = {};

    testResults.forEach((result) => {
      const testName = result.testName;

      if (!testStats[testName]) {
        testStats[testName] = {
          testName,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          avgDuration: 0,
          lastRun: result.startTime,
        };
      }

      const stats = testStats[testName];
      stats.totalRuns++;

      if (result.status === 'SUCCESS') {
        stats.successfulRuns++;
      } else {
        stats.failedRuns++;
      }

      // Update average duration
      stats.avgDuration =
        (stats.avgDuration * (stats.totalRuns - 1) + result.duration) / stats.totalRuns;

      // Update last run if this is more recent
      if (new Date(result.startTime) > new Date(stats.lastRun)) {
        stats.lastRun = result.startTime;
      }
    });

    return Object.values(testStats)
      .map((stats) => {
        const successRate =
          stats.totalRuns > 0 ? ((stats.successfulRuns / stats.totalRuns) * 100).toFixed(1) : '0.0';
        const avgDurationFormatted = this.formatDuration(stats.avgDuration);
        const lastRunFormatted = new Date(stats.lastRun).toLocaleString();

        return `
          <tr>
            <td><strong>${this.escapeHtml(stats.testName)}</strong></td>
            <td>${stats.totalRuns}</td>
            <td><span class="badge bg-success">${stats.successfulRuns}</span></td>
            <td><span class="badge bg-danger">${stats.failedRuns}</span></td>
            <td>${successRate}%</td>
            <td>${avgDurationFormatted}</td>
            <td>${lastRunFormatted}</td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Generate recent results table HTML
   */
  private generateRecentResultsTable(testResults: ParsedTestResult[]): string {
    if (testResults.length === 0) {
      return '<tr><td colspan="5" class="text-center">No recent test results</td></tr>';
    }

    // Take most recent 10 results
    const recentResults = testResults.slice(0, 10);

    return recentResults
      .map((result) => {
        const statusBadge =
          result.status === 'SUCCESS'
            ? '<span class="badge bg-success">SUCCESS</span>'
            : '<span class="badge bg-danger">FAILED</span>';

        const durationFormatted = this.formatDuration(result.duration);
        const startTimeFormatted = new Date(result.startTime).toLocaleString();

        const screenshotCount = result.screenshots?.length || 0;
        const screenshotInfo =
          screenshotCount > 0
            ? `<small class="text-muted">${screenshotCount} screenshot(s)</small>`
            : '<small class="text-muted">No screenshots</small>';

        return `
          <tr>
            <td><strong>${this.escapeHtml(result.testName)}</strong></td>
            <td><code>${this.escapeHtml(result.testId)}</code></td>
            <td>${statusBadge}</td>
            <td>${durationFormatted}</td>
            <td>
              ${startTimeFormatted}<br>
              ${screenshotInfo}
            </td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Generate test results HTML for detailed view
   */
  generateTestResultsHtml(testResults: ParsedTestResult[]): string {
    return testResults
      .map((result) => {
        const statusClass = result.status === 'SUCCESS' ? 'success' : 'failure';
        const statusIcon = result.status === 'SUCCESS' ? '✅' : '❌';

        const screenshotsHtml = result.screenshots
          .map(
            (screenshot) =>
              `<img src="screenshots/${screenshot}" alt="Screenshot" class="screenshot-thumb">`
          )
          .join('');

        const stepsHtml = result.steps
          .map(
            (step, index) => `
            <div class="step">
              <strong>Step ${index + 1}:</strong> ${this.escapeHtml(step.description || 'No description')}
            </div>
          `
          )
          .join('');

        const tokenUsageHtml = result.tokenSummary
          ? `
          <div class="token-usage">
            <strong>Token Usage:</strong> ${result.tokenSummary.totalTokens} tokens 
            ($${result.tokenSummary.totalCost?.toFixed(4) || '0.0000'})
          </div>
        `
          : '';

        return `
          <div class="test-result ${statusClass}">
            <div class="test-header">
              <h3>${statusIcon} ${this.escapeHtml(result.testName)}</h3>
              <div class="test-meta">
                <span class="test-id">ID: ${this.escapeHtml(result.testId)}</span>
                <span class="duration">Duration: ${this.formatDuration(result.duration)}</span>
                <span class="timestamp">${new Date(result.startTime).toLocaleString()}</span>
              </div>
            </div>
            <div class="test-content">
              ${result.finalResult ? `<div class="result">${this.escapeHtml(result.finalResult)}</div>` : ''}
              ${tokenUsageHtml}
              <div class="screenshots">${screenshotsHtml}</div>
              <details class="test-steps">
                <summary>Test Steps (${result.steps.length})</summary>
                ${stepsHtml}
              </details>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Copy static assets (CSS, JS) to reports directory
   */
  private copyStaticAssets(): void {
    try {
      const assetsToMap = [
        { source: 'styles.css', dest: 'styles.css' },
        { source: 'scripts.js', dest: 'scripts.js' },
      ];

      for (const asset of assetsToMap) {
        const sourcePath = path.join(this.templatesDir, 'reporter', asset.source);
        const destPath = path.join(this.reportsDir, asset.dest);

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not copy static assets:', error);
    }
  }

  /**
   * Copy screenshots from test results to reports directory
   */
  private copyScreenshots(reportData: ReportData): void {
    try {
      const screenshotsDir = path.join(this.reportsDir, 'screenshots');

      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Copy screenshots from each test result
      for (const result of reportData.testResults) {
        const sessionScreenshotsDir = path.join(result.sessionDir, 'screenshots');

        if (fs.existsSync(sessionScreenshotsDir)) {
          const screenshots = fs.readdirSync(sessionScreenshotsDir);

          for (const screenshot of screenshots) {
            const sourcePath = path.join(sessionScreenshotsDir, screenshot);
            const destPath = path.join(screenshotsDir, screenshot);

            if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
              fs.copyFileSync(sourcePath, destPath);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Could not copy screenshots:', error);
    }
  }

  /**
   * Format duration in milliseconds to human readable format
   */
  private formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    }

    const seconds = Math.floor(duration / 1000);
    const ms = duration % 1000;

    if (seconds < 60) {
      return ms > 0 ? `${seconds}.${ms.toString().padStart(3, '0')}s` : `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = { innerHTML: '' } as any;
    div.textContent = text;
    return (
      div.innerHTML ||
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    );
  }

  /**
   * Generate custom report with specific template
   */
  generateCustomReport(
    reportData: ReportData,
    templateContent: string,
    filename: string
  ): string {
    try {
      // Process custom template
      const processedTemplate = this.processTemplate(templateContent, reportData, {});

      // Write the processed HTML
      const outputPath = path.join(this.reportsDir, filename);
      fs.writeFileSync(outputPath, processedTemplate, 'utf8');

      return outputPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate custom report: ${message}`);
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    try {
      const templatesPath = path.join(this.templatesDir, 'reporter');

      if (!fs.existsSync(templatesPath)) {
        return [];
      }

      return fs
        .readdirSync(templatesPath)
        .filter((file) => file.endsWith('.html'))
        .map((file) => file.replace('.html', ''));
    } catch (error) {
      console.warn('Warning: Could not read templates directory:', error);
      return [];
    }
  }
}
