/**
 * Global Setup Manager
 * Handles loading and executing global setup files
 */
import type { GlobalSetupResult } from '../types/config.js';
export declare class GlobalSetupManager {
    private setupFunction?;
    private setupFile?;
    /**
     * Load global setup from file path
     */
    loadSetup(setupPath: string): Promise<void>;
    /**
     * Execute the loaded global setup function
     */
    executeSetup(): Promise<GlobalSetupResult>;
    /**
     * Load and execute global setup in one call
     */
    loadAndExecute(setupPath: string): Promise<GlobalSetupResult>;
    /**
     * Check if a global setup is loaded
     */
    isLoaded(): boolean;
    /**
     * Get the path of the loaded setup file
     */
    getSetupFile(): string | undefined;
    /**
     * Clear the loaded setup
     */
    clear(): void;
    /**
     * Validate that a file looks like a valid global setup file
     */
    static validateSetupFile(setupPath: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
}
export declare const globalSetupManager: GlobalSetupManager;
//# sourceMappingURL=global-setup-manager.d.ts.map