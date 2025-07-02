/**
 * Service Registry
 * Provides convenient registration of framework services with the DI container
 */
import type { FrameworkConfig } from '../types/index.js';
import { DependencyContainer, ServiceLifetime } from './dependency-container.js';
export declare const SERVICE_NAMES: {
    readonly CONFIG_MANAGER: "ConfigManager";
    readonly BROWSER_MANAGER: "BrowserManager";
    readonly SESSION_MANAGER: "SessionManager";
    readonly TOOL_MANAGER: "ToolManager";
    readonly TOKEN_TRACKER: "TokenTracker";
    readonly PAGE_SNAPSHOT_MANAGER: "PageSnapshotManager";
    readonly RESOURCE_MANAGER: "ResourceManager";
    readonly TEST_RESULTS_MANAGER: "TestResultsManager";
    readonly LOGGER: "Logger";
    readonly HTML_REPORTER: "HtmlReporter";
    readonly CONSOLE_REPORTER: "ConsoleReporter";
};
export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];
export interface ServiceRegistryOptions {
    enableLogging?: boolean;
    customConfig?: Partial<FrameworkConfig>;
}
/**
 * Service Registry for framework services
 */
export declare class ServiceRegistry {
    private container;
    private registered;
    constructor(container: DependencyContainer);
    /**
     * Register all framework services
     */
    registerFrameworkServices(options?: ServiceRegistryOptions): void;
    /**
     * Initialize all singleton services
     */
    initializeServices(): Promise<void>;
    /**
     * Get service statistics
     */
    getServiceStatistics(): {
        registered: boolean;
        containerStats: {
            totalServices: number;
            singletonInstances: number;
            scopedInstances: number;
            resolutionStackDepth: number;
            servicesByLifetime: {
                singleton: number;
                transient: number;
                scoped: number;
            };
        };
        services: {
            name: string;
            lifetime: ServiceLifetime | undefined;
            dependencies: number;
            metadata: Record<string, any> | undefined;
        }[];
    };
    /**
     * Dispose all services
     */
    dispose(): Promise<void>;
}
/**
 * Create and configure a service registry
 */
export declare function createServiceRegistry(container: DependencyContainer, _options?: ServiceRegistryOptions): ServiceRegistry;
/**
 * Register framework services with a container
 */
export declare function registerFrameworkServices(container: DependencyContainer, options?: ServiceRegistryOptions): Promise<ServiceRegistry>;
//# sourceMappingURL=service-registry.d.ts.map