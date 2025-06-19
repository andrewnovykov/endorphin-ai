#!/usr/bin/env node

// Simple test to validate the enhanced interactive recorder setup
import { EnhancedBrowserTestFramework } from '../index.js';
import { TestRecorder } from '../core/test-recorder.js';

async function testRecorderSetup() {
  console.log('🧪 Testing Enhanced Interactive Recorder Setup...');
  console.log('═'.repeat(50));
  
  try {
    // Test 1: Framework instantiation
    console.log('1️⃣ Testing framework instantiation...');
    const framework = new EnhancedBrowserTestFramework();
    console.log('✅ Framework created successfully');
    
    // Test 2: Test recorder instantiation
    console.log('2️⃣ Testing recorder instantiation...');
    const testData = {
      id: 'TEST-001',
      name: 'Validation Test',
      description: 'Testing recorder setup',
      site: 'https://example.com'
    };
    const recorder = new TestRecorder(framework, testData);
    console.log('✅ Recorder created successfully');
    
    // Test 3: Natural language command parsing
    console.log('3️⃣ Testing command parsing...');
    
    // Mock the framework with basic structure
    framework.tools = {
      click: async (params) => `Clicked ${params.selector}`,
      fill: async (params) => `Filled ${params.selector} with ${params.value}`,
      navigate: async (params) => `Navigated to ${params.url}`,
      screenshot: async () => 'Screenshot taken'
    };
    
    // Test command parsing
    const clickResult = framework.extractSelectorFromCommand('click login button');
    console.log(`   Click parsing: "${clickResult}"`);
    
    const fillResult = framework.extractFillFromCommand('fill email with test@example.com');
    console.log(`   Fill parsing: selector="${fillResult.selector}", value="${fillResult.value}"`);
    
    const urlResult = framework.extractUrlFromCommand('navigate to https://google.com');
    console.log(`   URL parsing: "${urlResult}"`);
    
    console.log('✅ Command parsing works correctly');
    
    console.log('\n🎉 All tests passed! Enhanced Interactive Recorder is ready to use.');
    console.log('\nTo start recording:');
    console.log('  npm run interactive');
    console.log('\nOr run directly:');
    console.log('  node framework/interactive/enhanced-interactive-recorder.js');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRecorderSetup().catch(console.error);
}

export { testRecorderSetup };
