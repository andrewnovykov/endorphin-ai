/**
 * Test configuration and test-related types
 */
import type { ToolCall } from '../ai/types/agent.js';
import type { Screenshot } from './browser';
/**
 * Test setup function signature
 * Executes before the test case, can return data for the test
 */
export type TestSetupFunction = () => Promise<any>;
/**
 * Test setup execution result
 */
export interface TestSetupResult {
    success: boolean;
    data?: any;
    error?: Error;
    executionTime: number;
}
/**
 * Test data generation function signature
 * Executes to generate test data, returns generated data
 */
export type TestDataFunction = () => Promise<any>;
/**
 * Test task function signature
 * Executes with generated data and setup data, returns task description
 */
export type TestTaskFunction = (data?: any, setupData?: any) => Promise<string> | string;
/**
 * Test data generation execution result
 */
export interface DataGenerationResult {
    success: boolean;
    data?: any;
    error?: Error;
    executionTime: number;
    tokenUsage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
        cost: number;
        model: string;
    };
}
export interface TestConfig {
    id: string;
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    tags: string[];
    url?: string;
    site?: string;
    testData?: Record<string, any>;
    data?: TestDataFunction | Record<string, any>;
    setup?: TestSetupFunction;
    task: string | TestTaskFunction;
}
export interface TestCase extends TestConfig {
    recordingId?: string;
    recordedSteps?: number;
}
export interface TestSession {
    sessionId: string;
    sessionName: string;
    testId: string;
    testName: string;
    startTime: string;
    endTime?: string;
    sessionDir: string;
    screenshotsDir: string;
    steps: TestStep[];
    toolCalls: ToolCall[];
    stepCounter: number;
    screenshotCounter: number;
    status: 'RUNNING' | 'SUCCESS' | 'FAILED';
    finalResult?: string;
    conclusion?: string;
    duration?: number;
    tokenSummary?: {
        totalTokens: number;
        totalCost: number;
        aiCalls: number;
        avgTokensPerCall: number;
        model: string;
    };
    setupResult?: TestSetupResult;
    dataGenerationResult?: DataGenerationResult;
}
export interface TestStep {
    stepNumber: number;
    timestamp: string;
    description: string;
    toolName?: string | null;
    toolArgs?: any;
    result?: string | null;
    status: 'SUCCESS' | 'FAILED';
    screenshots: Screenshot[];
    tokenUsage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
        cost: number;
        model: string;
    };
}
export interface TestResult {
    testId: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    screenshots: string[];
    logs: string[];
    timestamp: string;
}
export interface TaskResult {
    testName?: string;
    task?: string;
    timestamp?: string;
    status?: 'SUCCESS' | 'FAILED';
    result?: string;
    error?: string;
    duration: number;
    sessionDir?: string;
    success?: boolean;
    report?: any;
    tokenUsage?: any;
}
export interface DiscoveryResult {
    success: boolean;
    message?: string;
    error?: string;
    test?: TestConfig;
    tests?: TestConfig[];
    passed?: number;
    failed?: number;
    total?: number;
    skipped?: number | boolean;
}
export interface NaturalLanguageResult {
    result: string;
    error?: string;
    duration: number;
    tokenUsage?: any;
}
//# sourceMappingURL=test.d.ts.map