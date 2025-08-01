/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Re-export and backward compatibility layer
 */

import { BrowserEngine } from '../engines/browser-engine.js';
import { FrameworkManager } from '../../managers/system/framework-manager.js';
import { info, logSuccess, logWithIcon, LogLevel } from '../../core/logger.js';
import type {
  FrameworkConfig,
  TaskResult,
  TestConfig,
  TestReport,
  TestSession,
} from '../../types/index.js';

/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Provides backward compatibility while using the new modular architecture
 */
export class EnhancedBrowserTestFramework {
  private frameworkManager: FrameworkManager;
  private browserEngine: BrowserEngine | null = null;

  constructor(config: Partial<FrameworkConfig> = {}) {
    this.frameworkManager = new FrameworkManager(config);
  }

  /**
   * Initialize framework
   */
  async initialize(): Promise<void> {
    // Only initialize if not already initialized
    if (this.browserEngine) {
      info('Framework already initialized, reusing existing instance', {}, 'EnhancedBrowserTestFramework');
      return;
    }

    logWithIcon(LogLevel.INFO, 'rocket', 'Initializing Enhanced Browser Test Framework', {}, 'EnhancedBrowserTestFramework');

    // Create and initialize browser engine
    this.browserEngine = this.frameworkManager.createBrowserEngine(this);
    await this.browserEngine.initialize();

    logSuccess('Framework initialized successfully', {}, 'EnhancedBrowserTestFramework');
  }

  /**
   * Run a single task
   */
  async runTask(taskDescription: string, testName: string | null = null): Promise<TaskResult> {
    if (!this.browserEngine) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }
    return await this.browserEngine.runTask(taskDescription, testName);
  }

  /**
   * Run multiple tasks
   */
  async runMultipleTasks(
    tasks: Array<{ name?: string; description: string }>
  ): Promise<TaskResult[]> {
    if (!this.browserEngine) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }

    logWithIcon(LogLevel.INFO, 'rocket', `Running ${tasks.length} tasks sequentially`, { taskCount: tasks.length }, 'EnhancedBrowserTestFramework');

    const results: TaskResult[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskName = task.name || `Task-${i + 1}`;

      const result = await this.browserEngine.runTask(task.description, taskName);
      results.push(result);

      // Add delay between tasks
      if (i < tasks.length - 1) {
        info('Waiting before next task', { currentTask: i + 1, totalTasks: tasks.length }, 'EnhancedBrowserTestFramework');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Run a single test
   */
  async runSingleTest(
    test: TestConfig
  ): Promise<{ success: boolean; session?: any; error?: string }> {
    if (!this.browserEngine) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }
    return await this.browserEngine.runSingleTest(test);
  }

  /**
   * Run multiple tests
   */
  async runMultipleTests(tests: TestConfig[]): Promise<{
    results: Array<{
      testId: string;
      testName: string;
      success: boolean;
      error?: string;
      session?: any;
    }>;
    report: TestReport;
  }> {
    if (!this.browserEngine) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }

    logWithIcon(LogLevel.INFO, 'target', `Running ${tests.length} tests with enhanced result tracking`, { testCount: tests.length }, 'EnhancedBrowserTestFramework');
    const results: Array<{
      testId: string;
      testName: string;
      success: boolean;
      error?: string;
      session?: any;
    }> = [];

    for (const test of tests) {
      const result = await this.browserEngine.runSingleTest(test);
      results.push({
        testId: test.id,
        testName: test.name,
        ...result,
      });

      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Use framework manager for report generation only
    return await this.frameworkManager.generateTestReport(results);
  }

  /**
   * Enable interactive mode
   */
  async enableInteractiveMode(): Promise<void> {
    await this.frameworkManager.enableInteractiveMode();
    if (this.browserEngine) {
      await this.browserEngine.enableInteractiveMode();
    }
  }

  /**
   * Disable interactive mode
   */
  disableInteractiveMode(): void {
    this.frameworkManager.disableInteractiveMode();
    if (this.browserEngine) {
      this.browserEngine.disableInteractiveMode();
    }
  }

  /**
   * Set interactive mode
   */
  setInteractiveMode(interactive: boolean): void {
    this.frameworkManager.setInteractiveMode(interactive);
    if (this.browserEngine) {
      this.browserEngine.setInteractiveMode(interactive);
    }
  }

  /**
   * Cleanup framework resources
   */
  async cleanup(): Promise<void> {
    if (this.browserEngine) {
      await this.browserEngine.cleanup();
      this.browserEngine = null;
    }
  }

  // Getters for backward compatibility
  get currentPage() {
    return this.browserEngine?.currentPage || null;
  }

  get currentBrowser() {
    return this.browserEngine?.currentBrowser || null;
  }

  get currentContext() {
    return this.browserEngine?.currentContext || null;
  }

  get activeTestSession(): TestSession | null {
    return this.browserEngine?.activeTestSession || null;
  }

  get frameworkConfig(): FrameworkConfig {
    return this.frameworkManager.getConfig();
  }

  getBrowserManager() {
    return this.browserEngine?.getBrowserManager() || null;
  }

  getSnapshotManager() {
    return this.browserEngine?.getSnapshotManager() || null;
  }

  // Framework manager methods
  getFrameworkManager(): FrameworkManager {
    return this.frameworkManager;
  }

  getBrowserEngine(): BrowserEngine | null {
    return this.browserEngine;
  }

  getConfig(): FrameworkConfig {
    return this.frameworkManager.getConfig();
  }

  updateConfig(updates: Partial<FrameworkConfig>): void {
    this.frameworkManager.updateConfig(updates);
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    return this.frameworkManager.validateConfig();
  }

  getStatistics() {
    return this.frameworkManager.getStatistics();
  }

  getDirectories() {
    return this.frameworkManager.getDirectories();
  }

  // Delegator methods for tools compatibility
  logTestStep(
    stepDescription: string,
    toolName: string | null = null,
    toolArgs: any = null,
    result: string | null = null,
    isSuccess: boolean = true,
    screenshots: string[] = []
  ): void {
    if (this.browserEngine) {
      this.browserEngine.logTestStep(stepDescription, toolName, toolArgs, result, isSuccess, screenshots);
    }
  }

  async takeStepScreenshot(description: string | null = null): Promise<string | null> {
    if (this.browserEngine) {
      return await this.browserEngine.takeStepScreenshot(description);
    }
    return null;
  }

  async createTestSession(testName: string, testId: string | null = null) {
    if (this.browserEngine) {
      return await this.browserEngine.createTestSession(testName, testId);
    }
    return null;
  }
}

// Re-export for backward compatibility
export { BrowserEngine } from '../engines/browser-engine.js';
export { FrameworkManager } from '../../managers/system/framework-manager.js';
