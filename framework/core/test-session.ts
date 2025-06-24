/**
 * Test session management utilities (TypeScript)
 * Handles creation, tracking, and saving of test session data
 */

import type { TestSession } from '@/types/index.js';
import fs from 'fs';
import path from 'path';

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
export function createTestSession(
  testName: string, 
  testId: string | null = null, 
  resultBaseDir: string
): TestSession {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionId = testId || `test-${Date.now()}`;
  const sessionName = `${sessionId}_${timestamp}`;
  const sessionDir = path.join(resultBaseDir, sessionName);
  const screenshotsDir = path.join(sessionDir, 'screenshots');

  // Create directories
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const session: TestSession = {
    sessionId,
    sessionName,
    testId: testId || sessionId,
    testName,
    startTime: new Date().toISOString(),
    endTime: undefined,
    sessionDir,
    screenshotsDir,
    steps: [],
    toolCalls: [],
    stepCounter: 0,
    screenshotCounter: 0,
    status: 'RUNNING',
    finalResult: undefined,
    duration: undefined,
  };

  console.log(`📁 Created test session: ${sessionName}`);
  return session;
}

/**
 * Generate test session summary
 * @param session - Test session object
 * @returns Session summary
 */
export function generateSessionSummary(session: TestSession): SessionSummary {
  return {
    testName: session.sessionName,
    sessionId: session.sessionId,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    totalSteps: session.steps.length,
    successfulSteps: session.steps.filter((s) => s.status === 'SUCCESS').length,
    failedSteps: session.steps.filter((s) => s.status === 'FAILED').length,
    totalScreenshots: session.screenshotCounter,
    finalResult: session.finalResult,
  };
}

/**
 * Save test session data to files
 * @param session - Test session object
 * @returns Session summary
 */
export function saveTestSession(session: TestSession): SessionSummary {
  // Save complete session data
  const sessionFile = path.join(session.sessionDir, 'test-session.json');
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

  // Save summary
  const summary = generateSessionSummary(session);
  const summaryFile = path.join(session.sessionDir, 'summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log(`💾 Session data saved to: ${session.sessionDir}`);
  return summary;
}
