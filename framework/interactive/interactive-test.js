#!/usr/bin/env node

// Interactive Test Mode for Enhanced Browser Framework
import { EnhancedBrowserTestFramework } from '../index.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runInteractiveMode() {
  console.log('\n🎯 Enhanced Browser Test Framework - Interactive Mode');
  console.log('═'.repeat(60));
  console.log('Create and run custom browser automation tasks!');
  console.log('Examples:');
  console.log('• "Navigate to https://httpbin.org and take a screenshot"');
  console.log('• "Go to https://example.com and fill out the contact form"');
  console.log('• "Test login at https://qafromla.herokuapp.com with valid credentials"');
  console.log('═'.repeat(60));

  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    await framework.enableInteractiveMode(); // Enable recording for interactive mode
    
    while (true) {
      console.log('\n💬 Interactive Options:');
      console.log('1. Run a custom task');
      console.log('2. Quick navigation test');
      console.log('3. Login test example');
      console.log('4. Form filling example');
      console.log('5. Exit');
      
      const choice = await askQuestion('\nEnter your choice (1-5): ');
      
      if (choice === '5') {
        console.log('👋 Goodbye!');
        break;
      }
      
      let task, testName, site;
      
      switch (choice) {
        case '1':
          // Custom task
          console.log('\n📝 Custom Task Mode');
          testName = await askQuestion('Enter test name (or press Enter for auto-generated): ');
          site = await askQuestion('Enter starting URL (e.g., https://example.com): ');
          task = await askQuestion('Describe what you want to do: ');
          
          if (!testName.trim()) {
            testName = `Interactive-Custom-${Date.now()}`;
          }
          
          if (site.trim()) {
            task = `Navigate to ${site}. ${task}`;
          }
          break;
          
        case '2':
          // Quick navigation test
          site = await askQuestion('Enter URL to test (default: https://httpbin.org): ');
          if (!site.trim()) site = 'https://httpbin.org';
          
          testName = 'Quick Navigation Test';
          task = `Navigate to ${site}. Take a screenshot. Get page content to analyze the structure. Verify the page loaded successfully. STOP - test completed.`;
          break;
          
        case '3':
          // Login test example
          site = await askQuestion('Enter login site URL (default: https://qafromla.herokuapp.com): ');
          if (!site.trim()) site = 'https://qafromla.herokuapp.com';
          
          const email = await askQuestion('Enter email (default: papapin888@gmail.com): ');
          const password = await askQuestion('Enter password (default: lalalend): ');
          
          testName = 'Interactive Login Test';
          task = `Navigate to ${site}. Click on "Log In" button. Wait 2 seconds. Fill email field with "${email || 'papapin888@gmail.com'}". Fill password field with "${password || 'lalalend'}". Click "Sign In" button. Wait 3 seconds. Verify login was successful. STOP - test completed.`;
          break;
          
        case '4':
          // Form filling example
          site = await askQuestion('Enter form URL (default: https://httpbin.org/forms/post): ');
          if (!site.trim()) site = 'https://httpbin.org/forms/post';
          
          testName = 'Interactive Form Test';
          task = `Navigate to ${site}. Wait 2 seconds for form to load. Fill all available form fields with test data. Submit the form. Verify submission was successful. STOP - test completed.`;
          break;
          
        default:
          console.log('❌ Invalid choice. Please try again.');
          continue;
      }
      
      // Create and run the test
      const customTest = {
        id: `INTERACTIVE-${Date.now()}`,
        name: testName,
        description: 'User-defined interactive test',
        priority: 'Medium',
        tags: ['interactive', 'custom'],
        site: site || 'N/A',
        testData: {
          uid: `interactive_user_${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        task: task
      };
      
      console.log(`\n🚀 Running: ${testName}`);
      console.log(`📝 Task: ${task}`);
      console.log(`🌐 Site: ${site || 'Multiple/Custom'}`);
      
      const result = await framework.runSingleTest(customTest);
      
      if (result.success) {
        console.log(`\n✅ Test completed successfully!`);
        console.log(`📁 Results saved in: ${result.session.sessionDir}`);
      } else {
        console.log(`\n❌ Test failed: ${result.error}`);
      }
      
      const continueChoice = await askQuestion('\nWould you like to run another test? (y/n): ');
      if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error in interactive mode:', error.message);
  } finally {
    await framework.close();
    rl.close();
  }
}

// Export the main function as default
export default runInteractiveMode;

// Run interactive mode
runInteractiveMode().catch(console.error);
