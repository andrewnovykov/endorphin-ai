// Quick test listing script
import { TestManager } from './test-manager.js';

async function listTests() {
  console.log("📋 **AVAILABLE TEST FILES**");
  console.log("═".repeat(40));
  
  const manager = new TestManager();
  await manager.initialize(false); // Don't launch browser for listing
  
  const allTests = Array.from(manager.loadedTests.values()).sort((a, b) => a.id.localeCompare(b.id));
  
  allTests.forEach(test => {
    console.log(`\n🔹 ${test.id}: ${test.name}`);
    console.log(`   📝 ${test.description}`);
    console.log(`   🎯 Priority: ${test.priority}`);
    console.log(`   🏷️ Tags: ${test.tags.join(', ')}`);
    if (test.prerequisites) {
      console.log(`   📋 Prerequisites: ${test.prerequisites.join(', ')}`);
    }
    console.log(`   📄 File: ${test.filename}`);
  });
  
  const summary = manager.getTestSummary();
  console.log(`\n📊 **SUMMARY**`);
  console.log(`Total: ${summary.total} tests`);
  console.log(`By Priority: ${Object.entries(summary.byPriority).map(([p, c]) => `${p}(${c})`).join(', ')}`);
  console.log(`By Tags: ${Object.entries(summary.byTag).map(([t, c]) => `${t}(${c})`).join(', ')}`);
  console.log();
}

listTests().catch(console.error);
