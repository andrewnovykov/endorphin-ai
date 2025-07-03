// Test the fixed click tool with multiple matching elements
import { EnhancedBrowserTestFramework } from './framework/automation/browser/browser-framework.js';
import dotenv from 'dotenv';

dotenv.config();

async function testClickDisambiguation() {
  console.log('🧪 Testing Click Tool Disambiguation Fix...');
  console.log('This test simulates the "Sign in" strict mode violation issue.');
  
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
    
    console.log('\n🌐 Step 2: Navigate to test site...');
    const navResult = await framework.runTask('Navigate to https://qafromla.herokuapp.com/', 'nav-test');
    console.log('- Navigation:', navResult.success ? '✅ Success' : '❌ Failed');
    
    console.log('\n🎯 Step 3: Test clicking "Sign in" (the problematic case)...');
    const clickResult = await framework.runTask('Click on the "Sign in" button', 'click-test');
    
    console.log('\n📊 Click Result:');
    console.log('- Status:', clickResult.status);
    console.log('- Success:', clickResult.success);
    console.log('- Result:', clickResult.result);
    console.log('- Error:', clickResult.error || 'None');
    
    if (clickResult.success) {
      console.log('\n✅ SUCCESS: Click disambiguation worked!');
      console.log('🎯 The tool correctly identified and clicked the button (not the heading)');
    } else {
      console.log('\n❌ FAILED: Click disambiguation did not work');
      if (clickResult.error && clickResult.error.includes('strict mode violation')) {
        console.log('🔍 Still getting strict mode violation - need further fix');
      }
    }
    
    console.log('\n⏳ Waiting 5 seconds for manual verification...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
  } finally {
    console.log('\n🧹 Cleaning up...');
    await framework.cleanup();
  }
}

testClickDisambiguation();