/**
 * Framework configuration types
 */

import type { AIConfig } from './agent.js';
import type { BrowserConfig } from './browser.js';

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
  [key: string]: any; // Allow dynamic access
}

export interface ExecutionConfig {
  timeout: number;
  parallel: boolean;
  retries: number;
}

export interface ResultsConfig {
  directory?: string;
}
