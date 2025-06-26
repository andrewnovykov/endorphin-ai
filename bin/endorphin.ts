#!/usr/bin/env node

/**
 * Endorphin AI CLI - E2E Testing Reinvented with AI
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../framework/core/config-loader';
import {
  handleGenerateCommand,
  handleHelpAndVersion,
  handleInitCommand,
  handleListCommand,
  handleOpenCommand,
  handleTestCommand,
  handleTestRecorderCommand,
} from './cli-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package info
const packagePath = join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));

const args = process.argv.slice(2);

/**
 * Flag parsing utilities
 */
interface FlagResult {
  [key: string]: any;
  consumed?: number;
}

type FlagParser = (nextArg?: string) => FlagResult;

const FLAG_PARSERS: Record<string, FlagParser> = {
  '--headless': () => ({ headless: true }),
  '--no-headless': () => ({ headless: false }),
  '--viewport': (nextArg) => {
    if (nextArg && nextArg.includes('x')) {
      const [width, height] = nextArg.split('x').map(Number);
      return { viewport: { width, height }, consumed: 1 };
    }
    return {};
  },
  '--timeout': (nextArg) => {
    if (nextArg && !isNaN(Number(nextArg))) {
      return { timeout: parseInt(nextArg, 10), consumed: 1 };
    }
    return {};
  },
  '--parallel': (nextArg) => {
    if (nextArg && !isNaN(Number(nextArg))) {
      return { parallel: parseInt(nextArg, 10), consumed: 1 };
    }
    return {};
  },
  '--model': (nextArg) => {
    if (nextArg) {
      return { model: nextArg, consumed: 1 };
    }
    return {};
  },
  '--env': (nextArg) => {
    if (nextArg) {
      return { environment: nextArg, consumed: 1 };
    }
    return {};
  },
  '--environment': (nextArg) => {
    if (nextArg) {
      return { environment: nextArg, consumed: 1 };
    }
    return {};
  },
  '--base-url': (nextArg) => {
    if (nextArg) {
      return { baseUrl: nextArg, consumed: 1 };
    }
    return {};
  },
  '--temperature': (nextArg) => {
    if (nextArg && !isNaN(Number(nextArg))) {
      return { temperature: parseFloat(nextArg), consumed: 1 };
    }
    return {};
  },
  '--retries': (nextArg) => {
    if (nextArg && !isNaN(Number(nextArg))) {
      return { maxRetries: parseInt(nextArg, 10), consumed: 1 };
    }
    return {};
  },
  '--tests-dir': (nextArg) => {
    if (nextArg) {
      return { testsDirectory: nextArg, consumed: 1 };
    }
    return {};
  },
  '--data-dir': (nextArg) => {
    if (nextArg) {
      return { dataDirectory: nextArg, consumed: 1 };
    }
    return {};
  },
};

/**
 * Parse CLI flags into configuration overrides
 */
function parseCliFlags(args: string[]): Record<string, any> {
  const flags: Record<string, any> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    const parser = FLAG_PARSERS[arg];

    if (parser) {
      const result = parser(nextArg);
      Object.assign(flags, result);

      // Skip consumed arguments
      if (result.consumed) {
        i += result.consumed;
      }
    }
  }

  return flags;
}

/**
 * Show help
 */
function showHelp(): void {
  console.log(`
🎉 Endorphin AI v${packageInfo.version} - E2E Testing Reinvented with AI

Usage:
  endorphin <command> [options]

Commands:
  init                           Initialize new project with examples
  run test <test-id>             Run a specific test (e.g., QE-001)
  run test all                   Run all tests
  run test --tag <tag>           Run tests by tag (e.g., authentication)
  run test --priority <level>    Run tests by priority (High, Medium, Low)
  run test-recorder              Start interactive test recorder
  list                           List all available tests
  generate report                Generate HTML test report
  generate report --summary      Generate lightweight summary report
  open report [file]             Open latest (or specific) test report in browser
  cleanup results [count]        Clean up old test results (keep N per test, default: 10)
  cleanup reports [days]         Clean up old report files (older than N days, default: 30)
  help                           Show this help message

Options:
  --headless             Run browser in headless mode
  --no-headless          Run browser with visible UI
  --viewport <WxH>       Set browser viewport (e.g., 1920x1080)
  --timeout <ms>         Set test timeout in milliseconds
  --parallel <n>         Run tests in parallel (default: 1)
  --model <n>         Set AI model to use (e.g., gpt-4o-mini)
  --env <environment>    Set environment (development/staging/production)

Examples:
  endorphin init                               # Set up new project
  endorphin run test HEALTH-001                # Run example test
  endorphin run test all --headless            # Run all tests headless
  endorphin run test --tag smoke --parallel 3  # Run smoke tests in parallel
  endorphin run test --priority High --env staging # Run high priority tests on staging
  endorphin run test-recorder                  # Start test recorder
  endorphin list                               # Show all available tests
  endorphin generate report                    # Generate interactive HTML report
  endorphin generate report --summary          # Generate lightweight summary report
  endorphin generate report --file custom.html # Generate report with custom filename
  endorphin open report                        # Open latest report in browser
  endorphin cleanup results 5                  # Keep only 5 recent results per test
  endorphin cleanup reports 7                  # Remove reports older than 7 days

Configuration:
  Create endorphin.config.js in your project root for default settings
  CLI flags override configuration file settings
  Set OPENAI_API_KEY in your .env file or environment variables

Documentation: https://github.com/andrewnovykov/endorphin-ai#readme
`);
}

/**
 * Handle cleanup command
 */
async function handleCleanupCommand(subcommand: string, target?: string): Promise<void> {
  const { HtmlReporter } = await import('../framework/reporters/html-reporter.js');
  const reporter = new HtmlReporter();

  if (subcommand === 'results') {
    console.log('🧹 Cleaning up old test results...');
    const keepCount = parseInt(target || '10', 10);
    const cleanup = await reporter.cleanupResults(keepCount);
    console.log(`✅ Cleanup completed: ${cleanup.removedCount} directories removed`);
    process.exit(0);
  }

  if (subcommand === 'reports') {
    console.log('🧹 Cleaning up old report files...');
    const maxAge = parseInt(target || '30', 10);
    const cleanup = await reporter.cleanupOldReports(maxAge);
    console.log(`✅ Cleanup completed: ${cleanup.removedCount} report files removed`);
    process.exit(0);
  }

  console.error(`❌ Unknown cleanup command: ${subcommand}`);
  console.log('Available: cleanup results [count], cleanup reports [days]');
  process.exit(1);
}

/**
 * Main CLI handler
 */
export async function main(): Promise<void> {
  try {
    await handleHelpAndVersion(args, packageInfo, showHelp);

    const command = args[0];
    const subcommand = args[1];
    const target = args[2];

    // Display molecular structure for test commands
    if (command === 'run' && (subcommand === 'test' || subcommand === 'test-recorder')) {
      const { ConsoleReporter } = await import('../framework/reporters/console-reporter.js');
      const reporter = new ConsoleReporter();
      reporter.displayEndorphinMolecule();
    }

    // Load configuration
    const cliFlags = parseCliFlags(args);
    const config = await getConfig({ cwd: process.cwd(), cliFlags });

    if (args.includes('--debug')) {
      console.log('🔧 Loaded configuration:', JSON.stringify(config, null, 2));
    }

    // Route commands
    switch (command) {
      case 'list':
        await handleListCommand(config);
        break;
      case 'init':
        await handleInitCommand();
        break;
      case 'run':
        if (subcommand === 'test-recorder') {
          await handleTestRecorderCommand(config);
        } else if (subcommand === 'test') {
          await handleTestCommand(args, target, config);
        } else {
          console.error(`❌ Unknown run command: ${subcommand}`);
          console.log('Use "endorphin help" for usage information');
          process.exit(1);
        }
        break;
      case 'generate':
        await handleGenerateCommand(subcommand, args);
        break;
      case 'open':
        await handleOpenCommand(subcommand, target);
        break;
      case 'cleanup':
        await handleCleanupCommand(subcommand, target);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "endorphin help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error:', message);

    if (message.includes('OPENAI_API_KEY')) {
      console.log(
        '\n💡 Tip: Make sure to set your OPENAI_API_KEY in your .env file or environment variables'
      );
    }

    process.exit(1);
  }
}

// Run CLI when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
