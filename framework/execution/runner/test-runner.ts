/**
 * Test Runner
 * Handles execution of discovered tests with parallel support
 */

import { performance } from 'perf_hooks';
import { ConsoleReporter } from '../../reporters/console-reporter.js';
import type { DiscoveryResult, FrameworkConfig } from '../../types/index.js';
import type { DiscoveredTest, TestExecutionOptions } from '../discovery/discovery-types.js';

/**
 * Check if we're running in test environment
 */
function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Check if a test is quarantined (has 'quarantined' tag)
 */
function isTestQuarantined(test: DiscoveredTest): boolean {
  return test.tags && test.tags.includes('quarantined');
}

/**
 * Check if quarantined tests should be run
 */
function shouldRunQuarantined(): boolean {
  return process.env.ENDORPHIN_RUN_QUARANTINED === 'true';
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
 * Test Runner class for executing tests
 */
export class TestRunner {
  private config: FrameworkConfig | null;
  private reporter: ConsoleReporter;

  constructor(config: FrameworkConfig | null = null) {
    this.config = config;
    this.reporter = new ConsoleReporter();
  }

  /**
   * Run a single test by ID
   */
  async runSingleTest(
    test: DiscoveredTest
  ): Promise<{ success: boolean; error?: string; session?: any }> {
    // Check if test is quarantined and should be skipped
    if (isTestQuarantined(test) && !shouldRunQuarantined()) {
      console.log(`⚠️ Skipping quarantined test: ${test.id}`);
      return { success: false, error: 'Test is quarantined' };
    }

    const { EnhancedBrowserTestFramework } = await import('../../automation/browser/browser-framework.js');
    const framework = new EnhancedBrowserTestFramework(this.config || undefined);

    try {
      await framework.initialize();
      const result = await framework.runSingleTest(test);
      return result;
    } finally {
      await framework.cleanup();
    }
  }

  /**
   * Run multiple tests sequentially
   */
  async runTestsSequentially(tests: DiscoveredTest[]): Promise<DiscoveryResult> {
    this.reporter.startSession();

    console.log(`🚀 Running ${tests.length} tests sequentially...`);

    const results: Array<{
      test: DiscoveredTest;
      success: boolean;
      duration: number;
      error?: string;
    }> = [];
    const { EnhancedBrowserTestFramework } = await import('../../automation/browser/browser-framework.js');
    const framework = new EnhancedBrowserTestFramework(this.config || undefined);

    try {
      await framework.initialize();

      for (const test of tests) {
        // Skip quarantined tests unless explicitly enabled
        if (isTestQuarantined(test) && !shouldRunQuarantined()) {
          console.log(`⚠️ Skipping quarantined test: ${test.id}`);
          continue;
        }

        const startTime = performance.now();
        this.reporter.startTest(test.id, test.name);

        try {
          const result = await framework.runSingleTest(test);
          const duration = Math.round(performance.now() - startTime);
          const status = result.success ? 'SUCCESS' : 'FAILED';

          this.reporter.completeTest(test.id, test.name, status, duration, result.error);
          const testResult: any = { test, success: result.success, duration };
          if (result.error) testResult.error = result.error;
          results.push(testResult);
        } catch (error) {
          const duration = Math.round(performance.now() - startTime);
          const message = error instanceof Error ? error.message : String(error);
          this.reporter.completeTest(test.id, test.name, 'FAILED', duration, message);
          results.push({ test, success: false, duration, error: message });
        }
      }
    } finally {
      await framework.cleanup();
    }

    const summary = this.reporter.endSession();

    return {
      success: summary.success,
      passed: summary.passedTests,
      failed: summary.failedTests,
      total: summary.totalTests,
    };
  }

  /**
   * Run tests in parallel with worker threads
   */
  async runTestsInParallel(tests: DiscoveredTest[], workers: number = 2): Promise<DiscoveryResult> {
    this.reporter.startSession();

    console.log(`🚀 Running ${tests.length} tests with ${workers} parallel workers...`);

    // Filter out quarantined tests unless explicitly enabled
    const testsToRun = tests.filter((test) => {
      if (isTestQuarantined(test) && !shouldRunQuarantined()) {
        console.log(`⚠️ Skipping quarantined test: ${test.id}`);
        return false;
      }
      return true;
    });

    if (testsToRun.length === 0) {
      console.log('📝 No tests to run after filtering');
      const _summary = this.reporter.endSession();
      return {
        success: true,
        passed: 0,
        failed: 0,
        total: 0,
      };
    }

    // Set environment variable to reduce noise from browser framework
    process.env.ENDORPHIN_CONSOLE_REPORTER = 'true';

    const { EnhancedBrowserTestFramework } = await import('../../automation/browser/browser-framework.js');

    const results: Array<{
      test: DiscoveredTest;
      success: boolean;
      duration: number;
      error?: string;
    }> = [];
    const errors: string[] = [];

    // Split tests into chunks for workers
    const testChunks: DiscoveredTest[][] = [];
    const chunkSize = Math.ceil(testsToRun.length / workers);

    for (let i = 0; i < testsToRun.length; i += chunkSize) {
      testChunks.push(testsToRun.slice(i, i + chunkSize));
    }

    try {
      // Run test chunks in parallel
      const chunkPromises = testChunks.map(async (chunk, workerIndex) => {
        const framework = new EnhancedBrowserTestFramework(this.config || undefined);

        try {
          await framework.initialize();

          for (const test of chunk) {
            const startTime = performance.now();
            this.reporter.startTest(test.id, test.name);

            try {
              const result = await framework.runSingleTest(test);
              const duration = Math.round(performance.now() - startTime);
              const status = result.success ? 'SUCCESS' : 'FAILED';

              this.reporter.completeTest(test.id, test.name, status, duration, result.error);
              const testResult: any = { test, success: result.success, duration };
          if (result.error) testResult.error = result.error;
          results.push(testResult);
            } catch (error) {
              const duration = Math.round(performance.now() - startTime);
              const message = error instanceof Error ? error.message : String(error);
              this.reporter.completeTest(test.id, test.name, 'FAILED', duration, message);
              results.push({ test, success: false, duration, error: message });
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`Worker ${workerIndex + 1}: ${message}`);
        } finally {
          await framework.cleanup();
        }
      });

      await Promise.all(chunkPromises);

      const summary = this.reporter.endSession();

      if (errors.length > 0) {
        console.error('❌ Some workers encountered errors:');
        errors.forEach((error) => console.error(`  ${error}`));
      }

      return {
        success: summary.success,
        passed: summary.passedTests,
        failed: summary.failedTests,
        total: summary.totalTests,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Parallel test execution failed:', message);
      if (isTestEnvironment()) {
        return { success: false, error: message };
      }
      safeExit(1);
    } finally {
      // Clean up environment variable
      delete process.env.ENDORPHIN_CONSOLE_REPORTER;
    }
  }

  /**
   * Run tests with specified options
   */
  async runTests(
    tests: DiscoveredTest[],
    options: TestExecutionOptions = {}
  ): Promise<DiscoveryResult> {
    const { parallel = false, workers = 2, timeout = 30000, retries: _retries = 0 } = options;

    // Apply timeout if specified
    if (timeout && timeout > 0) {
      // Set timeout for framework (this would need to be implemented in the framework)
      if (this.config) {
        this.config.execution = {
          parallel: this.config.execution?.parallel || false,
          retries: this.config.execution?.retries || 0,
          ...this.config.execution,
          timeout, // Override with the new timeout value
        };
      }
    }

    if (parallel && workers > 1) {
      return await this.runTestsInParallel(tests, workers);
    } else {
      return await this.runTestsSequentially(tests);
    }
  }

  /**
   * Run tests by specific criteria
   */
  async runTestsByCriteria(
    allTests: DiscoveredTest[],
    criteria: {
      tags?: string[];
      priority?: string[];
      testIds?: string[];
      excludeTags?: string[];
      pattern?: string;
    },
    options: TestExecutionOptions = {}
  ): Promise<DiscoveryResult> {
    let filteredTests = allTests;

    // Filter by test IDs
    if (criteria.testIds && criteria.testIds.length > 0) {
      filteredTests = filteredTests.filter((test) => criteria.testIds!.includes(test.id));
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filteredTests = filteredTests.filter(
        (test) => test.tags && criteria.tags!.some((tag) => test.tags!.includes(tag))
      );
    }

    // Exclude by tags
    if (criteria.excludeTags && criteria.excludeTags.length > 0) {
      filteredTests = filteredTests.filter(
        (test) => !test.tags || !criteria.excludeTags!.some((tag) => test.tags!.includes(tag))
      );
    }

    // Filter by priority
    if (criteria.priority && criteria.priority.length > 0) {
      filteredTests = filteredTests.filter((test) => criteria.priority!.includes(test.priority));
    }

    // Filter by name/id pattern
    if (criteria.pattern) {
      const pattern = criteria.pattern.toLowerCase();
      filteredTests = filteredTests.filter(
        (test) =>
          test.id.toLowerCase().includes(pattern) || test.name.toLowerCase().includes(pattern)
      );
    }

    if (filteredTests.length === 0) {
      console.error('❌ No tests match the specified criteria');
      return { success: false, message: 'No tests match criteria' };
    }

    console.log(`\n🎯 Found ${filteredTests.length} test(s) matching criteria`);
    filteredTests.forEach((test) => {
      const tags = test.tags ? `[${test.tags.join(', ')}]` : '';
      console.log(`  📋 ${test.id}: ${test.name} ${tags}`);
    });
    console.log('');

    return await this.runTests(filteredTests, options);
  }

  /**
   * Get test execution statistics
   */
  getExecutionStatistics(
    results: Array<{ test: DiscoveredTest; success: boolean; duration: number; error?: string }>
  ): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
    averageDuration: number;
    successRate: number;
    failuresByTag: Record<string, number>;
    failuresByPriority: Record<string, number>;
  } {
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.success).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const failedResults = results.filter((r) => !r.success);
    const failuresByTag: Record<string, number> = {};
    const failuresByPriority: Record<string, number> = {};

    failedResults.forEach((result) => {
      // Count failures by tag
      if (result.test.tags) {
        result.test.tags.forEach((tag) => {
          failuresByTag[tag] = (failuresByTag[tag] || 0) + 1;
        });
      }

      // Count failures by priority
      const priority = result.test.priority || 'Unknown';
      failuresByPriority[priority] = (failuresByPriority[priority] || 0) + 1;
    });

    return {
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      averageDuration,
      successRate,
      failuresByTag,
      failuresByPriority,
    };
  }
}
