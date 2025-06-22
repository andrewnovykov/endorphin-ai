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

export function createClickTool(framework) {
  return tool(async ({ selector, strategy = 'css', timeout = 10000, force = false }) => {
    const stepDesc = `Click ${selector} using ${strategy} strategy`;
    console.log(`🔘 ${stepDesc}`);
    
    try {
      let locator;
      
      switch (strategy) {
        case 'text':
          locator = framework.page.getByText(selector, { exact: false });
          break;
        case 'exact-text':
          locator = framework.page.getByText(selector, { exact: true });
          break;
        case 'role':
          const [role, name] = selector.split(':');
          locator = framework.page.getByRole(role, { name });
          break;
        case 'placeholder':
          locator = framework.page.getByPlaceholder(selector);
          break;
        case 'label':
          locator = framework.page.getByLabel(selector);
          break;
        case 'title':
          locator = framework.page.getByTitle(selector);
          break;
        case 'alt':
          locator = framework.page.getByAltText(selector);
          break;
        default:
          locator = framework.page.locator(selector);
      }
      
      // Check if element exists first
      const count = await locator.count();
      if (count === 0) {
        const result = `Element ${selector} not found on page`;
        framework.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, result, false);
        return `❌ ${result}`;
      }
      
      await locator.waitFor({ state: 'visible', timeout });
      await locator.click({ force });
      await framework.takeStepScreenshot(`After clicking ${selector}`);
      
      const result = `Successfully clicked ${selector} using ${strategy} strategy`;
      framework.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, result, true);
      return result;
    } catch (error) {
      await framework.takeStepScreenshot(`Failed to click ${selector}`);
      framework.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, error.message, false);
      return `❌ Error clicking ${selector}: ${error.message}`;
    }
  }, {
    name: 'click',
    description: 'Click any element with multiple selection strategies. For buttons with text like "Log In", "Sign In", "Submit", use strategy="text" and selector="Log In". For CSS selectors use strategy="css".',
    schema: z.object({
      selector: z.string().describe("Element selector - for buttons use the button text (e.g. 'Log In', 'Sign In'), for CSS use actual selector"),
      strategy: z.enum(['css', 'text', 'exact-text', 'role', 'placeholder', 'label', 'title', 'alt']).optional().describe("Selection strategy - use 'text' for button text, 'css' for CSS selectors"),
      timeout: z.number().optional(),
      force: z.boolean().optional(),
    })
  });
}

export function createFillTool(framework) {
  return tool(async ({ selector, value, strategy = 'fill', clearFirst = true, pressEnter = false }) => {
    const stepDesc = `Fill ${selector} with "${value}"`;
    console.log(`📝 ${stepDesc}`);
    
    try {
      await framework.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
      
      if (clearFirst) {
        // Focus and clear the field properly
        await framework.page.focus(selector);
        await framework.page.keyboard.press('Control+a');
        await framework.page.keyboard.press('Delete');
        
        // Wait a moment for the field to clear
        await framework.page.waitForTimeout(100);
      }
      
      if (strategy === 'type') {
        await framework.page.type(selector, value, { delay: 50 });
      } else {
        await framework.page.fill(selector, value);
      }

      if (pressEnter) {
        await framework.page.keyboard.press('Enter');
      }
      
      await framework.takeStepScreenshot(`After filling ${selector}`);
      
      // Verify the value was set correctly
      const actualValue = await framework.page.locator(selector).inputValue();
      const success = actualValue === value;
      const result = success 
        ? `Successfully filled ${selector} with "${value}"`
        : `Filled ${selector} but value is "${actualValue}" instead of "${value}"`;
      
      framework.logTestStep(stepDesc, 'fill', { selector, value, strategy, clearFirst, pressEnter }, result, success);
      return success ? `✅ ${result}` : `⚠️ ${result}`;
    } catch (error) {
      await framework.takeStepScreenshot(`Failed to fill ${selector}`);
      framework.logTestStep(stepDesc, 'fill', { selector, value, strategy, clearFirst, pressEnter }, error.message, false);
      return `❌ Error filling ${selector}: ${error.message}`;
    }
  }, {
    name: 'fill',
    description: 'Fill any input field with text. Use common selectors like input[type="email"], input[name="email"], #email for email fields, input[type="password"], input[name="password"], #password for password fields.',
    schema: z.object({
      selector: z.string().describe("CSS selector of input field - use input[type='email'] for email, input[type='password'] for password"),
      value: z.string().describe("Text to enter"),
      strategy: z.enum(['fill', 'type']).optional(),
      clearFirst: z.boolean().optional(),
      pressEnter: z.boolean().optional(),
    })
  });
}

export function createClearFieldTool(framework) {
  return tool(async ({ selector }) => {
    const stepDesc = `Clear field: ${selector}`;
    console.log(`🧹 ${stepDesc}`);
    
    try {
      await framework.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
      
      // Focus the field first
      await framework.page.focus(selector);
      
      // Select all content and delete
      await framework.page.keyboard.press('Control+a');
      await framework.page.keyboard.press('Delete');
      
      // Verify field is cleared
      const value = await framework.page.locator(selector).inputValue();
      const isCleared = value === '';
      
      const result = isCleared 
        ? `Successfully cleared field ${selector}`
        : `Field ${selector} still contains: "${value}"`;
      
      framework.logTestStep(stepDesc, 'clearField', { selector }, result, isCleared);
      return isCleared ? `✅ ${result}` : `⚠️ ${result}`;
    } catch (error) {
      framework.logTestStep(stepDesc, 'clearField', { selector }, error.message, false);
      return `❌ Error clearing field ${selector}: ${error.message}`;
    }
  }, {
    name: 'clearField',
    description: 'Clear an input field completely.',
    schema: z.object({
      selector: z.string().describe("CSS selector of the input field to clear"),
    })
  });
}
