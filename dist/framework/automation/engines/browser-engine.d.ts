/**
 * Browser Test Engine
 * Core engine for browser-based test execution
 */
import { BrowserManager } from '../browser/browser-manager.js';
import { PageSnapshotManager } from '../../managers/content/snapshot-manager.js';
import type { FrameworkConfig, TaskResult, TestConfig, TestSession } from '../../types/index.js';
/**
 * Browser Test Engine Configuration
 */
export interface BrowserEngineConfig {
    framework: FrameworkConfig;
    resultBaseDir: string;
    recorderBaseDir: string;
    isInteractiveMode?: boolean;
    frameworkInstance?: any;
}
/**
 * Browser Test Engine
 * Handles core browser test execution logic
 */
export declare class BrowserEngine {
    private browserManager;
    private agent;
    private toolsArray;
    private currentTestSession;
    private config;
    private resultBaseDir;
    private recorderBaseDir;
    private isInteractiveMode;
    private tokenTracker;
    private snapshotManager;
    private resourceManager;
    private frameworkInstance;
    private globalSetupManager;
    private globalSetupExecuted;
    private validationAgent;
    constructor(config: BrowserEngineConfig);
    /**
     * Initialize the browser engine
     */
    initialize(): Promise<void>;
    /**
     * Setup browser automation tools
     */
    private setupTools;
    /**
     * Setup AI agent
     */
    private setupAgent;
    /**
     * Create a new test session
     */
    createTestSession(testName: string, testId?: string | null): Promise<TestSession>;
    /**
     * Log a test step
     */
    logTestStep(stepDescription: string, toolName?: string | null, toolArgs?: any, result?: string | null, isSuccess?: boolean): void;
    /**
     * Take a screenshot for current test step
     */
    takeStepScreenshot(description?: string | null): Promise<string | null>;
    /**
     * Invoke AI agent with token tracking and resource management
     */
    private invokeAgentWithTracking;
    /**
     * Run a single task
     */
    runTask(taskDescription: string, testName?: string | null): Promise<TaskResult>;
    /**
     * Run a single test
     */
    runSingleTest(test: TestConfig): Promise<{
        success: boolean;
        session?: any;
        error?: string;
    }>;
    /**
     * Finish current test session
     */
    finishTestSession(status?: 'SUCCESS' | 'FAILED', finalResult?: string | null): Promise<any>;
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
     * Cleanup engine resources
     */
    cleanup(): Promise<void>;
    get currentPage(): import("playwright-core").Page | null;
    get currentBrowser(): import("playwright-core").Browser | null;
    get currentContext(): import("playwright-core").BrowserContext | null;
    get activeTestSession(): TestSession | null;
    get frameworkConfig(): FrameworkConfig;
    getBrowserManager(): BrowserManager;
    getSnapshotManager(): PageSnapshotManager;
    /**
     * Analyze test result with validation agent
     */
    private analyzeTestResultWithValidation;
    /**
     * Analyze the final agent state to determine test result and extract conclusion
     */
    private analyzeTestResult;
    /**
     * Execute global setup if configured and not already executed
     */
    private executeGlobalSetupIfNeeded;
}
//# sourceMappingURL=browser-engine.d.ts.map