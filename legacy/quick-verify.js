#!/usr/bin/env node

// Quick verification of enhanced framework functionality
import { EnhancedBrowserTestFramework } from './enhanced-test-framework.js';
import { TestManager } from './test-manager.js';

async function quickVerify() {
  console.log('🔍 Quick Framework Verification');
  console.log('═'.repeat(30));
  
  try {
    // Test 1: TestManager loading
    console.log('\n📁 Testing TestManager...');
    const testManager = new TestManager();
    await testManager.loadTests();
    
    const allTests = testManager.getAllTests();
    console.log(`✅ Loaded ${allTests.length} test files`);
    
    // Test 2: Get a simple test
    const simpleTest = testManager.getTestById('QE-SIMPLE');
    if (simpleTest) {
      console.log(`✅ Found QE-SIMPLE test: ${simpleTest.name}`);
    } else {
      console.log('❌ QE-SIMPLE test not found');
      return;
    }
    
    // Test 3: Initialize framework (without running tests)
    console.log('\n🚀 Testing Enhanced Framework initialization...');
    const framework = new EnhancedBrowserTestFramework();
    await framework.initialize();
    console.log('✅ Framework initialized successfully');
    
    // Test 4: Create a test session
    console.log('\n📊 Testing session management...');
    const session = framework.createTestSession('Quick Verify Test', 'VERIFY-001');
    console.log(`✅ Session created: ${session.sessionName}`);
    
    await framework.close();
    console.log('\n🎉 All verification tests passed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

quickVerify();
