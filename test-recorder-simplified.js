// Simplified test recorder to debug browser initialization
import { EnhancedBrowserTestFramework } from './dist/framework/automation/browser/browser-framework.js';

async function testRecorderInit() {
  console.log('🎬 Testing recorder browser initialization...');
  
  const testData = {
    id: 'TEST-001',
    name: 'Test Recording',
    description: 'Test browser init',
    priority: 'Medium',
    tags: [],
    site: 'https://google.com',
    testData: {}
  };
  
  // Create framework with the config
  const framework = new EnhancedBrowserTestFramework({
    browser: {
      headless: false,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
    }
  });
  
  try {
    // Initialize framework
    console.log('\n🚀 Initializing browser...');
    await framework.initialize();
    console.log('✅ Browser should now be visible');
    
    // Navigate to the site using the framework's runTask method
    console.log(`\n🌐 Navigating to: ${testData.site}`);
    const navResult = await framework.runTask(`Navigate to ${testData.site}`, 'navigation');
    console.log('✅ Navigation completed:', navResult.status);
    
    console.log('\n💬 Browser should be showing Google now. Waiting 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error(`💥 Error: ${error.message}`);
  } finally {
    await framework.cleanup();
    console.log('🧹 Cleanup completed');
  }
}

testRecorderInit();