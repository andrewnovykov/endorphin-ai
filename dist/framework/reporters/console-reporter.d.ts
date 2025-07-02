/**
 * ConsoleReporter - Real-time console output for test execution (TypeScript)
 * Provides colorful, formatted test results similar to popular test runners
 */
interface SessionSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    duration: number;
    success: boolean;
}
export declare class ConsoleReporter {
    private startTime;
    private results;
    private currentTestId;
    private colors;
    private icons;
    constructor();
    /**
     * Start the test session
     */
    startSession(): void;
    /**
     * Display ASCII art of Endorphin molecular structure
     */
    displayEndorphinMolecule(): void;
    /**
     * Report the start of a test
     */
    startTest(testId: string, testName: string): void;
    /**
     * Report test completion
     */
    completeTest(testId: string, testName: string, status: 'SUCCESS' | 'FAILED' | 'SKIPPED', duration?: number, error?: string | null): void;
    /**
     * Report test failure with error details
     */
    reportError(testId: string, error: string): void;
    /**
     * End the test session and display summary
     */
    endSession(): SessionSummary;
    /**
     * Display the test summary in a formatted way
     */
    private displaySummary;
    /**
     * Display detailed failure information
     */
    private displayFailureDetails;
    /**
     * Format duration in a human-readable way
     */
    private formatDuration;
    /**
     * Report progress during test execution
     */
    reportProgress(message: string, type?: 'info' | 'warning' | 'error' | 'success'): void;
    /**
     * Clear the current line (useful for updating progress)
     */
    clearLine(): void;
    /**
     * Check if we're in a CI environment (disable colors if needed)
     */
    static shouldUseColors(): boolean;
    /**
     * Disable colors for CI/non-terminal environments
     */
    disableColors(): void;
}
declare const consoleReporter: ConsoleReporter;
export default consoleReporter;
//# sourceMappingURL=console-reporter.d.ts.map