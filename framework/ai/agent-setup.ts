/**
 * Endorphin e2e AI test framework
 * Copyright (C) 2025 Redstudio Agency
 *
 * AI Agent Setup - TypeScript Migration
 */

import { Annotation, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { AGENT_CONFIG } from './config/agent-config.js';
import { parseSteps } from '../utils/step-parser.js';

// Enhanced State Annotation for Test Execution
const TestState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  currentStep: Annotation<number>({
    reducer: (x, y) => y ?? x ?? 1,
  }),
  totalSteps: Annotation<number>({
    reducer: (x, y) => y ?? x ?? 0,
  }),
  stepStatus: Annotation<Record<number, 'pending' | 'in_progress' | 'completed' | 'failed'>>({
    reducer: (x, y) => ({ ...x, ...y }),
  }),
  stepAttempts: Annotation<Record<number, number>>({
    reducer: (x, y) => ({ ...x, ...y }),
  }),
  testStartTime: Annotation<number>({
    reducer: (x, y) => y ?? x,
  }),
  isComplete: Annotation<boolean>({
    reducer: (x, y) => y ?? x ?? false,
  }),
});

type TestStateType = typeof TestState.State;

interface AgentWorkflow {
  invoke(input: any, config?: any): Promise<any>;
}

// Global memory saver instance
const memorySaver = new MemorySaver();

/**
 * Setup AI agent with tools and workflow
 * @param tools - Array of browser automation tools
 * @param config - Optional configuration with thread_id for memory persistence
 * @returns Compiled agent workflow
 */
export async function setupAgent(tools: any[], config?: { thread_id?: string }): Promise<AgentWorkflow> {
  console.log('🤖 Configuring AI agent with tools...');

  // Small delay to ensure async behavior
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const toolNode = new ToolNode(tools);

  if (!AGENT_CONFIG.openai.apiKey) {
    throw new Error('OpenAI API key is missing in AGENT_CONFIG.openai.apiKey');
  }
  const model = new ChatOpenAI({
    openAIApiKey: AGENT_CONFIG.openai.apiKey,
    modelName: AGENT_CONFIG.openai.modelName,
  }).bindTools(tools);

  function shouldContinue(state: TestStateType): string {
    const { messages, currentStep, totalSteps } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Debug logging
    console.log(`🔍 Agent decision - Message count: ${messages.length}`);
    console.log(`🔍 Last message content: "${lastMessage.content || 'no content'}"`);
    console.log(`🔍 Tool calls: ${lastMessage.tool_calls?.length || 0}`);
    console.log(`🔍 Current step: ${currentStep}/${totalSteps}`);
    
    const content = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    
    // Check for test completion patterns
    const trimmedContent = content.trim().toLowerCase();
    const isTestComplete = trimmedContent.endsWith('test completed successfully') ||
                          trimmedContent === 'test completed successfully' ||
                          content.includes('login process was successfully completed');
    
    // Check for infinite loop patterns (legacy fallback)
    if (messages.length > 10) {
      const recentMessages = messages.slice(-5).map(m => m.content || '').join(' ').toLowerCase();
      const hasInfiniteLoop = recentMessages.includes('need help') || 
                             recentMessages.includes('further assistance') ||
                             recentMessages.includes('more tasks');
      if (hasInfiniteLoop) {
        console.log(`⚠️ Detected infinite loop pattern, forcing completion`);
        return '__end__';
      }
      
      // Check for completion-indicating phrases (legacy)
      const hasCompletionPhrase = recentMessages.includes('login process was successfully completed') ||
                                 recentMessages.includes('confirming that the login was successful') ||
                                 recentMessages.includes('login was successful') ||
                                 recentMessages.includes('successfully completed');
      
      if (hasCompletionPhrase && messages.length > 15) {
        console.log(`🎯 Detected test completion but agent not saying magic phrase, forcing end`);
        return '__end__';
      }
      
      // Check for exact message repetition
      if (messages.length > 5) {
        const lastContent = lastMessage.content || '';
        const secondLastContent = messages[messages.length - 2]?.content || '';
        const thirdLastContent = messages[messages.length - 3]?.content || '';
        
        if (lastContent === secondLastContent && secondLastContent === thirdLastContent && lastContent.length > 20) {
          console.log(`🔄 Detected identical message repetition, forcing end`);
          return '__end__';
        }
      }
    }

    if (isTestComplete) {
      console.log(`🛑 Test completion detected: ${content}`);
      return '__end__';
    }

    // Continue if there are tool calls to make
    if (lastMessage.tool_calls?.length) {
      console.log(`➡️ Continuing to tools node`);
      return 'tools';
    }
    
    // Continue agent execution
    console.log(`🔄 Continuing agent execution`);
    return 'agent';
  }

  async function callModel(state: TestStateType): Promise<Partial<TestStateType>> {
    const response = await model.invoke(state.messages);
    
    // Initialize step tracking from first message if not set
    let newCurrentStep = state.currentStep;
    let newTotalSteps = state.totalSteps;
    let newStepStatus = state.stepStatus || {};
    let newStepAttempts = state.stepAttempts || {};
    let newTestStartTime = state.testStartTime;
    
    if (!newTestStartTime) {
      newTestStartTime = Date.now();
    }
    
    if (!newCurrentStep) {
      newCurrentStep = 1;
    }
    
    // Try to extract step information from the first message (task description)
    if (!newTotalSteps && state.messages.length > 0) {
      const firstMessage = state.messages[0];
      if (firstMessage && typeof firstMessage.content === 'string') {
        const stepParseResult = parseSteps(firstMessage.content);
        if (stepParseResult.hasValidSteps) {
          newTotalSteps = stepParseResult.totalSteps;
          console.log(`📊 Initialized step tracking: ${newTotalSteps} total steps`);
        }
      }
    }
    
    console.log(`🔍 Agent state - Step ${newCurrentStep}/${newTotalSteps}`);
    
    return {
      messages: [response],
      currentStep: newCurrentStep,
      totalSteps: newTotalSteps,
      stepStatus: newStepStatus,
      stepAttempts: newStepAttempts,
      testStartTime: newTestStartTime,
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
    recursionLimit: AGENT_CONFIG.agent.recursionLimit,
  });

  console.log('✅ AI agent configured successfully');
  return agent;
}
