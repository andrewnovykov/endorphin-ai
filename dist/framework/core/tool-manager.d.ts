/**
 * Tool Manager
 * Handles built-in tool setup, loading, and management
 */
import type { FrameworkConfig, LangChainTool } from '../types/index.js';
export declare class ToolManager {
    private toolsArray;
    private config;
    private logger;
    constructor(config: FrameworkConfig);
    /**
     * Setup and load all built-in tools
     */
    setupTools(framework: any): Promise<LangChainTool[]>;
    /**
     * Get all loaded tools
     */
    getTools(): LangChainTool[];
    /**
     * Get tool by name
     */
    getToolByName(name: string): LangChainTool | undefined;
    /**
     * Get tools by category/type
     */
    getToolsByType(type: string): LangChainTool[];
    /**
     * Check if tool exists
     */
    hasTool(name: string): boolean;
    /**
     * Get tool count
     */
    getToolCount(): number;
    /**
     * Get tool statistics
     */
    getToolStats(): {
        total: number;
        builtIn: number;
        toolNames: string[];
    };
    /**
     * Load built-in tools
     */
    private loadBuiltInTools;
    /**
     * Reload tools (useful for development)
     */
    reloadTools(framework: any): Promise<void>;
    /**
     * Validate tool configuration
     */
    validateTools(): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get tool information for debugging
     */
    getToolInfo(): Array<{
        name: string;
        description: string;
        hasCall: boolean;
        hasFunc: boolean;
        hasSchema: boolean;
    }>;
    /**
     * Clear all tools
     */
    clearTools(): void;
}
//# sourceMappingURL=tool-manager.d.ts.map