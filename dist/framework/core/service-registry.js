/**
 * Service Registry
 * Provides convenient registration of framework services with the DI container
 */
import { ConsoleReporter } from '../reporters/console-reporter.js';
import { HtmlReporter } from '../reporters/html-reporter.js';
import { TestResultsManager } from '../results/test-results-manager.js';
import { BrowserManager } from '../automation/browser/browser-manager.js';
import { ConfigManager } from './config-manager.js';
import { ServiceLifetime } from './dependency-container.js';
import { globalLogger } from './logger.js';
import { PageSnapshotManager } from '../managers/content/snapshot-manager.js';
import { globalResourceManager } from './resource-manager.js';
import { SessionManager } from './session-manager.js';
import { TokenTracker } from './token-tracker.js';
import { ToolManager } from './tool-manager.js';
// Service names constants
export const SERVICE_NAMES = {
    CONFIG_MANAGER: 'ConfigManager',
    BROWSER_MANAGER: 'BrowserManager',
    SESSION_MANAGER: 'SessionManager',
    TOOL_MANAGER: 'ToolManager',
    TOKEN_TRACKER: 'TokenTracker',
    PAGE_SNAPSHOT_MANAGER: 'PageSnapshotManager',
    RESOURCE_MANAGER: 'ResourceManager',
    TEST_RESULTS_MANAGER: 'TestResultsManager',
    LOGGER: 'Logger',
    HTML_REPORTER: 'HtmlReporter',
    CONSOLE_REPORTER: 'ConsoleReporter',
};
/**
 * Service Registry for framework services
 */
export class ServiceRegistry {
    container;
    registered = false;
    constructor(container) {
        this.container = container;
    }
    /**
     * Register all framework services
     */
    registerFrameworkServices(options = {}) {
        if (this.registered) {
            throw new Error('Framework services are already registered');
        }
        const { enableLogging = false, customConfig = {} } = options;
        if (enableLogging) {
            console.log('🔧 Registering framework services...');
        }
        // Register core configuration
        this.container.registerFactory(SERVICE_NAMES.CONFIG_MANAGER, () => new ConfigManager(customConfig), ServiceLifetime.SINGLETON, [], { description: 'Manages framework configuration' });
        // Register resource manager (singleton instance)
        this.container.registerInstance(SERVICE_NAMES.RESOURCE_MANAGER, globalResourceManager, {
            description: 'Manages resource lifecycle and prevents memory leaks',
        });
        // Register logger (singleton instance)
        this.container.registerInstance(SERVICE_NAMES.LOGGER, globalLogger, {
            description: 'Global logging instance',
        });
        // Register browser manager (depends on config)
        this.container.registerFactory(SERVICE_NAMES.BROWSER_MANAGER, (configManager) => {
            return new BrowserManager({
                browser: configManager.getBrowserConfig(),
            });
        }, ServiceLifetime.SINGLETON, [SERVICE_NAMES.CONFIG_MANAGER], { description: 'Manages browser lifecycle and operations' });
        // Register session manager (depends on config)
        this.container.registerFactory(SERVICE_NAMES.SESSION_MANAGER, (configManager) => {
            const directories = configManager.getDirectories();
            const resultBaseDir = path.resolve(process.cwd(), directories.results);
            const recorderBaseDir = path.join(process.cwd(), 'test-recorder');
            return new SessionManager({
                resultBaseDir,
                recorderBaseDir,
                enableRecorderCopy: false,
            });
        }, ServiceLifetime.SINGLETON, [SERVICE_NAMES.CONFIG_MANAGER], { description: 'Manages test session lifecycle' });
        // Register tool manager (depends on config)
        this.container.registerFactory(SERVICE_NAMES.TOOL_MANAGER, (configManager) => {
            return new ToolManager(configManager.getConfig());
        }, ServiceLifetime.SINGLETON, [SERVICE_NAMES.CONFIG_MANAGER], { description: 'Manages tool loading and discovery' });
        // Register token tracker (depends on config)
        this.container.registerFactory(SERVICE_NAMES.TOKEN_TRACKER, (configManager) => {
            const config = configManager.getConfig();
            return new TokenTracker(config.ai?.openai?.modelName || 'gpt-4o', config.pricing);
        }, ServiceLifetime.SINGLETON, [SERVICE_NAMES.CONFIG_MANAGER], { description: 'Tracks AI token usage and costs' });
        // Register page snapshot manager
        this.container.registerFactory(SERVICE_NAMES.PAGE_SNAPSHOT_MANAGER, () => new PageSnapshotManager(), ServiceLifetime.SINGLETON, [], { description: 'Manages page snapshots for optimization' });
        // Register test results manager (depends on config)
        this.container.registerFactory(SERVICE_NAMES.TEST_RESULTS_MANAGER, (configManager) => {
            const directories = configManager.getDirectories();
            const resultBaseDir = path.resolve(process.cwd(), directories.results);
            const recorderBaseDir = path.join(process.cwd(), 'test-recorder');
            return new TestResultsManager({
                resultsDir: resultBaseDir,
                recorderDir: recorderBaseDir,
                enableRecorderCopy: false,
            });
        }, ServiceLifetime.SINGLETON, [SERVICE_NAMES.CONFIG_MANAGER], { description: 'Manages test results storage and retrieval' });
        // Register reporters
        this.container.registerFactory(SERVICE_NAMES.HTML_REPORTER, () => new HtmlReporter(), ServiceLifetime.TRANSIENT, [], { description: 'Generates HTML test reports' });
        this.container.registerFactory(SERVICE_NAMES.CONSOLE_REPORTER, () => new ConsoleReporter(), ServiceLifetime.TRANSIENT, [], { description: 'Provides console output for test results' });
        this.registered = true;
        if (enableLogging) {
            console.log(`✅ Registered ${this.container.getRegisteredServices().length} framework services`);
        }
    }
    /**
     * Initialize all singleton services
     */
    async initializeServices() {
        if (!this.registered) {
            throw new Error('Services must be registered before initialization');
        }
        console.log('🚀 Initializing framework services...');
        // Initialize core services in dependency order
        const initOrder = [
            SERVICE_NAMES.CONFIG_MANAGER,
            SERVICE_NAMES.RESOURCE_MANAGER,
            SERVICE_NAMES.LOGGER,
            SERVICE_NAMES.SESSION_MANAGER,
            SERVICE_NAMES.BROWSER_MANAGER,
            SERVICE_NAMES.TOOL_MANAGER,
            SERVICE_NAMES.TOKEN_TRACKER,
            SERVICE_NAMES.PAGE_SNAPSHOT_MANAGER,
            SERVICE_NAMES.TEST_RESULTS_MANAGER,
        ];
        for (const serviceName of initOrder) {
            try {
                await this.container.resolve(serviceName);
                console.log(`  ✓ ${serviceName} initialized`);
            }
            catch (error) {
                console.error(`  ❌ Failed to initialize ${serviceName}:`, error.message);
                throw error;
            }
        }
        // Initialize session manager directories
        const sessionManager = await this.container.resolve(SERVICE_NAMES.SESSION_MANAGER);
        await sessionManager.initialize();
        // Initialize browser manager
        const browserManager = await this.container.resolve(SERVICE_NAMES.BROWSER_MANAGER);
        await browserManager.initialize();
        console.log('✅ All framework services initialized successfully');
    }
    /**
     * Get service statistics
     */
    getServiceStatistics() {
        return {
            registered: this.registered,
            containerStats: this.container.getStatistics(),
            services: this.container.getRegisteredServices().map((name) => {
                const descriptor = this.container.getServiceDescriptor(name);
                return {
                    name,
                    lifetime: descriptor?.lifetime,
                    dependencies: descriptor?.dependencies.length || 0,
                    metadata: descriptor?.metadata,
                };
            }),
        };
    }
    /**
     * Dispose all services
     */
    async dispose() {
        console.log('🧹 Disposing framework services...');
        await this.container.dispose();
        this.registered = false;
        console.log('✅ Framework services disposed');
    }
}
// Missing import
import * as path from 'node:path';
/**
 * Create and configure a service registry
 */
export function createServiceRegistry(container, _options = {}) {
    return new ServiceRegistry(container);
}
/**
 * Register framework services with a container
 */
export async function registerFrameworkServices(container, options = {}) {
    const registry = new ServiceRegistry(container);
    await registry.registerFrameworkServices(options);
    return registry;
}
//# sourceMappingURL=service-registry.js.map