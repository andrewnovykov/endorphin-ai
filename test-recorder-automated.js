// Automated test of the fixed recorder
import { runInteractiveRecorder } from './framework/test-recorder/interactive-recorder.js';
import readline from 'readline';

// Mock readline to provide automated responses
const mockResponses = [
  'TEST-RECORDER-001',           // Test ID
  'Fixed Test Recorder',         // Test Name  
  'Testing the fixed recorder',  // Description
  'High',                        // Priority
  'recorder,debug',              // Tags
  'https://google.com',          // Site URL
  'testUser=admin',              // Test data key=value
  'testPassword=secret123',      // More test data
  '',                            // Finish test data
  'y',                           // Confirm
  'click on the search box',     // First command
  'type "endorphin ai testing"', // Second command  
  'press enter',                 // Third command
  'done'                         // Stop recording
];

let questionCount = 0;

// Override readline to provide automated responses
const originalCreateInterface = readline.createInterface;
readline.createInterface = function(options) {
  const rl = originalCreateInterface(options);
  const originalQuestion = rl.question.bind(rl);
  
  rl.question = function(prompt, callback) {
    const response = mockResponses[questionCount++] || 'done';
    console.log(`📝 Auto-answering: "${response}"`);
    
    // Simulate slight delay for realistic interaction
    setTimeout(() => callback(response), 200);
  };
  
  return rl;
};

console.log('🧪 Testing Fixed Test Recorder with Automated Input...');
console.log('🤖 This will automatically provide responses to test the flow');

const config = {
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
  }
};

try {
  await runInteractiveRecorder(config);
  console.log('✅ Test recorder completed successfully!');
} catch (error) {
  console.error('❌ Test recorder failed:', error.message);
}