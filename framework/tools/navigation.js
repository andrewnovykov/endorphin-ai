// framework/tools/navigation.js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export function createNavigationTool(framework) {
  return tool(async ({ location, waitUntil = 'domcontentloaded' }) => {
    const stepDesc = `Navigate to: ${location}`;
    console.log(`🌍 ${stepDesc}`);
    
    try {
      await framework.page.goto(location, { waitUntil, timeout: 60000 });
      await framework.takeStepScreenshot(`Page loaded: ${location}`);
      
      framework.logTestStep(stepDesc, 'navigate', { location, waitUntil }, `Successfully navigated to: ${location}`, true);
      return `Successfully navigated to: ${location}`;
    } catch (error) {
      framework.logTestStep(stepDesc, 'navigate', { location, waitUntil }, error.message, false);
      throw error;
    }
  }, {
    name: 'navigate',
    description: 'Navigate to a URL with enhanced options.',
    schema: z.object({
      location: z.string().describe("URL to navigate to"),
      waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
    })
  });
}
