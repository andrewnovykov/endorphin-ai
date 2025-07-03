/**
 * Built-in Tools Command Handler
 * Displays all available built-in browser automation tools
 */
export interface BuiltinTool {
    name: string;
    description: string;
    category: string;
    parameters?: string[];
}
/**
 * Handle list tools command - shows all built-in tools
 */
export declare function handleListToolsCommand(options?: {
    verbose?: boolean;
}): Promise<void>;
/**
 * Get tool count by category
 */
export declare function getToolStats(): Record<string, number>;
/**
 * Get all built-in tools list (for programmatic access)
 */
export declare function getAllBuiltinTools(): BuiltinTool[];
/**
 * Check if a tool exists
 */
export declare function isValidTool(toolName: string): boolean;
//# sourceMappingURL=builtin-tools-command.d.ts.map