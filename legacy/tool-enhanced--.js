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
fill in the password with "lalalend", and click on the "Sign In" button.
Take screenshots at key steps to document the process.`;

// 🛠️ Enhanced Browser Actions (MCP-style) as Tools
const navigate = tool(async ({ location, waitUntil = 'domcontentloaded' }) => {
  console.log(`🌍 Navigating to: ${location}`);
  await page.goto(location, { waitUntil, timeout: 60000 });
  return `Successfully navigated to: ${location}`;
}, {
  name: 'navigate',
  description: 'Navigate to a URL with enhanced options.',
  schema: z.object({
    location: z.string().describe("URL to navigate to"),
    waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional().describe("When to consider navigation complete"),
  })
});

const getPageContent = tool(async ({ selector, includeTitle = true }) => {
  console.log("📄 Getting page content");
  let content = '';
  
  if (includeTitle) {
    const title = await page.title();
    const url = page.url();
    content += `Page Title: ${title}\nURL: ${url}\n\n`;
  }
  
  if (selector) {
    const elementContent = await page.locator(selector).textContent();
    content += `Content of ${selector}: ${elementContent}`;
  } else {
    const htmlContent = await page.content();
    content += htmlContent;
  }
  
  return content;
}, {
  name: 'getPageContent',
  description: 'Get HTML content of the page or specific element with optional title information.',
  schema: z.object({
    selector: z.string().optional().describe("CSS selector of specific element (optional)"),
    includeTitle: z.boolean().optional().describe("Include page title and URL"),
  })
});

const wait = tool(async ({ milliseconds = 500, reason }) => {
  console.log(`⏱️ Waiting for ${milliseconds}ms${reason ? ` (${reason})` : ''}`);
  await page.waitForTimeout(milliseconds);
  return `Waited for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
}, {
  name: 'wait',
  description: 'Wait for a specified amount of time with optional reason.',
  schema: z.object({
    milliseconds: z.number().describe("Time to wait in milliseconds"),
    reason: z.string().optional().describe("Reason for waiting (for logging)"),
  })
});

const verifyElement = tool(async ({ selector, state = 'visible', timeout = 10000 }) => {
  console.log(`🔍 Verifying ${selector} is ${state}`);
  try {
    await page.waitForSelector(selector, { state, timeout });
    return `✅ Element ${selector} is ${state} on the page`;
  } catch (error) {
    return `❌ Could not verify element ${selector} as ${state}: ${error.message}`;
  }
}, {
  name: 'verifyElement',
  description: 'Verify if an element exists and is in the specified state.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the element to verify"),
    state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional().describe("Expected state"),
    timeout: z.number().optional().describe("Timeout in milliseconds"),
  })
});

// Enhanced fill operation with multiple strategies
const fill = tool(async ({ selector, value, strategy = 'fill', clearFirst = true }) => {
  console.log(`📝 Filling ${selector} with "${value}" using ${strategy} strategy`);
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
    
    if (clearFirst) {
      // Clear the field first
      await page.focus(selector);
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Delete');
    }
    
    if (strategy === 'type') {
      await page.type(selector, value, { delay: 50 });
    } else {
      await page.fill(selector, value);
    }
    
    // Verify the value was set
    const actualValue = await page.locator(selector).inputValue();
    
    if (actualValue === value) {
      return `✅ Successfully filled ${selector} with "${value}"`;
    } else {
      return `⚠️ Filled ${selector} but value is "${actualValue}" instead of "${value}"`;
    }
  } catch (error) {
    return `❌ Error filling ${selector}: ${error.message}`;
  }
}, {
  name: 'fill',
  description: 'Fill input field with enhanced strategies and verification.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the input field"),
    value: z.string().describe("Text value to enter"),
    strategy: z.enum(['fill', 'type']).optional().describe("Filling strategy"),
    clearFirst: z.boolean().optional().describe("Clear field before filling"),
  })
});

// Enhanced click with multiple selection strategies
const click = tool(async ({ selector, strategy = 'css', button = 'left', clickCount = 1, timeout = 10000 }) => {
  console.log(`🔘 Clicking ${selector} using ${strategy} strategy`);
  try {
    let locator;
    
    switch (strategy) {
      case 'text':
        locator = page.getByText(selector);
        break;
      case 'role':
        const [role, name] = selector.split(':');
        locator = page.getByRole(role, { name });
        break;
      case 'placeholder':
        locator = page.getByPlaceholder(selector);
        break;
      case 'label':
        locator = page.getByLabel(selector);
        break;
      default:
        locator = page.locator(selector);
    }
    
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ button, clickCount });
    
    return `✅ Successfully clicked ${selector} using ${strategy} strategy`;
  } catch (error) {
    return `❌ Error clicking ${selector}: ${error.message}`;
  }
}, {
  name: 'click',
  description: 'Click element with multiple selection strategies.',
  schema: z.object({
    selector: z.string().describe("Element selector (CSS, text, role:name, etc.)"),
    strategy: z.enum(['css', 'text', 'role', 'placeholder', 'label']).optional().describe("Selection strategy"),
    button: z.enum(['left', 'right', 'middle']).optional().describe("Mouse button"),
    clickCount: z.number().optional().describe("Number of clicks"),
    timeout: z.number().optional().describe("Timeout in milliseconds"),
  })
});

// Screenshot tool for debugging and documentation
const screenshot = tool(async ({ name, selector, fullPage = false }) => {
  const filename = name || `screenshot-${Date.now()}.png`;
  console.log(`📸 Taking screenshot: ${filename}`);
  
  try {
    if (selector) {
      await page.locator(selector).screenshot({ path: filename });
      return `📸 Screenshot of ${selector} saved as ${filename}`;
    } else {
      await page.screenshot({ path: filename, fullPage });
      return `📸 ${fullPage ? 'Full page' : 'Viewport'} screenshot saved as ${filename}`;
    }
  } catch (error) {
    return `❌ Error taking screenshot: ${error.message}`;
  }
}, {
  name: 'screenshot',
  description: 'Take screenshot of page or specific element for debugging.',
  schema: z.object({
    name: z.string().optional().describe("Filename for screenshot"),
    selector: z.string().optional().describe("CSS selector of element to screenshot"),
    fullPage: z.boolean().optional().describe("Take full page screenshot"),
  })
});

// Get element information
const getElementInfo = tool(async ({ selector }) => {
  console.log(`🔍 Getting info for element: ${selector}`);
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    
    const elementInfo = await page.locator(selector).evaluate(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      textContent: el.textContent?.trim(),
      value: el.value,
      placeholder: el.placeholder,
      type: el.type,
      disabled: el.disabled,
      visible: el.offsetParent !== null
    }));
    
    return `Element ${selector} info: ${JSON.stringify(elementInfo, null, 2)}`;
  } catch (error) {
    return `❌ Could not get info for ${selector}: ${error.message}`;
  }
}, {
  name: 'getElementInfo',
  description: 'Get detailed information about a specific element.',
  schema: z.object({
    selector: z.string().describe("CSS selector of the element"),
  })
});

const tools = [
  navigate, getPageContent, wait, verifyElement, fill, click, screenshot, getElementInfo
];

const toolNode = new ToolNode(tools);

// 🔥 Create AI Agent
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
}).bindTools(tools);

function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile({
  recursionLimit: 50, // Prevent recursion issues
});

console.log("🚀 Starting enhanced browser automation...");

try {
  // Use the agent
  const finalState = await app.invoke({
    messages: [new HumanMessage(task)],
  });
  
  console.log("✅ Automation completed!");
  console.log("Final result:", finalState.messages[finalState.messages.length - 1].content);
} catch (error) {
  console.error("❌ Error during automation:", error);
} finally {
  await browser.close();
}
