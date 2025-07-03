/**
 * Custom Tool Error Classes
 * Provides structured error handling for custom tool operations
 */
export declare class CustomToolError extends Error {
    readonly code: string;
    readonly context: Record<string, any> | undefined;
    constructor(message: string, code: string, context?: Record<string, any>);
}
export declare class ToolDiscoveryError extends CustomToolError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class ToolLoadError extends CustomToolError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class ToolValidationError extends CustomToolError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class ToolExecutionError extends CustomToolError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class ToolConflictError extends CustomToolError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Error handler utility for custom tools
 */
export declare class CustomToolErrorHandler {
    private static errorCounts;
    private static maxRetries;
    /**
     * Handle and log errors with context
     */
    static handleError(error: Error, context?: Record<string, any>): CustomToolError;
    /**
     * Check if error should be retried
     */
    static shouldRetry(error: CustomToolError): boolean;
    /**
     * Get error statistics
     */
    static getErrorStatistics(): Record<string, number>;
    /**
     * Reset error counts
     */
    static resetErrorCounts(): void;
    /**
     * Log error with appropriate level
     */
    private static logError;
    /**
     * Check if error is related to module loading
     */
    private static isModuleError;
    /**
     * Check if error is related to validation
     */
    private static isValidationError;
    /**
     * Check if error is a runtime execution error
     */
    private static isRuntimeError;
    /**
     * Check if error is retryable
     */
    private static isRetryableError;
}
//# sourceMappingURL=custom-tool-errors.d.ts.map