/**
 * Configuration Manager
 * Handles framework configuration merging, validation, and access
 */
import type { BrowserConfig, ExecutionConfig, FrameworkConfig } from '../types/index.js';
export declare class ConfigManager {
    private config;
    constructor(userConfig?: Partial<FrameworkConfig>);
    /**
     * Get the current configuration
     */
    getConfig(): FrameworkConfig;
    /**
     * Get browser configuration
     */
    getBrowserConfig(): BrowserConfig;
    /**
     * Get execution configuration
     */
    getExecutionConfig(): ExecutionConfig;
    /**
     * Get AI configuration
     */
    getAIConfig(): {
        openai: {
            apiKey: string;
            modelName: string;
            temperature: number;
            maxTokens: number;
        };
        agent: {
            recursionLimit: number;
            stopPhrases: string[];
        };
    };
    /**
     * Get directories configuration
     */
    getDirectories(): {
        tests: string;
        data: string;
        results: string;
    };
    /**
     * Update configuration at runtime
     */
    updateConfig(updates: Partial<FrameworkConfig>): void;
    /**
     * Merge user configuration with defaults
     */
    private mergeWithDefaults;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Get browser type
     */
    getBrowserType(): "chromium" | "firefox" | "webkit";
    /**
     * Get browser launch options
     */
    getBrowserLaunchOptions(): {
        headless: boolean;
        slowMo: number | undefined;
        devtools: boolean | undefined;
        args: string[];
    };
    /**
     * Get browser context options
     */
    getBrowserContextOptions(): {
        viewport: import("../index.js").ViewportSize;
        recordVideo: {
            dir: string;
            size: import("../index.js").ViewportSize;
        } | undefined;
        recordHar: {
            path: string;
        } | undefined;
    };
    /**
     * Check if configuration is valid
     */
    isValid(): boolean;
}
//# sourceMappingURL=config-manager.d.ts.map