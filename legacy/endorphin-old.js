#!/usr/bin/env node

/**
 * Endorphin AI CLI - E2E Testing Reinvented with AI
 * Command line interface for browser automation testing
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package info
const packagePath = join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));

const args = process.argv.slice(2);

// Show help
function showHelp() {
  console.log(`
🎉 Endorphin AI v${packageInfo.version} - E2E Testing Reinvented with AI

Usage:
  endorphin <command> [options]

Commands:
  test <test-id>         Run a specific test (e.g., QE-001)
  list                   List all available tests
  tag <tag-name>         Run tests by tag (e.g., authentication)
  priority <level>       Run tests by priority (High, Medium, Low)
  interactive            Start interactive test recorder
  demo                   Run interactive demo
  all                    Run all tests
  help                   Show this help message

Examples:
  endorphin test QE-001              # Run basic login test
  endorphin tag authentication       # Run all auth tests
  endorphin priority High            # Run high priority tests
  endorphin interactive              # Start test recorder
  endorphin list                     # Show all available tests

Environment:
  Set OPENAI_API_KEY in your .env file or environment variables
  Set BASE_URL for your test site (default: https://qafromla.herokuapp.com/)
  Set HEADLESS=true for headless browser mode

Documentation: https://github.com/andrewnovykov/endorphin-ai#readme
  `);
}

// Show version
function showVersion() {
  console.log(`Endorphin AI v${packageInfo.version}`);
}

// Main CLI handler
async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  const command = args[0];
  const option = args[1];

  try {
    switch (command) {
      case 'interactive':
        console.log('🎬 Starting Interactive Test Recorder...');
        const { runInteractiveRecorder } = await import('../framework/interactive/enhanced-interactive-recorder.js');
        await runInteractiveRecorder();
        break;

      case 'demo':
        console.log('🎮 Starting Interactive Demo...');
        const { runInteractiveDemo } = await import('../framework/demos/interactive-demo.js');
        await runInteractiveDemo();
        break;

      case 'test':
        if (!option) {
          console.error('❌ Error: Please specify a test ID (e.g., endorphin test QE-001)');
          process.exit(1);
        }
        console.log(`🧪 Running test: ${option}`);
        const { runSingleTestById } = await import('../framework/enhanced-test-framework.js');
        await runSingleTestById(option);
        break;

      case 'list':
        console.log('📋 Available Tests:');
        const { listAllTests } = await import('../framework/enhanced-test-framework.js');
        await listAllTests();
        break;

      case 'tag':
        if (!option) {
          console.error('❌ Error: Please specify a tag (e.g., endorphin tag authentication)');
          process.exit(1);
        }
        console.log(`🏷️ Running tests with tag: ${option}`);
        const { runTestsByTag } = await import('../framework/enhanced-test-framework.js');
        await runTestsByTag(option);
        break;

      case 'priority':
        if (!option) {
          console.error('❌ Error: Please specify priority (High, Medium, Low)');
          process.exit(1);
        }
        console.log(`🎯 Running tests with priority: ${option}`);
        const { runTestsByPriority } = await import('../framework/enhanced-test-framework.js');
        await runTestsByPriority(option);
        break;

      case 'all':
        console.log('🚀 Running all tests...');
        const { runAllTests } = await import('../framework/enhanced-test-framework.js');
        await runAllTests();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "endorphin help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Tip: Make sure to set your OPENAI_API_KEY in your .env file or environment variables');
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run CLI
main().catch((error) => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});
