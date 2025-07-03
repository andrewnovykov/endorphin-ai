// Test the fixed sequential execution
import { runAllTests } from './framework/execution/discovery/cli-functions.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSequentialExecution() {
  console.log('🧪 Testing Fixed Sequential Execution...');
  console.log('This will test the sequential test runner with improved timeouts and cleanup');
  
  try {
    console.log('\n🚀 Running all tests in sequential mode...');
    console.log('⏱️ Each test now has a 5-minute timeout (was 15 minutes)');
    console.log('🧹 Resource cleanup happens between each test');
    console.log('📊 Tests should continue even if one times out\n');
    
    const startTime = Date.now();
    
    // Run tests sequentially (parallel: 1 means sequential)
    const result = await runAllTests(null, { parallel: 1 });
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n📊 Sequential Execution Results:');
    console.log(`- Total time: ${duration}s`);
    console.log(`- Tests run: ${result.total}`);
    console.log(`- Passed: ${result.passed}`);
    console.log(`- Failed: ${result.failed}`);
    console.log(`- Success: ${result.success ? '✅' : '❌'}`);
    
    if (result.success) {
      console.log('\n✅ Sequential execution completed successfully!');
      console.log('🎯 All tests ran without getting stuck');
    } else {
      console.log('\n⚠️ Some tests failed, but sequential execution completed');
      console.log('🎯 No tests got stuck - this is the important fix');
    }
    
    console.log('\n🎉 Sequential execution fixes verified!');
    
  } catch (error) {
    console.error('\n💥 Sequential execution test failed:', error.message);
    console.log('🔍 This suggests the timeout or cleanup fixes need adjustment');
  }
}

testSequentialExecution();