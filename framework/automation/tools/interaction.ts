/**
 * Interaction Tools for Browser Automation
 * Provides LangChain tools for element interaction (click, fill, clear)
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { TIMEOUTS } from '../../config/constants.js';

/**
 * Creates a click tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for clicking elements
 */
export function createClickTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      selector: string;
      strategy?:
        | 'css'
        | 'text'
        | 'exact-text'
        | 'role'
        | 'placeholder'
        | 'label'
        | 'title'
        | 'alt'
        | undefined;
      timeout?: number | undefined;
      force?: boolean | undefined;
    }) => {
      const selector = params.selector;
      const strategy = params.strategy ?? 'css';
      const timeout = params.timeout ?? TIMEOUTS.ELEMENT_WAIT;
      const force = params.force ?? false;

      const stepDesc = `Click ${selector} using ${strategy} strategy`;
      console.log(`🔘 ${stepDesc}`);

      // Debug logging for  tool calls
      if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
        console.log(`🔧 Build-in tool called! Name: click, Parameters:`, {
          selector,
          strategy,
          timeout,
          force,
        });
      }

      try {
        let locator;

        switch (strategy) {
          case 'text': {
            // First try to find a button with this text to avoid strict mode violations
            const buttonLocator = framework
              .currentPage!.locator('button')
              .filter({ hasText: selector });
            const buttonCount = await buttonLocator.count();
            if (buttonCount > 0) {
              console.log(
                `🎯 Found ${buttonCount} button(s) with text "${selector}", using button strategy`
              );
              locator = buttonLocator.first();
            } else {
              // Fallback to general text search
              locator = framework.currentPage!.getByText(selector, { exact: false });
            }
            break;
          }
          case 'exact-text': {
            // First try to find a button with this exact text to avoid strict mode violations
            const buttonLocator = framework.currentPage!.locator('button').filter({
              hasText: new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
            });
            const buttonCount = await buttonLocator.count();
            if (buttonCount > 0) {
              console.log(
                `🎯 Found ${buttonCount} button(s) with exact text "${selector}", using button strategy`
              );
              locator = buttonLocator.first();
            } else {
              // Try clickable elements (a, button, input[type=button], etc.)
              const clickableLocator = framework
                .currentPage!.locator(
                  'a, button, input[type="button"], input[type="submit"], [role="button"]'
                )
                .filter({
                  hasText: new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
                });
              const clickableCount = await clickableLocator.count();
              if (clickableCount > 0) {
                console.log(
                  `🎯 Found ${clickableCount} clickable element(s) with exact text "${selector}", using first clickable element`
                );
                locator = clickableLocator.first();
              } else {
                // Fallback to general exact text search (may cause strict mode violation)
                console.log(
                  `⚠️ Using fallback exact text search for "${selector}" - may cause strict mode violation if multiple elements match`
                );
                locator = framework.currentPage!.getByText(selector, { exact: true });
              }
            }
            break;
          }
          case 'role': {
            const [role, name] = selector.split(':');
            if (name) {
              // If a name is provided, use it to avoid strict mode violations
              locator = framework.currentPage!.getByRole(role as any, { name });
            } else {
              // If no name provided, get all elements of that role and use first
              console.log(
                `⚠️ Role "${role}" without name may cause strict mode violation - using first match`
              );
              locator = framework.currentPage!.getByRole(role as any).first();
            }
            break;
          }
          case 'placeholder':
            locator = framework.currentPage!.getByPlaceholder(selector);
            break;
          case 'label':
            locator = framework.currentPage!.getByLabel(selector);
            break;
          case 'title':
            locator = framework.currentPage!.getByTitle(selector);
            break;
          case 'alt':
            locator = framework.currentPage!.getByAltText(selector);
            break;
          default: {
            // CSS selector strategy - handle multiple matching elements to avoid strict mode violations
            const cssLocator = framework.currentPage!.locator(selector);
            const elementCount = await cssLocator.count();
            
            if (elementCount > 1) {
              console.log(
                `⚠️ CSS selector "${selector}" matches ${elementCount} elements - using first element to avoid strict mode violation`
              );
              locator = cssLocator.first();
            } else {
              locator = cssLocator;
            }
            break;
          }
        }

        // Check if element exists first
        const count = await locator.count();
        if (count === 0) {
          const result = `Element ${selector} not found on page`;
          framework.logTestStep(
            stepDesc,
            'click',
            { selector, strategy, timeout, force },
            result,
            false
          );
          return `❌ ${result}`;
        }

        await locator.waitFor({ state: 'visible', timeout });
        await locator.click({ force });
        await framework.takeStepScreenshot(`After clicking ${selector}`);

        const result = `Successfully clicked ${selector} using ${strategy} strategy`;
        framework.logTestStep(
          stepDesc,
          'click',
          { selector, strategy, timeout, force },
          result,
          true
        );

        // Debug logging for successful tool completion
        if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
          console.log(`✅ Built-in tool completed! Name: click, Result: ${result}`);
        }

        return result;
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to click ${selector}`);
        framework.logTestStep(
          stepDesc,
          'click',
          { selector, strategy, timeout, force },
          error.message,
          false
        );

        // Debug logging for failed tool execution
        if (process.env.ENDORPHIN_DEBUG === 'true' || process.env.ENDORPHIN_DEBUG === 'verbose') {
          console.error(`❌ Built-in tool failed! Name: click, Error: ${error.message}`);
        }

        return `❌ Error clicking ${selector}: ${error.message}`;
      }
    },
    {
      name: 'click',
      description:
        'Click any element with multiple selection strategies. For buttons with text like "Log In", "Sign In", "Submit", use strategy="text" and selector="Log In". For CSS selectors use strategy="css".',
      schema: z.object({
        selector: z
          .string()
          .describe(
            "Element selector - for buttons use the button text (e.g. 'Log In', 'Sign In'), for CSS use actual selector"
          ),
        strategy: z
          .enum(['css', 'text', 'exact-text', 'role', 'placeholder', 'label', 'title', 'alt'])
          .optional()
          .describe("Selection strategy - use 'text' for button text, 'css' for CSS selectors"),
        timeout: z.number().optional(),
        force: z.boolean().optional(),
      }),
    }
  );
}

/**
 * Creates a fill tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for filling input fields
 */
export function createFillTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      selector: string;
      value: string;
      strategy?: 'fill' | 'type' | undefined;
      clearFirst?: boolean | undefined;
      pressEnter?: boolean | undefined;
    }) => {
      const selector = params.selector;
      const value = params.value;
      const strategy = params.strategy ?? 'fill';
      const clearFirst = params.clearFirst ?? true;
      const pressEnter = params.pressEnter ?? false;

      const stepDesc = `Fill ${selector} with "${value}"`;
      console.log(`📝 ${stepDesc}`);

      try {
        // Try multiple strategies for common field types
        let finalSelector = selector;
        let locator;

        // For email fields, try multiple selectors
        if (selector.includes('email')) {
          const emailSelectors = [
            'input[type="email"]',
            'input[name*="email"]',
            'input[placeholder*="email"]',
            '#email',
            '.email-input',
            selector, // original selector as fallback
          ];

          for (const sel of emailSelectors) {
            try {
              locator = framework.currentPage!.locator(sel);
              if ((await locator.count()) > 0) {
                finalSelector = sel;
                console.log(`📧 Found email field using selector: ${sel}`);
                break;
              }
            } catch {
              // Ignore selector errors for field detection
            }
          }
        }
        // For password fields, try multiple selectors
        else if (selector.includes('password')) {
          const passwordSelectors = [
            'input[type="password"]',
            'input[name*="password"]',
            'input[placeholder*="password"]',
            '#password',
            '.password-input',
            selector, // original selector as fallback
          ];

          for (const sel of passwordSelectors) {
            try {
              locator = framework.currentPage!.locator(sel);
              if ((await locator.count()) > 0) {
                finalSelector = sel;
                console.log(`🔒 Found password field using selector: ${sel}`);
                break;
              }
            } catch {
              // Ignore selector errors for field detection
            }
          }
        }

        await framework.currentPage!.waitForSelector(finalSelector, {
          state: 'visible',
          timeout: TIMEOUTS.ELEMENT_WAIT,
        });

        if (clearFirst) {
          // Use the more reliable locator-based clearing approach
          const locator = framework.currentPage!.locator(finalSelector);
          await locator.clear();

          // Wait a moment for the field to clear and verify it's empty
          await framework.currentPage!.waitForTimeout(200);

          // Double-check clearing worked by trying alternative method if needed
          const currentValue = await locator.inputValue();
          if (currentValue && currentValue.length > 0) {
            console.log(
              `⚠️ Field still contains "${currentValue}", trying alternative clearing...`
            );
            await locator.fill(''); // Force empty
            await framework.currentPage!.waitForTimeout(100);
          }
        }

        if (strategy === 'type') {
          await framework.currentPage!.type(finalSelector, value, { delay: 50 });
        } else {
          await framework.currentPage!.fill(finalSelector, value);
        }

        if (pressEnter) {
          await framework.currentPage!.keyboard.press('Enter');
        }

        await framework.takeStepScreenshot(`After filling ${finalSelector}`);

        // Verify the value was set correctly
        const actualValue = await framework.currentPage!.locator(finalSelector).inputValue();
        const success = actualValue === value;
        const result = success
          ? `Successfully filled ${finalSelector} with "${value}"`
          : `Filled ${finalSelector} but value is "${actualValue}" instead of "${value}"`;

        framework.logTestStep(
          stepDesc,
          'fill',
          { selector: finalSelector, value, strategy, clearFirst, pressEnter },
          result,
          success
        );
        return success ? `✅ ${result}` : `⚠️ ${result}`;
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to fill ${selector}`);
        framework.logTestStep(
          stepDesc,
          'fill',
          { selector, value, strategy, clearFirst, pressEnter },
          error.message,
          false
        );
        return `❌ Error filling ${selector}: ${error.message}`;
      }
    },
    {
      name: 'fill',
      description:
        'Fill any input field with text. Use common selectors like input[type="email"], input[name="email"], #email for email fields, input[type="password"], input[name="password"], #password for password fields.',
      schema: z.object({
        selector: z
          .string()
          .describe(
            "CSS selector of input field - use input[type='email'] for email, input[type='password'] for password"
          ),
        value: z.string().describe('Text to enter'),
        strategy: z.enum(['fill', 'type']).optional(),
        clearFirst: z.boolean().optional(),
        pressEnter: z.boolean().optional(),
      }),
    }
  );
}

/**
 * Creates a clear field tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for clearing input fields
 */
export function createClearFieldTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ selector }: { selector: string }) => {
      const stepDesc = `Clear field: ${selector}`;
      console.log(`🧹 ${stepDesc}`);

      try {
        await framework.currentPage!.waitForSelector(selector, {
          state: 'visible',
          timeout: TIMEOUTS.ELEMENT_WAIT,
        });

        // Use Playwright's built-in clear method (much more reliable)
        const locator = framework.currentPage!.locator(selector);
        await locator.clear();

        // Verify field is cleared
        const value = await locator.inputValue();
        const isCleared = value === '';

        const result = isCleared
          ? `Successfully cleared field ${selector}`
          : `Field ${selector} still contains: "${value}"`;

        framework.logTestStep(stepDesc, 'clearField', { selector }, result, isCleared);
        return isCleared ? `✅ ${result}` : `⚠️ ${result}`;
      } catch (error: any) {
        framework.logTestStep(stepDesc, 'clearField', { selector }, error.message, false);
        return `❌ Error clearing field ${selector}: ${error.message}`;
      }
    },
    {
      name: 'clearField',
      description: 'Clear an input field completely.',
      schema: z.object({
        selector: z.string().describe('CSS selector of the input field to clear'),
      }),
    }
  );
}

/**
 * Creates a describe tool for adding descriptions to locators
 * @param framework - Framework instance
 * @returns LangChain tool for adding descriptions to elements
 */
export function createDescribeTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async ({ selector, description }: { selector: string; description: string }) => {
      const stepDesc = `Describe element: ${selector} as "${description}"`;
      console.log(`📝 ${stepDesc}`);

      try {
        // Create locator and add description through logging for better debugging
        const locator = framework.currentPage!.locator(selector);
        console.log(`📝 Element described: "${description}"`);
        
        // Verify the element exists
        const count = await locator.count();
        if (count === 0) {
          const result = `Element ${selector} not found on page`;
          framework.logTestStep(
            stepDesc,
            'describe',
            { selector, description },
            result,
            false
          );
          return `❌ ${result}`;
        }

        const result = `Element ${selector} described as "${description}" (found ${count} element${count > 1 ? 's' : ''})`;
        framework.logTestStep(
          stepDesc,
          'describe',
          { selector, description },
          result,
          true
        );
        return `✅ ${result}`;
      } catch (error: any) {
        framework.logTestStep(stepDesc, 'describe', { selector, description }, error.message, false);
        return `❌ Error describing element ${selector}: ${error.message}`;
      }
    },
    {
      name: 'describe',
      description: 'Add a description to an element for better debugging and tracing in reports.',
      schema: z.object({
        selector: z.string().describe('CSS selector of the element to describe'),
        description: z.string().describe('Human-readable description of the element'),
      }),
    }
  );
}

/**
 * Creates a press sequentially tool for character-by-character typing
 * @param framework - Framework instance
 * @returns LangChain tool for typing text character by character
 */
export function createPressSequentiallyTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      selector: string;
      text: string;
      delay?: number | undefined;
      strategy?: 'css' | 'placeholder' | 'label' | 'title' | 'alt' | undefined;
    }) => {
      const { selector, text, delay, strategy } = params;
      const actualDelay: number = delay ?? 100;
      const actualStrategy = strategy ?? 'css';
      const stepDesc = `Type sequentially "${text}" into ${selector}`;
      console.log(`⌨️ ${stepDesc}`);

      try {
        // Get locator based on strategy
        let locator;
        switch (actualStrategy) {
          case 'placeholder':
            locator = framework.currentPage!.getByPlaceholder(selector);
            break;
          case 'label':
            locator = framework.currentPage!.getByLabel(selector);
            break;
          case 'title':
            locator = framework.currentPage!.getByTitle(selector);
            break;
          case 'alt':
            locator = framework.currentPage!.getByAltText(selector);
            break;
          default:
            locator = framework.currentPage!.locator(selector);
        }

        // Check if element exists
        const count = await locator.count();
        if (count === 0) {
          const result = `Element ${selector} not found on page`;
          framework.logTestStep(
            stepDesc,
            'pressSequentially',
            { selector, text, delay: actualDelay, strategy: actualStrategy },
            result,
            false
          );
          return `❌ ${result}`;
        }

        // Focus and type sequentially
        await locator.focus();
        await locator.pressSequentially(text, { delay: actualDelay });
        await framework.takeStepScreenshot(`After typing sequentially into ${selector}`);

        const result = `Successfully typed "${text}" sequentially into ${selector} with ${actualDelay}ms delay`;
        framework.logTestStep(
          stepDesc,
          'pressSequentially',
          { selector, text, delay: actualDelay, strategy: actualStrategy },
          result,
          true
        );
        return `✅ ${result}`;
      } catch (error: any) {
        await framework.takeStepScreenshot(`Failed to type sequentially into ${selector}`);
        framework.logTestStep(
          stepDesc,
          'pressSequentially',
          { selector, text, delay: actualDelay, strategy: actualStrategy },
          error.message,
          false
        );
        return `❌ Error typing sequentially into ${selector}: ${error.message}`;
      }
    },
    {
      name: 'pressSequentially',
      description: 'Type text character by character with a delay between each character. Useful for forms with special keyboard handling.',
      schema: z.object({
        selector: z.string().describe('Element selector to type into'),
        text: z.string().describe('Text to type character by character'),
        delay: z.number().optional().describe('Delay in milliseconds between characters (default: 100ms)'),
        strategy: z.enum(['css', 'placeholder', 'label', 'title', 'alt']).optional().describe('Selection strategy (default: css)'),
      }),
    }
  );
}
