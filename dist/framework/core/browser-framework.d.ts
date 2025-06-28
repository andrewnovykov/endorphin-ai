/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Handles browser lifecycle, tool setup, and test session management
 */
import { Browser, BrowserContext, Page } from 'playwright';
import type { FrameworkConfig, NaturalLanguageResult, TaskResult, TestConfig, TestReport, TestSession } from '../types/index.js';
/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Handles browser lifecycle, tool setup, and test session management
 */
export declare class EnhancedBrowserTestFramework {
    private browser;
    private context;
    private page;
    private tools;
    private agent;
    private toolsArray;
    private resultsManager;
    private currentTestSession;
    private resultBaseDir;
    private recorderBaseDir;
    private isInteractiveMode;
    private config;
    constructor(config?: Partial<FrameworkConfig>);
    private getBrowserType;
    initialize(): Promise<void>;
    private setupTools;
    private setupAgent;
    private cleanupDirectories;
    private cleanupRecorderDirectory;
    createTestSession(testName: string, testId?: string | null): TestSession;
    logTestStep(stepDescription: string, toolName?: string | null, toolArgs?: any, result?: string | null, isSuccess?: boolean): void;
    takeStepScreenshot(description?: string | null): Promise<string | null>;
    finishTestSession(status?: 'SUCCESS' | 'FAILED', finalResult?: string | null): any;
    cleanup(): Promise<void>;
    runTask(taskDescription: string, testName?: string | null): Promise<TaskResult>;
    runMultipleTasks(tasks: Array<{
        name?: string;
        description: string;
    }>): Promise<TaskResult[]>;
    runSingleTest(test: TestConfig): Promise<{
        success: boolean;
        session?: any;
        error?: string;
    }>;
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
    enableInteractiveMode(): void;
    disableInteractiveMode(): void;
    get currentPage(): Page | null;
    get currentBrowser(): Browser | null;
    get currentContext(): BrowserContext | null;
    get activeTestSession(): TestSession | null;
    executeNaturalLanguageCommand(command: string): Promise<NaturalLanguageResult>;
    private extractSelectorFromCommand;
    private extractFillFromCommand;
    private extractUrlFromCommand;
    private extractTimeFromCommand;
    /**
     * Set interactive mode for the framework
     * @param interactive - Whether to enable interactive mode
     */
    setInteractiveMode(interactive: boolean): void;
}
//# sourceMappingURL=browser-framework.d.ts.map