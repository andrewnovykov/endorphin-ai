import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

// 🛠️ Define Browser Actions as Tools
const click = async ({ selector }, { page }) => {
  console.log(`🔘 Clicking: ${selector}`);
  await page.click(selector);
  return `Clicked: ${selector}`;
};

const fill = async ({ selector, value }, { page }) => {
  console.log(`📝 Filling ${selector} with ${value}`);
  await page.fill(selector, value);
  return `Filled ${selector} with ${value}`;
};

const navigate = async ({ url }, { page }) => {
  console.log(`🌍 Navigating to: ${url}`);
  await page.goto(url);
  return `Navigated to: ${url}`;
};

// Define Tools with OpenAI function calling format
const ClickTool = {
  type: "function",
  function: {
    name: "click",
    description: "Clicks an element on the webpage. Provide the selector.",
    parameters: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description: "The CSS selector of the element to click.",
        },
      },
      required: ["selector"],
    },
  },
  func: click,
};

const FillTool = {
  type: "function",
  function: {
    name: "fill",
    description: "Fills an input field with a given value. Provide selector and value.",
    parameters: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description: "The CSS selector of the input field.",
        },
        value: {
          type: "string",
          description: "The value to fill the input field with.",
        },
      },
      required: ["selector", "value"],
    },
  },
  func: fill,
};

const NavigateTool = {
  type: "function",
  function: {
    name: "navigate",
    description: "Navigates to a URL.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to navigate to.",
        },
      },
      required: ["url"],
    },
  },
  func: navigate,
};

// 🔥 Create AI Agent
export async function createAgent(page) {
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
  });

  const tools = [ClickTool, FillTool, NavigateTool];

  const checkpointer = new MemorySaver();

  return createReactAgent({
    llm,
    tools,
    checkpointSaver: checkpointer,
    initialState: { page }, // Ensure Playwright's `page` is accessible
  });
}