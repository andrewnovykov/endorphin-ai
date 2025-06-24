import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files pattern - Include framework tests from tests/ directory
    include: [
      'tests/framework-tests/**/*.{test,spec}.{js,mjs}'
    ],
    exclude: [
      'tests/package-tests/**', // Package tests have their own config
      'tests/debug-test.js', // Exclude debug files
      'tests/qe-new-recorded-test.js', // Exclude user test files
      // Exclude empty directories after moving tests
      'tests/framework-tests/integration/**', // Moved to package-tests
    ],
    
    // Global setup
    globals: true,
    
    // Alias for easier imports
    alias: {
      '@framework': resolve(__dirname, './framework'),
      '@tests': resolve(__dirname, './tests'),
    },
    
    // Coverage configuration - 90% GOAL
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'text-summary'],
      reportsDirectory: './tests/framework-tests/coverage',
      include: [
        'packages/**/*.js',
        'bin/**/*.js'
      ],
      exclude: [
        'packages/**/index.js',
        'packages/**/package.json',
        'legacy/**',
        'examples/**',
        '**/*.config.js'
      ],
      thresholds: {
        global: {
          branches: 90,    // 90% goal
          functions: 90,   // 90% goal
          lines: 90,       // 90% goal
          statements: 90,  // 90% goal
        },
        // Per-package thresholds for critical modules
        'packages/core/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'packages/runner/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'packages/browser/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'bin/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        }
      },
    },
    
    // Test timeout - Increased for integration tests
    testTimeout: 60000,
    
    // Setup files
    setupFiles: ['./tests/framework-tests/setup.js'],
    
    // Reporter configuration
    reporter: ['verbose', 'html', 'json'],
    outputFile: {
      html: './tests/framework-tests/html/index.html',
      json: './tests/framework-tests/results.json'
    },
    
    // Watch mode settings
    watch: false,
    
    // Pool options for better performance and Node.js compatibility
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Test isolation
    isolate: true,
    
    // Retry configuration
    retry: 1,
    
    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0
  },
  
  // Define command aliases
  define: {
    __TEST_MODE__: true
  }
});
