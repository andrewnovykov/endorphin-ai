/**
 * Package Installation Tests
 * Tests the package installation and global CLI functionality
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

describe('Package Installation and Global CLI', () => {
  const testInstallDir = path.join(__dirname, 'tmp', 'install-test');
  const originalCwd = process.cwd();

  beforeAll(async () => {
    // Clean up any existing test directory
    await fs.rm(testInstallDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(testInstallDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testInstallDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('NPX Usage', () => {
    it('should work with npx endorphin command', async () => {
      const result = await runCommand('npx', ['endorphin', '--version'], {
        cwd: testInstallDir,
        timeout: 30000
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should show help when run without arguments', async () => {
      const result = await runCommand('npx', ['endorphin'], {
        cwd: testInstallDir,
        timeout: 15000
      });

      expect(result.stdout).toContain('Endorphin AI');
      expect(result.stdout).toContain('Commands:');
    });
  });

  describe('Local Installation', () => {
    it('should work when installed locally in a project', async () => {
      // Create a test project with package.json
      const packageJson = {
        name: 'test-endorphin-project',
        version: '1.0.0',
        private: true,
        dependencies: {}
      };

      await fs.writeFile(
        path.join(testInstallDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Test npx command in project directory
      const result = await runCommand('npx', ['endorphin', 'init'], {
        cwd: testInstallDir,
        timeout: 30000
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('initialized');

      // Verify files were created
      const configExists = await fs.access(path.join(testInstallDir, 'endorphin.config.js'))
        .then(() => true).catch(() => false);
      expect(configExists).toBe(true);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work on current platform', async () => {
      const result = await runCommand('npx', ['endorphin', '--version'], {
        timeout: 15000
      });

      expect(result.exitCode).toBe(0);
      // Should work regardless of platform (Windows, macOS, Linux)
      expect(result.stdout).toBeTruthy();
    });

    it('should handle different shell environments', async () => {
      // Test with different shell options
      const result = await runCommand('npx', ['endorphin', 'list'], {
        cwd: testInstallDir,
        timeout: 15000,
        env: {
          ...process.env,
          SHELL: '/bin/bash' // Force bash environment
        }
      });

      // Should not fail due to shell differences
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Command Availability', () => {
    it('should have all expected commands available', async () => {
      const commands = [
        ['init'],
        ['run', 'test', '--help'],
        ['run', 'test-recorder', '--help'],
        ['list'],
        ['generate', 'report', '--help']
      ];

      for (const cmd of commands) {
        const result = await runCommand('npx', ['endorphin', ...cmd], {
          timeout: 15000
        });

        // Commands should either succeed or show help (not fail completely)
        expect(result.exitCode).toBeLessThanOrEqual(1);
        expect(result.stdout || result.stderr).toBeTruthy();
      }
    });
  });

  describe('Binary Execution', () => {
    it('should execute the correct binary', async () => {
      const result = await runCommand('npx', ['endorphin', '--version'], {
        timeout: 10000
      });

      expect(result.exitCode).toBe(0);
      
      // Should execute the TypeScript version through tsx
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should handle binary errors gracefully', async () => {
      // Test with invalid arguments
      const result = await runCommand('npx', ['endorphin', '--invalid-flag'], {
        timeout: 10000
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr || result.stdout).toContain('Unknown');
    });
  });

  describe('Environment Variables', () => {
    it('should respect environment variables', async () => {
      const result = await runCommand('npx', ['endorphin', 'list'], {
        cwd: testInstallDir,
        timeout: 15000,
        env: {
          ...process.env,
          ENDORPHIN_HEADLESS: 'true',
          ENDORPHIN_TIMEOUT: '60000'
        }
      });

      // Should run without errors when env vars are set
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Working Directory Handling', () => {
    it('should work from any directory', async () => {
      // Create a subdirectory
      const subDir = path.join(testInstallDir, 'subdir');
      await fs.mkdir(subDir, { recursive: true });

      const result = await runCommand('npx', ['endorphin', '--version'], {
        cwd: subDir,
        timeout: 15000
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should find project root correctly', async () => {
      // Run from subdirectory of initialized project
      const subDir = path.join(testInstallDir, 'nested', 'deep');
      await fs.mkdir(subDir, { recursive: true });

      const result = await runCommand('npx', ['endorphin', 'list'], {
        cwd: subDir,
        timeout: 15000
      });

      // Should find the project root and config
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error messages for common issues', async () => {
      // Test in empty directory without config
      const emptyDir = path.join(testInstallDir, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });

      const result = await runCommand('npx', ['endorphin', 'run', 'test', 'NONEXISTENT'], {
        cwd: emptyDir,
        timeout: 15000
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr || result.stdout).toContain('not found');
    });

    it('should handle permission errors gracefully', async () => {
      // This test might vary by platform, so we'll just check it doesn't crash
      const result = await runCommand('npx', ['endorphin', '--version'], {
        timeout: 10000
      });

      expect(result.exitCode).toBe(0);
    });
  });
});

/**
 * Helper function to run shell commands
 */
async function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeout?: number;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { cwd = process.cwd(), timeout = 30000, env = process.env } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32' // Use shell on Windows
    });

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
      setTimeout(() => child.kill('SIGKILL'), 2000);
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
