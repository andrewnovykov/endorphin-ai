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
  // Adapt the call to the new agent structure
  const result = await agent.invoke({
    messages: [{ role: "user", content: task }],
  }, {
    configurable: { 
      page: page, // Pass the page object in configurable
      thread_id: "test-thread" // Add a thread_id
    }
  });

  console.log("✅ Test Result:", result.messages.at(-1)?.content);

  await browser.close();
}

main();