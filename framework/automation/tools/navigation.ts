/**
 * Navigation Tools for Browser Automation
 * Provides LangChain tools for page navigation
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { info, logSuccess, error as logError } from '../../core/logger.js';
import { ICONS } from '../../config/icons.js';
// import { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';

/**
 * Creates a navigation tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for navigation
 */
export function createNavigationTool(framework: any) {
  return tool(
    async (params: {
      location: string;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | undefined;
    }) => {
      const location = params.location;
      const waitUntil = params.waitUntil ?? 'domcontentloaded';

      const stepDesc = `Navigate to: ${location}`;
      
      info(`${ICONS.tools} ${ICONS.web} ${stepDesc}`, { tool: 'navigate', params: { location, waitUntil } }, 'Tool');

      try {
        await framework.currentPage!.goto(location, { waitUntil, timeout: 60000 });
        await framework.takeStepScreenshot(`Page loaded: ${location}`);

        const result = `Successfully navigated to: ${location}`;
        logSuccess(`Result: ${result}`, { tool: 'navigate', result }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'navigate',
          { location, waitUntil },
          result,
          true
        );
        return result;
      } catch (error: any) {
        logError(`Result: Navigation failed: ${error.message}`, error instanceof Error ? error : undefined, { tool: 'navigate', error: error.message }, 'Tool');
        framework.logTestStep(stepDesc, 'navigate', { location, waitUntil }, error.message, false);
        throw error;
      }
    },
    {
      name: 'navigate',
      description: 'Navigate to a URL with enhanced options.',
      schema: z.object({
        location: z.string().describe('URL to navigate to'),
        waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
      }),
    }
  );
}
