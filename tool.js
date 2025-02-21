import { ChatOpenAI } from "@langchain/openai";
import { tool } from '@langchain/core/tools';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { chromium } from "playwright";
import { z } from "zod";
import * as dotenv from "dotenv";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
dotenv.config();

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

const url = "https://qafromla.herokuapp.com/";
const task = `Go to ${url}`;

// 🛠️ Define Browser Actions as Tools
const navigate = tool(async ({ location }) => {
  console.log(`🌍 Navigating to: ${location}`);
  await page.goto(location);
  return `Navigated to: ${location}`;
}, {
  name: 'navigate',
  description: 'Call to navigate to a URL.',
  schema: z.object({
    location: z.string().describe("URL to go."),
  })
});

const tools = [navigate];
const toolNode = new ToolNode(tools);

// 🔥 Create AI Agent
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
}).bindTools(tools);


function shouldContinue({ messages } ) {
  const lastMessage = messages[messages.length - 1];

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

//Define the function that calls the model
async function callModel(state) {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile();

// Use the agent
const finalState = await app.invoke({
  messages: [new HumanMessage(task)],
});
console.log(finalState.messages[finalState.messages.length - 1].content);
