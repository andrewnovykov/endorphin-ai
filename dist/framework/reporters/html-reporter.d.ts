/**
 * HTML Reporter
 * Main HTML reporter class using modular components
 */
import { HtmlGenerator, type ReportOptions } from '../reporting/generators/html-generator.js';
import { AssetManager } from '../reporting/processors/asset-manager.js';
import { ResultsParser } from '../reporting/processors/results-parser.js';
import type { TestSession } from '../types/index.js';
export interface HtmlReporterOptions {
    testResultsDir?: string;
    maxReportAge?: number;
    maxReportsPerTest?: number;
}
/**
 * HTML Reporter for Endorphin AI test results
 * Generates interactive HTML reports from test-results data
 */
export declare class HtmlReporter {
    private resultsParser;
    private htmlGenerator;
    private assetManager;
    private testResultsDir;
    private reportsDir;
    constructor(testResultsDir?: string, options?: HtmlReporterOptions);
    /**
     * Generate HTML report from test sessions (for testing)
     */
    generateReport(sessions: TestSession[]): Promise<string>;
    /**
     * Generate HTML report from all test results
     */
    generateReport(options?: ReportOptions): Promise<string>;
    /**
     * Open the most recent report in browser
     */
    openReport(reportPath?: string | null): Promise<void>;
    /**
     * Get the latest report file
     */
    private getLatestReport;
    /**
     * Generate custom report with specific options
     */
    generateCustomReport(options?: ReportOptions & {
        template?: string;
        filters?: {
            status?: 'SUCCESS' | 'FAILED';
            testName?: string;
            dateRange?: {
                start: string;
                end: string;
            };
        };
    }): Promise<string>;
    /**
     * Calculate summary for filtered results
     */
    private calculateFilteredSummary;
    /**
     * Clean up old results keeping specified number per test
     */
    cleanupResults(keepPerTest?: number): Promise<{
        deletedSessions: number;
        deletedReports: number;
        freedSpaceMB: number;
    }>;
    /**
     * Clean up old reports by age
     */
    cleanupOldReports(maxAge?: number): {
        deleted: number;
        freedSpaceMB: number;
    };
    /**
     * Get report statistics
     */
    getStatistics(): {
        reports: {
            count: number;
            oldestReport: Date | undefined;
            newestReport: Date | undefined;
        };
        screenshots: {
            count: number;
        };
        storage: {
            totalSizeMB: number;
        };
        tests: {
            totalTests: number;
            passedTests: number;
            failedTests: number;
            successRate: number;
            avgDuration: number;
            testsByStatus: Record<string, number>;
            recentTests: import("./html-reporter.js").ParsedTestResult[];
            oldestTest?: string;
            newestTest?: string;
        };
        directories: {
            testResults: string;
            reports: string;
        };
    } | null;
    /**
     * Verify report integrity
     */
    verifyIntegrity(): {
        missingAssets: string[];
        brokenLinks: string[];
        orphanedScreenshots: string[];
    };
    /**
     * Export test results to different formats
     */
    exportResults(format?: 'json' | 'csv'): string;
    /**
     * Get available templates
     */
    getAvailableTemplates(): string[];
    getResultsParser(): ResultsParser;
    getHtmlGenerator(): HtmlGenerator;
    getAssetManager(): AssetManager;
}
export type { ReportOptions } from '../reporting/generators/html-generator.js';
export type { ParsedTestResult, ReportData, ReportSummary, } from '../reporting/processors/results-parser.js';
//# sourceMappingURL=html-reporter.d.ts.map