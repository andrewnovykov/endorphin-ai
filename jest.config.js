/**
 * Jest Configuration for Endorphin AI Framework
 */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // TypeScript configuration
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform configuration - explicitly use ts-jest for TypeScript
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          target: 'ES2022',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          allowJs: true,
          strict: false,
          skipLibCheck: true,
        },
      },
    ],
  },

  // Disable Babel transform for .ts files
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
    '<rootDir>/dist/',
  ],

  // Use projects for different test types
  projects: [
    {
      displayName: 'Development Tests',
      preset: 'ts-jest',
      testEnvironment: 'node',
      extensionsToTreatAsEsm: ['.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: {
              module: 'ES2022',
              target: 'ES2022',
              moduleResolution: 'node',
              allowSyntheticDefaultImports: true,
              esModuleInterop: true,
              allowJs: true,
              strict: false,
              skipLibCheck: true,
            },
          },
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))',
        '<rootDir>/dist/',
      ],
      testMatch: [
        '<rootDir>/dev-tests/development/**/*.test.{js,ts}',
        '<rootDir>/dev-tests/development/**/*.spec.{js,ts}',
      ],
      setupFilesAfterEnv: ['<rootDir>/dev-tests/jest-setup.js'],
      testTimeout: 180000, // 3 minutes for integration tests
      collectCoverageFrom: [
        '<rootDir>/framework/**/*.{js,ts}',
        '!<rootDir>/framework/**/*.d.ts',
        '!<rootDir>/framework/types/**/*',
        '!**/node_modules/**',
        '!**/dist/**',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/framework/$1',
        '^@core/(.*)$': '<rootDir>/framework/core/$1',
        '^@automation/(.*)$': '<rootDir>/framework/automation/$1',
        '^@ai/(.*)$': '<rootDir>/framework/ai/$1',
        '^@execution/(.*)$': '<rootDir>/framework/execution/$1',
        '^@content/(.*)$': '<rootDir>/framework/content/$1',
        '^@tools/(.*)$': '<rootDir>/framework/tools/$1',
        '^@config/(.*)$': '<rootDir>/framework/config/$1',
        '^@types/(.*)$': '<rootDir>/framework/types/$1',
        '^@runner/(.*)$': '<rootDir>/framework/runner/$1',
        '^@reporters/(.*)$': '<rootDir>/framework/reporters/$1',
        '^@reporting/(.*)$': '<rootDir>/framework/reporting/$1',
        '^@managers/(.*)$': '<rootDir>/framework/managers/$1',
        '^@results/(.*)$': '<rootDir>/framework/results/$1',
        '^(.+)\\.js$': '$1',
      },
    },
  ],

  // Global coverage configuration
  collectCoverage: true,
  coverageDirectory: 'dev-tests/development/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 54,
      functions: 75,
      lines: 76,
      statements: 76,
    },
  },


  // Global settings
  verbose: true,
  clearMocks: true,
  restoreMocks: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/development-tests/',
    '<rootDir>/examples/',
    '<rootDir>/tests/',
    '<rootDir>/dev-tests/archive/**',
    '<rootDir>/dev-tests/package-tests/tmp/**',
  ],
};
