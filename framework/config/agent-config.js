// framework/config/agent-config.js
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
