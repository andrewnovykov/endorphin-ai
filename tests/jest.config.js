/**
 * Jest Configuration for Endorphin AI Framework
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/tests/**/*.spec.{js,ts}'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'tests/development/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    '<rootDir>/framework/**/*.{js,ts}',
    '<rootDir>/bin/**/*.{js,ts}',
    '!<rootDir>/framework/**/*.d.ts',
    '!<rootDir>/framework/types/**/*',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/tests/development/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Module resolution (fixed property name)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/framework/$1',
    '^@core/(.*)$': '<rootDir>/framework/core/$1',
    '^@tools/(.*)$': '<rootDir>/framework/tools/$1',
    '^@config/(.*)$': '<rootDir>/framework/config/$1',
    '^@types/(.*)$': '<rootDir>/framework/types/$1',
    '^@runner/(.*)$': '<rootDir>/framework/runner/$1',
    '^@reporters/(.*)$': '<rootDir>/framework/reporters/$1'
  },

  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Mock and cleanup
  clearMocks: true,
  restoreMocks: true,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/development-tests/',
    '<rootDir>/examples/'
  ]
};
