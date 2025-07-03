/**
 * Framework Error Type Hierarchy
 * Provides consistent error handling across the framework
 */
export declare abstract class FrameworkError extends Error {
    readonly context?: Record<string, any> | undefined;
    readonly originalError?: Error | undefined;
    readonly code: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    constructor(message: string, code: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any> | undefined, originalError?: Error | undefined);
    toJSON(): Record<string, any>;
}
export declare class BrowserError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class PageLoadError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ElementNotFoundError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class TestExecutionError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class TestTimeoutError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class TestValidationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ConfigurationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class InvalidConfigError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class AgentError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class AgentTimeoutError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class AgentInvocationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ToolError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class CustomToolError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class FileSystemError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ReportGenerationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class NetworkError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class SessionError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class SessionTimeoutError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ValidationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class SchemaValidationError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ResourceError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class MemoryError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ResourceExhaustedError extends FrameworkError {
    constructor(message: string, context?: Record<string, any>, originalError?: Error);
}
export declare function isFrameworkError(error: unknown): error is FrameworkError;
export declare function createErrorFromUnknown(error: unknown, defaultMessage?: string, context?: Record<string, any>): FrameworkError;
export interface ErrorContext {
    operation?: string;
    component?: string;
    testId?: string;
    sessionId?: string;
    timestamp?: number;
    [key: string]: any;
}
//# sourceMappingURL=errors.d.ts.map