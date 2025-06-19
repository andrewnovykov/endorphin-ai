// framework/core/agent-setup.js
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { AGENT_CONFIG } from '../config/agent-config.js';

/**
 * Setup AI agent with tools and workflow
 * @param {Array} tools - Array of browser automation tools
 * @returns {Object} Compiled agent workflow
 */
export async function setupAgent(tools) {
  console.log("🤖 Configuring AI agent with tools...");
  
  const toolNode = new ToolNode(tools);

  const model = new ChatOpenAI({
    openAIApiKey: AGENT_CONFIG.openai.apiKey,
    modelName: AGENT_CONFIG.openai.modelName,
  }).bindTools(tools);

  function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    
    // Check for explicit stop conditions in the message content
    const content = lastMessage.content?.toLowerCase() || '';
    const hasStopPhrase = AGENT_CONFIG.agent.stopPhrases.some(phrase => 
      content.includes(phrase)
    );
    
    if (hasStopPhrase) {
      console.log(`🛑 Stop condition detected: ${content}`);
      return "__end__";
    }
    
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  async function callModel(state) {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

  const agent = workflow.compile({
    recursionLimit: AGENT_CONFIG.agent.recursionLimit,
  });

  console.log("✅ AI agent configured successfully");
  return agent;
}
