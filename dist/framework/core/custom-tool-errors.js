/**
 * Custom Tool Error Classes
 * Provides structured error handling for custom tool operations
 */
export class CustomToolError extends Error {
    code;
    context;
    constructor(message, code, context) {
        super(message);
        this.name = 'CustomToolError';
        this.code = code;
        this.context = context;
    }
}
export class ToolDiscoveryError extends CustomToolError {
    constructor(message, context) {
        super(message, 'TOOL_DISCOVERY_ERROR', context);
        this.name = 'ToolDiscoveryError';
    }
}
export class ToolLoadError extends CustomToolError {
    constructor(message, context) {
        super(message, 'TOOL_LOAD_ERROR', context);
        this.name = 'ToolLoadError';
    }
}
export class ToolValidationError extends CustomToolError {
    constructor(message, context) {
        super(message, 'TOOL_VALIDATION_ERROR', context);
        this.name = 'ToolValidationError';
    }
}
export class ToolExecutionError extends CustomToolError {
    constructor(message, context) {
        super(message, 'TOOL_EXECUTION_ERROR', context);
        this.name = 'ToolExecutionError';
    }
}
export class ToolConflictError extends CustomToolError {
    constructor(message, context) {
        super(message, 'TOOL_CONFLICT_ERROR', context);
        this.name = 'ToolConflictError';
    }
}
/**
 * Error handler utility for custom tools
 */
export class CustomToolErrorHandler {
    static errorCounts = new Map();
    static maxRetries = 3;
    /**
     * Handle and log errors with context
     */
    static handleError(error, context = {}) {
        const errorKey = `${error.name}:${context.toolPath || 'unknown'}`;
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        // Log error with context
        this.logError(error, context, count);
        // Convert to CustomToolError if needed
        if (error instanceof CustomToolError) {
            return error;
        }
        // Classify error type
        if (this.isModuleError(error)) {
            return new ToolLoadError(`Module loading failed: ${error.message}`, {
                ...context,
                originalError: error.name,
                retryCount: count,
            });
        }
        if (this.isValidationError(error)) {
            return new ToolValidationError(`Tool validation failed: ${error.message}`, {
                ...context,
                originalError: error.name,
                retryCount: count,
            });
        }
        if (this.isRuntimeError(error)) {
            return new ToolExecutionError(`Tool execution failed: ${error.message}`, {
                ...context,
                originalError: error.name,
                retryCount: count,
            });
        }
        // Generic custom tool error
        return new CustomToolError(`Custom tool error: ${error.message}`, 'UNKNOWN_ERROR', {
            ...context,
            originalError: error.name,
            retryCount: count,
        });
    }
    /**
     * Check if error should be retried
     */
    static shouldRetry(error) {
        const count = error.context?.retryCount || 0;
        return count < this.maxRetries && this.isRetryableError(error);
    }
    /**
     * Get error statistics
     */
    static getErrorStatistics() {
        return Object.fromEntries(this.errorCounts);
    }
    /**
     * Reset error counts
     */
    static resetErrorCounts() {
        this.errorCounts.clear();
    }
    /**
     * Log error with appropriate level
     */
    static logError(error, context, retryCount) {
        const logContext = {
            error: error.name,
            message: error.message,
            retryCount,
            ...context,
        };
        if (retryCount === 0) {
            console.warn('⚠️ Custom tool error:', JSON.stringify(logContext, null, 2));
        }
        else if (retryCount < this.maxRetries) {
            console.warn(`⚠️ Custom tool error (retry ${retryCount}):`, JSON.stringify(logContext, null, 2));
        }
        else {
            console.error('❌ Custom tool error (max retries exceeded):', JSON.stringify(logContext, null, 2));
        }
    }
    /**
     * Check if error is related to module loading
     */
    static isModuleError(error) {
        return (error.name === 'SyntaxError' ||
            error.name === 'ReferenceError' ||
            error.message.includes('Cannot resolve module') ||
            error.message.includes('Module not found') ||
            error.message.includes('import') ||
            error.message.includes('require'));
    }
    /**
     * Check if error is related to validation
     */
    static isValidationError(error) {
        return (error.name === 'ValidationError' ||
            error.message.includes('validation') ||
            error.message.includes('schema') ||
            error.message.includes('Invalid tool'));
    }
    /**
     * Check if error is a runtime execution error
     */
    static isRuntimeError(error) {
        return ((error.name === 'TypeError' && !this.isModuleError(error)) ||
            error.name === 'RuntimeError' ||
            error.message.includes('execution') ||
            error.message.includes('runtime'));
    }
    /**
     * Check if error is retryable
     */
    static isRetryableError(error) {
        // Don't retry validation errors or conflicts
        if (error instanceof ToolValidationError || error instanceof ToolConflictError) {
            return false;
        }
        // Retry loading and discovery errors
        return error instanceof ToolLoadError || error instanceof ToolDiscoveryError;
    }
}
//# sourceMappingURL=custom-tool-errors.js.map