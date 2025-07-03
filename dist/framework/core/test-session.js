/**
 * Test session management utilities (TypeScript)
 * Handles creation, tracking, and saving of test session data
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
/**
 * Create a new test session with directory structure and metadata
 * @param testName - Name of the test
 * @param testId - Optional test ID
 * @param resultBaseDir - Base directory for test results
 * @returns Test session object
 */
export async function createTestSession(testName, testId = null, resultBaseDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionId = testId || `test-${Date.now()}`;
    const sessionName = `${sessionId}_${timestamp}`;
    const sessionDir = path.join(resultBaseDir, sessionName);
    const screenshotsDir = path.join(sessionDir, 'screenshots');
    // Create directories
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(screenshotsDir, { recursive: true });
    const session = {
        sessionId,
        sessionName,
        testId: testId || sessionId,
        testName,
        startTime: new Date().toISOString(),
        sessionDir,
        screenshotsDir,
        steps: [],
        toolCalls: [],
        agentHistory: [],
        stepCounter: 0,
        screenshotCounter: 0,
        status: 'RUNNING',
    };
    console.log(`📁 Created test session: ${sessionName}`);
    return session;
}
/**
 * Generate test session summary
 * @param session - Test session object
 * @returns Session summary
 */
export function generateSessionSummary(session) {
    const summary = {
        testName: session.sessionName,
        sessionId: session.sessionId,
        status: session.status,
        startTime: session.startTime,
        totalSteps: session.steps.length,
        successfulSteps: session.steps.filter((s) => s.status === 'SUCCESS').length,
        failedSteps: session.steps.filter((s) => s.status === 'FAILED').length,
        totalScreenshots: session.screenshotCounter,
    };
    // Only assign optional properties if they have values
    if (session.endTime) {
        summary.endTime = session.endTime;
    }
    if (session.duration !== undefined) {
        summary.duration = session.duration;
    }
    if (session.finalResult) {
        summary.finalResult = session.finalResult;
    }
    return summary;
}
/**
 * Save test session data to files
 * @param session - Test session object
 * @returns Session summary
 */
export async function saveTestSession(session) {
    // Save complete session data
    const sessionFile = path.join(session.sessionDir, 'test-session.json');
    await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
    // Save summary
    const summary = generateSessionSummary(session);
    const summaryFile = path.join(session.sessionDir, 'summary.json');
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`💾 Session data saved to: ${session.sessionDir}`);
    return summary;
}
//# sourceMappingURL=test-session.js.map