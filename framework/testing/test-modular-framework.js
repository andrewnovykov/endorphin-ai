// Quick verification test for the new modular framework
import { EnhancedBrowserTestFramework } from '../index.js';

async function testModularFramework() {
  console.log('🧪 Testing Modular Framework...');
  
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    // Initialize framework
    await framework.initialize();
    console.log('✅ Framework initialized successfully');
    
    // Test simple navigation
    const result = await framework.runTask(
      "Navigate to https://httpbin.org. Take a screenshot. Get simple page content to verify the site loaded. STOP - test completed.",
      "Modular Framework Test"
    );
    
    console.log('✅ Test completed:', result.status);
    console.log('📁 Results saved to:', result.sessionDir);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await framework.cleanup();
    console.log('🧹 Framework cleanup completed');
  }
}

// Run the test
testModularFramework().catch(console.error);
