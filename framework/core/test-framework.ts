/**
 * Test Framework - Core Framework Class (TypeScript)
 * Orchestrates browser lifecycle, tool setup, and test session management
 */

import { HumanMessage } from '@langchain/core/messages';
import * as path from 'node:path';
import { HtmlReporter } from '../reporters/html-reporter.js';
import { TestResultsManager } from '../results/test-results-manager.js';
import type {
  AgentInvokeParams,
  AgentResponse,
  LangChainAgent,
  LangChainTool,
} from '../ai/types/agent.js';
import { TestTimeoutError } from '../types/errors.js';
import type {
  DataGenerationResult,
  FrameworkConfig,
  NaturalLanguageResult,
  TaskResult,
  TestConfig,
  TestSession,
  TestSetupResult,
} from '../types/index.js';
import { setupAgent } from '../ai/agent-setup.js';
import { globalLogger } from './logger.js';
import { PageSnapshotManager } from '../managers/content/snapshot-manager.js';
import { ResourceManager, globalResourceManager } from './resource-manager.js';
import { TokenTracker } from './token-tracker.js';

// Import the new service classes
import { BrowserManager } from '../automation/browser/browser-manager.js';
import { ConfigManager } from './config-manager.js';
import { DebugManager, createDebugManager } from './debug-manager.js';
import { GlobalSetupManager } from './global-setup-manager.js';
import { SessionManager } from './session-manager.js';
import { ToolManager } from './tool-manager.js';

/**
 * Test Framework - Core Framework Class
 * Orchestrates browser lifecycle, tool setup, and test session management using dedicated service managers
 */
export class TestFramework {
  // Service managers
  private configManager: ConfigManager;
  private browserManager: BrowserManager;
  private sessionManager: SessionManager;
  private toolManager: ToolManager;
  private globalSetupManager: GlobalSetupManager;
  private debugManager: DebugManager;

  // Core framework components
  private agent: LangChainAgent | null = null;
  private resultsManager: TestResultsManager;
  private isInteractiveMode: boolean = false;
  private tokenTracker: TokenTracker;
  private snapshotManager: PageSnapshotManager;
  private resourceManager: ResourceManager;
  private logger = globalLogger.createChild('TestFramework');

  constructor(config: Partial<FrameworkConfig> = {}) {
    this.logger.info('Initializing Test Framework');

    // Initialize configuration manager
    this.configManager = new ConfigManager(config);
    const frameworkConfig = this.configManager.getConfig();

    // Initialize browser manager
    this.browserManager = new BrowserManager({
      browser: this.configManager.getBrowserConfig(),
    });

    // Setup result directories
    const directories = this.configManager.getDirectories();
    const resultBaseDir = path.resolve(process.cwd(), directories.results);
    const recorderBaseDir = path.join(process.cwd(), 'test-recorder');

    // Initialize session manager
    this.sessionManager = new SessionManager({
      resultBaseDir,
      recorderBaseDir,
      enableRecorderCopy: false, // Will be set to true in interactive mode
    });

    // Initialize tool manager
    this.toolManager = new ToolManager(frameworkConfig);

    // Initialize global setup manager
    this.globalSetupManager = new GlobalSetupManager();

    // Initialize debug manager
    this.debugManager = createDebugManager(this);

    // Initialize results manager
    this.resultsManager = new TestResultsManager({
      resultsDir: resultBaseDir,
      recorderDir: recorderBaseDir,
      enableRecorderCopy: false, // Will be set to true in interactive mode
    });

    // Initialize token tracker with custom pricing if provided
    this.tokenTracker = new TokenTracker(
      frameworkConfig.ai?.openai?.modelName || 'gpt-4o',
      frameworkConfig.pricing
    );

    // Initialize page snapshot manager
    this.snapshotManager = new PageSnapshotManager();

    // Initialize resource manager for memory leak prevention
    this.resourceManager = globalResourceManager;

    this.logger.info('Test Framework initialized successfully');
  }

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    this.logger.info('Starting framework initialization');

    try {
      // Execute global setup first if configured
      await this.executeGlobalSetup();

      // Initialize session manager (directories, cleanup)
      await this.sessionManager.initialize();

      // Initialize browser
      await this.browserManager.initialize();

      // Setup tools
      const tools = await this.toolManager.setupTools(this);

      // Update debug manager with tools
      this.debugManager.updateTools(tools);

      // Setup AI agent
      await this.setupAgent(tools);

      this.logger.info('Framework initialization completed successfully');
    } catch (error: any) {
      this.logger.error('Framework initialization failed', error);
      throw error;
    }
  }

  /**
   * Execute global setup if configured
   */
  private async executeGlobalSetup(): Promise<void> {
    const config = this.configManager.getConfig();

    if (!config.globalSetup) {
      this.logger.debug('No global setup configured, skipping');
      return;
    }

    this.logger.info(`Executing global setup: ${config.globalSetup}`);

    try {
      const result = await this.globalSetupManager.loadAndExecute(config.globalSetup);

      if (!result.success) {
        const errorMessage = `Global setup failed: ${result.error?.message || 'Unknown error'}`;
        this.logger.error(errorMessage, result.error);
        throw new Error(errorMessage);
      }

      this.logger.info(`Global setup completed successfully in ${result.executionTime}ms`);
    } catch (error: any) {
      this.logger.error('Global setup execution failed', error);
      throw new Error(`Global setup failed: ${error.message}`);
    }
  }

  /**
   * Run a test with the given configuration
   */
  async runTest(testConfig: TestConfig): Promise<TaskResult> {
    this.logger.info(`Running test: ${testConfig.name}`, {
      testId: testConfig.id,
      url: testConfig.url,
    });

    try {
      // Create test session
      const session = await this.sessionManager.createSession(testConfig.name, testConfig.id);

      // Update debug manager with new session
      this.debugManager.updateSession(session);

      // Execute test setup if provided
      if (testConfig.setup) {
        try {
          await this.executeTestSetup(testConfig, session);
        } catch (error) {
          // Setup errors are already logged and stored in session by executeTestSetup
          this.logger.warn('Test setup failed, continuing with test execution', {
            testId: testConfig.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Execute data generation if provided
      if (testConfig.data && typeof testConfig.data === 'function') {
        try {
          await this.executeDataGeneration(testConfig, session);
        } catch (error) {
          // Data generation errors are already logged and stored in session by executeDataGeneration
          this.logger.warn('Data generation failed, continuing with test execution', {
            testId: testConfig.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Navigate to test URL
      if (testConfig.url) {
        await this.browserManager.navigateToUrl(testConfig.url);
      }

      // Execute test instructions
      const result = await this.executeTest(testConfig, session);

      // Complete session
      await this.sessionManager.completeSession(
        (result as any).success || false,
        result.error,
        (result as any).report
      );

      this.logger.info(`Test completed: ${(result as any).success ? 'SUCCESS' : 'FAILED'}`, {
        testId: testConfig.id,
        duration: result.duration,
      });

      return result;
    } catch (error: any) {
      this.logger.error('Test execution failed', error, {
        testId: testConfig.id,
        testName: testConfig.name,
      });

      // Complete session with error
      await this.sessionManager.completeSession(false, error.message);

      throw error;
    }
  }

  /**
   * Execute natural language instruction
   */
  async executeNaturalLanguageInstruction(instruction: string): Promise<NaturalLanguageResult> {
    this.logger.info('Executing natural language instruction', { instruction });

    try {
      const startTime = Date.now();

      if (!this.agent) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }

      // Get optimized page content for AI context
      const optimizedContent = await this.getOptimizedPageContent();

      // Create enhanced prompt with context
      const enhancedPrompt = this.createEnhancedPrompt(instruction, optimizedContent);

      // Execute with timeout and tracking
      const result = await this.executeWithTimeout(
        () => this.invokeAgent(enhancedPrompt),
        this.configManager.getExecutionConfig().timeout
      );

      const duration = Date.now() - startTime;

      this.logger.info('Natural language instruction completed', {
        instruction,
        duration,
        success: result.success,
      });

      return {
        result: result.output || '',
        error: result.error,
        duration,
        tokenUsage: this.tokenTracker.getSessionSummary(),
      } as any;
    } catch (error: any) {
      this.logger.error('Natural language instruction failed', error, { instruction });

      return {
        result: '',
        error: error.message,
        duration: 0,
        tokenUsage: this.tokenTracker.getSessionSummary(),
      };
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(filename?: string): Promise<string> {
    try {
      const session = this.sessionManager.getCurrentSession();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = filename || `screenshot-${timestamp}.png`;

      let screenshotPath: string;

      if (session) {
        screenshotPath = path.join(session.sessionDir, screenshotName);
      } else {
        screenshotPath = path.join(process.cwd(), 'screenshots', screenshotName);
      }

      await this.browserManager.takeScreenshot({ path: screenshotPath });

      this.logger.debug('Screenshot captured', { path: screenshotPath });

      return screenshotPath;
    } catch (error: any) {
      this.logger.error('Failed to take screenshot', error);
      throw error;
    }
  }

  /**
   * Generate HTML report
   */
  async generateReport(title?: string): Promise<string> {
    this.logger.info('Generating HTML report');

    try {
      const reporter = new HtmlReporter();
      const reportPath = await reporter.generateReport(title ? ({ title } as any) : undefined);

      this.logger.info('HTML report generated', { path: reportPath });

      return reportPath;
    } catch (error: any) {
      this.logger.error('Failed to generate report', error);
      throw error;
    }
  }

  /**
   * Cleanup framework resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Starting framework cleanup');

    try {
      // Close session
      this.sessionManager.closeSession();

      // Clear debug session
      this.debugManager.updateSession(null);

      // Cleanup browser
      await this.browserManager.cleanup();

      // Dispose resource manager
      await this.resourceManager.disposeAll();

      this.logger.info('Framework cleanup completed');
    } catch (error: any) {
      this.logger.error('Error during framework cleanup', error);
    }
  }

  /**
   * Get framework status
   */
  getStatus() {
    return {
      initialized: this.browserManager.isInitialized() && this.agent !== null,
      hasActiveSession: this.sessionManager.hasActiveSession(),
      toolCount: this.toolManager.getToolCount(),
      tokenUsage: this.tokenTracker.getSessionSummary(),
      currentUrl: this.browserManager.isInitialized() ? this.browserManager.getCurrentUrl() : null,
    };
  }

  // Getters for accessing managers (for backward compatibility and advanced usage)

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  getBrowserManager(): BrowserManager {
    return this.browserManager;
  }

  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  getToolManager(): ToolManager {
    return this.toolManager;
  }

  getTokenTracker(): TokenTracker {
    return this.tokenTracker;
  }

  getSnapshotManager(): PageSnapshotManager {
    return this.snapshotManager;
  }

  getDebugManager(): DebugManager {
    return this.debugManager;
  }

  // Legacy methods for backward compatibility

  /**
   * @deprecated Use browserManager.getPage() instead
   */
  getPage() {
    return this.browserManager.getPage();
  }

  /**
   * @deprecated Use configManager.getConfig() instead
   */
  getConfig(): FrameworkConfig {
    return this.configManager.getConfig();
  }

  /**
   * @deprecated Use toolManager.getTools() instead
   */
  getTools(): LangChainTool[] {
    return this.toolManager.getTools();
  }

  // Private methods

  private async setupAgent(tools: LangChainTool[]): Promise<void> {
    this.logger.debug('Setting up AI agent');

    try {
      const aiConfig = this.configManager.getAIConfig();
      this.agent = await setupAgent(tools);

      this.logger.info('AI agent setup completed', {
        toolCount: tools.length,
        model: aiConfig.openai.modelName,
      });
    } catch (error: any) {
      this.logger.error('Failed to setup agent', error);
      throw error;
    }
  }

  /**
   * Execute test-level setup function
   */
  private async executeTestSetup(testConfig: TestConfig, _session: TestSession): Promise<void> {
    if (!testConfig.setup) {
      return;
    }

    this.logger.info(`Executing test setup for: ${testConfig.name}`, {
      testId: testConfig.id,
    });

    const startTime = Date.now();

    try {
      // Execute the setup function
      const setupData = await testConfig.setup();
      const executionTime = Date.now() - startTime;

      // Store setup result in session
      const setupResult: TestSetupResult = {
        success: true,
        data: setupData,
        executionTime,
      };

      // Update session with setup result
      await this.sessionManager.updateSessionSetup(setupResult);

      this.logger.info(`Test setup completed successfully in ${executionTime}ms`, {
        testId: testConfig.id,
        hasData: !!setupData,
      });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Store setup error in session
      const setupResult: TestSetupResult = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime,
      };

      // Update session with setup result
      await this.sessionManager.updateSessionSetup(setupResult);

      this.logger.error(`Test setup failed after ${executionTime}ms`, error);

      // Throw error to fail the test
      throw new Error(`Test setup failed: ${error.message}`);
    }
  }

  /**
   * Execute test-level data generation function
   */
  private async executeDataGeneration(testConfig: TestConfig, _session: TestSession): Promise<void> {
    if (!testConfig.data || typeof testConfig.data !== 'function') {
      return;
    }

    this.logger.info(`Executing data generation for: ${testConfig.name}`, {
      testId: testConfig.id,
    });

    const startTime = Date.now();

    try {
      // Execute the data generation function
      const generatedData = await testConfig.data();
      const executionTime = Date.now() - startTime;

      // Store data generation result in session
      const dataResult: DataGenerationResult = {
        success: true,
        data: generatedData,
        executionTime,
        // Token usage will be tracked if the data function uses AI services
        tokenUsage: this.tokenTracker.getSessionSummary() as any,
      };

      // Update session with data generation result
      await this.sessionManager.updateSessionDataGeneration(dataResult);

      this.logger.info(`Data generation completed successfully in ${executionTime}ms`, {
        testId: testConfig.id,
        hasData: !!generatedData,
        dataSize: typeof generatedData === 'object' ? Object.keys(generatedData).length : 1,
      });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Store data generation error in session
      const dataResult: DataGenerationResult = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime,
      };

      // Update session with data generation result
      await this.sessionManager.updateSessionDataGeneration(dataResult);

      this.logger.error(`Data generation failed after ${executionTime}ms`, error);

      // Throw error to fail the test
      throw new Error(`Data generation failed: ${error.message}`);
    }
  }

  private async executeTest(testConfig: TestConfig, _session: TestSession): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      // Execute test instructions
      const result = await this.executeNaturalLanguageInstruction(testConfig.task);

      const duration = Date.now() - startTime;

      const taskResult: TaskResult = {
        success: (result as any).success,
        duration,
        report: {
          testName: testConfig.name,
          testId: testConfig.id || 'unknown',
          success: (result as any).success,
          duration,
          timestamp: new Date().toISOString(),
        },
        tokenUsage: result.tokenUsage,
      };

      // Only add error if it exists
      if (result.error) {
        taskResult.error = result.error;
        taskResult.report.error = result.error;
      }

      return taskResult;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration,
        report: {
          testName: testConfig.name,
          testId: testConfig.id || 'unknown',
          success: false,
          duration,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        tokenUsage: this.tokenTracker.getSessionSummary(),
      };
    }
  }

  private async getOptimizedPageContent(): Promise<string> {
    if (!this.browserManager.isInitialized()) {
      return '';
    }

    try {
      const page = this.browserManager.getPage();
      const url = page.url();

      return await this.snapshotManager.createSnapshot(page, url);
    } catch (error: any) {
      this.logger.warn('Failed to get optimized page content', error);
      return '';
    }
  }

  private createEnhancedPrompt(instruction: string, pageContent: string): string {
    const basePrompt = `You are a web automation expert. Execute the following instruction on the current web page.

Current page content (optimized for AI context):
${pageContent}

Instruction: ${instruction}

Use the available tools to complete this task. Be precise and efficient.`;

    return basePrompt;
  }

  private async invokeAgent(prompt: string): Promise<AgentResponse> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    const message = new HumanMessage(prompt);
    const params: AgentInvokeParams = { messages: [message] };

    // Track token usage
    const startTime = Date.now();

    try {
      const response = await this.agent.invoke(params);
      const _duration = Date.now() - startTime;

      // Track tokens (estimation for now)
      this.tokenTracker.recordUsage(
        Math.ceil(prompt.length / 4), // Rough token estimation
        Math.ceil((response.output || '').length / 4),
        this.configManager.getAIConfig().openai.modelName
      );

      return {
        success: true,
        output: response.output || '',
      };
    } catch (error: any) {
      this.logger.error('Agent invocation failed', error);

      return {
        success: false,
        output: '',
        error: error.message,
      };
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>, timeout: number): Promise<T> {
    const controllerId = `timeout-${Date.now()}`;
    const abortController = this.resourceManager.createAbortController(controllerId);

    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            abortController.abort();
            reject(new TestTimeoutError(`Operation timed out after ${timeout}ms`));
          }, timeout);

          abortController.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
          });
        }),
      ]);
    } finally {
      this.resourceManager.disposeAbortController(controllerId);
    }
  }
}

// Re-export for backward compatibility
export { TestFramework as EnhancedBrowserTestFramework };
