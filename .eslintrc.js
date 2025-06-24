import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
      },
    },
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'test-results/',
      'test-recorder/',
      'examples/test-results/',
      'examples/test-recorder/',
      'development-tests/package-tests/tmp/',
      'development-tests/package-tests/results/',
      '*.min.js',
    ],
    rules: {
      // Code Quality
      'no-console': 'off', // Allow console for CLI tool
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-undef': 'error',
      'no-unreachable': 'error',

      // Best Practices
      'prefer-const': 'error',
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
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js', '**/development-tests/**/*.js'],
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
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'max-len': 'off',
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
    files: ['bin/**/*.js', 'cli/**/*.js'],
    rules: {
      'no-process-exit': 'off',
      'no-console': 'off',
    },
  },

  // Framework core files
  {
    files: ['framework/**/*.js'],
    rules: {
      complexity: ['warn', 20], // Framework can be more complex
      'max-depth': ['warn', 5],
    },
  },
];
