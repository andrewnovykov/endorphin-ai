/**
 * Global Setup Manager
 * Handles loading and executing global setup files
 */
import { existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { pathToFileURL } from 'url';
// Simple console logging to avoid circular dependencies
const log = {
    info: (msg, data) => console.log(`[GlobalSetup] ${msg}`, data || ''),
    debug: (msg, data) => console.debug(`[GlobalSetup] ${msg}`, data || ''),
    warn: (msg, data) => console.warn(`[GlobalSetup] ${msg}`, data || ''),
    error: (msg, error) => console.error(`[GlobalSetup] ${msg}`, error || ''),
};
export class GlobalSetupManager {
    setupFunction;
    setupFile;
    /**
     * Load global setup from file path
     */
    async loadSetup(setupPath) {
        const absolutePath = isAbsolute(setupPath) ? setupPath : resolve(process.cwd(), setupPath);
        if (!existsSync(absolutePath)) {
            throw new Error(`Global setup file not found: ${absolutePath}`);
        }
        this.setupFile = absolutePath;
        log.info(`Loading global setup from: ${absolutePath}`);
        try {
            // Convert file path to file URL for ESM import
            const fileUrl = pathToFileURL(absolutePath).href;
            // Dynamic import the setup module
            const module = (await import(fileUrl));
            if (!module.default || typeof module.default !== 'function') {
                throw new Error(`Global setup file must export a default function: ${absolutePath}`);
            }
            this.setupFunction = module.default;
            log.debug(`Global setup function loaded successfully`);
        }
        catch (error) {
            log.error(`Failed to load global setup file: ${absolutePath}`, error);
            throw new Error(`Failed to load global setup: ${error.message}`);
        }
    }
    /**
     * Execute the loaded global setup function
     */
    async executeSetup() {
        if (!this.setupFunction) {
            throw new Error('No global setup function loaded. Call loadSetup() first.');
        }
        const startTime = Date.now();
        log.info('🚀 Executing global setup...');
        if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
            console.log('🔧 Global setup starting execution...');
        }
        try {
            // Execute the setup function
            await this.setupFunction();
            const executionTime = Date.now() - startTime;
            log.info(`✅ Global setup completed successfully in ${executionTime}ms`);
            if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
                console.log(`✅ Global setup completed successfully!`);
                console.log(`⏱️ Execution time: ${executionTime}ms`);
            }
            return {
                success: true,
                executionTime,
                setupFile: this.setupFile || '',
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            log.error(`❌ Global setup failed after ${executionTime}ms`, error);
            if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
                console.error(`❌ Global setup failed!`);
                console.error(`⏱️ Failed after: ${executionTime}ms`);
                console.error(`💥 Error:`, error);
            }
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                executionTime,
                setupFile: this.setupFile || '',
            };
        }
    }
    /**
     * Load and execute global setup in one call
     */
    async loadAndExecute(setupPath) {
        await this.loadSetup(setupPath);
        return await this.executeSetup();
    }
    /**
     * Check if a global setup is loaded
     */
    isLoaded() {
        return !!this.setupFunction;
    }
    /**
     * Get the path of the loaded setup file
     */
    getSetupFile() {
        return this.setupFile;
    }
    /**
     * Clear the loaded setup
     */
    clear() {
        this.setupFunction = undefined;
        this.setupFile = undefined;
        log.debug('Global setup cleared');
    }
    /**
     * Validate that a file looks like a valid global setup file
     */
    static async validateSetupFile(setupPath) {
        const absolutePath = isAbsolute(setupPath) ? setupPath : resolve(process.cwd(), setupPath);
        if (!existsSync(absolutePath)) {
            return { valid: false, error: `File does not exist: ${absolutePath}` };
        }
        try {
            const fileUrl = pathToFileURL(absolutePath).href;
            const module = (await import(fileUrl));
            if (!module.default) {
                return { valid: false, error: 'File must have a default export' };
            }
            if (typeof module.default !== 'function') {
                return { valid: false, error: 'Default export must be a function' };
            }
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: `Failed to load file: ${error.message}` };
        }
    }
}
// Export a singleton instance for convenience
export const globalSetupManager = new GlobalSetupManager();
//# sourceMappingURL=global-setup-manager.js.map