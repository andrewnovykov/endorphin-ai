/**
 * Test Manager - Handles test discovery, loading, and execution coordination (TypeScript)
 * Manages individual test files in the tests/ folder
 */
import type { TaskResult, TestConfig } from '../types/index.js';
interface LoadedTest extends TestConfig {
    filename: string;
    filePath: string;
}
interface TestCriteria {
    tag?: string;
    priority?: 'High' | 'Medium' | 'Low';
    idPattern?: RegExp;
    nameSearch?: string;
}
interface TestSummary {
    total: number;
    byPriority: Record<string, number>;
    byTag: Record<string, number>;
    files: number;
}
interface NewTestData {
    name: string;
    description: string;
    priority?: 'High' | 'Medium' | 'Low';
    tags?: string[];
    site?: string;
    testData?: Record<string, any>;
    prerequisites?: string[];
    task: string;
}
export declare class TestManager {
    private framework;
    private testsDir;
    private testFiles;
    private loadedTests;
    constructor();
    loadTests(): Promise<Map<string, LoadedTest>>;
    /**
     * Load all test files from the tests directory
     */
    private loadAllTests;
    /**
     * Load an individual test file
     */
    private loadTestFile;
    /**
     * List all available tests
     */
    listAllTests(): void;
    /**
     * Find tests by various criteria
     */
    findTests(criteria?: TestCriteria): LoadedTest[];
    /**
     * Run a single test by ID
     */
    runTestById(testId: string): Promise<TaskResult | null>;
    /**
     * Run multiple tests by their IDs
     */
    runTests(testIds: string[]): Promise<TaskResult[]>;
    /**
     * Run tests by tag
     */
    runTestsByTag(tag: string): Promise<TaskResult[]>;
    /**
     * Run tests by priority
     */
    runTestsByPriority(priority: 'High' | 'Medium' | 'Low'): Promise<TaskResult[]>;
    /**
     * Run smoke tests
     */
    runSmokeTests(): Promise<TaskResult[]>;
    /**
     * Run authentication tests
     */
    runAuthTests(): Promise<TaskResult[]>;
    /**
     * Run all tests
     */
    runAllTests(): Promise<TaskResult[]>;
    /**
     * Generate test summary statistics
     */
    getTestSummary(): TestSummary;
    /**
     * Create a new test file
     */
    createNewTest(testData: NewTestData): Promise<string>;
    getTestById(testId: string): LoadedTest | undefined;
    getTestsByTag(tag: string): LoadedTest[];
    getTestsByPriority(priority: 'High' | 'Medium' | 'Low'): LoadedTest[];
    getAllTests(): LoadedTest[];
    listTests(): void;
    /**
     * Set the framework instance for test execution
     */
    setFramework(framework: any): void;
    close(): Promise<void>;
    generateReport(): null;
}
export {};
//# sourceMappingURL=test-manager.d.ts.map