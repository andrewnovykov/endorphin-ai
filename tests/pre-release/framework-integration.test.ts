/**
 * Pre-Release Framework Integration Tests
 *
 * Tests that verify core framework features work correctly with the
 * local development version.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Jest-compatible path resolution
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'framework-test');

describe('Pre-Release Framework Integration', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = TEST_DIR + '-' + Date.now();

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    fs.mkdirSync(testProjectPath, { recursive: true });

    // Initialize npm project and install local version
    execSync('npm init -y', { cwd: testProjectPath, stdio: 'pipe' });
    execSync(`npm install "${PROJECT_ROOT}"`, { cwd: testProjectPath, stdio: 'pipe' });

    // Initialize Endorphin project
    execSync('npx endorphin init', { cwd: testProjectPath, stdio: 'pipe' });
  }, 90000);

  afterAll(async () => {
    if (fs.existsSync(testProjectPath)) {
      try {
        fs.rmSync(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Could not clean up test directory:', error);
      }
    }
  });

  describe('Core Framework Loading', () => {
    it('should import framework modules successfully', async () => {
      // Create a test script that imports framework modules
      const testScript = `
const { HtmlReporter } = require('endorphin-ai/framework/reporters/html-reporter.js');
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');

console.log('HtmlReporter loaded:', typeof HtmlReporter);
console.log('ConfigLoader loaded:', typeof ConfigLoader);
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-imports.js'), testScript);

      const result = execSync('node test-imports.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('HtmlReporter loaded: function');
      expect(result).toContain('ConfigLoader loaded: function');
    });

    it('should load TypeScript definitions', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai');

      // Check for key TypeScript definition files
      const definitionFiles = [
        'framework/types/index.d.ts',
        'framework/reporters/html-reporter.d.ts',
        'framework/core/config-loader.d.ts',
      ];

      for (const file of definitionFiles) {
        const filePath = path.join(nodeModulesPath, file);
        expect(fs.existsSync(filePath)).toBe(true);

        // Check that the file has proper TypeScript declarations
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('export');
      }
    });

    it('should have all framework directories', async () => {
      const frameworkPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai', 'framework');

      const requiredDirs = ['core', 'reporters', 'tools', 'types', 'runner', 'config', 'templates'];

      for (const dir of requiredDirs) {
        const dirPath = path.join(frameworkPath, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      }
    });
  });

  describe('Configuration System', () => {
    it('should load default configuration', async () => {
      const testScript = `
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');

const loader = new ConfigLoader();
const config = loader.loadConfig();

console.log('Config loaded:', JSON.stringify(config, null, 2));
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-config.js'), testScript);

      const result = execSync('node test-config.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Config loaded:');
      expect(result).toContain('browser');
      expect(result).toContain('ai');
    });

    it('should respect configuration file', async () => {
      // Modify the config file
      const configContent = `
export default {
  browser: {
    headless: false,
    slowMo: 100
  },
  ai: {
    model: 'gpt-4',
    temperature: 0.7
  },
  reporter: {
    types: ['console', 'html']
  }
};
`;
      fs.writeFileSync(path.join(testProjectPath, 'endorphin.config.ts'), configContent);

      const testScript = `
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');

const loader = new ConfigLoader();
const config = loader.loadConfig();

console.log('Browser headless:', config.browser.headless);
console.log('AI model:', config.ai.model);
console.log('Reporter types:', config.reporter.types);
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-custom-config.js'), testScript);

      const result = execSync('node test-custom-config.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Browser headless: false');
      expect(result).toContain('AI model: gpt-4');
      expect(result).toContain('Reporter types: console,html');
    });

    it('should load environment variables', async () => {
      // Add test environment variable
      fs.writeFileSync(path.join(testProjectPath, '.env'), 'OPENAI_API_KEY=test-api-key-12345\n');

      const testScript = `
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');

const loader = new ConfigLoader();
const config = loader.loadConfig();

console.log('API Key loaded:', config.ai.apiKey?.substring(0, 8));
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-env.js'), testScript);

      const result = execSync('node test-env.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('API Key loaded: test-api');
    });
  });

  describe('Test Discovery System', () => {
    it('should discover TypeScript test files', async () => {
      // Create additional test files
      const testFiles = [
        {
          name: 'login-test.ts',
          content: `
export const LOGIN_TEST = {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test user login functionality',
  priority: 'High',
  tags: ['auth', 'login'],
  site: 'https://example.com',
  task: 'Navigate to login page and authenticate'
};
`,
        },
        {
          name: 'search-test.ts',
          content: `
export const SEARCH_TEST = {
  id: 'SEARCH-001',
  name: 'Search Functionality Test',
  description: 'Test search feature',
  priority: 'Medium',
  tags: ['search', 'ui'],
  site: 'https://example.com',
  task: 'Test search functionality'
};
`,
        },
      ];

      const testsDir = path.join(testProjectPath, 'tests');
      for (const testFile of testFiles) {
        fs.writeFileSync(path.join(testsDir, testFile.name), testFile.content);
      }

      const testScript = `
const { TestDiscovery } = require('endorphin-ai/framework/core/test-discovery.js');

const discovery = new TestDiscovery('./tests');
const tests = discovery.discoverTests();

console.log('Found tests:', tests.length);
tests.forEach(test => {
  console.log('Test ID:', test.id, 'Name:', test.name);
});
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-discovery.js'), testScript);

      const result = execSync('node test-discovery.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Found tests:');
      expect(result).toContain('LOGIN-001');
      expect(result).toContain('SEARCH-001');
    });

    it('should filter tests by tags', async () => {
      const testScript = `
const { TestDiscovery } = require('endorphin-ai/framework/core/test-discovery.js');

const discovery = new TestDiscovery('./tests');
const allTests = discovery.discoverTests();
const authTests = discovery.getTestsByTag('auth');

console.log('All tests:', allTests.length);
console.log('Auth tests:', authTests.length);
authTests.forEach(test => {
  console.log('Auth test:', test.id);
});
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-filter.js'), testScript);

      const result = execSync('node test-filter.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Auth tests: 1');
      expect(result).toContain('Auth test: LOGIN-001');
    });
  });

  describe('HTML Reporter System', () => {
    it('should create HTML reporter instance', async () => {
      const testScript = `
const { HtmlReporter } = require('endorphin-ai/framework/reporters/html-reporter.js');

const reporter = new HtmlReporter('./test-results');
console.log('Reporter created successfully');
console.log('Reporter type:', typeof reporter.generateReport);
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-reporter.js'), testScript);

      const result = execSync('node test-reporter.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Reporter created successfully');
      expect(result).toContain('Reporter type: function');
    });

    it('should handle empty test results directory', async () => {
      const testScript = `
const { HtmlReporter } = require('endorphin-ai/framework/reporters/html-reporter.js');

const reporter = new HtmlReporter('./test-results');

try {
  reporter.generateReport();
} catch (error) {
  console.log('Expected error:', error.message);
}
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-empty-results.js'), testScript);

      const result = execSync('node test-empty-results.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Expected error:');
      expect(result).toContain('No test results found');
    });

    it('should access template files', async () => {
      const templatePath = path.join(
        testProjectPath,
        'node_modules',
        'endorphin-ai',
        'framework',
        'templates',
        'reporter',
        'report-template.html'
      );

      expect(fs.existsSync(templatePath)).toBe(true);

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      expect(templateContent).toContain('{{totalTests}}');
      expect(templateContent).toContain('{{successRate}}');
      expect(templateContent).toContain('Endorphin AI');
    });
  });

  describe('Dependencies Validation', () => {
    it('should have Playwright installed and accessible', async () => {
      const testScript = `
const { chromium } = require('playwright');

console.log('Playwright chromium available:', typeof chromium.launch);
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-playwright.js'), testScript);

      const result = execSync('node test-playwright.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Playwright chromium available: function');
    });

    it('should have LangChain modules accessible', async () => {
      const testScript = `
try {
  const { ChatOpenAI } = require('@langchain/openai');
  console.log('LangChain OpenAI available:', typeof ChatOpenAI);
} catch (error) {
  console.log('LangChain import error:', error.message);
}
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-langchain.js'), testScript);

      const result = execSync('node test-langchain.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('LangChain OpenAI available: function');
    });

    it('should have dotenv functionality', async () => {
      const testScript = `
const dotenv = require('dotenv');

dotenv.config();
console.log('Dotenv loaded successfully');
console.log('API key exists:', !!process.env.OPENAI_API_KEY);
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-dotenv.js'), testScript);

      const result = execSync('node test-dotenv.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Dotenv loaded successfully');
      expect(result).toContain('API key exists: true');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration gracefully', async () => {
      // Remove config file
      const configPath = path.join(testProjectPath, 'endorphin.config.ts');
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }

      const testScript = `
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');

try {
  const loader = new ConfigLoader();
  const config = loader.loadConfig();
  console.log('Config loaded with defaults');
} catch (error) {
  console.log('Config error:', error.message);
}
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-no-config.js'), testScript);

      const result = execSync('node test-no-config.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Config loaded with defaults');
    });

    it('should handle invalid test files gracefully', async () => {
      // Create invalid test file
      fs.writeFileSync(
        path.join(testProjectPath, 'tests', 'invalid-test.ts'),
        'invalid typescript code {'
      );

      const testScript = `
const { TestDiscovery } = require('endorphin-ai/framework/core/test-discovery.js');

try {
  const discovery = new TestDiscovery('./tests');
  const tests = discovery.discoverTests();
  console.log('Discovery completed, found:', tests.length, 'valid tests');
} catch (error) {
  console.log('Discovery error:', error.message);
}
`;

      fs.writeFileSync(path.join(testProjectPath, 'test-invalid-files.js'), testScript);

      const result = execSync('node test-invalid-files.js', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      // Should handle gracefully and continue with valid tests
      expect(result).toContain('Discovery completed');
    });
  });
});
