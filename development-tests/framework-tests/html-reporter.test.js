/**
 * HTML Reporter Tests
 * Tests the HTML report generation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { HTMLReporter } from '../../framework/core/reporter.js';
import { TestResultsParser } from '../../framework/core/test-results-parser.js';
import { ReportGenerator } from '../../framework/core/report-generator.js';

describe('HTML Reporter', () => {
  let tempDir;
  let testResultsDir;
  let reporter;

  beforeEach(async () => {
    // Create temporary test environment
    tempDir = await fs.mkdtemp(path.join(tmpdir(), 'endorphin-reporter-test-'));
    testResultsDir = path.join(tempDir, 'test-results');
    await fs.mkdir(testResultsDir, { recursive: true });
    
    reporter = new HTMLReporter(testResultsDir);
  });

  afterEach(async () => {
    // Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('HTMLReporter Class', () => {
    it('should initialize with correct paths', () => {
      expect(reporter.testResultsDir).toBe(testResultsDir);
      expect(reporter.reportsDir).toBe(path.join(testResultsDir, 'reports'));
      expect(reporter.templatesDir).toContain('templates');
    });

    it('should create reports directory if it does not exist', async () => {
      const reportsDir = path.join(testResultsDir, 'reports');
      const stats = await fs.stat(reportsDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should check if reports exist', () => {
      expect(reporter.reportExists()).toBe(false);
    });

    it('should list reports when none exist', () => {
      const reports = reporter.listReports();
      expect(reports).toEqual([]);
    });

    it('should get report stats with no data', () => {
      const stats = reporter.getReportStats();
      expect(stats.totalTests).toBe(0);
      expect(stats.totalRuns).toBe(0);
      expect(stats.hasResults).toBe(false);
    });
  });

  describe('TestResultsParser Class', () => {
    it('should initialize with test results directory', () => {
      const parser = new TestResultsParser(testResultsDir);
      expect(parser.testResultsDir).toBe(testResultsDir);
    });

    it('should return empty array when no test results exist', () => {
      const parser = new TestResultsParser(testResultsDir);
      const results = parser.getAllTestResults();
      expect(results).toEqual([]);
    });

    it('should generate empty report data when no results exist', () => {
      const parser = new TestResultsParser(testResultsDir);
      const reportData = parser.generateReportData();
      
      expect(reportData.totalTests).toBe(0);
      expect(reportData.totalRuns).toBe(0);
      expect(reportData.successfulRuns).toBe(0);
      expect(reportData.failedRuns).toBe(0);
      expect(reportData.successRate).toBe(0);
      expect(reportData.results).toEqual([]);
    });

    it('should parse test results when they exist', async () => {
      // Create mock test result
      const resultDir = 'TEST-001_2025-06-22T20-32-05-692Z';
      const resultPath = path.join(testResultsDir, resultDir);
      await fs.mkdir(resultPath, { recursive: true });
      
      const summary = {
        testName: "Sample Test",
        sessionId: "TEST-001",
        status: "SUCCESS",
        startTime: "2025-06-22T20:32:05.692Z",
        endTime: "2025-06-22T20:32:05.693Z",
        duration: 1,
        totalSteps: 2,
        successfulSteps: 2,
        failedSteps: 0,
        totalScreenshots: 0,
        finalResult: "Test completed successfully"
      };
      
      const session = {
        sessionId: "TEST-001",
        sessionName: resultDir,
        testName: "Sample Test",
        testId: "TEST-001",
        startTime: "2025-06-22T20:32:05.692Z",
        endTime: "2025-06-22T20:32:05.693Z",
        sessionDir: resultPath,
        screenshotsDir: path.join(resultPath, 'screenshots'),
        steps: [
          {
            stepNumber: 1,
            timestamp: "2025-06-22T20:32:05.692Z",
            description: "Starting test execution",
            status: "SUCCESS",
            result: "Test started",
            screenshots: []
          }
        ],
        status: "SUCCESS",
        finalResult: "Test completed successfully",
        duration: 1
      };
      
      await fs.writeFile(path.join(resultPath, 'summary.json'), JSON.stringify(summary, null, 2));
      await fs.writeFile(path.join(resultPath, 'test-session.json'), JSON.stringify(session, null, 2));
      await fs.mkdir(path.join(resultPath, 'screenshots'), { recursive: true });
      
      const parser = new TestResultsParser(testResultsDir);
      const results = parser.getAllTestResults();
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(resultDir);
      
      const parsed = parser.parseTestResult(resultDir);
      expect(parsed).toBeDefined();
      expect(parsed.summary.testName).toBe("Sample Test");
      expect(parsed.session.testId).toBe("TEST-001");
      
      const reportData = parser.generateReportData();
      expect(reportData.totalTests).toBe(1);
      expect(reportData.totalRuns).toBe(1);
      expect(reportData.successfulRuns).toBe(1);
      expect(reportData.successRate).toBe(100);
    });
  });

  describe('ReportGenerator Class', () => {
    it('should initialize with templates and output directories', async () => {
      const templatesDir = path.join(tempDir, 'templates');
      const outputDir = path.join(tempDir, 'output');
      
      await fs.mkdir(templatesDir, { recursive: true });
      
      const generator = new ReportGenerator(templatesDir, outputDir);
      expect(generator.templatesDir).toBe(templatesDir);
      expect(generator.outputDir).toBe(outputDir);
      
      // Should create output directory
      const stats = await fs.stat(outputDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should escape HTML properly', () => {
      const templatesDir = path.join(tempDir, 'templates');
      const outputDir = path.join(tempDir, 'output');
      const generator = new ReportGenerator(templatesDir, outputDir);
      
      expect(generator.escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(generator.escapeHtml('Normal text')).toBe('Normal text');
      expect(generator.escapeHtml('')).toBe('');
    });

    it('should generate test stats table HTML', () => {
      const templatesDir = path.join(tempDir, 'templates');
      const outputDir = path.join(tempDir, 'output');
      const generator = new ReportGenerator(templatesDir, outputDir);
      
      const testStats = [
        {
          testId: 'TEST-001',
          testName: 'Sample Test',
          totalRuns: 5,
          successfulRuns: 4,
          failedRuns: 1,
          lastRun: '2025-06-22T20:32:05.692Z',
          averageDuration: 1500
        }
      ];
      
      const html = generator.generateTestStatsTable(testStats);
      expect(html).toContain('TEST-001');
      expect(html).toContain('Sample Test');
      expect(html).toContain('badge bg-primary">5</span>'); // total runs
      expect(html).toContain('badge bg-success">4</span>'); // successful
      expect(html).toContain('badge bg-danger">1</span>'); // failed
    });

    it('should generate recent results table HTML', () => {
      const templatesDir = path.join(tempDir, 'templates');
      const outputDir = path.join(tempDir, 'output');
      const generator = new ReportGenerator(templatesDir, outputDir);
      
      const results = [
        {
          session: {
            testId: 'TEST-001',
            testName: 'Sample Test',
            status: 'SUCCESS',
            startTime: '2025-06-22T20:32:05.692Z',
            duration: 1500,
            steps: [{ stepNumber: 1 }]
          }
        }
      ];
      
      const html = generator.generateRecentResultsTable(results);
      expect(html).toContain('TEST-001');
      expect(html).toContain('Sample Test');
      expect(html).toContain('SUCCESS');
      expect(html).toContain('1500ms');
      expect(html).toContain('data-result-index="0"');
    });
  });

  describe('Integration Tests', () => {
    it('should fail to generate report when no test results exist', async () => {
      await expect(reporter.generateReport()).rejects.toThrow('No test results found');
    });

    it('should fail to generate summary report when no test results exist', async () => {
      await expect(reporter.generateSummaryReport()).rejects.toThrow('No test results found');
    });

    it('should fail to open report when no reports exist', async () => {
      await expect(reporter.openReport()).rejects.toThrow('No reports found');
    });

    it('should cleanup results with no results to clean', async () => {
      const cleanup = await reporter.cleanupResults();
      expect(cleanup.removedCount).toBe(0);
      expect(cleanup.totalTestIds).toBe(0);
    });

    it('should cleanup old reports with no reports to clean', async () => {
      const cleanup = await reporter.cleanupOldReports();
      expect(cleanup.removedCount).toBe(0);
      expect(cleanup.removedFiles).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid test results directory gracefully', () => {
      const invalidReporter = new HTMLReporter('/nonexistent/path');
      const stats = invalidReporter.getReportStats();
      expect(stats.hasResults).toBe(false);
      
      // Should not throw when creating the instance
      expect(invalidReporter.testResultsDir).toBe('/nonexistent/path');
    });

    it('should handle parsing errors gracefully', () => {
      const parser = new TestResultsParser('/nonexistent/path');
      const result = parser.parseTestResult('invalid-dir');
      expect(result).toBeNull();
    });

    it('should handle corrupted test result files', async () => {
      // Create corrupted result directory
      const resultDir = 'TEST-001_2025-06-22T20-32-05-692Z';
      const resultPath = path.join(testResultsDir, resultDir);
      await fs.mkdir(resultPath, { recursive: true });
      
      // Write invalid JSON
      await fs.writeFile(path.join(resultPath, 'summary.json'), '{ invalid json }');
      await fs.writeFile(path.join(resultPath, 'test-session.json'), '{ more invalid json }');
      
      const parser = new TestResultsParser(testResultsDir);
      const result = parser.parseTestResult(resultDir);
      expect(result).toBeNull();
    });
  });
});

describe('CLI Integration', () => {
  it('should export HTMLReporter for CLI use', async () => {
    const { HTMLReporter } = await import('../../framework/core/reporter.js');
    expect(HTMLReporter).toBeDefined();
    expect(typeof HTMLReporter).toBe('function');
  });

  it('should create reporter instance with default test-results path', () => {
    const reporter = new HTMLReporter();
    expect(reporter.testResultsDir).toContain('test-results');
  });
});
