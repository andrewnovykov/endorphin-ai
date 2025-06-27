/**
 * CLI Command Handlers
 * Separated command handlers to reduce complexity in main CLI file
 */
import type { FrameworkConfig } from '../framework/types/config';
/**
 * Handle help and version commands
 */
export declare function handleHelpAndVersion(args: string[], packageInfo: {
    version: string;
}, showHelp: () => void): Promise<void>;
/**
 * Handle list command
 */
export declare function handleListCommand(config: FrameworkConfig): Promise<void>;
/**
 * Handle init command
 */
export declare function handleInitCommand(): Promise<void>;
/**
 * Handle test recorder command
 */
export declare function handleTestRecorderCommand(config: FrameworkConfig): Promise<void>;
/**
 * Handle test by tag
 */
export declare function handleTestByTag(args: string[], config: FrameworkConfig): Promise<void>;
/**
 * Handle test by priority
 */
export declare function handleTestByPriority(args: string[], config: FrameworkConfig): Promise<void>;
/**
 * Handle test command with different options
 */
export declare function handleTestCommand(args: string[], target: string | undefined, config: FrameworkConfig): Promise<void>;
/**
 * Handle generate command
 */
export declare function handleGenerateCommand(subcommand: string, args: string[]): Promise<void>;
/**
 * Handle open command
 */
export declare function handleOpenCommand(subcommand: string, target?: string): Promise<void>;
//# sourceMappingURL=cli-handlers.d.ts.map