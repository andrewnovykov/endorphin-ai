#!/usr/bin/env node

/**
 * Endorphin AI - Example Usage
 * This file demonstrates how to use Endorphin AI programmatically
 */

// Method 1: Default import (recommended for simple usage)
import EndorphinAI from './framework/index.js';

// Method 2: Named imports (for advanced usage)
import { 
  EnhancedBrowserTestFramework,
  TestRecorder,
  BROWSER_CONFIG,
  AGENT_CONFIG 
} from './framework/index.js';

async function basicExample() {
  console.log('🎯 Basic Endorphin AI Example\n');
  
  // Simple usage with default export
  const framework = new EndorphinAI();
  
  try {
    await framework.initialize();
    
    console.log('✅ Framework initialized');
    console.log(`🔧 Browser config: headless=${BROWSER_CONFIG.launchOptions.headless}`);
    console.log(`🤖 AI model: ${AGENT_CONFIG.openai.modelName}\n`);
    
    // Run a simple task
    const result = await framework.runTask(
      "Navigate to https://example.com and take a screenshot",
      "Example Navigation Test"
    );
    
    console.log('📊 Test Result:', result.status);
    console.log('📁 Results saved to:', result.sessionDir);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await framework.cleanup();
  }
}

async function advancedExample() {
  console.log('\n🚀 Advanced Endorphin AI Example\n');
  
  // Advanced usage with named imports
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    
    // Enable interactive mode for enhanced logging
    await framework.enableInteractiveMode();
    
    // Run a custom test
    const customTest = {
      id: 'EXAMPLE-001',
      name: 'Custom Login Test',
      description: 'Example of programmatic test creation',
      priority: 'High',
      tags: ['example', 'automation'],
      site: 'https://qafromla.herokuapp.com/',
      testData: {
        email: 'test@example.com',
        password: 'testpass123'
      },
      task: `
        Navigate to https://qafromla.herokuapp.com/.
        Take a screenshot of the homepage.
        Click on "Log In" button.
        Fill email field with "test@example.com".
        Fill password field with "testpass123".
        Click "Sign In" button.
        Verify login was successful.
      `
    };
    
    const result = await framework.runSingleTest(customTest);
    
    if (result.success) {
      console.log('✅ Custom test passed!');
    } else {
      console.log('❌ Custom test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await framework.cleanup();
  }
}

async function recordingExample() {
  console.log('\n📹 Test Recording Example\n');
  
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    await framework.enableInteractiveMode();
    
    // Create a test recorder
    const testData = {
      id: 'RECORD-001',
      name: 'Programmatic Recording Test',
      description: 'Example of using TestRecorder programmatically',
      site: 'https://example.com'
    };
    
    const recorder = new TestRecorder(framework, testData);
    
    // Start recording
    const recordingId = await recorder.startRecording();
    console.log('📹 Recording started:', recordingId);
    
    // Navigate and record steps
    await framework.tools.navigate({ url: 'https://example.com' });
    await recorder.recordStep(
      'Navigate to example.com',
      'navigate',
      { url: 'https://example.com' },
      'Successfully navigated to example.com'
    );
    
    // Take a screenshot and record it
    await framework.tools.screenshot({});
    await recorder.recordStep(
      'Take homepage screenshot',
      'screenshot',
      {},
      'Screenshot captured'
    );
    
    // Stop recording and generate files
    const result = await recorder.stopRecording();
    
    console.log('✅ Recording completed!');
    console.log('📁 Recording saved to:', result.recordingPath);
    console.log('📊 Steps recorded:', result.steps);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await framework.cleanup();
  }
}

// Main execution
async function main() {
  console.log('🎉 Endorphin AI - Programmatic Usage Examples\n');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--basic')) {
    await basicExample();
  } else if (args.includes('--advanced')) {
    await advancedExample();
  } else if (args.includes('--recording')) {
    await recordingExample();
  } else {
    console.log('Usage:');
    console.log('  node examples.js --basic      # Basic framework usage');
    console.log('  node examples.js --advanced   # Advanced test creation');
    console.log('  node examples.js --recording  # Test recording example');
    console.log('\nNote: Make sure OPENAI_API_KEY is set in your .env file');
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { basicExample, advancedExample, recordingExample };
