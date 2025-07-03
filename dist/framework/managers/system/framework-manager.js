/**
 * Framework Manager
 * Manages framework configuration, initialization, and high-level operations
 */
import * as path from 'node:path';
import { BrowserEngine } from '../../automation/engines/browser-engine.js';
import { HtmlReporter } from '../../reporters/html-reporter.js';
import { TestResultsManager } from '../../results/test-results-manager.js';
/**
 * Framework Manager
 * High-level framework operations and configuration management
 */
export class FrameworkManager {
    config;
    resultsManager;
    resultBaseDir;
    recorderBaseDir;
    isInteractiveMode = false;
    constructor(config = {}) {
        // Initialize configuration with defaults - deep merge to prevent issues
        const defaultConfig = {
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
            },
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
            },
            testsDirectory: 'tests',
            dataDirectory: 'test-data',
            resultsDirectory: 'test-results',
            environment: 'development',
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
    }
    /**
     * Create a browser engine instance
     */
    createBrowserEngine(frameworkInstance) {
        const engineConfig = {
            framework: this.config,
            resultBaseDir: this.resultBaseDir,
            recorderBaseDir: this.recorderBaseDir,
            isInteractiveMode: this.isInteractiveMode,
            frameworkInstance,
        };
        return new BrowserEngine(engineConfig);
    }
    /**
     * Run a single task
     */
    async runTask(taskDescription, testName = null) {
        const engine = this.createBrowserEngine();
        try {
            await engine.initialize();
            return await engine.runTask(taskDescription, testName);
        }
        finally {
            await engine.cleanup();
        }
    }
    /**
     * Run multiple tasks sequentially
     */
    async runMultipleTasks(tasks) {
        console.log(`\n🚀 Running ${tasks.length} tasks sequentially...\n`);
        const results = [];
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskName = task.name || `Task-${i + 1}`;
            const result = await this.runTask(task.description, taskName);
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
        const engine = this.createBrowserEngine();
        try {
            await engine.initialize();
            return await engine.runSingleTest(test);
        }
        finally {
            await engine.cleanup();
        }
    }
    /**
     * Run multiple tests
     */
    async runMultipleTests(tests) {
        console.log(`\n🎯 Running ${tests.length} tests with enhanced result tracking...`);
        const results = [];
        for (const test of tests) {
            const result = await this.runSingleTest(test);
            results.push({
                testId: test.id,
                testName: test.name,
                ...result,
            });
            // Brief pause between tests
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // Generate final report using the shared method
        return await this.generateTestReport(results);
    }
    /**
     * Generate test report from results
     */
    async generateTestReport(results) {
        // Generate final report using HtmlReporter
        const htmlReporter = new HtmlReporter(this.resultBaseDir);
        const reportPath = await htmlReporter.generateReport();
        // Create TestReport object
        const passed = results.filter((r) => r.success).length;
        const failed = results.length - passed;
        const report = {
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
                screenshots: result.session?.steps?.flatMap((step) => step.screenshots?.map((s) => s.filename) || []) || [],
                logs: result.session?.steps?.map((step) => step.description) || [],
                timestamp: result.session?.startTime || new Date().toISOString(),
            })),
        };
        console.log(`\n🎉 All tests completed!`);
        console.log(`📊 Final Results: ${results.filter((r) => r.success).length}/${results.length} passed`);
        console.log(`📄 HTML Report: ${reportPath}`);
        return { results, report };
    }
    /**
     * Enable interactive mode
     */
    enableInteractiveMode() {
        this.isInteractiveMode = true;
        console.log('📼 Interactive mode enabled - results will be recorded in test-recorder folder');
        // Update results manager to enable recorder copy
        this.resultsManager = new TestResultsManager({
            resultsDir: this.resultBaseDir,
            recorderDir: this.recorderBaseDir,
            enableRecorderCopy: false,
        });
    }
    /**
     * Disable interactive mode
     */
    disableInteractiveMode() {
        this.isInteractiveMode = false;
        // Update results manager to disable recorder copy
        this.resultsManager = new TestResultsManager({
            resultsDir: this.resultBaseDir,
            recorderDir: this.recorderBaseDir,
            enableRecorderCopy: false,
        });
    }
    /**
     * Set interactive mode
     */
    setInteractiveMode(interactive) {
        if (interactive) {
            this.enableInteractiveMode();
        }
        else {
            this.disableInteractiveMode();
        }
    }
    /**
     * Get framework configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Update framework configuration
     */
    updateConfig(updates) {
        this.config = {
            ...this.config,
            ...updates,
            browser: {
                ...this.config.browser,
                ...(updates.browser || {}),
            },
            ai: {
                ...this.config.ai,
                ...(updates.ai || {}),
            },
            execution: {
                timeout: this.config.execution?.timeout || 30000,
                parallel: this.config.execution?.parallel || false,
                retries: this.config.execution?.retries || 0,
                ...this.config.execution,
                ...(updates.execution || {}),
            },
        };
    }
    /**
     * Get results manager
     */
    getResultsManager() {
        return this.resultsManager;
    }
    /**
     * Get result directories
     */
    getDirectories() {
        return {
            results: this.resultBaseDir,
            recorder: this.recorderBaseDir,
        };
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        const errors = [];
        // Check API key
        if (!this.config.ai?.openai?.apiKey) {
            errors.push('OpenAI API key is required');
        }
        // Check browser config
        if (!this.config.browser?.type) {
            errors.push('Browser type is required');
        }
        // Check timeout values
        if (this.config.execution?.timeout && this.config.execution.timeout < 1000) {
            errors.push('Execution timeout must be at least 1000ms');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Get framework statistics
     */
    getStatistics() {
        return {
            config: {
                browser: this.config.browser?.type || 'unknown',
                model: this.config.ai?.openai?.modelName || 'unknown',
                environment: this.config.environment || 'unknown',
            },
            directories: {
                results: this.resultBaseDir,
                recorder: this.recorderBaseDir,
            },
            features: {
                interactiveMode: this.isInteractiveMode,
                parallelExecution: this.config.execution?.parallel || false,
            },
        };
    }
}
//# sourceMappingURL=framework-manager.js.map