/**
 * Test Results Manager Module
 * Handles test result collection, storage, and processing
 */
import fs from 'fs';
import path from 'path';
/**
 * Manages test results storage, processing, and report generation
 */
export class TestResultsManager {
    testResults = [];
    resultsDir;
    recorderDir;
    enableRecorderCopy;
    constructor(options = {}) {
        this.resultsDir = options.resultsDir || path.resolve('./test-results');
        this.recorderDir = options.recorderDir || path.resolve('./test-recorder-sessions');
        this.enableRecorderCopy = options.enableRecorderCopy || false;
        // Ensure directories exist
        this.ensureDirectoriesExist();
    }
    /**
     * Add a test result to the collection
     */
    addTestResult(result) {
        this.testResults.push(result);
    }
    /**
     * Get all test results
     */
    getTestResults() {
        return [...this.testResults];
    }
    /**
     * Clear all test results
     */
    clearTestResults() {
        this.testResults = [];
    }
    /**
     * Process a completed test session
     */
    async processCompletedSession(session) {
        // This would be called from saveTestSession in test-session.ts
        // Add to results collection
        this.addTestResult(session);
        // Copy to recorder if enabled
        if (this.enableRecorderCopy) {
            await this.copySessionToRecorder(session);
        }
        return session;
    }
    /**
     * Copy test session results to recorder directory
     */
    copySessionToRecorder(session) {
        try {
            const recorderSessionDir = path.join(this.recorderDir, session.sessionName);
            const recorderScreenshotsDir = path.join(recorderSessionDir, 'screenshots');
            // Create recorder directories
            fs.mkdirSync(recorderSessionDir, { recursive: true });
            fs.mkdirSync(recorderScreenshotsDir, { recursive: true });
            // Copy all files from session directory
            const sourceFiles = fs.readdirSync(session.sessionDir);
            for (const file of sourceFiles) {
                const sourcePath = path.join(session.sessionDir, file);
                const destPath = path.join(recorderSessionDir, file);
                if (fs.statSync(sourcePath).isDirectory()) {
                    // Copy screenshots directory
                    if (file === 'screenshots') {
                        const screenshotFiles = fs.readdirSync(sourcePath);
                        for (const screenshot of screenshotFiles) {
                            const srcScreenshot = path.join(sourcePath, screenshot);
                            const destScreenshot = path.join(recorderScreenshotsDir, screenshot);
                            fs.copyFileSync(srcScreenshot, destScreenshot);
                        }
                    }
                }
                else {
                    // Copy individual files
                    fs.copyFileSync(sourcePath, destPath);
                }
            }
            console.log(`📼 Results recorded in: ${recorderSessionDir}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error copying results to recorder: ${message}`);
        }
    }
    /**
     * Generate a test report from collected results
     */
    generateReport() {
        const passed = this.testResults.filter((r) => r.status === 'SUCCESS').length;
        const failed = this.testResults.filter((r) => r.status === 'FAILED').length;
        const total = this.testResults.length;
        const report = {
            summary: {
                total,
                passed,
                failed,
                passRate: total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0%',
                generatedAt: new Date().toISOString(),
            },
            results: this.testResults.map((session) => ({
                testId: session.testId,
                name: session.sessionName,
                status: session.status === 'SUCCESS' ? 'passed' : 'failed',
                duration: session.duration || 0,
                error: session.error,
                screenshots: session.steps?.flatMap((step) => step.screenshots?.map((s) => s.filename) || []) || [],
                logs: session.steps?.map((step) => step.description) || [],
                timestamp: session.startTime,
            })),
        };
        return report;
    }
    /**
     * Generate and save a report to file
     */
    saveReport(filename) {
        const report = this.generateReport();
        const reportPath = path.join(this.resultsDir, filename || `report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Report saved to: ${reportPath}`);
        return reportPath;
    }
    /**
     * Ensure required directories exist
     */
    ensureDirectoriesExist() {
        try {
            if (!fs.existsSync(this.resultsDir)) {
                fs.mkdirSync(this.resultsDir, { recursive: true });
            }
            if (this.enableRecorderCopy && !fs.existsSync(this.recorderDir)) {
                fs.mkdirSync(this.recorderDir, { recursive: true });
            }
        }
        catch (_error) {
            const message = _error instanceof Error ? _error.message : String(_error);
            console.warn(`Warning: Could not create directories: ${message}`);
        }
    }
}
//# sourceMappingURL=test-results-manager.js.map