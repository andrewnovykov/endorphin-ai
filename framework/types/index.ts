/**
 * Main type exports for Endorphin AI Framework
 * Re-exports all types from individual modules
 */

// Agent and AI types
export type {
  AIConfig,
  BrowserTool, NaturalLanguageResult, ToolCall, ToolParams
} from './agent.js';

// Browser types
export type {
  BrowserConfig, BrowserTools, ClickParams,
  FillParams, NavigateParams, Screenshot, ScreenshotParams, ViewportSize
} from './browser.js';

// CLI types
export type {
  CLIFlags
} from './cli.js';

// Configuration types
export type {
  ExecutionConfig, FrameworkConfig, ResultsConfig
} from './config.js';

// Error types
export {
  BrowserError,
  ConfigurationError, EndorphinError,
  TestExecutionError
} from './errors.js';

// Recorder types
export type {
  RecorderCommand, RecorderSession
} from './recorder.js';

// Reporter types
export type {
  ReportOptions, TestReport, TestSummary
} from './reporter.js';

// Test types
export type {
  DiscoveryResult, TaskResult, TestCase, TestConfig, TestResult, TestSession,
  TestStep
} from './test.js';

