// Endorphin e2e AI test framework>
// Copyright (C)  2025 Redstudio Agency

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.


import fs from 'fs';
import path from 'path';

/**
 * Create a new test session with directory structure and metadata
 * @param {string} testName - Name of the test
 * @param {string} testId - Optional test ID
 * @param {string} resultBaseDir - Base directory for test results
 * @returns {Object} Test session object
 */
export function createTestSession(testName, testId = null, resultBaseDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionId = testId || `test-${Date.now()}`;
  const sessionName = `${sessionId}_${timestamp}`;
  const sessionDir = path.join(resultBaseDir, sessionName);
  const screenshotsDir = path.join(sessionDir, 'screenshots');
  
  // Create directories
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
  
  const session = {
    sessionId,
    sessionName,
    testName,
    testId,
    startTime: new Date().toISOString(),
    endTime: null,
    sessionDir,
    screenshotsDir,
    steps: [],
    toolCalls: [],
    stepCounter: 0,
    screenshotCounter: 0,
    status: 'RUNNING',
    finalResult: null,
    duration: null
  };
  
  console.log(`📁 Created test session: ${sessionName}`);
  return session;
}

/**
 * Generate test session summary
 * @param {Object} session - Test session object
 * @returns {Object} Session summary
 */
export function generateSessionSummary(session) {
  return {
    testName: session.testName,
    sessionId: session.sessionId,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    totalSteps: session.steps.length,
    successfulSteps: session.steps.filter(s => s.status === 'SUCCESS').length,
    failedSteps: session.steps.filter(s => s.status === 'FAILED').length,
    totalScreenshots: session.screenshotCounter,
    finalResult: session.finalResult
  };
}

/**
 * Save test session data to files
 * @param {Object} session - Test session object
 */
export function saveTestSession(session) {
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
