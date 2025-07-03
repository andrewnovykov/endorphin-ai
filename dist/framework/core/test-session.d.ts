/**
 * Test session management utilities (TypeScript)
 * Handles creation, tracking, and saving of test session data
 */
import type { TestSession } from '../types/test.js';
interface SessionSummary {
    testName: string;
    sessionId: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING';
    startTime: string;
    endTime?: string;
    duration?: number;
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    totalScreenshots: number;
    finalResult?: string;
}
/**
 * Create a new test session with directory structure and metadata
 * @param testName - Name of the test
 * @param testId - Optional test ID
 * @param resultBaseDir - Base directory for test results
 * @returns Test session object
 */
export declare function createTestSession(testName: string, testId: string | null | undefined, resultBaseDir: string): Promise<TestSession>;
/**
 * Generate test session summary
 * @param session - Test session object
 * @returns Session summary
 */
export declare function generateSessionSummary(session: TestSession): SessionSummary;
/**
 * Save test session data to files
 * @param session - Test session object
 * @returns Session summary
 */
export declare function saveTestSession(session: TestSession): Promise<SessionSummary>;
export {};
//# sourceMappingURL=test-session.d.ts.map