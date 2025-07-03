// Test just the browser initialization from the recorder
import { runInteractiveRecorder } from './framework/test-recorder/interactive-recorder.js';

// Test with a minimal config
const config = {
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
  }
};

console.log('🧪 Testing recorder with tsx (TypeScript source)...');

// Mock the user input to prevent hanging
const originalQuestion = process.stdin.read;
let questionCount = 0;

// Override readline to provide automated responses
const mockResponses = [
  'TEST-001',           // Test ID
  'Test Recording',     // Test Name  
  'Browser test',       // Description
  'Medium',             // Priority
  '',                   // Tags
  'https://google.com', // Site URL
  '',                   // Test data (finish)
  'y',                  // Confirm
  'done'                // Stop recording
];

import readline from 'readline';
const originalCreateInterface = readline.createInterface;
readline.createInterface = function(options) {
  const rl = originalCreateInterface(options);
  const originalQuestion = rl.question.bind(rl);
  
  rl.question = function(prompt, callback) {
    console.log(`📝 Prompt: ${prompt.trim()}`);
    const response = mockResponses[questionCount++] || '';
    console.log(`🤖 Auto-response: "${response}"`);
    
    // Simulate delay for natural interaction
    setTimeout(() => callback(response), 100);
  };
  
  return rl;
};

try {
  await runInteractiveRecorder(config);
  console.log('✅ Test completed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}