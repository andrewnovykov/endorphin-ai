/**
 * Utility Tools for Browser Automation
 * Provides LangChain tools for utilities (wait, screenshot)
 */

import type { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { tool } from '@langchain/core/tools';
import * as path from 'path';
import { z } from 'zod';

/**
 * Creates a wait tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for waiting
 */
export function createWaitTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      milliseconds?: number | undefined;
      reason?: string | undefined;
      selector?: string | undefined;
      state?: 'visible' | 'hidden' | 'attached' | 'detached' | undefined;
    }) => {
      const milliseconds = params.milliseconds ?? 500;
      const reason = params.reason;
      const selector = params.selector;
      const state = params.state ?? 'visible';
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
    async (params: {
      name?: string | undefined;
      selector?: string | undefined;
      fullPage?: boolean | undefined;
    }) => {
      const name = params.name;
      const selector = params.selector;
      const fullPage = params.fullPage ?? false;

      if (!framework.activeTestSession) {
        // Create a temporary session for screenshot if none exists
        framework.createTestSession('manual-screenshot');
      }

      const filename = name || `manual-screenshot-${Date.now()}`;
      const stepDesc = `Take screenshot: ${filename}`;
      console.log(`📸 ${stepDesc}`);

      try {
        let filePath;
        if (framework.activeTestSession && framework.activeTestSession.screenshotsDir) {
          filePath = path.join(framework.activeTestSession.screenshotsDir, `${filename}.png`);
        } else {
          // Fallback to a simple filename in current directory
          filePath = `${filename}.png`;
        }

        // Ensure we have a valid filename
        if (!filePath || filePath === 'null' || filePath.includes('null')) {
          filePath = `screenshot-${Date.now()}.png`;
        }

        console.log(`🔧 Screenshot path: ${filePath}`);

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
