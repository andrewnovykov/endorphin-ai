// Quick test to check browser initialization
import { EnhancedBrowserTestFramework } from './dist/framework/automation/browser/browser-framework.js';

async function testBrowserInit() {
  console.log('🧪 Testing browser initialization...');
  
  try {
    const framework = new EnhancedBrowserTestFramework({
      browser: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
      }
    });
    
    console.log('📦 Framework created');
    
    await framework.initialize();
    console.log('✅ Browser initialized - should be visible');
    
    // Wait a bit to see if browser shows up
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await framework.cleanup();
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBrowserInit();