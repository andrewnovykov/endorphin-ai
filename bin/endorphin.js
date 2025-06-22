#!/usr/bin/env node

/**
 * Endorphin AI CLI - E2E Testing Reinvented with AI
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { getConfig } from '../framework/core/config-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package info
const packagePath = join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));

const args = process.argv.slice(2);

// Parse CLI flags into configuration overrides
function parseCliFlags(args) {
  const flags = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--headless':
        flags.headless = true;
        break;
      case '--no-headless':
        flags.headless = false;
        break;
      case '--viewport':
        if (nextArg && nextArg.includes('x')) {
          const [width, height] = nextArg.split('x').map(Number);
          flags.viewport = { width, height };
          i++; // Skip next argument
        }
        break;
      case '--timeout':
        if (nextArg && !isNaN(nextArg)) {
          flags.timeout = parseInt(nextArg, 10);
          i++;
        }
        break;
      case '--parallel':
        if (nextArg && !isNaN(nextArg)) {
          flags.parallel = parseInt(nextArg, 10);
          i++;
        }
        break;
      case '--model':
        if (nextArg) {
          flags.model = nextArg;
          i++;
        }
        break;
      case '--env':
      case '--environment':
        if (nextArg) {
          flags.environment = nextArg;
          i++;
        }
        break;
      case '--base-url':
        if (nextArg) {
          flags.baseUrl = nextArg;
          i++;
        }
        break;
      case '--temperature':
        if (nextArg && !isNaN(nextArg)) {
          flags.temperature = parseFloat(nextArg);
          i++;
        }
        break;
      case '--retries':
        if (nextArg && !isNaN(nextArg)) {
          flags.maxRetries = parseInt(nextArg, 10);
          i++;
        }
        break;
      case '--tests-dir':
        if (nextArg) {
          flags.testsDirectory = nextArg;
          i++;
        }
        break;
      case '--data-dir':
        if (nextArg) {
          flags.dataDirectory = nextArg;
          i++;
        }
        break;
    }
  }
  
  return flags;
}

// Show help
function showHelp() {
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
  --model <name>         Set AI model to use (e.g., gpt-4o-mini)
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

// Main CLI handler
async function main() {
  try {
    if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
      showHelp();
      process.exit(0);
    }

    if (args.includes('--version') || args.includes('-v')) {
      console.log(`Endorphin AI v${packageInfo.version}`);
      process.exit(0);
    }

    // Load configuration with CLI flag overrides
    const cliFlags = parseCliFlags(args);
    const config = await getConfig({ cwd: process.cwd(), cliFlags });
    
    // Debug: show loaded config if --debug flag is present
    if (args.includes('--debug')) {
      console.log('🔧 Loaded configuration:', JSON.stringify(config, null, 2));
    }

    const command = args[0];
    const subcommand = args[1];
    const target = args[2];

    // Handle list command
    if (command === 'list') {
      console.log('📋 Available Tests:');
      const { listAllTests } = await import('../framework/core/test-discovery.js');
      await listAllTests(config);
      process.exit(0);
    }

    // Handle init command
    if (command === 'init') {
      console.log('🎯 Initializing Endorphin AI project...');
      const { initProject } = await import('../framework/core/init-command.js');
      await initProject(process.cwd());
      process.exit(0);
    }

    // Handle run commands
    if (command === 'run') {
      if (subcommand === 'test-recorder') {
        console.log('🎬 Starting Interactive Test Recorder...');
        const { runInteractiveRecorder } = await import('../framework/interactive/enhanced-interactive-recorder.js');
        await runInteractiveRecorder(config);
        process.exit(0);
      }

      if (subcommand === 'test') {
        // Check for flags
        if (args.includes('--tag')) {
          const tagIndex = args.indexOf('--tag');
          const tag = args[tagIndex + 1];
          if (!tag) {
            console.error('❌ Error: Please specify a tag value');
            process.exit(1);
          }
          console.log(`🏷️ Running tests with tag: ${tag}`);
          const { runTestsByTag } = await import('../framework/core/test-discovery.js');
          await runTestsByTag(tag, config);
          process.exit(0);
        }

        if (args.includes('--priority')) {
          const priorityIndex = args.indexOf('--priority');
          const priority = args[priorityIndex + 1];
          if (!priority) {
            console.error('❌ Error: Please specify a priority value');
            process.exit(1);
          }
          console.log(`🎯 Running tests with priority: ${priority}`);
          const { runTestsByPriority } = await import('../framework/core/test-discovery.js');
          await runTestsByPriority(priority, config);
          process.exit(0);
        }

        // Handle specific test or "all"
        if (target === 'all') {
          console.log('🚀 Running all tests...');
          const { runAllTests } = await import('../framework/core/test-discovery.js');
          await runAllTests(config);
          process.exit(0);
        } else if (target) {
          console.log(`🧪 Running test: ${target}`);
          const { runSingleTestById } = await import('../framework/core/test-discovery.js');
          await runSingleTestById(target, config);
          process.exit(0);
        } else {
          console.error('❌ Error: Please specify a test ID or "all" (e.g., endorphin run test QE-001)');
          process.exit(1);
        }
      }

      console.error(`❌ Unknown run command: ${subcommand}`);
      console.log('Use "endorphin help" for usage information');
      process.exit(1);
    }

    // Handle generate command
    if (command === 'generate') {
      if (subcommand === 'report') {
        console.log('📊 Generating HTML test report...');
        const { HTMLReporter } = await import('../framework/core/reporter.js');
        const reporter = new HTMLReporter();
        
        const options = {};
        
        // Parse additional flags for report generation
        if (args.includes('--summary')) {
          const reportPath = await reporter.generateSummaryReport(options);
          console.log(`✅ Summary report generated: ${reportPath}`);
        } else {
          // Check for custom filename
          const fileIndex = args.indexOf('--file');
          if (fileIndex !== -1 && args[fileIndex + 1]) {
            options.filename = args[fileIndex + 1];
          }
          
          const reportPath = await reporter.generateReport(options);
          console.log(`🌐 Open report: ${reportPath}`);
        }
        process.exit(0);
      }

      console.error(`❌ Unknown generate command: ${subcommand}`);
      console.log('Use "endorphin help" for usage information');
      process.exit(1);
    }

    // Handle open command
    if (command === 'open') {
      if (subcommand === 'report') {
        console.log('🌐 Opening latest test report...');
        const { HTMLReporter } = await import('../framework/core/reporter.js');
        const reporter = new HTMLReporter();
        
        // Check for specific report file
        const reportPath = target || null;
        await reporter.openReport(reportPath);
        process.exit(0);
      }

      console.error(`❌ Unknown open command: ${subcommand}`);
      console.log('Use "endorphin help" for usage information');
      process.exit(1);
    }

    // Handle cleanup command
    if (command === 'cleanup') {
      const { HTMLReporter } = await import('../framework/core/reporter.js');
      const reporter = new HTMLReporter();
      
      if (subcommand === 'results') {
        console.log('🧹 Cleaning up old test results...');
        const keepCount = parseInt(target) || 10;
        const cleanup = await reporter.cleanupResults(keepCount);
        console.log(`✅ Cleanup completed: ${cleanup.removedCount} directories removed`);
        process.exit(0);
      }
      
      if (subcommand === 'reports') {
        console.log('🧹 Cleaning up old report files...');
        const maxAge = parseInt(target) || 30;
        const cleanup = await reporter.cleanupOldReports(maxAge);
        console.log(`✅ Cleanup completed: ${cleanup.removedCount} report files removed`);
        process.exit(0);
      }

      console.error(`❌ Unknown cleanup command: ${subcommand}`);
      console.log('Available: cleanup results [count], cleanup reports [days]');
      process.exit(1);
    }

    console.error(`❌ Unknown command: ${command}`);
    console.log('Use "endorphin help" for usage information');
    process.exit(1);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Tip: Make sure to set your OPENAI_API_KEY in your .env file or environment variables');
    }
    
    process.exit(1);
  }
}

// Run CLI
main();
