import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files pattern
    include: ['dev-tests/**/*.{test,spec}.{js,mjs}'],
    exclude: ['dev-tests/test-improved-ai.js'], // Exclude old test files
    
    // Global setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './dev-tests/coverage',
      include: ['framework/**/*.js'],
      exclude: [
        'framework/**/index.js',
        'framework/demos/**',
        'framework/interactive/**',
        'legacy/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Test timeout
    testTimeout: 30000,
    
    // Setup files
    setupFiles: ['./dev-tests/setup.js'],
    
    // Reporter
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './dev-tests/html/index.html'
    },
    
    // Watch mode
    watch: false,
  },
});
