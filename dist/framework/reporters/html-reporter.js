/**
 * Unified HTML Reporter Module
 * Complete solution for generating interactive HTML test reports
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * HTML Reporter for Endorphin AI test results
 * Generates interactive HTML reports from test-results data
 */
export class HtmlReporter {
    testResultsDir;
    reportsDir;
    templatesDir;
    constructor(testResultsDir = './test-results') {
        this.testResultsDir = path.resolve(testResultsDir);
        this.reportsDir = path.join(this.testResultsDir, 'reports');
        this.templatesDir = path.join(__dirname, '..', 'templates');
        // Ensure reports directory exists - handle errors gracefully
        try {
            if (!fs.existsSync(this.reportsDir)) {
                fs.mkdirSync(this.reportsDir, { recursive: true });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`Warning: Could not create reports directory: ${message}`);
        }
    }
    /**
     * Generate HTML report from all test results
     * @param options - Report generation options
     * @returns Path to generated report
     */
    async generateReport(options = {}) {
        try {
            console.log('📊 Generating HTML test report...');
            // Parse test results
            const reportData = this.collectTestResults(options.resultDirs);
            if (reportData.testResults.length === 0) {
                console.log('📁 Looking for test results in:', this.testResultsDir);
                console.log('💡 To generate a report, you need to run some tests first:');
                console.log('   1. Run: npx endorphin run test HEALTH-001');
                console.log('   2. Or run: npx endorphin run test all');
                console.log('   3. Then try: npx endorphin generate report');
                throw new Error('No test results found. Run some tests first.');
            }
            // Generate HTML report directly
            const filename = options.filename || `report-${new Date().toISOString().split('T')[0]}.html`;
            const reportPath = await this.generateHtmlReport(reportData, filename);
            console.log(`✅ Report generated: ${reportPath}`);
            console.log(`📈 Report includes ${reportData.testResults.length} test results`);
            console.log(`🎯 Success rate: ${reportData.summary.successRate.toFixed(1)}%`);
            return reportPath;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('❌ Error generating report:', message);
            throw error;
        }
    }
    /**
     * Open the latest report in the default browser
     * @param reportPath - Optional specific report path to open
     * @returns Promise<void>
     */
    async openReport(reportPath = null) {
        try {
            let targetPath = reportPath;
            if (!targetPath) {
                // Find the most recent report
                const reportsFiles = fs
                    .readdirSync(this.reportsDir)
                    .filter((file) => file.endsWith('.html'))
                    .map((file) => ({
                    name: file,
                    path: path.join(this.reportsDir, file),
                    mtime: fs.statSync(path.join(this.reportsDir, file)).mtime,
                }))
                    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
                if (reportsFiles.length === 0) {
                    throw new Error('No reports found. Generate a report first with: endorphin generate report');
                }
                targetPath = reportsFiles[0].path;
            }
            else {
                // If not an absolute path, treat as filename in reports directory
                if (!path.isAbsolute(targetPath)) {
                    targetPath = path.join(this.reportsDir, targetPath);
                }
            }
            if (!fs.existsSync(targetPath)) {
                const filename = path.basename(targetPath);
                throw new Error(`Report file not found: ${filename}`);
            }
            console.log(`🌐 Opening report: ${targetPath}`);
            // Open in default browser based on platform
            const { execSync } = await import('child_process');
            const command = process.platform === 'darwin'
                ? `open "${targetPath}"`
                : process.platform === 'win32'
                    ? `start "${targetPath}"`
                    : `xdg-open "${targetPath}"`;
            execSync(command);
            console.log('✅ Report opened in browser');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('❌ Error opening report:', message);
            throw error;
        }
    }
    /**
     * Collect and parse test results from the results directory
     * @param resultDirs - Optional specific result directories to include
     * @returns Aggregated report data
     */
    collectTestResults(resultDirs) {
        const testResults = [];
        const dirsToScan = resultDirs || this.getTestResultDirectories();
        for (const dir of dirsToScan) {
            const resultPath = path.join(this.testResultsDir, dir);
            if (fs.existsSync(resultPath)) {
                const result = this.parseTestResult(resultPath);
                if (result) {
                    testResults.push(result);
                }
            }
        }
        // Calculate summary
        const totalTests = testResults.length;
        const passedTests = testResults.filter((r) => r.status === 'SUCCESS').length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
        return {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate,
                totalDuration,
                timestamp: new Date().toISOString(),
            },
            testResults,
        };
    }
    /**
     * Get all test result directories
     * @returns Array of directory names
     */
    getTestResultDirectories() {
        if (!fs.existsSync(this.testResultsDir)) {
            return [];
        }
        return fs.readdirSync(this.testResultsDir).filter((item) => {
            const itemPath = path.join(this.testResultsDir, item);
            return fs.statSync(itemPath).isDirectory() && item !== 'reports';
        });
    }
    /**
     * Parse a single test result directory
     * @param resultPath - Path to the test result directory
     * @returns Parsed test result or null
     */
    parseTestResult(resultPath) {
        try {
            // Look for session.json, test-session.json, or summary.json
            let sessionFile = path.join(resultPath, 'test-session.json');
            if (!fs.existsSync(sessionFile)) {
                sessionFile = path.join(resultPath, 'test-session.json');
            }
            if (!fs.existsSync(sessionFile)) {
                sessionFile = path.join(resultPath, 'summary.json');
            }
            if (fs.existsSync(sessionFile)) {
                const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
                // Get screenshots
                const screenshotsDir = path.join(resultPath, 'screenshots');
                const screenshots = fs.existsSync(screenshotsDir)
                    ? fs
                        .readdirSync(screenshotsDir)
                        .filter((f) => f.endsWith('.png') || f.endsWith('.jpg'))
                        .map((f) => path.join(screenshotsDir, f))
                    : [];
                return {
                    testId: sessionData.testId || sessionData.sessionId || path.basename(resultPath),
                    testName: sessionData.testName || sessionData.sessionName || sessionData.testName,
                    status: sessionData.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
                    duration: sessionData.duration || 0,
                    error: sessionData.error || sessionData.finalResult,
                    screenshots,
                    sessionDir: resultPath,
                };
            }
        }
        catch (error) {
            console.warn(`Warning: Could not parse test result from ${resultPath}`);
        }
        return null;
    }
    /**
     * Generate HTML report from report data
     * @param reportData - Aggregated report data
     * @param filename - Output filename
     * @returns Path to generated report
     */
    async generateHtmlReport(reportData, filename) {
        try {
            // Load HTML template
            const templatePath = path.join(this.templatesDir, 'reporter', 'report-template.html');
            let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
            // Process template with report data
            htmlTemplate = this.processTemplate(htmlTemplate, reportData);
            // Write the processed HTML
            const outputPath = path.join(this.reportsDir, filename);
            fs.writeFileSync(outputPath, htmlTemplate, 'utf8');
            // Copy static assets (CSS, JS)
            await this.copyStaticAssets();
            // Copy screenshots for included test results
            await this.copyScreenshots(reportData);
            return outputPath;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to generate HTML report: ${message}`);
        }
    }
    /**
     * Process the HTML template with report data
     */
    processTemplate(template, data) {
        let processedTemplate = template;
        // Replace summary data - match the actual template placeholders
        processedTemplate = processedTemplate.replace(/{{totalTests}}/g, data.summary.totalTests.toString());
        processedTemplate = processedTemplate.replace(/{{totalRuns}}/g, data.summary.totalTests.toString());
        processedTemplate = processedTemplate.replace(/{{successfulRuns}}/g, data.summary.passedTests.toString());
        processedTemplate = processedTemplate.replace(/{{failedRuns}}/g, data.summary.failedTests.toString());
        processedTemplate = processedTemplate.replace(/{{successRate}}/g, data.summary.successRate.toFixed(1));
        processedTemplate = processedTemplate.replace(/{{generatedAt}}/g, new Date().toLocaleString());
        // Generate test statistics table
        const testStatsTable = this.generateTestStatsTable(data.testResults);
        processedTemplate = processedTemplate.replace(/{{testStatsTable}}/g, testStatsTable);
        // Generate recent results table
        const recentResultsTable = this.generateRecentResultsTable(data.testResults);
        processedTemplate = processedTemplate.replace(/{{recentResultsTable}}/g, recentResultsTable);
        // Generate JSON data for JavaScript
        const jsonData = JSON.stringify(data, null, 2);
        processedTemplate = processedTemplate.replace(/{{testDataJson}}/g, jsonData);
        return processedTemplate;
    }
    /**
     * Generate HTML for test results section
     */
    generateTestResultsHtml(testResults) {
        return testResults
            .map((result) => {
            const statusClass = result.status === 'SUCCESS' ? 'success' : 'failure';
            const statusIcon = result.status === 'SUCCESS' ? '✅' : '❌';
            const errorHtml = result.error
                ? `<div class="error-message">${this.escapeHtml(result.error)}</div>`
                : '';
            const screenshotsHtml = result.screenshots
                .map((screenshot) => `<img src="${screenshot}" alt="Screenshot" class="screenshot-thumb" onclick="openScreenshot('${screenshot}')">`)
                .join('');
            return `
        <div class="test-result ${statusClass}">
          <div class="test-header">
            <span class="status-icon">${statusIcon}</span>
            <span class="test-name">${this.escapeHtml(result.testName)}</span>
            <span class="test-id">${this.escapeHtml(result.testId)}</span>
            <span class="duration">${this.formatDuration(result.duration)}</span>
          </div>
          ${errorHtml}
          <div class="screenshots">
            ${screenshotsHtml}
          </div>
        </div>
      `;
        })
            .join('');
    }
    /**
     * Generate test statistics table HTML
     */
    generateTestStatsTable(testResults) {
        if (testResults.length === 0) {
            return '<tr><td colspan="4" class="text-center">No test results available</td></tr>';
        }
        return testResults
            .map((result) => {
            const statusBadge = result.status === 'SUCCESS'
                ? '<span class="badge bg-success">✅ Passed</span>'
                : '<span class="badge bg-danger">❌ Failed</span>';
            return `
          <tr>
            <td>${this.escapeHtml(result.testId)}</td>
            <td>${this.escapeHtml(result.testName)}</td>
            <td>${statusBadge}</td>
            <td>${this.formatDuration(result.duration)}</td>
          </tr>
        `;
        })
            .join('');
    }
    /**
     * Generate recent results table HTML
     */
    generateRecentResultsTable(testResults) {
        if (testResults.length === 0) {
            return '<tr><td colspan="5" class="text-center">No recent test results available</td></tr>';
        }
        // Sort by most recent first and take top 10
        const recentResults = testResults
            .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
            .slice(0, 10);
        return recentResults
            .map((result) => {
            const statusBadge = result.status === 'SUCCESS'
                ? '<span class="badge bg-success">✅ Passed</span>'
                : '<span class="badge bg-danger">❌ Failed</span>';
            const screenshotCount = result.screenshots ? result.screenshots.length : 0;
            const timestamp = result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A';
            return `
          <tr>
            <td>${this.escapeHtml(result.testId)}</td>
            <td>${this.escapeHtml(result.testName)}</td>
            <td>${statusBadge}</td>
            <td>${this.formatDuration(result.duration)}</td>
            <td>${screenshotCount} screenshots</td>
          </tr>
        `;
        })
            .join('');
    }
    /**
     * Copy static assets (CSS, JS) to output directory
     */
    async copyStaticAssets() {
        const assetsDir = path.join(this.reportsDir, 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }
        // Copy CSS
        const cssSource = path.join(this.templatesDir, 'reporter', 'styles.css');
        const cssTarget = path.join(assetsDir, 'styles.css');
        if (fs.existsSync(cssSource)) {
            fs.copyFileSync(cssSource, cssTarget);
        }
        // Copy JS
        const jsSource = path.join(this.templatesDir, 'reporter', 'scripts.js');
        const jsTarget = path.join(assetsDir, 'scripts.js');
        if (fs.existsSync(jsSource)) {
            fs.copyFileSync(jsSource, jsTarget);
        }
    }
    /**
     * Copy screenshots for test results
     */
    async copyScreenshots(reportData) {
        const screenshotsDir = path.join(this.reportsDir, 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        for (const result of reportData.testResults) {
            for (const screenshot of result.screenshots) {
                if (fs.existsSync(screenshot)) {
                    const filename = path.basename(screenshot);
                    const targetPath = path.join(screenshotsDir, filename);
                    fs.copyFileSync(screenshot, targetPath);
                }
            }
        }
    }
    /**
     * Format duration in milliseconds to human-readable string
     */
    formatDuration(duration) {
        if (duration < 1000) {
            return `${duration}ms`;
        }
        else if (duration < 60000) {
            return `${(duration / 1000).toFixed(1)}s`;
        }
        else {
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    }
    /**
     * Escape HTML characters to prevent XSS
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    /**
     * Clean up old test results
     * @param keepPerTest - Number of results to keep per test (default: 10)
     * @returns Cleanup summary
     */
    async cleanupResults(keepPerTest = 10) {
        try {
            console.log('🧹 Cleaning up old test results...');
            const { TestResultsParser } = await import('../results/test-results-parser.js');
            const parser = new TestResultsParser(this.testResultsDir);
            const cleanup = parser.cleanupOldResults(keepPerTest);
            if (cleanup.removedCount > 0) {
                console.log(`✅ Cleaned up ${cleanup.removedCount} old test result directories`);
                console.log(`📁 Keeping ${keepPerTest} most recent results per test`);
            }
            else {
                console.log('✨ No cleanup needed - all results are recent');
            }
            return cleanup;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('⚠️  Warning: Could not cleanup results:', message);
            return { removedCount: 0, removedDirs: [], totalTestIds: 0, keptPerTest: keepPerTest };
        }
    }
    /**
     * Clean up old report files
     * @param maxAge - Maximum age in days (default: 30)
     * @returns Cleanup summary
     */
    async cleanupOldReports(maxAge = 30) {
        try {
            console.log('🧹 Cleaning up old report files...');
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - maxAge);
            const reportFiles = fs
                .readdirSync(this.reportsDir)
                .filter((file) => file.endsWith('.html') && fs.statSync(path.join(this.reportsDir, file)).isFile());
            const removedFiles = [];
            for (const file of reportFiles) {
                const filePath = path.join(this.reportsDir, file);
                const stats = fs.statSync(filePath);
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    removedFiles.push(file);
                }
            }
            if (removedFiles.length > 0) {
                console.log(`✅ Cleaned up ${removedFiles.length} old report files`);
            }
            else {
                console.log('✨ No old report files to clean up');
            }
            return { removedCount: removedFiles.length, removedFiles };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('⚠️  Warning: Could not cleanup old reports:', message);
            return { removedCount: 0, removedFiles: [] };
        }
    }
}
//# sourceMappingURL=html-reporter.js.map