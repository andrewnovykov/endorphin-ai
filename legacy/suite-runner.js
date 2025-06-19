import { BrowserTestFramework } from './legacy/browser-test-framework.js';
import { TEST_SITES, TEST_DATA, generateTask, generateTestSuite, TASK_TEMPLATES } from './test-config.js';

// 🎯 **TEST SUITE RUNNER**
// Easily run predefined test suites or create custom ones

class SuiteRunner {
  constructor() {
    this.framework = new BrowserTestFramework();
  }

  async initialize() {
    await this.framework.initialize();
  }

  // 🚀 **RUN A PREDEFINED TEST SUITE**
  async runSuite(suiteName) {
    console.log(`\n🎯 Running Test Suite: ${suiteName}`);
    console.log("═".repeat(50));
    
    try {
      const testSuite = generateTestSuite(suiteName);
      const results = await this.framework.runMultipleTasks(testSuite);
      
      console.log(`\n✅ Test Suite "${suiteName}" completed!`);
      return results;
    } catch (error) {
      console.error(`❌ Error running test suite "${suiteName}":`, error);
      return null;
    }
  }

  // 🎯 **RUN CUSTOM TASKS USING TEMPLATES**
  async runTemplateTask(templateName, params, taskName) {
    try {
      const taskDescription = generateTask(templateName, params);
      return await this.framework.runTask(taskDescription, taskName);
    } catch (error) {
      console.error(`❌ Error running template task "${templateName}":`, error);
      return null;
    }
  }

  // 📊 **RUN COMPREHENSIVE TEST SCENARIOS**
  async runComprehensiveTests() {
    console.log("\n🎯 **COMPREHENSIVE BROWSER TESTING**");
    console.log("═".repeat(50));
    
    // 1. Basic smoke tests
    console.log("\n1️⃣ Running Basic Smoke Tests...");
    await this.runSuite("BASIC_SMOKE");
    
    // 2. Content management tests  
    console.log("\n2️⃣ Running Content Management Tests...");
    await this.runSuite("CONTENT_MANAGEMENT");
    
    // 3. Cross-browser compatibility tests
    console.log("\n3️⃣ Running Cross-Browser Tests...");
    await this.runSuite("CROSS_BROWSER");
    
    // Generate final report
    return this.framework.generateReport();
  }

  // 🌐 **TEST MULTIPLE WEBSITES**
  async testMultipleSites() {
    const sitesToTest = [
      { name: "QA Demo Site", url: TEST_SITES.QA_DEMO },
      { name: "Google", url: TEST_SITES.GOOGLE },
      { name: "Wikipedia", url: TEST_SITES.WIKIPEDIA }
    ];
    
    const tasks = sitesToTest.map(site => ({
      name: `Site Test: ${site.name}`,
      description: generateTask("SITE_EXPLORATION", [site.url])
    }));
    
    return await this.framework.runMultipleTasks(tasks);
  }

  // 🔍 **FOCUSED TESTING SCENARIOS**
  async runFocusedTests(testType) {
    const focusedTests = {
      authentication: [
        {
          name: "Valid Login Test",
          description: generateTask("LOGIN", [TEST_SITES.QA_DEMO, TEST_DATA.USER.email, TEST_DATA.USER.password])
        },
        {
          name: "Invalid Login Test", 
          description: generateTask("LOGIN", [TEST_SITES.QA_DEMO, "invalid@email.com", "wrongpassword"])
        }
      ],
      
      search: [
        {
          name: "Google Search Test",
          description: generateTask("SEARCH_TEST", [TEST_SITES.GOOGLE, ["playwright", "automation testing"]])
        },
        {
          name: "Wikipedia Search Test", 
          description: generateTask("SEARCH_TEST", [TEST_SITES.WIKIPEDIA, ["artificial intelligence", "machine learning"]])
        }
      ],
      
      forms: [
        {
          name: "Registration Form Test",
          description: generateTask("REGISTER", [TEST_SITES.QA_DEMO, TEST_DATA.USER])
        },
        {
          name: "Form Validation Test",
          description: generateTask("FORM_VALIDATION", [TEST_SITES.QA_DEMO])
        }
      ],
      
      responsive: [
        {
          name: "Mobile Layout Test",
          description: generateTask("MOBILE_TEST", [TEST_SITES.QA_DEMO])
        },
        {
          name: "Desktop Layout Test",
          description: `Navigate to ${TEST_SITES.QA_DEMO}, set viewport to 1920x1080, test desktop navigation and layout`
        }
      ]
    };
    
    const tests = focusedTests[testType];
    if (!tests) {
      console.log(`❌ Unknown test type: ${testType}`);
      console.log(`Available types: ${Object.keys(focusedTests).join(', ')}`);
      return;
    }
    
    console.log(`\n🎯 Running Focused Tests: ${testType.toUpperCase()}`);
    return await this.framework.runMultipleTasks(tests);
  }

  // 🎲 **RANDOM TESTING**
  async runRandomTests(count = 3) {
    const templates = Object.keys(TASK_TEMPLATES);
    const sites = Object.values(TEST_SITES);
    
    const randomTasks = [];
    for (let i = 0; i < count; i++) {
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const randomSite = sites[Math.floor(Math.random() * sites.length)];
      
      try {
        const taskDescription = generateTask(randomTemplate, [randomSite, TEST_DATA.USER]);
        randomTasks.push({
          name: `Random Test ${i + 1}: ${randomTemplate}`,
          description: taskDescription
        });
      } catch (error) {
        // Skip invalid template combinations
        console.log(`⚠️ Skipping invalid template combination: ${randomTemplate}`);
      }
    }
    
    console.log(`\n🎲 Running ${randomTasks.length} Random Tests...`);
    return await this.framework.runMultipleTasks(randomTasks);
  }

  async close() {
    await this.framework.close();
  }

  generateReport() {
    return this.framework.generateReport();
  }
}

// 🚀 **USAGE EXAMPLES**

async function main() {
  const args = process.argv.slice(2);
  const runner = new SuiteRunner();
  
  try {
    await runner.initialize();
    
    if (args.includes('--comprehensive')) {
      // Run all comprehensive tests
      await runner.runComprehensiveTests();
      
    } else if (args.includes('--suite')) {
      // Run specific test suite
      const suiteIndex = args.indexOf('--suite');
      const suiteName = args[suiteIndex + 1];
      if (suiteName) {
        await runner.runSuite(suiteName);
      } else {
        console.log("Available suites: BASIC_SMOKE, ECOMMERCE_FULL, CONTENT_MANAGEMENT, CROSS_BROWSER");
      }
      
    } else if (args.includes('--focused')) {
      // Run focused tests
      const focusIndex = args.indexOf('--focused');
      const testType = args[focusIndex + 1];
      if (testType) {
        await runner.runFocusedTests(testType);
      } else {
        console.log("Available focused tests: authentication, search, forms, responsive");
      }
      
    } else if (args.includes('--random')) {
      // Run random tests
      const randomIndex = args.indexOf('--random');
      const count = args[randomIndex + 1] ? parseInt(args[randomIndex + 1]) : 3;
      await runner.runRandomTests(count);
      
    } else if (args.includes('--multi-site')) {
      // Test multiple sites
      await runner.testMultipleSites();
      
    } else {
      // Default: show usage
      console.log("🎯 **BROWSER TEST SUITE RUNNER**");
      console.log("═".repeat(40));
      console.log("\nUsage:");
      console.log("  node suite-runner.js --comprehensive              # Run all test suites");
      console.log("  node suite-runner.js --suite BASIC_SMOKE          # Run specific suite");
      console.log("  node suite-runner.js --focused authentication     # Run focused tests");
      console.log("  node suite-runner.js --random 5                   # Run 5 random tests");
      console.log("  node suite-runner.js --multi-site                 # Test multiple sites");
      console.log("\nAvailable Test Suites:");
      console.log("  - BASIC_SMOKE: Basic functionality tests");
      console.log("  - ECOMMERCE_FULL: E-commerce workflow tests");
      console.log("  - CONTENT_MANAGEMENT: CMS functionality tests");
      console.log("  - CROSS_BROWSER: Cross-platform compatibility");
      console.log("\nFocused Test Types:");
      console.log("  - authentication: Login/logout tests");
      console.log("  - search: Search functionality tests");
      console.log("  - forms: Form validation and submission");
      console.log("  - responsive: Mobile/desktop layout tests");
      
      // Run basic smoke tests by default
      console.log("\n🚀 Running default test suite (BASIC_SMOKE)...\n");
      await runner.runSuite("BASIC_SMOKE");
    }
    
    // Always generate final report
    runner.generateReport();
    
  } catch (error) {
    console.error("❌ Suite runner error:", error);
  } finally {
    await runner.close();
  }
}

// Export for use in other files
export { SuiteRunner };

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
