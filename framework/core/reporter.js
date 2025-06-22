import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TestResultsParser } from './test-results-parser.js';
import { ReportGenerator } from './report-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HTML Reporter for Endorphin AI test results
 * Generates interactive HTML reports from test-results data
 */
export class HTMLReporter {
  constructor(testResultsDir = './test-results') {
    this.testResultsDir = path.resolve(testResultsDir);
    this.reportsDir = path.join(this.testResultsDir, 'reports');
    this.templatesDir = path.join(__dirname, '..', 'templates');
    
    // Ensure reports directory exists - handle errors gracefully
    try {
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }
    } catch (error) {
      // If we can't create the directory, we'll handle it later when trying to generate reports
      console.warn(`Warning: Could not create reports directory: ${error.message}`);
    }
  }

  /**
   * Generate HTML report from all test results
   * @param {Object} options - Report generation options
   * @returns {string} Path to generated report
   */
  async generateReport(options = {}) {
    try {
      console.log('📊 Generating HTML test report...');
      
      // Parse test results
      const parser = new TestResultsParser(this.testResultsDir);
      const reportData = parser.generateReportData(options.resultDirs);
      
      if (reportData.results.length === 0) {
        throw new Error('No test results found. Run some tests first.');
      }
      
      // Generate report
      const generator = new ReportGenerator(this.templatesDir, this.reportsDir);
      const filename = options.filename || `report-${new Date().toISOString().split('T')[0]}.html`;
      const reportPath = await generator.generateReport(reportData, filename);
      
      console.log(`✅ Report generated: ${reportPath}`);
      console.log(`📈 Report includes ${reportData.totalRuns} test runs across ${reportData.totalTests} tests`);
      console.log(`🎯 Success rate: ${reportData.successRate}%`);
      
      return reportPath;
    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }

  /**
   * Generate a quick summary report (lightweight version)
   * @param {Object} options - Report generation options
   * @returns {string} Path to generated summary report
   */
  async generateSummaryReport(options = {}) {
    try {
      console.log('📋 Generating summary report...');
      
      const parser = new TestResultsParser(this.testResultsDir);
      const reportData = parser.generateReportData(options.resultDirs);
      
      if (reportData.results.length === 0) {
        throw new Error('No test results found. Run some tests first.');
      }
      
      const generator = new ReportGenerator(this.templatesDir, this.reportsDir);
      const reportPath = await generator.generateSummaryReport(reportData);
      
      console.log(`✅ Summary report generated: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Error generating summary report:', error.message);
      throw error;
    }
  }

  /**
   * Open the latest report in the default browser
   * @param {string} reportPath - Optional specific report path to open (can be filename or full path)
   * @returns {Promise<void>}
   */
  async openReport(reportPath = null) {
    try {
      let targetPath = reportPath;
      
      if (!targetPath) {
        // Find the most recent report
        const reportsFiles = fs.readdirSync(this.reportsDir)
          .filter(file => file.endsWith('.html'))
          .map(file => ({
            name: file,
            path: path.join(this.reportsDir, file),
            mtime: fs.statSync(path.join(this.reportsDir, file)).mtime
          }))
          .sort((a, b) => b.mtime - a.mtime);
        
        if (reportsFiles.length === 0) {
          throw new Error('No reports found. Generate a report first with: endorphin generate report');
        }
        
        targetPath = reportsFiles[0].path;
      } else {
        // If not an absolute path, treat as filename in reports directory
        if (!path.isAbsolute(targetPath)) {
          targetPath = path.join(this.reportsDir, targetPath);
        }
      }
      
      if (!fs.existsSync(targetPath)) {
        const filename = path.basename(targetPath);
        throw new Error(`Report file not found: ${filename}`);
      }
      
      console.log(`🌐 Opening report: ${targetPath}`);
      
      // Open in default browser based on platform
      const { execSync } = await import('child_process');
      const command = process.platform === 'darwin' 
        ? `open "${targetPath}"`
        : process.platform === 'win32'
        ? `start "${targetPath}"`
        : `xdg-open "${targetPath}"`;
      
      execSync(command);
      console.log('✅ Report opened in browser');
      
    } catch (error) {
      console.error('❌ Error opening report:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old test results before new run
   * @param {number} keepPerTest - Number of results to keep per test (default: 10)
   * @returns {Object} Cleanup summary
   */
  async cleanupResults(keepPerTest = 10) {
    try {
      console.log('🧹 Cleaning up old test results...');
      
      const parser = new TestResultsParser(this.testResultsDir);
      const cleanup = parser.cleanupOldResults(keepPerTest);
      
      if (cleanup.removedCount > 0) {
        console.log(`✅ Cleaned up ${cleanup.removedCount} old test result directories`);
        console.log(`📁 Keeping ${keepPerTest} most recent results per test`);
      } else {
        console.log('✨ No cleanup needed - all results are recent');
      }
      
      return cleanup;
    } catch (error) {
      console.warn('⚠️  Warning: Could not cleanup results:', error.message);
      return { removedCount: 0, removedDirs: [], totalTestIds: 0, keptPerTest: keepPerTest };
    }
  }

  /**
   * Clean up old report files
   * @param {number} maxAge - Maximum age in days (default: 30)
   * @returns {Object} Cleanup summary
   */
  async cleanupOldReports(maxAge = 30) {
    try {
      console.log('🧹 Cleaning up old report files...');
      
      const generator = new ReportGenerator(this.templatesDir, this.reportsDir);
      const cleanup = generator.cleanupOldReports(maxAge);
      
      if (cleanup.removedCount > 0) {
        console.log(`✅ Cleaned up ${cleanup.removedCount} old report files`);
      } else {
        console.log('✨ No old report files to clean up');
      }
      
      return cleanup;
    } catch (error) {
      console.warn('⚠️  Warning: Could not cleanup old reports:', error.message);
      return { removedCount: 0, removedFiles: [] };
    }
  }

  /**
   * Get report statistics
   * @returns {Object} Report statistics
   */
  getReportStats() {
    try {
      const parser = new TestResultsParser(this.testResultsDir);
      const reportData = parser.generateReportData();
      
      return {
        totalTests: reportData.totalTests,
        totalRuns: reportData.totalRuns,
        successfulRuns: reportData.successfulRuns,
        failedRuns: reportData.failedRuns,
        successRate: reportData.successRate,
        hasResults: reportData.results.length > 0
      };
    } catch (error) {
      return {
        totalTests: 0,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
        hasResults: false
      };
    }
  }

  /**
   * Check if report exists
   * @returns {boolean} True if any reports exist
   */
  reportExists() {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        return false;
      }
      
      const reportFiles = fs.readdirSync(this.reportsDir)
        .filter(file => file.endsWith('.html'));
      
      return reportFiles.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * List all available reports
   * @returns {Array} List of report files with metadata
   */
  listReports() {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        return [];
      }
      
      return fs.readdirSync(this.reportsDir)
        .filter(file => file.endsWith('.html'))
        .map(file => {
          const filePath = path.join(this.reportsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }
}
