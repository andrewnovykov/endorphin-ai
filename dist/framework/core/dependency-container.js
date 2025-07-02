/**
 * Dependency Injection Container
 * Manages service registration, resolution, and lifecycle
 */
// Simple console logging to avoid circular dependencies
const log = {
    info: (msg, data) => console.log(`[DI] ${msg}`, data || ''),
    debug: (msg, data) => console.debug(`[DI] ${msg}`, data || ''),
    warn: (msg, data) => console.warn(`[DI] ${msg}`, data || ''),
    error: (msg, error) => console.error(`[DI] ${msg}`, error || ''),
};
export var ServiceLifetime;
(function (ServiceLifetime) {
    ServiceLifetime["SINGLETON"] = "singleton";
    ServiceLifetime["TRANSIENT"] = "transient";
    ServiceLifetime["SCOPED"] = "scoped";
})(ServiceLifetime || (ServiceLifetime = {}));
export class DependencyContainer {
    services = new Map();
    singletonInstances = new Map();
    scopedInstances = new Map();
    resolutionStack = [];
    options;
    constructor(options = {}) {
        this.options = {
            enableAutoResolution: true,
            enableCircularDependencyDetection: true,
            enableLogging: false,
            ...options,
        };
        if (this.options.enableLogging) {
            log.info('Dependency container initialized', this.options);
        }
    }
    /**
     * Register a service with factory function
     */
    registerFactory(name, factory, lifetime = ServiceLifetime.SINGLETON, dependencies = [], metadata) {
        const descriptor = {
            name,
            factory,
            lifetime,
            dependencies,
            metadata: metadata || {},
            constructor: factory, // DI container compatibility
        };
        this.services.set(name, descriptor);
        if (this.options.enableLogging) {
            log.debug(`Registered factory service: ${name}`, {
                lifetime,
                dependencies,
                metadata,
            });
        }
    }
    /**
     * Register a service with constructor
     */
    registerConstructor(name, constructor, lifetime = ServiceLifetime.SINGLETON, dependencies = [], metadata) {
        const descriptor = {
            name,
            constructor,
            lifetime,
            dependencies,
            metadata: metadata || {},
        };
        this.services.set(name, descriptor);
        if (this.options.enableLogging) {
            log.debug(`Registered constructor service: ${name}`, {
                lifetime,
                dependencies,
                metadata,
            });
        }
    }
    /**
     * Register a singleton instance
     */
    registerInstance(name, instance, metadata) {
        const descriptor = {
            name,
            instance,
            lifetime: ServiceLifetime.SINGLETON,
            dependencies: [],
            metadata: metadata || {},
            constructor: (() => instance), // DI container compatibility
        };
        this.services.set(name, descriptor);
        this.singletonInstances.set(name, instance);
        if (this.options.enableLogging) {
            log.debug(`Registered instance service: ${name}`, { metadata });
        }
    }
    /**
     * Resolve a service by name
     */
    async resolve(name) {
        if (this.options.enableLogging) {
            log.debug(`Resolving service: ${name}`);
        }
        try {
            // Check for circular dependencies
            if (this.options.enableCircularDependencyDetection && this.resolutionStack.includes(name)) {
                throw new Error(`Circular dependency detected: ${this.resolutionStack.join(' -> ')} -> ${name}`);
            }
            this.resolutionStack.push(name);
            const service = await this.resolveInternal(name);
            this.resolutionStack.pop();
            if (this.options.enableLogging) {
                log.debug(`Successfully resolved service: ${name}`);
            }
            return service;
        }
        catch (error) {
            this.resolutionStack = []; // Clear stack on error
            log.error(`Failed to resolve service: ${name}`, error);
            throw error;
        }
    }
    /**
     * Try to resolve a service (returns null if not found)
     */
    async tryResolve(name) {
        try {
            return await this.resolve(name);
        }
        catch {
            return null;
        }
    }
    /**
     * Check if a service is registered
     */
    isRegistered(name) {
        return this.services.has(name);
    }
    /**
     * Get all registered service names
     */
    getRegisteredServices() {
        return Array.from(this.services.keys());
    }
    /**
     * Get service descriptor
     */
    getServiceDescriptor(name) {
        return this.services.get(name);
    }
    /**
     * Clear all scoped instances
     */
    clearScope() {
        this.scopedInstances.clear();
        if (this.options.enableLogging) {
            log.debug('Cleared scoped instances');
        }
    }
    /**
     * Dispose container and cleanup resources
     */
    async dispose() {
        log.info('Disposing dependency container');
        // Dispose singleton instances that have dispose method
        for (const [name, instance] of this.singletonInstances) {
            if (instance && typeof instance.dispose === 'function') {
                try {
                    await instance.dispose();
                    log.debug(`Disposed singleton service: ${name}`);
                }
                catch (error) {
                    log.warn(`Failed to dispose service: ${name}`, error);
                }
            }
        }
        // Clear all caches
        this.services.clear();
        this.singletonInstances.clear();
        this.scopedInstances.clear();
        this.resolutionStack = [];
        log.info('Dependency container disposed');
    }
    /**
     * Create a child container (inherits registrations)
     */
    createChildContainer(options) {
        const child = new DependencyContainer({
            ...this.options,
            ...options,
        });
        // Copy service registrations (but not instances)
        for (const [name, descriptor] of this.services) {
            child.services.set(name, { ...descriptor });
        }
        if (this.options.enableLogging) {
            log.debug(`Created child container with ${this.services.size} inherited services`);
        }
        return child;
    }
    /**
     * Get container statistics
     */
    getStatistics() {
        return {
            totalServices: this.services.size,
            singletonInstances: this.singletonInstances.size,
            scopedInstances: this.scopedInstances.size,
            resolutionStackDepth: this.resolutionStack.length,
            servicesByLifetime: this.getServicesByLifetime(),
        };
    }
    // Private methods
    async resolveInternal(name) {
        const descriptor = this.services.get(name);
        if (!descriptor) {
            if (this.options.enableAutoResolution) {
                throw new Error(`Service '${name}' is not registered and auto-resolution is not implemented`);
            }
            else {
                throw new Error(`Service '${name}' is not registered`);
            }
        }
        // Handle existing instance
        if (descriptor.instance !== undefined) {
            return descriptor.instance;
        }
        // Handle singleton lifetime
        if (descriptor.lifetime === ServiceLifetime.SINGLETON) {
            const existing = this.singletonInstances.get(name);
            if (existing !== undefined) {
                return existing;
            }
        }
        // Handle scoped lifetime
        if (descriptor.lifetime === ServiceLifetime.SCOPED) {
            const existing = this.scopedInstances.get(name);
            if (existing !== undefined) {
                return existing;
            }
        }
        // Resolve dependencies
        const dependencies = await this.resolveDependencies(descriptor.dependencies);
        // Create instance
        let instance;
        if (descriptor.factory) {
            instance = await descriptor.factory(...dependencies);
        }
        else if (descriptor.constructor) {
            instance = new descriptor.constructor(...dependencies);
        }
        else {
            throw new Error(`Service '${name}' has no factory or constructor`);
        }
        // Cache instance based on lifetime
        if (descriptor.lifetime === ServiceLifetime.SINGLETON) {
            this.singletonInstances.set(name, instance);
        }
        else if (descriptor.lifetime === ServiceLifetime.SCOPED) {
            this.scopedInstances.set(name, instance);
        }
        return instance;
    }
    async resolveDependencies(dependencies) {
        const resolved = [];
        for (const dependency of dependencies) {
            const service = await this.resolve(dependency);
            resolved.push(service);
        }
        return resolved;
    }
    getServicesByLifetime() {
        const stats = {
            [ServiceLifetime.SINGLETON]: 0,
            [ServiceLifetime.TRANSIENT]: 0,
            [ServiceLifetime.SCOPED]: 0,
        };
        for (const descriptor of this.services.values()) {
            stats[descriptor.lifetime]++;
        }
        return stats;
    }
}
// Global container instance
export const globalContainer = new DependencyContainer({
    enableAutoResolution: true,
    enableCircularDependencyDetection: true,
    enableLogging: false,
});
// Decorator for automatic service registration
export function Injectable(options = {}) {
    return function (constructor) {
        const serviceName = options.name || constructor.name;
        globalContainer.registerConstructor(serviceName, constructor, options.lifetime || ServiceLifetime.SINGLETON, options.dependencies || [], options.metadata);
        return constructor;
    };
}
// Decorator for dependency injection
export function Inject(serviceName) {
    return function (target, propertyKey, parameterIndex) {
        // This would be used with a metadata reflection library in a full implementation
        // For now, it serves as a marker for future enhancement
        const existingMetadata = Reflect.getMetadata?.('inject:dependencies', target) || [];
        existingMetadata[parameterIndex] = serviceName;
        Reflect.defineMetadata?.('inject:dependencies', existingMetadata, target);
    };
}
// Factory function for creating containers
export function createContainer(options) {
    return new DependencyContainer(options);
}
//# sourceMappingURL=dependency-container.js.map