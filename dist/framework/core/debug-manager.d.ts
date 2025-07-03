/**
 * Debug Manager
 * Manages global debug object for VS Code debugging integration
 */
import type { LangChainTool } from '../ai/types/agent.js';
import type { FrameworkConfig, TestSession } from '../types/index.js';
import type { TestFramework } from './test-framework.js';
/**
 * Tool information for debugging
 */
export interface ToolInfo {
    name: string;
    description: string;
    type: 'framework' | 'custom';
    schema: any;
    isLoaded: boolean;
    error?: string;
}
/**
 * Debug utilities for easier debugging
 */
export interface DebugUtils {
    getSessionData: () => any;
    getSetupResult: () => any;
    getDataGenerationResult: () => any;
    inspectTools: () => ToolInfo[];
    clearSession: () => void;
    getFrameworkStatus: () => any;
    getCurrentUrl: () => string | null;
    takeScreenshot: () => Promise<string>;
    getToolStats: () => any;
    getToolByName: (name: string) => any;
}
/**
 * Main debug object interface
 */
export interface EndorphinDebugObject {
    framework: TestFramework;
    session: TestSession | null;
    config: FrameworkConfig;
    tools: LangChainTool[];
    utils: DebugUtils;
    version: string;
    isDebugMode: boolean;
}
declare global {
    var endorphinDebug: EndorphinDebugObject | undefined;
}
/**
 * Debug Manager class
 */
export declare class DebugManager {
    private framework;
    private logger;
    private isInitialized;
    constructor(framework: TestFramework);
    /**
     * Initialize debug mode if ENDORPHIN_DEBUG is set
     */
    initialize(): void;
    /**
     * Update the current session in debug object
     */
    updateSession(session: TestSession | null): void;
    /**
     * Update tools in debug object
     */
    updateTools(frameworkTools: LangChainTool[], _customTools?: LangChainTool[]): void;
    /**
     * Check if debug mode is active
     */
    isDebugMode(): boolean;
    /**
     * Create debug utilities
     */
    private createDebugUtils;
    /**
     * Get framework version
     */
    private getFrameworkVersion;
    /**
     * Log available debug features
     */
    private logDebugFeatures;
}
/**
 * Create and initialize debug manager for a framework instance
 */
export declare function createDebugManager(framework: TestFramework): DebugManager;
//# sourceMappingURL=debug-manager.d.ts.map