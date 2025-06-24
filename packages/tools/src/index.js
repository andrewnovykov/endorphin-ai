// Endorphin e2e AI test framework>
// Copyright (C)  2025 Redstudio Agency

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

// Export individual tool categories for testing
export const navigationTools = {
  createNavigationTool
};

export const contentTools = {
  createGetPageContentTool,
  createGetSimplePageContentTool
};

export const interactionTools = {
  createClickTool,
  createFillTool,
  createClearFieldTool
};

export const verificationTools = {
  createVerifyElementTool,
  createGetElementInfoTool
};

export const utilityTools = {
  createWaitTool,
  createScreenshotTool
};

export default createAllTools;
