/**
 * Complete Thread-Safe Context Isolation System
 * Ensures all test execution components are isolated between parallel workers
 */

import { AsyncLocalStorage } from 'async_hooks';
import type { TestSession } from '../types/test.js';
import type { BrowserManager } from '../automation/browser/browser-manager.js';
import type { TokenTracker } from '../core/token-tracker.js';

// Complete test execution context with all necessary isolation
export interface TestExecutionContext {
  // Session isolation
  currentSession: TestSession | null;
  agentCallCounter: number;
  
  // Browser isolation
  browserManager: BrowserManager | null;
  currentUserId: string | null;
  
  // Token tracking isolation
  tokenTracker: TokenTracker | null;
  
  // Test data isolation
  setupData: any;
  generatedData: any;
  
  // Performance tracking isolation
  startTime: number;
  performanceMetrics: {
    testStartTime?: number;
    testEndTime?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
  
  // Validation isolation
  validationHistory: any[];
  
  // Report generation isolation
  reportData: any;
  
  // Test execution metadata
  testId: string;
  testName: string;
  isMultiUser: boolean;
  parallelWorkerIndex: number | undefined;
}

// Global context storage for complete isolation
const testExecutionContextStorage = new AsyncLocalStorage<TestExecutionContext>();

/**
 * Create a new isolated test execution context
 */
export function createTestExecutionContext(
  testId: string,
  testName: string,
  isMultiUser: boolean = false,
  parallelWorkerIndex?: number
): TestExecutionContext {
  return {
    currentSession: null,
    agentCallCounter: 0,
    browserManager: null,
    currentUserId: null,
    tokenTracker: null,
    setupData: null,
    generatedData: null,
    startTime: Date.now(),
    performanceMetrics: {
      testStartTime: Date.now(),
    },
    validationHistory: [],
    reportData: null,
    testId,
    testName,
    isMultiUser,
    parallelWorkerIndex,
  };
}

/**
 * Run function within complete test execution context isolation
 */
export function runWithTestExecutionContext<T>(
  testId: string,
  testName: string,
  isMultiUser: boolean = false,
  parallelWorkerIndex: number | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const context = createTestExecutionContext(testId, testName, isMultiUser, parallelWorkerIndex);
  
  console.log(`🔒 [${parallelWorkerIndex ? `Worker ${parallelWorkerIndex + 1}` : 'Sequential'}] Creating isolated context for test: ${testId}`);
  
  return testExecutionContextStorage.run(context, async () => {
    try {
      return await fn();
    } catch (error) {
      console.error(`❌ [${parallelWorkerIndex ? `Worker ${parallelWorkerIndex + 1}` : 'Sequential'}] Test execution failed in isolated context: ${testId}`, error);
      throw error;
    }
  });
}

/**
 * Get current test execution context (thread-safe)
 */
export function getCurrentTestExecutionContext(): TestExecutionContext | undefined {
  return testExecutionContextStorage.getStore();
}

/**
 * Update current session in context
 */
export function setContextSession(session: TestSession | null): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.currentSession = session;
    context.agentCallCounter = 0;
  }
}

/**
 * Update browser manager in context
 */
export function setContextBrowserManager(browserManager: BrowserManager | null): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.browserManager = browserManager;
  }
}

/**
 * Update current user ID in context
 */
export function setContextCurrentUserId(userId: string | null): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.currentUserId = userId;
  }
}

/**
 * Update token tracker in context
 */
export function setContextTokenTracker(tokenTracker: TokenTracker | null): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.tokenTracker = tokenTracker;
  }
}

/**
 * Update test setup data in context
 */
export function setContextSetupData(data: any): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.setupData = data;
  }
}

/**
 * Update generated test data in context
 */
export function setContextGeneratedData(data: any): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.generatedData = data;
  }
}

/**
 * Update performance metrics in context
 */
export function updateContextPerformanceMetrics(metrics: Partial<TestExecutionContext['performanceMetrics']>): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.performanceMetrics = {
      ...context.performanceMetrics,
      ...metrics,
    };
  }
}

/**
 * Add validation history entry in context
 */
export function addContextValidationHistory(entry: any): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.validationHistory.push(entry);
  }
}

/**
 * Update report data in context
 */
export function setContextReportData(data: any): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.reportData = data;
  }
}

/**
 * Get context-safe agent call counter
 */
export function _getContextAgentCallCounter(): number {
  const context = getCurrentTestExecutionContext();
  return context?.agentCallCounter || 0;
}

/**
 * Increment context-safe agent call counter
 */
export function incrementContextAgentCallCounter(): number {
  const context = getCurrentTestExecutionContext();
  if (context) {
    context.agentCallCounter++;
    return context.agentCallCounter;
  }
  return 0;
}

/**
 * Get context-safe current session
 */
export function getContextCurrentSession(): TestSession | null {
  const context = getCurrentTestExecutionContext();
  return context?.currentSession || null;
}

/**
 * Get context-safe browser manager
 */
export function getContextBrowserManager(): BrowserManager | null {
  const context = getCurrentTestExecutionContext();
  return context?.browserManager || null;
}

/**
 * Get context-safe current user ID
 */
export function getContextCurrentUserId(): string | null {
  const context = getCurrentTestExecutionContext();
  return context?.currentUserId || null;
}

/**
 * Get context-safe token tracker
 */
export function getContextTokenTracker(): TokenTracker | null {
  const context = getCurrentTestExecutionContext();
  return context?.tokenTracker || null;
}

/**
 * Get context-safe setup data
 */
export function getContextSetupData(): any {
  const context = getCurrentTestExecutionContext();
  return context?.setupData || null;
}

/**
 * Get context-safe generated data
 */
export function getContextGeneratedData(): any {
  const context = getCurrentTestExecutionContext();
  return context?.generatedData || null;
}

/**
 * Get context-safe performance metrics
 */
export function getContextPerformanceMetrics(): TestExecutionContext['performanceMetrics'] {
  const context = getCurrentTestExecutionContext();
  return context?.performanceMetrics || {};
}

/**
 * Get context-safe validation history
 */
export function getContextValidationHistory(): any[] {
  const context = getCurrentTestExecutionContext();
  return context?.validationHistory || [];
}

/**
 * Get context-safe report data
 */
export function getContextReportData(): any {
  const context = getCurrentTestExecutionContext();
  return context?.reportData || null;
}

/**
 * Get context-safe test metadata
 */
export function getContextTestMetadata(): { testId: string; testName: string; isMultiUser: boolean; parallelWorkerIndex: number | undefined } | null {
  const context = getCurrentTestExecutionContext();
  if (!context) return null;
  
  return {
    testId: context.testId,
    testName: context.testName,
    isMultiUser: context.isMultiUser,
    parallelWorkerIndex: context.parallelWorkerIndex,
  };
}

/**
 * Debug function to log current context state
 */
export function debugContextState(): void {
  const context = getCurrentTestExecutionContext();
  if (context) {
    console.log(`🔍 Context Debug [${context.parallelWorkerIndex ? `Worker ${context.parallelWorkerIndex + 1}` : 'Sequential'}]:`, {
      testId: context.testId,
      testName: context.testName,
      isMultiUser: context.isMultiUser,
      hasSession: !!context.currentSession,
      hasBrowserManager: !!context.browserManager,
      hasTokenTracker: !!context.tokenTracker,
      agentCallCounter: context.agentCallCounter,
      currentUserId: context.currentUserId,
      validationHistoryLength: context.validationHistory.length,
    });
  } else {
    console.log('🔍 Context Debug: No context found');
  }
}