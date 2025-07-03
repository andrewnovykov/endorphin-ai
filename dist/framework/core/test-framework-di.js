/**
 * Test Framework with Dependency Injection
 * Modern version using DI container for service management
 */
import { HumanMessage } from '@langchain/core/messages';
import * as path from 'node:path';
import { TestTimeoutError } from '../types/errors.js';
import { setupAgent } from '../ai/agent-setup.js';
import { createContainer } from './dependency-container.js';
import { SERVICE_NAMES, ServiceRegistry } from './service-registry.js';
/**
 * Test Framework with Dependency Injection
 * Uses DI container to manage service lifecycle and dependencies
 */
export class TestFrameworkDI {
    container;
    serviceRegistry;
    agent = null;
    isInteractiveMode = false;
    initialized = false;
    logger;
    constructor(options = {}) {
        // Create or use provided container
        this.container =
            options.container ||
                createContainer({
                    enableAutoResolution: true,
                    enableCircularDependencyDetection: true,
                    enableLogging: options.enableLogging || false,
                });
        this.serviceRegistry = new ServiceRegistry(this.container);
    }
    /**
     * Initialize the framework with dependency injection
     */
    async initialize(config = {}) {
        if (this.initialized) {
            throw new Error('Framework is already initialized');
        }
        try {
            // Register all framework services
            await this.serviceRegistry.registerFrameworkServices({
                enableLogging: true,
                customConfig: config,
            });
            // Initialize services
            await this.serviceRegistry.initializeServices();
            // Get logger after initialization
            this.logger = await this.container.resolve(SERVICE_NAMES.LOGGER);
            this.logger.info('Test Framework DI initialized successfully');
            // Setup AI agent
            await this.setupAgent();
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize Test Framework DI:', error);
            throw error;
        }
    }
    /**
     * Run a test with the given configuration
     */
    async runTest(testConfig) {
        this.ensureInitialized();
        const logger = await this.getLogger();
        logger.info(`Running test: ${testConfig.name}`, {
            testId: testConfig.id,
            url: testConfig.url,
        });
        try {
            const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
            const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
            // Create test session
            const session = await sessionManager.createSession(testConfig.name, testConfig.id);
            // Navigate to test URL if provided
            if (testConfig.url) {
                await browserManager.navigateToUrl(testConfig.url);
            }
            // Execute test instructions
            const result = await this.executeTest(testConfig, session);
            // Complete session
            await sessionManager.completeSession(result.success, result.error, result.report);
            logger.info(`Test completed: ${result.success ? 'SUCCESS' : 'FAILED'}`, {
                testId: testConfig.id,
                duration: result.duration,
            });
            return result;
        }
        catch (error) {
            const logger = await this.getLogger();
            logger.error('Test execution failed', error, {
                testId: testConfig.id,
                testName: testConfig.name,
            });
            // Complete session with error
            const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
            await sessionManager.completeSession(false, error.message);
            throw error;
        }
    }
    /**
     * Execute natural language instruction
     */
    async executeNaturalLanguageInstruction(instruction) {
        this.ensureInitialized();
        const logger = await this.getLogger();
        logger.info('Executing natural language instruction', { instruction });
        try {
            const startTime = Date.now();
            if (!this.agent) {
                throw new Error('Agent not initialized. Call initialize() first.');
            }
            // Get optimized page content for AI context
            const optimizedContent = await this.getOptimizedPageContent();
            // Create enhanced prompt with context
            const enhancedPrompt = this.createEnhancedPrompt(instruction, optimizedContent);
            // Get execution config
            const configManager = await this.container.resolve(SERVICE_NAMES.CONFIG_MANAGER);
            const executionConfig = configManager.getExecutionConfig();
            // Execute with timeout and tracking
            const result = await this.executeWithTimeout(() => this.invokeAgent(enhancedPrompt), executionConfig.timeout);
            const duration = Date.now() - startTime;
            logger.info('Natural language instruction completed', {
                instruction,
                duration,
                success: result.success,
            });
            const tokenTracker = await this.container.resolve(SERVICE_NAMES.TOKEN_TRACKER);
            return {
                result: result.output,
                error: result.error,
                duration,
                tokenUsage: tokenTracker.getSessionSummary(),
            };
        }
        catch (error) {
            const logger = await this.getLogger();
            logger.error('Natural language instruction failed', error, { instruction });
            const tokenTracker = await this.container.resolve(SERVICE_NAMES.TOKEN_TRACKER);
            return {
                result: '',
                error: error.message,
                duration: 0,
                tokenUsage: tokenTracker.getSessionSummary(),
            };
        }
    }
    /**
     * Take a screenshot
     */
    async takeScreenshot(filename) {
        this.ensureInitialized();
        try {
            const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
            const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
            const session = sessionManager.getCurrentSession();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotName = filename || `screenshot-${timestamp}.png`;
            let screenshotPath;
            if (session) {
                screenshotPath = path.join(session.sessionDir, screenshotName);
            }
            else {
                screenshotPath = path.join(process.cwd(), 'screenshots', screenshotName);
            }
            await browserManager.takeScreenshot({ path: screenshotPath });
            const logger = await this.getLogger();
            logger.debug('Screenshot captured', { path: screenshotPath });
            return screenshotPath;
        }
        catch (error) {
            const logger = await this.getLogger();
            logger.error('Failed to take screenshot', error);
            throw error;
        }
    }
    /**
     * Generate HTML report
     */
    async generateReport(title) {
        this.ensureInitialized();
        const logger = await this.getLogger();
        logger.info('Generating HTML report');
        try {
            const htmlReporter = await this.container.resolve(SERVICE_NAMES.HTML_REPORTER);
            const reportPath = await htmlReporter.generateReport({ title });
            logger.info('HTML report generated', { path: reportPath });
            return reportPath;
        }
        catch (error) {
            logger.error('Failed to generate report', error);
            throw error;
        }
    }
    /**
     * Cleanup framework resources
     */
    async cleanup() {
        if (!this.initialized) {
            return;
        }
        const logger = await this.getLogger();
        logger.info('Starting framework cleanup');
        try {
            // Close session
            const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
            sessionManager.closeSession();
            // Cleanup browser
            const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
            await browserManager.cleanup();
            // Dispose services
            await this.serviceRegistry.dispose();
            this.initialized = false;
            logger.info('Framework cleanup completed');
        }
        catch (error) {
            console.error('Error during framework cleanup:', error);
        }
    }
    /**
     * Get framework status
     */
    async getStatus() {
        if (!this.initialized) {
            return {
                initialized: false,
                hasActiveSession: false,
                toolCount: 0,
                tokenUsage: null,
                currentUrl: null,
            };
        }
        const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
        const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
        const toolManager = await this.container.resolve(SERVICE_NAMES.TOOL_MANAGER);
        const tokenTracker = await this.container.resolve(SERVICE_NAMES.TOKEN_TRACKER);
        return {
            initialized: this.initialized,
            hasActiveSession: sessionManager.hasActiveSession(),
            toolCount: toolManager.getToolCount(),
            tokenUsage: tokenTracker.getSessionSummary(),
            currentUrl: browserManager.isInitialized() ? browserManager.getCurrentUrl() : null,
        };
    }
    /**
     * Get service from container
     */
    async getService(serviceName) {
        this.ensureInitialized();
        return await this.container.resolve(serviceName);
    }
    /**
     * Get container statistics
     */
    getContainerStats() {
        return this.serviceRegistry.getServiceStatistics();
    }
    // Backward compatibility methods
    /**
     * @deprecated Use getService(SERVICE_NAMES.BROWSER_MANAGER) instead
     */
    async getBrowserManager() {
        return await this.getService(SERVICE_NAMES.BROWSER_MANAGER);
    }
    /**
     * @deprecated Use getService(SERVICE_NAMES.CONFIG_MANAGER) instead
     */
    async getConfigManager() {
        return await this.getService(SERVICE_NAMES.CONFIG_MANAGER);
    }
    /**
     * @deprecated Use browserManager.getPage() instead
     */
    async getPage() {
        const browserManager = await this.getBrowserManager();
        return browserManager.getPage();
    }
    /**
     * @deprecated Use configManager.getConfig() instead
     */
    async getConfig() {
        const configManager = await this.getConfigManager();
        return configManager.getConfig();
    }
    /**
     * @deprecated Use toolManager.getTools() instead
     */
    async getTools() {
        const toolManager = await this.getService(SERVICE_NAMES.TOOL_MANAGER);
        return toolManager.getTools();
    }
    // Private methods
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Framework not initialized. Call initialize() first.');
        }
    }
    async getLogger() {
        if (!this.logger) {
            this.logger = await this.container.resolve(SERVICE_NAMES.LOGGER);
        }
        return this.logger;
    }
    async setupAgent() {
        const logger = await this.getLogger();
        logger.debug('Setting up AI agent');
        try {
            const configManager = await this.container.resolve(SERVICE_NAMES.CONFIG_MANAGER);
            const toolManager = await this.container.resolve(SERVICE_NAMES.TOOL_MANAGER);
            const aiConfig = configManager.getAIConfig();
            const tools = await toolManager.setupTools(this);
            this.agent = await setupAgent(tools);
            logger.info('AI agent setup completed', {
                toolCount: tools.length,
                model: aiConfig.openai.modelName,
            });
        }
        catch (error) {
            logger.error('Failed to setup agent', error);
            throw error;
        }
    }
    async executeTest(testConfig, _session) {
        const startTime = Date.now();
        try {
            // Execute test instructions
            const result = await this.executeNaturalLanguageInstruction(testConfig.instructions);
            const duration = Date.now() - startTime;
            return {
                testName: 'Unknown',
                task: 'Natural language command',
                timestamp: new Date().toISOString(),
                status: 'FAILED',
                error: result.error,
                duration,
                sessionDir: '',
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const tokenTracker = await this.container.resolve(SERVICE_NAMES.TOKEN_TRACKER);
            return {
                error: error.message,
                duration,
                tokenUsage: tokenTracker.getSessionSummary(),
            };
        }
    }
    async getOptimizedPageContent() {
        try {
            const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
            const snapshotManager = await this.container.resolve(SERVICE_NAMES.PAGE_SNAPSHOT_MANAGER);
            if (!browserManager.isInitialized()) {
                return '';
            }
            const page = browserManager.getPage();
            const url = page.url();
            return await snapshotManager.createSnapshot(page, url);
        }
        catch (error) {
            const logger = await this.getLogger();
            logger.warn('Failed to get optimized page content', error);
            return '';
        }
    }
    createEnhancedPrompt(instruction, pageContent) {
        const basePrompt = `You are a web automation expert. Execute the following instruction on the current web page.

Current page content (optimized for AI context):
${pageContent}

Instruction: ${instruction}

Use the available tools to complete this task. Be precise and efficient.`;
        return basePrompt;
    }
    async invokeAgent(prompt) {
        if (!this.agent) {
            throw new Error('Agent not initialized');
        }
        const message = new HumanMessage(prompt);
        const params = { messages: [message] };
        const startTime = Date.now();
        try {
            const response = await this.agent.invoke(params);
            const _duration = Date.now() - startTime;
            // Track tokens (estimation for now)
            const tokenTracker = await this.container.resolve(SERVICE_NAMES.TOKEN_TRACKER);
            const configManager = await this.container.resolve(SERVICE_NAMES.CONFIG_MANAGER);
            tokenTracker.recordUsage(Math.ceil(prompt.length / 4), // Rough token estimation
            Math.ceil((response.output || '').length / 4), configManager.getAIConfig().openai.modelName);
            return {
                messages: [], // Add required property
                output: response.output || '',
                error: undefined,
            };
        }
        catch (error) {
            const logger = await this.getLogger();
            logger.error('Agent invocation failed', error);
            return {
                output: '',
                error: error.message,
            };
        }
    }
    async executeWithTimeout(operation, timeout) {
        const resourceManager = await this.container.resolve(SERVICE_NAMES.RESOURCE_MANAGER);
        const controllerId = `timeout-${Date.now()}-${Math.random()}`;
        const abortController = resourceManager.createAbortController(controllerId);
        try {
            return await Promise.race([
                operation(),
                new Promise((_, reject) => {
                    const timeoutId = setTimeout(() => {
                        abortController.abort();
                        reject(new TestTimeoutError(`Operation timed out after ${timeout}ms`));
                    }, timeout);
                    abortController.signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                    });
                }),
            ]);
        }
        finally {
            resourceManager.disposeAbortController(controllerId);
        }
    }
}
//# sourceMappingURL=test-framework-di.js.map