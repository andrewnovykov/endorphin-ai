import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files pattern - framework tests only
    include: ['**/*.{test,spec}.{js,mjs}'],
    exclude: ['vitest.config.js', 'setup.js', 'README.md', 'html/**/*'],
    
    // Global setup file
    setupFiles: ['./setup.js'],
    
    // Global setup
    globals: true,
    
    // Coverage configuration for framework code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['../../framework/**/*.js'],
      exclude: [
        '../../framework/__tests__/**',
        '../../framework/node_modules/**',
        '../../framework/config/**',
        '../../framework/templates/**'
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    },
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Test execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Reporter configuration
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './result/test-results.html'
    },
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      ENDORPHIN_HEADLESS: 'true',
      ENDORPHIN_VIEWPORT_WIDTH: '1280',
      ENDORPHIN_VIEWPORT_HEIGHT: '720'
    }
  },
  
  // Resolve configuration for imports
  resolve: {
    alias: {
      '@framework': resolve(process.cwd(), 'framework'),
      '@tests': resolve(process.cwd(), 'development-tests/framework-tests'),
      '@core': resolve(process.cwd(), 'framework/core'),
      '@examples': resolve(process.cwd(), 'examples')
    }
  }
});
