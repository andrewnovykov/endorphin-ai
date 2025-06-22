// Endorphin e2e AI test framework>
// Copyright (C)  2025 Redstudio Agency

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { EnhancedBrowserTestFramework } from './index.js';

// Re-export the framework for compatibility
export { EnhancedBrowserTestFramework };

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  // Import TestManager for file-based tests
  const { TestManager } = await import('./core/test-manager.js');
  const testManager = new TestManager();
  await testManager.loadTests();
  
  // Handle --list command without initializing browser
  if (args.includes('--list')) {
    testManager.listTests();
    return; // Exit early without browser initialization
  }
  
  // For all other commands, initialize the framework
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    await framework.initialize();
    
    console.log('\n🔧 Enhanced Browser Test Framework with Detailed Result Tracking');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('Choose an option:');
    console.log('1. Run a specific test by ID (e.g., QE-001)');
    console.log('2. Run tests by tag (e.g., authentication, smoke)');
    console.log('3. Run tests by priority (High, Medium, Low)');
    console.log('4. Run all tests');
    console.log('5. List available tests');
    console.log('6. Interactive mode (custom task)');
    console.log('7. Run comprehensive test suite');
    
    if (args.includes('--test') || args.includes('-t')) {
      // Run specific test
      const testId = args[args.indexOf('--test') + 1] || args[args.indexOf('-t') + 1];
      if (testId) {
        const test = testManager.getTestById(testId);
        if (test) {
          await framework.runSingleTest(test);
        } else {
          console.log(`❌ Test ${testId} not found`);
        }
      } else {
        console.log('❌ Please specify a test ID');
      }
    } else if (args.includes('--tag')) {
      // Run tests by tag
      const tag = args[args.indexOf('--tag') + 1];
      if (tag) {
        const tests = testManager.getTestsByTag(tag);
        console.log(`\n🏷️ Running tests with tag: ${tag}`);
        await framework.runMultipleTests(tests);
      } else {
        console.log('❌ Please specify a tag');
      }
    } else if (args.includes('--priority')) {
      // Run tests by priority
      const priority = args[args.indexOf('--priority') + 1];
      if (priority) {
        const tests = testManager.getTestsByPriority(priority);
        console.log(`\n📊 Running tests with priority: ${priority}`);
        await framework.runMultipleTests(tests);
      } else {
        console.log('❌ Please specify a priority (High, Medium, Low)');
      }
    } else if (args.includes('--all')) {
      // Run all tests
      console.log('\n🚀 Running all available tests...');
      await framework.runMultipleTests(testManager.getAllTests());
    } else if (args.includes('--interactive')) {
      // Interactive mode - redirect to step-by-step builder
      await framework.enableInteractiveMode(); // Enable recording for interactive mode
      console.log('\n💬 Interactive Mode - Step-by-Step Test Builder');
      console.log('For the full step-by-step interactive experience, use:');
      console.log('npm run step-by-step');
      console.log('\nRunning quick interactive demo instead...');
      
      const demoTest = {
        id: 'INTERACTIVE-DEMO',
        name: 'Interactive Demo Task',
        description: 'Quick interactive demonstration',
        priority: 'Medium',
        tags: ['interactive', 'demo'],
        site: 'https://httpbin.org',
        task: "Navigate to https://httpbin.org. Take a screenshot. Get simple page content. Verify site is accessible. STOP - test completed."
      };
      
      await framework.runSingleTest(demoTest);
    } else if (args.includes('--comprehensive')) {
      // Run comprehensive suite
      console.log('\n🎯 Running comprehensive test suite...');
      const allTests = testManager.getAllTests();
      await framework.runMultipleTests(allTests);
    } else {
      // Default: run a demo test
      console.log('\n🎯 Running demo test (QE-001) with enhanced result tracking...');
      const demoTest = testManager.getTestById('QE-001');
      if (demoTest) {
        await framework.runSingleTest(demoTest);
      } else {
        console.log('❌ Demo test QE-001 not found. Please run with --list to see available tests.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await framework.cleanup();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('enhanced-test-framework.js')) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}
