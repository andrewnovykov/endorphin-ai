/**
 * End-User Post-Install Tests
 * Tests the package as an end user would use it after npm install
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
describe('Post-Install End-User Scenarios', () => {
    const testProjectDir = path.join(__dirname, 'tmp', 'test-endorphin');
    const originalCwd = process.cwd();
    beforeAll(async () => {
        // Clean up any existing test directory
        try {
            await fs.rm(testProjectDir, { recursive: true, force: true });
        }
        catch (error) {
            // Directory might not exist, that's fine
        }
        // Create fresh test directory
        await fs.mkdir(testProjectDir, { recursive: true });
    });
    afterAll(async () => {
        // Cleanup test directory
        try {
            await fs.rm(testProjectDir, { recursive: true, force: true });
        }
        catch (error) {
            console.warn('Failed to cleanup test directory:', error);
        }
    });
    describe('Project Initialization', () => {
        it('should initialize a new project with init command', async () => {
            // Change to test directory
            process.chdir(testProjectDir);
            try {
                // Run endorphin init command
                const result = await runEndorphinCommand(['init'], {
                    cwd: testProjectDir,
                    timeout: 30000,
                });
                expect(result.exitCode).toBe(0);
                expect(result.stdout).toContain('Endorphin AI project initialized successfully');
                // Verify required files were created
                const expectedFiles = [
                    'endorphin.config.ts',
                    '.env',
                    'tests/sample-test.ts',
                    'README-ENDORPHIN.md',
                    '.gitignore',
                ];
                for (const file of expectedFiles) {
                    const filePath = path.join(testProjectDir, file);
                    const exists = await fs
                        .access(filePath)
                        .then(() => true)
                        .catch(() => false);
                    expect(exists).toBe(true);
                }
                // Verify directory structure
                const expectedDirs = ['tests', 'test-results', 'test-recorder'];
                for (const dir of expectedDirs) {
                    const dirPath = path.join(testProjectDir, dir);
                    const stats = await fs.stat(dirPath);
                    expect(stats.isDirectory()).toBe(true);
                }
            }
            finally {
                process.chdir(originalCwd);
            }
        });
        it('should handle init command with existing project gracefully', async () => {
            process.chdir(testProjectDir);
            try {
                // Run init command again on already initialized project
                const result = await runEndorphinCommand(['init'], {
                    cwd: testProjectDir,
                    timeout: 15000,
                });
                expect(result.stdout).toContain('already initialized');
                expect(result.stdout).toContain('Run: npx endorphin run test');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('CLI Help and Information', () => {
        it('should display help information', async () => {
            const result = await runEndorphinCommand(['--help'], {
                timeout: 10000,
            });
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Endorphin AI');
            expect(result.stdout).toContain('Commands:');
            expect(result.stdout).toContain('init');
            expect(result.stdout).toContain('run test');
            expect(result.stdout).toContain('list');
        });
        it('should display version information', async () => {
            const result = await runEndorphinCommand(['--version'], {
                timeout: 10000,
            });
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toMatch(/\d+\.\d+\.\d+/); // Version format
        });
    });
    describe('Test Discovery and Listing', () => {
        it('should list available tests', async () => {
            process.chdir(testProjectDir);
            try {
                const result = await runEndorphinCommand(['list'], {
                    cwd: testProjectDir,
                    timeout: 15000,
                });
                // Should find the sample test created during init
                expect(result.stdout).toContain('Available Tests');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
        it('should handle empty test directory gracefully', async () => {
            // Create a temporary directory with no tests
            const emptyDir = path.join(testProjectDir, 'empty-project');
            await fs.mkdir(emptyDir, { recursive: true });
            process.chdir(emptyDir);
            try {
                const result = await runEndorphinCommand(['list'], {
                    cwd: emptyDir,
                    timeout: 15000,
                });
                expect(result.stdout).toContain('Tests directory not found');
            }
            finally {
                process.chdir(originalCwd);
                await fs.rm(emptyDir, { recursive: true, force: true });
            }
        });
    });
    describe('Test Execution', () => {
        it('should handle test execution with missing API key', async () => {
            process.chdir(testProjectDir);
            try {
                // Remove API key from environment
                const envPath = path.join(testProjectDir, '.env');
                await fs.writeFile(envPath, 'OPENAI_API_KEY=');
                const result = await runEndorphinCommand(['run', 'test', 'all'], {
                    cwd: testProjectDir,
                    timeout: 15000,
                    env: { ...process.env, OPENAI_API_KEY: '' },
                });
                // Should fail gracefully with helpful error message
                expect(result.stderr || result.stdout).toContain('API key');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
        it('should validate test run command syntax', async () => {
            const result = await runEndorphinCommand(['run'], {
                timeout: 10000,
            });
            // Should show usage information for incomplete command
            expect(result.stdout || result.stderr).toContain('help');
        });
    });
    describe('Interactive CLI Features', () => {
        it('should handle interactive input for test recorder', async () => {
            process.chdir(testProjectDir);
            try {
                // Start test recorder and immediately exit
                const child = spawn('npx', ['endorphin', 'run', 'test-recorder'], {
                    cwd: testProjectDir,
                    stdio: ['pipe', 'pipe', 'pipe'],
                });
                // Send exit command after short delay
                setTimeout(() => {
                    child.stdin?.write('q\n'); // Quit command
                    child.stdin?.end();
                }, 1000);
                const result = await waitForProcess(child, 10000);
                // Should start the recorder interface
                expect(result.stdout).toContain('ENDORPHIN');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Configuration Handling', () => {
        it('should use custom configuration file', async () => {
            process.chdir(testProjectDir);
            try {
                // Modify config file
                const configPath = path.join(testProjectDir, 'endorphin.config.ts');
                const customConfig = `
export default {
  browser: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    timeout: 60000
  },
  ai: {
    openai: {
      modelName: 'gpt-4o',
      temperature: 0.0
    }
  },
  testsDirectory: 'tests',
  environment: 'testing'
};`;
                await fs.writeFile(configPath, customConfig);
                // List tests to verify config is loaded
                const result = await runEndorphinCommand(['list'], {
                    cwd: testProjectDir,
                    timeout: 15000,
                });
                expect(result.exitCode).toBe(0);
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid commands gracefully', async () => {
            const result = await runEndorphinCommand(['invalid-command'], {
                timeout: 10000,
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderr || result.stdout).toContain('Unknown command');
        });
        it('should handle corrupted project files', async () => {
            process.chdir(testProjectDir);
            try {
                // Corrupt the config file
                const configPath = path.join(testProjectDir, 'endorphin.config.ts');
                await fs.writeFile(configPath, 'invalid javascript content {{{');
                const result = await runEndorphinCommand(['list'], {
                    cwd: testProjectDir,
                    timeout: 15000,
                });
                // Should handle error gracefully
                expect(result.stderr || result.stdout).toContain('config');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
});
/**
 * Helper function to run endorphin CLI commands
 */
async function runEndorphinCommand(args, options = {}) {
    const { cwd = process.cwd(), timeout = 30000, env = process.env } = options;
    return new Promise((resolve, reject) => {
        const child = spawn('npx', ['endorphin', ...args], {
            cwd,
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
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
            child.kill();
            reject(new Error(`Command timed out after ${timeout}ms`));
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
/**
 * Helper function to wait for a child process
 */
async function waitForProcess(child, timeout) {
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
            child.kill();
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
//# sourceMappingURL=end-user-scenarios.test.js.map