/**
 * Directory Management Utilities
 * Handles cleanup and management of test directories
 */
export declare class DirectoryManager {
    /**
     * Clean up test result directories
     */
    static cleanupDirectories(resultBaseDir: string): Promise<void>;
    /**
     * Clean up test recorder directory for interactive mode
     */
    static cleanupRecorderDirectory(recorderBaseDir: string): Promise<void>;
    /**
     * Clean up a specific directory
     */
    static cleanupDirectory(dirPath: string, description?: string): Promise<void>;
    /**
     * Ensure directory exists, create if it doesn't
     */
    static ensureDirectory(dirPath: string): Promise<void>;
    /**
     * Get directory size in bytes
     */
    static getDirectorySize(dirPath: string): Promise<number>;
    /**
     * Get directory file count
     */
    static getDirectoryFileCount(dirPath: string): Promise<number>;
}
//# sourceMappingURL=directory-manager.d.ts.map