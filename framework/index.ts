/**
 * Endorphin AI Framework - Main Entry Point
 * Copyright (C) 2025 Redstudio Agency
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

// Core framework exports
export { setupAgent } from './core/agent-setup.js';
export { EnhancedBrowserTestFramework } from './core/browser-framework.js';
export { TestManager } from './core/test-manager.js';
export { createTestSession, generateSessionSummary, saveTestSession } from './core/test-session.js';
export { runTask, runTaskSequence } from './runner/task-executor.js';
export { createAllTools } from './tools/index.js';

// Configuration exports
export { AGENT_CONFIG } from './config/agent-config.js';
export { BROWSER_CONFIG } from './config/browser-config.js';
export { PATHS } from './config/paths.js';

// Reporters and Results
export { ConsoleReporter } from './reporters/console-reporter.js';
export { HtmlReporter } from './reporters/html-reporter.js';
export { TestResultsManager } from './results/test-results-manager.js';
export { TestResultsParser } from './results/test-results-parser.js';

// Test Recorder
export { runInteractiveRecorder, TestRecorder } from './test-recorder/index.js';

// CLI
export { initProject } from './cli/init-command.js';

// Individual tool creators for custom setups
export { createGetPageContentTool, createGetSimplePageContentTool } from './tools/content.js';
export { createClearFieldTool, createClickTool, createFillTool } from './tools/interaction.js';
export { createNavigationTool } from './tools/navigation.js';
export { createScreenshotTool, createWaitTool } from './tools/utilities.js';
export { createGetElementInfoTool, createVerifyElementTool } from './tools/verification.js';

// Type exports
export type * from './types/index.js';

// Default export for simple usage: import EndorphinAI from 'endorphin-ai'
import { EnhancedBrowserTestFramework } from './core/browser-framework.js';
export default EnhancedBrowserTestFramework;
