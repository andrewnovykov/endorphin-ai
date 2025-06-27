/**
 * Test Results Parser
 * Parses test result data from the test-results directory
 * Handles aggregation and processing of test execution data for reporting
 */
import type { TestSession, TestSummary } from '@/types/index';
/**
 * Parsed test result data structure
 */
export interface ParsedTestResult {
    resultDir: string;
    resultPath: string;
    summary: TestSummary;
    session: TestSession;
    screenshots: string[];
    screenshotsPath: string;
}
/**
 * Test statistics for reporting
 */
export interface TestStats {
    testId: string;
    testName: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun: string | null;
    averageDuration: number;
    totalDuration: number;
}
/**
 * Aggregated report data
 */
export interface ReportData {
    generatedAt: string;
    totalTests: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
    testStats: TestStats[];
    results: ParsedTestResult[];
    hasMoreResults: boolean;
}
/**
 * Cleanup summary
 */
export interface CleanupSummary {
    removedCount: number;
    removedDirs: string[];
    totalTestIds: number;
    keptPerTest: number;
}
/**
 * TestResultsParser - Parses test result data from the test-results directory
 * Handles aggregation and processing of test execution data for reporting
 */
export declare class TestResultsParser {
    private testResultsDir;
    /**
     * Create a new TestResultsParser instance
     * @param testResultsDir - Path to the test-results directory
     */
    constructor(testResultsDir: string);
    /**
     * Get all test result directories sorted by timestamp (newest first)
     * @returns Array of directory names
     */
    getAllTestResults(): string[];
    /**
     * Get test results filtered by test ID
     * @param testId - The test ID to filter by
     * @returns Array of directory names for the specific test
     */
    getTestResultsByTestId(testId: string): string[];
    /**
     * Parse a single test result directory
     * @param resultDir - Directory name of the test result
     * @returns Parsed test result data or null if parsing fails
     */
    parseTestResult(resultDir: string): ParsedTestResult | null;
    /**
     * Generate aggregated report data for multiple test results
     * @param resultDirs - Array of result directory names to include
     * @returns Aggregated report data
     */
    generateReportData(resultDirs?: string[] | null): ReportData;
    /**
     * Get the most recent test result for a specific test ID
     * @param testId - The test ID to get the latest result for
     * @returns Latest test result or null if not found
     */
    getLatestTestResult(testId: string): ParsedTestResult | null;
    /**
     * Clean up old test results, keeping only the specified number of recent results per test
     * @param keepPerTest - Number of recent results to keep per test (default: 10)
     * @returns Cleanup summary with counts of removed directories
     */
    cleanupOldResults(keepPerTest?: number): CleanupSummary;
}
//# sourceMappingURL=test-results-parser.d.ts.map