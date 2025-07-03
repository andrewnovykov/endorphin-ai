/**
 * Framework configuration types
 */
import type { PricingConfig } from '../config/pricing-config';
import type { AIConfig } from '../ai/types/agent.js';
import type { BrowserConfig } from './browser';
export interface FrameworkConfig {
    browser: BrowserConfig;
    ai: AIConfig;
    pricing?: PricingConfig;
    execution?: ExecutionConfig;
    results?: ResultsConfig;
    testsDirectory: string;
    dataDirectory: string;
    resultsDirectory: string;
    environment: 'development' | 'staging' | 'production';
    parallel: number;
    maxRetries: number;
    baseUrl?: string;
    globalSetup?: string;
    [key: string]: any;
}
export interface ExecutionConfig {
    timeout: number;
    parallel: boolean;
    retries: number;
}
export interface ResultsConfig {
    directory?: string;
}
/**
 * Global setup function signature
 * Should return a Promise that resolves if setup is successful
 * If the promise rejects, test execution will be stopped
 */
export type GlobalSetupFunction = () => Promise<void>;
/**
 * Global setup module interface
 * The global setup file should have a default export of this type
 */
export interface GlobalSetupModule {
    default: GlobalSetupFunction;
}
/**
 * Global setup execution result
 */
export interface GlobalSetupResult {
    success: boolean;
    error?: Error;
    executionTime: number;
    setupFile?: string;
}
//# sourceMappingURL=config.d.ts.map