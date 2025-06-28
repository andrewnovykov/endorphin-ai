/**
 * Unified HTML Reporter Module
 * Complete solution for generating interactive HTML test reports
 */
interface ReportOptions {
    filename?: string;
    resultDirs?: string[];
}
/**
 * HTML Reporter for Endorphin AI test results
 * Generates interactive HTML reports from test-results data
 */
export declare class HtmlReporter {
    private testResultsDir;
    private reportsDir;
    private templatesDir;
    constructor(testResultsDir?: string);
    /**
     * Generate HTML report from all test results
     * @param options - Report generation options
     * @returns Path to generated report
     */
    generateReport(options?: ReportOptions): Promise<string>;
    /**
     * Open the latest report in the default browser
     * @param reportPath - Optional specific report path to open
     * @returns Promise<void>
     */
    openReport(reportPath?: string | null): Promise<void>;
    /**
     * Collect and parse test results from the results directory
     * @param resultDirs - Optional specific result directories to include
     * @returns Aggregated report data
     */
    private collectTestResults;
    /**
     * Get all test result directories
     * @returns Array of directory names
     */
    private getTestResultDirectories;
    /**
     * Parse a single test result directory
     * @param resultPath - Path to the test result directory
     * @returns Parsed test result or null
     */
    private parseTestResult;
    /**
     * Generate HTML report from report data
     * @param reportData - Aggregated report data
     * @param filename - Output filename
     * @returns Path to generated report
     */
    private generateHtmlReport;
    /**
     * Process the HTML template with report data
     */
    private processTemplate;
    /**
     * Generate HTML for test results section
     */
    private generateTestResultsHtml;
    /**
     * Generate test statistics table HTML
     */
    private generateTestStatsTable;
    /**
     * Generate recent results table HTML
     */
    private generateRecentResultsTable;
    /**
     * Copy static assets (CSS, JS) to output directory
     */
    private copyStaticAssets;
    /**
     * Copy screenshots for test results
     */
    private copyScreenshots;
    /**
     * Format duration in milliseconds to human-readable string
     */
    private formatDuration;
    /**
     * Escape HTML characters to prevent XSS
     */
    private escapeHtml;
    /**
     * Clean up old test results
     * @param keepPerTest - Number of results to keep per test (default: 10)
     * @returns Cleanup summary
     */
    cleanupResults(keepPerTest?: number): Promise<{
        removedCount: number;
        removedDirs: string[];
        totalTestIds: number;
        keptPerTest: number;
    }>;
    /**
     * Clean up old report files
     * @param maxAge - Maximum age in days (default: 30)
     * @returns Cleanup summary
     */
    cleanupOldReports(maxAge?: number): {
        removedCount: number;
        removedFiles: string[];
    };
}
export {};
//# sourceMappingURL=html-reporter.d.ts.map