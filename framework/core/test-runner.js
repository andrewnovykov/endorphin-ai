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



import { HumanMessage } from "@langchain/core/messages";
import { AGENT_CONFIG } from '../config/agent-config.js';

/**
 * Run a test task using the AI agent
 * @param {Object} framework - Framework instance
 * @param {string} taskDescription - Description of the task to perform
 * @param {string} testName - Optional test name
 * @returns {Object} Test result
 */
export async function runTask(framework, taskDescription, testName = null) {
  const timestamp = new Date().toISOString();
  const name = testName || `Test-${Date.now()}`;
  
  console.log(`\n🎯 Running Task: ${name}`);
  console.log(`📝 Task: ${taskDescription}`);
  console.log(`⏰ Started at: ${timestamp}\n`);

  // Create test session
  const session = framework.createTestSession(name, name.replace(/\s+/g, '-').toLowerCase());
  framework.currentTestSession = session;
  
  try {
    // Log initial step
    framework.logTestStep("Test started", null, null, `Starting task: ${taskDescription}`, true);
    await framework.takeStepScreenshot("Initial page state");
    
    const finalState = await framework.agent.invoke({
      messages: [new HumanMessage(taskDescription)],
    }, {
      recursionLimit: AGENT_CONFIG.agent.recursionLimit,
      configurable: { thread_id: `session-${framework.currentTestSession.sessionId}` }
    });

    const result = finalState.messages[finalState.messages.length - 1].content;
    
    // Log final step
    framework.logTestStep("Test completed", null, null, result, true);
    await framework.takeStepScreenshot("Final page state");
    
    // Finish session
    await framework.finishTestSession('SUCCESS', result);
    
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
    framework.logTestStep("Test failed", null, null, error.message, false);
    await framework.takeStepScreenshot("Error state");
    
    // Finish session with failure
    await framework.finishTestSession('FAILED', error.message);
    
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

/**
 * Run multiple test tasks in sequence
 * @param {Object} framework - Framework instance
 * @param {Array} tasks - Array of task objects {name, description}
 * @returns {Array} Array of test results
 */
export async function runTaskSequence(framework, tasks) {
  const results = [];
  
  console.log(`\n🎯 Running ${tasks.length} tasks in sequence...\n`);
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\n📋 Task ${i + 1}/${tasks.length}: ${task.name}`);
    
    const result = await runTask(framework, task.description, task.name);
    results.push(result);
    
    // Add delay between tasks if configured
    if (AGENT_CONFIG.execution.stepDelay && i < tasks.length - 1) {
      console.log(`⏱️ Waiting ${AGENT_CONFIG.execution.stepDelay}ms before next task...`);
      await new Promise(resolve => setTimeout(resolve, AGENT_CONFIG.execution.stepDelay));
    }
  }
  
  // Print summary
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`\n📊 Task Sequence Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${(successful / results.length * 100).toFixed(1)}%\n`);
  
  return results;
}

/**
 * Run a single test by ID for web UI
 * @param {string} testId - The test ID to run
 * @param {Object} options - Options including reporter
 * @returns {Object} Test result
 */
export async function runSingleTestById(testId, options = {}) {
  const { reporter } = options;
  
  try {
    // This is a stub implementation for now
    // In real implementation, this would:
    // 1. Load the test by ID
    // 2. Set up browser framework
    // 3. Run the test with the provided reporter
    // 4. Return results
    
    if (reporter) {
      reporter.onTestStart({ id: testId, name: `Test ${testId}` });
      
      // Simulate test steps for E2E testing
      await new Promise(resolve => setTimeout(resolve, 50));
      reporter.onTestStep({ 
        description: `Setting up browser for test ${testId}`,
        timestamp: new Date().toISOString(),
        stepNumber: 1
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      reporter.onTestStep({ 
        description: `Executing test actions for ${testId}`,
        timestamp: new Date().toISOString(),
        stepNumber: 2
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      reporter.onTestStep({ 
        description: `Verifying test results for ${testId}`,
        timestamp: new Date().toISOString(),
        stepNumber: 3
      });
      
      // Simulate test completion
      await new Promise(resolve => setTimeout(resolve, 50));
      
      reporter.onTestComplete({
        testId,
        testName: `Test ${testId}`,
        status: 'SUCCESS',
        duration: 200
      });
    }
    
    return {
      success: true,
      testId,
      duration: 200,
      status: 'SUCCESS'
    };
  } catch (error) {
    if (reporter) {
      reporter.onTestError({ testId, message: error.message, stack: error.stack });
    }
    throw error;
  }
}
