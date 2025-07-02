/**
 * Test Framework with Dependency Injection
 * Modern version using DI container for service management
 */
import type { LangChainTool } from '../ai/types/agent.js';
import type { FrameworkConfig, TaskResult, TestConfig } from '../types/index.js';
import { BrowserManager } from '../automation/browser/browser-manager.js';
import { ConfigManager } from './config-manager.js';
import { DependencyContainer } from './dependency-container.js';
export interface TestFrameworkDIOptions {
    enableLogging?: boolean;
    container?: DependencyContainer;
    customConfig?: Partial<FrameworkConfig>;
}
export interface NaturalLanguageResult {
    result: string;
    error?: string;
    duration: number;
    tokenUsage?: any;
}
/**
 * Test Framework with Dependency Injection
 * Uses DI container to manage service lifecycle and dependencies
 */
export declare class TestFrameworkDI {
    private container;
    private serviceRegistry;
    private agent;
    private isInteractiveMode;
    private initialized;
    private logger?;
    constructor(options?: TestFrameworkDIOptions);
    /**
     * Initialize the framework with dependency injection
     */
    initialize(config?: Partial<FrameworkConfig>): Promise<void>;
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
    getStatus(): Promise<{
        initialized: boolean;
        hasActiveSession: boolean;
        toolCount: number;
        tokenUsage: null;
        currentUrl: null;
    } | {
        initialized: true;
        hasActiveSession: boolean;
        toolCount: number;
        tokenUsage: import("./token-tracker.js").TokenSessionSummary;
        currentUrl: string | null;
    }>;
    /**
     * Get service from container
     */
    getService<T>(serviceName: string): Promise<T>;
    /**
     * Get container statistics
     */
    getContainerStats(): {
        registered: boolean;
        containerStats: {
            totalServices: number;
            singletonInstances: number;
            scopedInstances: number;
            resolutionStackDepth: number;
            servicesByLifetime: {
                singleton: number;
                transient: number;
                scoped: number;
            };
        };
        services: {
            name: string;
            lifetime: import("./dependency-container.js").ServiceLifetime | undefined;
            dependencies: number;
            metadata: Record<string, any> | undefined;
        }[];
    };
    /**
     * @deprecated Use getService(SERVICE_NAMES.BROWSER_MANAGER) instead
     */
    getBrowserManager(): Promise<BrowserManager>;
    /**
     * @deprecated Use getService(SERVICE_NAMES.CONFIG_MANAGER) instead
     */
    getConfigManager(): Promise<ConfigManager>;
    /**
     * @deprecated Use browserManager.getPage() instead
     */
    getPage(): Promise<import("playwright-core").Page>;
    /**
     * @deprecated Use configManager.getConfig() instead
     */
    getConfig(): Promise<FrameworkConfig>;
    /**
     * @deprecated Use toolManager.getTools() instead
     */
    getTools(): Promise<LangChainTool[]>;
    private ensureInitialized;
    private getLogger;
    private setupAgent;
    private executeTest;
    private getOptimizedPageContent;
    private createEnhancedPrompt;
    private invokeAgent;
    private executeWithTimeout;
}
//# sourceMappingURL=test-framework-di.d.ts.map