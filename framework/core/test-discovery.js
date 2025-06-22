// Test Discovery Module
// Discovers and loads tests from user's tests/ directory

import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Check if we're running in test environment
 */
function isTestEnvironment() {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

/**
 * Safe exit that doesn't break tests
 */
function safeExit(code) {
  if (isTestEnvironment()) {
    throw new Error(`process.exit called with code ${code}`);
  } else {
    process.exit(code);
  }
}

export class TestDiscovery {
  constructor() {
    this.tests = new Map();
    this.testsDirectory = resolve(process.cwd(), 'tests');
  }

  /**
   * Discover and load all test files from tests/ directory
   */
  async discoverTests() {
    try {
      // Check if tests directory exists
      try {
        await stat(this.testsDirectory);
      } catch (error) {
        console.log(`📁 Tests directory not found: ${this.testsDirectory}`);
        console.log('💡 Create a "tests/" directory and add your test files there.');
        return;
      }

      console.log(`🔍 Discovering tests in: ${this.testsDirectory}`);
      
      const files = await readdir(this.testsDirectory);
      const testFiles = files.filter(file => 
        file.endsWith('.js') || file.endsWith('.mjs')
      );

      if (testFiles.length === 0) {
        console.log('📝 No test files found in tests/ directory');
        console.log('💡 Add .js or .mjs files with exported test objects');
        return;
      }

      console.log(`📋 Found ${testFiles.length} test file(s):`);
      
      for (const file of testFiles) {
        console.log(`   📄 ${file}`);
        await this.loadTestFile(file);
      }

      console.log(`✅ Loaded ${this.tests.size} test(s) total\n`);
      
    } catch (error) {
      console.error('❌ Error discovering tests:', error.message);
    }
  }

  /**
   * Load a specific test file and extract test objects
   */
  async loadTestFile(filename) {
    try {
      const filePath = join(this.testsDirectory, filename);
      const fileUrl = pathToFileURL(filePath).href;
      
      // Dynamic import with cache busting
      const module = await import(`${fileUrl}?t=${Date.now()}`);
      
      // Extract all exported test objects
      for (const [exportName, exportValue] of Object.entries(module)) {
        if (this.isValidTest(exportValue)) {
          this.tests.set(exportValue.id, {
            ...exportValue,
            sourceFile: filename,
            exportName
          });
          console.log(`   ✓ ${exportValue.id}: ${exportValue.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error.message);
    }
  }

  /**
   * Validate if an object is a valid test
   */
  isValidTest(obj) {
    return (
      obj && 
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      (typeof obj.task === 'string' || typeof obj.execute === 'function')
    );
  }

  /**
   * Get test by ID
   */
  getTest(id) {
    return this.tests.get(id);
  }

  /**
   * Get all tests
   */
  getAllTests() {
    return Array.from(this.tests.values());
  }

  /**
   * Get tests by tag
   */
  getTestsByTag(tag) {
    return this.getAllTests().filter(test => 
      test.tags && test.tags.includes(tag)
    );
  }

  /**
   * Get tests by priority
   */
  getTestsByPriority(priority) {
    return this.getAllTests().filter(test => 
      test.priority === priority
    );
  }

  /**
   * List all available tests
   */
  listTests() {
    const tests = this.getAllTests();
    
    if (tests.length === 0) {
      console.log('📝 No tests found');
      console.log('💡 Create test files in the tests/ directory');
      return;
    }

    console.log('\n📋 Available Tests:');
    console.log('══════════════════════════════════════');
    
    const grouped = {};
    tests.forEach(test => {
      const priority = test.priority || 'Unknown';
      if (!grouped[priority]) grouped[priority] = [];
      grouped[priority].push(test);
    });

    for (const [priority, priorityTests] of Object.entries(grouped)) {
      console.log(`\n🎯 ${priority} Priority:`);
      priorityTests.forEach(test => {
        const tags = test.tags ? `[${test.tags.join(', ')}]` : '';
        console.log(`  ${test.id}: ${test.name} ${tags}`);
        console.log(`    📄 File: ${test.sourceFile}`);
        if (test.description) {
          console.log(`    📝 ${test.description}`);
        }
      });
    }
    console.log('');
  }
}

// Standalone functions for CLI usage
let discoveryInstance = null;

async function ensureDiscovery(config = null) {
  if (!discoveryInstance || config) {
    discoveryInstance = new TestDiscovery();
    if (config?.execution?.testsDirectory) {
      discoveryInstance.testsDirectory = resolve(process.cwd(), config.execution.testsDirectory);
    }
    await discoveryInstance.discoverTests();
  }
  return discoveryInstance;
}

export async function runSingleTestById(testId, config = null) {
  const discovery = await ensureDiscovery(config);
  const test = discovery.getTest(testId);
  
  if (!test) {
    console.error(`❌ Test not found: ${testId}`);
    console.log('💡 Use "endorphin list" to see available tests');
    if (isTestEnvironment()) {
      return { success: false, message: `Test not found: ${testId}` };
    }
    safeExit(1);
  }
  
  if (isTestEnvironment()) {
    return { success: true, test };
  }

  console.log(`🧪 Running test: ${test.id} - ${test.name}`);
  
  const { EnhancedBrowserTestFramework } = await import('./browser-framework.js');
  const framework = new EnhancedBrowserTestFramework(config);
  
  try {
    await framework.initialize();
    const result = await framework.runSingleTest(test);
    console.log(`✅ Test completed: ${result.status}`);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (isTestEnvironment()) {
      return { success: false, error: error.message };
    }
    safeExit(1);
  } finally {
    await framework.cleanup();
  }
}

export async function runTestsByTag(tag, config = null) {
  const discovery = await ensureDiscovery(config);
  const tests = discovery.getTestsByTag(tag);
  
  if (tests.length === 0) {
    console.error(`❌ No tests found with tag: ${tag}`);
    if (isTestEnvironment()) {
      return { success: false, message: `No tests found with tag: ${tag}` };
    }
    safeExit(1);
  }
  
  if (isTestEnvironment()) {
    return { success: true, tests };
  }

  console.log(`🏷️ Running ${tests.length} test(s) with tag: ${tag}`);
  
  const { EnhancedBrowserTestFramework } = await import('./browser-framework.js');
  const framework = new EnhancedBrowserTestFramework(config);
  
  try {
    await framework.initialize();
    
    const results = [];
    for (const test of tests) {
      console.log(`\n🧪 Running: ${test.id} - ${test.name}`);
      const result = await framework.runSingleTest(test);
      console.log(`✅ Result: ${result.status}`);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    if (isTestEnvironment()) {
      return { success: false, error: error.message };
    }
    safeExit(1);
  } finally {
    await framework.cleanup();
  }
}

export async function runTestsByPriority(priority, config = null) {
  const discovery = await ensureDiscovery(config);
  const tests = discovery.getTestsByPriority(priority);
  
  if (tests.length === 0) {
    console.error(`❌ No tests found with priority: ${priority}`);
    if (isTestEnvironment()) {
      return { success: false, message: `No tests found with priority: ${priority}` };
    }
    safeExit(1);
  }
  
  if (isTestEnvironment()) {
    return { success: true, tests };
  }

  console.log(`🎯 Running ${tests.length} test(s) with priority: ${priority}`);
  
  const { EnhancedBrowserTestFramework } = await import('./browser-framework.js');
  const framework = new EnhancedBrowserTestFramework(config);
  
  try {
    await framework.initialize();
    
    const results = [];
    for (const test of tests) {
      console.log(`\n🧪 Running: ${test.id} - ${test.name}`);
      const result = await framework.runSingleTest(test);
      console.log(`✅ Result: ${result.status}`);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    if (isTestEnvironment()) {
      return { success: false, error: error.message };
    }
    safeExit(1);
  } finally {
    await framework.cleanup();
  }
}

export async function runAllTests(config = null) {
  const discovery = await ensureDiscovery(config);
  const tests = discovery.getAllTests();
  
  if (tests.length === 0) {
    console.error('❌ No tests found');
    if (isTestEnvironment()) {
      return { success: false, message: 'No tests found' };
    }
    safeExit(1);
  }
  
  if (isTestEnvironment()) {
    return { success: true, tests };
  }

  console.log(`🚀 Running all ${tests.length} test(s)`);
  
  const { EnhancedBrowserTestFramework } = await import('./browser-framework.js');
  const framework = new EnhancedBrowserTestFramework(config);
  
  try {
    await framework.initialize();
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      console.log(`\n🧪 Running: ${test.id} - ${test.name}`);
      try {
        const result = await framework.runSingleTest(test);
        console.log(`✅ Result: ${result.status}`);
        passed++;
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed`);
    return { success: true, passed, failed, total: tests.length };
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    if (isTestEnvironment()) {
      return { success: false, error: error.message };
    }
    safeExit(1);
  } finally {
    await framework.cleanup();
  }
}

export async function listAllTests(config = null) {
  const discovery = await ensureDiscovery(config);
  const tests = discovery.getAllTests();
  
  if (isTestEnvironment()) {
    return { success: true, tests };
  }
  
  discovery.listTests();
}

/**
 * Discover tests and return them as an array
 * @param {Object} config - Configuration object
 * @returns {Array} Array of discovered tests
 */
export async function discoverTests(config) {
  const discovery = new TestDiscovery();
  if (config?.execution?.testsDirectory) {
    discovery.testsDirectory = resolve(process.cwd(), config.execution.testsDirectory);
  }
  
  try {
    await discovery.discoverTests();
    return Array.from(discovery.tests.values());
  } catch (error) {
    console.error('❌ Error discovering tests:', error.message);
    return [];
  }
}
