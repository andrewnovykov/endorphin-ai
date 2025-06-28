/**
 * Agent Configuration for Endorphin AI
 * Provides default configuration for AI agent behavior and execution
 */
/**
 * AI Agent configuration settings
 */
export declare const AGENT_CONFIG: {
    readonly openai: {
        readonly apiKey: string | undefined;
        readonly modelName: "gpt-4o";
    };
    readonly agent: {
        readonly recursionLimit: 150;
        readonly timeout: number;
        readonly stopPhrases: readonly ["test completed", "verification complete", "login successful", "test finished", "done", "stop", "stop - test completed"];
    };
    readonly execution: {
        readonly stepDelay: 2000;
        readonly maxRetries: 3;
        readonly retryDelay: 1000;
    };
};
export default AGENT_CONFIG;
//# sourceMappingURL=agent-config.d.ts.map