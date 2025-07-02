/**
 * Test Runner
 * Handles execution of discovered tests with parallel support
 */
import type { DiscoveryResult, FrameworkConfig } from '../../types/index.js';
import type { DiscoveredTest, TestExecutionOptions } from '../discovery/discovery-types.js';
/**
 * Test Runner class for executing tests
 */
export declare class TestRunner {
    private config;
    private reporter;
    constructor(config?: FrameworkConfig | null);
    /**
     * Run a single test by ID
     */
    runSingleTest(test: DiscoveredTest): Promise<{
        success: boolean;
        error?: string;
        session?: any;
    }>;
    /**
     * Run multiple tests sequentially
     */
    runTestsSequentially(tests: DiscoveredTest[]): Promise<DiscoveryResult>;
    /**
     * Run tests in parallel with worker threads
     */
    runTestsInParallel(tests: DiscoveredTest[], workers?: number): Promise<DiscoveryResult>;
    /**
     * Run tests with specified options
     */
    runTests(tests: DiscoveredTest[], options?: TestExecutionOptions): Promise<DiscoveryResult>;
    /**
     * Run tests by specific criteria
     */
    runTestsByCriteria(allTests: DiscoveredTest[], criteria: {
        tags?: string[];
        priority?: string[];
        testIds?: string[];
        excludeTags?: string[];
        pattern?: string;
    }, options?: TestExecutionOptions): Promise<DiscoveryResult>;
    /**
     * Get test execution statistics
     */
    getExecutionStatistics(results: Array<{
        test: DiscoveredTest;
        success: boolean;
        duration: number;
        error?: string;
    }>): {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        totalDuration: number;
        averageDuration: number;
        successRate: number;
        failuresByTag: Record<string, number>;
        failuresByPriority: Record<string, number>;
    };
}
//# sourceMappingURL=test-runner.d.ts.map