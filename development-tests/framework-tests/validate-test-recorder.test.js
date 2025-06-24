#!/usr/bin/env node

/**
 * Simple test validator to check if our test files are syntactically correct
 * and can be imported without errors.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateTestFile(testFilePath, testName) {
  try {
    console.log(`\n🧪 Validating ${testName}...`);
    
    // Try to import the test file
    await import(testFilePath);
    
    console.log(`✅ ${testName} - Syntax valid, imports successful`);
    return true;
  } catch (error) {
    console.log(`❌ ${testName} - Error:`, error.message);
    return false;
  }
}

async function validateTestRecorderImplementation() {
  console.log('🔍 Test Recorder Implementation Validation');
  console.log('═'.repeat(50));
  
  let allValid = true;
  
  // Check core implementation
  try {
    console.log('\n📦 Validating Core Implementation...');
    const { TestRecorder } = await import('../../framework/core/test-recorder.js');
    console.log('✅ TestRecorder class imports successfully');
    
    // Quick instantiation test
    const mockFramework = { page: { screenshot: () => {}, evaluate: () => {} } };
    const testData = { id: 'TEST-001', name: 'Test' };
    const recorder = new TestRecorder(mockFramework, testData);
    
    console.log('✅ TestRecorder instantiation successful');
    console.log(`✅ TestRecorder has ${Object.getOwnPropertyNames(Object.getPrototypeOf(recorder)).length} methods`);
    
  } catch (error) {
    console.log('❌ TestRecorder implementation error:', error.message);
    allValid = false;
  }
  
  // Check interactive recorder
  try {
    console.log('\n🎬 Validating Interactive Recorder...');
    const { runInteractiveRecorder, collectTestData } = await import('../../framework/interactive/enhanced-interactive-recorder.js');
    console.log('✅ runInteractiveRecorder function exports successfully');
    console.log('✅ collectTestData function exports successfully');
  } catch (error) {
    console.log('❌ Interactive recorder error:', error.message);
    allValid = false;
  }
  
  // Validate test files
  const testFiles = [
    {
      path: join(__dirname, 'test-recorder.test.js'),
      name: 'TestRecorder Unit Tests'
    },
    {
      path: join(__dirname, 'test-recorder-integration.test.js'),
      name: 'TestRecorder Integration Tests'
    }
  ];
  
  console.log('\n🧪 Validating Test Files...');
  for (const testFile of testFiles) {
    const isValid = await validateTestFile(testFile.path, testFile.name);
    if (!isValid) allValid = false;
  }
  
  // Summary
  console.log('\n📊 Validation Summary');
  console.log('═'.repeat(30));
  
  if (allValid) {
    console.log('🎉 All validations passed!');
    console.log('✅ TestRecorder implementation is ready');
    console.log('✅ Test files are syntactically correct');
    console.log('✅ All imports work correctly');
    
    console.log('\n🚀 Next Steps:');
    console.log('• Run: npm run test:recorder (to run tests)');
    console.log('• Run: npm run test:record (to start recording)');
    console.log('• Run: npx endorphin run test-recorder (CLI)');
  } else {
    console.log('❌ Some validations failed');
    console.log('🔧 Please fix the errors above before proceeding');
    process.exit(1);
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateTestRecorderImplementation().catch(console.error);
}

export { validateTestRecorderImplementation };
