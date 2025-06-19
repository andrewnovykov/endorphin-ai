#!/usr/bin/env node

// Quick demo of the enhanced framework with updated test format
import { TestManager } from './test-manager.js';

async function quickDemo() {
  console.log("🎯 Enhanced Browser Test Framework - Quick Demo");
  console.log("═".repeat(55));
  
  try {
    // Initialize test manager
    const testManager = new TestManager();
    const tests = await testManager.loadTests();
    
    console.log(`\n✅ Loaded ${tests.size} test cases successfully!`);
    
    // Show a sample of the new simplified format
    const qe001 = tests.get('QE-001');
    if (qe001) {
      console.log("\n📋 Sample Test Case (QE-001):");
      console.log("─".repeat(40));
      console.log(`Name: ${qe001.name}`);
      console.log(`Priority: ${qe001.priority}`);
      console.log(`Tags: ${qe001.tags.join(', ')}`);
      console.log(`Site: ${qe001.site}`);
      console.log(`UID: ${qe001.testData.uid}`);
      console.log(`Task: ${qe001.task.substring(0, 100)}...`);
    }
    
    // Show all available tests
    console.log("\n📋 All Available Tests:");
    console.log("─".repeat(40));
    Array.from(tests.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach(test => {
        const priority = test.priority === 'High' ? '🔴' : 
                        test.priority === 'Medium' ? '🟡' : '🟢';
        console.log(`${priority} ${test.id}: ${test.name}`);
      });
    
    console.log("\n🚀 Framework Features:");
    console.log("─".repeat(30));
    console.log("✅ Natural language test instructions");
    console.log("✅ Automatic screenshot capture");
    console.log("✅ Step-by-step execution logging");
    console.log("✅ Tool call history tracking");
    console.log("✅ Organized result storage");
    console.log("✅ Multiple export format support");
    
    console.log("\n🎯 Ready to run tests!");
    console.log("Usage examples:");
    console.log("  npm run enhanced:QE-001    # Run specific test");
    console.log("  npm run enhanced:auth      # Run by tag");
    console.log("  npm run enhanced:high      # Run by priority");
    console.log("  npm run enhanced:list      # List all tests");
    
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  }
}

quickDemo().catch(console.error);
