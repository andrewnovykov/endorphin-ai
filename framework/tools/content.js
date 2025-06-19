// framework/tools/content.js
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
