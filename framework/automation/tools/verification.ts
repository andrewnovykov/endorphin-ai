/**
 * Verification Tools for Browser Automation
 * Provides LangChain tools for element verification and information
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { TIMEOUTS } from '../../config/constants.js';
import { info, logSuccess, error as logError } from '../../core/logger.js';
import { ICONS } from '../../config/icons.js';
import { ElementAnalyzer } from '../../utils/element-analyzer.js';

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
      const timeout = params.timeout ?? TIMEOUTS.VERIFICATION_TIMEOUT;
      const stepDesc = `Verify ${selector} is ${state}`;
      info(`${ICONS.tools} ${stepDesc}`, { tool: 'verifyElement', params: { selector, state, timeout } }, 'Tool');

      try {
        // For text-based verification, also try to find element containing text
        if (selector.startsWith('"') && selector.endsWith('"')) {
          // This is a text selector, try multiple approaches
          const textToFind = selector.slice(1, -1); // Remove quotes
          info(`${ICONS.tools} Looking for text: "${textToFind}"`, { textToFind }, 'Tool');
          
          // Try different text-based selectors
          const textSelectors = [
            `text="${textToFind}"`,
            `text=${textToFind}`,
            `//*[contains(text(), "${textToFind}")]`,
            `//*[contains(., "${textToFind}")]`,
            `*:has-text("${textToFind}")`,
          ];
          
          let _found = false;
          let lastError: any = null;
          
          for (const textSelector of textSelectors) {
            try {
              await framework.currentPage!.waitForSelector(textSelector, { 
                state, 
                timeout: Math.floor(timeout / textSelectors.length) // Divide timeout among attempts
              });
              _found = true;
              await framework.takeStepScreenshot(`Verified text "${textToFind}" is ${state}`);
              
              const result = `Text "${textToFind}" is ${state} on the page`;
              logSuccess(`Result: ${result}`, { tool: 'verifyElement', result }, 'Tool');
              framework.logTestStep(
                stepDesc,
                'verifyElement',
                { selector, state, timeout },
                result,
                true
              );
              return `✅ ${result}`;
            } catch (error: any) {
              lastError = error;
              // Continue trying other selectors
            }
          }
          
          // If we get here, text was not found
          throw lastError || new Error(`Text "${textToFind}" not found`);
        } else {
          // Regular selector verification
          await framework.currentPage!.waitForSelector(selector, { state, timeout });
          await framework.takeStepScreenshot(`Verified ${selector} is ${state}`);

          const result = `Element ${selector} is ${state} on the page`;
          logSuccess(`Result: ${result}`, { tool: 'verifyElement', result }, 'Tool');
          framework.logTestStep(
            stepDesc,
            'verifyElement',
            { selector, state, timeout },
            result,
            true
          );
          return `✅ ${result}`;
        }
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to verify ${selector}`);
        
        // 🔧 Silently collect failure data for post-test AI analysis
        try {
          const analysisResult = await ElementAnalyzer.findAlternatives(
            framework.currentPage!, 
            selector, 
            selector.startsWith('"') && selector.endsWith('"') ? selector.slice(1, -1) : undefined
          );
          
          // Capture page snapshot for detailed analysis
          const pageSnapshot = await framework.capturePageSnapshot();
          
          // Store comprehensive failure data for AI recommendations at test end
          framework.collectFailureData({
            type: 'verification_failed',
            selector,
            state,
            error: error.message,
            stepDescription: stepDesc,
            pageSnapshot: pageSnapshot || undefined,
            alternatives: analysisResult.alternatives,
            screenshot: `Failed to verify ${selector}`,
            timestamp: new Date().toISOString()
          });
        } catch {
          // Silent failure in analysis - don't disrupt test flow
        }
        
        logError(`Result: Could not verify element ${selector} as ${state}: ${error.message}`, error instanceof Error ? error : undefined, { tool: 'verifyElement', error: error.message }, 'Tool');
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
      description: 'Verify element exists and is in specified state. For text verification, wrap text in quotes (e.g., "Andrew").',
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
      info(`${ICONS.tools} ${stepDesc}`, { tool: 'getElementInfo', params: { selector } }, 'Tool');

      try {
        await framework.currentPage!.waitForSelector(selector, { timeout: TIMEOUTS.VERIFICATION_TIMEOUT });

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
        logSuccess(`Result: ${result}`, { tool: 'getElementInfo', result }, 'Tool');
        framework.logTestStep(stepDesc, 'getElementInfo', { selector }, result, true);
        return result;
      } catch (error: any) {
        logError(`Result: Could not get info for ${selector}: ${error.message}`, error instanceof Error ? error : undefined, { tool: 'getElementInfo', error: error.message }, 'Tool');
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

/**
 * Creates a verify title tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for verifying page title
 */
export function createVerifyTitleTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      title: string;
      exact?: boolean | undefined;
      timeout?: number | undefined;
    }) => {
      const expectedTitle = params.title;
      const exact = params.exact ?? false;
      const timeout = params.timeout ?? TIMEOUTS.VERIFICATION_TIMEOUT;
      const stepDesc = `Verify page title ${exact ? 'equals' : 'contains'} "${expectedTitle}"`;
      info(`${ICONS.tools} ${stepDesc}`, { tool: 'verifyTitle', params: { title: expectedTitle, exact, timeout } }, 'Tool');

      try {
        const page = framework.currentPage!;
        
        // Wait for title to match
        if (exact) {
          await page.waitForFunction(
            (expectedTitle) => document.title === expectedTitle,
            expectedTitle,
            { timeout }
          );
        } else {
          await page.waitForFunction(
            (expectedTitle) => document.title.toLowerCase().includes(expectedTitle.toLowerCase()),
            expectedTitle,
            { timeout }
          );
        }
        
        const actualTitle = await page.title();
        await framework.takeStepScreenshot(`Verified page title: ${actualTitle}`);
        
        const result = `Page title "${actualTitle}" ${exact ? 'equals' : 'contains'} "${expectedTitle}"`;
        logSuccess(`Result: ${result}`, { tool: 'verifyTitle', result }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'verifyTitle',
          { title: expectedTitle, exact, timeout },
          result,
          true
        );
        return `✅ ${result}`;
      } catch {
        const actualTitle = await framework.currentPage!.title().catch(() => 'unknown');
        await framework.takeStepScreenshot(`Failed to verify title`);
        const result = `Expected title to ${exact ? 'equal' : 'contain'} "${expectedTitle}", but got "${actualTitle}"`;
        logError(`Result: ${result}`, undefined, { tool: 'verifyTitle', actualTitle, expectedTitle }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'verifyTitle',
          { title: expectedTitle, exact, timeout },
          `Actual title: "${actualTitle}"`,
          false
        );
        return `❌ ${result}`;
      }
    },
    {
      name: 'verifyTitle',
      description: 'Verify the page title matches or contains expected text. Similar to Playwright expect(page).toHaveTitle().',
      schema: z.object({
        title: z.string().describe('The expected title or partial title'),
        exact: z.boolean().optional().describe('Whether to match exact title (default: false)'),
        timeout: z.number().optional().describe('Timeout in milliseconds'),
      }),
    }
  );
}

/**
 * Creates a verify URL tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for verifying page URL
 */
export function createVerifyURLTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      url: string;
      exact?: boolean | undefined;
      timeout?: number | undefined;
    }) => {
      const expectedUrl = params.url;
      const exact = params.exact ?? true; // Default to exact match for URLs
      const timeout = params.timeout ?? TIMEOUTS.VERIFICATION_TIMEOUT;
      const stepDesc = `Verify page URL ${exact ? 'equals' : 'contains'} "${expectedUrl}"`;
      info(`${ICONS.tools} ${stepDesc}`, { tool: 'verifyURL', params: { url: expectedUrl, exact, timeout } }, 'Tool');

      try {
        const page = framework.currentPage!;
        
        // Wait for URL to match
        if (exact) {
          await page.waitForFunction(
            (expectedUrl) => window.location.href === expectedUrl,
            expectedUrl,
            { timeout }
          );
        } else {
          await page.waitForFunction(
            (expectedUrl) => window.location.href.includes(expectedUrl),
            expectedUrl,
            { timeout }
          );
        }
        
        const actualUrl = page.url();
        await framework.takeStepScreenshot(`Verified page URL: ${actualUrl}`);
        
        const result = `Page URL "${actualUrl}" ${exact ? 'equals' : 'contains'} "${expectedUrl}"`;
        logSuccess(`Result: ${result}`, { tool: 'verifyURL', result }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'verifyURL',
          { url: expectedUrl, exact, timeout },
          result,
          true
        );
        return `✅ ${result}`;
      } catch {
        const actualUrl = framework.currentPage!.url();
        await framework.takeStepScreenshot(`Failed to verify URL`);
        const result = `Expected URL to ${exact ? 'equal' : 'contain'} "${expectedUrl}", but got "${actualUrl}"`;
        logError(`Result: ${result}`, undefined, { tool: 'verifyURL', actualUrl, expectedUrl }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'verifyURL',
          { url: expectedUrl, exact, timeout },
          `Actual URL: "${actualUrl}"`,
          false
        );
        return `❌ ${result}`;
      }
    },
    {
      name: 'verifyURL',
      description: 'Verify the page URL matches or contains expected URL. Similar to Playwright expect(page).toHaveURL().',
      schema: z.object({
        url: z.string().describe('The expected URL or partial URL'),
        exact: z.boolean().optional().describe('Whether to match exact URL (default: true)'),
        timeout: z.number().optional().describe('Timeout in milliseconds'),
      }),
    }
  );
}

/**
 * Creates a verify text content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for verifying text content on page
 */
export function createVerifyTextContentTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      text: string;
      timeout?: number | undefined;
      exact?: boolean | undefined;
    }) => {
      const text = params.text;
      const timeout = params.timeout ?? TIMEOUTS.VERIFICATION_TIMEOUT;
      const exact = params.exact ?? false;
      const stepDesc = `Verify text "${text}" is visible on page`;
      info(`${ICONS.tools} ${stepDesc}`, { tool: 'verifyTextContent', params: { text, timeout, exact } }, 'Tool');

      try {
        // Extended waiting and verification for better accuracy
        await framework.currentPage!.waitForTimeout(2000); // Increased wait time
        
        // Try multiple approaches to find the text
        let found = false;
        let verificationMethod = '';
        
        // Method 1: Direct text content check
        const pageText = await framework.currentPage!.evaluate(() => {
          return document.body.innerText || document.body.textContent || '';
        });
        
        if (exact) {
          const textElements = pageText.split(/[\n\r\t\s]+/).filter(t => t.trim());
          found = textElements.includes(text);
          verificationMethod = 'exact text match';
        } else {
          found = pageText.toLowerCase().includes(text.toLowerCase());
          verificationMethod = 'partial text match';
        }
        
        // Method 2: If not found by text content, try DOM element search
        if (!found) {
          const textSelectors = [
            `text="${text}"`,
            `text=${text}`,
            `//*[contains(text(), "${text}")]`,
            `*:has-text("${text}")`,
          ];
          
          for (const selector of textSelectors) {
            try {
              await framework.currentPage!.waitForSelector(selector, { timeout: 3000 });
              found = true;
              verificationMethod = `DOM selector: ${selector}`;
              break;
            } catch {
              // Continue with next selector
            }
          }
        }
        
        // Method 3: If still not found, try case-insensitive broader search
        if (!found) {
          const allText = await framework.currentPage!.evaluate(() => {
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            );
            let textContent = '';
            let node;
            while ((node = walker.nextNode())) {
              textContent += `${node.textContent} `;
            }
            return textContent;
          });
          
          found = allText.toLowerCase().includes(text.toLowerCase());
          if (found) {
            verificationMethod = 'text tree walker';
          }
        }
        
        if (found) {
          // Try to scroll to the element for better screenshot
          try {
            const textSelectors = [
              `text="${text}"`,
              `text=${text}`,
              `//*[contains(text(), "${text}")]`,
              `*:has-text("${text}")`,
            ];
            
            for (const selector of textSelectors) {
              try {
                await framework.currentPage!.waitForSelector(selector, { timeout: 1000 });
                await framework.currentPage!.locator(selector).scrollIntoViewIfNeeded();
                break;
              } catch {
                // Continue with next selector
              }
            }
          } catch {
            // Element scrolling failed, but text was found
          }
          
          await framework.takeStepScreenshot(`Verified text "${text}" is visible`);
          
          const result = `Text "${text}" is DEFINITELY visible on the page (verified using ${verificationMethod})`;
          logSuccess(`Result: ${result}`, { tool: 'verifyTextContent', result, verificationMethod }, 'Tool');
          framework.logTestStep(
            stepDesc,
            'verifyTextContent',
            { text, exact, timeout },
            result,
            true
          );
          return `✅ ${result}`;
        } else {
          // Text not found, provide comprehensive debugging info
          const preview = pageText.substring(0, 800).replace(/\s+/g, ' ').trim();
          
          // Extract common words for debugging
          const words = pageText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
          const uniqueWords = [...new Set(words)].slice(0, 20);
          
          const errorMessage = `Text "${text}" not found after exhaustive search. Page contains ${pageText.length} characters. Preview: "${preview}...". Common words: ${uniqueWords.join(', ')}`;
          
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to verify text "${text}"`);
        logError(`Result: Could not verify text "${text}": ${error.message}`, error instanceof Error ? error : undefined, { tool: 'verifyTextContent', error: error.message }, 'Tool');
        framework.logTestStep(
          stepDesc,
          'verifyTextContent',
          { text, exact, timeout },
          error.message,
          false
        );
        return `❌ Could not verify text "${text}": ${error.message}`;
      }
    },
    {
      name: 'verifyTextContent',
      description: 'Verify specific text content is visible on the page. More reliable than element-based verification for dynamic content.',
      schema: z.object({
        text: z.string().describe('The text to verify on the page'),
        timeout: z.number().optional().describe('Timeout in milliseconds'),
        exact: z.boolean().optional().describe('Whether to match exact text (default: false)'),
      }),
    }
  );
}
