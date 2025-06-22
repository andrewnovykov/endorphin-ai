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

export function createVerifyElementTool(framework) {
  return tool(async ({ selector, state = 'visible', timeout = 10000 }) => {
    const stepDesc = `Verify ${selector} is ${state}`;
    console.log(`🔍 ${stepDesc}`);
    
    try {
      await framework.page.waitForSelector(selector, { state, timeout });
      await framework.takeStepScreenshot(`Verified ${selector} is ${state}`);
      
      const result = `Element ${selector} is ${state} on the page`;
      framework.logTestStep(stepDesc, 'verifyElement', { selector, state, timeout }, result, true);
      return `✅ ${result}`;
    } catch (error) {
      await framework.takeStepScreenshot(`Failed to verify ${selector}`);
      framework.logTestStep(stepDesc, 'verifyElement', { selector, state, timeout }, error.message, false);
      return `❌ Could not verify element ${selector} as ${state}: ${error.message}`;
    }
  }, {
    name: 'verifyElement',
    description: 'Verify element exists and is in specified state.',
    schema: z.object({
      selector: z.string(),
      state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
      timeout: z.number().optional(),
    })
  });
}

export function createGetElementInfoTool(framework) {
  return tool(async ({ selector }) => {
    const stepDesc = `Get element info: ${selector}`;
    console.log(`🔍 ${stepDesc}`);
    
    try {
      await framework.page.waitForSelector(selector, { timeout: 5000 });
      
      const elementInfo = await framework.page.locator(selector).evaluate(el => ({
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
        src: el.src
      }));
      
      const result = `Element info: ${JSON.stringify(elementInfo, null, 2)}`;
      framework.logTestStep(stepDesc, 'getElementInfo', { selector }, result, true);
      return result;
    } catch (error) {
      framework.logTestStep(stepDesc, 'getElementInfo', { selector }, error.message, false);
      return `❌ Could not get info for ${selector}: ${error.message}`;
    }
  }, {
    name: 'getElementInfo',
    description: 'Get detailed information about any element.',
    schema: z.object({
      selector: z.string(),
    })
  });
}
