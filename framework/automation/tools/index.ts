/**
 * Browser Automation Tools Collection
 * Provides all LangChain tools for browser automation
 */

import { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { CustomToolDiscovery } from '../../core/custom-tool-discovery.js';
import { createContentOptimizationTool } from './content-optimization.js';
import { createGetPageContentTool, createGetSimplePageContentTool } from './content.js';
import { createDifferentialContentTool } from './differential-content.js';
import { createClearFieldTool, createClickTool, createFillTool } from './interaction.js';
import { createNavigationTool } from './navigation.js';
import { createScreenshotTool, createWaitTool } from './utilities.js';
import { createGetElementInfoTool, createVerifyElementTool } from './verification.js';

/**
 * Create all browser automation tools for the framework
 * @param framework - Framework instance
 * @returns Array of all configured LangChain tools
 */
export async function createAllTools(framework: EnhancedBrowserTestFramework): Promise<any[]> {
  // Built-in tools
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

    // Verification tools
    createVerifyElementTool(framework),
    createGetElementInfoTool(framework),

    // Utility tools
    createWaitTool(framework),
    createScreenshotTool(framework),
  ];

  // Load custom tools if configured
  let customTools: any[] = [];
  const config = framework.frameworkConfig;
  if (config.customTools && config.customTools.length > 0) {
    try {
      const toolDiscovery = new CustomToolDiscovery(config, framework);
      customTools = await toolDiscovery.discoverAndLoadTools();
    } catch (error: any) {
      console.error('❌ Failed to load custom tools:', error.message);
      // Continue with built-in tools only
    }
  }

  // Merge and log total tools
  const allTools = [...builtInTools, ...customTools];
  console.log(
    `🛠️ Total tools available: ${allTools.length} (${builtInTools.length} built-in, ${customTools.length} custom)`
  );

  return allTools;
}
