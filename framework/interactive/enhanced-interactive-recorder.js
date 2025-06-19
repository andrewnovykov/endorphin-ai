#!/usr/bin/env node

// Enhanced Interactive Test Recorder
import { EnhancedBrowserTestFramework } from '../index.js';
import { TestRecorder } from '../core/test-recorder.js';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function collectTestData() {
  console.log('\n📋 Test Data Collection');
  console.log('═'.repeat(40));
  
  const testData = {};
  
  // Required fields
  testData.id = await askQuestion('Test ID (e.g., QE-012): ');
  testData.name = await askQuestion('Test Name: ');
  testData.description = await askQuestion('Test Description: ');
  
  // Optional fields
  const priority = await askQuestion('Priority (High/Medium/Low) [Medium]: ');
  testData.priority = priority || 'Medium';
  
  const tags = await askQuestion('Tags (comma-separated): ');
  testData.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
  
  // Site URL (use env variable as default)
  const defaultSite = process.env.BASE_URL || 'https://qafromla.herokuapp.com/';
  const site = await askQuestion(`Site URL [${defaultSite}]: `);
  testData.site = site || defaultSite;
  
  // Collect test data object
  console.log('\n🔧 Test Data (for form filling, login, etc.)');
  console.log('Press Enter to skip any field');
  
  const testDataObj = {};
  
  const uid = await askQuestion('User ID: ');
  if (uid) testDataObj.uid = uid;
  
  const email = await askQuestion('Email: ');
  if (email) testDataObj.email = email;
  
  const password = await askQuestion('Password: ');
  if (password) testDataObj.password = password;
  
  const firstName = await askQuestion('First Name: ');
  if (firstName) testDataObj.firstName = firstName;
  
  const lastName = await askQuestion('Last Name: ');
  if (lastName) testDataObj.lastName = lastName;
  
  // Add any additional custom fields
  console.log('\nAdd custom fields (key=value format, or press Enter to finish):');
  while (true) {
    const customField = await askQuestion('Custom field (key=value): ');
    if (!customField) break;
    
    const [key, ...valueParts] = customField.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      testDataObj[key.trim()] = value.trim();
    }
  }
  
  testData.testData = testDataObj;
  
  // Display collected data
  console.log('\n📊 Collected Test Data:');
  console.log('═'.repeat(40));
  console.log(JSON.stringify(testData, null, 2));
  
  const confirm = await askQuestion('\nConfirm test data? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Test data collection cancelled');
    return null;
  }
  
  return testData;
}

async function runInteractiveRecorder() {
  console.log('\n🎬 Interactive Test Recorder');
  console.log('═'.repeat(50));
  console.log('Record browser interactions step by step!');
  console.log('Commands:');
  console.log('• Type natural language commands (e.g., "click login button")');
  console.log('• Type "done" to stop recording and generate test');
  console.log('• Each step will be recorded with screenshots');
  console.log('═'.repeat(50));

  // Collect test data first
  const testData = await collectTestData();
  if (!testData) {
    console.log('👋 Exiting...');
    rl.close();
    return;
  }

  const framework = new EnhancedBrowserTestFramework();
  const recorder = new TestRecorder(framework, testData);
  
  try {
    // Initialize framework
    console.log('\n🚀 Initializing browser...');
    await framework.initialize();
    
    // Start recording
    const recordingId = await recorder.startRecording();
    
    // Navigate to the site
    console.log(`\n🌐 Navigating to: ${testData.site}`);
    await framework.navigate(testData.site);
    
    // Record the navigation step
    await recorder.recordStep(
      `Navigate to ${testData.site}`,
      'navigate',
      { url: testData.site },
      'Navigation completed'
    );
    
    console.log('\n💬 Ready for interactive commands!');
    console.log('Type your commands or "done" to finish recording.\n');
    
    // Interactive command loop
    while (true) {
      const prompt = await askQuestion('🎬 Next step: ');
      
      if (prompt.toLowerCase() === 'done') {
        console.log('\n🛑 Stopping recording...');
        break;
      }
      
      if (!prompt.trim()) {
        console.log('⚠️ Please enter a command or "done" to finish.');
        continue;
      }
      
      try {
        // Execute the command using the framework's AI agent
        console.log(`\n🤖 Processing: "${prompt}"`);
        
        // Use the framework's AI to interpret and execute the command
        const result = await framework.executeNaturalLanguageCommand(prompt);
        
        // Record this step
        await recorder.recordStep(
          prompt,
          result.toolUsed || 'custom',
          result.params || {},
          result.result || 'Command executed'
        );
        
        console.log(`✅ Step completed`);
        
      } catch (error) {
        console.log(`❌ Error executing command: ${error.message}`);
        
        // Still record the failed attempt
        await recorder.recordStep(
          prompt,
          'error',
          { error: error.message },
          `Error: ${error.message}`
        );
      }
    }
    
    // Stop recording and generate files
    const recordingResult = await recorder.stopRecording();
    
    console.log('\n🎉 Recording Complete!');
    console.log('═'.repeat(40));
    console.log(`📁 Recording ID: ${recordingResult.recordingId}`);
    console.log(`📂 Artifacts: ${recordingResult.recordingPath}`);
    console.log(`🧪 Steps recorded: ${recordingResult.steps}`);
    console.log(`📝 Test file generated in tests/ folder`);
    
  } catch (error) {
    console.error(`💥 Error in interactive recorder: ${error.message}`);
  } finally {
    await framework.cleanup();
    rl.close();
  }
}

// Add method to framework for executing natural language commands
async function enhanceFrameworkWithNLCommands(framework) {
  framework.executeNaturalLanguageCommand = async function(command) {
    const lowerCommand = command.toLowerCase();
    
    // Parse common commands
    if (lowerCommand.includes('click')) {
      // Extract selector or button text
      const selector = this.extractSelectorFromCommand(command);
      const result = await this.click(selector);
      return { toolUsed: 'click', params: { selector }, result };
    }
    
    if (lowerCommand.includes('fill') || lowerCommand.includes('type')) {
      // Extract field and value
      const { selector, value } = this.extractFillFromCommand(command);
      const result = await this.fill(selector, value);
      return { toolUsed: 'fill', params: { selector, value }, result };
    }
    
    if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
      // Extract URL
      const url = this.extractUrlFromCommand(command);
      const result = await this.navigate(url);
      return { toolUsed: 'navigate', params: { url }, result };
    }
    
    if (lowerCommand.includes('wait')) {
      // Extract time
      const time = this.extractTimeFromCommand(command) || 2000;
      await this.page.waitForTimeout(time);
      return { toolUsed: 'wait', params: { time }, result: `Waited ${time}ms` };
    }
    
    if (lowerCommand.includes('screenshot')) {
      const result = await this.screenshot();
      return { toolUsed: 'screenshot', params: {}, result };
    }
    
    // Default: try to use AI agent to interpret the command
    try {
      const result = await this.executeTask(command);
      return { toolUsed: 'ai-agent', params: { command }, result };
    } catch (error) {
      throw new Error(`Could not interpret command: "${command}". ${error.message}`);
    }
  };
  
  // Helper methods for parsing commands
  framework.extractSelectorFromCommand = function(command) {
    // Try to extract button text, link text, or selector
    const buttonMatch = command.match(/(?:click|press)\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+button|\s+link|$)/i);
    if (buttonMatch) {
      const text = buttonMatch[1].trim();
      // Return as text selector for buttons/links
      return `text=${text}`;
    }
    
    // Try to extract by common UI element names
    if (command.includes('login')) return 'text=Login';
    if (command.includes('submit')) return 'text=Submit';
    if (command.includes('sign up')) return 'text=Sign Up';
    if (command.includes('register')) return 'text=Register';
    
    // Default to a generic button selector
    return 'button';
  };
  
  framework.extractFillFromCommand = function(command) {
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
  };
  
  framework.extractUrlFromCommand = function(command) {
    const urlMatch = command.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) return urlMatch[1];
    
    // Default to base URL if no URL found
    return this.baseUrl || 'https://qafromla.herokuapp.com/';
  };
  
  framework.extractTimeFromCommand = function(command) {
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
  };
}

// Run the interactive recorder
if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractiveRecorder().catch(console.error);
}

export { runInteractiveRecorder, collectTestData, enhanceFrameworkWithNLCommands };
