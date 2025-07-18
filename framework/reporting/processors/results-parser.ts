/**
 * Results Parser
 * Handles collection and parsing of test results
 */

import fs from 'fs';
import path from 'path';

export interface ReportSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  totalDuration: number;
  timestamp: string;
}

export interface ParsedTestResult {
  sessionId: string;
  testName: string;
  testId: string;
  status: 'SUCCESS' | 'FAILED';
  duration: number;
  startTime: string;
  endTime?: string;
  finalResult?: string;
  conclusion?: string;
  steps: any[];
  agentHistory: any[];
  screenshots: string[];
  sessionDir: string;
  tokenSummary?: any;
  setupResult?: any;
  dataGenerationResult?: any;
  totalSteps?: number;
  successfulSteps?: number;
  // Enhanced fields for retry and flaky test support
  attempts?: any[];
  isFlaky?: boolean;
  isSkipped?: boolean;
  skipReason?: string;
  performanceMetrics?: any;
}

export interface ReportData {
  summary: ReportSummary;
  testResults: ParsedTestResult[];
  screenshots: Array<{
    filename: string;
    testName: string;
    sessionId: string;
  }>;
}

/**
 * Results Parser
 * Collects and parses test results from directories
 */
export class ResultsParser {
  private testResultsDir: string;

  constructor(testResultsDir: string) {
    this.testResultsDir = path.resolve(testResultsDir);
  }

  /**
   * Collect test results from specified directories or default directory
   */
  collectTestResults(resultDirs?: string[]): ReportData {
    const directories = resultDirs || this.getTestResultDirectories();
    const testResults: ParsedTestResult[] = [];
    const screenshots: Array<{ filename: string; testName: string; sessionId: string }> = [];

    for (const resultDir of directories) {
      const sessionFile = path.join(resultDir, 'test-session.json');
      const result = this.parseTestResult(sessionFile);

      if (result) {
        testResults.push(result);

        // Collect screenshots from this session
        const sessionScreenshots = this.collectScreenshots(
          resultDir,
          result.sessionId,
          result.testName
        );
        screenshots.push(...sessionScreenshots);
      }
    }

    // Aggregate test results by test ID to combine multiple attempts
    const aggregatedResults = this.aggregateTestResults(testResults);

    // Sort results by start time (newest first)
    aggregatedResults.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Calculate summary
    const summary = this.calculateSummary(aggregatedResults);

    return {
      summary,
      testResults: aggregatedResults,
      screenshots,
    };
  }

  /**
   * Get all test result directories
   */
  private getTestResultDirectories(): string[] {
    if (!fs.existsSync(this.testResultsDir)) {
      return [];
    }

    try {
      return fs
        .readdirSync(this.testResultsDir)
        .filter((name) => {
          try {
            const dirPath = path.join(this.testResultsDir, name);
            const stat = fs.statSync(dirPath);
            return stat.isDirectory() && name !== 'reports';
          } catch {
            return false;
          }
        })
        .map((name) => path.join(this.testResultsDir, name));
    } catch (error) {
      console.warn('Error reading test results directory:', error);
      return [];
    }
  }

  /**
   * Aggregate test results by test ID to combine multiple attempts
   */
  private aggregateTestResults(testResults: ParsedTestResult[]): ParsedTestResult[] {
    const aggregatedMap = new Map<string, ParsedTestResult>();
    
    for (const result of testResults) {
      const existingResult = aggregatedMap.get(result.testId);
      
      if (existingResult) {
        // Combine attempts for the same test
        const combinedResult = this.combineTestResults(existingResult, result);
        aggregatedMap.set(result.testId, combinedResult);
      } else {
        // First occurrence of this test
        aggregatedMap.set(result.testId, { ...result });
      }
    }
    
    return Array.from(aggregatedMap.values());
  }

  /**
   * Combine two test results for the same test ID
   */
  private combineTestResults(existing: ParsedTestResult, newResult: ParsedTestResult): ParsedTestResult {
    // Use the latest attempt's status as the final status
    const finalStatus = newResult.status === 'SUCCESS' ? 'SUCCESS' : 
                       existing.status === 'SUCCESS' ? 'SUCCESS' : 
                       newResult.status;
    
    // Combine attempts
    const existingAttempts = (existing as any).attempts || [];
    const newAttempts = (newResult as any).attempts || [];
    const allAttempts = [...existingAttempts, ...newAttempts];
    
    // Determine if test is flaky (passed after failing)
    const isFlaky = allAttempts.some((a: any) => a.status === 'failed') && 
                   allAttempts.some((a: any) => a.status === 'passed');
    
    // Use the latest result's timing and session info
    const combinedResult: ParsedTestResult = {
      ...existing,
      status: finalStatus,
      duration: newResult.duration, // Use latest duration
      sessionId: newResult.sessionId, // Use latest session ID
    };
    
    // Handle optional endTime property
    if (newResult.endTime) {
      combinedResult.endTime = newResult.endTime;
    } else if (existing.endTime) {
      combinedResult.endTime = existing.endTime;
    }
    
    // Add enhanced tracking data
    (combinedResult as any).attempts = allAttempts;
    (combinedResult as any).totalAttempts = allAttempts.length;
    (combinedResult as any).passedAttempts = allAttempts.filter((a: any) => a.status === 'passed').length;
    (combinedResult as any).failedAttempts = allAttempts.filter((a: any) => a.status === 'failed').length;
    (combinedResult as any).isFlaky = isFlaky;
    (combinedResult as any).isQuarantined = (existing as any).isQuarantined || (newResult as any).isQuarantined;
    
    return combinedResult;
  }

  /**
   * Parse a single test result from session file
   */
  private parseTestResult(sessionFile: string): ParsedTestResult | null {
    if (!fs.existsSync(sessionFile)) {
      return null;
    }

    try {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

      // Validate required fields
      if (!sessionData.sessionId || !sessionData.testName) {
        console.warn(`Invalid session data in ${sessionFile}`);
        return null;
      }

      return {
        sessionId: sessionData.sessionId,
        testName: sessionData.testName || sessionData.sessionName || 'Unknown Test',
        testId: sessionData.testId || sessionData.sessionId,
        status: sessionData.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        duration: sessionData.duration || 0,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        finalResult: sessionData.finalResult,
        conclusion: sessionData.conclusion,
        totalSteps: sessionData.totalSteps || sessionData.steps?.length || 0,
        successfulSteps: sessionData.successfulSteps || sessionData.steps?.filter((s: any) => s.status === 'SUCCESS').length || 0,
        steps: sessionData.steps || [],
        agentHistory: sessionData.agentHistory || [],
        screenshots: this.extractScreenshotPaths(sessionData.steps || []),
        sessionDir: path.dirname(sessionFile),
        tokenSummary: sessionData.tokenSummary,
        // Enhanced fields
        attempts: sessionData.attempts || [],
        isFlaky: sessionData.isFlaky || false,
        isSkipped: sessionData.isSkipped || sessionData.status === 'SKIPPED',
        skipReason: sessionData.skipReason || 'Not specified',
        performanceMetrics: sessionData.performanceMetrics || {},
      };
    } catch (error) {
      console.warn(`Error parsing session file ${sessionFile}:`, error);
      return null;
    }
  }

  /**
   * Extract screenshot paths from test steps
   */
  private extractScreenshotPaths(steps: any[]): string[] {
    const screenshots: string[] = [];

    for (const step of steps) {
      if (step.screenshots && Array.isArray(step.screenshots)) {
        for (const screenshot of step.screenshots) {
          if (typeof screenshot === 'string') {
            screenshots.push(screenshot);
          } else if (screenshot.filename) {
            screenshots.push(screenshot.filename);
          }
        }
      }
    }

    return screenshots;
  }

  /**
   * Collect screenshots from a session directory
   */
  private collectScreenshots(
    sessionDir: string,
    sessionId: string,
    testName: string
  ): Array<{
    filename: string;
    testName: string;
    sessionId: string;
  }> {
    const screenshotsDir = path.join(sessionDir, 'screenshots');
    const screenshots: Array<{ filename: string; testName: string; sessionId: string }> = [];

    if (!fs.existsSync(screenshotsDir)) {
      return screenshots;
    }

    try {
      const files = fs.readdirSync(screenshotsDir);

      for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
          screenshots.push({
            filename: file,
            testName,
            sessionId,
          });
        }
      }
    } catch (error) {
      console.warn(`Error reading screenshots directory ${screenshotsDir}:`, error);
    }

    return screenshots;
  }

  /**
   * Calculate summary statistics from test results
   */
  private calculateSummary(testResults: ParsedTestResult[]): ReportSummary {
    const totalTests = testResults.length;
    const passedTests = testResults.filter((result) => result.status === 'SUCCESS').length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDuration = testResults.reduce((sum, result) => sum + (result.duration || 0), 0);

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      totalDuration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get test statistics for analysis
   */
  getTestStatistics(testResults: ParsedTestResult[]): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    avgDuration: number;
    testsByStatus: Record<string, number>;
    recentTests: ParsedTestResult[];
    oldestTest?: string;
    newestTest?: string;
  } {
    const summary = this.calculateSummary(testResults);
    const avgDuration = testResults.length > 0 ? summary.totalDuration / testResults.length : 0;

    const testsByStatus = testResults.reduce(
      (acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sortedByTime = [...testResults].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const recentTests = testResults.slice(0, 10); // Most recent 10 tests

    return {
      totalTests: summary.totalTests,
      passedTests: summary.passedTests,
      failedTests: summary.failedTests,
      successRate: summary.successRate,
      avgDuration,
      testsByStatus,
      recentTests,
      oldestTest: sortedByTime[0]?.startTime,
      newestTest: sortedByTime[sortedByTime.length - 1]?.startTime,
    };
  }

  /**
   * Filter test results by criteria
   */
  filterResults(
    testResults: ParsedTestResult[],
    filters: {
      status?: 'SUCCESS' | 'FAILED';
      testName?: string;
      dateRange?: { start: string; end: string };
      minDuration?: number;
      maxDuration?: number;
    }
  ): ParsedTestResult[] {
    return testResults.filter((result) => {
      // Filter by status
      if (filters.status && result.status !== filters.status) {
        return false;
      }

      // Filter by test name (partial match)
      if (
        filters.testName &&
        !result.testName.toLowerCase().includes(filters.testName.toLowerCase())
      ) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        const resultDate = new Date(result.startTime);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);

        if (resultDate < startDate || resultDate > endDate) {
          return false;
        }
      }

      // Filter by duration
      if (filters.minDuration && result.duration < filters.minDuration) {
        return false;
      }

      if (filters.maxDuration && result.duration > filters.maxDuration) {
        return false;
      }

      return true;
    });
  }

  /**
   * Export results to different formats
   */
  exportResults(testResults: ParsedTestResult[], format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(testResults, null, 2);
    }

    if (format === 'csv') {
      const headers = ['Test ID', 'Test Name', 'Status', 'Duration (ms)', 'Start Time', 'End Time'];
      const rows = testResults.map((result) => [
        result.testId,
        result.testName,
        result.status,
        result.duration.toString(),
        result.startTime,
        result.endTime || '',
      ]);

      return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Create report data from test sessions (for testing)
   */
  createReportDataFromSessions(sessions: any[]): ReportData {
    const testResults: ParsedTestResult[] = sessions.map((session) => {
      // Handle setup result error serialization
      let setupResult = session.setupResult;
      if (setupResult && setupResult.error) {
        setupResult = {
          ...setupResult,
          error: this.serializeError(setupResult.error),
        };
      }

      // Handle data generation result error serialization
      let dataGenerationResult = session.dataGenerationResult;
      if (dataGenerationResult && dataGenerationResult.error) {
        dataGenerationResult = {
          ...dataGenerationResult,
          error: this.serializeError(dataGenerationResult.error),
        };
      }

      return {
        sessionId: session.sessionId || 'test-session',
        testName: session.testName || 'Test Session',
        testId: session.testId || 'TEST-001',
        status: session.status === 'completed' ? 'SUCCESS' : 'FAILED',
        duration: session.duration || 0,
        startTime: session.startTime || new Date().toISOString(),
        endTime: session.endTime,
        finalResult: session.status === 'completed' ? 'Test completed successfully' : 'Test failed',
        steps: session.steps || [],
        agentHistory: session.agentHistory || [],
        screenshots: [],
        sessionDir: 'test-session',
        tokenSummary: session.tokenSummary,
        setupResult,
        dataGenerationResult,
      };
    });

    const summary: ReportSummary = {
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.status === 'SUCCESS').length,
      failedTests: testResults.filter(r => r.status === 'FAILED').length,
      successRate: testResults.length > 0 ? (testResults.filter(r => r.status === 'SUCCESS').length / testResults.length) * 100 : 0,
      totalDuration: testResults.reduce((sum, r) => sum + r.duration, 0),
      timestamp: new Date().toISOString(),
    };

    return {
      summary,
      testResults,
      screenshots: [],
    };
  }

  /**
   * Serialize error objects for JSON output
   */
  private serializeError(error: any): any {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error as any), // Include any additional properties
      };
    }
    return error;
  }
}
