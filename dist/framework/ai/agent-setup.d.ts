/**
 * Endorphin e2e AI test framework
 * Copyright (C) 2025 Redstudio Agency
 *
 * AI Agent Setup - TypeScript Migration
 */
interface AgentWorkflow {
    invoke(input: any): Promise<any>;
}
/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @returns Compiled agent workflow
 */
export declare function setupAgent(tools: any[]): Promise<AgentWorkflow>;
export {};
//# sourceMappingURL=agent-setup.d.ts.map