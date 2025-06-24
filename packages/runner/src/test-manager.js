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



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 **TEST MANAGER** 
// Manages individual test files in the tests/ folder

class TestManager {
  constructor() {
    this.framework = null; // Don't initialize browser framework in test manager
    this.testsDir = path.join(__dirname, '../../tests');
    this.testFiles = [];
    this.loadedTests = new Map();
  }

  async loadTests() {
    try {
      await this.loadAllTests();
      return this.loadedTests;
    } catch (error) {
      console.error('❌ Error loading tests:', error);
      throw error;
    }
  }

  // 📁 **LOAD ALL TEST FILES**
  async loadAllTests() {
    try {
      const files = fs.readdirSync(this.testsDir);
      this.testFiles = files.filter(file => file.endsWith('.js') && file.startsWith('QE-'));
      
      // console.log(`📁 Found ${this.testFiles.length} test files in tests/ directory`);
      
      for (const file of this.testFiles) {
        await this.loadTestFile(file);
      }
      
      // console.log(`✅ Loaded ${this.loadedTests.size} test cases`);
    } catch (error) {
      console.error('❌ Error loading test files:', error);
    }
  }

  // 📄 **LOAD INDIVIDUAL TEST FILE**
  async loadTestFile(filename) {
    try {
      const filePath = path.join(this.testsDir, filename);
      const testModule = await import(`file://${filePath}`);
      
      // Handle both export default and export const formats
      let testCase = testModule.default;
      
      // If no default export, look for named exports starting with QE
      if (!testCase) {
        const exports = Object.keys(testModule);
        const qeExport = exports.find(key => key.startsWith('QE'));
        if (qeExport) {
          testCase = testModule[qeExport];
        }
      }
      
      if (testCase && testCase.id) {
        this.loadedTests.set(testCase.id, {
          ...testCase,
          filename: filename,
          filePath: filePath
        });
        console.log(`📝 Loaded test: ${testCase.id} - ${testCase.name}`);
      } else {
        console.warn(`⚠️ Invalid test file format: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error loading test file ${filename}:`, error);
    }
  }

  // 📋 **LIST ALL TESTS**
  listAllTests() {
    console.log("\n📋 **AVAILABLE TEST CASES**");
    console.log("═".repeat(50));
    
    const sortedTests = Array.from(this.loadedTests.values()).sort((a, b) => a.id.localeCompare(b.id));
    
    sortedTests.forEach(test => {
      console.log(`\n🔹 ${test.id}: ${test.name}`);
      console.log(`   📝 ${test.description}`);
      console.log(`   🎯 Priority: ${test.priority}`);
      console.log(`   🏷️  Tags: ${test.tags.join(', ')}`);
      if (test.prerequisites) {
        console.log(`   📋 Prerequisites: ${test.prerequisites.join(', ')}`);
      }
    });
    console.log();
  }

  // 🔍 **FIND TESTS BY CRITERIA**
  findTests(criteria = {}) {
    const allTests = Array.from(this.loadedTests.values());
    
    return allTests.filter(test => {
      // Filter by tag
      if (criteria.tag && !test.tags.includes(criteria.tag)) {
        return false;
      }
      
      // Filter by priority
      if (criteria.priority && test.priority !== criteria.priority) {
        return false;
      }
      
      // Filter by ID pattern
      if (criteria.idPattern && !test.id.match(criteria.idPattern)) {
        return false;
      }
      
      // Filter by name search
      if (criteria.nameSearch && !test.name.toLowerCase().includes(criteria.nameSearch.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  // 🏃 **RUN SINGLE TEST BY ID**
  async runTestById(testId) {
    const test = this.loadedTests.get(testId);
    if (!test) {
      console.log(`❌ Test ${testId} not found`);
      return null;
    }

    console.log(`\n🎯 Running Test: ${test.id} - ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log(`🎯 Priority: ${test.priority}`);
    console.log(`🏷️ Tags: ${test.tags.join(', ')}`);
    
    // Check prerequisites
    if (test.prerequisites) {
      console.log(`📋 Prerequisites: ${test.prerequisites.join(', ')}`);
      // Note: In a full implementation, you might want to check if prerequisites passed
    }
    
    return await this.framework.runTask(test.task, test.name);
  }

  // 🏃 **RUN MULTIPLE TESTS**
  async runTests(testIds) {
    const results = [];
    
    for (const testId of testIds) {
      const result = await this.runTestById(testId);
      if (result) {
        results.push(result);
      }
      
      // Add delay between tests
      if (testIds.indexOf(testId) < testIds.length - 1) {
        console.log("⏱️ Waiting 2 seconds before next test...\n");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  // 🏷️ **RUN TESTS BY TAG**
  async runTestsByTag(tag) {
    const tests = this.findTests({ tag });
    const testIds = tests.map(test => test.id);
    
    console.log(`\n🏷️ Running ${tests.length} tests with tag: ${tag}`);
    console.log(`Tests: ${testIds.join(', ')}`);
    
    return await this.runTests(testIds);
  }

  // 🎯 **RUN TESTS BY PRIORITY**
  async runTestsByPriority(priority) {
    const tests = this.findTests({ priority });
    const testIds = tests.map(test => test.id);
    
    console.log(`\n🎯 Running ${tests.length} tests with priority: ${priority}`);
    console.log(`Tests: ${testIds.join(', ')}`);
    
    return await this.runTests(testIds);
  }

  // 🔥 **RUN SMOKE TESTS**
  async runSmokeTests() {
    return await this.runTestsByTag('smoke');
  }

  // 🔐 **RUN AUTHENTICATION TESTS**
  async runAuthTests() {
    return await this.runTestsByTag('authentication');
  }

  // 🏃 **RUN ALL TESTS**
  async runAllTests() {
    const allTestIds = Array.from(this.loadedTests.keys()).sort();
    
    console.log(`\n🏃 Running ALL ${allTestIds.length} tests`);
    console.log(`Tests: ${allTestIds.join(', ')}`);
    
    return await this.runTests(allTestIds);
  }

  // 📊 **GENERATE TEST SUMMARY**
  getTestSummary() {
    const allTests = Array.from(this.loadedTests.values());
    
    const summary = {
      total: allTests.length,
      byPriority: {},
      byTag: {},
      files: this.testFiles.length
    };
    
    // Count by priority
    allTests.forEach(test => {
      summary.byPriority[test.priority] = (summary.byPriority[test.priority] || 0) + 1;
    });
    
    // Count by tags
    allTests.forEach(test => {
      test.tags.forEach(tag => {
        summary.byTag[tag] = (summary.byTag[tag] || 0) + 1;
      });
    });
    
    return summary;
  }

  // 📄 **CREATE NEW TEST FILE**
  async createNewTest(testData) {
    // Generate next QE number
    const existingNumbers = Array.from(this.loadedTests.keys())
      .map(id => parseInt(id.split('-')[1]))
      .sort((a, b) => a - b);
    
    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;
    
    const testId = `QE-${nextNumber.toString().padStart(3, '0')}`;
    const filename = `${testId}-${testData.name.toLowerCase().replace(/\s+/g, '-')}.js`;
    const filePath = path.join(this.testsDir, filename);
    
    const testContent = `// ${testId}: ${testData.name}
// Description: ${testData.description}
// Priority: ${testData.priority || 'Medium'}
// Tags: ${testData.tags ? testData.tags.join(', ') : 'general'}

export default {
  id: "${testId}",
  name: "${testData.name}",
  description: "${testData.description}",
  priority: "${testData.priority || 'Medium'}",
  tags: ${JSON.stringify(testData.tags || ['general'])},
  site: "${testData.site || 'https://qafromla.herokuapp.com/'}",
  ${testData.testData ? `testData: ${JSON.stringify(testData.testData, null, 2)},` : ''}
  ${testData.prerequisites ? `prerequisites: ${JSON.stringify(testData.prerequisites)},` : ''}
  task: \`${testData.task}\`
};`;

    fs.writeFileSync(filePath, testContent);
    console.log(`✅ Created new test file: ${filename}`);
    
    // Reload the test
    await this.loadTestFile(filename);
    
    return testId;
  }

  // 🔍 **GET METHODS**
  getTestById(testId) {
    return this.loadedTests.get(testId);
  }

  getTestsByTag(tag) {
    return Array.from(this.loadedTests.values()).filter(test => 
      test.tags && test.tags.includes(tag)
    );
  }

  getTestsByPriority(priority) {
    return Array.from(this.loadedTests.values()).filter(test => 
      test.priority && test.priority === priority
    );
  }

  getAllTests() {
    return Array.from(this.loadedTests.values());
  }

  listTests() {
    console.log('\n📋 Available Test Cases:');
    console.log('========================');
    for (const test of this.getAllTests()) {
      console.log(`${test.id}: ${test.name}`);
      console.log(`   📝 ${test.description}`);
      console.log(`   🎯 Priority: ${test.priority}`);
      console.log(`   🏷️  Tags: ${test.tags.join(', ')}`);
      console.log('');
    }
  }

  async close() {
    // No browser framework to close in test manager
  }

  generateReport() {
    // No framework to generate report from in test manager
    return null;
  }
}

export { TestManager };
