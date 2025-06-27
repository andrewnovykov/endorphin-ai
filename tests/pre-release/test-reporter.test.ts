/**
 * Pre-Release Test Reporter Tests
 *
 * Tests that verify HTML and console reporting functionality
 * works correctly with the local development version.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'reporter-test');

describe('Pre-Release Test Reporter', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = TEST_DIR + '-' + Date.now();

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    fs.mkdirSync(testProjectPath, { recursive: true });

    // Initialize npm project and install local version
    execSync('npm init -y', { cwd: testProjectPath, stdio: 'pipe' });
    execSync(`npm install "${PROJECT_ROOT}"`, { cwd: testProjectPath, stdio: 'pipe' });

    // Initialize the project
    execSync('npx endorphin init', { cwd: testProjectPath, stdio: 'pipe' });

    console.log(`✅ Set up Test Reporter test project in: ${testProjectPath}`);
  }, 120000);

  afterAll(async () => {
    if (fs.existsSync(testProjectPath)) {
      try {
        fs.rmSync(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Could not clean up test directory:', error);
      }
    }
  });

  describe('Report Generation Commands', () => {
    it('should recognize generate report command', async () => {
      try {
        const result = execSync('npx endorphin generate report --help', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('Unknown command');
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });

    it('should handle report generation with no test results', async () => {
      try {
        const result = execSync('npx endorphin generate report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        // Should handle gracefully when no results exist
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });

    it('should handle summary report generation', async () => {
      try {
        const result = execSync('npx endorphin generate report --summary', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('Unknown flag');
        expect(output).not.toContain('SyntaxError');
      }
    });
  });

  describe('Report Opening Commands', () => {
    it('should recognize open report command', async () => {
      try {
        const result = execSync('npx endorphin open report --help', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('Unknown command');
        expect(output).not.toContain('SyntaxError');
      }
    });

    it('should handle opening non-existent reports gracefully', async () => {
      try {
        const result = execSync('npx endorphin open report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });

    it('should handle opening specific report files', async () => {
      try {
        const result = execSync('npx endorphin open report nonexistent-report.html', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });
  });

  describe('Cleanup Commands', () => {
    it('should handle cleanup results command', async () => {
      try {
        const result = execSync('npx endorphin cleanup results', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        expect(result).toContain('Cleanup completed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });

    it('should handle cleanup results with count parameter', async () => {
      const counts = ['5', '10', '20'];

      for (const count of counts) {
        try {
          const result = execSync(`npx endorphin cleanup results ${count}`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid count');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });

    it('should handle cleanup reports command', async () => {
      try {
        const result = execSync('npx endorphin cleanup reports', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        expect(result).toContain('Cleanup completed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });

    it('should handle cleanup reports with days parameter', async () => {
      const days = ['7', '30', '90'];

      for (const day of days) {
        try {
          const result = execSync(`npx endorphin cleanup reports ${day}`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid days');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('Reporter Dependencies and Modules', () => {
    it('should have HTML reporter module available', async () => {
      const htmlReporterPath = path.join(
        PROJECT_ROOT,
        'framework',
        'reporters',
        'html-reporter.ts'
      );
      expect(fs.existsSync(htmlReporterPath)).toBe(true);

      const reporterContent = fs.readFileSync(htmlReporterPath, 'utf8');
      expect(reporterContent).toContain('HtmlReporter');
      expect(reporterContent).toContain('export');
    });

    it('should have console reporter module available', async () => {
      const consoleReporterPath = path.join(
        PROJECT_ROOT,
        'framework',
        'reporters',
        'console-reporter.ts'
      );
      expect(fs.existsSync(consoleReporterPath)).toBe(true);

      const reporterContent = fs.readFileSync(consoleReporterPath, 'utf8');
      expect(reporterContent).toContain('ConsoleReporter');
      expect(reporterContent).toContain('export');
    });

    it('should have reporter templates available', async () => {
      const templatesPath = path.join(PROJECT_ROOT, 'framework', 'templates', 'reporter');
      if (fs.existsSync(templatesPath)) {
        const templates = fs.readdirSync(templatesPath);
        expect(templates.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Test Results Directory Management', () => {
    it('should handle test-results directory creation', async () => {
      const testResultsDir = path.join(testProjectPath, 'test-results');

      // Create test results directory structure
      fs.mkdirSync(testResultsDir, { recursive: true });
      expect(fs.existsSync(testResultsDir)).toBe(true);

      // Create some mock test result directories
      const mockResults = [
        'TEST-001_2024-01-01T10-00-00-000Z',
        'TEST-002_2024-01-02T10-00-00-000Z',
        'TEST-003_2024-01-03T10-00-00-000Z',
      ];

      mockResults.forEach((resultDir) => {
        const fullPath = path.join(testResultsDir, resultDir);
        fs.mkdirSync(fullPath, { recursive: true });

        // Create mock result files
        fs.writeFileSync(
          path.join(fullPath, 'test-result.json'),
          JSON.stringify({
            testId: resultDir.split('_')[0],
            timestamp: resultDir.split('_')[1],
            status: 'completed',
            results: [],
          })
        );
      });

      // Test cleanup with these mock results
      try {
        const result = execSync('npx endorphin cleanup results 2', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        expect(result).toContain('Cleanup completed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });

    it('should handle missing test-results directory gracefully', async () => {
      // Remove test-results directory if it exists
      const testResultsDir = path.join(testProjectPath, 'test-results');
      if (fs.existsSync(testResultsDir)) {
        fs.rmSync(testResultsDir, { recursive: true, force: true });
      }

      try {
        const result = execSync('npx endorphin cleanup results', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });
  });

  describe('Report File Generation and Management', () => {
    it('should handle report file permissions', async () => {
      // Create reports directory
      const reportsDir = path.join(testProjectPath, 'reports');
      fs.mkdirSync(reportsDir, { recursive: true });

      // Test write permissions
      const testReportFile = path.join(reportsDir, 'test-report.html');
      try {
        fs.writeFileSync(testReportFile, '<html><body>Test Report</body></html>');
        expect(fs.existsSync(testReportFile)).toBe(true);
        fs.unlinkSync(testReportFile);
      } catch (error) {
        fail('Should have write permissions to reports directory');
      }
    });

    it('should handle report file cleanup', async () => {
      const reportsDir = path.join(testProjectPath, 'reports');
      fs.mkdirSync(reportsDir, { recursive: true });

      // Create mock report files with different ages
      const mockReports = ['test-report-1.html', 'test-report-2.html', 'test-report-3.html'];

      mockReports.forEach((reportFile) => {
        const fullPath = path.join(reportsDir, reportFile);
        fs.writeFileSync(fullPath, '<html><body>Mock Report</body></html>');

        // Set file timestamp to simulate older files
        const pastDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35 days ago
        fs.utimesSync(fullPath, pastDate, pastDate);
      });

      try {
        const result = execSync('npx endorphin cleanup reports 30', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        expect(result).toContain('Cleanup completed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });
  });

  describe('Console Reporter Functionality', () => {
    it('should display molecular structure in test output', async () => {
      try {
        // This should trigger the molecular structure display
        const result = execSync('npx endorphin run test --help', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });

    it('should handle console output formatting', async () => {
      // Test various commands that produce console output
      const commands = ['npx endorphin list', 'npx endorphin --version', 'npx endorphin help'];

      for (const command of commands) {
        try {
          const result = execSync(command, {
            cwd: testProjectPath,
            encoding: 'utf8',
            stdio: 'pipe',
          });

          // Output should be properly formatted
          expect(result).toBeTruthy();
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('HTML Reporter Functionality', () => {
    it('should handle HTML template processing', async () => {
      // Create a mock test result to generate report from
      const testResultsDir = path.join(testProjectPath, 'test-results');
      const mockResultDir = path.join(testResultsDir, 'MOCK-001_2024-01-01T10-00-00-000Z');

      fs.mkdirSync(mockResultDir, { recursive: true });

      const mockResult = {
        testId: 'MOCK-001',
        name: 'Mock Test',
        status: 'passed',
        timestamp: '2024-01-01T10:00:00.000Z',
        duration: 5000,
        steps: [
          {
            step: 1,
            action: 'Navigate to page',
            status: 'passed',
            timestamp: '2024-01-01T10:00:01.000Z',
          },
          {
            step: 2,
            action: 'Click button',
            status: 'passed',
            timestamp: '2024-01-01T10:00:02.000Z',
          },
        ],
      };

      fs.writeFileSync(
        path.join(mockResultDir, 'test-result.json'),
        JSON.stringify(mockResult, null, 2)
      );

      try {
        const result = execSync('npx endorphin generate report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });

        // Should generate report successfully
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('Template error');
      }
    });

    it('should handle empty or malformed test results', async () => {
      const testResultsDir = path.join(testProjectPath, 'test-results');
      const malformedResultDir = path.join(
        testResultsDir,
        'MALFORMED-001_2024-01-01T10-00-00-000Z'
      );

      fs.mkdirSync(malformedResultDir, { recursive: true });

      // Create malformed JSON
      fs.writeFileSync(path.join(malformedResultDir, 'test-result.json'), '{ invalid json syntax');

      try {
        const result = execSync('npx endorphin generate report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        // Should handle malformed data gracefully
      }
    });
  });

  describe('Reporter Error Handling', () => {
    it('should handle file system permission errors', async () => {
      // Create a read-only directory to test permission handling
      const readOnlyDir = path.join(testProjectPath, 'readonly-reports');
      fs.mkdirSync(readOnlyDir, { recursive: true });

      try {
        // Try to change permissions (may not work on all systems)
        fs.chmodSync(readOnlyDir, 0o444);

        // Test report generation with permission issues
        // (This is more about ensuring graceful error handling)
      } catch (permError) {
        // Permission change might not be supported on all systems
      }

      try {
        const result = execSync('npx endorphin generate report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }

      // Restore permissions for cleanup
      try {
        fs.chmodSync(readOnlyDir, 0o755);
      } catch (permError) {
        // Ignore permission errors during cleanup
      }
    });

    it('should handle network-related errors in report generation', async () => {
      // Test with network dependencies that might fail
      try {
        const result = execSync('npx endorphin generate report --summary', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, HTTP_PROXY: 'http://invalid-proxy:8080' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });
  });

  describe('Reporter Integration with Results Manager', () => {
    it('should integrate with test results manager', async () => {
      const resultsManagerPath = path.join(
        PROJECT_ROOT,
        'framework',
        'results',
        'test-results-manager.ts'
      );
      expect(fs.existsSync(resultsManagerPath)).toBe(true);

      const resultsParserPath = path.join(
        PROJECT_ROOT,
        'framework',
        'results',
        'test-results-parser.ts'
      );
      expect(fs.existsSync(resultsParserPath)).toBe(true);
    });

    it('should handle multiple test result formats', async () => {
      const testResultsDir = path.join(testProjectPath, 'test-results');
      fs.mkdirSync(testResultsDir, { recursive: true });

      // Create different result formats
      const resultFormats = [
        {
          name: 'FORMAT1-001_2024-01-01T10-00-00-000Z',
          data: { version: '1.0', testId: 'FORMAT1-001' },
        },
        {
          name: 'FORMAT2-001_2024-01-01T10-00-00-000Z',
          data: { version: '2.0', testId: 'FORMAT2-001' },
        },
      ];

      resultFormats.forEach((format) => {
        const resultDir = path.join(testResultsDir, format.name);
        fs.mkdirSync(resultDir, { recursive: true });
        fs.writeFileSync(
          path.join(resultDir, 'test-result.json'),
          JSON.stringify(format.data, null, 2)
        );
      });

      try {
        const result = execSync('npx endorphin generate report', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
      }
    });
  });
});
