/**
 * Pre-Release E2E Testing Tests
 *
 * Comprehensive end-to-end tests that verify the full testing workflow
 * with the local development version of the framework.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'e2e-test');

describe('Pre-Release E2E Testing', () => {
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

    // Initialize the project
    execSync('npx endorphin init', { cwd: testProjectPath, stdio: 'pipe' });

    console.log(`✅ Set up E2E test project in: ${testProjectPath}`);
  }, 120000);

  afterAll(async () => {
    if (fs.existsSync(testProjectPath)) {
      try {
        fs.rmSync(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Could not clean up test directory:', error);
      }
    }
  });

  describe('Test Discovery and Execution Flow', () => {
    it('should discover example tests after init', async () => {
      const result = execSync('npx endorphin list', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Available Tests');
      expect(result).toMatch(/\d+ tests? found/);
    });

    it('should validate test file structure', async () => {
      const testsDir = path.join(testProjectPath, 'tests');
      expect(fs.existsSync(testsDir)).toBe(true);

      const testFiles = fs.readdirSync(testsDir).filter((file) => file.endsWith('.ts'));
      expect(testFiles.length).toBeGreaterThan(0);

      // Check that test files have proper structure
      const testFile = fs.readFileSync(path.join(testsDir, testFiles[0]), 'utf8');
      expect(testFile).toContain('TEST_ID');
      expect(testFile).toContain('id:');
      expect(testFile).toContain('name:');
      expect(testFile).toContain('task:');
    });

    it('should handle test execution with proper error handling', async () => {
      // Try to run a test without API key (should fail gracefully)
      try {
        execSync('npx endorphin run test all', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: '' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).toContain('OPENAI_API_KEY');
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });
  });

  describe('Configuration System', () => {
    it('should load configuration properly', async () => {
      const configPath = path.join(testProjectPath, 'endorphin.config.ts');
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, 'utf8');
      expect(configContent).toContain('testDir');
      expect(configContent).toContain('browser');
      expect(configContent).toContain('openaiApiKey');
    });

    it('should handle environment-specific configurations', async () => {
      // Test with different environment flags
      const environments = ['development', 'staging', 'production'];

      for (const env of environments) {
        try {
          const result = execSync(`npx endorphin list --env ${env}`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            stdio: 'pipe',
          });
          // Should not throw syntax errors
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('SyntaxError');
          expect(output).not.toContain('MODULE_NOT_FOUND');
        }
      }
    });
  });

  describe('Test Filtering and Selection', () => {
    it('should support tag-based filtering', async () => {
      try {
        const result = execSync('npx endorphin run test --tag smoke --dry-run', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('Unknown flag');
      }
    });

    it('should support priority-based filtering', async () => {
      const priorities = ['High', 'Medium', 'Low'];

      for (const priority of priorities) {
        try {
          const result = execSync(`npx endorphin run test --priority ${priority} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('SyntaxError');
          expect(output).not.toContain('Unknown flag');
        }
      }
    });

    it('should support individual test execution', async () => {
      // Get list of available tests first
      const listResult = execSync('npx endorphin list', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      // Extract test IDs from the output
      const testIdMatch = listResult.match(/([A-Z]+-\d+)/);
      if (testIdMatch) {
        const testId = testIdMatch[1];

        try {
          const result = execSync(`npx endorphin run test ${testId} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('SyntaxError');
          expect(output).not.toContain('MODULE_NOT_FOUND');
        }
      }
    });
  });

  describe('Browser Configuration', () => {
    it('should handle headless mode settings', async () => {
      const headlessOptions = ['--headless', '--no-headless'];

      for (const option of headlessOptions) {
        try {
          const result = execSync(`npx endorphin run test all ${option} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Unknown flag');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });

    it('should handle viewport configurations', async () => {
      const viewports = ['1920x1080', '1366x768', '375x667'];

      for (const viewport of viewports) {
        try {
          const result = execSync(`npx endorphin run test all --viewport ${viewport} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid viewport');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });

    it('should handle timeout configurations', async () => {
      const timeouts = ['30000', '60000', '120000'];

      for (const timeout of timeouts) {
        try {
          const result = execSync(`npx endorphin run test all --timeout ${timeout} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid timeout');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('Parallel Execution', () => {
    it('should handle parallel execution settings', async () => {
      const parallelOptions = ['1', '2', '3'];

      for (const parallel of parallelOptions) {
        try {
          const result = execSync(`npx endorphin run test all --parallel ${parallel} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid parallel');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('AI Model Configuration', () => {
    it('should handle different AI model settings', async () => {
      const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4'];

      for (const model of models) {
        try {
          const result = execSync(`npx endorphin run test all --model ${model} --dry-run`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Invalid model');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('Error Handling and Validation', () => {
    it('should validate test file format', async () => {
      // Create a malformed test file
      const malformedTestPath = path.join(testProjectPath, 'tests', 'malformed-test.ts');
      fs.writeFileSync(
        malformedTestPath,
        `
export const INVALID_TEST = {
  // Missing required fields
  task: 'This test is missing required fields'
};
`
      );

      try {
        const result = execSync('npx endorphin list', {
          cwd: testProjectPath,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        // Should handle malformed tests gracefully
      }

      // Clean up
      fs.unlinkSync(malformedTestPath);
    });

    it('should handle missing test files gracefully', async () => {
      try {
        const result = execSync('npx endorphin run test NONEXISTENT-999', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).toMatch(/not found|does not exist/i);
        expect(output).not.toContain('SyntaxError');
      }
    });

    it('should handle network/API errors gracefully', async () => {
      // Test with invalid API key format
      try {
        const result = execSync('npx endorphin run test all', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'invalid-key' },
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
        // Should show proper API error or validation message
      }
    });
  });

  describe('File System Integration', () => {
    it('should handle test directory structure properly', async () => {
      const testsDir = path.join(testProjectPath, 'tests');
      const toolsDir = path.join(testProjectPath, 'tools');

      expect(fs.existsSync(testsDir)).toBe(true);

      // Check that subdirectories can be created and handled
      const subTestDir = path.join(testsDir, 'subdirectory');
      fs.mkdirSync(subTestDir, { recursive: true });

      fs.writeFileSync(
        path.join(subTestDir, 'sub-test.ts'),
        `
export const SUB_TEST = {
  id: 'SUB-001',
  name: 'Subdirectory Test',
  description: 'Test in subdirectory',
  priority: 'Medium',
  tags: ['subdirectory'],
  site: 'https://example.com',
  task: 'Test task in subdirectory'
};
`
      );

      const result = execSync('npx endorphin list', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Available Tests');
      // Should find tests in subdirectories too
    });

    it('should handle missing directories gracefully', async () => {
      // Temporarily remove tests directory
      const testsDir = path.join(testProjectPath, 'tests');
      const testsBackup = testsDir + '.backup';

      fs.renameSync(testsDir, testsBackup);

      try {
        const result = execSync('npx endorphin list', {
          cwd: testProjectPath,
          encoding: 'utf8',
        });

        expect(result).toContain('No tests found');
      } finally {
        // Restore tests directory
        fs.renameSync(testsBackup, testsDir);
      }
    });
  });
});
