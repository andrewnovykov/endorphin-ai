/**
 * Framework configuration types
 */
import type { AIConfig } from './agent';
import type { BrowserConfig } from './browser';
export interface FrameworkConfig {
    browser: BrowserConfig;
    ai: AIConfig;
    execution?: ExecutionConfig;
    results?: ResultsConfig;
    testsDirectory: string;
    dataDirectory: string;
    resultsDirectory: string;
    environment: 'development' | 'staging' | 'production';
    parallel: number;
    maxRetries: number;
    baseUrl?: string;
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
//# sourceMappingURL=config.d.ts.map