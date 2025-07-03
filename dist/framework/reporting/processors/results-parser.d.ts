/**
 * Results Parser
 * Handles collection and parsing of test results
 */
export interface ReportSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    totalDuration: number;
    timestamp: string;
}
export interface ParsedTestResult {
    sessionId: string;
    testName: string;
    testId: string;
    status: 'SUCCESS' | 'FAILED';
    duration: number;
    startTime: string;
    endTime?: string;
    finalResult?: string;
    conclusion?: string;
    steps: any[];
    agentHistory: any[];
    screenshots: string[];
    sessionDir: string;
    tokenSummary?: any;
    setupResult?: any;
    dataGenerationResult?: any;
    totalSteps?: number;
    successfulSteps?: number;
}
export interface ReportData {
    summary: ReportSummary;
    testResults: ParsedTestResult[];
    screenshots: Array<{
        filename: string;
        testName: string;
        sessionId: string;
    }>;
}
/**
 * Results Parser
 * Collects and parses test results from directories
 */
export declare class ResultsParser {
    private testResultsDir;
    constructor(testResultsDir: string);
    /**
     * Collect test results from specified directories or default directory
     */
    collectTestResults(resultDirs?: string[]): ReportData;
    /**
     * Get all test result directories
     */
    private getTestResultDirectories;
    /**
     * Parse a single test result from session file
     */
    private parseTestResult;
    /**
     * Extract screenshot paths from test steps
     */
    private extractScreenshotPaths;
    /**
     * Collect screenshots from a session directory
     */
    private collectScreenshots;
    /**
     * Calculate summary statistics from test results
     */
    private calculateSummary;
    /**
     * Get test statistics for analysis
     */
    getTestStatistics(testResults: ParsedTestResult[]): {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        successRate: number;
        avgDuration: number;
        testsByStatus: Record<string, number>;
        recentTests: ParsedTestResult[];
        oldestTest?: string;
        newestTest?: string;
    };
    /**
     * Filter test results by criteria
     */
    filterResults(testResults: ParsedTestResult[], filters: {
        status?: 'SUCCESS' | 'FAILED';
        testName?: string;
        dateRange?: {
            start: string;
            end: string;
        };
        minDuration?: number;
        maxDuration?: number;
    }): ParsedTestResult[];
    /**
     * Export results to different formats
     */
    exportResults(testResults: ParsedTestResult[], format: 'json' | 'csv'): string;
    /**
     * Create report data from test sessions (for testing)
     */
    createReportDataFromSessions(sessions: any[]): ReportData;
    /**
     * Serialize error objects for JSON output
     */
    private serializeError;
}
//# sourceMappingURL=results-parser.d.ts.map