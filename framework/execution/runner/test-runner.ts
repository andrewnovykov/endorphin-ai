/**
 * Test Runner
 * Handles execution of discovered tests with parallel support
 */

import { performance } from 'perf_hooks';
import { promises as fs } from 'fs';
import path from 'path';
import { ConsoleReporter } from '../../reporters/console-reporter.js';
import { DirectoryManager } from '../../utils/directory-manager.js';
import type { DiscoveryResult, FrameworkConfig, TaskResult, TestAttempt, EnhancedTestResult, PerformanceMetrics, TestSession } from '../../types/index.js';
import type { DiscoveredTest, TestExecutionOptions } from '../discovery/discovery-types.js';
import { runWithTestExecutionContext } from '../../utils/context-isolation.js';
import { PerformanceMonitor, runWithPerformanceMonitoring } from '../../utils/performance-monitor.js';
import { createTestSession, saveTestSession } from '../../core/test-session.js';


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
 * Check if a test is a multi-user test
 */
function isMultiUserTest(test: DiscoveredTest): boolean {
  return !!(test.users && Array.isArray(test.users) && test.users.length > 0 && test.tasks);
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

    // Clean up test results directory before single test run
    const resultBaseDir = this.config?.resultBaseDir || 'test-results';
    console.log('🧹 Cleaning up test results directory before single test...');
    await DirectoryManager.cleanupDirectories(resultBaseDir);

    // Check if this is a multi-user test
    if (isMultiUserTest(test)) {
      console.log(`🔄 Detected multi-user test: ${test.id}`);
      const { TestFramework } = await import('../../core/test-framework.js');
      const framework = new TestFramework(this.config || undefined);
      
      try {
        await framework.initialize();
        const result = await framework.runTest(test);
        const returnValue: { success: boolean; error?: string; session?: any } = {
          success: result.status === 'SUCCESS' || result.success === true
        };
        if (result.error) returnValue.error = result.error;
        if (result.report || result) returnValue.session = result.report || result;
        return returnValue;
      } finally {
        await framework.cleanup();
      }
    } else {
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
  }

  /**
   * Run multiple tests sequentially
   */
  async runTestsSequentially(tests: DiscoveredTest[]): Promise<DiscoveryResult> {
    this.reporter.startSession();

    // Clean up test results directory once before the entire test session
    const resultBaseDir = this.config?.resultBaseDir || 'test-results';
    console.log('🧹 Cleaning up test results directory before test session...');
    await DirectoryManager.cleanupDirectories(resultBaseDir);

    console.log(`🚀 Running ${tests.length} tests sequentially with fresh browser per test...`);

    const results: Array<{
      test: DiscoveredTest;
      success: boolean;
      duration: number;
      error?: string;
    }> = [];

    for (const test of tests) {
      // Skip quarantined tests unless explicitly enabled
      if (isTestQuarantined(test) && !shouldRunQuarantined()) {
        console.log(`⚠️ Skipping quarantined test: ${test.id}`);
        continue;
      }

      // Create a fresh framework instance for each test
      console.log(`🌟 Creating fresh browser instance for test: ${test.id}`);
      
      const startTime = performance.now();
      this.reporter.startTest(test.id, test.name);

      try {
        // Check if this is a multi-user test
        if (isMultiUserTest(test)) {
          console.log(`🔄 Detected multi-user test: ${test.id}`);
          const { TestFramework } = await import('../../core/test-framework.js');
          const framework = new TestFramework(this.config || undefined);
          
          await framework.initialize();
          
          // Add aggressive timeout for sequential execution to prevent blocking
          const testTimeout = 300000; // 5 minutes per test maximum
          
          const testPromise = framework.runTest(test);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Test '${test.id}' exceeded maximum execution time of ${testTimeout/1000} seconds in sequential execution`));
            }, testTimeout);
          });
          
          console.log(`⏱️ Starting test ${test.id} with ${testTimeout/1000}s timeout`);
          const result = await Promise.race([testPromise, timeoutPromise]) as TaskResult;
          
          const duration = Math.round(performance.now() - startTime);
          const success = result.status === 'SUCCESS' || result.success === true;
          const status = success ? 'SUCCESS' : 'FAILED';

          this.reporter.completeTest(test.id, test.name, status, duration, result.error);
          const testResult: any = { test, success, duration };
          if (result.error) testResult.error = result.error;
          results.push(testResult);
          
          console.log(`✅ Test ${test.id} completed in ${duration}ms`);
          
          // Cleanup multi-user test framework
          await framework.cleanup();
        } else {
          // Single-user test - use existing logic
          const { EnhancedBrowserTestFramework } = await import('../../automation/browser/browser-framework.js');
          const framework = new EnhancedBrowserTestFramework(this.config || undefined);
          
          await framework.initialize();
          
          // Add aggressive timeout for sequential execution to prevent blocking
          const testTimeout = 300000; // 5 minutes per test maximum
          
          const testPromise = framework.runSingleTest(test);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Test '${test.id}' exceeded maximum execution time of ${testTimeout/1000} seconds in sequential execution`));
            }, testTimeout);
          });
          
          console.log(`⏱️ Starting test ${test.id} with ${testTimeout/1000}s timeout`);
          const result = await Promise.race([testPromise, timeoutPromise]) as any;
          
          const duration = Math.round(performance.now() - startTime);
          const status = result.success ? 'SUCCESS' : 'FAILED';

          this.reporter.completeTest(test.id, test.name, status, duration, result.error);
          const testResult: any = { test, success: result.success, duration };
          if (result.error) testResult.error = result.error;
          results.push(testResult);
          
          console.log(`✅ Test ${test.id} completed in ${duration}ms`);
          
          // Cleanup single-user test framework
          await framework.cleanup();
        }
        
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const message = error instanceof Error ? error.message : String(error);
        
        console.log(`❌ Test ${test.id} failed after ${duration}ms: ${message}`);
        
        // If this was a timeout, add special handling
        if (message.includes('exceeded maximum execution time')) {
          console.log(`🚨 Test ${test.id} TIMED OUT - continuing with next test`);
          console.log(`🔧 Consider optimizing test ${test.id} or increasing timeout if needed`);
        }
        
        this.reporter.completeTest(test.id, test.name, 'FAILED', duration, message);
        results.push({ test, success: false, duration, error: message });
      }
      
      // Brief pause between tests for complete cleanup
      console.log(`⏸️ Waiting between tests for complete cleanup...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const summary = this.reporter.endSession();

    // Generate performance report if monitoring is enabled
    await this.generatePerformanceReport();

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

    // Clean up test results directory once before the entire parallel test session
    const resultBaseDir = this.config?.resultBaseDir || 'test-results';
    console.log('🧹 Cleaning up test results directory before parallel test session...');
    await DirectoryManager.cleanupDirectories(resultBaseDir);

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
        console.log(`🔀 Worker ${workerIndex + 1}: Processing ${chunk.length} tests with fresh browsers`);

        for (const test of chunk) {
          const startTime = performance.now();
          
          try {
            this.reporter.startTest(test.id, test.name);
            
            // Use same logic as sequential execution - check for multi-user tests
            if (isMultiUserTest(test)) {
              console.log(`🔄 Detected multi-user test: ${test.id}`);
              const { TestFramework } = await import('../../core/test-framework.js');
              const framework = new TestFramework(this.config || undefined);
              
              try {
                await framework.initialize();
                const result = await framework.runTest(test);
                const duration = Math.round(performance.now() - startTime);
                const status = result.success ? 'SUCCESS' : 'FAILED';

                this.reporter.completeTest(test.id, test.name, status, duration, result.error);
                const testResult: any = { test, success: result.success, duration };
                if (result.error) testResult.error = result.error;
                results.push(testResult);
              } finally {
                await framework.cleanup();
              }
            } else {
              // Single-user test - use enhanced browser framework
              const framework = new EnhancedBrowserTestFramework(this.config || undefined);
              
              try {
                await framework.initialize();
                const result = await framework.runSingleTest(test);
                const duration = Math.round(performance.now() - startTime);
                const status = result.success ? 'SUCCESS' : 'FAILED';

                this.reporter.completeTest(test.id, test.name, status, duration, result.error);
                const testResult: any = { test, success: result.success, duration };
                if (result.error) testResult.error = result.error;
                results.push(testResult);
              } finally {
                await framework.cleanup();
              }
            }
            
          } catch (error) {
            const duration = Math.round(performance.now() - startTime);
            const message = error instanceof Error ? error.message : String(error);
            this.reporter.completeTest(test.id, test.name, 'FAILED', duration, message);
            results.push({ test, success: false, duration, error: message });
            errors.push(`Worker ${workerIndex + 1}, Test ${test.id}: ${message}`);
          }
        }
      });

      await Promise.all(chunkPromises);

      const summary = this.reporter.endSession();

      if (errors.length > 0) {
        console.error('❌ Some workers encountered errors:');
        errors.forEach((error) => console.error(`  ${error}`));
      }

      // Generate performance report if monitoring is enabled
      await this.generatePerformanceReport();

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

  /**
   * Generate performance report if monitoring is enabled
   */
  private async generatePerformanceReport(): Promise<void> {
    try {
      // Check if performance monitoring is enabled
      if (process.env.ENDORPHIN_MEMORY_OPTIMIZER === 'true' || 
          process.env.ENDORPHIN_PERF_MONITORING === 'true') {
        const { ciPerformanceMonitor } = await import('../../core/ci-performance.js');
        await ciPerformanceMonitor.generateHtmlReport();
      }
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    }
  }
}
