/**
 * Test Results Manager Module
 * Handles test result collection, storage, and processing
 */

import type { TestReport, TestSession } from '@/types/index';
import fs from 'fs';
import path from 'path';

export interface TestResultsManagerOptions {
  resultsDir?: string;
  recorderDir?: string;
  enableRecorderCopy?: boolean;
}

/**
 * Manages test results storage, processing, and report generation
 */
export class TestResultsManager {
  private testResults: any[] = [];
  private resultsDir: string;
  private recorderDir: string;
  private enableRecorderCopy: boolean;

  constructor(options: TestResultsManagerOptions = {}) {
    this.resultsDir = options.resultsDir || path.resolve('./test-results');
    this.recorderDir = options.recorderDir || path.resolve('./test-recorder-sessions');
    this.enableRecorderCopy = options.enableRecorderCopy || false;

    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  /**
   * Add a test result to the collection
   */
  addTestResult(result: any): void {
    this.testResults.push(result);
  }

  /**
   * Get all test results
   */
  getTestResults(): any[] {
    return [...this.testResults];
  }

  /**
   * Clear all test results
   */
  clearTestResults(): void {
    this.testResults = [];
  }

  /**
   * Process a completed test session
   */
  async processCompletedSession(session: TestSession): Promise<any> {
    // This would be called from saveTestSession in test-session.ts
    // Add to results collection
    this.addTestResult(session);

    // Copy to recorder if enabled
    if (this.enableRecorderCopy) {
      await this.copySessionToRecorder(session);
    }

    return session;
  }

  /**
   * Copy test session results to recorder directory
   */
  copySessionToRecorder(session: TestSession): void {
    try {
      const recorderSessionDir = path.join(this.recorderDir, session.sessionName);
      const recorderScreenshotsDir = path.join(recorderSessionDir, 'screenshots');

      // Create recorder directories
      fs.mkdirSync(recorderSessionDir, { recursive: true });
      fs.mkdirSync(recorderScreenshotsDir, { recursive: true });

      // Copy all files from session directory
      const sourceFiles = fs.readdirSync(session.sessionDir);
      for (const file of sourceFiles) {
        const sourcePath = path.join(session.sessionDir, file);
        const destPath = path.join(recorderSessionDir, file);

        if (fs.statSync(sourcePath).isDirectory()) {
          // Copy screenshots directory
          if (file === 'screenshots') {
            const screenshotFiles = fs.readdirSync(sourcePath);
            for (const screenshot of screenshotFiles) {
              const srcScreenshot = path.join(sourcePath, screenshot);
              const destScreenshot = path.join(recorderScreenshotsDir, screenshot);
              fs.copyFileSync(srcScreenshot, destScreenshot);
            }
          }
        } else {
          // Copy individual files
          fs.copyFileSync(sourcePath, destPath);
        }
      }

      console.log(`📼 Results recorded in: ${recorderSessionDir}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error copying results to recorder: ${message}`);
    }
  }

  /**
   * Generate a test report from collected results
   */
  generateReport(): TestReport {
    const passed = this.testResults.filter((r) => r.status === 'SUCCESS').length;
    const failed = this.testResults.filter((r) => r.status === 'FAILED').length;
    const total = this.testResults.length;

    const report: TestReport = {
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0%',
        generatedAt: new Date().toISOString(),
      },
      results: this.testResults.map((session) => ({
        testId: session.testId,
        name: session.sessionName,
        status: session.status === 'SUCCESS' ? 'passed' : 'failed',
        duration: session.duration || 0,
        error: session.error,
        screenshots:
          session.steps?.flatMap(
            (step: any) => step.screenshots?.map((s: any) => s.filename) || []
          ) || [],
        logs: session.steps?.map((step: any) => step.description) || [],
        timestamp: session.startTime,
      })),
    };

    return report;
  }

  /**
   * Generate and save a report to file
   */
  saveReport(filename?: string): string {
    const report = this.generateReport();
    const reportPath = path.join(this.resultsDir, filename || `report-${Date.now()}.json`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);

    return reportPath;
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    try {
      if (!fs.existsSync(this.resultsDir)) {
        fs.mkdirSync(this.resultsDir, { recursive: true });
      }
      if (this.enableRecorderCopy && !fs.existsSync(this.recorderDir)) {
        fs.mkdirSync(this.recorderDir, { recursive: true });
      }
    } catch (_error) {
      const message = _error instanceof Error ? _error.message : String(_error);
      console.warn(`Warning: Could not create directories: ${message}`);
    }
  }
}
