/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Re-export and backward compatibility layer
 */
import { BrowserEngine } from '../engines/browser-engine.js';
import { FrameworkManager } from '../../managers/system/framework-manager.js';
import type { FrameworkConfig, TaskResult, TestConfig, TestReport, TestSession } from '../../types/index.js';
/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Provides backward compatibility while using the new modular architecture
 */
export declare class EnhancedBrowserTestFramework {
    private frameworkManager;
    private browserEngine;
    constructor(config?: Partial<FrameworkConfig>);
    /**
     * Initialize framework
     */
    initialize(): Promise<void>;
    /**
     * Run a single task
     */
    runTask(taskDescription: string, testName?: string | null): Promise<TaskResult>;
    /**
     * Run multiple tasks
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
     * Enable interactive mode
     */
    enableInteractiveMode(): Promise<void>;
    /**
     * Disable interactive mode
     */
    disableInteractiveMode(): void;
    /**
     * Set interactive mode
     */
    setInteractiveMode(interactive: boolean): void;
    /**
     * Cleanup framework resources
     */
    cleanup(): Promise<void>;
    get currentPage(): import("playwright-core").Page | null;
    get currentBrowser(): import("playwright-core").Browser | null;
    get currentContext(): import("playwright-core").BrowserContext | null;
    get activeTestSession(): TestSession | null;
    get frameworkConfig(): FrameworkConfig;
    getBrowserManager(): import("./browser-manager.js").BrowserManager | null;
    getSnapshotManager(): import("../../index.js").PageSnapshotManager | null;
    getFrameworkManager(): FrameworkManager;
    getBrowserEngine(): BrowserEngine | null;
    getConfig(): FrameworkConfig;
    updateConfig(updates: Partial<FrameworkConfig>): void;
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
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
    getDirectories(): {
        results: string;
        recorder: string;
    };
    logTestStep(stepDescription: string, toolName?: string | null, toolArgs?: any, result?: string | null, isSuccess?: boolean): void;
    takeStepScreenshot(description?: string | null): Promise<string | null>;
    createTestSession(testName: string, testId?: string | null): Promise<TestSession | null>;
}
export { BrowserEngine } from '../engines/browser-engine.js';
export { FrameworkManager } from '../../managers/system/framework-manager.js';
//# sourceMappingURL=browser-framework.d.ts.map