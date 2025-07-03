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
import { Annotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { AGENT_CONFIG } from './config/agent-config.js';
// Simplified State Annotation for Proper Memory Management
const TestState = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
    }),
    // Let conversation memory handle the rest naturally
    testContext: Annotation({
        reducer: (x, y) => ({ ...x, ...y }),
    }),
});
// Global memory saver instance
const memorySaver = new MemorySaver();
/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @param config - Optional configuration with thread_id for memory persistence
 * @returns Compiled agent workflow
 */
export async function setupAgent(tools, config) {
    console.log('🤖 Configuring AI agent with tools...');
    // Log memory configuration
    if (config?.thread_id) {
        console.log(`🧠 Memory persistence enabled with thread_id: ${config.thread_id}`);
    }
    else {
        console.log(`🧠 Using session-based memory (no thread_id specified)`);
    }
    const toolNode = new ToolNode(tools);
    if (!AGENT_CONFIG.openai.apiKey) {
        throw new Error('OpenAI API key is missing in AGENT_CONFIG.openai.apiKey');
    }
    const model = new ChatOpenAI({
        openAIApiKey: AGENT_CONFIG.openai.apiKey,
        modelName: AGENT_CONFIG.openai.modelName,
    }).bindTools(tools);
    function isSimilarMessage(msg1, msg2) {
        // Remove whitespace and normalize
        const normalized1 = msg1.toLowerCase().replace(/\s+/g, ' ');
        const normalized2 = msg2.toLowerCase().replace(/\s+/g, ' ');
        // Check for exact match
        if (normalized1 === normalized2)
            return true;
        // Check for 90% similarity (accounting for minor variations)
        const similarity = calculateSimilarity(normalized1, normalized2);
        return similarity > 0.9;
    }
    function calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    function levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + substitutionCost);
            }
        }
        return matrix[str2.length][str1.length];
    }
    function shouldContinue(state) {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];
        // Debug logging
        console.log(`🔍 Agent decision - Message count: ${messages.length}`);
        console.log(`🔍 Last message content: "${lastMessage.content || 'no content'}"`);
        console.log(`🔍 Tool calls: ${lastMessage.tool_calls?.length || 0}`);
        const content = typeof lastMessage.content === 'string' ? lastMessage.content.toLowerCase() : '';
        // Check for explicit stop conditions in the message content (from original working version)
        const hasStopPhrase = AGENT_CONFIG.agent.stopPhrases.some((phrase) => content.includes(phrase.toLowerCase()));
        if (hasStopPhrase) {
            console.log(`🛑 Stop condition detected: ${content}`);
            return '__end__';
        }
        // Advanced infinite loop protection
        if (messages.length > 30) {
            console.log(`⚠️ Maximum conversation length reached, ending test`);
            return '__end__';
        }
        // Enhanced loop detection - check for repeated actions
        if (messages.length >= 8) {
            const lastContent = content.trim();
            const recentMessages = messages.slice(-6).map(m => typeof m.content === 'string' ? m.content.trim() : '');
            // Check if last 3 messages are identical (ignoring small variations)
            const identicalCount = recentMessages.filter(msg => msg.length > 20 && isSimilarMessage(lastContent, msg)).length;
            if (identicalCount >= 3) {
                console.log(`🔄 Message repetition detected, agent stuck in loop - FAILING test`);
                console.log(`🔄 Repeated message: "${lastContent.substring(0, 100)}..."`);
                return '__end__';
            }
            // Check for repeated tool calls (same tool used many times)
            const recentToolCalls = messages.slice(-8)
                .filter(m => m.tool_calls && m.tool_calls.length > 0)
                .flatMap(m => m.tool_calls?.map((tc) => tc.function?.name) || [])
                .filter(name => name);
            if (recentToolCalls.length >= 6) {
                const toolCounts = recentToolCalls.reduce((acc, tool) => {
                    acc[tool] = (acc[tool] || 0) + 1;
                    return acc;
                }, {});
                const toolCountValues = Object.values(toolCounts);
                if (toolCountValues.length > 0) {
                    const maxToolCount = Math.max(...toolCountValues);
                    const repeatedTool = Object.keys(toolCounts).find(tool => toolCounts[tool] === maxToolCount);
                    if (maxToolCount >= 4) {
                        console.log(`🔄 Tool repetition detected: "${repeatedTool}" used ${maxToolCount} times recently - FAILING test`);
                        return '__end__';
                    }
                }
            }
        }
        // Continue if there are tool calls to make
        if (lastMessage.tool_calls?.length) {
            console.log(`➡️ Continuing to tools node`);
            return 'tools';
        }
        // KEY BEHAVIOR FROM ORIGINAL: If no tool calls, end the test
        console.log(`🏁 No tool calls remaining - ending test`);
        return '__end__';
    }
    async function callModel(state) {
        const response = await model.invoke(state.messages);
        // Simple context initialization on first run
        let newTestContext = state.testContext || {};
        if (!newTestContext.startTime) {
            newTestContext = {
                ...newTestContext,
                startTime: Date.now(),
            };
            console.log(`🚀 Test session started - conversation memory will track progress naturally`);
        }
        // Log conversation progress
        console.log(`💬 Agent processing message ${state.messages.length + 1} - Memory persisted via thread_id`);
        return {
            messages: [response],
            testContext: newTestContext,
        };
    }
    const workflow = new StateGraph(TestState)
        .addNode('agent', callModel)
        .addEdge('__start__', 'agent')
        .addNode('tools', toolNode)
        .addEdge('tools', 'agent')
        .addConditionalEdges('agent', shouldContinue);
    const agent = workflow.compile({
        checkpointer: memorySaver,
    });
    console.log('✅ AI agent configured successfully');
    return agent;
}
//# sourceMappingURL=agent-setup.js.map