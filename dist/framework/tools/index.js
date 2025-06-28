/**
 * Browser Automation Tools Collection
 * Provides all LangChain tools for browser automation
 */
import { createGetPageContentTool, createGetSimplePageContentTool } from './content.js';
import { createClearFieldTool, createClickTool, createFillTool } from './interaction.js';
import { createNavigationTool } from './navigation.js';
import { createScreenshotTool, createWaitTool } from './utilities.js';
import { createGetElementInfoTool, createVerifyElementTool } from './verification.js';
/**
 * Create all browser automation tools for the framework
 * @param framework - Framework instance
 * @returns Array of all configured LangChain tools
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
        createScreenshotTool(framework),
    ];
}
//# sourceMappingURL=index.js.map