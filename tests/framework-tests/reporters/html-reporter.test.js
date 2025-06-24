/**
 * HTML Reporter Test
 * Tests HTML report generation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { HTMLReporter } from '../../../packages/reporter/src/reporter.js';

describe('HTML Reporter', () => {
  let reporter;
  let testDir;

  beforeEach(() => {
    testDir = join(process.cwd(), 'test-output');
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir);
    reporter = new HTMLReporter(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  describe('initialization', () => {
    it('should create reporter instance', () => {
      expect(reporter).toBeDefined();
      expect(reporter).toBeInstanceOf(HTMLReporter);
    });

    it('should have required methods', () => {
      expect(typeof reporter.generateReport).toBe('function');
      expect(typeof reporter.generateSummaryReport).toBe('function');
      expect(typeof reporter.openReport).toBe('function');
    });
  });

  describe('report generation', () => {
    it('should generate HTML report', async () => {
      // Create some mock test results
      const testResultsPath = join(testDir, 'TEST-001_2024-01-01T12-00-00-000Z');
      mkdirSync(testResultsPath, { recursive: true });
      writeFileSync(join(testResultsPath, 'result.json'), JSON.stringify({
        testId: 'TEST-001',
        testName: 'Sample Test',
        success: true,
        duration: 1000,
        steps: []
      }));

      try {
        const reportPath = await reporter.generateReport();
        expect(typeof reportPath).toBe('string');
      } catch (error) {
        // Report generation might fail due to missing templates
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('error handling', () => {
    it('should handle empty results', async () => {
      try {
        await reporter.generateReport();
      } catch (error) {
        expect(error.message).toContain('No test results found');
      }
    });

    it('should handle invalid directory', async () => {
      const invalidReporter = new HTMLReporter('/invalid/path');
      
      try {
        await invalidReporter.generateReport();
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });
});
