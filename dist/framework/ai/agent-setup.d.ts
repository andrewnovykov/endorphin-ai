/**
 * Endorphin e2e AI test framework
 * Copyright (C) 2025 Redstudio Agency
 *
 * AI Agent Setup - Proper LangGraph Memory Implementation
 *
 * 🧠 Memory Strategy:
 * - Uses LangGraph's MemorySaver for conversation persistence
 * - Agent naturally remembers previous actions through message history
 * - No manual step tracking - let conversation flow handle progress
 * - thread_id provides session-based memory across tool calls
 * - Simplified state management focused on message continuity
 *
 * 🎯 E2E Test Completion Logic:
 * - Only ends test when ALL numbered steps are completed
 * - Ignores partial completion phrases like "login completed"
 * - Supports both positive (test passed) and negative (test failed) scenarios
 * - Prevents premature test termination after individual step completion
 */
interface AgentWorkflow {
    invoke(input: any, config?: {
        configurable?: {
            thread_id?: string;
            [key: string]: any;
        };
        [key: string]: any;
    }): Promise<any>;
}
/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @param config - Optional configuration with thread_id for memory persistence
 * @returns Compiled agent workflow
 */
export declare function setupAgent(tools: any[], config?: {
    thread_id?: string;
}): Promise<AgentWorkflow>;
export {};
//# sourceMappingURL=agent-setup.d.ts.map