import { ChatOpenAI } from "@langchain/openai";
import { tool } from '@langchain/core/tools';
import { HumanMessage } from "@langchain/core/messages";
import { chromium } from "playwright";
import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

const url = "https://qafromla.herokuapp.com/";

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

// 🔥 Create AI Agent
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
}).bindTools(tools);

const tool_call = await llm.invoke([new HumanMessage(`Go to ${url}`)],{page:page});

console.log(tool_call);
