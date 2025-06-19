#!/usr/bin/env node

// Test the enhanced framework with cleanup and recording functionality
import { EnhancedBrowserTestFramework } from './enhanced-test-framework.js';

async function testCleanupAndRecording() {
  console.log('🧪 Testing Enhanced Framework with Cleanup and Recording');
  console.log('═'.repeat(60));
  
  try {
    // Initialize framework (should clean up directories)
    console.log('\n1. Testing directory cleanup on initialization...');
    const framework = new EnhancedBrowserTestFramework();
    await framework.initialize();
    
    // Create a simple test
    console.log('\n2. Running a simple test...');
    const testResult = await framework.runTask(
      'Navigate to https://httpbin.org. Take a screenshot. Get simple page content summary. STOP - test completed.',
      'Cleanup Test'
    );
    
    console.log('\n3. Test result:', testResult.status);
    
    // Close framework
    await framework.close();
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📁 Check the following directories:');
    console.log('   - test-result/ (temporary working directory, should be clean before run)');
    console.log('   - test-recorder/ (final recorded results, should contain all test data)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCleanupAndRecording();
