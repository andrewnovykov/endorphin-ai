/**
 * Test Helper Utilities
 * Common utilities for test execution, logging, and screenshots
 */
import { BrowserManager } from '../automation/browser/browser-manager.js';
import type { TestSession, TestStep } from '../types/index.js';
export declare class TestHelpers {
    /**
     * Log a test step with detailed information
     */
    static logTestStep(description: string, tool: string | null, params: any, result: string, isImportant?: boolean, session?: TestSession): void;
    /**
     * Take a screenshot for a test step
     */
    static takeStepScreenshot(browserManager: BrowserManager, description?: string | null, session?: TestSession): Promise<string | null>;
    /**
     * Format duration for display
     */
    static formatDuration(milliseconds: number): string;
    /**
     * Create a test step object
     */
    static createTestStep(stepNumber: number, description: string, status?: 'SUCCESS' | 'FAILED', toolName?: string, toolArgs?: any, result?: string): TestStep;
    /**
     * Validate test session data
     */
    static validateTestSession(session: TestSession): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Calculate test session statistics
     */
    static calculateSessionStats(session: TestSession): {
        totalSteps: number;
        completedSteps: number;
        failedSteps: number;
        avgStepDuration: number;
        totalDuration: number;
    };
    /**
     * Generate test summary
     */
    static generateTestSummary(session: TestSession): string;
    /**
     * Log test summary
     */
    static logTestSummary(session: TestSession): void;
    /**
     * Create error summary for failed tests
     */
    static createErrorSummary(session: TestSession): string;
    /**
     * Wait for a specified duration
     */
    static wait(milliseconds: number): Promise<void>;
    /**
     * Retry an operation with exponential backoff
     */
    static retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
}
//# sourceMappingURL=test-helpers.d.ts.map