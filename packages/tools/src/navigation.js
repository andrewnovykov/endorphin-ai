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
