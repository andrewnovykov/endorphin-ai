/**
 * Verification Tools for Browser Automation
 * Provides LangChain tools for element verification and information
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../core/browser-framework.js';

/**
 * Creates a verify element tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for verifying elements
 */
export function createVerifyElementTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: { 
      selector: string; 
      state?: 'visible' | 'hidden' | 'attached' | 'detached' | undefined; 
      timeout?: number | undefined; 
    }) => {
      const selector = params.selector;
      const state = params.state ?? 'visible';
      const timeout = params.timeout ?? 10000;
      const stepDesc = `Verify ${selector} is ${state}`;
      console.log(`🔍 ${stepDesc}`);

      try {
        await framework.currentPage!.waitForSelector(selector, { state, timeout });
        await framework.takeStepScreenshot(`Verified ${selector} is ${state}`);

        const result = `Element ${selector} is ${state} on the page`;
        framework.logTestStep(
          stepDesc,
          'verifyElement',
          { selector, state, timeout },
          result,
          true
        );
        return `✅ ${result}`;
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to verify ${selector}`);
        framework.logTestStep(
          stepDesc,
          'verifyElement',
          { selector, state, timeout },
          error.message,
          false
        );
        return `❌ Could not verify element ${selector} as ${state}: ${error.message}`;
      }
    },
    {
      name: 'verifyElement',
      description: 'Verify element exists and is in specified state.',
      schema: z.object({
        selector: z.string(),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
        timeout: z.number().optional(),
      }),
    }
  );
}

/**
 * Creates a get element info tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting element information
 */
export function createGetElementInfoTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ selector }: { selector: string }) => {
      const stepDesc = `Get element info: ${selector}`;
      console.log(`🔍 ${stepDesc}`);

      try {
        await framework.currentPage!.waitForSelector(selector, { timeout: 5000 });

        const elementInfo = await framework.currentPage!.locator(selector).evaluate((el: any) => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          textContent: el.textContent?.trim(),
          value: el.value,
          placeholder: el.placeholder,
          type: el.type,
          disabled: el.disabled,
          visible: el.offsetParent !== null,
          href: el.href,
          src: el.src,
        }));

        const result = `Element info: ${JSON.stringify(elementInfo, null, 2)}`;
        framework.logTestStep(stepDesc, 'getElementInfo', { selector }, result, true);
        return result;
      } catch (error: any) {
        framework.logTestStep(stepDesc, 'getElementInfo', { selector }, error.message, false);
        return `❌ Could not get info for ${selector}: ${error.message}`;
      }
    },
    {
      name: 'getElementInfo',
      description: 'Get detailed information about any element.',
      schema: z.object({
        selector: z.string(),
      }),
    }
  );
}
