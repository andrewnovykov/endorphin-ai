/**
 * Framework Error Type Hierarchy
 * Provides consistent error handling across the framework
 */
export class FrameworkError extends Error {
    context;
    originalError;
    code;
    severity;
    constructor(message, code, severity, context, originalError) {
        super(message);
        this.context = context;
        this.originalError = originalError;
        this.name = this.constructor.name;
        this.code = code;
        this.severity = severity;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            severity: this.severity,
            context: this.context,
            stack: this.stack,
        };
    }
}
// Browser-related errors
export class BrowserError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'BROWSER_ERROR', 'high', context, originalError);
    }
}
export class PageLoadError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'PAGE_LOAD_ERROR', 'high', context, originalError);
    }
}
export class ElementNotFoundError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'ELEMENT_NOT_FOUND', 'medium', context, originalError);
    }
}
// Test execution errors
export class TestExecutionError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'TEST_EXECUTION_ERROR', 'high', context, originalError);
    }
}
export class TestTimeoutError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'TEST_TIMEOUT_ERROR', 'high', context, originalError);
    }
}
export class TestValidationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'TEST_VALIDATION_ERROR', 'medium', context, originalError);
    }
}
// Configuration errors
export class ConfigurationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'CONFIGURATION_ERROR', 'critical', context, originalError);
    }
}
export class InvalidConfigError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'INVALID_CONFIG_ERROR', 'critical', context, originalError);
    }
}
// AI/Agent errors
export class AgentError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'AGENT_ERROR', 'high', context, originalError);
    }
}
export class AgentTimeoutError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'AGENT_TIMEOUT_ERROR', 'high', context, originalError);
    }
}
export class AgentInvocationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'AGENT_INVOCATION_ERROR', 'high', context, originalError);
    }
}
// Tool-related errors
export class ToolError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'TOOL_ERROR', 'medium', context, originalError);
    }
}
export class CustomToolError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'CUSTOM_TOOL_ERROR', 'medium', context, originalError);
    }
}
// File system errors
export class FileSystemError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'FILE_SYSTEM_ERROR', 'medium', context, originalError);
    }
}
export class ReportGenerationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'REPORT_GENERATION_ERROR', 'low', context, originalError);
    }
}
// Network errors
export class NetworkError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'NETWORK_ERROR', 'medium', context, originalError);
    }
}
// Session management errors
export class SessionError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'SESSION_ERROR', 'medium', context, originalError);
    }
}
export class SessionTimeoutError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'SESSION_TIMEOUT_ERROR', 'medium', context, originalError);
    }
}
// Validation errors
export class ValidationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'VALIDATION_ERROR', 'medium', context, originalError);
    }
}
export class SchemaValidationError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'SCHEMA_VALIDATION_ERROR', 'medium', context, originalError);
    }
}
// Resource management errors
export class ResourceError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'RESOURCE_ERROR', 'medium', context, originalError);
    }
}
export class MemoryError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'MEMORY_ERROR', 'high', context, originalError);
    }
}
export class ResourceExhaustedError extends FrameworkError {
    constructor(message, context, originalError) {
        super(message, 'RESOURCE_EXHAUSTED_ERROR', 'high', context, originalError);
    }
}
// Utility functions for error handling
export function isFrameworkError(error) {
    return error instanceof FrameworkError;
}
export function createErrorFromUnknown(error, defaultMessage = 'Unknown error occurred', context) {
    if (isFrameworkError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new TestExecutionError(error.message, context, error);
    }
    return new TestExecutionError(typeof error === 'string' ? error : defaultMessage, {
        ...context,
        originalError: error,
    });
}
//# sourceMappingURL=errors.js.map