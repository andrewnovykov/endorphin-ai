/**
 * Test Helper Utilities
 * Common utilities for test execution, logging, and screenshots
 */
import * as path from 'node:path';
export class TestHelpers {
    /**
     * Log a test step with detailed information
     */
    static logTestStep(description, tool, params, result, isImportant = false, session) {
        const timestamp = new Date().toISOString();
        const _stepLog = {
            timestamp,
            description,
            tool,
            params,
            result,
            isImportant,
        };
        // Console output with formatting
        const prefix = isImportant ? '🔥' : '📝';
        console.log(`${prefix} ${description}`);
        if (tool) {
            console.log(`   🔧 Tool: ${tool}`);
        }
        if (params && Object.keys(params).length > 0) {
            console.log(`   📊 Params: ${JSON.stringify(params, null, 2)}`);
        }
        if (result) {
            console.log(`   ✅ Result: ${result}`);
        }
        // Add to session if provided
        if (session) {
            const step = {
                stepNumber: session.steps.length + 1,
                timestamp,
                description,
                toolName: tool,
                toolArgs: params,
                result,
                status: isImportant ? 'SUCCESS' : 'SUCCESS',
                screenshots: [],
            };
            session.steps.push(step);
        }
    }
    /**
     * Take a screenshot for a test step
     */
    static async takeStepScreenshot(browserManager, description = null, session) {
        try {
            if (!browserManager.isInitialized()) {
                console.log('⚠️ Browser not initialized, skipping screenshot');
                return null;
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const stepNumber = session ? session.screenshotCounter + 1 : 1;
            const filename = `step-${stepNumber}-${timestamp}.png`;
            const screenshotPath = session
                ? path.join(session.sessionDir, 'screenshots', filename)
                : path.join('screenshots', filename);
            const _screenshot = await browserManager.takeScreenshot({
                path: screenshotPath,
                fullPage: true,
            });
            if (session) {
                session.screenshotCounter = stepNumber;
            }
            const logDescription = description
                ? `Screenshot: ${description}`
                : `Screenshot step ${stepNumber}`;
            console.log(`📸 ${logDescription} -> ${filename}`);
            return screenshotPath;
        }
        catch (error) {
            console.error('❌ Failed to take screenshot:', error.message);
            return null;
        }
    }
    /**
     * Format duration for display
     */
    static formatDuration(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        }
        const seconds = Math.floor(milliseconds / 1000);
        const remainingMs = milliseconds % 1000;
        if (seconds < 60) {
            return remainingMs > 0
                ? `${seconds}.${remainingMs.toString().padStart(3, '0')}s`
                : `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    /**
     * Create a test step object
     */
    static createTestStep(stepNumber, description, status = 'SUCCESS', toolName, toolArgs, result) {
        return {
            stepNumber,
            timestamp: new Date().toISOString(),
            description,
            toolName: toolName || null,
            toolArgs,
            result: result || null,
            status,
            screenshots: [],
        };
    }
    /**
     * Validate test session data
     */
    static validateTestSession(session) {
        const errors = [];
        if (!session.sessionId) {
            errors.push('Session ID is required');
        }
        if (!session.testName) {
            errors.push('Test name is required');
        }
        if (!session.testId) {
            errors.push('Test ID is required');
        }
        if (!session.startTime) {
            errors.push('Start time is required');
        }
        if (!Array.isArray(session.steps)) {
            errors.push('Steps must be an array');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Calculate test session statistics
     */
    static calculateSessionStats(session) {
        const totalSteps = session.steps.length;
        const completedSteps = session.steps.filter((step) => step.status === 'SUCCESS').length;
        const failedSteps = session.steps.filter((step) => step.status === 'FAILED').length;
        // Note: TestStep doesn't have duration field, so we'll use 0 for now
        const avgStepDuration = 0;
        const totalDuration = session.duration || 0;
        return {
            totalSteps,
            completedSteps,
            failedSteps,
            avgStepDuration,
            totalDuration,
        };
    }
    /**
     * Generate test summary
     */
    static generateTestSummary(session) {
        const stats = TestHelpers.calculateSessionStats(session);
        const duration = TestHelpers.formatDuration(stats.totalDuration);
        const avgDuration = TestHelpers.formatDuration(stats.avgStepDuration);
        return `
Test Summary: ${session.testName} (${session.testId})
═══════════════════════════════════════════════════
Status: ${session.status}
Duration: ${duration}
Steps: ${stats.totalSteps} (${stats.completedSteps} completed, ${stats.failedSteps} failed)
Average Step Duration: ${avgDuration}
Screenshots: ${session.screenshotCounter}
Session ID: ${session.sessionId}
    `.trim();
    }
    /**
     * Log test summary
     */
    static logTestSummary(session) {
        console.log(`\n${TestHelpers.generateTestSummary(session)}\n`);
    }
    /**
     * Create error summary for failed tests
     */
    static createErrorSummary(session) {
        const failedSteps = session.steps.filter((step) => step.status === 'FAILED');
        if (failedSteps.length === 0) {
            return 'No failed steps found.';
        }
        let summary = `❌ ${failedSteps.length} Failed Step(s):\n`;
        failedSteps.forEach((step, index) => {
            summary += `\n${index + 1}. ${step.description}`;
            if (step.result) {
                summary += `\n   Result: ${step.result}`;
            }
            if (step.toolName) {
                summary += `\n   Tool: ${step.toolName}`;
            }
        });
        return summary;
    }
    /**
     * Wait for a specified duration
     */
    static wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
    /**
     * Retry an operation with exponential backoff
     */
    static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxRetries) {
                    throw lastError;
                }
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                await TestHelpers.wait(delay);
            }
        }
        throw lastError;
    }
}
//# sourceMappingURL=test-helpers.js.map