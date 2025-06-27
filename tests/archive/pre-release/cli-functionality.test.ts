/**
 * Pre-Release CLI Functionality Tests
 *
 * Tests that verify all CLI commands work correctly with the local
 * development version of the framework.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Jest-compatible path resolution
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'cli-test');

describe('Pre-Release CLI Functionality', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = `${TEST_DIR  }-${  Date.now()}`;

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    fs.mkdirSync(testProjectPath, { recursive: true });

    // Initialize npm project and install local version
    execSync('npm init -y', { cwd: testProjectPath, stdio: 'pipe' });
    execSync(`npm install "${PROJECT_ROOT}"`, { cwd: testProjectPath, stdio: 'pipe' });
  }, 60000);

  afterAll(async () => {
    if (fs.existsSync(testProjectPath)) {
      try {
        fs.rmSync(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Could not clean up test directory:', error);
      }
    }
  });

  describe('Basic CLI Commands', () => {
    it('should display help information', async () => {
      const result = execSync('npx endorphin --help', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Endorphin AI');
      expect(result).toContain('Commands:');
      expect(result).toContain('init');
      expect(result).toContain('run');
      expect(result).toContain('list');
      expect(result).toContain('generate');
    });

    it('should display version information', async () => {
      const result = execSync('npx endorphin --version', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      // Should return a valid version number
      expect(result.trim()).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should handle unknown commands gracefully', async () => {
      try {
        execSync('npx endorphin unknown-command', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.status).not.toBe(0);
        expect(error.stderr || error.stdout).toContain('Unknown command');
      }
    });
  });

  describe('Project Initialization', () => {
    let initTestPath: string;

    beforeEach(() => {
      initTestPath = path.join(testProjectPath, `init-test-${  Date.now()}`);
      fs.mkdirSync(initTestPath, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(initTestPath)) {
        fs.rmSync(initTestPath, { recursive: true, force: true });
      }
    });

    it('should initialize a new project', async () => {
      execSync('npx endorphin init', {
        cwd: initTestPath,
        stdio: 'pipe',
      });

      // Check that required files were created
      expect(fs.existsSync(path.join(initTestPath, 'endorphin.config.ts'))).toBe(true);
      expect(fs.existsSync(path.join(initTestPath, '.env'))).toBe(true);
      expect(fs.existsSync(path.join(initTestPath, 'tests'))).toBe(true);
      expect(fs.existsSync(path.join(initTestPath, 'test-results'))).toBe(true);
    });

    it('should create sample test file', async () => {
      execSync('npx endorphin init', {
        cwd: initTestPath,
        stdio: 'pipe',
      });

      const testsDir = path.join(initTestPath, 'tests');
      const testFiles = fs.readdirSync(testsDir).filter((f) => f.endsWith('.ts'));

      expect(testFiles.length).toBeGreaterThan(0);

      // Check sample test content
      const sampleTestPath = path.join(testsDir, testFiles[0]);
      const content = fs.readFileSync(sampleTestPath, 'utf8');
      expect(content).toContain('TEST_ID');
      expect(content).toContain('export const');
    });

    it('should create proper configuration file', async () => {
      execSync('npx endorphin init', {
        cwd: initTestPath,
        stdio: 'pipe',
      });

      const configPath = path.join(initTestPath, 'endorphin.config.ts');
      const content = fs.readFileSync(configPath, 'utf8');

      expect(content).toContain('export default');
      expect(content).toContain('browser:');
      expect(content).toContain('ai:');
      expect(content).toContain('reporter:');
    });

    it('should handle existing project gracefully', async () => {
      // Initialize once
      execSync('npx endorphin init', {
        cwd: initTestPath,
        stdio: 'pipe',
      });

      // Try to initialize again
      const result = execSync('npx endorphin init', {
        cwd: initTestPath,
        encoding: 'utf8',
      });

      expect(result).toContain('already exists');
    });
  });

  describe('Test Discovery and Listing', () => {
    let listTestPath: string;

    beforeEach(async () => {
      listTestPath = path.join(testProjectPath, `list-test-${  Date.now()}`);
      fs.mkdirSync(listTestPath, { recursive: true });

      // Initialize project
      execSync('npx endorphin init', {
        cwd: listTestPath,
        stdio: 'pipe',
      });
    });

    afterEach(() => {
      if (fs.existsSync(listTestPath)) {
        fs.rmSync(listTestPath, { recursive: true, force: true });
      }
    });

    it('should list available tests', async () => {
      const result = execSync('npx endorphin list', {
        cwd: listTestPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Found');
      expect(result).toContain('test');
    });

    it('should handle empty test directory', async () => {
      // Remove all test files
      const testsDir = path.join(listTestPath, 'tests');
      const testFiles = fs.readdirSync(testsDir);
      testFiles.forEach((file) => {
        fs.unlinkSync(path.join(testsDir, file));
      });

      const result = execSync('npx endorphin list', {
        cwd: listTestPath,
        encoding: 'utf8',
      });

      expect(result).toContain('No tests found');
    });

    it('should filter tests by tag', async () => {
      // Create a test with a specific tag
      const testContent = `
export const TEST_HEALTH = {
  id: 'HEALTH-TEST',
  name: 'Health Check',
  description: 'Basic health check test',
  priority: 'High',
  tags: ['health', 'smoke'],
  site: 'https://example.com',
  task: 'Check if the website loads'
};
`;
      fs.writeFileSync(path.join(listTestPath, 'tests', 'health-test.ts'), testContent);

      const result = execSync('npx endorphin list --tag health', {
        cwd: listTestPath,
        encoding: 'utf8',
      });

      expect(result).toContain('HEALTH-TEST');
    });
  });

  describe('Test Execution Commands', () => {
    let runTestPath: string;

    beforeEach(async () => {
      runTestPath = path.join(testProjectPath, `run-test-${  Date.now()}`);
      fs.mkdirSync(runTestPath, { recursive: true });

      // Initialize project
      execSync('npx endorphin init', {
        cwd: runTestPath,
        stdio: 'pipe',
      });

      // Create .env file with dummy API key for testing
      fs.writeFileSync(path.join(runTestPath, '.env'), 'OPENAI_API_KEY=test-key-for-validation\n');
    });

    afterEach(() => {
      if (fs.existsSync(runTestPath)) {
        fs.rmSync(runTestPath, { recursive: true, force: true });
      }
    });

    it('should validate test run command syntax', async () => {
      try {
        execSync('npx endorphin run test', {
          cwd: runTestPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
        fail('Should require test ID or flag');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('Please specify');
      }
    });

    it('should handle missing API key gracefully', async () => {
      // Remove API key
      fs.writeFileSync(path.join(runTestPath, '.env'), '');

      try {
        execSync('npx endorphin run test all', {
          cwd: runTestPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        expect(error.stderr || error.stdout).toMatch(/API key|OpenAI/i);
      }
    });

    it('should handle non-existent test ID', async () => {
      try {
        execSync('npx endorphin run test NON-EXISTENT', {
          cwd: runTestPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('not found');
      }
    });
  });

  describe('Report Generation', () => {
    let reportTestPath: string;

    beforeEach(async () => {
      reportTestPath = path.join(testProjectPath, `report-test-${  Date.now()}`);
      fs.mkdirSync(reportTestPath, { recursive: true });

      // Initialize project
      execSync('npx endorphin init', {
        cwd: reportTestPath,
        stdio: 'pipe',
      });
    });

    afterEach(() => {
      if (fs.existsSync(reportTestPath)) {
        fs.rmSync(reportTestPath, { recursive: true, force: true });
      }
    });

    it('should handle report generation with no test results', async () => {
      try {
        execSync('npx endorphin generate report', {
          cwd: reportTestPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('No test results found');
      }
    });

    it('should show helpful message for empty results', async () => {
      try {
        execSync('npx endorphin generate report', {
          cwd: reportTestPath,
          encoding: 'utf8',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout;
        expect(output).toContain('run some tests first');
        expect(output).toContain('npx endorphin run test');
      }
    });
  });

  describe('Configuration Handling', () => {
    let configTestPath: string;

    beforeEach(async () => {
      configTestPath = path.join(testProjectPath, `config-test-${  Date.now()}`);
      fs.mkdirSync(configTestPath, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(configTestPath)) {
        fs.rmSync(configTestPath, { recursive: true, force: true });
      }
    });

    it('should handle missing configuration file', async () => {
      // Don't initialize - no config file
      const result = execSync('npx endorphin list', {
        cwd: configTestPath,
        encoding: 'utf8',
      });

      // Should use defaults or show helpful message
      expect(result).toContain('No tests found');
    });

    it('should handle corrupted configuration file', async () => {
      // Create invalid config file
      fs.writeFileSync(
        path.join(configTestPath, 'endorphin.config.ts'),
        'invalid typescript code {'
      );

      try {
        execSync('npx endorphin list', {
          cwd: configTestPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        expect(error.stderr || error.stdout).toMatch(/config|error/i);
      }
    });
  });
});
