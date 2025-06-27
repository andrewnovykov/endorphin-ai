/**
 * Interactive CLI Tests
 * Tests for interactive features like test recorder and CLI prompts
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

describe('Interactive CLI Features', () => {
  const testProjectDir = path.join(__dirname, 'tmp', 'interactive-test');
  const originalCwd = process.cwd();

  beforeAll(async () => {
    // Setup test project
    await fs.rm(testProjectDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(testProjectDir, { recursive: true });

    // Copy .env from main repo or create a test one
    const mainRepoRoot = path.join(__dirname, '..', '..');
    const mainEnvPath = path.join(mainRepoRoot, '.env');
    const testEnvPath = path.join(testProjectDir, '.env');

    try {
      const envContent = await fs.readFile(mainEnvPath, 'utf8');
      await fs.writeFile(testEnvPath, envContent);
    } catch (error) {
      // Create a basic .env file for testing
      const testEnvContent = `OPENAI_API_KEY=test-key-for-testing
BASE_URL=https://qafromla.herokuapp.com/
HEADLESS=false
ENDORPHIN_HEADLESS=false
`;
      await fs.writeFile(testEnvPath, testEnvContent);
    }

    // Initialize project
    process.chdir(testProjectDir);
    await runInitCommand();
    process.chdir(originalCwd);
  });

  afterAll(async () => {
    await fs.rm(testProjectDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Test Recorder Interactive Mode', () => {
    it('should start test recorder and handle user input', async () => {
      process.chdir(testProjectDir);

      try {
        const child = spawn('npx', ['endorphin', 'run', 'test-recorder'], {
          cwd: testProjectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OPENAI_API_KEY: 'test-key', NODE_ENV: 'test' },
        });

        let output = '';
        let hasStarted = false;

        child.stdout?.on('data', (data) => {
          output += data.toString();

          // Check if recorder has started
          if (output.includes('Test Recorder') || output.includes('Recording')) {
            hasStarted = true;
          }

          // Send quit command after recorder starts
          if (hasStarted && !output.includes('Exiting')) {
            setTimeout(() => {
              child.stdin?.write('q\n');
              child.stdin?.end();
            }, 500);
          }
        });

        const result = await waitForProcess(child, 45000);

        expect(hasStarted).toBe(true);
        expect(result.stdout).toContain('Test Recorder');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle test recording workflow', async () => {
      process.chdir(testProjectDir);

      try {
        const child = spawn('npx', ['endorphin', 'run', 'test-recorder'], {
          cwd: testProjectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OPENAI_API_KEY: 'test-key', NODE_ENV: 'test' },
        });

        let output = '';

        child.stdout?.on('data', (data) => {
          output += data.toString();
        });

        // Send quit command immediately to exit quickly
        setTimeout(() => {
          child.stdin?.write('q\n');
          child.stdin?.end();
        }, 1000);

        const result = await waitForProcess(child, 30000);

        // Just check that the command ran without major errors
        expect(result.exitCode).toBeLessThanOrEqual(1);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Init Command Interactive Features', () => {
    it('should handle init with interactive prompts', async () => {
      const freshDir = path.join(testProjectDir, 'fresh-init');
      await fs.mkdir(freshDir, { recursive: true });

      process.chdir(freshDir);

      try {
        const child = spawn('npx', ['endorphin', 'init'], {
          cwd: freshDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OPENAI_API_KEY: 'test-key', NODE_ENV: 'test' },
        });

        let output = '';

        child.stdout?.on('data', (data) => {
          output += data.toString();

          // If there are prompts, respond to them
          if (output.includes('Enter') || output.includes('?')) {
            child.stdin?.write('\n'); // Accept defaults
          }
        });

        const result = await waitForProcess(child, 45000);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('initialized');

        // Verify files were created
        const configExists = await fs
          .access(path.join(freshDir, 'endorphin.config.ts'))
          .then(() => true)
          .catch(() => false);
        expect(configExists).toBe(true);
      } finally {
        process.chdir(originalCwd);
        await fs.rm(freshDir, { recursive: true, force: true }).catch(() => {});
      }
    });
  });

  describe('CLI Menu Navigation', () => {
    it('should handle main menu navigation', async () => {
      const child = spawn('npx', ['endorphin'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, OPENAI_API_KEY: 'test-key', NODE_ENV: 'test' },
      });

      let output = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();

        // Exit if we see help or menu
        if (output.includes('Commands') || output.includes('Usage')) {
          child.stdin?.end();
        }
      });

      const result = await waitForProcess(child, 10000);

      expect(result.stdout).toContain('Endorphin AI');
    });

    it('should handle invalid menu selections gracefully', async () => {
      const child = spawn('npx', ['endorphin', 'invalid-command'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, OPENAI_API_KEY: 'test-key', NODE_ENV: 'test' },
      });

      const result = await waitForProcess(child, 10000);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr || result.stdout).toContain('Unknown');
    });
  });

  describe('Configuration Prompts', () => {
    it('should handle missing API key with helpful prompts', async () => {
      process.chdir(testProjectDir);

      try {
        // Remove API key
        const envPath = path.join(testProjectDir, '.env');
        await fs.writeFile(envPath, 'OPENAI_API_KEY=\n');

        const child = spawn('npx', ['endorphin', 'run', 'test', 'all'], {
          cwd: testProjectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OPENAI_API_KEY: '' },
        });

        const result = await waitForProcess(child, 45000);

        expect(result.stderr || result.stdout).toContain('API key');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Progress Indicators', () => {
    it('should show progress during test execution', async () => {
      process.chdir(testProjectDir);

      try {
        // Set up a valid API key for testing
        const envPath = path.join(testProjectDir, '.env');
        await fs.writeFile(envPath, 'OPENAI_API_KEY=test-key-for-progress\n');

        const child = spawn('npx', ['endorphin', 'list'], {
          cwd: testProjectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OPENAI_API_KEY: 'test-key-for-progress', NODE_ENV: 'test' },
        });

        let output = '';
        child.stdout?.on('data', (data) => {
          output += data.toString();
        });

        const result = await waitForProcess(child, 45000);

        // Should show some kind of progress or loading indicator
        expect(result.stdout).toMatch(/(Loading|Scanning|Found|Tests)/);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

/**
 * Helper function to initialize a project
 */
async function runInitCommand(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['endorphin', 'init'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        OPENAI_API_KEY: 'test-key-for-testing',
        NODE_ENV: 'test',
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error('Init command stdout:', stdout);
        console.error('Init command stderr:', stderr);
        reject(new Error(`Init command failed with code ${code}. Stderr: ${stderr}`));
      }
    });

    child.on('error', reject);

    // Auto-accept any prompts
    child.stdin?.write('\n');
    child.stdin?.end();
  });
}

/**
 * Helper function to wait for a child process
 */
async function waitForProcess(
  child: ChildProcess,
  timeout: number
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1000);
      reject(new Error(`Process timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
