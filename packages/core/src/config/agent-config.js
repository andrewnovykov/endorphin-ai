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

import * as dotenv from "dotenv";

dotenv.config();

export const AGENT_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o"
  },
  
  // Agent behavior settings
  agent: {
    recursionLimit: 150,
    timeout: 5 * 60 * 1000, // 5 minutes
    
    // Stop phrases that indicate test completion
    stopPhrases: [
      'test completed', 
      'verification complete', 
      'login successful', 
      'test finished', 
      'done', 
      'stop',
      'stop - test completed'
    ]
  },
  
  // Test execution settings
  execution: {
    stepDelay: 2000, // 2 seconds between test steps
    maxRetries: 3,
    retryDelay: 1000
  }
};

export default AGENT_CONFIG;
