/**
 * Content Tools for Browser Automation
 * Provides LangChain tools for page content analysis
 */

import { EnhancedBrowserTestFramework } from '@core/browser-framework';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Creates a get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting page content
 */
export function createGetPageContentTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ 
      includeTitle = true, 
      maxLength = 8000 
    }: { 
      includeTitle?: boolean; 
      maxLength?: number; 
    }) => {
      const stepDesc = 'Get page content for analysis';
      console.log(`📄 ${stepDesc}`);

      try {
        let content = '';

        if (includeTitle) {
          const title = await framework.currentPage!.title();
          const url = framework.currentPage!.url();
          content += `Page Title: ${title}\nURL: ${url}\n\n`;
        }

        const htmlContent = await framework.currentPage!.content();
        const truncatedContent =
          htmlContent.length > maxLength
            ? `${htmlContent.substring(0, maxLength)}\n... (truncated for brevity)`
            : htmlContent;
        content += truncatedContent;

        framework.logTestStep(
          stepDesc,
          'getPageContent',
          { includeTitle, maxLength },
          `Retrieved ${content.length} characters`,
          true
        );
        return content;
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'getPageContent',
          { includeTitle, maxLength },
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'getPageContent',
      description: 'Get HTML content of the current page for analysis.',
      schema: z.object({
        includeTitle: z.boolean().optional(),
        maxLength: z.number().optional(),
      }),
    }
  );
}

/**
 * Creates a simple get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting simple page content
 */
export function createGetSimplePageContentTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async () => {
      console.log('📄 Getting page content');
      const content = await framework.currentPage!.content();
      framework.logTestStep(
        'Get simple page content',
        'getSimplePageContent',
        {},
        `Retrieved ${content.length} characters`,
        true
      );
      return content;
    },
    {
      name: 'getSimplePageContent',
      description: 'Get the current HTML content of the page to analyze its structure.',
      schema: z.object({}),
    }
  );
}
