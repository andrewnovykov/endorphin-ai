/**
 * Enhanced Browser Test Framework - Core Framework Class (TypeScript)
 * Re-export and backward compatibility layer
 */
import { FrameworkManager } from '../../managers/system/framework-manager.js';
/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Provides backward compatibility while using the new modular architecture
 */
export class EnhancedBrowserTestFramework {
    frameworkManager;
    browserEngine = null;
    constructor(config = {}) {
        this.frameworkManager = new FrameworkManager(config);
    }
    /**
     * Initialize framework
     */
    async initialize() {
        // Only initialize if not already initialized
        if (this.browserEngine) {
            console.log('⚡ Framework already initialized, reusing existing instance');
            return;
        }
        console.log('🚀 Initializing Enhanced Browser Test Framework...');
        // Create and initialize browser engine
        this.browserEngine = this.frameworkManager.createBrowserEngine(this);
        await this.browserEngine.initialize();
        console.log('✅ Framework initialized successfully!');
    }
    /**
     * Run a single task
     */
    async runTask(taskDescription, testName = null) {
        if (!this.browserEngine) {
            throw new Error('Framework not initialized. Call initialize() first.');
        }
        return await this.browserEngine.runTask(taskDescription, testName);
    }
    /**
     * Run multiple tasks
     */
    async runMultipleTasks(tasks) {
        if (!this.browserEngine) {
            throw new Error('Framework not initialized. Call initialize() first.');
        }
        console.log(`\n🚀 Running ${tasks.length} tasks sequentially...\n`);
        const results = [];
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskName = task.name || `Task-${i + 1}`;
            const result = await this.browserEngine.runTask(task.description, taskName);
            results.push(result);
            // Add delay between tasks
            if (i < tasks.length - 1) {
                console.log('⏱️ Waiting before next task...\n');
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        return results;
    }
    /**
     * Run a single test
     */
    async runSingleTest(test) {
        if (!this.browserEngine) {
            throw new Error('Framework not initialized. Call initialize() first.');
        }
        return await this.browserEngine.runSingleTest(test);
    }
    /**
     * Run multiple tests
     */
    async runMultipleTests(tests) {
        if (!this.browserEngine) {
            throw new Error('Framework not initialized. Call initialize() first.');
        }
        console.log(`\n🎯 Running ${tests.length} tests with enhanced result tracking...`);
        const results = [];
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
    async enableInteractiveMode() {
        await this.frameworkManager.enableInteractiveMode();
        if (this.browserEngine) {
            await this.browserEngine.enableInteractiveMode();
        }
    }
    /**
     * Disable interactive mode
     */
    disableInteractiveMode() {
        this.frameworkManager.disableInteractiveMode();
        if (this.browserEngine) {
            this.browserEngine.disableInteractiveMode();
        }
    }
    /**
     * Set interactive mode
     */
    setInteractiveMode(interactive) {
        this.frameworkManager.setInteractiveMode(interactive);
        if (this.browserEngine) {
            this.browserEngine.setInteractiveMode(interactive);
        }
    }
    /**
     * Cleanup framework resources
     */
    async cleanup() {
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
    get activeTestSession() {
        return this.browserEngine?.activeTestSession || null;
    }
    get frameworkConfig() {
        return this.frameworkManager.getConfig();
    }
    getBrowserManager() {
        return this.browserEngine?.getBrowserManager() || null;
    }
    getSnapshotManager() {
        return this.browserEngine?.getSnapshotManager() || null;
    }
    // Framework manager methods
    getFrameworkManager() {
        return this.frameworkManager;
    }
    getBrowserEngine() {
        return this.browserEngine;
    }
    getConfig() {
        return this.frameworkManager.getConfig();
    }
    updateConfig(updates) {
        this.frameworkManager.updateConfig(updates);
    }
    validateConfig() {
        return this.frameworkManager.validateConfig();
    }
    getStatistics() {
        return this.frameworkManager.getStatistics();
    }
    getDirectories() {
        return this.frameworkManager.getDirectories();
    }
    // Delegator methods for tools compatibility
    logTestStep(stepDescription, toolName = null, toolArgs = null, result = null, isSuccess = true) {
        if (this.browserEngine) {
            this.browserEngine.logTestStep(stepDescription, toolName, toolArgs, result, isSuccess);
        }
    }
    async takeStepScreenshot(description = null) {
        if (this.browserEngine) {
            return await this.browserEngine.takeStepScreenshot(description);
        }
        return null;
    }
    async createTestSession(testName, testId = null) {
        if (this.browserEngine) {
            return await this.browserEngine.createTestSession(testName, testId);
        }
        return null;
    }
}
// Re-export for backward compatibility
export { BrowserEngine } from '../engines/browser-engine.js';
export { FrameworkManager } from '../../managers/system/framework-manager.js';
//# sourceMappingURL=browser-framework.js.map