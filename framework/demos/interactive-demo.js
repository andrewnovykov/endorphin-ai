#!/usr/bin/env node

// Quick Interactive Mode Demo - No user input required
import { EnhancedBrowserTestFramework } from '../index.js';

async function quickInteractiveDemo() {
  console.log('\n🎯 Quick Interactive Mode Demo');
  console.log('═'.repeat(50));
  console.log('Running predefined interactive tests to demonstrate the feature...');

  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    await framework.enableInteractiveMode(); // Enable recording for interactive demo mode
    
    // Demo Test 1: Simple Navigation
    console.log('\n🔹 Demo 1: Simple Navigation Test');
    const navTest = {
      id: 'INTERACTIVE-NAV-DEMO',
      name: 'Interactive Navigation Demo',
      description: 'Demonstrate interactive navigation testing',
      priority: 'Medium',
      tags: ['interactive', 'demo', 'navigation'],
      site: 'https://httpbin.org',
      testData: {
        uid: 'demo_user_nav',
        testType: 'navigation'
      },
      task: 'Navigate to https://httpbin.org. Take a screenshot. Get page content to verify site accessibility. Verify navigation demo completed. STOP - test completed.'
    };
    
    const result1 = await framework.runSingleTest(navTest);
    console.log(result1.success ? '✅ Navigation demo passed' : '❌ Navigation demo failed');
    
    // Demo Test 2: Form Interaction
    console.log('\n🔹 Demo 2: Form Interaction Test');
    const formTest = {
      id: 'INTERACTIVE-FORM-DEMO',
      name: 'Interactive Form Demo',
      description: 'Demonstrate interactive form testing',
      priority: 'Medium',
      tags: ['interactive', 'demo', 'forms'],
      site: 'https://httpbin.org/forms/post',
      testData: {
        uid: 'demo_user_form',
        testType: 'form',
        formData: {
          custname: 'Test User',
          custtel: '123-456-7890',
          custemail: 'test@example.com'
        }
      },
      task: 'Navigate to https://httpbin.org/forms/post. Wait 2 seconds for page load. Fill customer name field with "Test User". Fill telephone field with "123-456-7890". Fill email field with "test@example.com". Take screenshot of filled form. Submit the form. Verify form submission. STOP - test completed.'
    };
    
    const result2 = await framework.runSingleTest(formTest);
    console.log(result2.success ? '✅ Form demo passed' : '❌ Form demo failed');
    
    // Demo Test 3: Custom Website Analysis
    console.log('\n🔹 Demo 3: Website Analysis Test');
    const analysisTest = {
      id: 'INTERACTIVE-ANALYSIS-DEMO',
      name: 'Interactive Website Analysis Demo',
      description: 'Demonstrate interactive website analysis',
      priority: 'Medium',
      tags: ['interactive', 'demo', 'analysis'],
      site: 'https://example.com',
      testData: {
        uid: 'demo_user_analysis',
        testType: 'analysis'
      },
      task: 'Navigate to https://example.com. Take full page screenshot. Get simple page content for analysis. Get element info for main heading. Verify page structure analysis completed. STOP - test completed.'
    };
    
    const result3 = await framework.runSingleTest(analysisTest);
    console.log(result3.success ? '✅ Analysis demo passed' : '❌ Analysis demo failed');
    
    // Summary
    const passed = [result1, result2, result3].filter(r => r.success).length;
    const total = 3;
    
    console.log('\n📊 Interactive Mode Demo Summary:');
    console.log('═'.repeat(40));
    console.log(`✅ Passed: ${passed}/${total} tests`);
    console.log(`📁 All results saved in test-result/ folder`);
    console.log('\n🎯 Interactive Mode Features Demonstrated:');
    console.log('• Custom test creation and execution');
    console.log('• Dynamic test data handling');
    console.log('• Real-time result tracking');
    console.log('• Screenshot capture');
    console.log('• Detailed logging and reporting');
    
    console.log('\n🚀 To use full interactive mode with user input:');
    console.log('   npm run interactive');
    console.log('\n🔧 To use framework interactive mode:');
    console.log('   npm run enhanced:interactive');
    
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  } finally {
    await framework.close();
  }
}

// Export the main function as default
export default quickInteractiveDemo;

quickInteractiveDemo().catch(console.error);
