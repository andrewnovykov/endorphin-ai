#!/usr/bin/env node

// Quick test script to verify enhanced framework components
import { EnhancedBrowserTestFramework } from './enhanced-test-framework.js';
import { TestManager } from './test-manager.js';

async function quickTest() {
  console.log('🧪 Testing Enhanced Framework Components...');
  
  try {
    // Test TestManager
    console.log('1. Testing TestManager...');
    const testManager = new TestManager();
    await testManager.loadTests();
    console.log(`✅ Loaded ${testManager.getAllTests().length} tests`);
    
    // Test Enhanced Framework initialization (without browser)
    console.log('2. Testing Enhanced Framework class instantiation...');
    const framework = new EnhancedBrowserTestFramework();
    console.log('✅ Enhanced Framework instantiated successfully');
    
    // Test result directory creation
    console.log('3. Testing test session creation...');
    const session = framework.createTestSession('Test Session', 'TEST-001');
    console.log(`✅ Test session created: ${session.sessionName}`);
    
    // Test step logging
    console.log('4. Testing step logging...');
    framework.logTestStep('Test step description', 'testTool', {arg: 'value'}, 'Success result', true);
    console.log('✅ Step logging works');
    
    // Test session finishing
    console.log('5. Testing session completion...');
    const finishedSession = framework.finishTestSession('SUCCESS', 'Test completed successfully');
    console.log(`✅ Session finished: ${finishedSession.sessionName}`);
    
    console.log('\n🎉 All component tests passed! Enhanced framework is ready.');
    console.log('\n📋 Available npm scripts for enhanced framework:');
    console.log('  npm run enhanced:demo          - Run demo test');
    console.log('  npm run enhanced:list          - List all tests');
    console.log('  npm run enhanced:interactive   - Interactive mode');
    console.log('  npm run enhanced:all           - Run all tests');
    console.log('  npm run enhanced:QE-001        - Run specific test');
    console.log('  npm run enhanced:auth          - Run authentication tests');
    console.log('  npm run enhanced:smoke         - Run smoke tests');
    console.log('  npm run enhanced:high          - Run high priority tests');
    
  } catch (error) {
    console.error('❌ Component test failed:', error.message);
    console.error(error.stack);
  }
}

quickTest().catch(console.error);
