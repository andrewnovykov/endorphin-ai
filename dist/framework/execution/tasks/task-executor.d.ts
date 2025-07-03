/**
 * Task Executor Module
 * Executes AI-driven test tasks and manages test execution lifecycle
 */
import type { TaskResult, TestSession } from '../../types/index.js';
interface TaskDescription {
    name: string;
    description: string;
}
interface FrameworkInstance {
    createTestSession(name: string, id: string): TestSession;
    currentTestSession: TestSession | null;
    logTestStep(description: string, toolName: string | null, toolArgs: any, result: string, success: boolean): void;
    takeStepScreenshot(description: string): Promise<void>;
    finishTestSession(status: 'SUCCESS' | 'FAILED', result: string): Promise<void>;
    agent: {
        invoke(input: any, config: any): Promise<any>;
    };
}
/**
 * Run a test task using the AI agent
 * @param framework - Framework instance
 * @param taskDescription - Description of the task to perform
 * @param testName - Optional test name
 * @returns Test result
 */
export declare function runTask(framework: FrameworkInstance, taskDescription: string, testName?: string | null): Promise<TaskResult>;
/**
 * Run multiple test tasks in sequence
 * @param framework - Framework instance
 * @param tasks - Array of task objects {name, description}
 * @returns Array of test results
 */
export declare function runTaskSequence(framework: FrameworkInstance, tasks: TaskDescription[]): Promise<TaskResult[]>;
export {};
//# sourceMappingURL=task-executor.d.ts.map