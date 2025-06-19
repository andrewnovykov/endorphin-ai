// framework/tools/index.js
import { createNavigationTool } from './navigation.js';
import { createGetPageContentTool, createGetSimplePageContentTool } from './content.js';
import { createClickTool, createFillTool, createClearFieldTool } from './interaction.js';
import { createVerifyElementTool, createGetElementInfoTool } from './verification.js';
import { createWaitTool, createScreenshotTool } from './utilities.js';

/**
 * Create all browser automation tools for the framework
 * @param {EnhancedBrowserTestFramework} framework - Framework instance
 * @returns {Array} Array of all configured tools
 */
export function createAllTools(framework) {
  return [
    // Navigation tools
    createNavigationTool(framework),
    
    // Content analysis tools
    createGetPageContentTool(framework),
    createGetSimplePageContentTool(framework),
    
    // Interaction tools
    createClickTool(framework),
    createFillTool(framework),
    createClearFieldTool(framework),
    
    // Verification tools
    createVerifyElementTool(framework),
    createGetElementInfoTool(framework),
    
    // Utility tools
    createWaitTool(framework),
    createScreenshotTool(framework)
  ];
}

export default createAllTools;
