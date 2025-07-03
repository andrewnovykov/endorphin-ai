/**
 * Custom Tool Discovery Module
 * Handles discovery, loading, and validation of custom tools
 */
import type { FrameworkConfig } from '../types/index.js';
import { EnhancedBrowserTestFramework } from '../automation/browser/browser-framework.js';
import { CustomToolError } from './custom-tool-errors';
export interface CustomToolInfo {
    name: string;
    path: string;
    module: any;
    error?: CustomToolError;
}
export interface ToolLoadResult {
    success: boolean;
    tools: any[];
    errors: CustomToolError[];
    statistics: {
        totalPaths: number;
        scannedFiles: number;
        loadedTools: number;
        failedLoads: number;
        validationErrors: number;
        conflicts: number;
        totalErrors: number;
    };
}
export declare class CustomToolDiscovery {
    private config;
    private framework;
    private loadedTools;
    private toolPaths;
    private errors;
    private statistics;
    constructor(config: FrameworkConfig, framework: EnhancedBrowserTestFramework);
    /**
     * Discover and load all custom tools with comprehensive error handling
     */
    discoverAndLoadTools(): Promise<any[]>;
    /**
     * Get detailed load result with all errors and statistics
     */
    getLoadResult(): ToolLoadResult;
    /**
     * Discover tool files from configured paths
     */
    private discoverToolFiles;
    /**
     * Recursively scan directory for tool files
     */
    private scanDirectory;
    /**
     * Check if file is a potential tool file
     */
    private isToolFile;
    /**
     * Load tools from discovered files with retry logic
     */
    private loadTools;
    /**
     * Load and validate tool from a single file
     */
    private loadToolFromFile;
    /**
     * Extract tool creation functions from module
     */
    private extractToolFunctions;
    /**
     * Create and validate a tool with comprehensive error handling
     */
    private createAndValidateTool;
    /**
     * Validate tool structure with detailed error reporting
     */
    private validateTool;
    /**
     * Check if tool name conflicts with existing tools
     */
    private hasNameConflict;
    /**
     * Get all loaded custom tools
     */
    getLoadedTools(): any[];
    /**
     * Get all loaded custom tools (alias for getLoadedTools)
     */
    getAllTools(): any[];
    /**
     * Get tool by name
     */
    getToolByName(name: string): any | undefined;
    /**
     * Reset internal state
     */
    private resetState;
    /**
     * Log final results
     */
    private logResults;
    /**
     * Get tool statistics
     */
    getStatistics(): {
        totalPaths: number;
        scannedFiles: number;
        loadedTools: number;
        failedLoads: number;
        validationErrors: number;
        conflicts: number;
        totalErrors: number;
    };
    /**
     * Get all errors
     */
    getErrors(): CustomToolError[];
}
//# sourceMappingURL=custom-tool-discovery.d.ts.map