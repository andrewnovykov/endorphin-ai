/**
 * ConsoleReporter - Real-time console output for test execution (TypeScript)
 * Provides colorful, formatted test results similar to popular test runners
 */

import { performance } from 'perf_hooks';

interface Colors {
  reset: string;
  bright: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  gray: string;
  bgRed: string;
  bgGreen: string;
  bgYellow: string;
}

interface Icons {
  success: string;
  failure: string;
  skipped: string;
  running: string;
  warning: string;
}

interface TestReportResult {
  testId: string;
  testName: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string | null;
}

interface SessionSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  success: boolean;
}

export class ConsoleReporter {
  private startTime: number | null = null;
  private results: TestReportResult[] = [];
  private currentTestId: string | null = null;
  private colors: Colors;
  private icons: Icons;

  constructor() {
    // Color codes for terminal output
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
    };

    // Icons for different states
    this.icons = {
      success: '✓',
      failure: '✗',
      skipped: '○',
      running: '●',
      warning: '⚠',
    };
  }

  /**
   * Start the test session
   */
  startSession(): void {
    this.startTime = performance.now();
    this.results = [];

    console.log(
      `${this.colors.cyan}${this.colors.bright}🧪 Running Endorphin AI Tests...${this.colors.reset}\n`
    );
  }

  /**
   * Display ASCII art of Endorphin molecular structure
   */
  displayEndorphinMolecule(): void {
    const purple = '\x1b[35m';
    const brightPurple = '\x1b[95m';
    const darkPurple = '\x1b[35m\x1b[2m';
    const magenta = '\x1b[35m\x1b[1m';

    console.log(`${brightPurple}
    ╔═══════════════════════════════════════════════════════════════╗
    ║${magenta}                          ENDORPHIN                            ${brightPurple}║
    ║${darkPurple}                      C₃₁H₃₉N₇O₉S                              ${brightPurple}║
    ╚═══════════════════════════════════════════════════════════════╝${this.colors.reset}`);

    console.log(`${purple}
         ${brightPurple}HO${purple}─┐     ┌─${brightPurple}NH₂${purple}                    ┌─${brightPurple}COOH${purple}
             │     │                       │
         ┌───${brightPurple}C${purple}═══${brightPurple}C${purple}─${brightPurple}C${purple}─${brightPurple}NH${purple}─${brightPurple}CO${purple}─${brightPurple}NH${purple}─${brightPurple}C${purple}─${brightPurple}CO${purple}─${brightPurple}NH${purple}─${brightPurple}C${purple}───${brightPurple}C${purple}─┘
         │   ║   ║   │           │     │   │
         │   ║   ║   │           │     │   └─${brightPurple}NH₂${purple}
    ${brightPurple}H₂N${purple}──${brightPurple}C${purple}───┘   ║   │           │     │
         │       ║   │           │     │
         │   ┌───┘   │           │     │
         │   │       │           │     │
         └─${brightPurple}C${purple}─┘   ┌─${brightPurple}C${purple}─┘       ┌─${brightPurple}C${purple}─┘ ┌─${brightPurple}C${purple}─┘
           ║     │           │     │
           ║ ┌─${brightPurple}C${purple}─┘       ┌─${brightPurple}C${purple}─┘ ┌─${brightPurple}C${purple}─┘
           ║ │           │     │
       ┌─${brightPurple}C${purple}─┘ │       ┌─${brightPurple}C${purple}─┘ ┌─${brightPurple}C${purple}─┘
       │     │       │     │
   ${brightPurple}H${purple}─${brightPurple}C${purple}─┘ ┌─${brightPurple}C${purple}─┘   ${brightPurple}H${purple}─${brightPurple}C${purple}─┘ ${brightPurple}H${purple}─${brightPurple}C${purple}─┘
     │   │         │     │
     │   │         │     │
    ${brightPurple}CH₃${purple}  │        ${brightPurple}CH₃${purple}   ${brightPurple}CH₃${purple}
         │
        ${brightPurple}CH₂${purple}
         │
        ${brightPurple}CH₃${this.colors.reset}`);

    console.log(`${darkPurple}
    ${magenta}♦${darkPurple} Endorphin: Natural opioid peptide neurotransmitter
    ${magenta}♦${darkPurple} Known for: Pain relief, pleasure, and reward pathways  
    ${magenta}♦${darkPurple} Testing with: AI-powered natural language automation${this.colors.reset}\n`);
  }

  /**
   * Report the start of a test
   */
  startTest(testId: string, testName: string): void {
    this.currentTestId = testId;
    process.stdout.write(
      `${this.colors.gray}${this.icons.running} ${testId}: ${testName}${this.colors.reset}`
    );
  }

  /**
   * Report test completion
   */
  completeTest(
    testId: string,
    testName: string,
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED',
    duration: number = 0,
    error: string | null = null
  ): void {
    // Clear the current line and move cursor to beginning
    process.stdout.write('\r\x1b[K');

    const result: TestReportResult = {
      testId,
      testName,
      status,
      duration,
      error,
    };
    this.results.push(result);

    // Format and display the result
    if (status === 'SUCCESS') {
      console.log(
        `${this.colors.green}     ${this.icons.success} ${testId}: ${testName}${this.colors.reset} ${this.colors.gray}(${duration}ms)${this.colors.reset}`
      );
    } else if (status === 'FAILED') {
      console.log(
        `${this.colors.red}     ${this.icons.failure} ${testId}: ${testName}${this.colors.reset} ${this.colors.gray}(${duration}ms)${this.colors.reset}`
      );
      if (error) {
        console.log(`${this.colors.red}       ${error}${this.colors.reset}`);
      }
    } else if (status === 'SKIPPED') {
      console.log(
        `${this.colors.yellow}     ${this.icons.skipped} ${testId}: ${testName}${this.colors.reset} ${this.colors.gray}(skipped)${this.colors.reset}`
      );
    }
  }

  /**
   * Report test failure with error details
   */
  reportError(testId: string, error: string): void {
    if (this.currentTestId === testId) {
      // Clear the current line
      process.stdout.write('\r\x1b[K');
    }
    console.log(
      `${this.colors.red}     ${this.icons.failure} ${testId}: Failed${this.colors.reset}`
    );
    console.log(`${this.colors.red}       ${error}${this.colors.reset}`);
  }

  /**
   * End the test session and display summary
   */
  endSession(): SessionSummary {
    const endTime = performance.now();
    const duration = Math.round(endTime - (this.startTime || 0));

    console.log(''); // Empty line

    // Calculate statistics
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.status === 'SUCCESS').length;
    const failedTests = this.results.filter((r) => r.status === 'FAILED').length;
    const skippedTests = this.results.filter((r) => r.status === 'SKIPPED').length;

    // Display summary with colors
    this.displaySummary(totalTests, passedTests, failedTests, skippedTests, duration);

    // Display detailed failure information if any
    this.displayFailureDetails();

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      duration,
      success: failedTests === 0,
    };
  }

  /**
   * Display the test summary in a formatted way
   */
  private displaySummary(
    totalTests: number,
    passedTests: number,
    failedTests: number,
    skippedTests: number,
    duration: number
  ): void {
    const hasFailures = failedTests > 0;

    // Test Files summary
    if (totalTests > 0) {
      console.log(
        `${this.colors.bright} Test Files  ${this.colors.green}${totalTests} passed${this.colors.reset}${this.colors.bright} (${totalTests})${this.colors.reset}`
      );
    }

    // Tests summary with conditional coloring
    let testsSummary = `${this.colors.bright}      Tests  `;

    if (passedTests > 0) {
      testsSummary += `${this.colors.green}${passedTests} passed${this.colors.reset}`;
    }

    if (failedTests > 0) {
      if (passedTests > 0) testsSummary += `${this.colors.bright}, `;
      testsSummary += `${this.colors.red}${failedTests} failed${this.colors.reset}`;
    }

    if (skippedTests > 0) {
      if (passedTests > 0 || failedTests > 0) testsSummary += `${this.colors.bright}, `;
      testsSummary += `${this.colors.yellow}${skippedTests} skipped${this.colors.reset}`;
    }

    testsSummary += `${this.colors.bright} (${totalTests})${this.colors.reset}`;
    console.log(testsSummary);

    // Timing information
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    console.log(`${this.colors.gray}   Start at  ${timeString}${this.colors.reset}`);
    console.log(
      `${this.colors.gray}   Duration  ${this.formatDuration(duration)}${this.colors.reset}`
    );

    // Overall result indicator
    if (hasFailures) {
      console.log(
        `\n${this.colors.bgRed}${this.colors.white}${this.colors.bright} FAILED ${this.colors.reset} ${this.colors.red}${failedTests} test${failedTests === 1 ? '' : 's'} failed${this.colors.reset}`
      );
    } else if (totalTests > 0) {
      console.log(
        `\n${this.colors.bgGreen}${this.colors.white}${this.colors.bright} PASSED ${this.colors.reset} ${this.colors.green}All tests passed!${this.colors.reset}`
      );
    }
  }

  /**
   * Display detailed failure information
   */
  private displayFailureDetails(): void {
    const failedTests = this.results.filter((r) => r.status === 'FAILED');

    if (failedTests.length > 0) {
      console.log(`\n${this.colors.red}${this.colors.bright}Failed Tests:${this.colors.reset}\n`);

      failedTests.forEach((test, index) => {
        console.log(
          `${this.colors.red}${this.colors.bright}${index + 1}. ${test.testId}: ${test.testName}${this.colors.reset}`
        );
        if (test.error) {
          console.log(`${this.colors.red}   ${test.error}${this.colors.reset}`);
        }
        console.log(''); // Empty line between failures
      });
    }
  }

  /**
   * Format duration in a human-readable way
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Report progress during test execution
   */
  reportProgress(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): void {
    switch (type) {
      case 'info':
        console.log(`${this.colors.blue}ℹ ${message}${this.colors.reset}`);
        break;
      case 'warning':
        console.log(`${this.colors.yellow}${this.icons.warning} ${message}${this.colors.reset}`);
        break;
      case 'error':
        console.log(`${this.colors.red}${this.icons.failure} ${message}${this.colors.reset}`);
        break;
      case 'success':
        console.log(`${this.colors.green}${this.icons.success} ${message}${this.colors.reset}`);
        break;
      default:
        console.log(`${this.colors.gray}${message}${this.colors.reset}`);
    }
  }

  /**
   * Clear the current line (useful for updating progress)
   */
  clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }

  /**
   * Check if we're in a CI environment (disable colors if needed)
   */
  static shouldUseColors(): boolean {
    // Check for CI environment variables that might indicate no color support
    if (process.env.CI && process.env.CI !== 'false') {
      return process.env.FORCE_COLOR !== 'false';
    }

    // Check if stdout is a TTY (terminal)
    return process.stdout.isTTY;
  }

  /**
   * Disable colors for CI/non-terminal environments
   */
  disableColors(): void {
    Object.keys(this.colors).forEach((key) => {
      (this.colors as any)[key] = '';
    });
  }
}

// Auto-detect color support
const consoleReporter = new ConsoleReporter();
if (!ConsoleReporter.shouldUseColors()) {
  consoleReporter.disableColors();
}

export default consoleReporter;
