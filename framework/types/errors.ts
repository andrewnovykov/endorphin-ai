/**
 * Custom error types for the framework
 */

export class EndorphinError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'EndorphinError';
  }
}

export class TestExecutionError extends EndorphinError {
  constructor(
    message: string,
    public testId: string,
    details?: Record<string, any>
  ) {
    super(message, 'TEST_EXECUTION_ERROR', details);
    this.name = 'TestExecutionError';
  }
}

export class BrowserError extends EndorphinError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'BROWSER_ERROR', details);
    this.name = 'BrowserError';
  }
}

export class ConfigurationError extends EndorphinError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}
