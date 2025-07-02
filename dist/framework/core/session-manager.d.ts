/**
 * Session Manager
 * Handles test session lifecycle, state management, and persistence
 */
import type { DataGenerationResult, TestReport, TestSession, TestSetupResult, TestStep } from '../types/index.js';
export interface SessionManagerConfig {
    resultBaseDir: string;
    recorderBaseDir: string;
    enableRecorderCopy: boolean;
}
export declare class SessionManager {
    private currentTestSession;
    private config;
    private logger;
    constructor(config: SessionManagerConfig);
    /**
     * Initialize directories
     */
    initialize(): Promise<void>;
    /**
     * Create a new test session
     */
    createSession(testName: string, testId?: string | null): Promise<TestSession>;
    /**
     * Get current test session
     */
    getCurrentSession(): TestSession | null;
    /**
     * Require current session (throws if not exists)
     */
    requireCurrentSession(): TestSession;
    /**
     * Add a step to the current session
     */
    addStep(step: TestStep): void;
    /**
     * Update session result
     */
    updateSessionResult(success: boolean, error?: string, report?: TestReport): void;
    /**
     * Update session with test setup result
     */
    updateSessionSetup(setupResult: TestSetupResult): void;
    /**
     * Update session with data generation result
     */
    updateSessionDataGeneration(dataResult: DataGenerationResult): void;
    /**
     * Save current session
     */
    saveSession(): Promise<void>;
    /**
     * Complete current session (update result and save)
     */
    completeSession(success: boolean, error?: string, report?: TestReport): Promise<void>;
    /**
     * Close current session
     */
    closeSession(): void;
    /**
     * Get session directory for current session
     */
    getSessionDirectory(): string;
    /**
     * Get session ID for current session
     */
    getSessionId(): string;
    /**
     * Check if session is active
     */
    hasActiveSession(): boolean;
    /**
     * Get session statistics
     */
    getSessionStats(): {
        sessionId: string;
        testName: string;
        duration: number | undefined;
        totalSteps: number;
        successfulSteps: number;
        failedSteps: number;
        success: boolean;
        startTime: string;
        endTime: string | undefined;
    };
    /**
     * Ensure required directories exist
     */
    private ensureDirectories;
    /**
     * Clean up old directories
     */
    private cleanupDirectories;
    /**
     * Copy recorder files if enabled
     */
    copyRecorderFiles(): Promise<void>;
    /**
     * Recursively copy directory
     */
    private copyDirectory;
}
//# sourceMappingURL=session-manager.d.ts.map