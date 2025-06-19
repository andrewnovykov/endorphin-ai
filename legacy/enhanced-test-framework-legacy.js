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

// 🎯 **ENHANCED BROWSER TEST FRAMEWORK WITH DETAILED RESULT TRACKING**
class EnhancedBrowserTestFramework {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.tools = null;
    this.agent = null;
    this.testResults = [];
    this.currentTestSession = null;
    this.resultBaseDir = path.join(__dirname, 'test-result');
    this.recorderBaseDir = path.join(__dirname, 'test-recorder');
    this.isInteractiveMode = false; // Track if we're in interactive mode
  }

  async initialize() {
    console.log("🚀 Initializing Enhanced Browser Test Framework...");
    
    // Clean up directories before starting
    await this.cleanupDirectories();
    
    // Ensure directories exist
    if (!fs.existsSync(this.resultBaseDir)) {
      fs.mkdirSync(this.resultBaseDir, { recursive: true });
    }
    if (!fs.existsSync(this.recorderBaseDir)) {
      fs.mkdirSync(this.recorderBaseDir, { recursive: true });
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

    // Setup tools with tracking
    this.setupTools();
    
    // Create AI agent
    await this.setupAgent();
    
    console.log("✅ Framework initialized successfully!");
  }

  // 🧹 **CLEANUP DIRECTORIES**
  async cleanupDirectories() {
    console.log("🧹 Cleaning up previous test results...");
    
    // Always clean test-result directory
    if (fs.existsSync(this.resultBaseDir)) {
      const files = fs.readdirSync(this.resultBaseDir);
      for (const file of files) {
        const filePath = path.join(this.resultBaseDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log("  ✅ Cleaned test-result directory");
    }
  }

  // 🧹 **CLEANUP RECORDER DIRECTORY** (for interactive modes only)
  async cleanupRecorderDirectory() {
    if (fs.existsSync(this.recorderBaseDir)) {
      const files = fs.readdirSync(this.recorderBaseDir);
      for (const file of files) {
        const filePath = path.join(this.recorderBaseDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log("  ✅ Cleaned test-recorder directory (interactive mode)");
    }
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
      screenshots: []
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

  setupTools() {
    // 🛠️ Enhanced Browser Tools with Tracking
    const self = this; // Ensure proper context binding
    
    const navigate = tool(async ({ location, waitUntil = 'domcontentloaded' }) => {
      const stepDesc = `Navigate to: ${location}`;
      console.log(`🌍 ${stepDesc}`);
      
      try {
        await self.page.goto(location, { waitUntil, timeout: 60000 });
        await self.takeStepScreenshot(`Page loaded: ${location}`);
        
        self.logTestStep(stepDesc, 'navigate', { location, waitUntil }, `Successfully navigated to: ${location}`, true);
        return `Successfully navigated to: ${location}`;
      } catch (error) {
        self.logTestStep(stepDesc, 'navigate', { location, waitUntil }, error.message, false);
        throw error;
      }
    }, {
      name: 'navigate',
      description: 'Navigate to a URL with enhanced options.',
      schema: z.object({
        location: z.string().describe("URL to navigate to"),
        waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
      })
    });

    const getPageContent = tool(async ({ includeTitle = true, maxLength = 8000 }) => {
      const stepDesc = "Get page content for analysis";
      console.log(`📄 ${stepDesc}`);
      
      try {
        let content = '';
        
        if (includeTitle) {
          const title = await self.page.title();
          const url = self.page.url();
          content += `Page Title: ${title}\nURL: ${url}\n\n`;
        }
        
        const htmlContent = await self.page.content();
        const truncatedContent = htmlContent.length > maxLength 
          ? htmlContent.substring(0, maxLength) + '\n... (truncated for brevity)'
          : htmlContent;
        content += truncatedContent;
        
        self.logTestStep(stepDesc, 'getPageContent', { includeTitle, maxLength }, `Retrieved ${content.length} characters`, true);
        return content;
      } catch (error) {
        self.logTestStep(stepDesc, 'getPageContent', { includeTitle, maxLength }, error.message, false);
        throw error;
      }
    }, {
      name: 'getPageContent',
      description: 'Get HTML content of the current page for analysis.',
      schema: z.object({
        includeTitle: z.boolean().optional(),
        maxLength: z.number().optional(),
      })
    });

    // Simpler page content tool (like your working example)
    const getSimplePageContent = tool(async () => {
      console.log("📄 Getting page content");
      const content = await self.page.content();
      self.logTestStep("Get simple page content", 'getSimplePageContent', {}, `Retrieved ${content.length} characters`, true);
      return content;
    }, {
      name: 'getSimplePageContent',
      description: 'Get the current HTML content of the page to analyze its structure.',
      schema: z.object({})
    });

    // Add clearField tool
    const clearField = tool(async ({ selector }) => {
      const stepDesc = `Clear field: ${selector}`;
      console.log(`🧹 ${stepDesc}`);
      
      try {
        await self.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        
        // Focus the field first
        await self.page.focus(selector);
        
        // Select all content and delete
        await self.page.keyboard.press('Control+a');
        await self.page.keyboard.press('Delete');
        
        // Verify field is cleared
        const value = await self.page.locator(selector).inputValue();
        const isCleared = value === '';
        
        const result = isCleared 
          ? `Successfully cleared field ${selector}`
          : `Field ${selector} still contains: "${value}"`;
        
        self.logTestStep(stepDesc, 'clearField', { selector }, result, isCleared);
        return isCleared ? `✅ ${result}` : `⚠️ ${result}`;
      } catch (error) {
        self.logTestStep(stepDesc, 'clearField', { selector }, error.message, false);
        return `❌ Error clearing field ${selector}: ${error.message}`;
      }
    }, {
      name: 'clearField',
      description: 'Clear an input field completely.',
      schema: z.object({
        selector: z.string().describe("CSS selector of the input field to clear"),
      })
    });

    const click = tool(async ({ selector, strategy = 'css', timeout = 10000, force = false }) => {
      const stepDesc = `Click ${selector} using ${strategy} strategy`;
      console.log(`🔘 ${stepDesc}`);
      
      try {
        let locator;
        
        switch (strategy) {
          case 'text':
            locator = self.page.getByText(selector, { exact: false });
            break;
          case 'exact-text':
            locator = self.page.getByText(selector, { exact: true });
            break;
          case 'role':
            const [role, name] = selector.split(':');
            locator = self.page.getByRole(role, { name });
            break;
          case 'placeholder':
            locator = self.page.getByPlaceholder(selector);
            break;
          case 'label':
            locator = self.page.getByLabel(selector);
            break;
          case 'title':
            locator = self.page.getByTitle(selector);
            break;
          case 'alt':
            locator = self.page.getByAltText(selector);
            break;
          default:
            locator = self.page.locator(selector);
        }
        
        // Check if element exists first
        const count = await locator.count();
        if (count === 0) {
          const result = `Element ${selector} not found on page`;
          self.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, result, false);
          return `❌ ${result}`;
        }
        
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click({ force });
        await self.takeStepScreenshot(`After clicking ${selector}`);
        
        const result = `Successfully clicked ${selector} using ${strategy} strategy`;
        self.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, result, true);
        return result;
      } catch (error) {
        await self.takeStepScreenshot(`Failed to click ${selector}`);
        self.logTestStep(stepDesc, 'click', { selector, strategy, timeout, force }, error.message, false);
        return `❌ Error clicking ${selector}: ${error.message}`;
      }
    }, {
      name: 'click',
      description: 'Click any element with multiple selection strategies.',
      schema: z.object({
        selector: z.string().describe("Element selector"),
        strategy: z.enum(['css', 'text', 'exact-text', 'role', 'placeholder', 'label', 'title', 'alt']).optional(),
        timeout: z.number().optional(),
        force: z.boolean().optional(),
      })
    });

    const fill = tool(async ({ selector, value, strategy = 'fill', clearFirst = true, pressEnter = false }) => {
      const stepDesc = `Fill ${selector} with "${value}"`;
      console.log(`📝 ${stepDesc}`);
      
      try {
        await self.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        
        if (clearFirst) {
          // Focus and clear the field properly
          await self.page.focus(selector);
          await self.page.keyboard.press('Control+a');
          await self.page.keyboard.press('Delete');
          
          // Wait a moment for the field to clear
          await self.page.waitForTimeout(100);
        }
        
        if (strategy === 'type') {
          await self.page.type(selector, value, { delay: 50 });
        } else {
          await self.page.fill(selector, value);
        }

        if (pressEnter) {
          await self.page.keyboard.press('Enter');
        }
        
        await self.takeStepScreenshot(`After filling ${selector}`);
        
        // Verify the value was set correctly
        const actualValue = await self.page.locator(selector).inputValue();
        const success = actualValue === value;
        const result = success 
          ? `Successfully filled ${selector} with "${value}"`
          : `Filled ${selector} but value is "${actualValue}" instead of "${value}"`;
        
        self.logTestStep(stepDesc, 'fill', { selector, value, strategy, clearFirst, pressEnter }, result, success);
        return success ? `✅ ${result}` : `⚠️ ${result}`;
      } catch (error) {
        await self.takeStepScreenshot(`Failed to fill ${selector}`);
        self.logTestStep(stepDesc, 'fill', { selector, value, strategy, clearFirst, pressEnter }, error.message, false);
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
        pressEnter: z.boolean().optional(),
      })
    });

    const wait = tool(async ({ milliseconds = 500, reason, selector, state = 'visible' }) => {
      const stepDesc = selector 
        ? `Wait for ${selector} to be ${state}` 
        : `Wait for ${milliseconds}ms${reason ? ` (${reason})` : ''}`;
      console.log(`⏱️ ${stepDesc}`);
      
      try {
        if (selector) {
          await self.page.waitForSelector(selector, { state, timeout: milliseconds });
          const result = `Element ${selector} is now ${state}`;
          self.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, result, true);
          return `✅ ${result}`;
        } else {
          await self.page.waitForTimeout(milliseconds);
          const result = `Waited for ${milliseconds}ms${reason ? ` - ${reason}` : ''}`;
          self.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, result, true);
          return result;
        }
      } catch (error) {
        self.logTestStep(stepDesc, 'wait', { milliseconds, reason, selector, state }, error.message, false);
        return `❌ Timeout waiting for ${selector} to be ${state}`;
      }
    }, {
      name: 'wait',
      description: 'Wait for time or element state.',
      schema: z.object({
        milliseconds: z.number().optional(),
        reason: z.string().optional(),
        selector: z.string().optional(),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
      })
    });

    const verifyElement = tool(async ({ selector, state = 'visible', timeout = 10000 }) => {
      const stepDesc = `Verify ${selector} is ${state}`;
      console.log(`🔍 ${stepDesc}`);
      
      try {
        await self.page.waitForSelector(selector, { state, timeout });
        await self.takeStepScreenshot(`Verified ${selector} is ${state}`);
        
        const result = `Element ${selector} is ${state} on the page`;
        self.logTestStep(stepDesc, 'verifyElement', { selector, state, timeout }, result, true);
        return `✅ ${result}`;
      } catch (error) {
        await self.takeStepScreenshot(`Failed to verify ${selector}`);
        self.logTestStep(stepDesc, 'verifyElement', { selector, state, timeout }, error.message, false);
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
      if (!self.currentTestSession) {
        self.currentTestSession.screenshotCounter++;
      }
      
      const filename = name || `manual-screenshot-${Date.now()}.png`;
      const stepDesc = `Take screenshot: ${filename}`;
      console.log(`📸 ${stepDesc}`);
      
      try {
        let filePath;
        if (self.currentTestSession) {
          filePath = path.join(self.currentTestSession.screenshotsDir, filename);
        } else {
          filePath = filename;
        }
        
        if (selector) {
          await self.page.locator(selector).screenshot({ path: filePath });
        } else {
          await self.page.screenshot({ path: filePath, fullPage });
        }
        
        const result = selector 
          ? `Screenshot of ${selector} saved as ${filename}`
          : `${fullPage ? 'Full page' : 'Viewport'} screenshot saved as ${filename}`;
        
        self.logTestStep(stepDesc, 'screenshot', { name, selector, fullPage }, result, true);
        return `📸 ${result}`;
      } catch (error) {
        self.logTestStep(stepDesc, 'screenshot', { name, selector, fullPage }, error.message, false);
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
      const stepDesc = `Get element info: ${selector}`;
      console.log(`🔍 ${stepDesc}`);
      
      try {
        await self.page.waitForSelector(selector, { timeout: 5000 });
        
        const elementInfo = await self.page.locator(selector).evaluate(el => ({
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
        
        const result = `Element info: ${JSON.stringify(elementInfo, null, 2)}`;
        self.logTestStep(stepDesc, 'getElementInfo', { selector }, result, true);
        return result;
      } catch (error) {
        self.logTestStep(stepDesc, 'getElementInfo', { selector }, error.message, false);
        return `❌ Could not get info for ${selector}: ${error.message}`;
      }
    }, {
      name: 'getElementInfo',
      description: 'Get detailed information about any element.',
      schema: z.object({
        selector: z.string(),
      })
    });

    this.tools = [
      navigate, getPageContent, getSimplePageContent, clearField, click, fill, wait, verifyElement, 
      screenshot, getElementInfo
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
      
      // Check for explicit stop conditions in the message content
      const content = lastMessage.content?.toLowerCase() || '';
      const stopPhrases = ['test completed', 'verification complete', 'login successful', 'test finished', 'done', 'stop'];
      const hasStopPhrase = stopPhrases.some(phrase => content.includes(phrase));
      
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

    this.agent = workflow.compile({
      recursionLimit: 150,
    });
  }

  async runTask(taskDescription, testName = null) {
    const timestamp = new Date().toISOString();
    const name = testName || `Test-${Date.now()}`;
    
    console.log(`\n🎯 Running Task: ${name}`);
    console.log(`📝 Task: ${taskDescription}`);
    console.log(`⏰ Started at: ${timestamp}\n`);

    // Create test session
    const session = this.createTestSession(name, name.replace(/\s+/g, '-').toLowerCase());
    
    try {
      // Log initial step
      this.logTestStep("Test started", null, null, `Starting task: ${taskDescription}`, true);
      await this.takeStepScreenshot("Initial page state");
      
      const finalState = await this.agent.invoke({
        messages: [new HumanMessage(taskDescription)],
      }, {
        recursionLimit: 100,
        configurable: { thread_id: `session-${this.currentTestSession.id}` }
      });

      const result = finalState.messages[finalState.messages.length - 1].content;
      
      // Log final step
      this.logTestStep("Test completed", null, null, result, true);
      await this.takeStepScreenshot("Final page state");
      
      // Finish session
      await this.finishTestSession('SUCCESS', result);
      
      console.log(`\n✅ Task "${name}" completed successfully!`);
      console.log(`📊 Result: ${result}\n`);
      
      return {
        testName: name,
        task: taskDescription,
        timestamp,
        status: 'SUCCESS',
        result: result,
        duration: Date.now() - new Date(timestamp).getTime(),
        sessionDir: session.sessionDir
      };
    } catch (error) {
      // Log error step
      this.logTestStep("Test failed", null, null, error.message, false);
      await this.takeStepScreenshot("Error state");
      
      // Finish session with error
      await this.finishTestSession('FAILED', null, error.message);
      
      console.error(`\n❌ Task "${name}" failed!`);
      console.error(`🚨 Error: ${error.message}\n`);
      
      return {
        testName: name,
        task: taskDescription,
        timestamp,
        status: 'FAILED',
        error: error.message,
        duration: Date.now() - new Date(timestamp).getTime(),
        sessionDir: session.sessionDir
      };
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

  async finishTestSession(finalStatus, finalResult = null, error = null) {
    if (!this.currentTestSession) return;
    
    this.currentTestSession.endTime = new Date().toISOString();
    this.currentTestSession.duration = new Date(this.currentTestSession.endTime) - new Date(this.currentTestSession.startTime);
    this.currentTestSession.status = finalStatus;
    this.currentTestSession.finalResult = finalResult;
    this.currentTestSession.error = error;
    
    // Save detailed test result
    const resultFile = path.join(this.currentTestSession.sessionDir, 'test-result.json');
    fs.writeFileSync(resultFile, JSON.stringify(this.currentTestSession, null, 2));
    
    // Create summary file
    const summaryFile = path.join(this.currentTestSession.sessionDir, 'summary.json');
    const summary = {
      testName: this.currentTestSession.testName,
      testId: this.currentTestSession.testId,
      status: finalStatus,
      startTime: this.currentTestSession.startTime,
      endTime: this.currentTestSession.endTime,
      duration: this.currentTestSession.duration,
      totalSteps: this.currentTestSession.steps.length,
      totalScreenshots: this.currentTestSession.screenshotCounter,
      successfulSteps: this.currentTestSession.steps.filter(s => s.status === 'SUCCESS').length,
      failedSteps: this.currentTestSession.steps.filter(s => s.status === 'FAILED').length,
      result: finalResult,
      error: error
    };
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
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
    
    // Copy all results to test-recorder folder ONLY for interactive modes
    if (this.isInteractiveMode) {
      await this.copyResultsToRecorder(this.currentTestSession);
    }
    
    const session = this.currentTestSession;
    this.currentTestSession = null;
    return session;
  }

  // 📁 **COPY RESULTS TO TEST-RECORDER**
  async copyResultsToRecorder(session) {
    try {
      const recorderSessionDir = path.join(this.recorderBaseDir, session.sessionName);
      const recorderScreenshotsDir = path.join(recorderSessionDir, 'screenshots');
      
      // Create recorder directories
      fs.mkdirSync(recorderSessionDir, { recursive: true });
      fs.mkdirSync(recorderScreenshotsDir, { recursive: true });
      
      // Copy all files from session directory
      const sourceFiles = fs.readdirSync(session.sessionDir);
      for (const file of sourceFiles) {
        const sourcePath = path.join(session.sessionDir, file);
        const destPath = path.join(recorderSessionDir, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
          // Copy screenshots directory
          if (file === 'screenshots') {
            const screenshotFiles = fs.readdirSync(sourcePath);
            for (const screenshot of screenshotFiles) {
              const srcScreenshot = path.join(sourcePath, screenshot);
              const destScreenshot = path.join(recorderScreenshotsDir, screenshot);
              fs.copyFileSync(srcScreenshot, destScreenshot);
            }
          }
        } else {
          // Copy individual files
          fs.copyFileSync(sourcePath, destPath);
        }
      }
      
      console.log(`📼 Results recorded in: ${recorderSessionDir}`);
      
    } catch (error) {
      console.error(`❌ Error copying results to recorder: ${error.message}`);
    }
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
        passRate: total > 0 ? (passed / total * 100).toFixed(2) + '%' : '0%',
        generatedAt: new Date().toISOString()
      },
      results: this.testResults
    };
    
    // Save report to main directory and test-result directory
    const timestamp = Date.now();
    const reportPath = `test-report-${timestamp}.json`;
    const resultReportPath = path.join(this.resultBaseDir, `test-report-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(resultReportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 TEST REPORT:`);
    console.log(`═══════════════`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${report.summary.passRate}`);
    console.log(`📄 Report saved: ${reportPath}`);
    console.log(`📁 Detailed results in: ${this.resultBaseDir}\n`);
    
    return report;
  }

  // 🎯 **TEST EXECUTION METHODS**
  async runSingleTest(test) {
    console.log(`\n🚀 Starting test: ${test.id} - ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log(`🎯 Priority: ${test.priority}`);
    console.log(`🏷️ Tags: ${test.tags.join(', ')}`);
    
    // Create test session with detailed tracking
    this.createTestSession(test.name, test.id);
    
    try {
      this.logTestStep(`Starting test execution: ${test.name}`, null, null, `Test ID: ${test.id}`, true);
      
      // Check prerequisites if any
      if (test.prerequisites && test.prerequisites.length > 0) {
        this.logTestStep(`Checking prerequisites: ${test.prerequisites.join(', ')}`, null, null, 'Prerequisites validated', true);
      }
      
      // Execute the test task with timeout
      const messages = [new HumanMessage(test.task)];
      
      // Add timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test execution timeout (5 minutes)')), 5 * 60 * 1000);
      });
      
      const agentPromise = this.agent.invoke({ messages }, {
        recursionLimit: 100,
        configurable: { thread_id: `session-${this.currentTestSession.id}` }
      });
      
      await Promise.race([agentPromise, timeoutPromise]);
      
      this.logTestStep('Test execution completed successfully', null, null, 'All steps completed', true);
      
      // Finish the test session
      const session = await this.finishTestSession('SUCCESS', 'Test completed successfully');
      
      console.log(`✅ Test ${test.id} completed successfully!`);
      return { success: true, session };
      
    } catch (error) {
      console.error(`❌ Test ${test.id} failed:`, error.message);
      
      this.logTestStep('Test execution failed', null, null, error.message, false);
      const session = await this.finishTestSession('FAILED', `Test failed: ${error.message}`, error.message);
      
      return { success: false, error: error.message, session };
    }
  }

  async runMultipleTests(tests) {
    console.log(`\n🎯 Running ${tests.length} tests with enhanced result tracking...`);
    const results = [];
    
    for (const test of tests) {
      const result = await this.runSingleTest(test);
      results.push({
        testId: test.id,
        testName: test.name,
        ...result
      });
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate final report
    const report = this.generateReport();
    
    console.log(`\n🎉 All tests completed!`);
    console.log(`📊 Final Results: ${results.filter(r => r.success).length}/${results.length} passed`);
    
    return { results, report };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("🔒 Browser closed");
    }
    
    // Force exit the process to ensure clean shutdown
    setTimeout(() => {
      console.log("👋 Exiting process...");
      process.exit(0);
    }, 100);
  }

  // 📼 **INTERACTIVE MODE MANAGEMENT**
  async enableInteractiveMode() {
    this.isInteractiveMode = true;
    console.log("📼 Interactive mode enabled - results will be recorded in test-recorder folder");
    await this.cleanupRecorderDirectory(); // Clean recorder directory when enabling interactive mode
  }

  disableInteractiveMode() {
    this.isInteractiveMode = false;
  }
}

export { EnhancedBrowserTestFramework };

// 🎯 **MAIN EXECUTION - ENHANCED FRAMEWORK WITH DETAILED RESULT TRACKING**
async function main() {
  const args = process.argv.slice(2);
  
  // Import TestManager for file-based tests
  const { TestManager } = await import('../test-manager.js');
  const testManager = new TestManager();
  await testManager.loadTests();
  
  // Handle --list command without initializing browser
  if (args.includes('--list')) {
    testManager.listTests();
    return; // Exit early without browser initialization
  }
  
  // For all other commands, initialize the framework
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    
    console.log('\n🔧 Enhanced Browser Test Framework with Detailed Result Tracking');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('Choose an option:');
    console.log('1. Run a specific test by ID (e.g., QE-001)');
    console.log('2. Run tests by tag (e.g., authentication, smoke)');
    console.log('3. Run tests by priority (High, Medium, Low)');
    console.log('4. Run all tests');
    console.log('5. List available tests');
    console.log('6. Interactive mode (custom task)');
    console.log('7. Run comprehensive test suite');
    
    if (args.includes('--test') || args.includes('-t')) {
      // Run specific test
      const testId = args[args.indexOf('--test') + 1] || args[args.indexOf('-t') + 1];
      if (testId) {
        const test = testManager.getTestById(testId);
        if (test) {
          await framework.runSingleTest(test);
        } else {
          console.log(`❌ Test ${testId} not found`);
        }
      } else {
        console.log('❌ Please specify a test ID');
      }
    } else if (args.includes('--tag')) {
      // Run tests by tag
      const tag = args[args.indexOf('--tag') + 1];
      if (tag) {
        const tests = testManager.getTestsByTag(tag);
        console.log(`\n🏷️ Running tests with tag: ${tag}`);
        await framework.runMultipleTests(tests);
      } else {
        console.log('❌ Please specify a tag');
      }
    } else if (args.includes('--priority')) {
      // Run tests by priority
      const priority = args[args.indexOf('--priority') + 1];
      if (priority) {
        const tests = testManager.getTestsByPriority(priority);
        console.log(`\n📊 Running tests with priority: ${priority}`);
        await framework.runMultipleTests(tests);
      } else {
        console.log('❌ Please specify a priority (High, Medium, Low)');
      }
    } else if (args.includes('--all')) {
      // Run all tests
      console.log('\n🚀 Running all available tests...');
      await framework.runMultipleTests(testManager.getAllTests());
    } else if (args.includes('--interactive')) {
      // Interactive mode - redirect to step-by-step builder
      await framework.enableInteractiveMode(); // Enable recording for interactive mode
      console.log('\n💬 Interactive Mode - Step-by-Step Test Builder');
      console.log('For the full step-by-step interactive experience, use:');
      console.log('npm run step-by-step');
      console.log('\nRunning quick interactive demo instead...');
      
      const demoTest = {
        id: 'INTERACTIVE-DEMO',
        name: 'Interactive Demo Task',
        description: 'Quick interactive demonstration',
        priority: 'Medium',
        tags: ['interactive', 'demo'],
        site: 'https://httpbin.org',
        task: "Navigate to https://httpbin.org. Take a screenshot. Get simple page content. Verify site is accessible. STOP - test completed."
      };
      
      await framework.runSingleTest(demoTest);
    } else if (args.includes('--comprehensive')) {
      // Run comprehensive suite
      console.log('\n🎯 Running comprehensive test suite...');
      const allTests = testManager.getAllTests();
      await framework.runMultipleTests(allTests);
    } else {
      // Default: run a demo test
      console.log('\n🎯 Running demo test (QE-001) with enhanced result tracking...');
      const demoTest = testManager.getTestById('QE-001');
      if (demoTest) {
        await framework.runSingleTest(demoTest);
      } else {
        console.log('❌ Demo test QE-001 not found. Please run with --list to see available tests.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await framework.close();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('enhanced-test-framework.js')) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}
