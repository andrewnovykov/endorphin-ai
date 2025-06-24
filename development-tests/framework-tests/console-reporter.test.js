/**
 * Console Reporter Tests
 * Tests the console reporting functionality for colorful test output
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConsoleReporter } from '../../framework/core/console-reporter.js';

describe('Console Reporter', () => {
  let reporter;
  let mockStdout;

  beforeEach(() => {
    reporter = new ConsoleReporter();
    
    // Mock process.stdout.write to capture output
    mockStdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Management', () => {
    it('should start a test session', () => {
      reporter.startSession();
      
      expect(reporter.startTime).toBeDefined();
      expect(reporter.results).toEqual([]);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🧪 Running Endorphin AI Tests...')
      );
    });

    it('should start individual tests', () => {
      reporter.startTest('TEST-001', 'Sample Test');
      
      expect(reporter.currentTestId).toBe('TEST-001');
      expect(mockStdout).toHaveBeenCalledWith(
        expect.stringContaining('TEST-001: Sample Test')
      );
    });

    it('should complete tests with success', () => {
      reporter.completeTest('TEST-001', 'Sample Test', 'SUCCESS', 1500);
      
      expect(reporter.results).toHaveLength(1);
      expect(reporter.results[0]).toMatchObject({
        testId: 'TEST-001',
        testName: 'Sample Test',
        status: 'SUCCESS',
        duration: 1500
      });
    });

    it('should complete tests with failure', () => {
      reporter.completeTest('TEST-001', 'Sample Test', 'FAILED', 1500, 'Test failed');
      
      expect(reporter.results).toHaveLength(1);
      expect(reporter.results[0]).toMatchObject({
        testId: 'TEST-001',
        testName: 'Sample Test',
        status: 'FAILED',
        duration: 1500,
        error: 'Test failed'
      });
    });
  });

  describe('Summary Display', () => {
    it('should display summary with all passed tests', () => {
      reporter.displaySummary(3, 3, 0, 0, 5000);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('3 passed')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('PASSED')
      );
    });

    it('should display summary with failed tests', () => {
      reporter.displaySummary(3, 2, 1, 0, 5000);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('2 passed')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('1 failed')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('FAILED')
      );
    });

    it('should format duration correctly', () => {
      expect(reporter.formatDuration(500)).toBe('500ms');
      expect(reporter.formatDuration(1500)).toBe('1.5s');
      expect(reporter.formatDuration(65000)).toBe('1m 5.0s');
    });
  });

  describe('Color Support', () => {
    it('should detect color support correctly', () => {
      // Mock TTY environment
      const originalIsTTY = process.stdout.isTTY;
      process.stdout.isTTY = true;
      
      expect(ConsoleReporter.shouldUseColors()).toBe(true);
      
      // Restore original
      process.stdout.isTTY = originalIsTTY;
    });

    it('should disable colors when requested', () => {
      reporter.disableColors();
      
      // All color codes should be empty strings
      Object.values(reporter.colors).forEach(color => {
        expect(color).toBe('');
      });
    });
  });

  describe('Progress Reporting', () => {
    it('should report progress with different types', () => {
      reporter.reportProgress('Starting tests', 'info');
      reporter.reportProgress('Warning message', 'warning');
      reporter.reportProgress('Error occurred', 'error');
      reporter.reportProgress('Success message', 'success');
      
      expect(console.log).toHaveBeenCalledTimes(4);
    });
  });

  describe('End Session', () => {
    it('should end session and return summary', () => {
      reporter.startSession();
      
      // Add some test results
      reporter.completeTest('TEST-001', 'Test 1', 'SUCCESS', 1000);
      reporter.completeTest('TEST-002', 'Test 2', 'FAILED', 1500, 'Error');
      
      const summary = reporter.endSession();
      
      expect(summary).toMatchObject({
        totalTests: 2,
        passedTests: 1,
        failedTests: 1,
        skippedTests: 0,
        success: false
      });
      expect(summary.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Failure Details', () => {
    it('should display failure details', () => {
      reporter.results = [
        { testId: 'TEST-001', testName: 'Test 1', status: 'SUCCESS', duration: 1000 },
        { testId: 'TEST-002', testName: 'Test 2', status: 'FAILED', duration: 1500, error: 'Assertion failed' }
      ];
      
      reporter.displayFailureDetails();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Failed Tests:')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('TEST-002: Test 2')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Assertion failed')
      );
    });
  });
});
