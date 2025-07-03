/**
 * Resource Management System
 * Handles lifecycle of resources including EventTargets, AbortControllers, and other cleanup
 */
import { EventEmitter } from 'node:events';
export interface ManagedResource {
    id: string;
    type: string;
    created: number;
    dispose(): Promise<void> | void;
}
export interface ResourceStats {
    totalResources: number;
    resourcesByType: Record<string, number>;
    oldestResource: number;
    memoryUsage?: NodeJS.MemoryUsage;
}
export declare class ResourceManager extends EventEmitter {
    private maxResources;
    private cleanupIntervalMs;
    private resources;
    private disposed;
    private cleanupInterval;
    private abortControllers;
    constructor(maxResources?: number, cleanupIntervalMs?: number);
    /**
     * Create and register an AbortController with automatic cleanup
     */
    createAbortController(id?: string): AbortController;
    /**
     * Dispose of a specific AbortController
     */
    disposeAbortController(id: string): void;
    /**
     * Register a managed resource
     */
    register<T extends ManagedResource>(resource: T): T;
    /**
     * Dispose of a specific resource
     */
    dispose(id: string): Promise<void>;
    /**
     * Get resource by ID
     */
    get<T extends ManagedResource>(id: string): T | undefined;
    /**
     * Check if resource exists
     */
    has(id: string): boolean;
    /**
     * Get all resources of a specific type
     */
    getByType<T extends ManagedResource>(type: string): T[];
    /**
     * Get resource statistics
     */
    getStats(): ResourceStats;
    /**
     * Force cleanup of old or unused resources
     */
    cleanup(): void;
    /**
     * Dispose all resources and cleanup
     */
    disposeAll(): Promise<void>;
    /**
     * Check memory usage and warn if threshold exceeded
     */
    checkMemoryUsage(): void;
    private startCleanupTimer;
}
export declare class ManagedAbortController implements ManagedResource {
    readonly id: string;
    readonly type = "abort-controller";
    readonly created: number;
    private controller;
    constructor(id?: string);
    get signal(): AbortSignal;
    abort(): void;
    dispose(): void;
}
export declare class ManagedEventTarget implements ManagedResource {
    readonly id: string;
    readonly type = "event-target";
    readonly created: number;
    private eventTarget;
    private listeners;
    constructor(id?: string, eventTarget?: EventTarget);
    addEventListener(type: string, listener: EventListener, options?: any): void;
    removeEventListener(type: string, listener: EventListener, options?: any): void;
    dispatchEvent(event: Event): boolean;
    dispose(): void;
}
export declare const globalResourceManager: ResourceManager;
//# sourceMappingURL=resource-manager.d.ts.map