/**
 * Configuration loader for Endorphin AI
 * Handles loading and merging of configuration from multiple sources
 */
import type { CLIFlags, FrameworkConfig } from '@/types/index';
export declare class ConfigLoader {
    private defaultConfig;
    constructor();
    /**
     * Get the default configuration
     */
    getDefaultConfig(): FrameworkConfig;
    /**
     * Load user configuration from file
     */
    loadUserConfig(configPath?: string): Promise<Partial<FrameworkConfig>>;
    /**
     * Load configuration from environment variables
     */
    loadEnvConfig(): Partial<FrameworkConfig>;
    /**
     * Merge configurations with priority: CLI > User Config > Environment > Default
     */
    mergeConfigs(defaultConfig: FrameworkConfig, envConfig: Partial<FrameworkConfig>, userConfig: Partial<FrameworkConfig>, cliFlags?: CLIFlags): FrameworkConfig;
    /**
     * Validate configuration
     */
    validateConfig(config: FrameworkConfig, validateAI?: boolean): void;
    /**
     * Get configuration value by path (e.g., 'browser.headless')
     */
    getConfigValue(config: FrameworkConfig, path: string): any;
    /**
     * Set configuration value by path
     */
    setConfigValue(config: FrameworkConfig, path: string, value: any): void;
}
/**
 * Get configuration with optional overrides
 */
export declare function getConfig(options?: {
    cwd?: string;
    configPath?: string;
    cliFlags?: CLIFlags;
    validateAI?: boolean;
}): Promise<FrameworkConfig>;
/**
 * Get cached global configuration
 */
export declare function getGlobalConfig(): FrameworkConfig | null;
/**
 * Reset global configuration (useful for testing)
 */
export declare function resetGlobalConfig(): void;
//# sourceMappingURL=config-loader.d.ts.map