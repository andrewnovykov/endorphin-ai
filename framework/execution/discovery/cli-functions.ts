/**
 * CLI Functions for Test Discovery
 * Standalone functions for CLI usage with discovery caching
 */

import { resolve } from 'path';
import type { DiscoveryResult, FrameworkConfig, TestConfig } from '../../types/index.js';
import { TestRunner } from '../runner/test-runner.js';
import type { DiscoveredTest, TestExecutionOptions } from './discovery-types.js';
import { TestDiscoverer } from './test-discoverer.js';

// Standalone functions for CLI usage
let discoveryInstance: TestDiscoverer | null = null;

/**
 * Check if we're running in test environment
 */
function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Check if quarantined tests should be run
 */
function shouldRunQuarantined(): boolean {
  return process.env.ENDORPHIN_RUN_QUARANTINED === 'true';
}

/**
 * Check if a test is quarantined (has 'quarantined' tag)
 */
function isTestQuarantined(test: DiscoveredTest): boolean {
  return test.tags && test.tags.includes('quarantined');
}

/**
 * Safe exit that doesn't break tests
 */
function safeExit(code: number): never {
  if (isTestEnvironment()) {
    throw new Error(`process.exit called with code ${code}`);
  } else {
    process.exit(code);
  }
}

/**
 * Ensure discovery instance is created and tests are discovered
 */
async function ensureDiscovery(config: FrameworkConfig | null = null): Promise<TestDiscoverer> {
  const currentTestsDir = resolve(process.cwd(), config?.testsDirectory || 'tests');
  
  // Force new discovery if tests directory changed or in test environment
  if (!discoveryInstance || config || (isTestEnvironment() && discoveryInstance.testsDirectory !== currentTestsDir)) {
    const discoveryConfig = {
      testsDirectory: config?.testsDirectory || 'tests',
      enableTypeScript: true,
      maxConcurrency: 5,
    };

    discoveryInstance = new TestDiscoverer(discoveryConfig);
    discoveryInstance.testsDirectory = currentTestsDir;
    await discoveryInstance.discoverTests();
  }
  return discoveryInstance;
}

/**
 * Run a single test by ID
 */
export async function runSingleTestById(
  testId: string,
  config: FrameworkConfig | null = null
): Promise<DiscoveryResult> {
  const discovery = await ensureDiscovery(config);
  
  // Debug: Log discovery details in test environment
  if (isTestEnvironment()) {
    console.log(`[DEBUG] Looking for test: ${testId}`);
    console.log(`[DEBUG] Tests directory: ${discovery.testsDirectory}`);
    console.log(`[DEBUG] Found tests:`, discovery.getAllTests().map(t => t.id));
  }
  
  const test = discovery.getTest(testId);

  if (!test) {
    console.error(`❌ Test not found: ${testId}`);
    console.log('💡 Use "endorphin list" to see available tests');
    if (isTestEnvironment()) {
      return { success: false, message: `Test not found: ${testId}` };
    }
    safeExit(1);
  }

  // Check if test is quarantined
  if (isTestQuarantined(test) && !shouldRunQuarantined()) {
    console.log(`⚠️ Test ${testId} is quarantined and will be skipped`);
    console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
    if (isTestEnvironment()) {
      return { success: true, message: `Test ${testId} was skipped (quarantined)`, skipped: true };
    }
    return { success: true, message: `Test ${testId} was skipped (quarantined)`, skipped: true };
  }

  if (isTestEnvironment()) {
    return { success: true, test };
  }

  const runner = new TestRunner(config);
  return runner.runTests([test]);
}

/**
 * Run tests by tag
 */
export async function runTestsByTag(
  tag: string,
  config: FrameworkConfig | null = null,
  options: { parallel?: number } = {}
): Promise<DiscoveryResult> {
  const discovery = await ensureDiscovery(config);
  const allTests = discovery.getTestsByTag(tag);

  if (allTests.length === 0) {
    console.error(`❌ No tests found with tag: ${tag}`);
    console.log('💡 Use "endorphin list" to see available tests and tags');
    if (isTestEnvironment()) {
      return { success: false, message: `No tests found with tag: ${tag}` };
    }
    safeExit(1);
  }

  // Filter out quarantined tests unless explicitly enabled or searching for quarantined tag
  const testsToRun = allTests.filter((test) => {
    if (isTestQuarantined(test) && !shouldRunQuarantined() && tag !== 'quarantined') {
      console.log(`⚠️ Skipping quarantined test: ${test.id}`);
      return false;
    }
    return true;
  });

  if (testsToRun.length === 0) {
    console.log(`📝 All tests with tag "${tag}" are quarantined`);
    console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
    return { success: false, message: `All tests with tag '${tag}' are quarantined` };
  }

  console.log(`\n🎯 Found ${testsToRun.length} test(s) with tag: ${tag}`);
  testsToRun.forEach((test) => {
    console.log(`  📋 ${test.id}: ${test.name}`);
  });
  console.log('');

  if (isTestEnvironment()) {
    return { success: true, tests: testsToRun };
  }

  const runner = new TestRunner(config);
  const executionOptions: TestExecutionOptions = {
    parallel: (options.parallel || 1) > 1,
    workers: options.parallel || 1,
  };

  return runner.runTests(testsToRun, executionOptions);
}

/**
 * Run tests by priority
 */
export async function runTestsByPriority(
  priority: string,
  config: FrameworkConfig | null = null,
  options: { parallel?: number } = {}
): Promise<DiscoveryResult> {
  const discovery = await ensureDiscovery(config);
  const allTests = discovery.getTestsByPriority(priority);

  if (allTests.length === 0) {
    console.error(`❌ No tests found with priority: ${priority}`);
    console.log('💡 Available priorities: High, Medium, Low');
    if (isTestEnvironment()) {
      return { success: false, message: `No tests found with priority: ${priority}` };
    }
    safeExit(1);
  }

  // Filter out quarantined tests unless explicitly enabled
  const testsToRun = allTests.filter((test) => {
    if (isTestQuarantined(test) && !shouldRunQuarantined()) {
      console.log(`⚠️ Skipping quarantined test: ${test.id}`);
      return false;
    }
    return true;
  });

  if (testsToRun.length === 0) {
    console.log(`📝 All tests with priority "${priority}" are quarantined`);
    console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
    return { success: true, message: 'All tests were skipped (quarantined)' };
  }

  console.log(`\n🎯 Found ${testsToRun.length} test(s) with priority: ${priority}`);
  testsToRun.forEach((test) => {
    console.log(`  📋 ${test.id}: ${test.name}`);
  });
  console.log('');

  if (isTestEnvironment()) {
    return { success: true, tests: testsToRun };
  }

  const runner = new TestRunner(config);
  const executionOptions: TestExecutionOptions = {
    parallel: (options.parallel || 1) > 1,
    workers: options.parallel || 1,
  };

  return runner.runTests(testsToRun, executionOptions);
}

/**
 * Run all tests
 */
export async function runAllTests(
  config: FrameworkConfig | null = null,
  options: { parallel?: number } = {}
): Promise<DiscoveryResult> {
  const discovery = await ensureDiscovery(config);
  const allTests = discovery.getAllTests();

  if (allTests.length === 0) {
    console.error('❌ No tests found');
    if (isTestEnvironment()) {
      return { success: false, message: 'No tests found' };
    }
    safeExit(1);
  }

  // Filter out quarantined tests unless explicitly enabled
  const testsToRun = allTests.filter((test) => {
    if (isTestQuarantined(test) && !shouldRunQuarantined()) {
      console.log(`⚠️ Skipping quarantined test: ${test.id}`);
      return false;
    }
    return true;
  });

  if (testsToRun.length === 0) {
    console.log('📝 All tests are quarantined');
    console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
    return { success: false, message: 'All tests are quarantined' };
  }

  if (isTestEnvironment()) {
    return { success: true, tests: testsToRun };
  }

  const runner = new TestRunner(config);
  const executionOptions: TestExecutionOptions = {
    parallel: (options.parallel || 1) > 1,
    workers: options.parallel || 1,
  };

  return runner.runTests(testsToRun, executionOptions);
}

/**
 * List all available tests
 */
export async function listAllTests(
  config: FrameworkConfig | null = null
): Promise<DiscoveryResult> {
  const discovery = await ensureDiscovery(config);
  discovery.listTests();

  return {
    success: true,
    total: discovery.getAllTests().length,
    message: 'Tests listed successfully',
  };
}

/**
 * Discover tests and return them as TestConfig array
 */
export async function discoverTests(config: FrameworkConfig): Promise<TestConfig[]> {
  const discovery = await ensureDiscovery(config);
  return discovery.getAllTests().map((test) => {
    const config: TestConfig = {
      id: test.id,
      name: test.name,
      description: test.description,
      priority: test.priority,
      tags: test.tags,
      task: test.task,
    };

    // Only add optional properties if they exist
    if (test.url) config.url = test.url;
    if (test.site) config.site = test.site;
    if (test.testData) config.testData = test.testData;
    if (test.data) config.data = test.data;
    if (test.setup) config.setup = test.setup;

    return config;
  });
}

/**
 * Get discovery statistics
 */
export async function getDiscoveryStatistics(config: FrameworkConfig | null = null) {
  const discovery = await ensureDiscovery(config);
  return discovery.getStatistics();
}

/**
 * Clear discovery cache
 */
export function clearDiscoveryCache(): void {
  discoveryInstance = null;
}

/**
 * Get current discovery instance (for testing)
 */
export function getCurrentDiscoveryInstance(): TestDiscoverer | null {
  return discoveryInstance;
}
