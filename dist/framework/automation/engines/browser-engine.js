/**
 * Browser Test Engine
 * Core engine for browser-based test execution
 */
import { HumanMessage } from '@langchain/core/messages';
import { AGENT_CONFIG } from '../../ai/config/agent-config.js';
import { TIMEOUTS } from '../../config/constants.js';
import { createSystemContext } from '../../config/system-context.js';
import { setupAgent } from '../../ai/agent-setup.js';
import { BrowserManager } from '../browser/browser-manager.js';
import { PageSnapshotManager } from '../../managers/content/snapshot-manager.js';
import { globalResourceManager } from '../../core/resource-manager.js';
import { createTestSession, saveTestSession } from '../../core/test-session.js';
import { TokenTracker } from '../../core/token-tracker.js';
import { createAllTools } from '../tools/index.js';
import { AgentError, TestTimeoutError, createErrorFromUnknown } from '../../types/errors.js';
import { DirectoryManager } from '../../utils/directory-manager.js';
import { TestHelpers } from '../../utils/test-helpers.js';
/**
 * Browser Test Engine
 * Handles core browser test execution logic
 */
export class BrowserEngine {
    browserManager;
    agent = null;
    toolsArray = [];
    currentTestSession = null;
    config;
    resultBaseDir;
    recorderBaseDir;
    isInteractiveMode;
    tokenTracker;
    snapshotManager;
    resourceManager;
    frameworkInstance; // Reference to EnhancedBrowserTestFramework
    constructor(config) {
        this.config = config.framework;
        this.resultBaseDir = config.resultBaseDir;
        this.recorderBaseDir = config.recorderBaseDir;
        this.isInteractiveMode = config.isInteractiveMode || false;
        this.frameworkInstance = config.frameworkInstance;
        // Initialize browser manager
        this.browserManager = new BrowserManager({ browser: this.config.browser });
        // Initialize token tracker with custom pricing if provided
        this.tokenTracker = new TokenTracker(this.config.ai?.openai?.modelName || 'gpt-4o', this.config.pricing);
        // Initialize page snapshot manager
        this.snapshotManager = new PageSnapshotManager();
        // Initialize resource manager for memory leak prevention
        this.resourceManager = globalResourceManager;
    }
    /**
     * Initialize the browser engine
     */
    async initialize() {
        console.log('🚀 Initializing Browser Test Engine...');
        // Clean up directories before starting
        await DirectoryManager.cleanupDirectories(this.resultBaseDir);
        // Ensure directories exist
        await DirectoryManager.ensureDirectory(this.resultBaseDir);
        await DirectoryManager.ensureDirectory(this.recorderBaseDir);
        // Initialize browser manager
        await this.browserManager.initialize();
        // Setup tools with tracking
        await this.setupTools();
        // Create AI agent
        await this.setupAgent();
        console.log('✅ Browser Engine initialized successfully!');
    }
    /**
     * Setup browser automation tools
     */
    async setupTools() {
        console.log('🛠️ Setting up browser automation tools...');
        this.toolsArray = await createAllTools(this.frameworkInstance || this);
    }
    /**
     * Setup AI agent
     */
    async setupAgent() {
        console.log('🤖 Setting up AI agent...');
        this.agent = await setupAgent(this.toolsArray);
    }
    /**
     * Create a new test session
     */
    async createTestSession(testName, testId = null) {
        const session = await createTestSession(testName, testId, this.resultBaseDir);
        this.currentTestSession = session;
        // Reset token tracker for new session
        this.tokenTracker.reset();
        return session;
    }
    /**
     * Log a test step
     */
    logTestStep(stepDescription, toolName = null, toolArgs = null, result = null, isSuccess = true) {
        TestHelpers.logTestStep(stepDescription, toolName, toolArgs, result || '', isSuccess, this.currentTestSession || undefined);
        // Add tool call tracking if needed
        if (toolName && this.currentTestSession) {
            const toolCall = {
                stepNumber: this.currentTestSession.steps.length,
                toolName,
                toolArgs,
                result: result || '',
                timestamp: new Date().toISOString(),
                status: isSuccess ? 'SUCCESS' : 'FAILED',
            };
            this.currentTestSession.toolCalls.push(toolCall);
        }
    }
    /**
     * Take a screenshot for current test step
     */
    async takeStepScreenshot(description = null) {
        return await TestHelpers.takeStepScreenshot(this.browserManager, description, this.currentTestSession || undefined);
    }
    /**
     * Invoke AI agent with token tracking and resource management
     */
    async invokeAgentWithTracking(messages, config = {}, stepDescription = 'AI agent call') {
        // Extract instruction for content optimization
        if (messages && messages.messages && messages.messages.length > 0) {
            const lastMessage = messages.messages[messages.messages.length - 1];
            if (lastMessage.content) {
                this.currentInstruction = lastMessage.content;
            }
        }
        // Estimate prompt tokens
        const messageContent = typeof messages === 'object' && messages.messages
            ? messages.messages.map((m) => m.content).join(' ')
            : JSON.stringify(messages);
        const estimatedPromptTokens = this.tokenTracker.estimateTokens(messageContent);
        console.log(`🤖 ${stepDescription} (estimated: ${estimatedPromptTokens} tokens)`);
        // Create AbortController with proper cleanup to prevent EventTarget memory leak
        const abortController = this.resourceManager.createAbortController(`agent-${Date.now()}`);
        const enhancedConfig = {
            ...config,
            signal: abortController.signal,
        };
        const startTime = Date.now();
        let result;
        try {
            if (!this.agent) {
                throw new AgentError('Agent not initialized', { stepDescription });
            }
            result = await this.agent.invoke(messages, enhancedConfig);
        }
        catch (error) {
            // Ensure cleanup happens even on error
            abortController.abort();
            const frameworkError = createErrorFromUnknown(error, `Agent invocation failed: ${stepDescription}`, {
                stepDescription,
                estimatedPromptTokens,
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
        const tokenUsage = this.tokenTracker.recordUsage(estimatedPromptTokens, estimatedResponseTokens, this.config.ai?.openai?.modelName);
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
                model: tokenUsage.model,
            };
        }
        return result;
    }
    /**
     * Run a single task
     */
    async runTask(taskDescription, testName = null) {
        const _timestamp = new Date().toISOString();
        const name = testName || `Test-${Date.now()}`;
        console.log(`\n🎯 Running Task: ${name}`);
        console.log(`📝 Task: ${taskDescription}`);
        console.log(`⏰ Started at: ${_timestamp}\n`);
        // Create test session
        const session = await this.createTestSession(name, name.replace(/\s+/g, '-').toLowerCase());
        try {
            // Log initial step
            this.logTestStep('Test started', null, null, `Starting task: ${taskDescription}`, true);
            await this.takeStepScreenshot('Initial page state');
            // Create enhanced context message for the agent
            const systemContext = createSystemContext(taskDescription);
            const finalState = await this.invokeAgentWithTracking({
                messages: [new HumanMessage(systemContext)],
            }, {
                recursionLimit: AGENT_CONFIG.agent.recursionLimit,
                configurable: { thread_id: `session-${this.currentTestSession?.sessionId || 'default'}` },
            }, `Task execution: ${taskDescription}`);
            const result = finalState.messages?.[finalState.messages.length - 1]?.content || 'Task completed';
            // Log final step
            this.logTestStep('Test completed', null, null, result, true);
            await this.takeStepScreenshot('Final page state');
            // Finish session
            await this.finishTestSession('SUCCESS', result);
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
        }
        catch (error) {
            console.error(`\n❌ Task "${name}" failed:`);
            console.error(`💥 Error: ${error.message}\n`);
            // Log error step
            this.logTestStep('Test failed', null, null, error.message, false);
            await this.takeStepScreenshot('Error state');
            // Finish session with failure
            await this.finishTestSession('FAILED', error.message);
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
    /**
     * Run a single test
     */
    async runSingleTest(test) {
        // Only show detailed logs if not using console reporter (for backwards compatibility)
        const useDetailedLogs = !process.env.ENDORPHIN_CONSOLE_REPORTER;
        if (useDetailedLogs) {
            console.log(`\n🚀 Starting test: ${test.id} - ${test.name}`);
            console.log(`📝 Description: ${test.description}`);
            console.log(`🎯 Priority: ${test.priority}`);
            console.log(`🏷️ Tags: ${test.tags ? test.tags.join(', ') : 'None'}`);
        }
        // Create test session with detailed tracking
        await this.createTestSession(test.name, test.id);
        try {
            this.logTestStep(`Starting test execution: ${test.name}`, null, null, `Test ID: ${test.id}`, true);
            // Execute setup function if present
            let setupData = null;
            if (test.setup && typeof test.setup === 'function') {
                if (useDetailedLogs) {
                    console.log(`🔧 Executing test setup...`);
                }
                setupData = await test.setup();
                this.logTestStep('Test setup completed', null, null, 'Setup data generated', true);
            }
            // Execute data generation function if present
            let generatedData = null;
            if (test.data) {
                if (typeof test.data === 'function') {
                    if (useDetailedLogs) {
                        console.log(`📊 Generating test data...`);
                    }
                    generatedData = await test.data();
                    this.logTestStep('Test data generated', null, null, 'Data generation completed', true);
                }
                else {
                    generatedData = test.data;
                }
            }
            // Process task - support both string and function
            let taskDescription;
            if (typeof test.task === 'function') {
                if (useDetailedLogs) {
                    console.log(`🎯 Executing task function with generated data...`);
                }
                taskDescription = await test.task(generatedData, setupData);
                this.logTestStep('Task function executed', null, null, 'Task description generated', true);
            }
            else {
                taskDescription = test.task;
            }
            if (useDetailedLogs) {
                console.log(`📝 Final task description: ${taskDescription}`);
            }
            // Execute the test task with timeout
            const messages = [new HumanMessage(taskDescription)];
            // Add timeout to prevent infinite loops
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new TestTimeoutError('Test execution timeout', {
                    testId: test.id,
                    testName: test.name,
                    timeout: TIMEOUTS.AGENT_TIMEOUT,
                })), TIMEOUTS.AGENT_TIMEOUT);
            });
            const agentPromise = this.invokeAgentWithTracking({ messages }, {
                recursionLimit: AGENT_CONFIG.agent.recursionLimit,
                configurable: { thread_id: `session-${this.currentTestSession.sessionId}` },
            }, `Test execution: ${test.name}`);
            await Promise.race([agentPromise, timeoutPromise]);
            this.logTestStep('Test execution completed successfully', null, null, 'All steps completed', true);
            // Finish the test session
            const session = await this.finishTestSession('SUCCESS', 'Test completed successfully');
            if (useDetailedLogs) {
                console.log(`✅ Test ${test.id} completed successfully!`);
            }
            return { success: true, session };
        }
        catch (error) {
            if (useDetailedLogs) {
                console.error(`❌ Test ${test.id} failed:`, error.message);
            }
            this.logTestStep('Test execution failed', null, null, error.message, false);
            const session = await this.finishTestSession('FAILED', error.message);
            return { success: false, error: error.message, session };
        }
    }
    /**
     * Finish current test session
     */
    async finishTestSession(status = 'SUCCESS', finalResult = null) {
        if (!this.currentTestSession)
            return;
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
        const summary = await saveTestSession(this.currentTestSession);
        console.log(`📊 Test session completed: ${status}`);
        console.log(`📁 Results saved to: ${this.currentTestSession.sessionDir}`);
        console.log(this.tokenTracker.getFormattedSummary());
        this.currentTestSession = null;
        return summary;
    }
    /**
     * Enable interactive mode
     */
    async enableInteractiveMode() {
        this.isInteractiveMode = true;
        console.log('📼 Interactive mode enabled - results will be recorded in test-recorder folder');
        await DirectoryManager.cleanupRecorderDirectory(this.recorderBaseDir);
    }
    /**
     * Disable interactive mode
     */
    disableInteractiveMode() {
        this.isInteractiveMode = false;
    }
    /**
     * Set interactive mode
     */
    setInteractiveMode(interactive) {
        this.isInteractiveMode = interactive;
    }
    /**
     * Cleanup engine resources
     */
    async cleanup() {
        try {
            // Clean up page snapshots first to free memory
            if (this.snapshotManager) {
                this.snapshotManager.clearAll();
                console.log('🧹 Page snapshots cleared');
            }
            // Clean up browser resources
            await this.browserManager.cleanup();
            // Force cleanup of any remaining resources to prevent memory leaks
            this.resourceManager.cleanup();
        }
        catch (error) {
            const cleanupError = createErrorFromUnknown(error, 'Cleanup failed', {
                component: 'BrowserEngine',
                operation: 'cleanup',
            });
            console.error('❌ Cleanup error:', cleanupError.message);
            throw cleanupError;
        }
    }
    // Public getters for framework compatibility
    get currentPage() {
        return this.browserManager.isInitialized() ? this.browserManager.getPage() : null;
    }
    get currentBrowser() {
        return this.browserManager.isInitialized() ? this.browserManager.getBrowser() : null;
    }
    get currentContext() {
        return this.browserManager.isInitialized() ? this.browserManager.getContext() : null;
    }
    get activeTestSession() {
        return this.currentTestSession;
    }
    get frameworkConfig() {
        return this.config;
    }
    getBrowserManager() {
        return this.browserManager;
    }
    getSnapshotManager() {
        return this.snapshotManager;
    }
}
//# sourceMappingURL=browser-engine.js.map