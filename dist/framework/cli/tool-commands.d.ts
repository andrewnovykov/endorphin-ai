/**
 * CLI commands for custom tool management
 */
/**
 * Handle create tool command
 */
export declare function handleCreateToolCommand(toolName: string, options: {
    template?: string;
    path?: string;
}): void;
/**
 * Handle validate tools command with comprehensive error reporting
 */
export declare function handleValidateToolsCommand(): Promise<void>;
/**
 * Handle list tools command with error handling
 */
export declare function handleListToolsCommand(options: {
    verbose?: boolean;
}): Promise<void>;
//# sourceMappingURL=tool-commands.d.ts.map