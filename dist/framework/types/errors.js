/**
 * Custom error types for the framework
 */
export class EndorphinError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'EndorphinError';
    }
}
export class TestExecutionError extends EndorphinError {
    testId;
    constructor(message, testId, details) {
        super(message, 'TEST_EXECUTION_ERROR', details);
        this.testId = testId;
        this.name = 'TestExecutionError';
    }
}
export class BrowserError extends EndorphinError {
    constructor(message, details) {
        super(message, 'BROWSER_ERROR', details);
        this.name = 'BrowserError';
    }
}
export class ConfigurationError extends EndorphinError {
    constructor(message, details) {
        super(message, 'CONFIGURATION_ERROR', details);
        this.name = 'ConfigurationError';
    }
}
//# sourceMappingURL=errors.js.map