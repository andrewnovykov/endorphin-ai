/**
 * Agent Configuration for Endorphin AI
 * Provides default configuration for AI agent behavior and execution
 */
import * as dotenv from 'dotenv';
dotenv.config();
/**
 * AI Agent configuration settings
 */
export const AGENT_CONFIG = {
    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4o',
    },
    // Agent behavior settings
    agent: {
        recursionLimit: 150,
        timeout: 5 * 60 * 1000, // 5 minutes
        // Stop phrases that indicate test completion
        stopPhrases: [
            'test completed successfully',
            'verification complete',
            'test finished successfully',
            'all steps completed',
            'task finished',
            'stop',
            'stop - test completed',
        ],
    },
    // Test execution settings
    execution: {
        stepDelay: 2000, // 2 seconds between test steps
        maxRetries: 3,
        retryDelay: 1000,
    },
};
export default AGENT_CONFIG;
//# sourceMappingURL=agent-config.js.map