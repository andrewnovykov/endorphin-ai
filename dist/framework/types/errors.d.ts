/**
 * Custom error types for the framework
 */
export declare class EndorphinError extends Error {
    code?: string | undefined;
    details?: Record<string, any> | undefined;
    constructor(message: string, code?: string | undefined, details?: Record<string, any> | undefined);
}
export declare class TestExecutionError extends EndorphinError {
    testId: string;
    constructor(message: string, testId: string, details?: Record<string, any>);
}
export declare class BrowserError extends EndorphinError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class ConfigurationError extends EndorphinError {
    constructor(message: string, details?: Record<string, any>);
}
//# sourceMappingURL=errors.d.ts.map