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

import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createGetPageContentTool(framework) {
  return tool(async ({ includeTitle = true, maxLength = 8000 }) => {
    const stepDesc = "Get page content for analysis";
    console.log(`📄 ${stepDesc}`);
    
    try {
      let content = '';
      
      if (includeTitle) {
        const title = await framework.page.title();
        const url = framework.page.url();
        content += `Page Title: ${title}\nURL: ${url}\n\n`;
      }
      
      const htmlContent = await framework.page.content();
      const truncatedContent = htmlContent.length > maxLength 
        ? htmlContent.substring(0, maxLength) + '\n... (truncated for brevity)'
        : htmlContent;
      content += truncatedContent;
      
      framework.logTestStep(stepDesc, 'getPageContent', { includeTitle, maxLength }, `Retrieved ${content.length} characters`, true);
      return content;
    } catch (error) {
      framework.logTestStep(stepDesc, 'getPageContent', { includeTitle, maxLength }, error.message, false);
      throw error;
    }
  }, {
    name: 'getPageContent',
    description: 'Get HTML content of the current page for analysis.',
    schema: z.object({
      includeTitle: z.boolean().optional(),
      maxLength: z.number().optional(),
    })
  });
}

export function createGetSimplePageContentTool(framework) {
  return tool(async () => {
    console.log("📄 Getting page content");
    const content = await framework.page.content();
    framework.logTestStep("Get simple page content", 'getSimplePageContent', {}, `Retrieved ${content.length} characters`, true);
    return content;
  }, {
    name: 'getSimplePageContent',
    description: 'Get the current HTML content of the page to analyze its structure.',
    schema: z.object({})
  });
}
