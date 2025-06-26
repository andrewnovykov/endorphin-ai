/**
 * Utility Tools for Browser Automation
 * Provides LangChain tools for utilities (wait, screenshot)
 */

import { EnhancedBrowserTestFramework } from '@core/browser-framework';
import { tool } from '@langchain/core/tools';
import path from 'path';
import { z } from 'zod';

/**
 * Creates a wait tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for waiting
 */
export function createWaitTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ 
      milliseconds = 500, 
      reason, 
      selector, 
      state = 'visible' 
    }: { 
      milliseconds?: number; 
      reason?: string; 
      selector?: string; 
      state?: 'visible' | 'hidden' | 'attached' | 'detached'; 
    }) => {
      const stepDesc = selector
        ? `Wait for ${selector} to be ${state}`
        : `Wait for ${milliseconds}ms${reason ? ` (${reason})` : ''}`;
      console.log(`⏱️ ${stepDesc}`);

      try {
        if (selector) {
          await framework.currentPage!.waitForSelector(selector, { state, timeout: milliseconds });
          const result = `Element ${selector} is now ${state}`;
          framework.logTestStep(
            stepDesc,
            'wait',
            { milliseconds, reason, selector, state },
            result,
            true
          );
          return `✅ ${result}`;
        } else {
          await framework.currentPage!.waitForTimeout(milliseconds);
          const result = `Waited for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
          framework.logTestStep(
            stepDesc,
            'wait',
            { milliseconds, reason, selector, state },
            result,
            true
          );
          return result;
        }
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'wait',
          { milliseconds, reason, selector, state },
          error.message,
          false
        );
        return `❌ Timeout waiting for ${selector} to be ${state}`;
      }
    },
    {
      name: 'wait',
      description: 'Wait for time or element state.',
      schema: z.object({
        milliseconds: z.number().optional(),
        reason: z.string().optional(),
        selector: z.string().optional(),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
      }),
    }
  );
}

/**
 * Creates a screenshot tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for taking screenshots
 */
export function createScreenshotTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ 
      name, 
      selector, 
      fullPage = false 
    }: { 
      name?: string; 
      selector?: string; 
      fullPage?: boolean; 
    }) => {
      if (!framework.activeTestSession) {
        // Create a temporary session for screenshot if none exists
        framework.createTestSession('manual-screenshot');
      }

      const filename = name || `manual-screenshot-${Date.now()}.png`;
      const stepDesc = `Take screenshot: ${filename}`;
      console.log(`📸 ${stepDesc}`);

      try {
        let filePath;
        if (framework.activeTestSession) {
          filePath = path.join(framework.activeTestSession.screenshotsDir, filename);
        } else {
          filePath = filename;
        }

        if (selector) {
          await framework.currentPage!.locator(selector).screenshot({ path: filePath });
        } else {
          await framework.currentPage!.screenshot({ path: filePath, fullPage });
        }

        const result = selector
          ? `Screenshot of ${selector} saved as ${filename}`
          : `${fullPage ? 'Full page' : 'Viewport'} screenshot saved as ${filename}`;

        framework.logTestStep(stepDesc, 'screenshot', { name, selector, fullPage }, result, true);
        return `📸 ${result}`;
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'screenshot',
          { name, selector, fullPage },
          error.message,
          false
        );
        return `❌ Error taking screenshot: ${error.message}`;
      }
    },
    {
      name: 'screenshot',
      description: 'Take screenshot for documentation/debugging.',
      schema: z.object({
        name: z.string().optional(),
        selector: z.string().optional(),
        fullPage: z.boolean().optional(),
      }),
    }
  );
}
