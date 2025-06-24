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


import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../');

// Load environment variables from project root
try {
  dotenv.config({ path: resolve(PROJECT_ROOT, '.env') });
} catch (error) {
  // Ignore if .env file doesn't exist
}

export const BROWSER_CONFIG = {
  // Browser launch options
  launchOptions: {
    headless: process.env.HEADLESS === 'true' ? true : false,
    args: ['--start-maximized']
  },
  
  // Browser context options
  contextOptions: {
    viewport: { width: 1920, height: 1080 }
  },
  
  // Default timeouts (in milliseconds)
  timeouts: {
    navigation: 60000,
    element: 10000,
    screenshot: 5000,
    testExecution: 5 * 60 * 1000 // 5 minutes
  },
  
  // Screenshot options
  screenshot: {
    fullPage: false,
    type: 'png'
  },
  
  // Base URL for testing
  baseUrl: process.env.BASE_URL || 'https://qafromla.herokuapp.com/'
};

export default BROWSER_CONFIG;
