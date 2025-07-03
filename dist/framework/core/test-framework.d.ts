/**
 * Test Framework - Core Framework Class (TypeScript)
 * Orchestrates browser lifecycle, tool setup, and test session management
 */
import type { LangChainTool } from '../ai/types/agent.js';
import type { FrameworkConfig, NaturalLanguageResult, TaskResult, TestConfig } from '../types/index.js';
import { PageSnapshotManager } from '../managers/content/snapshot-manager.js';
import { TokenTracker } from './token-tracker.js';
import { BrowserManager } from '../automation/browser/browser-manager.js';
import { ConfigManager } from './config-manager.js';
import { DebugManager } from './debug-manager.js';
import { SessionManager } from './session-manager.js';
import { ToolManager } from './tool-manager.js';
/**
 * Test Framework - Core Framework Class
 * Orchestrates browser lifecycle, tool setup, and test session management using dedicated service managers
 */
export declare class TestFramework {
    private configManager;
    private browserManager;
    private sessionManager;
    private toolManager;
    private globalSetupManager;
    private debugManager;
    private agent;
    private resultsManager;
    private isInteractiveMode;
    private tokenTracker;
    private snapshotManager;
    private resourceManager;
    private logger;
    constructor(config?: Partial<FrameworkConfig>);
    /**
     * Initialize the framework
     */
    initialize(): Promise<void>;
    /**
     * Execute global setup if configured
     */
    private executeGlobalSetup;
    /**
     * Run a test with the given configuration
     */
    runTest(testConfig: TestConfig): Promise<TaskResult>;
    /**
     * Execute natural language instruction
     */
    executeNaturalLanguageInstruction(instruction: string): Promise<NaturalLanguageResult>;
    /**
     * Take a screenshot
     */
    takeScreenshot(filename?: string): Promise<string>;
    /**
     * Generate HTML report
     */
    generateReport(title?: string): Promise<string>;
    /**
     * Cleanup framework resources
     */
    cleanup(): Promise<void>;
    /**
     * Get framework status
     */
    getStatus(): {
        initialized: boolean;
        hasActiveSession: boolean;
        toolCount: number;
        tokenUsage: import("./token-tracker.js").TokenSessionSummary;
        currentUrl: string | null;
    };
    getConfigManager(): ConfigManager;
    getBrowserManager(): BrowserManager;
    getSessionManager(): SessionManager;
    getToolManager(): ToolManager;
    getTokenTracker(): TokenTracker;
    getSnapshotManager(): PageSnapshotManager;
    getDebugManager(): DebugManager;
    /**
     * @deprecated Use browserManager.getPage() instead
     */
    getPage(): import("playwright-core").Page;
    /**
     * @deprecated Use configManager.getConfig() instead
     */
    getConfig(): FrameworkConfig;
    /**
     * @deprecated Use toolManager.getTools() instead
     */
    getTools(): LangChainTool[];
    private setupAgent;
    /**
     * Execute test-level setup function
     */
    private executeTestSetup;
    /**
     * Execute test-level data generation function
     */
    private executeDataGeneration;
    private executeTest;
    private getOptimizedPageContent;
    private createEnhancedPrompt;
    private invokeAgent;
    private executeWithTimeout;
}
export { TestFramework as EnhancedBrowserTestFramework };
//# sourceMappingURL=test-framework.d.ts.map