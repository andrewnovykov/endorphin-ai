/**
 * Test configuration and test-related types
 */

import type { ToolCall } from './agent';
import type { Screenshot } from './browser';

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  site: string;
  testData?: Record<string, any>;
  task: string;
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
  stepCounter: number;
  screenshotCounter: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  finalResult?: string;
  duration?: number;
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
  testName: string;
  task: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  result?: string;
  error?: string;
  duration: number;
  sessionDir: string;
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
}
