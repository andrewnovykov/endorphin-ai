import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'test-results/',
      'test-recorder/',
      'examples/test-results/',
      'examples/test-recorder/',
      'tests/package-tests/tmp/',
      'tests/package-tests/results/',
      'tests/development/coverage/',
      'tests/**/tmp/',
      'tmp/',
      '*.min.js',
      'framework/templates/**/*.js',
    ],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        project: null, // Disable TypeScript project checking
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off', // Allow inference
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow inference
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      
      // Code Quality
      'no-console': 'off', // Allow console for CLI tool
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'off', // TypeScript handles this
      'no-unreachable': 'error',

      // Best Practices
      'prefer-const': 'off', // Use TypeScript version
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // Async/Await
      'require-await': 'error',
      'no-async-promise-executor': 'error',

      // Style (handled by Prettier, but some logical rules)
      'max-len': [
        'warn',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
      'max-depth': ['warn', 4],
      complexity: ['warn', 15],

      // Error Prevention
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-eval': 'error',

      // Playwright specific
      'no-await-in-loop': 'off', // Common in Playwright tests
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*.{js,ts}', '**/development-tests/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'max-len': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
    },
  },

  // Config files
  {
    files: ['*.config.js', '*.config.mjs', 'endorphin.config.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // CLI files
  {
    files: ['bin/**/*.{js,ts}', 'cli/**/*.{js,ts}'],
    rules: {
      'no-process-exit': 'off',
      'no-console': 'off',
    },
  },

  // Framework core files
  {
    files: ['framework/**/*.{js,ts}'],
    rules: {
      complexity: ['warn', 20], // Framework can be more complex
      'max-depth': ['warn', 5],
    },
  },
];
