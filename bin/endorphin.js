#!/usr/bin/env node

/**
 * Endorphin AI CLI Entry Point
 * This file loads and executes the TypeScript CLI implementation using tsx
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the TypeScript CLI file path
const tsCliPath = join(__dirname, 'endorphin.ts');

// Use tsx to run the TypeScript file
const child = spawn('npx', ['tsx', tsCliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start Endorphin AI CLI:', error.message);
  console.log('💡 Make sure tsx is installed: npm install -g tsx');
  process.exit(1);
});
