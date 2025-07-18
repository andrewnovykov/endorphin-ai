/**
 * Test configuration and test-related types
 */

import type { ToolCall } from './agent.js';
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
 * Multi-user test tasks function signature
 * Executes with generated data, setup data, and users array, returns user-specific task descriptions
 */
export type TestTasksFunction = (
  data?: any,
  setupData?: any,
  users?: string[]
) => Promise<Record<string, string>> | Record<string, string>;

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
  url?: string; // Optional URL for navigation
  site?: string; // Keep for backward compatibility
  testData?: Record<string, any>; // Keep for backward compatibility
  data?: TestDataFunction | Record<string, any>; // New async data generation or static data
  setup?: TestSetupFunction; // Optional test-level setup function
  task?: string | TestTaskFunction; // Support both string and function-based tasks (single-user)
  users?: string[]; // Array of user IDs for multi-user tests (max 5)
  tasks?: TestTasksFunction; // Multi-user tasks function that returns user-specific task descriptions
}

// Test Case interface for test recorder generated files
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
  agentHistory: AgentHistoryEntry[]; // AI decision process tracking
  stepCounter: number;
  screenshotCounter: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
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
  setupResult?: TestSetupResult; // Test setup execution result
  dataGenerationResult?: DataGenerationResult; // Test data generation execution result
  // Enhanced retry and flaky test tracking
  attempts?: TestAttempt[];
  totalAttempts?: number;
  passedAttempts?: number;
  failedAttempts?: number;
  isFlaky?: boolean;
  isQuarantined?: boolean;
  isSkipped?: boolean;
  skipReason?: string;
  // Performance metrics
  performanceMetrics?: PerformanceMetrics;
}

export interface AgentHistoryEntry {
  historyId: number;
  timestamp: string;
  thinking: string; // What the agent was thinking about
  prompt: string; // The actual prompt sent to the AI
  response: string; // The AI's response
  userId?: string | undefined; // For multi-user tests, identifies which user/agent this belongs to
  tokenUsage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
    cost: number;
    model: string;
  };
  duration: number; // How long the AI call took
  context?: string; // Additional context about what triggered this AI call
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
  userId?: string | undefined; // For multi-user tests, identifies which user this step belongs to
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
  status: 'passed' | 'failed' | 'skipped' | 'quarantined';
  duration: number;
  error?: string;
  screenshots: string[];
  logs: string[];
  timestamp: string;
  // Enhanced retry and flaky test tracking
  attempts?: TestAttempt[];
  totalAttempts?: number;
  passedAttempts?: number;
  failedAttempts?: number;
  isFlaky?: boolean;
  isQuarantined?: boolean;
  skipReason?: string;
  // Performance metrics
  performanceMetrics?: PerformanceMetrics;
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

/**
 * Individual test attempt result
 */
export interface TestAttempt {
  attemptNumber: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: string;
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Performance metrics for test execution
 */
export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: {
    start: NodeJS.MemoryUsage;
    end: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
    samples: MemorySample[];
  };
  cpuUsage: {
    start: NodeJS.CpuUsage;
    end: NodeJS.CpuUsage;
    samples: CpuSample[];
  };
  browserProcessMetrics?: {
    startTime: number;
    endTime: number;
    duration: number;
    samples: Array<{
      timestamp: number;
      processes: Array<{
        pid: number;
        name: string;
        cpu: number;
        memory: number;
        parent?: number;
      }>;
      totalMemory: number;
      totalCpu: number;
    }>;
    peakMemory: number;
    avgMemory: number;
    peakCpu: number;
    avgCpu: number;
    processCount: number;
  };
}

/**
 * Memory usage sample during test execution
 */
export interface MemorySample {
  timestamp: number;
  usage: NodeJS.MemoryUsage;
}

/**
 * CPU usage sample during test execution
 */
export interface CpuSample {
  timestamp: number;
  usage: NodeJS.CpuUsage;
}

/**
 * Enhanced test execution result with retry and flaky test tracking
 */
export interface EnhancedTestResult extends TestResult {
  attempts: TestAttempt[];
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  isFlaky: boolean;
  isQuarantined: boolean;
  skipReason?: string;
  performanceMetrics: PerformanceMetrics;
}

/**
 * Test suite execution summary
 */
export interface TestSuiteSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  quarantinedTests: number;
  flakyTests: number;
  totalDuration: number;
  startTime: string;
  endTime: string;
  performanceMetrics: PerformanceMetrics;
}
