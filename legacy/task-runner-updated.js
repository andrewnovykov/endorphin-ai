import { BrowserTestFramework } from './legacy/browser-test-framework.js';
import { TestManager } from './test-manager.js';
import readline from 'readline';
import * as dotenv from "dotenv";

dotenv.config();

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
      console.log("5. Run test by ID (e.g., QE-001)");
      console.log("6. Run tests by tag (e.g., authentication)");
      console.log("7. Run tests by priority (e.g., High)");
      console.log("8. Create new test file");
      console.log("9. Show test summary");
      console.log("0. Exit");
      
      const choice = await this.getUserInput("Choose option (0-9): ");
      
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
          await this.promptRunTestById();
          break;
        case '6':
          await this.promptRunTestsByTag();
          break;
        case '7':
          await this.promptRunTestsByPriority();
          break;
        case '8':
          await this.promptCreateNewTest();
          break;
        case '9':
          this.showTestSummary();
          break;
        case '0':
          console.log("👋 Goodbye!");
          return;
        default:
          console.log("❌ Invalid option");
      }
    }
  }

  async promptRunTestById() {
    const testId = await this.getUserInput("Enter test ID (e.g., QE-001): ");
    if (testId.trim()) {
      await this.runTestById(testId.trim().toUpperCase());
    }
  }

  async promptRunTestsByTag() {
    console.log("Available tags: authentication, login, registration, navigation, search, forms, etc.");
    const tag = await this.getUserInput("Enter tag: ");
    if (tag.trim()) {
      await this.runTestsByTag(tag.trim());
    }
  }

  async promptRunTestsByPriority() {
    console.log("Available priorities: High, Medium, Low");
    const priority = await this.getUserInput("Enter priority: ");
    if (priority.trim()) {
      await this.runTestsByPriority(priority.trim());
    }
  }

  async promptCreateNewTest() {
    console.log("\n📝 Creating new test file...");
    
    const name = await this.getUserInput("Test name: ");
    const description = await this.getUserInput("Description: ");
    const priority = await this.getUserInput("Priority (High/Medium/Low): ") || "Medium";
    const tagsInput = await this.getUserInput("Tags (comma-separated): ");
    const site = await this.getUserInput("Site URL: ") || "https://qafromla.herokuapp.com/";
    const task = await this.getUserInput("Task description: ");
    
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : ['general'];
    
    const testData = {
      name,
      description,
      priority,
      tags,
      site,
      task
    };
    
    const testId = await this.createNewTestFile(testData);
    console.log(`✅ Created new test: ${testId}`);
  }

  showTestSummary() {
    const summary = this.getTestSummary();
    
    console.log("\n📊 **TEST SUMMARY**");
    console.log("═".repeat(30));
    console.log(`📁 Total test files: ${summary.files}`);
    console.log(`🎯 Total test cases: ${summary.total}`);
    
    console.log("\n📈 By Priority:");
    Object.entries(summary.byPriority).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });
    
    console.log("\n🏷️ By Tag:");
    Object.entries(summary.byTag).forEach(([tag, count]) => {
      console.log(`   ${tag}: ${count}`);
    });
    console.log();
  }

  async selectAndRunPredefinedTask() {
    const tasks = this.getPreDefinedTasks();
    
    console.log("\n📋 Predefined Tasks:");
    tasks.forEach((task, index) => {
      const metadata = task.metadata;
      console.log(`${index + 1}. ${task.name} [${metadata.priority}] [${metadata.tags.join(', ')}]`);
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
    
    console.log("\n📋 **AVAILABLE TEST FILES**:");
    console.log("═".repeat(40));
    
    tasks.forEach((task, index) => {
      const metadata = task.metadata;
      console.log(`\n${index + 1}. **${task.name}**`);
      console.log(`   📝 ${metadata.id}`);
      console.log(`   🎯 Priority: ${metadata.priority}`);
      console.log(`   🏷️ Tags: ${metadata.tags.join(', ')}`);
      if (metadata.prerequisites) {
        console.log(`   📋 Prerequisites: ${metadata.prerequisites.join(', ')}`);
      }
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

// 🚀 **USAGE EXAMPLES WITH FILE-BASED TESTS**

async function runSingleTestExample() {
  const runner = new TaskRunner();
  await runner.initialize();
  
  try {
    // Run a specific test by ID
    const result = await runner.runTestById("QE-001");
    console.log("Test result:", result);
    runner.generateReport();
  } finally {
    await runner.close();
  }
}

async function runTagBasedTests() {
  const runner = new TaskRunner();
  await runner.initialize();
  
  try {
    // Run all authentication tests
    await runner.runAuthTests();
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
    // Run all test files
    const runner = new TaskRunner();
    await runner.initialize();
    try {
      await runner.runAllPredefinedTasks();
      runner.generateReport();
    } finally {
      await runner.close();
    }
  } else if (args.includes('--list')) {
    // List available test files
    const runner = new TaskRunner();
    await runner.initialize();
    runner.listPredefinedTasks();
    await runner.close();
  } else if (args.includes('--test')) {
    // Run specific test by ID
    const testIndex = args.indexOf('--test');
    const testId = args[testIndex + 1];
    if (testId) {
      const runner = new TaskRunner();
      await runner.initialize();
      try {
        await runner.runTestById(testId);
        runner.generateReport();
      } finally {
        await runner.close();
      }
    } else {
      console.log("❌ Please specify test ID (e.g., --test QE-001)");
    }
  } else if (args.includes('--tag')) {
    // Run tests by tag
    const tagIndex = args.indexOf('--tag');
    const tag = args[tagIndex + 1];
    if (tag) {
      const runner = new TaskRunner();
      await runner.initialize();
      try {
        await runner.runTestsByTag(tag);
        runner.generateReport();
      } finally {
        await runner.close();
      }
    } else {
      console.log("❌ Please specify tag (e.g., --tag authentication)");
    }
  } else {
    // Default: show usage and start interactive mode
    console.log("🎯 **ENHANCED BROWSER TEST TASK RUNNER**");
    console.log("═".repeat(45));
    console.log("\nUsage:");
    console.log("  node task-runner-updated.js --interactive  (or -i)  # Interactive mode");
    console.log("  node task-runner-updated.js --all                   # Run all test files");
    console.log("  node task-runner-updated.js --list                  # List test files");
    console.log("  node task-runner-updated.js --test QE-001           # Run specific test");
    console.log("  node task-runner-updated.js --tag authentication    # Run tests by tag");
    console.log("  node task-runner-updated.js                         # Default: interactive mode");
    
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
