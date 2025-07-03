/**
 * Dependency Injection Container
 * Manages service registration, resolution, and lifecycle
 */
export type ServiceFactory<T = any> = (...args: any[]) => T | Promise<T>;
export type ServiceConstructor<T = any> = new (...args: any[]) => T;
export declare enum ServiceLifetime {
    SINGLETON = "singleton",
    TRANSIENT = "transient",
    SCOPED = "scoped"
}
export interface ServiceDescriptor<T = any> {
    name: string;
    factory?: ServiceFactory<T>;
    constructor?: ServiceConstructor<T>;
    instance?: T;
    lifetime: ServiceLifetime;
    dependencies: string[];
    metadata: Record<string, any>;
}
export interface ContainerOptions {
    enableAutoResolution?: boolean;
    enableCircularDependencyDetection?: boolean;
    enableLogging?: boolean;
}
export declare class DependencyContainer {
    private services;
    private singletonInstances;
    private scopedInstances;
    private resolutionStack;
    private options;
    constructor(options?: ContainerOptions);
    /**
     * Register a service with factory function
     */
    registerFactory<T>(name: string, factory: ServiceFactory<T>, lifetime?: ServiceLifetime, dependencies?: string[], metadata?: Record<string, any>): void;
    /**
     * Register a service with constructor
     */
    registerConstructor<T>(name: string, constructor: ServiceConstructor<T>, lifetime?: ServiceLifetime, dependencies?: string[], metadata?: Record<string, any>): void;
    /**
     * Register a singleton instance
     */
    registerInstance<T>(name: string, instance: T, metadata?: Record<string, any>): void;
    /**
     * Resolve a service by name
     */
    resolve<T>(name: string): Promise<T>;
    /**
     * Try to resolve a service (returns null if not found)
     */
    tryResolve<T>(name: string): Promise<T | null>;
    /**
     * Check if a service is registered
     */
    isRegistered(name: string): boolean;
    /**
     * Get all registered service names
     */
    getRegisteredServices(): string[];
    /**
     * Get service descriptor
     */
    getServiceDescriptor(name: string): ServiceDescriptor | undefined;
    /**
     * Clear all scoped instances
     */
    clearScope(): void;
    /**
     * Dispose container and cleanup resources
     */
    dispose(): Promise<void>;
    /**
     * Create a child container (inherits registrations)
     */
    createChildContainer(options?: ContainerOptions): DependencyContainer;
    /**
     * Get container statistics
     */
    getStatistics(): {
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
    private resolveInternal;
    private resolveDependencies;
    private getServicesByLifetime;
}
export declare const globalContainer: DependencyContainer;
export declare function Injectable(options?: {
    name?: string;
    lifetime?: ServiceLifetime;
    dependencies?: string[];
    metadata?: Record<string, any>;
}): <T extends new (...args: any[]) => any>(constructor: T) => T;
export declare function Inject(serviceName: string): (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => void;
export declare function createContainer(options?: ContainerOptions): DependencyContainer;
//# sourceMappingURL=dependency-container.d.ts.map