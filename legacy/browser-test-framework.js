import { ChatOpenAI } from "@langchain/openai";
import { tool } from '@langchain/core/tools';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { chromium } from "playwright";
import { z } from "zod";
import * as dotenv from "dotenv";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// 🎯 **FLEXIBLE BROWSER TEST FRAMEWORK**
// This framework can execute ANY browser task/test case you provide

class BrowserTestFramework {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.tools = null;
    this.agent = null;
    this.screenshotCounter = 0;
    this.testResults = [];
    this.currentTestSession = null;
    this.resultBaseDir = path.join(__dirname, 'test-result');
  }

  async initialize() {
    console.log("🚀 Initializing Browser Test Framework...");
    
    // Ensure test-result directory exists
    if (!fs.existsSync(this.resultBaseDir)) {
      fs.mkdirSync(this.resultBaseDir, { recursive: true });
    }
    
    // Launch browser
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    this.page = await this.context.newPage();

    // Setup tools
    this.setupTools();
    
    // Create AI agent
    await this.setupAgent();
    
    console.log("✅ Framework initialized successfully!");
  }

  // 📊 **TEST SESSION MANAGEMENT**
  createTestSession(testName, testId = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionId = testId || `test-${Date.now()}`;
    const sessionName = `${sessionId}_${timestamp}`;
    const sessionDir = path.join(this.resultBaseDir, sessionName);
    const screenshotsDir = path.join(sessionDir, 'screenshots');
    
    // Create directories
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.mkdirSync(screenshotsDir, { recursive: true });
    
    this.currentTestSession = {
      sessionId,
      sessionName,
      testName,
      testId,
      startTime: new Date().toISOString(),
      sessionDir,
      screenshotsDir,
      steps: [],
      toolCalls: [],
      stepCounter: 0,
      screenshotCounter: 0,
      status: 'RUNNING'
    };
    
    console.log(`📁 Created test session: ${sessionName}`);
    return this.currentTestSession;
  }

  logTestStep(stepDescription, toolName = null, toolArgs = null, result = null, isSuccess = true) {
    if (!this.currentTestSession) return;
    
    this.currentTestSession.stepCounter++;
    const step = {
      stepNumber: this.currentTestSession.stepCounter,
      timestamp: new Date().toISOString(),
      description: stepDescription,
      toolName,
      toolArgs,
      result,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      screenshots: [] // Will be populated by screenshot tool
    };
    
    this.currentTestSession.steps.push(step);
    
    if (toolName) {
      this.currentTestSession.toolCalls.push({
        stepNumber: this.currentTestSession.stepCounter,
        timestamp: step.timestamp,
        toolName,
        args: toolArgs,
        result,
        status: step.status
      });
    }
    
    console.log(`📝 Step ${step.stepNumber}: ${stepDescription} [${step.status}]`);
  }

  async takeStepScreenshot(stepDescription = null) {
    if (!this.currentTestSession) return null;
    
    this.currentTestSession.screenshotCounter++;
    const filename = `step-${this.currentTestSession.stepCounter}-screenshot-${this.currentTestSession.screenshotCounter}.png`;
    const filePath = path.join(this.currentTestSession.screenshotsDir, filename);
    
    try {
      await this.page.screenshot({ path: filePath, fullPage: false });
      
      // Add to current step if exists
      if (this.currentTestSession.steps.length > 0) {
        const currentStep = this.currentTestSession.steps[this.currentTestSession.steps.length - 1];
        currentStep.screenshots.push({
          filename,
          path: filePath,
          description: stepDescription || `Screenshot for step ${this.currentTestSession.stepCounter}`,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`📸 Screenshot saved: ${filename}`);
      return filePath;
    } catch (error) {
      console.error(`❌ Error taking screenshot: ${error.message}`);
      return null;
    }
  }

  finishTestSession(finalStatus, finalResult = null, error = null) {
    if (!this.currentTestSession) return;
    
    this.currentTestSession.endTime = new Date().toISOString();
    this.currentTestSession.duration = new Date(this.currentTestSession.endTime) - new Date(this.currentTestSession.startTime);
    this.currentTestSession.status = finalStatus;
    this.currentTestSession.finalResult = finalResult;
    this.currentTestSession.error = error;
    
    // Save detailed test result
    const resultFile = path.join(this.currentTestSession.sessionDir, 'test-result.json');
    fs.writeFileSync(resultFile, JSON.stringify(this.currentTestSession, null, 2));
    
    // Add to overall results
    this.testResults.push({
      testName: this.currentTestSession.testName,
      testId: this.currentTestSession.testId,
      sessionId: this.currentTestSession.sessionId,
      sessionDir: this.currentTestSession.sessionDir,
      status: finalStatus,
      startTime: this.currentTestSession.startTime,
      endTime: this.currentTestSession.endTime,
      duration: this.currentTestSession.duration,
      totalSteps: this.currentTestSession.steps.length,
      totalScreenshots: this.currentTestSession.screenshotCounter,
      result: finalResult,
      error: error
    });
    
    console.log(`✅ Test session completed: ${this.currentTestSession.sessionName}`);
    console.log(`📁 Results saved in: ${this.currentTestSession.sessionDir}`);
    
    const session = this.currentTestSession;
    this.currentTestSession = null;
    return session;
  }
    // 🛠️ Enhanced Browser Tools for Any Task
    const navigate = tool(async ({ location, waitUntil = 'domcontentloaded' }) => {
      console.log(`🌍 Navigating to: ${location}`);
      await this.page.goto(location, { waitUntil, timeout: 60000 });
      return `Successfully navigated to: ${location}`;
    }, {
      name: 'navigate',
      description: 'Navigate to any URL with enhanced options.',
      schema: z.object({
        location: z.string().describe("URL to navigate to"),
        waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
      })
    });

    const getPageContent = tool(async ({ includeTitle = true, maxLength = 8000 }) => {
      console.log("📄 Getting page content");
      let content = '';
      
      if (includeTitle) {
        const title = await this.page.title();
        const url = this.page.url();
        content += `Page Title: ${title}\nURL: ${url}\n\n`;
      }
      
      const htmlContent = await this.page.content();
      const truncatedContent = htmlContent.length > maxLength 
        ? htmlContent.substring(0, maxLength) + '\n... (truncated for brevity)'
        : htmlContent;
      content += truncatedContent;
      
      return content;
    }, {
      name: 'getPageContent',
      description: 'Get HTML content of the current page for analysis.',
      schema: z.object({
        includeTitle: z.boolean().optional(),
        maxLength: z.number().optional().describe("Maximum content length"),
      })
    });

    const click = tool(async ({ selector, strategy = 'css', timeout = 10000, force = false }) => {
      console.log(`🔘 Clicking ${selector} using ${strategy} strategy`);
      try {
        let locator;
        
        switch (strategy) {
          case 'text':
            locator = this.page.getByText(selector, { exact: false });
            break;
          case 'exact-text':
            locator = this.page.getByText(selector, { exact: true });
            break;
          case 'role':
            const [role, name] = selector.split(':');
            locator = this.page.getByRole(role, { name });
            break;
          case 'placeholder':
            locator = this.page.getByPlaceholder(selector);
            break;
          case 'label':
            locator = this.page.getByLabel(selector);
            break;
          case 'title':
            locator = this.page.getByTitle(selector);
            break;
          case 'alt':
            locator = this.page.getByAltText(selector);
            break;
          default:
            locator = this.page.locator(selector);
        }
        
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click({ force });
        
        return `✅ Successfully clicked ${selector} using ${strategy} strategy`;
      } catch (error) {
        return `❌ Error clicking ${selector}: ${error.message}`;
      }
    }, {
      name: 'click',
      description: 'Click any element with multiple selection strategies.',
      schema: z.object({
        selector: z.string().describe("Element selector"),
        strategy: z.enum(['css', 'text', 'exact-text', 'role', 'placeholder', 'label', 'title', 'alt']).optional(),
        timeout: z.number().optional(),
        force: z.boolean().optional().describe("Force click even if element is not clickable"),
      })
    });

    const fill = tool(async ({ selector, value, strategy = 'fill', clearFirst = true, pressEnter = false }) => {
      console.log(`📝 Filling ${selector} with "${value}"`);
      try {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        
        if (clearFirst) {
          await this.page.focus(selector);
          await this.page.keyboard.press('Control+a');
          await this.page.keyboard.press('Delete');
        }
        
        if (strategy === 'type') {
          await this.page.type(selector, value, { delay: 50 });
        } else {
          await this.page.fill(selector, value);
        }

        if (pressEnter) {
          await this.page.keyboard.press('Enter');
        }
        
        // Verify the value was set
        const actualValue = await this.page.locator(selector).inputValue();
        
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
      description: 'Fill any input field with text.',
      schema: z.object({
        selector: z.string().describe("CSS selector of input field"),
        value: z.string().describe("Text to enter"),
        strategy: z.enum(['fill', 'type']).optional(),
        clearFirst: z.boolean().optional(),
        pressEnter: z.boolean().optional().describe("Press Enter after filling"),
      })
    });

    const wait = tool(async ({ milliseconds = 500, reason, selector, state = 'visible' }) => {
      if (selector) {
        console.log(`⏱️ Waiting for ${selector} to be ${state}`);
        try {
          await this.page.waitForSelector(selector, { state, timeout: milliseconds });
          return `✅ Element ${selector} is now ${state}`;
        } catch (error) {
          return `❌ Timeout waiting for ${selector} to be ${state}`;
        }
      } else {
        console.log(`⏱️ Waiting for ${milliseconds}ms${reason ? ` (${reason})` : ''}`);
        await this.page.waitForTimeout(milliseconds);
        return `Waited for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
      }
    }, {
      name: 'wait',
      description: 'Wait for time or element state.',
      schema: z.object({
        milliseconds: z.number().optional().describe("Time to wait or timeout for element"),
        reason: z.string().optional(),
        selector: z.string().optional().describe("Wait for specific element"),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
      })
    });

    const verifyElement = tool(async ({ selector, state = 'visible', timeout = 10000 }) => {
      console.log(`🔍 Verifying ${selector} is ${state}`);
      try {
        await this.page.waitForSelector(selector, { state, timeout });
        return `✅ Element ${selector} is ${state} on the page`;
      } catch (error) {
        return `❌ Could not verify element ${selector} as ${state}: ${error.message}`;
      }
    }, {
      name: 'verifyElement',
      description: 'Verify element exists and is in specified state.',
      schema: z.object({
        selector: z.string(),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
        timeout: z.number().optional(),
      })
    });

    const screenshot = tool(async ({ name, selector, fullPage = false }) => {
      this.screenshotCounter++;
      const filename = name || `test-screenshot-${this.screenshotCounter}-${Date.now()}.png`;
      console.log(`📸 Taking screenshot: ${filename}`);
      
      try {
        if (selector) {
          await this.page.locator(selector).screenshot({ path: filename });
          return `📸 Screenshot of ${selector} saved as ${filename}`;
        } else {
          await this.page.screenshot({ path: filename, fullPage });
          return `📸 ${fullPage ? 'Full page' : 'Viewport'} screenshot saved as ${filename}`;
        }
      } catch (error) {
        return `❌ Error taking screenshot: ${error.message}`;
      }
    }, {
      name: 'screenshot',
      description: 'Take screenshot for documentation/debugging.',
      schema: z.object({
        name: z.string().optional(),
        selector: z.string().optional(),
        fullPage: z.boolean().optional(),
      })
    });

    const getElementInfo = tool(async ({ selector }) => {
      console.log(`🔍 Getting element info: ${selector}`);
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        
        const elementInfo = await this.page.locator(selector).evaluate(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          textContent: el.textContent?.trim(),
          value: el.value,
          placeholder: el.placeholder,
          type: el.type,
          disabled: el.disabled,
          visible: el.offsetParent !== null,
          href: el.href,
          src: el.src
        }));
        
        return `Element info: ${JSON.stringify(elementInfo, null, 2)}`;
      } catch (error) {
        return `❌ Could not get info for ${selector}: ${error.message}`;
      }
    }, {
      name: 'getElementInfo',
      description: 'Get detailed information about any element.',
      schema: z.object({
        selector: z.string(),
      })
    });

    const getText = tool(async ({ selector }) => {
      console.log(`📖 Getting text from: ${selector}`);
      try {
        const text = await this.page.locator(selector).textContent();
        return `Text content: "${text?.trim()}"`;
      } catch (error) {
        return `❌ Could not get text from ${selector}: ${error.message}`;
      }
    }, {
      name: 'getText',
      description: 'Extract text content from any element.',
      schema: z.object({
        selector: z.string(),
      })
    });

    const hover = tool(async ({ selector, timeout = 10000 }) => {
      console.log(`🫱 Hovering over: ${selector}`);
      try {
        await this.page.locator(selector).hover({ timeout });
        return `✅ Hovered over ${selector}`;
      } catch (error) {
        return `❌ Error hovering over ${selector}: ${error.message}`;
      }
    }, {
      name: 'hover',
      description: 'Hover over any element.',
      schema: z.object({
        selector: z.string(),
        timeout: z.number().optional(),
      })
    });

    const selectOption = tool(async ({ selector, value, label, index }) => {
      console.log(`📋 Selecting option in: ${selector}`);
      try {
        const selectElement = this.page.locator(selector);
        
        if (value) {
          await selectElement.selectOption({ value });
        } else if (label) {
          await selectElement.selectOption({ label });
        } else if (index !== undefined) {
          await selectElement.selectOption({ index });
        }
        
        return `✅ Selected option in ${selector}`;
      } catch (error) {
        return `❌ Error selecting option: ${error.message}`;
      }
    }, {
      name: 'selectOption',
      description: 'Select option from dropdown/select element.',
      schema: z.object({
        selector: z.string(),
        value: z.string().optional(),
        label: z.string().optional(),
        index: z.number().optional(),
      })
    });

    const scrollTo = tool(async ({ selector, position = 'center' }) => {
      console.log(`📜 Scrolling to: ${selector}`);
      try {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
        return `✅ Scrolled to ${selector}`;
      } catch (error) {
        return `❌ Error scrolling to ${selector}: ${error.message}`;
      }
    }, {
      name: 'scrollTo',
      description: 'Scroll to any element on the page.',
      schema: z.object({
        selector: z.string(),
        position: z.enum(['top', 'center', 'bottom']).optional(),
      })
    });

    this.tools = [
      navigate, getPageContent, click, fill, wait, verifyElement, 
      screenshot, getElementInfo, getText, hover, selectOption, scrollTo
    ];
  }

  async setupAgent() {
    const toolNode = new ToolNode(this.tools);

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
    }).bindTools(this.tools);

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

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addEdge("__start__", "agent")
      .addNode("tools", toolNode)
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", shouldContinue);

    this.agent = workflow.compile({
      recursionLimit: 50,
    });
  }

  async runTask(taskDescription, testName = null) {
    const timestamp = new Date().toISOString();
    const name = testName || `Test-${Date.now()}`;
    
    console.log(`\n🎯 Running Task: ${name}`);
    console.log(`📝 Task: ${taskDescription}`);
    console.log(`⏰ Started at: ${timestamp}\n`);

    try {
      const finalState = await this.agent.invoke({
        messages: [new HumanMessage(taskDescription)],
      });

      const result = {
        testName: name,
        task: taskDescription,
        timestamp,
        status: 'SUCCESS',
        result: finalState.messages[finalState.messages.length - 1].content,
        duration: Date.now() - new Date(timestamp).getTime()
      };

      this.testResults.push(result);
      
      console.log(`\n✅ Task "${name}" completed successfully!`);
      console.log(`📊 Result: ${result.result}\n`);
      
      return result;
    } catch (error) {
      const result = {
        testName: name,
        task: taskDescription,
        timestamp,
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - new Date(timestamp).getTime()
      };

      this.testResults.push(result);
      
      console.error(`\n❌ Task "${name}" failed!`);
      console.error(`🚨 Error: ${error.message}\n`);
      
      return result;
    }
  }

  async runMultipleTasks(tasks) {
    console.log(`\n🚀 Running ${tasks.length} tasks sequentially...\n`);
    
    const results = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskName = task.name || `Task-${i + 1}`;
      
      const result = await this.runTask(task.description, taskName);
      results.push(result);
      
      // Add delay between tasks
      if (i < tasks.length - 1) {
        console.log("⏱️ Waiting 2 seconds before next task...\n");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    const report = {
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? (passed / total * 100).toFixed(2) + '%' : '0%'
      },
      results: this.testResults
    };
    
    // Save report to file
    const reportPath = `test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 TEST REPORT:`);
    console.log(`═══════════════`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${report.summary.passRate}`);
    console.log(`📄 Report saved: ${reportPath}\n`);
    
    return report;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

// 🎯 Example usage and task definitions
async function main() {
  const framework = new BrowserTestFramework();
  await framework.initialize();

  // 📋 Define your test cases/tasks here
  const testCases = [
    {
      name: "Login Test",
      description: `Navigate to https://qafromla.herokuapp.com/, 
                   take a screenshot, 
                   click on "Log In" button, 
                   fill email with "papapin888@gmail.com", 
                   fill password with "lalalend", 
                   click "Sign In", 
                   and verify successful login`
    },
    {
      name: "Homepage Navigation",
      description: `Go to https://qafromla.herokuapp.com/, 
                   take a screenshot of the homepage, 
                   find and click on different navigation items, 
                   and document what you find`
    },
    {
      name: "Form Validation Test",
      description: `Navigate to https://qafromla.herokuapp.com/, 
                   click "Log In", 
                   try to submit empty form, 
                   check for validation messages, 
                   then fill with invalid email and check validation`
    }
  ];

  try {
    // Run all test cases
    const results = await framework.runMultipleTasks(testCases);
    
    // Generate comprehensive report
    const report = framework.generateReport();
    
  } catch (error) {
    console.error("Framework error:", error);
  } finally {
    await framework.close();
  }
}

// Export the framework for use in other files
export { BrowserTestFramework };

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
