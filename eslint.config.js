import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

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
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
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
      // Generated template files (HTML report scripts)
      '**/templates/scripts.js',
      '**/test-results/**/scripts.js',
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

  // Browser-side scripts (HTML report templates)
  {
    files: ['**/scripts.js', '**/templates/**/*.js', '**/test-results/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        bootstrap: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off', // Template files may have unused vars
      'no-new-func': 'off', // Allow Function constructor in templates
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      // Disable base ESLint rules that conflict with TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off', // TypeScript handles this
    },
  },
];
