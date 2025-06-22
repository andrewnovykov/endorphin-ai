#!/usr/bin/env node

console.log('CLI Starting...');

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

console.log('Imports loaded...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package info
const packagePath = join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));

console.log('Package info loaded:', packageInfo.name, packageInfo.version);

const args = process.argv.slice(2);

console.log('Arguments:', args);

// Show help
function showHelp() {
  console.log(`
🎉 Endorphin AI v${packageInfo.version} - E2E Testing Reinvented with AI

Usage:
  endorphin-ai <command> [options]

Commands:
  run test <test-id>     Run a specific test (e.g., QE-001)
  run test all           Run all tests
  run test --tag <tag>   Run tests by tag (e.g., authentication)
  run test --priority <level>  Run tests by priority (High, Medium, Low)
  run test-recorder      Start interactive test recorder
  list                   List all available tests
  help                   Show this help message

Examples:
  endorphin-ai run test QE-001           # Run specific test
  endorphin-ai run test all              # Run all tests
  endorphin-ai run test --tag smoke      # Run smoke tests
  endorphin-ai run test --priority High  # Run high priority tests
  endorphin-ai run test-recorder         # Start test recorder
  endorphin-ai list                      # Show all available tests

Environment:
  Set OPENAI_API_KEY in your .env file or environment variables
  Create tests/ directory with your test files
  Optional: Create endorphin.config.js for custom settings

Documentation: https://github.com/andrewnovykov/endorphin-ai#readme
`);
}

console.log('Functions defined...');

// Show version
function showVersion() {
  console.log(`Endorphin AI v${packageInfo.version}`);
}

// Main CLI handler - simplified for testing
async function main() {
  console.log('Main function starting...');
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
    console.log('Showing help...');
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  console.log('Processing command:', args[0]);
  
  if (args[0] === 'list') {
    console.log('List command detected...');
    try {
      const { listAllTests } = await import('../legacy/enhanced-test-framework.js');
      await listAllTests();
    } catch (error) {
      console.error('Error loading test framework:', error.message);
    }
    return;
  }

  console.log('Unknown command:', args[0]);
}

console.log('Starting main function...');

// Run CLI
main().catch((error) => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});
