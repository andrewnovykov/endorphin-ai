/**
 * Test Results Manager Module
 * Handles test result collection, storage, and processing
 */
import type { TestReport, TestSession } from '../types/index.js';
export interface TestResultsManagerOptions {
    resultsDir?: string;
    recorderDir?: string;
    enableRecorderCopy?: boolean;
}
/**
 * Manages test results storage, processing, and report generation
 */
export declare class TestResultsManager {
    private testResults;
    private resultsDir;
    private recorderDir;
    private enableRecorderCopy;
    constructor(options?: TestResultsManagerOptions);
    /**
     * Initialize the results manager by ensuring directories exist
     */
    initialize(): Promise<void>;
    /**
     * Add a test result to the collection
     */
    addTestResult(result: any): void;
    /**
     * Get all test results
     */
    getTestResults(): any[];
    /**
     * Clear all test results
     */
    clearTestResults(): void;
    /**
     * Process a completed test session
     */
    processCompletedSession(session: TestSession): Promise<any>;
    /**
     * Generate a test report from collected results
     */
    generateReport(): TestReport;
    /**
     * Generate and save a report to file
     */
    saveReport(filename?: string): Promise<string>;
    /**
     * Ensure required directories exist
     */
    private ensureDirectoriesExist;
}
//# sourceMappingURL=test-results-manager.d.ts.map