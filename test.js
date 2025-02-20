import { createAgent } from "./agent.js";
import { chromium } from "playwright";

const url = "https://qafromla.herokuapp.com/";
const task = `
    Go to ${url}, 
    sign up, 
    fill in the form, 
    create a new article, 
    fill in the form, 
    go to the main page, 
    global feed, 
    and return the first article title.
`;

async function main() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const agent = await createAgent(page);

  console.log("🧠 Running AI-driven test...");
  const result = await agent.invoke(
    { messages: [{ role: "user", content: task }] },
    { configurable: { thread_id: `thread-${Date.now()}`, page } }
  );

  console.log("✅ Test Result:", result);

  await browser.close();
}

main();