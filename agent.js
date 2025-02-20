import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

// 🛠️ Define Browser Actions as Tools
// Modified to fit the new tool definition style and OpenAI function calling format
const click = async ({ selector }, page) => {
  console.log(`🔘 Clicking: ${selector}`);
  await page.click(selector);
  return `Clicked: ${selector}`;
};

const fill = async ({ selector, value }, page) => {
  console.log(`📝 Filling ${selector} with ${value}`);
  await page.fill(selector, value);
  return `Filled ${selector} with ${value}`;
};

const navigate = async ({ url }, page) => {
  console.log(`🌍 Navigating to: ${url}`);
  await page.goto(url);
  return `Navigated to: ${url}`;
};

const ClickTool = new Tool({
  name: "click",
  description: "Clicks an element on the webpage. Provide the selector.",
  func: click,
  schema: z.object({ selector: z.string() }),
});

const FillTool = new Tool({
  name: "fill",
  description: "Fills an input field with a given value. Provide selector and value.",
  func: fill,
  schema: z.object({ selector: z.string(), value: z.string() }),
});

const NavigateTool = new Tool({
  name: "navigate",
  description: "Navigates to a URL.",
  func: navigate,
  schema: z.object({ url: z.string() }),
});

// 🔥 Create AI Agent with Tools
export async function createAgent(page) {
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
  });

  const tools = [
    ClickTool,
    FillTool,
    NavigateTool,
  ];

  const checkpointer = new MemorySaver();

  const agent = createReactAgent({
    llm: llm,
    tools: tools,
    checkpointSaver: checkpointer,
  });

  return agent;
}