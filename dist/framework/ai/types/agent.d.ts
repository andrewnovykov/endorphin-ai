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
export interface AgentMessage {
    content: string | any;
    role?: 'user' | 'assistant' | 'system';
    timestamp?: string;
}
export interface AgentResponse {
    messages?: AgentMessage[];
    content?: string;
    output?: string;
    error?: string;
    success?: boolean;
    metadata?: {
        model?: string;
        tokenUsage?: {
            promptTokens: number;
            responseTokens: number;
            totalTokens: number;
        };
        duration?: number;
    };
}
export interface AgentInvokeParams {
    messages: AgentMessage[];
    configurable?: {
        thread_id?: string;
        recursion_limit?: number;
        [key: string]: any;
    };
}
export interface LangChainAgent {
    invoke(params: AgentInvokeParams, config?: any): Promise<AgentResponse>;
    name?: string;
    description?: string;
}
export interface LangChainTool {
    name: string;
    description: string;
    schema?: any;
    func?: (params: any) => Promise<string>;
    call?: (params: any) => Promise<string>;
    invoke?: (params: any) => Promise<string>;
    lc_namespace?: string[];
    lc_serializable?: boolean;
}
export interface ToolCallResult {
    result: string;
    success: boolean;
    error?: string;
    metadata?: {
        duration: number;
        timestamp: string;
    };
}
//# sourceMappingURL=agent.d.ts.map