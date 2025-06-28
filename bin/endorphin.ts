#!/usr/bin/env node

/**
 * Endorphin AI CLI - E2E Testing Reinvented with AI
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../framework/core/config-loader.js';
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
const packagePath = join(__dirname, '..', '..', 'package.json');
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
    if (nextArg?.includes('x')) {
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
  list tools                     List all available tools (built-in + custom)
  create tool <name>             Create a new custom tool from template
  validate tools                 Validate custom tools configuration
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
  endorphin list tools                         # Show all available tools
  endorphin create tool my-api-tool            # Create custom tool from basic template
  endorphin create tool payment-ui --template ui # Create UI automation tool
  endorphin validate tools                     # Check custom tools configuration
  endorphin generate report                    # Generate interactive HTML report
  endorphin generate report --summary          # Generate lightweight summary report
  endorphin generate report --file custom.html # Generate report with custom filename
  endorphin open report                        # Open latest report in browser
  endorphin cleanup results 5                  # Keep only 5 recent results per test
  endorphin cleanup reports 7                  # Remove reports older than 7 days

Configuration:
  Create endorphin.config.ts in your project root for default settings
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
    const keepCount = parseInt(target ?? '10', 10);
    const cleanup = await reporter.cleanupResults(keepCount);
    console.log(`✅ Cleanup completed: ${cleanup.removedCount} directories removed`);
    process.exit(0);
  }

  if (subcommand === 'reports') {
    console.log('🧹 Cleaning up old report files...');
    const maxAge = parseInt(target ?? '30', 10);
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
    // Handle help and version first (these should always work)
    handleHelpAndVersion(args, packageInfo, showHelp);

    const command = args[0];
    const subcommand = args[1];
    const target = args[2];

    // Handle init command early (before config loading)
    if (command === 'init') {
      await handleInitCommand();
      return;
    }

    // Display molecular structure for test commands
    if (command === 'run' && (subcommand === 'test' || subcommand === 'test-recorder')) {
      const { ConsoleReporter } = await import('../framework/reporters/console-reporter.js');
      const reporter = new ConsoleReporter();
      reporter.displayEndorphinMolecule();
    }

    // Parse CLI flags
    const cliFlags = parseCliFlags(args);

    // Route commands
    switch (command) {
      case 'list': {
        // List command doesn't need AI validation
        const listConfig = await getConfig({ cwd: process.cwd(), cliFlags, validateAI: false });
        if (subcommand === 'tools') {
          const { handleListToolsCommand } = await import('../framework/cli/tool-commands.js');
          await handleListToolsCommand({ verbose: args.includes('--verbose') });
        } else {
          await handleListCommand(listConfig);
        }
        break;
      }
      case 'create': {
        if (subcommand === 'tool') {
          if (!target) {
            console.error('❌ Tool name is required');
            console.log('Usage: endorphin create tool <name> [--template basic|ui|api] [--path ./path]');
            process.exit(1);
          }
          const { handleCreateToolCommand } = await import('../framework/cli/tool-commands.js');
          const templateArg = args.find(arg => arg.startsWith('--template='))?.split('=')[1];
          const pathArg = args.find(arg => arg.startsWith('--path='))?.split('=')[1];
          const options: { template?: string; path?: string } = {};
          if (templateArg) options.template = templateArg;
          if (pathArg) options.path = pathArg;
          await handleCreateToolCommand(target, options);
        } else {
          console.error(`❌ Unknown create command: ${subcommand}`);
          console.log('Available: create tool <name>');
          process.exit(1);
        }
        break;
      }
      case 'validate': {
        if (subcommand === 'tools') {
          const { handleValidateToolsCommand } = await import('../framework/cli/tool-commands.js');
          await handleValidateToolsCommand();
        } else {
          console.error(`❌ Unknown validate command: ${subcommand}`);
          console.log('Available: validate tools');
          process.exit(1);
        }
        break;
      }
      case 'run': {
        // Run commands need full AI validation
        const runConfig = await getConfig({ cwd: process.cwd(), cliFlags });
        if (args.includes('--debug')) {
          console.log('🔧 Loaded configuration:', JSON.stringify(runConfig, null, 2));
        }
        if (subcommand === 'test-recorder') {
          await handleTestRecorderCommand(runConfig);
        } else if (subcommand === 'test') {
          await handleTestCommand(args, target, runConfig);
        } else {
          console.error(`❌ Unknown run command: ${subcommand}`);
          console.log('Use "endorphin help" for usage information');
          process.exit(1);
        }
        break;
      }
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
// This works for both direct execution and npm package execution
const isMainModule = () => {
  // Check if this is the main module being executed
  try {
    // For ES modules, check if the current file matches the entry point
    const currentFile = fileURLToPath(import.meta.url);
    const entryFile = process.argv[1];
    
    // Handle both direct execution and symlinked npm binaries
    return currentFile === entryFile || 
           entryFile.includes('endorphin-ai') || 
           entryFile.includes('endorphin');
  } catch {
    return true; // Default to running if we can't determine
  }
};

if (isMainModule()) {
  main();
}
