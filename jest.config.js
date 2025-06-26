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
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        target: 'ES2022',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        allowJs: true,
        strict: false,
        skipLibCheck: true
      }
    }]
  },
  
  // Disable Babel transform for .ts files
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
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
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'ES2022',
            target: 'ES2022',
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            allowJs: true,
            strict: false,
            skipLibCheck: true
          }
        }]
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
      ],
      testMatch: [
        '<rootDir>/tests/development/**/*.test.{js,ts}',
        '<rootDir>/tests/development/**/*.spec.{js,ts}'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      testTimeout: 30000,
      collectCoverageFrom: [
        '<rootDir>/framework/**/*.{js,ts}',
        '!<rootDir>/framework/**/*.d.ts',
        '!<rootDir>/framework/types/**/*',
        '!**/node_modules/**',
        '!**/dist/**'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/framework/$1',
        '^@core/(.*)$': '<rootDir>/framework/core/$1',
        '^@tools/(.*)$': '<rootDir>/framework/tools/$1',
        '^@config/(.*)$': '<rootDir>/framework/config/$1',
        '^@types/(.*)$': '<rootDir>/framework/types/$1',
        '^@runner/(.*)$': '<rootDir>/framework/runner/$1',
        '^@reporters/(.*)$': '<rootDir>/framework/reporters/$1'
      }
    },
    {
      displayName: 'Post-Install Tests',
      preset: 'ts-jest',
      testEnvironment: 'node',
      extensionsToTreatAsEsm: ['.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'ES2022',
            target: 'ES2022',
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            allowJs: true,
            strict: false,
            skipLibCheck: true
          }
        }]
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
      ],
      testMatch: [
        '<rootDir>/tests/post-install/**/*.test.{js,ts}',
        '<rootDir>/tests/post-install/**/*.spec.{js,ts}'
      ],
      testTimeout: 120000, // Longer timeout for integration tests
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      maxWorkers: 1, // Run sequentially to avoid conflicts
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/framework/$1',
        '^@core/(.*)$': '<rootDir>/framework/core/$1',
        '^@tools/(.*)$': '<rootDir>/framework/tools/$1',
        '^@config/(.*)$': '<rootDir>/framework/config/$1',
        '^@types/(.*)$': '<rootDir>/framework/types/$1',
        '^@runner/(.*)$': '<rootDir>/framework/runner/$1',
        '^@reporters/(.*)$': '<rootDir>/framework/reporters/$1'
      }
    }
  ],
  
  // Global coverage configuration
  collectCoverage: true,
  coverageDirectory: 'tests/development/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/framework/$1',
    '^@core/(.*)$': '<rootDir>/framework/core/$1',
    '^@tools/(.*)$': '<rootDir>/framework/tools/$1',
    '^@config/(.*)$': '<rootDir>/framework/config/$1',
    '^@types/(.*)$': '<rootDir>/framework/types/$1',
    '^@runner/(.*)$': '<rootDir>/framework/runner/$1',
    '^@reporters/(.*)$': '<rootDir>/framework/reporters/$1'
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
    '<rootDir>/tests/post-install/tmp/**'
  ]
};
