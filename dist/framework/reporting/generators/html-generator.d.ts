/**
 * HTML Report Generator
 * Handles HTML template processing and report generation
 */
import type { ParsedTestResult, ReportData } from '../processors/results-parser.js';
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
export declare class HtmlGenerator {
    private reportsDir;
    private templatesDir;
    constructor(reportsDir: string);
    /**
     * Generate HTML report from report data
     */
    generateReport(reportData: ReportData, options?: ReportOptions): Promise<string>;
    /**
     * Process the HTML template with report data
     */
    private processTemplate;
    /**
     * Generate test statistics table HTML
     */
    private generateTestStatsTable;
    /**
     * Generate recent results table HTML
     */
    private generateRecentResultsTable;
    /**
     * Generate test results HTML for detailed view
     */
    generateTestResultsHtml(testResults: ParsedTestResult[]): string;
    /**
     * Format test data for JavaScript template consumption
     */
    private formatTestDataForTemplate;
    /**
     * Copy static assets (CSS, JS) to reports directory
     */
    private copyStaticAssets;
    /**
     * Copy screenshots from test results to reports directory
     */
    private copyScreenshots;
    /**
     * Format duration in milliseconds to human readable format
     */
    private formatDuration;
    /**
     * Escape HTML special characters
     */
    private escapeHtml;
    /**
     * Generate custom report with specific template
     */
    generateCustomReport(reportData: ReportData, templateContent: string, filename: string): string;
    /**
     * Get available templates
     */
    getAvailableTemplates(): string[];
}
//# sourceMappingURL=html-generator.d.ts.map