/**
 * Session Manager
 * Handles test session lifecycle, state management, and persistence
 */
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';
import { globalLogger } from './logger.js';
import { createTestSession, saveTestSession } from './test-session.js';
export class SessionManager {
    currentTestSession = null;
    config;
    logger = globalLogger.createChild('SessionManager');
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize directories
     */
    async initialize() {
        this.logger.info('Initializing session manager');
        await this.ensureDirectories();
        this.cleanupDirectories();
        this.logger.info('Session manager initialized');
    }
    /**
     * Create a new test session
     */
    async createSession(testName, testId = null) {
        this.logger.info(`Creating new test session: ${testName}`, { testId });
        try {
            this.currentTestSession = await createTestSession(testName, testId, this.config.resultBaseDir);
            this.logger.debug('Test session created', {
                sessionId: this.currentTestSession.sessionId,
                sessionDir: this.currentTestSession.sessionDir,
            });
            return this.currentTestSession;
        }
        catch (error) {
            this.logger.error('Failed to create test session', error, { testName, testId });
            throw error;
        }
    }
    /**
     * Get current test session
     */
    getCurrentSession() {
        return this.currentTestSession;
    }
    /**
     * Require current session (throws if not exists)
     */
    requireCurrentSession() {
        if (!this.currentTestSession) {
            throw new Error('No active test session. Create a session first.');
        }
        return this.currentTestSession;
    }
    /**
     * Add a step to the current session
     */
    addStep(step) {
        const session = this.requireCurrentSession();
        this.logger.debug('Adding step to session', {
            stepNumber: step.stepNumber,
            description: step.description,
            status: step.status,
        });
        session.steps.push(step);
    }
    /**
     * Update session result
     */
    updateSessionResult(success, error, report) {
        const session = this.requireCurrentSession();
        this.logger.info(`Updating session result: ${success ? 'SUCCESS' : 'FAILED'}`, {
            sessionId: session.sessionId,
            error: error || 'none',
        });
        session.endTime = new Date().toISOString();
        session.status = success ? 'SUCCESS' : 'FAILED';
        session.duration = Date.now() - new Date(session.startTime).getTime();
        if (error) {
            session.error = error;
        }
        if (report) {
            session.report = report;
        }
    }
    /**
     * Update session with test setup result
     */
    updateSessionSetup(setupResult) {
        const session = this.requireCurrentSession();
        this.logger.info(`Updating session with setup result: ${setupResult.success ? 'SUCCESS' : 'FAILED'}`, {
            sessionId: session.sessionId,
            executionTime: setupResult.executionTime,
            hasData: !!setupResult.data,
            error: setupResult.error?.message || 'none',
        });
        // Store the setup result in the session
        session.setupResult = setupResult;
        this.logger.debug('Session setup result stored successfully', {
            sessionId: session.sessionId,
            setupSuccess: setupResult.success,
        });
    }
    /**
     * Update session with data generation result
     */
    updateSessionDataGeneration(dataResult) {
        const session = this.requireCurrentSession();
        this.logger.info(`Updating session with data generation result: ${dataResult.success ? 'SUCCESS' : 'FAILED'}`, {
            sessionId: session.sessionId,
            executionTime: dataResult.executionTime,
            hasData: !!dataResult.data,
            tokenUsage: dataResult.tokenUsage?.totalTokens || 0,
            cost: dataResult.tokenUsage?.cost || 0,
            error: dataResult.error?.message || 'none',
        });
        // Store the data generation result in the session
        session.dataGenerationResult = dataResult;
        this.logger.debug('Session data generation result stored successfully', {
            sessionId: session.sessionId,
            dataGenerationSuccess: dataResult.success,
            totalTokens: dataResult.tokenUsage?.totalTokens || 0,
        });
    }
    /**
     * Save current session
     */
    async saveSession() {
        const session = this.requireCurrentSession();
        this.logger.info('Saving test session', { sessionId: session.sessionId });
        try {
            await saveTestSession(session);
            this.logger.debug('Test session saved successfully');
        }
        catch (error) {
            this.logger.error('Failed to save test session', error);
            throw error;
        }
    }
    /**
     * Complete current session (update result and save)
     */
    async completeSession(success, error, report) {
        this.logger.info(`Completing session: ${success ? 'SUCCESS' : 'FAILED'}`);
        this.updateSessionResult(success, error, report);
        await this.saveSession();
        this.logger.info('Session completed and saved');
    }
    /**
     * Close current session
     */
    closeSession() {
        if (this.currentTestSession) {
            this.logger.debug('Closing current session', {
                sessionId: this.currentTestSession.sessionId,
            });
            this.currentTestSession = null;
        }
    }
    /**
     * Get session directory for current session
     */
    getSessionDirectory() {
        const session = this.requireCurrentSession();
        return session.sessionDir;
    }
    /**
     * Get session ID for current session
     */
    getSessionId() {
        const session = this.requireCurrentSession();
        return session.sessionId;
    }
    /**
     * Check if session is active
     */
    hasActiveSession() {
        return this.currentTestSession !== null;
    }
    /**
     * Get session statistics
     */
    getSessionStats() {
        const session = this.requireCurrentSession();
        const totalSteps = session.steps.length;
        const successfulSteps = session.steps.filter((step) => step.status === 'SUCCESS').length;
        const failedSteps = totalSteps - successfulSteps;
        return {
            sessionId: session.sessionId,
            testName: session.testName,
            duration: session.duration,
            totalSteps,
            successfulSteps,
            failedSteps,
            success: session.status === 'SUCCESS',
            startTime: session.startTime,
            endTime: session.endTime,
        };
    }
    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const directories = [this.config.resultBaseDir, this.config.recorderBaseDir];
        for (const dir of directories) {
            if (!existsSync(dir)) {
                this.logger.debug(`Creating directory: ${dir}`);
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }
    /**
     * Clean up old directories
     */
    cleanupDirectories() {
        // This could be expanded to implement cleanup policies
        this.logger.debug('Directory cleanup completed');
    }
    /**
     * Copy recorder files if enabled
     */
    async copyRecorderFiles() {
        if (!this.config.enableRecorderCopy) {
            return;
        }
        const session = this.requireCurrentSession();
        const sourceDir = this.config.recorderBaseDir;
        const targetDir = path.join(session.sessionDir, 'recorder');
        if (!existsSync(sourceDir)) {
            this.logger.debug('No recorder directory to copy');
            return;
        }
        this.logger.debug('Copying recorder files', { sourceDir, targetDir });
        try {
            await fs.mkdir(targetDir, { recursive: true });
            await this.copyDirectory(sourceDir, targetDir);
            this.logger.debug('Recorder files copied successfully');
        }
        catch (error) {
            this.logger.error('Failed to copy recorder files', error);
        }
    }
    /**
     * Recursively copy directory
     */
    async copyDirectory(source, target) {
        const entries = await fs.readdir(source, { withFileTypes: true });
        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);
            if (entry.isDirectory()) {
                await fs.mkdir(targetPath, { recursive: true });
                await this.copyDirectory(sourcePath, targetPath);
            }
            else {
                await fs.copyFile(sourcePath, targetPath);
            }
        }
    }
}
//# sourceMappingURL=session-manager.js.map