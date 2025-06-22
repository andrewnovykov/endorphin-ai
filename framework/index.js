// Endorphin e2e AI test framework
// Copyright (C) 2025 Redstudio Agency

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

export { EnhancedBrowserTestFramework } from './core/browser-framework.js';
export { TestRecorder } from './core/test-recorder.js';
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
export * as Interactive from './interactive/index.js';
export * as Testing from './testing/index.js';

// Individual tool creators for custom setups
export { createNavigationTool } from './tools/navigation.js';
export { createGetPageContentTool, createGetSimplePageContentTool } from './tools/content.js';
export { createClickTool, createFillTool, createClearFieldTool } from './tools/interaction.js';
export { createVerifyElementTool, createGetElementInfoTool } from './tools/verification.js';
export { createWaitTool, createScreenshotTool } from './tools/utilities.js';

// Default export for simple usage: import EndorphinAI from 'endorphin-ai'
import { EnhancedBrowserTestFramework } from './core/browser-framework.js';
export default EnhancedBrowserTestFramework;
