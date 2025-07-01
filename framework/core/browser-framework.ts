/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Handles browser lifecycle, tool setup, and test session management
 */

import { HumanMessage } from '@langchain/core/messages';
import * as fs from 'fs';
import { existsSync, readdirSync, rmSync, statSync } from 'fs';
import * as path from 'path';
import { Browser, BrowserContext, chromium, firefox, Page, webkit } from 'playwright';
import { AGENT_CONFIG } from '../config/agent-config.js';
import { TIMEOUTS } from '../config/constants.js';
import { HtmlReporter } from '../reporters/html-reporter.js';
import { TestResultsManager } from '../results/test-results-manager.js';
import { createAllTools } from '../tools/index.js';
import type {
  BrowserConfig,
  ClickParams,
  ExecutionConfig,
  FillParams,
  FrameworkConfig,
  NaturalLanguageResult,
  NavigateParams,
  ScreenshotParams,
  TaskResult,
  TestConfig,
  TestReport,
  TestSession,
  TestStep,
  ToolCall,
} from '../types/index.js';
import type { 
  LangChainAgent, 
  LangChainTool, 
  AgentResponse, 
  AgentInvokeParams 
} from '../types/agent.js';
import { 
  BrowserError, 
  AgentError, 
  TestTimeoutError,
  createErrorFromUnknown
} from '../types/errors.js';
import { setupAgent } from './agent-setup.js';
import { createTestSession, saveTestSession } from './test-session.js';
import { TokenTracker } from './token-tracker.js';
import { PageSnapshotManager } from './page-snapshot.js';
import { ResourceManager, globalResourceManager } from './resource-manager.js';

/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Handles browser lifecycle, tool setup, and test session management
 */
export class EnhancedBrowserTestFramework {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private agent: LangChainAgent | null = null;
  private toolsArray: LangChainTool[] = [];
  private resultsManager: TestResultsManager;
  private currentTestSession: TestSession | null = null;
  private resultBaseDir: string;
  private recorderBaseDir: string;
  private isInteractiveMode: boolean = false;
  private config: FrameworkConfig;
  private tokenTracker: TokenTracker;
  private snapshotManager: PageSnapshotManager;
  private resourceManager: ResourceManager;

  constructor(config: Partial<FrameworkConfig> = {}) {
    // Initialize configuration with defaults - deep merge to prevent issues
    const defaultConfig: FrameworkConfig = {
      browser: {
        type: 'chromium',
        headless: true,
        viewport: {
          width: 1280,
          height: 720,
        },
        timeout: 30000,
        slowMo: 0,
        devtools: false,
        recordVideo: false,
        recordHar: false,
      } as BrowserConfig,
      ai: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          modelName: 'gpt-4o',
          temperature: 0.1,
          maxTokens: 8000,
        },
        agent: {
          recursionLimit: 10,
          stopPhrases: ['test completed', 'task finished', 'done'],
        },
      },
      execution: {
        timeout: 30000,
        parallel: false,
        retries: 0,
      } as ExecutionConfig,
      testsDirectory: 'tests',
      dataDirectory: 'test-data',
      resultsDirectory: 'test-results',
      environment: 'development' as const,
      parallel: 1,
      maxRetries: 0,
    };

    // Deep merge: defaults first, then user config for nested objects
    this.config = {
      ...defaultConfig,
      ...config,
      browser: {
        ...defaultConfig.browser,
        ...(config.browser || {}),
      },
      ai: {
        ...defaultConfig.ai,
        ...(config.ai || {}),
      },
      execution: {
        timeout: config.execution?.timeout ?? 30000,
        parallel: config.execution?.parallel ?? false,
        retries: config.execution?.retries ?? 0,
      },
    };

    // Set result directory based on configuration
    // Use configured results directory or default to 'test-results' in current working directory
    const resultsDir = this.config.results?.directory || './test-results';
    this.resultBaseDir = path.resolve(process.cwd(), resultsDir);

    // Use current working directory (user project) for test-recorder, not framework root
    this.recorderBaseDir = path.join(process.cwd(), 'test-recorder');

    // Debug logging
    console.log(`🔧 Results config:`, this.config.results);
    console.log(`📁 Resolved results directory: ${this.resultBaseDir}`);

    // Initialize results manager
    this.resultsManager = new TestResultsManager({
      resultsDir: this.resultBaseDir,
      recorderDir: this.recorderBaseDir,
      enableRecorderCopy: false, // Will be set to true in interactive mode
    });

    // Initialize token tracker with custom pricing if provided
    this.tokenTracker = new TokenTracker(
      this.config.ai?.openai?.modelName || 'gpt-4o',
      this.config.pricing
    );
    
    // Initialize page snapshot manager
    this.snapshotManager = new PageSnapshotManager();
    
    // Initialize resource manager for memory leak prevention
    this.resourceManager = globalResourceManager;
  }

  private getBrowserType() {
    switch (this.config.browser.type) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Enhanced Browser Test Framework...');

    // Clean up directories before starting
    await this.cleanupDirectories();

    // Ensure directories exist
    if (!fs.existsSync(this.resultBaseDir)) {
      fs.mkdirSync(this.resultBaseDir, { recursive: true });
    }
    if (!fs.existsSync(this.recorderBaseDir)) {
      fs.mkdirSync(this.recorderBaseDir, { recursive: true });
    }

    // Launch browser using config
    const browserType = this.getBrowserType();
    const launchOptions = {
      headless: this.config.browser.headless,
      args: ['--start-maximized'],
    };
    const contextOptions = {
      viewport: this.config.browser.viewport,
    };

    this.browser = await browserType.launch(launchOptions);
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup tools with tracking
    await this.setupTools();

    // Create AI agent
    await this.setupAgent();

    console.log('✅ Framework initialized successfully!');
  }

  private async setupTools(): Promise<void> {
    console.log('🛠️ Setting up browser automation tools...');

    // Create tools for the AI agent
    this.toolsArray = await createAllTools(this);
  }

  private async setupAgent(): Promise<void> {
    console.log('🤖 Setting up AI agent...');
    this.agent = await setupAgent(this.toolsArray);
  }

  /**
   * Helper method to call a tool from the toolsArray by name
   */
  private async callTool(toolName: string, params: any): Promise<string> {
    const tool = this.toolsArray.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    
    try {
      // LangChain tools have different invocation methods
      let result: any;
      if (typeof tool.call === 'function') {
        result = await tool.call(params);
      } else if (typeof tool.invoke === 'function') {
        result = await tool.invoke(params);
      } else if (typeof tool.func === 'function') {
        result = await tool.func(params);
      } else {
        throw new Error(`Tool '${toolName}' does not have a callable method`);
      }
      
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      const toolError = createErrorFromUnknown(error, `Tool '${toolName}' execution failed`, {
        toolName,
        params
      });
      throw toolError;
    }
  }

  // Directory cleanup methods
  private cleanupDirectories(): void {
    // Skip cleanup in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('🧹 Skipping cleanup in test environment');
      return;
    }

    console.log('🧹 Cleaning up previous test results...');

    if (existsSync(this.resultBaseDir)) {
      const files = readdirSync(this.resultBaseDir);
      for (const file of files) {
        const filePath = path.join(this.resultBaseDir, file);
        if (statSync(filePath).isDirectory()) {
          rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log('  ✅ Cleaned test-result directory');
    }
  }

  private cleanupRecorderDirectory(): void {
    if (fs.existsSync(this.recorderBaseDir)) {
      const files = fs.readdirSync(this.recorderBaseDir);
      for (const file of files) {
        const filePath = path.join(this.recorderBaseDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log('  ✅ Cleaned test-recorder directory (interactive mode)');
    }
  }

  // Test session management
  createTestSession(testName: string, testId: string | null = null): TestSession {
    const session = createTestSession(testName, testId, this.resultBaseDir);
    this.currentTestSession = session;
    
    // Reset token tracker for new session
    this.tokenTracker.reset();
    
    return session;
  }

  logTestStep(
    stepDescription: string,
    toolName: string | null = null,
    toolArgs: any = null,
    result: string | null = null,
    isSuccess: boolean = true
  ): void {
    if (!this.currentTestSession) return;

    this.currentTestSession.stepCounter++;
    const step: TestStep = {
      stepNumber: this.currentTestSession.stepCounter,
      timestamp: new Date().toISOString(),
      description: stepDescription,
      toolName,
      toolArgs,
      result,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      screenshots: [],
    };

    this.currentTestSession.steps.push(step);

    if (toolName) {
      const toolCall: ToolCall = {
        stepNumber: this.currentTestSession.stepCounter,
        toolName,
        toolArgs,
        result: result || '',
        timestamp: new Date().toISOString(),
        status: isSuccess ? 'SUCCESS' : 'FAILED',
      };
      this.currentTestSession.toolCalls.push(toolCall);
    }

    console.log(
      `📝 Step ${this.currentTestSession.stepCounter}: ${stepDescription} - ${isSuccess ? '✅' : '❌'}`
    );
  }

  async takeStepScreenshot(description: string | null = null): Promise<string | null> {
    if (!this.currentTestSession || !this.page) return null;

    this.currentTestSession.screenshotCounter++;
    const filename = `step-${this.currentTestSession.stepCounter || 0}-screenshot-${this.currentTestSession.screenshotCounter}.png`;
    const filepath = path.join(this.currentTestSession.screenshotsDir, filename);

    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png',
        timeout: TIMEOUTS.SCREENSHOT_TIMEOUT,
      });

      const screenshot = {
        filename,
        filepath,
        timestamp: new Date().toISOString(),
        description: description || `Step ${this.currentTestSession.stepCounter} screenshot`,
        stepNumber: this.currentTestSession.stepCounter,
      };

      // Add to current step if exists
      if (this.currentTestSession.steps.length > 0) {
        const currentStep = this.currentTestSession.steps[this.currentTestSession.steps.length - 1];
        currentStep.screenshots.push(screenshot);
      }

      console.log(`📸 Screenshot taken: ${filename}`);
      return filepath;
    } catch (error: unknown) {
      const screenshotError = createErrorFromUnknown(error, `Failed to take screenshot: ${filename}`, {
        operation: 'screenshot',
        filename,
        filepath
      });
      console.error(`❌ ${screenshotError.message}`);
      return null;
    }
  }

  /**
   * Invoke AI agent with token tracking and resource management
   */
  private async invokeAgentWithTracking(
    messages: AgentInvokeParams,
    config: any = {},
    stepDescription: string = 'AI agent call'
  ): Promise<AgentResponse> {
    // Extract instruction for content optimization
    if (messages && messages.messages && messages.messages.length > 0) {
      const lastMessage = messages.messages[messages.messages.length - 1];
      if (lastMessage.content) {
        (this as any).currentInstruction = lastMessage.content;
      }
    }
    // Estimate prompt tokens
    const messageContent = typeof messages === 'object' && messages.messages 
      ? messages.messages.map((m: any) => m.content).join(' ')
      : JSON.stringify(messages);
    
    const estimatedPromptTokens = this.tokenTracker.estimateTokens(messageContent);
    
    console.log(`🤖 ${stepDescription} (estimated: ${estimatedPromptTokens} tokens)`);
    
    // Create AbortController with proper cleanup to prevent EventTarget memory leak
    const abortController = this.resourceManager.createAbortController(`agent-${Date.now()}`);
    const enhancedConfig = {
      ...config,
      signal: abortController.signal
    };
    
    const startTime = Date.now();
    let result: AgentResponse;
    
    try {
      if (!this.agent) {
        throw new AgentError('Agent not initialized', { stepDescription });
      }
      
      result = await this.agent.invoke(messages, enhancedConfig);
    } catch (error) {
      // Ensure cleanup happens even on error
      abortController.abort();
      
      const frameworkError = createErrorFromUnknown(error, `Agent invocation failed: ${stepDescription}`, {
        stepDescription,
        estimatedPromptTokens
      });
      throw frameworkError;
    }
    
    const duration = Date.now() - startTime;
    
    // Clean up the abort controller
    abortController.abort();
    
    // Estimate response tokens from properly typed response
    const responseContent = result.messages && result.messages.length > 0
      ? result.messages[result.messages.length - 1]?.content || ''
      : result.content || '';
    
    const estimatedResponseTokens = this.tokenTracker.estimateTokens(responseContent);
    
    // Record token usage
    const tokenUsage = this.tokenTracker.recordUsage(
      estimatedPromptTokens,
      estimatedResponseTokens,
      this.config.ai?.openai?.modelName
    );
    
    // Log token usage with enhanced formatting
    console.log(`💰 Token Usage: ${tokenUsage.totalTokens} tokens ($${tokenUsage.cost.toFixed(4)}) in ${duration}ms`);
    
    // Add token usage to current test step if exists
    if (this.currentTestSession && this.currentTestSession.steps.length > 0) {
      const currentStep = this.currentTestSession.steps[this.currentTestSession.steps.length - 1];
      currentStep.tokenUsage = {
        promptTokens: tokenUsage.promptTokens,
        responseTokens: tokenUsage.responseTokens,
        totalTokens: tokenUsage.totalTokens,
        cost: tokenUsage.cost,
        model: tokenUsage.model
      };
    }
    
    return result;
  }

  finishTestSession(
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
    finalResult: string | null = null
  ): any {
    if (!this.currentTestSession) return;

    this.currentTestSession.endTime = new Date().toISOString();
    this.currentTestSession.status = status;
    if (finalResult !== null) {
      this.currentTestSession.finalResult = finalResult;
    }
    this.currentTestSession.duration =
      new Date(this.currentTestSession.endTime).getTime() -
      new Date(this.currentTestSession.startTime).getTime();

    // Add token summary to session
    this.currentTestSession.tokenSummary = this.tokenTracker.getSessionSummary();

    // Save session data
    const summary = saveTestSession(this.currentTestSession);

    // Add to results manager
    this.resultsManager.addTestResult(summary);

    console.log(`📊 Test session completed: ${status}`);
    console.log(`📁 Results saved to: ${this.currentTestSession.sessionDir}`);
    console.log(this.tokenTracker.getFormattedSummary());

    // Copy all results to test-recorder folder ONLY for interactive modes
    if (this.isInteractiveMode) {
      this.resultsManager.copySessionToRecorder(this.currentTestSession);
    }

    this.currentTestSession = null;
    return summary;
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up browser resources
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
        console.log('🧹 Browser closed successfully');
      }
      
      // Force cleanup of any remaining resources to prevent memory leaks
      this.resourceManager.cleanup();
      
    } catch (error) {
      const cleanupError = createErrorFromUnknown(error, 'Cleanup failed', {
        component: 'EnhancedBrowserTestFramework',
        operation: 'cleanup'
      });
      console.error('❌ Cleanup error:', cleanupError.message);
      throw cleanupError;
    }
  }

  async runTask(taskDescription: string, testName: string | null = null): Promise<TaskResult> {
    const _timestamp = new Date().toISOString();
    const name = testName || `Test-${Date.now()}`;

    console.log(`\n🎯 Running Task: ${name}`);
    console.log(`📝 Task: ${taskDescription}`);
    console.log(`⏰ Started at: ${_timestamp}\n`);

    // Create test session
    const session = this.createTestSession(name, name.replace(/\s+/g, '-').toLowerCase());

    try {
      // Log initial step
      this.logTestStep('Test started', null, null, `Starting task: ${taskDescription}`, true);
      await this.takeStepScreenshot('Initial page state');

      // Create enhanced context message for the agent
      const systemContext = `You are a browser automation agent with access to the following tools:
- navigate: Navigate to any URL
- click: Click elements using various selection strategies (CSS, text, role, etc.)
- fill: Fill input fields with text
- wait: Wait for elements or time delays
- verifyElement: Check if elements exist on the page
- getPageContent: Get page content for analysis
- screenshot: Take screenshots
- getElementInfo: Get information about specific elements

IMPORTANT INSTRUCTIONS:
1. You are currently controlling a browser that may already have a page loaded
2. When asked to click a button with text like "Log In", use: click with selector="Log In" and strategy="text"
3. For email fields, use: fill with selector="input[type='email']" or "input[name*='email']"
4. For password fields, use: fill with selector="input[type='password']" or "input[name*='password']"
5. Take screenshots between major actions to document the process
6. If an element is not found with one selector, try alternative selectors
7. Complete the task step by step without asking for additional information
8. NEVER ask for URLs or page information - just use the tools directly

EXAMPLE:
To click "Log In" button: {"selector": "Log In", "strategy": "text"}
To fill email: {"selector": "input[type='email']", "value": "user@example.com"}
To fill password: {"selector": "input[type='password']", "value": "password123"}

Current Task: ${taskDescription}`;

      const finalState = await this.invokeAgentWithTracking(
        {
          messages: [new HumanMessage(systemContext)],
        },
        {
          recursionLimit: AGENT_CONFIG.agent.recursionLimit,
          configurable: { thread_id: `session-${this.currentTestSession?.sessionId || 'default'}` },
        },
        `Task execution: ${taskDescription}`
      );

      const result = finalState.messages[finalState.messages.length - 1].content;

      // Log final step
      this.logTestStep('Test completed', null, null, result, true);
      await this.takeStepScreenshot('Final page state');

      // Finish session
      this.finishTestSession('SUCCESS', result);

      console.log(`\n✅ Task "${name}" completed successfully!`);
      console.log(`📊 Result: ${result}\n`);

      return {
        testName: name,
        task: taskDescription,
        timestamp: _timestamp,
        status: 'SUCCESS',
        result,
        duration: Date.now() - new Date(_timestamp).getTime(),
        sessionDir: session.sessionDir,
      };
    } catch (error: any) {
      console.error(`\n❌ Task "${name}" failed:`);
      console.error(`💥 Error: ${error.message}\n`);

      // Log error step
      this.logTestStep('Test failed', null, null, error.message, false);
      await this.takeStepScreenshot('Error state');

      // Finish session with failure
      this.finishTestSession('FAILED', error.message);

      return {
        testName: name,
        task: taskDescription,
        timestamp: _timestamp,
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - new Date(_timestamp).getTime(),
        sessionDir: session.sessionDir,
      };
    }
  }

  async runMultipleTasks(
    tasks: Array<{ name?: string; description: string }>
  ): Promise<TaskResult[]> {
    console.log(`\n🚀 Running ${tasks.length} tasks sequentially...\n`);

    const results: TaskResult[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskName = task.name || `Task-${i + 1}`;

      const result = await this.runTask(task.description, taskName);
      results.push(result);

      // Add delay between tasks
      if (i < tasks.length - 1) {
        console.log('⏱️ Waiting before next task...\n');
        await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.STEP_DELAY));
      }
    }

    return results;
  }

  async runSingleTest(
    test: TestConfig
  ): Promise<{ success: boolean; session?: any; error?: string }> {
    // Only show detailed logs if not using console reporter (for backwards compatibility)
    const useDetailedLogs = !process.env.ENDORPHIN_CONSOLE_REPORTER;

    if (useDetailedLogs) {
      console.log(`\n🚀 Starting test: ${test.id} - ${test.name}`);
      console.log(`📝 Description: ${test.description}`);
      console.log(`🎯 Priority: ${test.priority}`);
      console.log(`🏷️ Tags: ${test.tags ? test.tags.join(', ') : 'None'}`);
    }

    // Create test session with detailed tracking
    this.createTestSession(test.name, test.id);

    try {
      this.logTestStep(
        `Starting test execution: ${test.name}`,
        null,
        null,
        `Test ID: ${test.id}`,
        true
      );

      // Execute the test task with timeout
      const messages = [new HumanMessage(test.task)];

      // Add timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new TestTimeoutError('Test execution timeout', {
            testId: test.id,
            testName: test.name,
            timeout: TIMEOUTS.AGENT_TIMEOUT
          })),
          TIMEOUTS.AGENT_TIMEOUT
        );
      });

      const agentPromise = this.invokeAgentWithTracking(
        { messages },
        {
          recursionLimit: AGENT_CONFIG.agent.recursionLimit,
          configurable: { thread_id: `session-${this.currentTestSession!.sessionId}` },
        },
        `Test execution: ${test.name}`
      );

      await Promise.race([agentPromise, timeoutPromise]);

      this.logTestStep(
        'Test execution completed successfully',
        null,
        null,
        'All steps completed',
        true
      );

      // Finish the test session
      const session = this.finishTestSession('SUCCESS', 'Test completed successfully');

      if (useDetailedLogs) {
        console.log(`✅ Test ${test.id} completed successfully!`);
      }
      return { success: true, session };
    } catch (error: any) {
      if (useDetailedLogs) {
        console.error(`❌ Test ${test.id} failed:`, error.message);
      }

      this.logTestStep('Test execution failed', null, null, error.message, false);
      const session = this.finishTestSession('FAILED', error.message);

      return { success: false, error: error.message, session };
    }
  }

  async runMultipleTests(
    tests: TestConfig[]
  ): Promise<{
    results: Array<{
      testId: string;
      testName: string;
      success: boolean;
      error?: string;
      session?: any;
    }>;
    report: TestReport;
  }> {
    console.log(`\n🎯 Running ${tests.length} tests with enhanced result tracking...`);
    const results: Array<{
      testId: string;
      testName: string;
      success: boolean;
      error?: string;
      session?: any;
    }> = [];

    for (const test of tests) {
      const result = await this.runSingleTest(test);
      results.push({
        testId: test.id,
        testName: test.name,
        ...result,
      });

      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.STEP_DELAY));
    }

    // Generate final report using HtmlReporter
    const htmlReporter = new HtmlReporter(this.resultBaseDir);
    const reportPath = await htmlReporter.generateReport();

    // Create TestReport object
    const passed = results.filter((r) => r.success).length;
    const failed = results.length - passed;
    const report: TestReport = {
      summary: {
        total: results.length,
        passed,
        failed,
        passRate: results.length > 0 ? `${((passed / results.length) * 100).toFixed(2)}%` : '0%',
        generatedAt: new Date().toISOString(),
      },
      results: results.map((result) => ({
        testId: result.testId,
        name: result.testName,
        status: result.success ? 'passed' : 'failed',
        duration: result.session?.duration || 0,
        error: result.error ?? '',
        screenshots:
          result.session?.steps?.flatMap(
            (step: any) => step.screenshots?.map((s: any) => s.filename) || []
          ) || [],
        logs: result.session?.steps?.map((step: any) => step.description) || [],
        timestamp: result.session?.startTime || new Date().toISOString(),
      })),
    };

    console.log(`\n🎉 All tests completed!`);
    console.log(
      `📊 Final Results: ${results.filter((r) => r.success).length}/${results.length} passed`
    );
    console.log(`📄 HTML Report: ${reportPath}`);

    return { results, report };
  }

  enableInteractiveMode(): void {
    this.isInteractiveMode = true;
    console.log('📼 Interactive mode enabled - results will be recorded in test-recorder folder');
    this.cleanupRecorderDirectory();
  }

  disableInteractiveMode(): void {
    this.isInteractiveMode = false;
  }

  // Public getters for tool access
  get currentPage(): Page | null {
    return this.page;
  }

  get currentBrowser(): Browser | null {
    return this.browser;
  }

  get currentContext(): BrowserContext | null {
    return this.context;
  }

  get activeTestSession(): TestSession | null {
    return this.currentTestSession;
  }

  get frameworkConfig(): FrameworkConfig {
    return this.config;
  }

  // Natural Language Command Execution Methods
  async executeNaturalLanguageCommand(command: string): Promise<NaturalLanguageResult> {
    const lowerCommand = command.toLowerCase();

    // Parse common commands
    if (lowerCommand.includes('click')) {
      // Extract selector or button text
      const selector = this.extractSelectorFromCommand(command);
      const result = await this.callTool('click', { selector });
      return { toolUsed: 'click', params: { selector }, result };
    }

    if (lowerCommand.includes('fill') || lowerCommand.includes('type')) {
      // Extract field and value
      const { selector, value } = this.extractFillFromCommand(command);
      const result = await this.callTool('fill', { selector, text: value });
      return { toolUsed: 'fill', params: { selector, value }, result };
    }

    if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
      // Extract URL
      const url = this.extractUrlFromCommand(command);
      const result = await this.callTool('navigate', { location: url });
      return { toolUsed: 'navigate', params: { url }, result };
    }

    if (lowerCommand.includes('wait')) {
      // Extract time
      const time = this.extractTimeFromCommand(command) || TIMEOUTS.DEFAULT_WAIT;
      const result = await this.callTool('wait', { duration: time });
      return { toolUsed: 'wait', params: { time }, result };
    }

    if (lowerCommand.includes('screenshot')) {
      const result = await this.callTool('screenshot', {});
      return { toolUsed: 'screenshot', params: {}, result };
    }

    // Default: try to use AI agent to interpret the command
    try {
      const result = await this.runTask(command);
      return {
        toolUsed: 'ai-agent',
        params: { command },
        result: result.result || result.error || 'Command executed',
      };
    } catch (error: any) {
      throw new Error(`Could not interpret command: "${command}". ${error.message}`);
    }
  }

  // Helper methods for parsing commands
  private extractSelectorFromCommand(command: string): string {
    // Try to extract button text, link text, or selector
    const buttonMatch = command.match(
      /(?:click|press)\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+button|\s+link|$)/i
    );
    if (buttonMatch) {
      const text = buttonMatch[1].trim();
      // Return as text selector for buttons/links
      return text;
    }

    // Try to extract by common UI element names
    if (command.includes('login')) return 'login';
    if (command.includes('submit')) return 'submit';
    if (command.includes('sign up')) return 'sign up';
    if (command.includes('register')) return 'register';

    // Default to a generic button selector
    return 'button';
  }

  private extractFillFromCommand(command: string): { selector: string; value: string } {
    // Try to extract field and value
    const fillMatch = command.match(/(?:fill|type|enter)\s+(.+?)\s+(?:with|as)\s+(.+)/i);
    if (fillMatch) {
      return {
        selector: fillMatch[1].trim(),
        value: fillMatch[2].trim(),
      };
    }

    // Try common field patterns
    if (command.includes('email')) {
      const emailMatch = command.match(/email\s+(?:with\s+)?(.+)/i);
      return {
        selector: 'input[type="email"], input[name*="email"], #email',
        value: emailMatch ? emailMatch[1].trim() : '',
      };
    }

    if (command.includes('password')) {
      const passMatch = command.match(/password\s+(?:with\s+)?(.+)/i);
      return {
        selector: 'input[type="password"], input[name*="password"], #password',
        value: passMatch ? passMatch[1].trim() : '',
      };
    }

    return { selector: 'input', value: '' };
  }

  private extractUrlFromCommand(command: string): string {
    const urlMatch = command.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) return urlMatch[1];

    // Default to base URL if no URL found
    return process.env.BASE_URL || 'https://qafromla.herokuapp.com/';
  }

  private extractTimeFromCommand(command: string): number | null {
    const timeMatch = command.match(/(\d+)\s*(?:ms|milliseconds?|seconds?|s)/i);
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[0].toLowerCase();
      if (unit.includes('s') && !unit.includes('ms')) {
        return num * 1000; // Convert seconds to milliseconds
      }
      return num;
    }
    return TIMEOUTS.DEFAULT_WAIT; // Default wait time
  }

  /**
   * Set interactive mode for the framework
   * @param interactive - Whether to enable interactive mode
   */
  setInteractiveMode(interactive: boolean): void {
    this.isInteractiveMode = interactive;
  }

  /**
   * Get the page snapshot manager
   */
  getSnapshotManager(): PageSnapshotManager {
    return this.snapshotManager;
  }
}
