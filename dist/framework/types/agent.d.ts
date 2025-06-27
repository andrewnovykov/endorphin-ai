/**
 * AI agent configuration and LangChain integration types
 */
export interface AIConfig {
    openai: {
        apiKey: string;
        modelName: string;
        temperature: number;
        maxTokens: number;
    };
    agent: {
        recursionLimit: number;
        stopPhrases: string[];
    };
}
export interface BrowserTool {
    name: string;
    description: string;
    schema: Record<string, any>;
    func: (params: any) => Promise<string>;
    lc_namespace?: string[];
    lc_serializable?: boolean;
    [key: string]: any;
}
export interface ToolParams {
    selector?: string;
    text?: string;
    url?: string;
    value?: string;
    timeout?: number;
    [key: string]: any;
}
export interface ToolCall {
    stepNumber: number;
    toolName: string;
    toolArgs: any;
    result: string;
    timestamp: string;
    status: 'SUCCESS' | 'FAILED';
}
export interface NaturalLanguageResult {
    toolUsed: string;
    params: Record<string, any>;
    result: string;
}
//# sourceMappingURL=agent.d.ts.map