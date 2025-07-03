/**
 * Test Discoverer
 * Discovers and loads tests from user's tests/ directory
 */
import type { DiscoveredTest, DiscoveryConfig, TestDiscoveryResult } from './discovery-types.js';
/**
 * Test Discovery class for finding and loading test files
 */
export declare class TestDiscoverer {
    private tests;
    private config;
    testsDirectory: string;
    constructor(config?: DiscoveryConfig);
    /**
     * Discover and load all test files from configured tests directory
     */
    discoverTests(): Promise<TestDiscoveryResult>;
    /**
     * Load test files concurrently with limited concurrency
     */
    private loadTestFilesConcurrently;
    /**
     * Load test files from multiple directories concurrently with limited concurrency
     */
    private loadTestFilesConcurrentlyFromMultipleDirs;
    /**
     * Load a specific test file and return result
     */
    private loadTestFileWithResult;
    /**
     * Load a specific test file from a specific directory and return result
     */
    private loadTestFileWithResultFromDir;
    /**
     * Load a specific test file and extract test objects
     */
    loadTestFile(filename: string): Promise<DiscoveredTest[]>;
    /**
     * Load a specific test file from a specific directory and extract test objects
     */
    loadTestFileFromDir(filename: string, directory: string): Promise<DiscoveredTest[]>;
    /**
     * Load JavaScript file using dynamic import
     */
    private loadJavaScriptFile;
    /**
     * Load TypeScript file using tsx or dynamic compilation
     */
    private loadTypeScriptFile;
    /**
     * Extract test objects from loaded module
     */
    private extractTestsFromModule;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Check if a file is a test file based on patterns
     */
    private isTestFile;
    /**
     * Simple pattern matching (supports * wildcard)
     */
    private matchesPattern;
    /**
     * Validate if an object is a valid test
     */
    private isValidTest;
    /**
     * Get test by ID
     */
    getTest(id: string): DiscoveredTest | undefined;
    /**
     * Get all tests
     */
    getAllTests(): DiscoveredTest[];
    /**
     * Get tests by tag
     */
    getTestsByTag(tag: string): DiscoveredTest[];
    /**
     * Get tests by priority
     */
    getTestsByPriority(priority: string): DiscoveredTest[];
    /**
     * Get non-quarantined tests
     */
    getNonQuarantinedTests(): DiscoveredTest[];
    /**
     * Get quarantined tests
     */
    getQuarantinedTests(): DiscoveredTest[];
    /**
     * Filter tests based on criteria
     */
    filterTests(criteria: {
        tags?: string[];
        priority?: string[];
        excludeTags?: string[];
        pattern?: string;
        includeQuarantined?: boolean;
    }): DiscoveredTest[];
    /**
     * List all available tests
     */
    listTests(): void;
    /**
     * Clear all discovered tests
     */
    clear(): void;
    /**
     * Get discovery statistics
     */
    getStatistics(): {
        totalTests: number;
        quarantinedTests: number;
        activeTests: number;
        priorities: Record<string, number>;
        tags: Record<string, number>;
        testsDirectory: string;
    };
}
//# sourceMappingURL=test-discoverer.d.ts.map