// Endorphin e2e AI test framework>
// Copyright (C)  2025 Redstudio Agency

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.




import { chromium, firefox, webkit } from "playwright";
import { HumanMessage } from "@langchain/core/messages";
import fs, { existsSync, readdirSync, statSync, rmSync, mkdirSync } from 'fs';
import path from 'path';
import { BROWSER_CONFIG } from '../config/browser-config.js';
import { AGENT_CONFIG } from '../config/agent-config.js';
import { PATHS } from '../config/paths.js';
import { createTestSession, saveTestSession } from './test-session.js';
import { setupAgent } from './agent-setup.js';
import { createAllTools } from '../tools/index.js';

/**
 * Enhanced Browser Test Framework - Core Framework Class
 * Handles browser lifecycle, tool setup, and test session management
 */
export class EnhancedBrowserTestFramework {
  constructor(config = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.tools = null;
    this.agent = null;
    this.testResults = [];
    this.currentTestSession = null;
    // Will be set after config is processed
    this.resultBaseDir = null;
    // Use current working directory (user project) for test-recorder, not framework root
    this.recorderBaseDir = path.join(process.cwd(), 'test-recorder');
    this.isInteractiveMode = false;
    
    // Initialize configuration with defaults - deep merge to prevent issues
    const defaultConfig = {
      browser: {
        type: 'chromium',
        headless: true,
        viewport: {
          width: 1280,
          height: 720
        }
      },
      ai: {
        temperature: 0.1,
        maxTokens: 8000
      },
      execution: {
        timeout: 30000,
        parallel: false,
        retries: 0
      }
    };

    // Deep merge: defaults first, then user config for nested objects
    this.config = {
      ...defaultConfig,
      ...config,
      browser: {
        ...defaultConfig.browser,
        ...(config.browser || {})
      },
      ai: {
        ...defaultConfig.ai,
        ...(config.ai || {})
      },
      execution: {
        ...defaultConfig.execution,
        ...(config.execution || {})
      }
    };

    // Set result directory based on configuration
    // Use configured results directory or default to 'test-results' in current working directory
    const resultsDir = this.config.results?.directory || './test-results';
    this.resultBaseDir = path.resolve(process.cwd(), resultsDir);
    
    // Debug logging
    console.log(`🔧 Results config:`, this.config.results);
    console.log(`📁 Resolved results directory: ${this.resultBaseDir}`);
  }

  getBrowserType() {
    switch (this.config.browser.type) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
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
    
    // Launch browser using config
    const browserType = this.getBrowserType();
    const launchOptions = {
      headless: this.config.browser.headless,
      args: ['--start-maximized']
    };
    const contextOptions = {
      viewport: this.config.browser.viewport
    };
    
    this.browser = await browserType.launch(launchOptions);
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup tools with tracking
    this.setupTools();
    
    // Create AI agent
    await this.setupAgent();
    
    console.log("✅ Framework initialized successfully!");
  }

  setupTools() {
    console.log("🛠️ Setting up browser automation tools...");
    
    // Create tools for the AI agent
    this.toolsArray = createAllTools(this);
    
    // Create direct tool access object for framework use
    this.tools = {
      navigate: async (params) => {
        const stepDesc = `Navigate to: ${params.url}`;
        console.log(`🌍 ${stepDesc}`);
        
        try {
          await this.page.goto(params.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await this.takeStepScreenshot(`Page loaded: ${params.url}`);
          
          this.logTestStep(stepDesc, 'navigate', params, `Successfully navigated to: ${params.url}`, true);
          return `Successfully navigated to: ${params.url}`;
        } catch (error) {
          this.logTestStep(stepDesc, 'navigate', params, error.message, false);
          throw error;
        }
      },
      
      click: async (params) => {
        const stepDesc = `Click element: ${params.selector}`;
        console.log(`👆 ${stepDesc}`);
        
        try {
          await this.page.locator(params.selector).click();
          await this.takeStepScreenshot(`Clicked: ${params.selector}`);
          
          this.logTestStep(stepDesc, 'click', params, `Successfully clicked: ${params.selector}`, true);
          return `Successfully clicked: ${params.selector}`;
        } catch (error) {
          this.logTestStep(stepDesc, 'click', params, error.message, false);
          throw error;
        }
      },
      
      fill: async (params) => {
        const stepDesc = `Fill field: ${params.selector} with "${params.text}"`;
        console.log(`✏️ ${stepDesc}`);
        
        try {
          await this.page.locator(params.selector).fill(params.text);
          await this.takeStepScreenshot(`Filled: ${params.selector}`);
          
          this.logTestStep(stepDesc, 'fill', params, `Successfully filled: ${params.selector}`, true);
          return `Successfully filled: ${params.selector}`;
        } catch (error) {
          this.logTestStep(stepDesc, 'fill', params, error.message, false);
          throw error;
        }
      },
      
      screenshot: async (params = {}) => {
        const filename = params.filename || `screenshot-${Date.now()}.png`;
        await this.takeStepScreenshot(filename);
        return `Screenshot saved: ${filename}`;
      }
    };
  }

  async setupAgent() {
    console.log("🤖 Setting up AI agent...");
    this.agent = await setupAgent(this.toolsArray);
  }

  // Directory cleanup methods
  async cleanupDirectories() {
    // Skip cleanup in test environment
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      console.log("🧹 Skipping cleanup in test environment");
      return;
    }
    
    console.log("🧹 Cleaning up previous test results...");
    
    if (existsSync(this.resultBaseDir)) {
      const files = readdirSync(this.resultBaseDir);
      for (const file of files) {
        const filePath = path.join(this.resultBaseDir, file);
        if (statSync(filePath).isDirectory()) {
          rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log("  ✅ Cleaned test-result directory");
    }
  }

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

  // Test session management
  createTestSession(testName, testId = null) {
    const session = createTestSession(testName, testId, this.resultBaseDir);
    this.currentTestSession = session;
    return session;
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
        toolName,
        toolArgs,
        result,
        timestamp: new Date().toISOString(),
        status: isSuccess ? 'SUCCESS' : 'FAILED'
      });
    }
    
    console.log(`📝 Step ${this.currentTestSession.stepCounter}: ${stepDescription} - ${isSuccess ? '✅' : '❌'}`);
  }

  async takeStepScreenshot(description = null) {
    if (!this.currentTestSession) return;
    
    this.currentTestSession.screenshotCounter++;
    const filename = `step-${this.currentTestSession.stepCounter || 0}-screenshot-${this.currentTestSession.screenshotCounter}.png`;
    const filepath = path.join(this.currentTestSession.screenshotsDir, filename);
    
    try {
      await this.page.screenshot({ 
        path: filepath, 
        fullPage: false,
        type: 'png'
      });
      
      const screenshot = {
        filename,
        filepath,
        timestamp: new Date().toISOString(),
        description: description || `Step ${this.currentTestSession.stepCounter} screenshot`,
        stepNumber: this.currentTestSession.stepCounter
      };
      
      // Add to current step if exists
      if (this.currentTestSession.steps.length > 0) {
        const currentStep = this.currentTestSession.steps[this.currentTestSession.steps.length - 1];
        currentStep.screenshots.push(screenshot);
      }
      
      console.log(`📸 Screenshot taken: ${filename}`);
      return filepath;
    } catch (error) {
      console.error(`❌ Failed to take screenshot: ${error.message}`);
      return null;
    }
  }

  async finishTestSession(status = 'SUCCESS', finalResult = null) {
    if (!this.currentTestSession) return;
    
    this.currentTestSession.endTime = new Date().toISOString();
    this.currentTestSession.status = status;
    this.currentTestSession.finalResult = finalResult;
    this.currentTestSession.duration = new Date(this.currentTestSession.endTime) - new Date(this.currentTestSession.startTime);
    
    // Save session data
    const summary = saveTestSession(this.currentTestSession);
    
    this.testResults.push(summary);
    
    console.log(`📊 Test session completed: ${status}`);
    console.log(`📁 Results saved to: ${this.currentTestSession.sessionDir}`);
    
    // Copy all results to test-recorder folder ONLY for interactive modes
    if (this.isInteractiveMode) {
      await this.copyResultsToRecorder(this.currentTestSession);
    }
    
    const session = this.currentTestSession;
    this.currentTestSession = null;
    return summary;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log("🧹 Browser closed successfully");
    }
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
      
      // Create enhanced context message for the agent
      const systemContext = `You are a browser automation agent with access to the following tools:
- navigate: Navigate to any URL
- click: Click elements using various selection strategies (CSS, text, role, etc.)
- fill: Fill input fields with text
- wait: Wait for elements or time delays
- verifyElement: Check if elements exist on the page
- getPageContent: Get page content for analysis
- screenshot: Take screenshots
- getElementInfo: Get information about specific elements

IMPORTANT INSTRUCTIONS:
1. You are currently controlling a browser that may already have a page loaded
2. When asked to click a button with text like "Log In", use: click with selector="Log In" and strategy="text"
3. For email fields, use: fill with selector="input[type='email']" or "input[name*='email']"
4. For password fields, use: fill with selector="input[type='password']" or "input[name*='password']"
5. Take screenshots between major actions to document the process
6. If an element is not found with one selector, try alternative selectors
7. Complete the task step by step without asking for additional information
8. NEVER ask for URLs or page information - just use the tools directly

EXAMPLE:
To click "Log In" button: {"selector": "Log In", "strategy": "text"}
To fill email: {"selector": "input[type='email']", "value": "user@example.com"}
To fill password: {"selector": "input[type='password']", "value": "password123"}

Current Task: ${taskDescription}`;

      const finalState = await this.agent.invoke({
        messages: [new HumanMessage(systemContext)],
      }, {
        recursionLimit: AGENT_CONFIG.agent.recursionLimit,
        configurable: { thread_id: `session-${this.currentTestSession.sessionId}` }
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
      console.error(`\n❌ Task "${name}" failed:`);
      console.error(`💥 Error: ${error.message}\n`);
      
      // Log error step
      this.logTestStep("Test failed", null, null, error.message, false);
      await this.takeStepScreenshot("Error state");
      
      // Finish session with failure
      await this.finishTestSession('FAILED', error.message);
      
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
        await new Promise(resolve => setTimeout(resolve, AGENT_CONFIG.execution.stepDelay));
      }
    }
    
    return results;
  }

  async runSingleTest(test) {
    // Only show detailed logs if not using console reporter (for backwards compatibility)
    const useDetailedLogs = !process.env.ENDORPHIN_CONSOLE_REPORTER;
    
    if (useDetailedLogs) {
      console.log(`\n🚀 Starting test: ${test.id} - ${test.name}`);
      console.log(`📝 Description: ${test.description}`);
      console.log(`🎯 Priority: ${test.priority}`);
      console.log(`🏷️ Tags: ${test.tags ? test.tags.join(', ') : 'None'}`);
    }
    
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
        setTimeout(() => reject(new Error('Test execution timeout (5 minutes)')), AGENT_CONFIG.agent.timeout);
      });
      
      const agentPromise = this.agent.invoke({ messages }, {
        recursionLimit: AGENT_CONFIG.agent.recursionLimit,
        configurable: { thread_id: `session-${this.currentTestSession.sessionId}` }
      });
      
      await Promise.race([agentPromise, timeoutPromise]);
      
      this.logTestStep('Test execution completed successfully', null, null, 'All steps completed', true);
      
      // Finish the test session
      const session = await this.finishTestSession('SUCCESS', 'Test completed successfully');
      
      if (useDetailedLogs) {
        console.log(`✅ Test ${test.id} completed successfully!`);
      }
      return { success: true, session };
      
    } catch (error) {
      if (useDetailedLogs) {
        console.error(`❌ Test ${test.id} failed:`, error.message);
      }
      
      this.logTestStep('Test execution failed', null, null, error.message, false);
      const session = await this.finishTestSession('FAILED', error.message);
      
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
      await new Promise(resolve => setTimeout(resolve, AGENT_CONFIG.execution.stepDelay));
    }
    
    // Generate final report
    const report = this.generateReport();
    
    console.log(`\n🎉 All tests completed!`);
    console.log(`📊 Final Results: ${results.filter(r => r.success).length}/${results.length} passed`);
    
    return { results, report };
  }

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

  async enableInteractiveMode() {
    this.isInteractiveMode = true;
    console.log("📼 Interactive mode enabled - results will be recorded in test-recorder folder");
    await this.cleanupRecorderDirectory();
  }

  disableInteractiveMode() {
    this.isInteractiveMode = false;
  }

  // Natural Language Command Execution Methods
  async executeNaturalLanguageCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    // Parse common commands
    if (lowerCommand.includes('click')) {
      // Extract selector or button text
      const selector = this.extractSelectorFromCommand(command);
      const result = await this.tools.click({ selector });
      return { toolUsed: 'click', params: { selector }, result };
    }
    
    if (lowerCommand.includes('fill') || lowerCommand.includes('type')) {
      // Extract field and value
      const { selector, value } = this.extractFillFromCommand(command);
      const result = await this.tools.fill({ selector, value });
      return { toolUsed: 'fill', params: { selector, value }, result };
    }
    
    if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
      // Extract URL
      const url = this.extractUrlFromCommand(command);
      const result = await this.tools.navigate({ url });
      return { toolUsed: 'navigate', params: { url }, result };
    }
    
    if (lowerCommand.includes('wait')) {
      // Extract time
      const time = this.extractTimeFromCommand(command) || 2000;
      await this.page.waitForTimeout(time);
      return { toolUsed: 'wait', params: { time }, result: `Waited ${time}ms` };
    }
    
    if (lowerCommand.includes('screenshot')) {
      const result = await this.tools.screenshot({});
      return { toolUsed: 'screenshot', params: {}, result };
    }
    
    // Default: try to use AI agent to interpret the command
    try {
      const result = await this.runTask(command);
      return { toolUsed: 'ai-agent', params: { command }, result };
    } catch (error) {
      throw new Error(`Could not interpret command: "${command}". ${error.message}`);
    }
  }
  
  // Helper methods for parsing commands
  extractSelectorFromCommand(command) {
    // Try to extract button text, link text, or selector
    const buttonMatch = command.match(/(?:click|press)\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+button|\s+link|$)/i);
    if (buttonMatch) {
      const text = buttonMatch[1].trim();
      // Return as text selector for buttons/links
      return text;
    }
    
    // Try to extract by common UI element names
    if (command.includes('login')) return 'login';
    if (command.includes('submit')) return 'submit';
    if (command.includes('sign up')) return 'sign up';
    if (command.includes('register')) return 'register';
    
    // Default to a generic button selector
    return 'button';
  }
  
  extractFillFromCommand(command) {
    // Try to extract field and value
    const fillMatch = command.match(/(?:fill|type|enter)\s+(.+?)\s+(?:with|as)\s+(.+)/i);
    if (fillMatch) {
      return {
        selector: fillMatch[1].trim(),
        value: fillMatch[2].trim()
      };
    }
    
    // Try common field patterns
    if (command.includes('email')) {
      const emailMatch = command.match(/email\s+(?:with\s+)?(.+)/i);
      return {
        selector: 'input[type="email"], input[name*="email"], #email',
        value: emailMatch ? emailMatch[1].trim() : ''
      };
    }
    
    if (command.includes('password')) {
      const passMatch = command.match(/password\s+(?:with\s+)?(.+)/i);
      return {
        selector: 'input[type="password"], input[name*="password"], #password',
        value: passMatch ? passMatch[1].trim() : ''
      };
    }
    
    return { selector: 'input', value: '' };
  }
  
  extractUrlFromCommand(command) {
    const urlMatch = command.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) return urlMatch[1];
    
    // Default to base URL if no URL found
    return process.env.BASE_URL || 'https://qafromla.herokuapp.com/';
  }
  
  extractTimeFromCommand(command) {
    const timeMatch = command.match(/(\d+)\s*(?:ms|milliseconds?|seconds?|s)/i);
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[0].toLowerCase();
      if (unit.includes('s') && !unit.includes('ms')) {
        return num * 1000; // Convert seconds to milliseconds
      }
      return num;
    }
    return 2000; // Default 2 seconds
  }

  /**
   * Set interactive mode for the framework
   * @param {boolean} interactive - Whether to enable interactive mode
   */
  setInteractiveMode(interactive) {
    this.isInteractiveMode = interactive;
  }
}
