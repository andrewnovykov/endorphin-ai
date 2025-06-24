// Test setup for Vitest
// Global setup and configuration for framework tests

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';

// Test environment setup
beforeAll(() => {
  console.log('🧪 Setting up Endorphin AI test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ENDORPHIN_HEADLESS = 'true';
  process.env.ENDORPHIN_VIEWPORT_WIDTH = '1280';
  process.env.ENDORPHIN_VIEWPORT_HEIGHT = '720';
  
  // Create test directories
  const testDirs = [
    resolve(process.cwd(), 'dev-tests/temp'),
    resolve(process.cwd(), 'dev-tests/fixtures'),
    resolve(process.cwd(), 'dev-tests/results'),
  ];
  
  testDirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
});

// Cleanup after all tests
afterAll(() => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up test directories
  const tempDir = resolve(process.cwd(), 'dev-tests/temp');
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

// Reset state before each test
beforeEach(() => {
  // Reset any global state
  if (global.endorphinConfig) {
    delete global.endorphinConfig;
  }
});

// Cleanup after each test
afterEach(() => {
  // Any per-test cleanup
});
