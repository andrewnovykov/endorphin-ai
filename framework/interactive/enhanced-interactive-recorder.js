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

async function runInteractiveRecorder(config = {}) {
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

  // Create framework with the config from CLI
  const framework = new EnhancedBrowserTestFramework(config);
  const recorder = new TestRecorder(framework, testData);
  
  try {
    // Initialize framework
    console.log('\n🚀 Initializing browser...');
    await framework.initialize();
    
    // Start recording
    const recordingId = await recorder.startRecording();
    
    // Navigate to the site
    console.log(`\n🌐 Navigating to: ${testData.site}`);
    await framework.tools.navigate({ url: testData.site });
    
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
        
        // Use the AI agent to interpret and execute the command
        const result = await framework.runTask(prompt, `Interactive-Step-${Date.now()}`);
        
        // Record this step
        await recorder.recordStep(
          prompt,
          'ai-agent',
          { command: prompt },
          result.result || 'Command executed by AI agent'
        );
        
        console.log(`✅ Step completed: ${result.result || 'Success'}`);
        
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

// Run the interactive recorder
if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractiveRecorder().catch(console.error);
}

export { runInteractiveRecorder, collectTestData };
