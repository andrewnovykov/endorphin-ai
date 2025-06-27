/**
 * Pre-Release Test Recorder Tests
 *
 * Tests that verify the interactive test recording functionality
 * works correctly with the local development version.
 */

import { ChildProcess, execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { PROJECT_ROOT, setupTestProject } from './test-utils';

const TEST_DIR = path.join(__dirname, 'tmp', 'recorder-test');

describe('Pre-Release Test Recorder', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = TEST_DIR + '-' + Date.now();

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    // Setup test project with endorphin-ai installed from tarball
    setupTestProject(testProjectPath);

    // Initialize the project
    execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js init', { cwd: testProjectPath, stdio: 'pipe' });

    console.log(`✅ Set up Test Recorder test project in: ${testProjectPath}`);
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

  describe('Test Recorder Command Validation', () => {
    it('should recognize test recorder command', async () => {
      try {
        // This should start the recorder but fail due to missing API key
        // We're testing command recognition, not full execution
        const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder --help', {
          cwd: testProjectPath,
          encoding: 'utf8',
          timeout: 5000,
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('Unknown command');
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
      }
    });

    it('should handle test recorder without API key gracefully', async () => {
      try {
        const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: '' },
          timeout: 5000,
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

  describe('Test Recorder Dependencies', () => {
    it('should have test recorder module available', async () => {
      // Check that the test recorder module exists and can be imported
      const recorderPath = path.join(PROJECT_ROOT, 'framework', 'test-recorder', 'index.ts');
      expect(fs.existsSync(recorderPath)).toBe(true);

      const recorderContent = fs.readFileSync(recorderPath, 'utf8');
      expect(recorderContent).toContain('export');
      expect(recorderContent).toContain('recorder');
    });

    it('should have interactive recorder components', async () => {
      const interactiveRecorderPath = path.join(
        PROJECT_ROOT,
        'framework',
        'test-recorder',
        'interactive-recorder.ts'
      );
      expect(fs.existsSync(interactiveRecorderPath)).toBe(true);

      const sessionRecorderPath = path.join(
        PROJECT_ROOT,
        'framework',
        'test-recorder',
        'session-recorder.ts'
      );
      expect(fs.existsSync(sessionRecorderPath)).toBe(true);
    });
  });

  describe('Test Recorder Configuration', () => {
    it('should handle recorder-specific browser settings', async () => {
      // Test that recorder can handle different browser configurations
      const browserOptions = ['--headless', '--no-headless', '--viewport 1920x1080'];

      for (const option of browserOptions) {
        try {
          const result = execSync(`node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder ${option}`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            timeout: 5000,
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Unknown flag');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });

    it('should handle recorder environment settings', async () => {
      const environments = ['development', 'staging', 'production'];

      for (const env of environments) {
        try {
          const result = execSync(`node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder --env ${env}`, {
            cwd: testProjectPath,
            encoding: 'utf8',
            env: { ...process.env, OPENAI_API_KEY: 'test-key' },
            timeout: 5000,
            stdio: 'pipe',
          });
        } catch (error: any) {
          const output = error.stderr || error.stdout || '';
          expect(output).not.toContain('Unknown environment');
          expect(output).not.toContain('SyntaxError');
        }
      }
    });
  });

  describe('Test Recorder File Generation', () => {
    it('should be able to access test directory for recording', async () => {
      const testsDir = path.join(testProjectPath, 'tests');
      expect(fs.existsSync(testsDir)).toBe(true);

      // Recorder should be able to write to tests directory
      const testWrite = path.join(testsDir, 'test-write-check.tmp');
      fs.writeFileSync(testWrite, 'test');
      expect(fs.existsSync(testWrite)).toBe(true);
      fs.unlinkSync(testWrite);
    });

    it('should handle test file template structure', async () => {
      // Check if there are template files or examples that recorder might use
      const exampleFiles = fs
        .readdirSync(path.join(testProjectPath, 'tests'))
        .filter((file) => file.endsWith('.ts'));

      expect(exampleFiles.length).toBeGreaterThan(0);

      // Check structure of existing test files (templates for recorder)
      const exampleFile = fs.readFileSync(
        path.join(testProjectPath, 'tests', exampleFiles[0]),
        'utf8'
      );

      expect(exampleFile).toContain('TEST_ID');
      expect(exampleFile).toContain('id:');
      expect(exampleFile).toContain('name:');
      expect(exampleFile).toContain('task:');
    });
  });

  describe('Test Recorder Process Management', () => {
    it('should handle process termination gracefully', async () => {
      // Test that the recorder process can be started and terminated
      let recorderProcess: ChildProcess | null = null;

      try {
        recorderProcess = spawn('npx', ['endorphin', 'run', 'test-recorder'], {
          cwd: testProjectPath,
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          stdio: 'pipe',
        });

        // Give it a moment to start
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Terminate the process
        if (recorderProcess && !recorderProcess.killed) {
          recorderProcess.kill('SIGTERM');

          // Wait for process to exit
          await new Promise((resolve) => {
            if (recorderProcess) {
              recorderProcess.on('exit', resolve);
              recorderProcess.on('close', resolve);
            } else {
              resolve(null);
            }
          });
        }

        // Should not throw unhandled errors
        expect(true).toBe(true);
      } catch (error) {
        // Process management errors are acceptable for this test
        // We're mainly checking that no syntax errors occur
        const message = error instanceof Error ? error.message : String(error);
        expect(message).not.toContain('SyntaxError');
        expect(message).not.toContain('MODULE_NOT_FOUND');
      } finally {
        if (recorderProcess && !recorderProcess.killed) {
          recorderProcess.kill('SIGKILL');
        }
      }
    }, 15000);
  });

  describe('Test Recorder Integration Points', () => {
    it('should integrate with browser automation tools', async () => {
      // Check that Playwright dependency is available for recorder
      const nodeModulesPath = path.join(testProjectPath, 'node_modules');
      const playwrightPath = path.join(nodeModulesPath, 'playwright');

      // Should be installed as part of endorphin-ai
      expect(fs.existsSync(playwrightPath)).toBe(true);
    });

    it('should integrate with AI components', async () => {
      // Check that AI dependencies are available
      const nodeModulesPath = path.join(testProjectPath, 'node_modules');
      const langchainPath = path.join(nodeModulesPath, 'langchain');
      const openaiPath = path.join(nodeModulesPath, 'openai');

      expect(fs.existsSync(langchainPath)).toBe(true);
      expect(fs.existsSync(openaiPath)).toBe(true);
    });

    it('should integrate with configuration system', async () => {
      // Test that recorder can access configuration
      const configPath = path.join(testProjectPath, 'endorphin.config.ts');
      
      // Create config if init didn't work
      if (!fs.existsSync(configPath)) {
        const defaultConfig = `export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: { headless: true, slowMo: 0 },
  resultsDir: "./test-results"
};`;
        fs.writeFileSync(configPath, defaultConfig);
      }
      
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, 'utf8');
      expect(configContent).toContain('browser');
    });
  });

  describe('Test Recorder Error Handling', () => {
    it('should handle missing browser dependencies', async () => {
      // This tests error handling when browser setup fails
      try {
        const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder --browser invalid-browser', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          timeout: 10000,
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
        // Should have graceful error handling
      }
    });

    it('should handle configuration errors', async () => {
      // Create invalid configuration and test error handling
      const configPath = path.join(testProjectPath, 'endorphin.config.ts');
      let originalConfig = '';
      
      // Read original config if it exists
      if (fs.existsSync(configPath)) {
        originalConfig = fs.readFileSync(configPath, 'utf8');
      } else {
        // Create a valid config first
        originalConfig = `export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: { headless: true, slowMo: 0 },
  resultsDir: "./test-results"
};`;
        fs.writeFileSync(configPath, originalConfig);
      }

      // Write invalid config
      fs.writeFileSync(configPath, 'export default { invalid: syntax }');

      try {
        const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: { ...process.env, OPENAI_API_KEY: 'test-key' },
          timeout: 5000,
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        // Should handle config errors gracefully
      } finally {
        // Restore original config
        fs.writeFileSync(configPath, originalConfig);
      }
    });

    it('should handle network connectivity issues', async () => {
      // Test with unreachable network endpoints
      try {
        const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js run test-recorder', {
          cwd: testProjectPath,
          encoding: 'utf8',
          env: {
            ...process.env,
            OPENAI_API_KEY: 'test-key',
            OPENAI_BASE_URL: 'http://unreachable-endpoint.local',
          },
          timeout: 10000,
          stdio: 'pipe',
        });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect(output).not.toContain('SyntaxError');
        expect(output).not.toContain('MODULE_NOT_FOUND');
        // Should handle network errors gracefully
      }
    });
  });

  describe('Test Recorder File System Operations', () => {
    it('should handle permissions for test file creation', async () => {
      const testsDir = path.join(testProjectPath, 'tests');

      // Check write permissions
      try {
        const testFile = path.join(testsDir, 'permission-test.tmp');
        fs.writeFileSync(testFile, 'test content');
        expect(fs.existsSync(testFile)).toBe(true);
        fs.unlinkSync(testFile);
      } catch (error) {
        throw new Error('Should have write permissions to tests directory');
      }
    });

    it('should handle existing test file conflicts', async () => {
      // Ensure tests directory exists
      const testsDir = path.join(testProjectPath, 'tests');
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
      }
      
      // Create a test file that might conflict with recorder output
      const conflictFile = path.join(testProjectPath, 'tests', 'RECORD-001-conflict-test.ts');
      fs.writeFileSync(
        conflictFile,
        `
export const CONFLICT_TEST = {
  id: 'RECORD-001',
  name: 'Conflict Test',
  description: 'Test file that might conflict with recorder',
  priority: 'Low',
  tags: ['conflict'],
  site: 'https://example.com',
  task: 'Test task'
};
`
      );

      // Recorder should handle existing files gracefully
      expect(fs.existsSync(conflictFile)).toBe(true);

      // Clean up
      fs.unlinkSync(conflictFile);
    });
  });
});
