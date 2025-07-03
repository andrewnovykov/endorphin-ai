/**
 * Endorphin AI Framework - Main Entry Point
 * Copyright (C) 2025 Redstudio Agency
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */
export { setupAgent } from './ai/agent-setup.js';
export { EnhancedBrowserTestFramework } from './automation/browser/browser-framework.js';
export { TestFramework } from './core/test-framework.js';
export { TestManager } from './core/test-manager.js';
export { createTestSession, generateSessionSummary, saveTestSession } from './core/test-session.js';
export { TokenTracker } from './core/token-tracker.js';
export { runTask, runTaskSequence } from './execution/tasks/task-executor.js';
export { createAllTools } from './automation/tools/index.js';
export { BrowserManager } from './automation/browser/browser-manager.js';
export { ConfigManager } from './core/config-manager.js';
export { SessionManager } from './core/session-manager.js';
export { ToolManager } from './core/tool-manager.js';
export { createContainer, DependencyContainer, globalContainer, Inject, Injectable, ServiceLifetime, } from './core/dependency-container.js';
export { createServiceRegistry, registerFrameworkServices, SERVICE_NAMES, ServiceRegistry, } from './core/service-registry.js';
export { TestFrameworkDI } from './core/test-framework-di.js';
export { AGENT_CONFIG } from './ai/config/agent-config.js';
export { BROWSER_CONFIG } from './automation/config/browser-config.js';
export { PATHS } from './config/paths.js';
export { ConsoleReporter } from './reporters/console-reporter.js';
export { HtmlReporter } from './reporters/html-reporter.js';
export { TestResultsManager } from './results/test-results-manager.js';
export { TestResultsParser } from './results/test-results-parser.js';
export { runInteractiveRecorder, TestRecorder } from './test-recorder/index.js';
export { initProject } from './cli/init-command.js';
export { generateData, generateDataArray } from './utils/index.js';
export { createGetPageContentTool, createGetSimplePageContentTool } from './automation/tools/content.js';
export { createContentOptimizationTool } from './automation/tools/content-optimization.js';
export { createDifferentialContentTool } from './automation/tools/differential-content.js';
export { createClearFieldTool, createClickTool, createFillTool, createDescribeTool, createPressSequentiallyTool } from './automation/tools/interaction.js';
export { createNavigationTool } from './automation/tools/navigation.js';
export { createScreenshotTool, createWaitTool } from './automation/tools/utilities.js';
export { createGetElementInfoTool, createVerifyElementTool } from './automation/tools/verification.js';
export { PageSnapshotManager } from './managers/content/snapshot-manager.js';
export type { PageDelta, PageSnapshot } from './content/types/snapshot-types.js';
export type * from './types/index.js';
import { TestFramework } from './core/test-framework.js';
export default TestFramework;
//# sourceMappingURL=index.d.ts.map