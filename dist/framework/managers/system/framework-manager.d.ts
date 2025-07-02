/**
 * Framework Manager
 * Manages framework configuration, initialization, and high-level operations
 */
import { BrowserEngine } from '../../automation/engines/browser-engine.js';
import { TestResultsManager } from '../../results/test-results-manager.js';
import type { FrameworkConfig, TaskResult, TestConfig, TestReport } from '../../types/index.js';
/**
 * Framework Manager
 * High-level framework operations and configuration management
 */
export declare class FrameworkManager {
    private config;
    private resultsManager;
    private resultBaseDir;
    private recorderBaseDir;
    private isInteractiveMode;
    constructor(config?: Partial<FrameworkConfig>);
    /**
     * Create a browser engine instance
     */
    createBrowserEngine(frameworkInstance?: any): BrowserEngine;
    /**
     * Run a single task
     */
    runTask(taskDescription: string, testName?: string | null): Promise<TaskResult>;
    /**
     * Run multiple tasks sequentially
     */
    runMultipleTasks(tasks: Array<{
        name?: string;
        description: string;
    }>): Promise<TaskResult[]>;
    /**
     * Run a single test
     */
    runSingleTest(test: TestConfig): Promise<{
        success: boolean;
        session?: any;
        error?: string;
    }>;
    /**
     * Run multiple tests
     */
    runMultipleTests(tests: TestConfig[]): Promise<{
        results: Array<{
            testId: string;
            testName: string;
            success: boolean;
            error?: string;
            session?: any;
        }>;
        report: TestReport;
    }>;
    /**
     * Generate test report from results
     */
    generateTestReport(results: Array<{
        testId: string;
        testName: string;
        success: boolean;
        error?: string;
        session?: any;
    }>): Promise<{
        results: Array<{
            testId: string;
            testName: string;
            success: boolean;
            error?: string;
            session?: any;
        }>;
        report: TestReport;
    }>;
    /**
     * Enable interactive mode
     */
    enableInteractiveMode(): void;
    /**
     * Disable interactive mode
     */
    disableInteractiveMode(): void;
    /**
     * Set interactive mode
     */
    setInteractiveMode(interactive: boolean): void;
    /**
     * Get framework configuration
     */
    getConfig(): FrameworkConfig;
    /**
     * Update framework configuration
     */
    updateConfig(updates: Partial<FrameworkConfig>): void;
    /**
     * Get results manager
     */
    getResultsManager(): TestResultsManager;
    /**
     * Get result directories
     */
    getDirectories(): {
        results: string;
        recorder: string;
    };
    /**
     * Validate configuration
     */
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get framework statistics
     */
    getStatistics(): {
        config: {
            browser: string;
            model: string;
            environment: string;
        };
        directories: {
            results: string;
            recorder: string;
        };
        features: {
            interactiveMode: boolean;
            parallelExecution: boolean;
        };
    };
}
//# sourceMappingURL=framework-manager.d.ts.map