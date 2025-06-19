import { BrowserTestFramework } from './old/browser-test-framework.js';
import { TestManager } from './test-manager.js';
import readline from 'readline';

// 🎯 **ENHANCED TASK RUNNER** 
// Now loads tasks from individual files in tests/ folder

class TaskRunner {
  constructor() {
    this.framework = new BrowserTestFramework();
    this.testManager = new TestManager();
  }

  async initialize() {
    await this.framework.initialize();
    await this.testManager.initialize();
  }

  // 📝 **GET TASKS FROM FILES** (replaces hardcoded tasks)
  getPreDefinedTasks() {
    const allTests = Array.from(this.testManager.loadedTests.values());
    return allTests.map(test => ({
      name: `${test.id}: ${test.name}`,
      description: test.task,
      metadata: {
        id: test.id,
        priority: test.priority,
        tags: test.tags,
        prerequisites: test.prerequisites
      }
    }));
  }

  // 📝 **LEGACY METHOD FOR COMPATIBILITY**
  getLegacyTasks() {
    return [
  // 📝 **LEGACY METHOD FOR COMPATIBILITY**
  getLegacyTasks() {
    return [
      {
        name: "Basic Login Test",
        description: `Navigate to https://qafromla.herokuapp.com/, 
                     analyze the page structure, 
                     click "Log In", 
                     fill email "papapin888@gmail.com", 
                     fill password "lalalend", 
                     click "Sign In", 
                     take final screenshot`
      },
      {
        name: "Registration Flow Test",
        description: `Go to https://qafromla.herokuapp.com/, 
                     find and click "Sign Up" or registration link, 
                     fill out registration form with test data, 
                     submit and verify registration process`
      },
      {
        name: "Article Creation Test",
        description: `Login to https://qafromla.herokuapp.com/ first, 
                     then find "New Article" or "Create Article" button, 
                     fill article title "Test Article", 
                     fill article content "This is a test article", 
                     publish the article, 
                     verify it appears in the feed`
      },
      {
        name: "Navigation Test",
        description: `Visit https://qafromla.herokuapp.com/, 
                     explore all main navigation items, 
                     take screenshots of each page, 
                     verify all links work properly`
      },
      {
        name: "Search Functionality Test",
        description: `Go to https://qafromla.herokuapp.com/, 
                     find search functionality, 
                     search for "test", 
                     verify search results appear, 
                     test different search terms`
      },
      {
        name: "Profile Management Test",
        description: `Login to https://qafromla.herokuapp.com/, 
                     navigate to user profile/settings, 
                     update profile information, 
                     save changes, 
                     verify updates are persisted`
      },
      {
        name: "Comment System Test",
        description: `Login to https://qafromla.herokuapp.com/, 
                     find an article, 
                     add a comment "This is a test comment", 
                     verify comment appears, 
                     test comment editing if available`
      },
      {
        name: "Responsive Design Test",
        description: `Visit https://qafromla.herokuapp.com/, 
                     test the site at different viewport sizes, 
                     verify mobile menu works, 
                     check touch interactions work properly`
      }
    ];
  }

  // 🆕 **NEW FILE-BASED METHODS**
  async runTestById(testId) {
    return await this.testManager.runTestById(testId);
  }

  async runTestsByTag(tag) {
    return await this.testManager.runTestsByTag(tag);
  }

  async runTestsByPriority(priority) {
    return await this.testManager.runTestsByPriority(priority);
  }

  async listAllTestFiles() {
    this.testManager.listAllTests();
  }

  async runSmokeTests() {
    return await this.testManager.runSmokeTests();
  }

  async runAuthTests() {
    return await this.testManager.runAuthTests();
  }

  async createNewTestFile(testData) {
    return await this.testManager.createNewTest(testData);
  }

  getTestSummary() {
    return this.testManager.getTestSummary();
  }
  }

  async runSingleTask(taskDescription, taskName = null) {
    return await this.framework.runTask(taskDescription, taskName);
  }

  async runPredefinedTask(index) {
    const tasks = this.getPreDefinedTasks();
    if (index < 0 || index >= tasks.length) {
      console.log("❌ Invalid task index");
      return;
    }
    
    const task = tasks[index];
    return await this.framework.runTask(task.description, task.name);
  }

  async runAllPredefinedTasks() {
    const tasks = this.getPreDefinedTasks();
    return await this.framework.runMultipleTasks(tasks);
  }

  async runCustomTask() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your task description: ', async (taskDescription) => {
        rl.question('Enter task name (optional): ', async (taskName) => {
          rl.close();
          
          if (taskDescription.trim()) {
            const result = await this.runSingleTask(taskDescription, taskName || null);
            resolve(result);
          } else {
            console.log("❌ No task description provided");
            resolve(null);
          }
        });
      });
    });
  }

  async runInteractiveMode() {
    console.log("\n🎯 **INTERACTIVE BROWSER TEST MODE**");
    console.log("═══════════════════════════════════");
    
    while (true) {
      console.log("\nOptions:");
      console.log("1. Run custom task");
      console.log("2. Run predefined task");
      console.log("3. Run all predefined tasks");
      console.log("4. List predefined tasks");
      console.log("5. Exit");
      
      const choice = await this.getUserInput("Choose option (1-5): ");
      
      switch (choice) {
        case '1':
          await this.runCustomTask();
          break;
        case '2':
          await this.selectAndRunPredefinedTask();
          break;
        case '3':
          await this.runAllPredefinedTasks();
          this.framework.generateReport();
          break;
        case '4':
          this.listPredefinedTasks();
          break;
        case '5':
          console.log("👋 Goodbye!");
          return;
        default:
          console.log("❌ Invalid option");
      }
    }
  }

  async selectAndRunPredefinedTask() {
    const tasks = this.getPreDefinedTasks();
    
    console.log("\n📋 Predefined Tasks:");
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.name}`);
    });
    
    const choice = await this.getUserInput(`\nSelect task (1-${tasks.length}): `);
    const index = parseInt(choice) - 1;
    
    if (index >= 0 && index < tasks.length) {
      await this.runPredefinedTask(index);
    } else {
      console.log("❌ Invalid task number");
    }
  }

  listPredefinedTasks() {
    const tasks = this.getPreDefinedTasks();
    
    console.log("\n📋 **AVAILABLE PREDEFINED TASKS**:");
    console.log("═══════════════════════════════════");
    
    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. **${task.name}**`);
      console.log(`   ${task.description.replace(/\s+/g, ' ').trim()}`);
    });
    console.log();
  }

  getUserInput(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  async close() {
    await this.framework.close();
  }

  generateReport() {
    return this.framework.generateReport();
  }
}

// 🚀 **QUICK USAGE EXAMPLES**

async function runSingleTaskExample() {
  const runner = new TaskRunner();
  await runner.initialize();
  
  try {
    // Run a single custom task
    const result = await runner.runSingleTask(
      `Go to https://google.com, search for "playwright testing", click first result, take screenshot`,
      "Google Search Test"
    );
    
    console.log("Task result:", result);
    runner.generateReport();
  } finally {
    await runner.close();
  }
}

async function runMultipleTasksExample() {
  const runner = new TaskRunner();
  await runner.initialize();
  
  try {
    // Run first 3 predefined tasks
    await runner.runPredefinedTask(0); // Login test
    await runner.runPredefinedTask(1); // Registration test
    await runner.runPredefinedTask(2); // Article creation test
    
    runner.generateReport();
  } finally {
    await runner.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    // Interactive mode
    const runner = new TaskRunner();
    await runner.initialize();
    try {
      await runner.runInteractiveMode();
    } finally {
      await runner.close();
    }
  } else if (args.includes('--all')) {
    // Run all predefined tasks
    const runner = new TaskRunner();
    await runner.initialize();
    try {
      await runner.runAllPredefinedTasks();
      runner.generateReport();
    } finally {
      await runner.close();
    }
  } else if (args.includes('--list')) {
    // List available tasks
    const runner = new TaskRunner();
    runner.listPredefinedTasks();
  } else {
    // Default: run interactive mode
    console.log("🎯 **BROWSER TEST TASK RUNNER**");
    console.log("═════════════════════════════");
    console.log("\nUsage:");
    console.log("  node task-runner.js --interactive  (or -i)  # Interactive mode");
    console.log("  node task-runner.js --all                   # Run all predefined tasks");
    console.log("  node task-runner.js --list                  # List available tasks");
    console.log("  node task-runner.js                         # Default: interactive mode");
    
    const runner = new TaskRunner();
    await runner.initialize();
    try {
      await runner.runInteractiveMode();
    } finally {
      await runner.close();
    }
  }
}

// Export for use in other files
export { TaskRunner };

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
