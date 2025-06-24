/**
 * Console Reporter Test
 * Tests console output formatting and reporting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConsoleReporter } from '../../../packages/reporter/src/console-reporter.js';

describe('ConsoleReporter', () => {
  let reporter;
  let consoleSpy;
  let stdoutSpy;

  beforeEach(() => {
    reporter = new ConsoleReporter();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  describe('initialization', () => {
    it('should create reporter instance', () => {
      expect(reporter).toBeDefined();
      expect(reporter).toBeInstanceOf(ConsoleReporter);
    });

    it('should have required methods', () => {
      expect(typeof reporter.startTest).toBe('function');
      expect(typeof reporter.completeTest).toBe('function');
      expect(typeof reporter.reportProgress).toBe('function');
      expect(typeof reporter.startSession).toBe('function');
      expect(typeof reporter.endSession).toBe('function');
    });
  });

  describe('test reporting', () => {
    it('should start test reporting', () => {
      reporter.startTest('TEST-001', 'Sample Test');
      expect(stdoutSpy).toHaveBeenCalled();
    });

    it('should complete test reporting', () => {
      reporter.completeTest('TEST-001', 'Sample Test', 'SUCCESS', 1000);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should report progress', () => {
      reporter.reportProgress('Test step completed', 'success');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle missing test data', () => {
      expect(() => reporter.startTest(null, null)).not.toThrow();
    });

    it('should handle error reporting', () => {
      expect(() => reporter.reportError('TEST-001', 'Test failed')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
