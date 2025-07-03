/**
 * Session Test Recorder
 * Records user interactions and generates test files
 */
import type { EnhancedBrowserTestFramework } from '../automation/browser/browser-framework.js';
/**
 * Test data interface for recording
 */
interface RecorderTestData {
    id?: string;
    name?: string;
    description?: string;
    priority?: string;
    tags?: string[];
    site?: string;
    testData?: Record<string, any>;
}
/**
 * Recording result interface
 */
interface RecordingResult {
    recordingId: string;
    recordingPath: string;
    steps: number;
    duration: number;
    testFilePath: string;
}
/**
 * Interactive Test Recorder
 * Records user interactions and generates test files
 */
export declare class TestRecorder {
    private framework;
    private testData;
    private steps;
    private stepCounter;
    private recordingId;
    private recordingPath;
    private stepsPath;
    private isRecording;
    private startTime;
    constructor(framework: EnhancedBrowserTestFramework, testData?: RecorderTestData);
    /**
     * Start recording session
     * @returns Promise resolving to recording ID
     */
    startRecording(): Promise<string>;
    /**
     * Record a step with tool call and screenshot
     * @param description - Step description
     * @param type - Step type
     * @param data - Step data
     * @param result - Step result
     */
    recordStep(description: string, type: string, data: any, result: string): Promise<void>;
    /**
     * Stop recording and generate final artifacts
     * @returns Promise resolving to recording result
     */
    stopRecording(): Promise<RecordingResult | undefined>;
    /**
     * Sanitize filename for safe usage
     * @param name - Filename to sanitize
     * @returns Sanitized filename
     */
    private sanitizeFileName;
    /**
     * Generate HTML report for the recording session
     */
    private generateHTMLReport;
    /**
     * Generate test file in tests/ folder
     * @returns Promise resolving to test file path
     */
    private generateTestFile;
}
export {};
//# sourceMappingURL=session-recorder.d.ts.map