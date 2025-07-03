/**
 * HTML Reporter
 * Main HTML reporter class using modular components
 */
import path from 'path';
import { HtmlGenerator } from '../reporting/generators/html-generator.js';
import { AssetManager } from '../reporting/processors/asset-manager.js';
import { ResultsParser } from '../reporting/processors/results-parser.js';
/**
 * HTML Reporter for Endorphin AI test results
 * Generates interactive HTML reports from test-results data
 */
export class HtmlReporter {
    resultsParser;
    htmlGenerator;
    assetManager;
    testResultsDir;
    reportsDir;
    constructor(testResultsDir = './test-results', options = {}) {
        this.testResultsDir = path.resolve(testResultsDir);
        this.reportsDir = path.join(this.testResultsDir, 'reports');
        // Initialize components
        this.resultsParser = new ResultsParser(this.testResultsDir);
        this.htmlGenerator = new HtmlGenerator(this.reportsDir);
        this.assetManager = new AssetManager({
            reportsDir: this.reportsDir,
            maxReportAge: options.maxReportAge || 30,
            maxReportsPerTest: options.maxReportsPerTest || 10,
        });
    }
    async generateReport(optionsOrSessions = {}) {
        try {
            console.log('📊 Generating HTML test report...');
            let reportData;
            let options = {};
            // Check if we have sessions or options
            if (Array.isArray(optionsOrSessions)) {
                // Handle sessions directly (for testing)
                const sessions = optionsOrSessions;
                reportData = this.resultsParser.createReportDataFromSessions(sessions);
            }
            else {
                // Handle normal options
                options = optionsOrSessions;
                reportData = this.resultsParser.collectTestResults(options.resultDirs);
            }
            if (reportData.testResults.length === 0) {
                console.log('📁 Looking for test results in:', this.testResultsDir);
                console.log('💡 To generate a report, you need to run some tests first:');
                console.log('   1. Run: npx endorphin run test HEALTH-001');
                console.log('   2. Or run: npx endorphin run test all');
                console.log('   3. Then try: npx endorphin generate report');
                throw new Error('No test results found. Run some tests first.');
            }
            // Generate HTML report
            const reportPath = await this.htmlGenerator.generateReport(reportData, options);
            console.log(`✅ Report generated: ${reportPath}`);
            console.log(`📈 Report includes ${reportData.testResults.length} test results`);
            console.log(`🎯 Success rate: ${reportData.summary.successRate.toFixed(1)}%`);
            return reportPath;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to generate report: ${message}`);
        }
    }
    /**
     * Open the most recent report in browser
     */
    async openReport(reportPath = null) {
        try {
            const targetPath = reportPath || (await this.getLatestReport());
            if (!targetPath) {
                throw new Error('No reports found. Generate a report first.');
            }
            try {
                // Dynamically import the 'open' package if available
                // Dynamic import to avoid bundling issues
                const openModule = await import('open');
                const open = openModule.default || openModule;
                await open(targetPath);
                console.log(`🌐 Opened report: ${targetPath}`);
            }
            catch {
                console.log(`📄 Report generated: ${targetPath}`);
                console.log('💡 Install "open" package to automatically open reports in browser');
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Failed to open report: ${message}`);
            console.log(`💡 You can manually open: ${reportPath || 'latest report'}`);
        }
    }
    /**
     * Get the latest report file
     */
    async getLatestReport() {
        try {
            const fs = await import('fs');
            if (!fs.existsSync(this.reportsDir)) {
                return null;
            }
            const files = fs
                .readdirSync(this.reportsDir)
                .filter((file) => file.endsWith('.html'))
                .map((file) => ({
                name: file,
                path: path.join(this.reportsDir, file),
                mtime: fs.statSync(path.join(this.reportsDir, file)).mtime,
            }))
                .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
            return files.length > 0 ? files[0].path : null;
        }
        catch (error) {
            console.warn('Error finding latest report:', error);
            return null;
        }
    }
    /**
     * Generate custom report with specific options
     */
    async generateCustomReport(options = {}) {
        try {
            console.log('📊 Generating custom HTML report...');
            // Parse test results
            const reportData = this.resultsParser.collectTestResults(options.resultDirs);
            // Apply filters if specified
            if (options.filters) {
                reportData.testResults = this.resultsParser.filterResults(reportData.testResults, options.filters);
                // Recalculate summary for filtered results
                reportData.summary = this.calculateFilteredSummary(reportData.testResults);
            }
            if (reportData.testResults.length === 0) {
                throw new Error('No test results match the specified filters.');
            }
            // Generate HTML report with custom options
            const reportPath = await this.htmlGenerator.generateReport(reportData, options);
            console.log(`✅ Custom report generated: ${reportPath}`);
            console.log(`📈 Report includes ${reportData.testResults.length} filtered test results`);
            return reportPath;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to generate custom report: ${message}`);
        }
    }
    /**
     * Calculate summary for filtered results
     */
    calculateFilteredSummary(testResults) {
        const totalTests = testResults.length;
        const passedTests = testResults.filter((result) => result.status === 'SUCCESS').length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        const totalDuration = testResults.reduce((sum, result) => sum + (result.duration || 0), 0);
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate,
            totalDuration,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Clean up old results keeping specified number per test
     */
    async cleanupResults(keepPerTest = 10) {
        try {
            console.log(`🧹 Cleaning up test results (keeping ${keepPerTest} per test)...`);
            // Clean up reports and screenshots
            const cleanupResult = await this.assetManager.cleanupResults(keepPerTest);
            const freedSpaceMB = Math.round((cleanupResult.freedSpace / (1024 * 1024)) * 100) / 100;
            console.log(`✅ Cleanup completed:`);
            console.log(`   📄 Deleted ${cleanupResult.deletedReports} old reports`);
            console.log(`   🖼️  Deleted ${cleanupResult.deletedScreenshots} orphaned screenshots`);
            console.log(`   💾 Freed ${freedSpaceMB} MB of space`);
            return {
                deletedSessions: 0, // Legacy compatibility
                deletedReports: cleanupResult.deletedReports,
                freedSpaceMB,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Cleanup failed: ${message}`);
        }
    }
    /**
     * Clean up old reports by age
     */
    cleanupOldReports(maxAge = 30) {
        try {
            console.log(`🧹 Cleaning up reports older than ${maxAge} days...`);
            const cleanupResult = this.assetManager.cleanupOldReports(maxAge);
            const freedSpaceMB = Math.round((cleanupResult.freedSpace / (1024 * 1024)) * 100) / 100;
            console.log(`✅ Cleanup completed:`);
            console.log(`   📄 Deleted ${cleanupResult.deletedReports} old reports`);
            console.log(`   💾 Freed ${freedSpaceMB} MB of space`);
            return {
                deleted: cleanupResult.deletedReports,
                freedSpaceMB,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Cleanup failed: ${message}`);
            return { deleted: 0, freedSpaceMB: 0 };
        }
    }
    /**
     * Get report statistics
     */
    getStatistics() {
        try {
            const assetStats = this.assetManager.getAssetStatistics();
            const reportData = this.resultsParser.collectTestResults();
            const testStats = this.resultsParser.getTestStatistics(reportData.testResults);
            return {
                reports: {
                    count: assetStats.reportsCount,
                    oldestReport: assetStats.oldestReport,
                    newestReport: assetStats.newestReport,
                },
                screenshots: {
                    count: assetStats.screenshotsCount,
                },
                storage: {
                    totalSizeMB: Math.round((assetStats.totalSize / (1024 * 1024)) * 100) / 100,
                },
                tests: testStats,
                directories: {
                    testResults: this.testResultsDir,
                    reports: this.reportsDir,
                },
            };
        }
        catch (error) {
            console.warn('Error getting statistics:', error);
            return null;
        }
    }
    /**
     * Verify report integrity
     */
    verifyIntegrity() {
        try {
            return this.assetManager.verifyAssetIntegrity();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Integrity check failed: ${message}`);
            return {
                missingAssets: [],
                brokenLinks: [],
                orphanedScreenshots: [],
            };
        }
    }
    /**
     * Export test results to different formats
     */
    exportResults(format = 'json') {
        try {
            const reportData = this.resultsParser.collectTestResults();
            return this.resultsParser.exportResults(reportData.testResults, format);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Export failed: ${message}`);
        }
    }
    /**
     * Get available templates
     */
    getAvailableTemplates() {
        return this.htmlGenerator.getAvailableTemplates();
    }
    // Getters for accessing components
    getResultsParser() {
        return this.resultsParser;
    }
    getHtmlGenerator() {
        return this.htmlGenerator;
    }
    getAssetManager() {
        return this.assetManager;
    }
}
//# sourceMappingURL=html-reporter.js.map