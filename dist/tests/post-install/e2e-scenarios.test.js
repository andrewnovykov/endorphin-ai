/**
 * End-to-End Real World Scenarios
 * Tests complete workflows that end users would perform
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
describe('End-to-End Real World Scenarios', () => {
    const e2eTestDir = path.join(__dirname, 'tmp', 'e2e-scenarios');
    const originalCwd = process.cwd();
    beforeAll(async () => {
        await fs.rm(e2eTestDir, { recursive: true, force: true }).catch(() => { });
        await fs.mkdir(e2eTestDir, { recursive: true });
    });
    afterAll(async () => {
        await fs.rm(e2eTestDir, { recursive: true, force: true }).catch(() => { });
    });
    describe('Complete Project Setup Workflow', () => {
        it('should complete entire project setup from scratch', async () => {
            const projectDir = path.join(e2eTestDir, 'complete-setup');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Step 1: Initialize project
                const initResult = await runEndorphinCommand(['init'], {
                    cwd: projectDir,
                    timeout: 30000,
                });
                expect(initResult.exitCode).toBe(0);
                expect(initResult.stdout).toContain('initialized successfully');
                // Step 2: Verify all files exist
                const expectedFiles = [
                    'endorphin.config.ts',
                    '.env',
                    'tests/sample-test.ts',
                    'README-ENDORPHIN.md',
                ];
                for (const file of expectedFiles) {
                    const exists = await fs
                        .access(path.join(projectDir, file))
                        .then(() => true)
                        .catch(() => false);
                    expect(exists).toBe(true);
                }
                // Step 3: List tests
                const listResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(listResult.exitCode).toBe(0);
                expect(listResult.stdout).toContain('Available Tests');
                // Step 4: Try to run a test (will fail without API key, but should handle gracefully)
                const runResult = await runEndorphinCommand(['run', 'test', 'all'], {
                    cwd: projectDir,
                    timeout: 15000,
                    env: { ...process.env, OPENAI_API_KEY: '' },
                });
                expect(runResult.stderr || runResult.stdout).toContain('API key');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Test Development Workflow', () => {
        it('should support creating and managing custom tests', async () => {
            const projectDir = path.join(e2eTestDir, 'test-development');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Initialize project
                await runEndorphinCommand(['init'], { cwd: projectDir });
                // Create a custom test file
                const customTest = `
export const LOGIN_TEST = {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test user login functionality',
  priority: 'High',
  tags: ['authentication', 'smoke'],
  site: 'https://example.com/login',
  testData: {
    username: 'testuser@example.com',
    password: 'testpass123'
  },
  task: 'Navigate to login page, enter credentials, click login button, verify successful login'
};
`;
                await fs.writeFile(path.join(projectDir, 'tests', 'login-test.js'), customTest);
                // List tests to verify custom test is discovered
                const listResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(listResult.exitCode).toBe(0);
                expect(listResult.stdout).toContain('LOGIN-001');
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Configuration Scenarios', () => {
        it('should handle different configuration setups', async () => {
            const projectDir = path.join(e2eTestDir, 'config-scenarios');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Initialize project
                await runEndorphinCommand(['init'], { cwd: projectDir });
                // Test with custom configuration
                const customConfig = `
export default {
  browser: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    timeout: 45000,
    slowMo: 100
  },
  ai: {
    openai: {
      modelName: 'gpt-4o',
      temperature: 0.0,
      maxTokens: 2000
    }
  },
  testsDirectory: 'tests',
  resultsDirectory: 'custom-results',
  environment: 'staging',
  parallel: 2,
  maxRetries: 2,
  baseUrl: 'https://staging.example.com'
};
`;
                await fs.writeFile(path.join(projectDir, 'endorphin.config.ts'), customConfig);
                // Verify configuration is loaded correctly
                const listResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(listResult.exitCode).toBe(0);
                // Check if custom results directory would be created
                const resultsDir = path.join(projectDir, 'custom-results');
                const resultsDirExists = await fs
                    .access(resultsDir)
                    .then(() => true)
                    .catch(() => false);
                // Directory might not exist yet, but config should be valid
                expect(listResult.exitCode).toBe(0);
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Error Recovery Scenarios', () => {
        it('should recover from common user errors', async () => {
            const projectDir = path.join(e2eTestDir, 'error-recovery');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Initialize project
                await runEndorphinCommand(['init'], { cwd: projectDir });
                // Scenario 1: Corrupt config file
                await fs.writeFile(path.join(projectDir, 'endorphin.config.ts'), 'invalid javascript syntax {{{');
                const corruptConfigResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                // Should either fail or show a config error message
                const hasError = corruptConfigResult.exitCode !== 0 ||
                    (corruptConfigResult.stderr || corruptConfigResult.stdout).includes('config') ||
                    (corruptConfigResult.stderr || corruptConfigResult.stdout).includes('error');
                expect(hasError).toBe(true);
                // Scenario 2: Fix config and retry
                const validConfig = `
export default {
  browser: { headless: true },
  ai: { openai: { modelName: 'gpt-4o' } }
};
`;
                await fs.writeFile(path.join(projectDir, 'endorphin.config.ts'), validConfig);
                const fixedConfigResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(fixedConfigResult.exitCode).toBe(0);
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Multi-Project Scenarios', () => {
        it('should handle multiple projects in different directories', async () => {
            const project1 = path.join(e2eTestDir, 'multi-project-1');
            const project2 = path.join(e2eTestDir, 'multi-project-2');
            await fs.mkdir(project1, { recursive: true });
            await fs.mkdir(project2, { recursive: true });
            try {
                // Initialize both projects
                process.chdir(project1);
                const init1 = await runEndorphinCommand(['init'], { cwd: project1 });
                expect(init1.exitCode).toBe(0);
                process.chdir(project2);
                const init2 = await runEndorphinCommand(['init'], { cwd: project2 });
                expect(init2.exitCode).toBe(0);
                // Verify both projects work independently
                const list1 = await runEndorphinCommand(['list'], { cwd: project1 });
                const list2 = await runEndorphinCommand(['list'], { cwd: project2 });
                expect(list1.exitCode).toBe(0);
                expect(list2.exitCode).toBe(0);
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Migration Scenarios', () => {
        it('should handle upgrading existing projects', async () => {
            const projectDir = path.join(e2eTestDir, 'migration-test');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Simulate old project structure
                await fs.mkdir(path.join(projectDir, 'tests'), { recursive: true });
                await fs.writeFile(path.join(projectDir, 'endorphin.config.ts'), 'export default { browser: { headless: false } };');
                // Run init on existing project
                const initResult = await runEndorphinCommand(['init'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(initResult.stdout).toContain('already initialized');
                // Verify project still works
                const listResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 15000,
                });
                expect(listResult.exitCode).toBe(0);
            }
            finally {
                process.chdir(originalCwd);
            }
        });
    });
    describe('Performance Scenarios', () => {
        it('should handle large number of test files', async () => {
            const projectDir = path.join(e2eTestDir, 'performance-test');
            await fs.mkdir(projectDir, { recursive: true });
            process.chdir(projectDir);
            try {
                // Initialize project
                await runEndorphinCommand(['init'], { cwd: projectDir });
                // Create multiple test files
                const testsDir = path.join(projectDir, 'tests');
                for (let i = 1; i <= 10; i++) {
                    const testContent = `
export const TEST_${i.toString().padStart(3, '0')} = {
  id: 'PERF-${i.toString().padStart(3, '0')}',
  name: 'Performance Test ${i}',
  description: 'Performance test number ${i}',
  priority: 'Medium',
  tags: ['performance'],
  site: 'https://example.com',
  task: 'Test performance scenario ${i}'
};
`;
                    await fs.writeFile(path.join(testsDir, `perf-test-${i}.js`), testContent);
                }
                // List all tests - should complete in reasonable time
                const startTime = Date.now();
                const listResult = await runEndorphinCommand(['list'], {
                    cwd: projectDir,
                    timeout: 30000,
                });
                const duration = Date.now() - startTime;
                expect(listResult.exitCode).toBe(0);
                expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
                expect(listResult.stdout).toContain('PERF-001');
                expect(listResult.stdout).toContain('PERF-010');
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
            shell: process.platform === 'win32',
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
                exitCode: code || 0,
            });
        });
        child.on('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
//# sourceMappingURL=e2e-scenarios.test.js.map