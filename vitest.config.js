import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files pattern - Include framework tests from tests/ directory
    include: [
      'tests/framework-tests/**/*.{test,spec}.{js,mjs}',
      'dev-tests/**/*.{test,spec}.{js,mjs}'
    ],
    exclude: [
      'dev-tests/test-improved-ai.js', // Exclude old test files
      'tests/package-tests/**', // Package tests are bash scripts
      'tests/debug-test.js', // Exclude debug files
      'tests/qe-new-recorded-test.js' // Exclude user test files
    ],
    
    // Global setup
    globals: true,
    
    // Coverage configuration - 90% GOAL
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'text-summary'],
      reportsDirectory: './tests/framework-tests/coverage',
      include: [
        'framework/**/*.js',
        'bin/**/*.js'
      ],
      exclude: [
        'framework/**/index.js',
        'framework/demos/**',
        'framework/interactive/**',
        'framework/templates/**',
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
        // Per-file thresholds for critical modules
        'framework/core/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
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
    
    // Pool options for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
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
