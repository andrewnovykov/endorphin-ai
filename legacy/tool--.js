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
const task = `Go to ${url}, first analyze the page structure to identify the correct selectors, 
then click on the "Log In" button, wait for the form to fully load, 
verify that both email and password fields are visible,
then fill in the email field with papapin888@gmail.com,
then wait for 500ms,
fill in the password with "lalalend", and click on the "Sign In" button.`;

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

const getPageContent = tool(async () => {
  console.log("📄 Getting page content");
  const content = await page.content();
  return content;
}, {
  name: 'getPageContent',
  description: 'Get the current HTML content of the page to analyze its structure.',
  schema: z.object({})
});

const wait = tool(async ({ milliseconds = 500 }) => {
  console.log(`⏱️ Waiting for ${milliseconds}ms`);
  await page.waitForTimeout(milliseconds);
  return `Waited for ${milliseconds}ms`;
}, {
  name: 'wait',
  description: 'Wait for a specified amount of time in milliseconds before proceeding.',
  schema: z.object({
    milliseconds: z.number().describe("Time to wait in milliseconds"),
  })
});

const verifyElement = tool(async ({ selector }) => {
  console.log(`🔍 Verifying existence of: ${selector}`);
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    return `Element ${selector} is visible on the page`;
  } catch (error) {
    return `Could not find element ${selector}: ${error.message}`;
  }
}, {
  name: 'verifyElement',
  description: 'Verify if an element exists and is visible on the page.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the element to verify"),
  })
});

// Improve the fill operation to focus first
const fill = tool(async ({ selector, value }) => {
  console.log(`📝 Filling ${selector} with ${value}`);
  try {
    // Wait for the element to be visible
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    
    // Focus on the element first
    await page.focus(selector);
    
    // Clear the field before filling
    await page.evaluate(sel => {
      document.querySelector(sel).value = '';
    }, selector);
    
    // Fill the field
    await page.fill(selector, value);
    
    // Verify the value was set correctly
    const actualValue = await page.evaluate(sel => {
      return document.querySelector(sel).value;
    }, selector);
    
    if (actualValue === value) {
      return `Successfully filled ${selector} with "${value}"`;
    } else {
      return `Warning: Tried to fill ${selector} with "${value}" but field contains "${actualValue}"`;
    }
  } catch (error) {
    return `Error filling ${selector}: ${error.message}`;
  }
}, {
  name: 'fill',
  description: 'Call to fill in input.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the input to fill in."),
    value: z.string().describe("Text value to enter in the input field."),
  })
});

// Update the click function to wait for elements
const click = tool(async ({ selector }) => {
  console.log(`🔘 Clicking: ${selector}`);
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    await page.click(selector);
    return `Clicked: ${selector}`;
  } catch (error) {
    return `Error clicking ${selector}: ${error.message}`;
  }
}, {
  name: 'click',
  description: 'Call to click on element.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the element to click on."),
  })
});

const tools = [navigate, fill, click, getPageContent, wait, verifyElement];
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
const app = workflow.compile({
  recursionLimit: 50, // Prevent recursion issues
});

// Use the agent
const finalState = await app.invoke({
  messages: [new HumanMessage(task)],
});
console.log(finalState.messages[finalState.messages.length - 1].content);
