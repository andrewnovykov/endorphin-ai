/**
 * Browser Automation Tools Collection
 * Provides all LangChain tools for browser automation
 */

import { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { createContentOptimizationTool } from './content-optimization.js';
import { createGetPageContentTool, createGetSimplePageContentTool } from './content.js';
import { createDifferentialContentTool } from './differential-content.js';
import { 
  createClearFieldTool, 
  createClickTool, 
  createFillTool, 
  createDescribeTool, 
  createPressSequentiallyTool 
} from './interaction.js';
import { createNavigationTool } from './navigation.js';
import { createScreenshotTool, createWaitTool } from './utilities.js';
import { createGetElementInfoTool, createVerifyElementTool } from './verification.js';

/**
 * Create all browser automation tools for the framework
 * @param framework - Framework instance
 * @returns Array of all configured LangChain tools
 */
export async function createAllTools(framework: EnhancedBrowserTestFramework): Promise<any[]> {
  // Built-in browser automation tools
  const builtInTools = [
    // Navigation tools
    createNavigationTool(framework),

    // Content analysis tools (optimized & differential)
    createDifferentialContentTool(framework), // Primary: differential snapshots
    createGetPageContentTool(framework), // Fallback: uses automatic optimization
    createGetSimplePageContentTool(framework), // Simple content extraction
    createContentOptimizationTool(framework), // Direct access to optimization

    // Interaction tools
    createClickTool(framework),
    createFillTool(framework),
    createClearFieldTool(framework),
    createDescribeTool(framework),
    createPressSequentiallyTool(framework),

    // Verification tools
    createVerifyElementTool(framework),
    createGetElementInfoTool(framework),

    // Utility tools
    createWaitTool(framework),
    createScreenshotTool(framework),
  ];

  console.log(`🛠️ Total built-in tools available: ${builtInTools.length}`);

  return builtInTools;
}
