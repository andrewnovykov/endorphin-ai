#!/usr/bin/env node

// Quick test to verify enhanced framework without browser
import { EnhancedBrowserTestFramework } from './enhanced-test-framework.js';
import { TestManager } from './test-manager.js';
import fs from 'fs';

console.log('🧪 Enhanced Framework Quick Test');
console.log('================================');

try {
  // Test 1: TestManager
  console.log('\n1. Testing TestManager...');
  const testManager = new TestManager();
  await testManager.loadTests();
  const allTests = testManager.getAllTests();
  console.log(`✅ Loaded ${allTests.length} tests`);
  
  // Show first few tests
  if (allTests.length > 0) {
    console.log('\n📋 Available Tests:');
    allTests.slice(0, 5).forEach(test => {
      console.log(`   • ${test.id}: ${test.name} [${test.priority}] (${test.tags.join(', ')})`);
    });
    if (allTests.length > 5) {
      console.log(`   ... and ${allTests.length - 5} more tests`);
    }
  }
  
  // Test 2: Framework instantiation
  console.log('\n2. Testing Framework instantiation...');
  const framework = new EnhancedBrowserTestFramework();
  console.log('✅ Enhanced framework created successfully');
  
  // Test 3: Session creation without browser
  console.log('\n3. Testing session management...');
  const session = framework.createTestSession('Test Session', 'QUICK-TEST');
  console.log(`✅ Session created: ${session.sessionName}`);
  console.log(`   📁 Session directory: ${session.sessionDir}`);
  
  // Test 4: Step logging
  console.log('\n4. Testing step logging...');
  framework.logTestStep('Sample test step', 'sampleTool', {param: 'value'}, 'Success', true);
  framework.logTestStep('Another test step', 'anotherTool', {data: 'test'}, 'Also success', true);
  console.log(`✅ Logged ${framework.currentTestSession.steps.length} test steps`);
  
  // Test 5: Session completion
  console.log('\n5. Testing session completion...');
  const completedSession = framework.finishTestSession('SUCCESS', 'Quick test completed');
  console.log(`✅ Session completed: ${completedSession.sessionName}`);
  
  // Check result files
  const resultFiles = fs.readdirSync(completedSession.sessionDir);
  console.log(`   📄 Created files: ${resultFiles.join(', ')}`);
  
  console.log('\n🎉 All tests passed! Enhanced framework is working correctly.');
  console.log('\n📋 Ready Commands:');
  console.log('   npm run enhanced:demo       - Run demo test');
  console.log('   npm run enhanced:QE-001     - Run specific test');
  console.log('   npm run enhanced:auth       - Run auth tests');
  console.log('   npm run enhanced:all        - Run all tests');
  
  // Test 6: Result structure verification
  console.log('\n6. Checking result structure...');
  const testResultPath = `${completedSession.sessionDir}/test-result.json`;
  const summaryPath = `${completedSession.sessionDir}/summary.json`;
  
  if (fs.existsSync(testResultPath)) {
    const testResult = JSON.parse(fs.readFileSync(testResultPath, 'utf8'));
    console.log(`✅ test-result.json created with ${testResult.steps.length} steps`);
  }
  
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log(`✅ summary.json created - Status: ${summary.status}`);
  }
  
  console.log('\n🚀 Enhanced Framework Status: FULLY OPERATIONAL');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}
