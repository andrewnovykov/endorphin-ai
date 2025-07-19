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

import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { Annotation, MemorySaver, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import type { TestSession } from '../types/test.js';
import { getCurrentBrowserManager } from '../utils/user-utils.js';
import { AGENT_CONFIG } from './config/agent-config.js';

// Global variables to track session and token tracking
let currentSession: TestSession | null = null;
let agentCallCounter = 0;

/**
 * Set the current test session for token tracking
 */
export function setCurrentTestSession(session: TestSession | null) {
  currentSession = session;
  agentCallCounter = 0;
}

/**
 * Global function to track any AI call in the agent history
 */
export function trackAICall(
  callType: string,
  prompt: string,
  response: string,
  tokenUsage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
    cost: number;
    model: string;
  },
  duration: number,
  context?: string,
  userId?: string
) {
  if (!currentSession) return;

  agentCallCounter++;

  const agentEntry = {
    historyId: currentSession.agentHistory.length + 1,
    timestamp: new Date().toISOString(),
    thinking: `${callType} ${agentCallCounter}`,
    prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
    response: response.substring(0, 500) + (response.length > 500 ? '...' : ''),
    userId: userId || undefined, // Include user context for multi-user tests
    tokenUsage,
    duration,
    context: context || `${callType} #${agentCallCounter}`,
  };

  currentSession.agentHistory.push(agentEntry);
  console.log(
    `\n 💰 ${callType} ${agentCallCounter}: ${tokenUsage.totalTokens} tokens ($${tokenUsage.cost.toFixed(4)}) in ${duration}ms \n`
  );
}

// Simplified State Annotation for Proper Memory Management
const TestState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  // Let conversation memory handle the rest naturally
  testContext: Annotation<{
    sessionId?: string;
    testName?: string;
    startTime?: number;
  }>({
    reducer: (x, y) => ({ ...x, ...y }),
  }),
});

type TestStateType = typeof TestState.State;

interface AgentWorkflow {
  invoke(
    input: any,
    config?: {
      configurable?: {
        thread_id?: string;
        [key: string]: any;
      };
      [key: string]: any;
    }
  ): Promise<any>;
}

// Global memory saver instance
const memorySaver = new MemorySaver();

/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @param config - Optional configuration with thread_id for memory persistence
 * @returns Compiled agent workflow
 */
export function setupAgent(tools: any[], config?: { thread_id?: string }): AgentWorkflow {
  console.log('\n 🤖 Configuring AI agent with tools...');

  // Log memory configuration
  if (config?.thread_id) {
    console.log(`\n 🧠 Memory persistence enabled with thread_id: ${config.thread_id}`);
  } else {
    console.log(`\n 🧠 Using session-based memory (no thread_id specified)`);
  }

  // Enhanced tool node with better error handling
  const baseToolNode = new ToolNode(tools);
  
  // Wrap tool node with error handling
  const toolNode = async (state: TestStateType) => {
    try {
      return await baseToolNode.invoke(state);
    } catch (error: any) {
      console.error('❌ Tool execution failed:', error);
      
      // Create a proper tool response message even if the tool failed
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
      const toolCalls = lastMessage.tool_calls || [];
      
      // Create tool response messages for failed tools
      const toolMessages = toolCalls.map((toolCall) => ({
        type: 'tool' as const,
        content: `Tool execution failed: ${error.message}`,
        tool_call_id: toolCall.id,
        name: toolCall.name,
      }));
      
      return {
        messages: toolMessages,
      };
    }
  };

  if (!AGENT_CONFIG.openai.apiKey) {
    throw new Error('OpenAI API key is missing in AGENT_CONFIG.openai.apiKey');
  }
  const model = new ChatOpenAI({
    openAIApiKey: AGENT_CONFIG.openai.apiKey,
    modelName: AGENT_CONFIG.openai.modelName,
    temperature: 0.1,
    maxRetries: 3,
    timeout: 30000, // 30 seconds timeout
  }).bindTools(tools);

  //TODO: Move to
  function isSimilarMessage(msg1: string, msg2: string): boolean {
    // Remove whitespace and normalize
    const normalized1 = msg1.toLowerCase().replace(/\s+/g, ' ');
    const normalized2 = msg2.toLowerCase().replace(/\s+/g, ' ');

    // Check for exact match
    if (normalized1 === normalized2) return true;

    // Check for 90% similarity (accounting for minor variations)
    const similarity = calculateSimilarity(normalized1, normalized2);
    return similarity > 0.9;
  }

  //TODO: Move to
  function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  //TODO: Move to
  function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  //TODO: Move to framework/ai/utils/decision-logic.ts
  function shouldContinue(state: TestStateType): string {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Debug logging (simplified to avoid confusion with tracking)
    console.log(`\n🔍 Decision logic - Message count: ${messages.length}`);
    console.log(`🔍 Last message content: "${lastMessage.content || 'no content'}"`);
    console.log(`🔍 Tool calls: ${lastMessage.tool_calls?.length || 0}`);

    const content =
      typeof lastMessage.content === 'string' ? lastMessage.content.toLowerCase() : '';

    // Check for explicit stop conditions in the message content (from original working version)
    const hasStopPhrase = AGENT_CONFIG.agent.stopPhrases.some((phrase: string) =>
      content.includes(phrase.toLowerCase())
    );

    if (hasStopPhrase) {
      console.log(`🛑 Stop condition detected: ${content}`);
      return '__end__';
    }

    // Advanced infinite loop protection
    // Increase limit for multi-user tests (check if we have multiple users active)
    const browserManager = getCurrentBrowserManager();
    const isMultiUser =
      browserManager && browserManager.isMultiUserMode && browserManager.isMultiUserMode();
    const maxMessages = isMultiUser ? 200 : 100; // Higher limits for complex tests

    if (messages.length > maxMessages) {
      console.log(
        `\n ⚠️ Maximum conversation length reached, ending test (${messages.length}/${maxMessages})`
      );
      return '__end__';
    }

    // Enhanced loop detection - check for repeated actions
    //TODO: Move loop detection logic to framework/ai/utils/loop-detection.ts
    if (messages.length >= 8) {
      const lastContent = content.trim();
      const recentMessages = messages
        .slice(-6)
        .map((m) => (typeof m.content === 'string' ? m.content.trim() : ''));

      // Check if last 3 messages are identical (ignoring small variations)
      const identicalCount = recentMessages.filter(
        (msg) => msg.length > 20 && isSimilarMessage(lastContent, msg)
      ).length;

      if (identicalCount >= 3) {
        console.log(`\n 🔄 Message repetition detected, agent stuck in loop - FAILING test`);
        console.log(`\n 🔄 Repeated message: "${lastContent.substring(0, 100)}..."`);
        return '__end__';
      }

      // Check for repeated tool calls (same tool used many times)
      const recentToolCalls = messages
        .slice(-8)
        .filter((m) => (m as any).tool_calls && (m as any).tool_calls.length > 0)
        .flatMap((m) => (m as any).tool_calls?.map((tc: any) => tc.function?.name) || [])
        .filter((name) => name) as string[];

      if (recentToolCalls.length >= 6) {
        const toolCounts = recentToolCalls.reduce(
          (acc, tool) => {
            acc[tool] = (acc[tool] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const toolCountValues = Object.values(toolCounts);
        if (toolCountValues.length > 0) {
          const maxToolCount = Math.max(...toolCountValues);
          const repeatedTool = Object.keys(toolCounts).find(
            (tool) => toolCounts[tool] === maxToolCount
          );

          if (maxToolCount >= 4) {
            console.log(
              `\n 🔄 Tool repetition detected: "${repeatedTool}" used ${maxToolCount} times recently - FAILING test`
            );
            return '__end__';
          }
        }
      }
    }

    // Continue if there are tool calls to make
    if (lastMessage.tool_calls?.length) {
      console.log(`\n➡️ Continuing to tools node`);
      return 'tools';
    }

    // KEY BEHAVIOR FROM ORIGINAL: If no tool calls, end the test
    console.log(`\n 🏁 No tool calls remaining - ending test`);
    return '__end__';
  }

  //TODO: Move to framework/ai/utils/model-caller.ts
  async function callModel(state: TestStateType): Promise<Partial<TestStateType>> {
    const startTime = Date.now();

    // Simple context initialization on first run
    let newTestContext = state.testContext || {};

    if (!newTestContext.startTime) {
      newTestContext = {
        ...newTestContext,
        startTime: Date.now(),
      };
      console.log(`\n 🚀 Test session started - conversation memory will track progress naturally`);
    }

    // Log conversation progress
    console.log(
      `\n 💬 Agent processing message ${state.messages.length + 1} - Memory persisted via thread_id`
    );

    try {
      const response = await model.invoke(state.messages);
    const duration = Date.now() - startTime;

    // Track EVERY agent call - including individual tool selections
    if (response instanceof AIMessage) {
      const hasToolCalls = response.tool_calls && response.tool_calls.length > 0;
      const hasContent = response.content && response.content.length > 0;

      // Extract conversation context for better understanding
      const lastHumanMessage = state.messages.filter((m) => m._getType() === 'human').slice(-1)[0];

      const prompt = lastHumanMessage?.content || 'Agent processing conversation';
      const responseContent = typeof response.content === 'string' ? response.content : '';

      // Classify the type of decision
      let callType = 'Agent Decision';
      let contextInfo = 'General agent processing';

      if (hasToolCalls && response.tool_calls) {
        // This is a tool selection decision
        const toolNames = response.tool_calls.map((tc) => tc.name || 'unknown');
        callType = 'Tool Selection';
        contextInfo = `Selected tools: ${toolNames.join(', ')}`;

        // Add reasoning if there's content along with tool calls
        if (responseContent && responseContent.length > 10) {
          contextInfo += ` | Reasoning: ${responseContent.substring(0, 100)}`;
        }
      } else if (hasContent && responseContent.length > 10) {
        // This is a reasoning/conclusion decision
        callType = 'Agent Reasoning';
        contextInfo = 'Agent analysis and conclusion';
      } else {
        // Skip very short or empty responses
        return {
          messages: [response],
          testContext: newTestContext,
        };
      }

      // Estimate tokens for this specific decision
      //TODO: Move token estimation logic to framework/ai/utils/token-calculator.ts
      const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
      const estimatedPromptTokens = Math.ceil(promptText.length / 4);
      const estimatedResponseTokens = Math.ceil(
        (responseContent + JSON.stringify(response.tool_calls || [])).length / 4
      );
      const totalTokens = estimatedPromptTokens + estimatedResponseTokens;

      // Calculate cost (GPT-4o pricing)
      //TODO: from config!
      const cost = (estimatedPromptTokens * 0.005 + estimatedResponseTokens * 0.015) / 1000;

      const tokenUsage = {
        promptTokens: estimatedPromptTokens,
        responseTokens: estimatedResponseTokens,
        totalTokens,
        cost,
        model: 'gpt-4o',
      };

      // Get current user context for multi-user tests
      const browserManager = getCurrentBrowserManager();
      const currentUserId = browserManager ? browserManager.getCurrentUserId() : undefined;

      trackAICall(
        callType,
        promptText,
        responseContent + (hasToolCalls ? ` | Tools: ${JSON.stringify(response.tool_calls)}` : ''),
        tokenUsage,
        duration,
        contextInfo,
        currentUserId || undefined
      );
    }

      return {
        messages: [response],
        testContext: newTestContext,
      };
    } catch (error: any) {
      console.error('❌ Agent model invocation failed:', error);
      
      // Handle specific error types
      if (error.lc_error_code === 'INVALID_TOOL_RESULTS') {
        console.error('🔧 Tool results error - checking tool call responses');
        throw new Error(`Tool results error: ${error.message}`);
      }
      
      if (error.lc_error_code === 'GRAPH_RECURSION_LIMIT') {
        console.error('🔄 Recursion limit reached - test may be stuck in loop');
        throw new Error(`Recursion limit reached: ${error.message}`);
      }
      
      // Re-throw with more context
      throw new Error(`Agent invocation failed: ${error.message}`);
    }
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
