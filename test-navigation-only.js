// Test just the navigation issue you reported
import { EnhancedBrowserTestFramework } from './framework/automation/browser/browser-framework.js';
import dotenv from 'dotenv';

dotenv.config();

async function testNavigationFix() {
  console.log('🧪 Testing Navigation Fix...');
  console.log('This should:');
  console.log('1. Open browser');
  console.log('2. Automatically navigate to Google');
  console.log('3. Show Google homepage (not blank page)');
  
  const framework = new EnhancedBrowserTestFramework({
    browser: {
      headless: false,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
    }
  });
  
  try {
    console.log('\n🚀 Step 1: Initialize Framework...');
    await framework.initialize();
    console.log('✅ Framework initialized - browser should be visible');
    
    console.log('\n🌐 Step 2: Test Navigation...');
    const result = await framework.runTask('Navigate to https://google.com', 'navigation-test');
    
    console.log('\n📊 Navigation Result:');
    console.log('- Status:', result.status);
    console.log('- Success:', result.success);
    console.log('- Result:', result.result);
    console.log('- Error:', result.error || 'None');
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Navigation worked! Browser should show Google homepage.');
      console.log('🎯 Issue FIXED: Browser navigates automatically now');
    } else {
      console.log('\n❌ FAILED: Navigation did not work');
      console.log('🔍 Browser likely shows blank page');
    }
    
    console.log('\n⏳ Waiting 10 seconds for manual verification...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n🤖 Step 3: Test User Command...');
    const cmdResult = await framework.runTask('click on the search box', 'command-test');
    
    console.log('\n📊 Command Result:');
    console.log('- Status:', cmdResult.status);
    console.log('- Success:', cmdResult.success);
    console.log('- Result:', cmdResult.result);
    console.log('- Error:', cmdResult.error || 'None');
    
    if (cmdResult.success) {
      console.log('\n✅ SUCCESS: User commands work! Search box should be focused.');
      console.log('🎯 Issue FIXED: User commands execute properly now');
    } else {
      console.log('\n❌ FAILED: User command did not execute');
      console.log('🔍 AI agent may not be working');
    }
    
    console.log('\n⏳ Waiting 5 more seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
  } finally {
    console.log('\n🧹 Cleaning up...');
    await framework.cleanup();
  }
}

testNavigationFix();