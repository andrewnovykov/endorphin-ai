// framework/index.js
export { EnhancedBrowserTestFramework } from './core/browser-framework.js';
export { runTask, runTaskSequence } from './core/test-runner.js';
export { createTestSession, generateSessionSummary, saveTestSession } from './core/test-session.js';
export { setupAgent } from './core/agent-setup.js';
export { createAllTools } from './tools/index.js';
export { TestManager } from './core/test-manager.js';

// Configuration exports
export { BROWSER_CONFIG } from './config/browser-config.js';
export { AGENT_CONFIG } from './config/agent-config.js';
export { PATHS } from './config/paths.js';

// Module exports for organized components
export * as Demos from './demos/index.js';
export * as Interactive from './interactive/index.js';
export * as Testing from './testing/index.js';

// Individual tool creators for custom setups
export { createNavigationTool } from './tools/navigation.js';
export { createGetPageContentTool, createGetSimplePageContentTool } from './tools/content.js';
export { createClickTool, createFillTool, createClearFieldTool } from './tools/interaction.js';
export { createVerifyElementTool, createGetElementInfoTool } from './tools/verification.js';
export { createWaitTool, createScreenshotTool } from './tools/utilities.js';
