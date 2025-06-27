/**
 * Test Discovery Module
 * Discovers and loads tests from user's tests/ directory
 */
import type { DiscoveryResult, FrameworkConfig, TestConfig } from '../types/index.js';
/**
 * Extended test object with discovery metadata
 */
interface DiscoveredTest extends TestConfig {
    sourceFile: string;
    exportName: string;
}
/**
 * Test Discovery class for finding and loading test files
 */
export declare class TestDiscovery {
    private tests;
    testsDirectory: string;
    constructor();
    /**
     * Discover and load all test files from tests/ directory
     */
    discoverTests(): Promise<void>;
    /**
     * Load a specific test file and extract test objects
     */
    loadTestFile(filename: string): Promise<void>;
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
     * List all available tests
     */
    listTests(): void;
}
export declare function runSingleTestById(testId: string, config?: FrameworkConfig | null): Promise<DiscoveryResult>;
export declare function runTestsByTag(tag: string, config?: FrameworkConfig | null): Promise<DiscoveryResult>;
export declare function runTestsByPriority(priority: string, config?: FrameworkConfig | null): Promise<DiscoveryResult>;
export declare function runAllTests(config?: FrameworkConfig | null): Promise<DiscoveryResult>;
export declare function listAllTests(config?: FrameworkConfig | null): Promise<DiscoveryResult>;
/**
 * Discover tests and return them as an array
 * @param config - Configuration object
 * @returns Array of discovered tests
 */
export declare function discoverTests(config: FrameworkConfig): Promise<TestConfig[]>;
export {};
//# sourceMappingURL=test-discovery.d.ts.map