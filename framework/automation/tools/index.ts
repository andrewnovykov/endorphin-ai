/**
 * Browser Automation Tools Collection
 * Provides all LangChain tools for browser automation
 */

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
import { 
  createGetElementInfoTool, 
  createVerifyElementTool, 
  createVerifyTextContentTool,
  createVerifyTitleTool,
  createVerifyURLTool
} from './verification.js';

/**
 * Create all browser automation tools for the framework
 * @param framework - Framework instance
 * @returns Array of all configured LangChain tools
 */
export function createAllTools(framework: any): any[] {
  // Built-in browser automation tools
  const builtInTools = [
    // Navigation tools
    createNavigationTool(framework),

    // Content analysis tools
    createDifferentialContentTool(framework), // Primary: differential snapshots
    createGetPageContentTool(framework), // Standard content extraction
    createGetSimplePageContentTool(framework), // Simple content extraction

    // Interaction tools
    createClickTool(framework),
    createFillTool(framework),
    createClearFieldTool(framework),
    createDescribeTool(framework),
    createPressSequentiallyTool(framework),

    // Verification tools
    createVerifyElementTool(framework),
    createGetElementInfoTool(framework),
    createVerifyTextContentTool(framework), // New tool for better text verification
    createVerifyTitleTool(framework), // New tool for title verification
    createVerifyURLTool(framework), // New tool for URL verification

    // Utility tools
    createWaitTool(framework),
    createScreenshotTool(framework),
  ];

  console.log(`🛠️ Total built-in tools available: ${builtInTools.length}`);

  return builtInTools;
}
