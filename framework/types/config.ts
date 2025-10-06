/**
 * Framework configuration types
 */

import type { PricingConfig } from '../config/pricing-config';
import type { AIConfig } from './agent.js';
import type { BrowserConfig } from './browser';

export interface FrameworkConfig {
  browser: BrowserConfig;
  ai: AIConfig;
  pricing?: PricingConfig; // Custom token pricing configuration
  execution?: ExecutionConfig;
  results?: ResultsConfig;
  jira?: JiraConfig; // JIRA integration configuration
  testsDirectory: string;
  dataDirectory: string;
  resultsDirectory: string;
  environment: 'development' | 'staging' | 'production';
  baseUrl?: string;
  globalSetup?: string; // Path to global setup file
  mcpServers?: MCPServerConfig[]; // MCP server configurations
  [key: string]: any; // Allow dynamic access
}

export interface ExecutionConfig {
  timeout: number;
}

export interface ResultsConfig {
  directory?: string;
}

export interface JiraConfig {
  url: string;
  email: string;
  apiToken: string;
  projectId: string;
  issueTypeId: string;
  label: string;
}

export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  issueType: string;
  status: string;
  labels: string[];
  created: string;
  updated: string;
}

export interface JiraSyncResult {
  success: boolean;
  ticketsFetched: number;
  testsGenerated: number;
  errors: string[];
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

/**
 * MCP Server Configuration
 * Defines how to connect to an MCP (Model Context Protocol) server
 */
export interface MCPServerConfig {
  /** Unique name for this MCP server */
  name: string;
  
  /** Type of transport to use for connecting to the MCP server */
  transport: 'stdio' | 'sse';
  
  /** Configuration for stdio transport (for local processes) */
  stdio?: {
    /** Command to execute (e.g., 'node', 'python', 'npx') */
    command: string;
    /** Arguments to pass to the command */
    args?: string[];
    /** Environment variables for the process */
    env?: Record<string, string>;
  };
  
  /** Configuration for SSE transport (for remote servers) */
  sse?: {
    /** URL of the MCP server */
    url: string;
    /** Optional headers for authentication */
    headers?: Record<string, string>;
  };
  
  /** Optional: Enable/disable this server */
  enabled?: boolean;
  
  /** Optional: Timeout for server operations in milliseconds */
  timeout?: number;
}
