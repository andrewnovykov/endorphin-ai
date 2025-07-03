/**
 * CLI Functions for Test Discovery
 * Standalone functions for CLI usage with discovery caching
 */
import type { DiscoveryResult, FrameworkConfig, TestConfig } from '../../types/index.js';
import { TestDiscoverer } from './test-discoverer.js';
/**
 * Run a single test by ID
 */
export declare function runSingleTestById(testId: string, config?: FrameworkConfig | null): Promise<DiscoveryResult>;
/**
 * Run tests by tag
 */
export declare function runTestsByTag(tag: string, config?: FrameworkConfig | null, options?: {
    parallel?: number;
}): Promise<DiscoveryResult>;
/**
 * Run tests by priority
 */
export declare function runTestsByPriority(priority: string, config?: FrameworkConfig | null, options?: {
    parallel?: number;
}): Promise<DiscoveryResult>;
/**
 * Run all tests
 */
export declare function runAllTests(config?: FrameworkConfig | null, options?: {
    parallel?: number;
}): Promise<DiscoveryResult>;
/**
 * List all available tests
 */
export declare function listAllTests(config?: FrameworkConfig | null): Promise<DiscoveryResult>;
/**
 * Discover tests and return them as TestConfig array
 */
export declare function discoverTests(config: FrameworkConfig): Promise<TestConfig[]>;
/**
 * Get discovery statistics
 */
export declare function getDiscoveryStatistics(config?: FrameworkConfig | null): Promise<{
    totalTests: number;
    quarantinedTests: number;
    activeTests: number;
    priorities: Record<string, number>;
    tags: Record<string, number>;
    testsDirectory: string;
}>;
/**
 * Clear discovery cache
 */
export declare function clearDiscoveryCache(): void;
/**
 * Clear global setup state (for testing purposes)
 */
export declare function clearGlobalSetupState(): void;
/**
 * Get current discovery instance (for testing)
 */
export declare function getCurrentDiscoveryInstance(): TestDiscoverer | null;
//# sourceMappingURL=cli-functions.d.ts.map