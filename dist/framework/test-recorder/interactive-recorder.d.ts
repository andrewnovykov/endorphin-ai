/**
 * Interactive Test Recorder
 * Provides interactive test recording with AI agent execution
 */
import type { FrameworkConfig } from '../types/index.js';
/**
 * Test data interface
 */
interface TestData {
    id: string;
    name: string;
    description: string;
    priority: string;
    tags: string[];
    site: string;
    testData: Record<string, any>;
}
/**
 * Collect test data from user input
 * @returns Promise resolving to test data or null if cancelled
 */
declare function collectTestData(): Promise<TestData | null>;
/**
 * Run the interactive test recorder
 * @param config - Framework configuration
 */
export declare function runInteractiveRecorder(config?: Partial<FrameworkConfig>): Promise<void>;
/**
 * Show browser popup notification when a step is successfully recorded
 */
declare function showStepRecordedNotification(framework: any, stepDescription: string, result: string): Promise<void>;
export { collectTestData, showStepRecordedNotification };
//# sourceMappingURL=interactive-recorder.d.ts.map