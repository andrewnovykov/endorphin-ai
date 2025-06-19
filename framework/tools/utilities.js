// framework/tools/utilities.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import path from 'path';

export function createWaitTool(framework) {
  return tool(async ({ milliseconds = 500, reason, selector, state = 'visible' }) => {
    const stepDesc = selector 
      ? `Wait for ${selector} to be ${state}` 
      : `Wait for ${milliseconds}ms${reason ? ` (${reason})` : ''}`;
    console.log(`⏱️ ${stepDesc}`);
    
    try {
      if (selector) {
        await framework.page.waitForSelector(selector, { state, timeout: milliseconds });
        const result = `Element ${selector} is now ${state}`;
        framework.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, result, true);
        return `✅ ${result}`;
      } else {
        await framework.page.waitForTimeout(milliseconds);
        const result = `Waited for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
        framework.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, result, true);
        return result;
      }
    } catch (error) {
      framework.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, error.message, false);
      return `❌ Timeout waiting for ${selector} to be ${state}`;
    }
  }, {
    name: 'wait',
    description: 'Wait for time or element state.',
    schema: z.object({
      milliseconds: z.number().optional(),
      reason: z.string().optional(),
      selector: z.string().optional(),
      state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
    })
  });
}

export function createScreenshotTool(framework) {
  return tool(async ({ name, selector, fullPage = false }) => {
    if (!framework.currentTestSession) {
      framework.currentTestSession.screenshotCounter++;
    }
    
    const filename = name || `manual-screenshot-${Date.now()}.png`;
    const stepDesc = `Take screenshot: ${filename}`;
    console.log(`📸 ${stepDesc}`);
    
    try {
      let filePath;
      if (framework.currentTestSession) {
        filePath = path.join(framework.currentTestSession.screenshotsDir, filename);
      } else {
        filePath = filename;
      }
      
      if (selector) {
        await framework.page.locator(selector).screenshot({ path: filePath });
      } else {
        await framework.page.screenshot({ path: filePath, fullPage });
      }
      
      const result = selector 
        ? `Screenshot of ${selector} saved as ${filename}`
        : `${fullPage ? 'Full page' : 'Viewport'} screenshot saved as ${filename}`;
      
      framework.logTestStep(stepDesc, 'screenshot', { name, selector, fullPage }, result, true);
      return `📸 ${result}`;
    } catch (error) {
      framework.logTestStep(stepDesc, 'screenshot', { name, selector, fullPage }, error.message, false);
      return `❌ Error taking screenshot: ${error.message}`;
    }
  }, {
    name: 'screenshot',
    description: 'Take screenshot for documentation/debugging.',
    schema: z.object({
      name: z.string().optional(),
      selector: z.string().optional(),
      fullPage: z.boolean().optional(),
    })
  });
}
