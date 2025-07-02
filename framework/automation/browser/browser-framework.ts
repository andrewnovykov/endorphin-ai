/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Re-export and backward compatibility layer
 */

import { BrowserEngine } from '../engines/browser-engine.js';
import { FrameworkManager } from '../../managers/system/framework-manager.js';
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
    console.log('🚀 Initializing Enhanced Browser Test Framework...');

    // Create and initialize browser engine
    this.browserEngine = this.frameworkManager.createBrowserEngine(this);
    await this.browserEngine.initialize();

    console.log('✅ Framework initialized successfully!');
  }

  /**
   * Run a single task
   */
  async runTask(taskDescription: string, testName: string | null = null): Promise<TaskResult> {
    return await this.frameworkManager.runTask(taskDescription, testName);
  }

  /**
   * Run multiple tasks
   */
  async runMultipleTasks(
    tasks: Array<{ name?: string; description: string }>
  ): Promise<TaskResult[]> {
    return await this.frameworkManager.runMultipleTasks(tasks);
  }

  /**
   * Run a single test
   */
  async runSingleTest(
    test: TestConfig
  ): Promise<{ success: boolean; session?: any; error?: string }> {
    return await this.frameworkManager.runSingleTest(test);
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
    return await this.frameworkManager.runMultipleTests(tests);
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
    isSuccess: boolean = true
  ): void {
    if (this.browserEngine) {
      this.browserEngine.logTestStep(stepDescription, toolName, toolArgs, result, isSuccess);
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
