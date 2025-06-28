#!/usr/bin/env node

/**
 * create-endorphin-ai
 * Create a new Endorphin AI project with one command
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENDORPHIN_VERSION = '^0.7.0';

function log(message) {
  console.log(chalk.cyan('🎯 Endorphin AI:'), message);
}

function error(message) {
  console.error(chalk.red('❌ Error:'), message);
}

function success(message) {
  console.log(chalk.green('✅'), message);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function createProject(projectName, targetDir) {
  const projectPath = resolve(targetDir);

  // Check if directory exists
  if (existsSync(projectPath)) {
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Continue anyway?`,
      initial: false,
    });

    if (!response.overwrite) {
      log('Operation cancelled.');
      process.exit(0);
    }
  } else {
    mkdirSync(projectPath, { recursive: true });
  }

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    description: 'AI-powered E2E testing project created with Endorphin AI',
    scripts: {
      'test': 'endorphin-ai run test all',
      'test:smoke': 'endorphin-ai run test --tag smoke',
      'test:record': 'endorphin-ai run test-recorder',
      'test:single': 'endorphin-ai run test',
      'endorphin-ai:init': './node_modules/.bin/endorphin init',
      'endorphin-ai:version': './node_modules/.bin/endorphin --version',
      'endorphin-ai:help': './node_modules/.bin/endorphin --help',
    },
    devDependencies: {
      'endorphin-ai': ENDORPHIN_VERSION,
    },
    keywords: ['ai', 'testing', 'e2e', 'automation', 'endorphin-ai'],
  };

  writeFileSync(
    join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  return projectPath;
}

async function installDependencies(projectPath) {
  const spinner = ora('Installing Endorphin AI...').start();
  
  try {
    await runCommand('npm', ['install'], { cwd: projectPath });
    spinner.succeed('Dependencies installed successfully!');
  } catch (err) {
    spinner.fail('Failed to install dependencies');
    throw err;
  }
}

async function initializeProject(projectPath) {
  const spinner = ora('Initializing Endorphin AI project...').start();
  
  try {
    await runCommand('npx', ['endorphin-ai', 'init'], { cwd: projectPath });
    spinner.succeed('Project initialized successfully!');
  } catch (_error) {
    spinner.fail('Failed to initialize project');
    // Try alternative method
    try {
      spinner.start('Trying alternative initialization...');
      await runCommand('npm', ['run', 'endorphin-ai:init'], { cwd: projectPath });
      spinner.succeed('Project initialized successfully!');
    } catch (err2) {
      spinner.fail('Failed to initialize project');
      throw err2;
    }
  }
}

async function main() {
  console.log();
  console.log(chalk.cyan.bold('🎯 Create Endorphin AI Project'));
  console.log(chalk.gray('E2E Testing Reinvented with AI'));
  console.log();

  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-ai-tests',
      validate: (value) => {
        if (!value.trim()) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    });

    if (!response.projectName) {
      log('Operation cancelled.');
      process.exit(0);
    }

    projectName = response.projectName;
  }

  const targetDir = resolve(process.cwd(), projectName);

  try {
    log(`Creating new Endorphin AI project: ${chalk.yellow(projectName)}`);
    
    // Step 1: Create project structure
    const projectPath = await createProject(projectName, targetDir);
    success(`Project directory created: ${projectName}/`);

    // Step 2: Install dependencies
    await installDependencies(projectPath);

    // Step 3: Initialize Endorphin AI
    await initializeProject(projectPath);

    // Success message
    console.log();
    success(chalk.bold('Project created successfully! 🎉'));
    console.log();
    log('Next steps:');
    console.log(chalk.gray('  1.'), `cd ${projectName}`);
    console.log(chalk.gray('  2.'), 'Edit .env file and add your OpenAI API key');
    console.log(chalk.gray('  3.'), `${chalk.yellow('npx endorphin-ai run test HEALTH-001')}`);
    console.log();
    log('Available commands:');
    console.log(chalk.gray('  •'), `${chalk.yellow('npm run test')} - Run all tests`);
    console.log(chalk.gray('  •'), `${chalk.yellow('npm run test:record')} - Start test recorder`);
    console.log(chalk.gray('  •'), `${chalk.yellow('npx endorphin-ai --help')} - Get help`);
    console.log();
    log('Documentation: https://github.com/andrewnovykov/endorphin-ai#readme');
    console.log();

  } catch (err) {
    error(`Failed to create project: ${err.message}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
});

main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});