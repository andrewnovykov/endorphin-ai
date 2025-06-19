// framework/core/test-runner.js
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
