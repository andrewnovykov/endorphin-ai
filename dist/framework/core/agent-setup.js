/**
 * Endorphin e2e AI test framework
 * Copyright (C) 2025 Redstudio Agency
 *
 * AI Agent Setup - TypeScript Migration
 */
import { AGENT_CONFIG } from '@config/agent-config';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @returns Compiled agent workflow
 */
export async function setupAgent(tools) {
    console.log('🤖 Configuring AI agent with tools...');
    // Small delay to ensure async behavior
    await new Promise(resolve => setTimeout(resolve, 0));
    const toolNode = new ToolNode(tools);
    if (!AGENT_CONFIG.openai.apiKey) {
        throw new Error('OpenAI API key is missing in AGENT_CONFIG.openai.apiKey');
    }
    const model = new ChatOpenAI({
        openAIApiKey: AGENT_CONFIG.openai.apiKey,
        modelName: AGENT_CONFIG.openai.modelName,
    }).bindTools(tools);
    function shouldContinue({ messages }) {
        const lastMessage = messages[messages.length - 1];
        // Check for explicit stop conditions in the message content
        const content = lastMessage.content?.toLowerCase() || '';
        const hasStopPhrase = AGENT_CONFIG.agent.stopPhrases.some((phrase) => content.includes(phrase));
        if (hasStopPhrase) {
            console.log(`🛑 Stop condition detected: ${content}`);
            return '__end__';
        }
        if (lastMessage.tool_calls?.length) {
            return 'tools';
        }
        return '__end__';
    }
    async function callModel(state) {
        const response = await model.invoke(state.messages);
        return { messages: [response] };
    }
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode('agent', callModel)
        .addEdge('__start__', 'agent')
        .addNode('tools', toolNode)
        .addEdge('tools', 'agent')
        .addConditionalEdges('agent', shouldContinue);
    const agent = workflow.compile({
    // Note: recursionLimit might be handled differently in newer versions
    // checkpointer: false, // Use this if recursionLimit is not available
    });
    console.log('✅ AI agent configured successfully');
    return agent;
}
//# sourceMappingURL=agent-setup.js.map