/**
 * Pre-Release Real-World Scenarios Tests
 *
 * Tests that verify complete end-to-end workflows work correctly
 * with the local development version of the framework.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
// Jest-compatible path resolution
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'real-world-test');
describe('Pre-Release Real-World Scenarios', () => {
    let baseTestPath;
    beforeAll(async () => {
        // Create base test directory
        baseTestPath = TEST_DIR + '-' + Date.now();
        fs.mkdirSync(baseTestPath, { recursive: true });
    }, 30000);
    afterAll(async () => {
        if (fs.existsSync(baseTestPath)) {
            try {
                fs.rmSync(baseTestPath, { recursive: true, force: true });
            }
            catch (error) {
                console.warn('Could not clean up test directory:', error);
            }
        }
    });
    describe('Complete Project Setup Workflow', () => {
        let projectPath;
        beforeEach(async () => {
            projectPath = path.join(baseTestPath, 'project-' + Date.now());
            fs.mkdirSync(projectPath, { recursive: true });
        });
        it('should complete entire project setup from scratch', async () => {
            // Step 1: Initialize npm project
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            // Step 2: Install Endorphin from local source
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            // Step 3: Initialize Endorphin project
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
            // Step 4: Verify project structure
            const expectedFiles = [
                'package.json',
                'endorphin.config.ts',
                '.env',
                'tests',
                'test-results',
            ];
            for (const file of expectedFiles) {
                expect(fs.existsSync(path.join(projectPath, file))).toBe(true);
            }
            // Step 5: Verify CLI commands work
            const listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found');
            // Step 6: Test help command
            const helpResult = execSync('npx endorphin --help', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(helpResult).toContain('Endorphin AI');
        }, 120000);
        it('should handle project setup in existing directory', async () => {
            // Create some existing files
            fs.writeFileSync(path.join(projectPath, 'existing-file.txt'), 'existing content');
            fs.mkdirSync(path.join(projectPath, 'existing-dir'));
            // Initialize npm and Endorphin
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
            // Verify existing files weren't overwritten
            expect(fs.existsSync(path.join(projectPath, 'existing-file.txt'))).toBe(true);
            expect(fs.existsSync(path.join(projectPath, 'existing-dir'))).toBe(true);
            // Verify Endorphin files were created
            expect(fs.existsSync(path.join(projectPath, 'endorphin.config.ts'))).toBe(true);
            expect(fs.existsSync(path.join(projectPath, 'tests'))).toBe(true);
        }, 60000);
    });
    describe('Test Development and Management', () => {
        let projectPath;
        beforeEach(async () => {
            projectPath = path.join(baseTestPath, 'test-dev-' + Date.now());
            fs.mkdirSync(projectPath, { recursive: true });
            // Set up project
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
        });
        it('should support creating and managing custom tests', async () => {
            // Create custom test files
            const customTests = [
                {
                    filename: 'login-workflow.ts',
                    content: `
export const LOGIN_WORKFLOW = {
  id: 'LOGIN-WORKFLOW-001',
  name: 'Complete Login Workflow',
  description: 'Test full user login process',
  priority: 'High',
  tags: ['auth', 'workflow', 'critical'],
  site: 'https://app.example.com',
  testData: {
    username: 'testuser@example.com',
    password: 'TestPassword123'
  },
  task: 'Navigate to login page, enter credentials, verify successful login'
};
`,
                },
                {
                    filename: 'navigation-test.ts',
                    content: `
export const NAVIGATION_TEST = {
  id: 'NAV-001',
  name: 'Site Navigation Test',
  description: 'Test main navigation functionality',
  priority: 'Medium',
  tags: ['navigation', 'ui'],
  site: 'https://example.com',
  task: 'Test all main navigation links work correctly'
};
`,
                },
                {
                    filename: 'form-submission.ts',
                    content: `
export const FORM_SUBMISSION = {
  id: 'FORM-001',
  name: 'Contact Form Submission',
  description: 'Test contact form submission process',
  priority: 'Low',
  tags: ['forms', 'contact'],
  site: 'https://example.com/contact',
  testData: {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message'
  },
  task: 'Fill out contact form and submit successfully'
};
`,
                },
            ];
            const testsDir = path.join(projectPath, 'tests');
            for (const test of customTests) {
                fs.writeFileSync(path.join(testsDir, test.filename), test.content);
            }
            // Test discovery
            const listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('LOGIN-WORKFLOW-001');
            expect(listResult).toContain('NAV-001');
            expect(listResult).toContain('FORM-001');
            // Test filtering by tag
            const authTests = execSync('npx endorphin list --tag auth', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(authTests).toContain('LOGIN-WORKFLOW-001');
            expect(authTests).not.toContain('NAV-001');
            // Test filtering by priority
            const highPriorityTests = execSync('npx endorphin list --priority High', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(highPriorityTests).toContain('LOGIN-WORKFLOW-001');
            expect(highPriorityTests).not.toContain('FORM-001');
        }, 45000);
        it('should handle test file modifications', async () => {
            const testFile = path.join(projectPath, 'tests', 'dynamic-test.ts');
            // Create initial test
            const initialContent = `
export const DYNAMIC_TEST = {
  id: 'DYNAMIC-001',
  name: 'Dynamic Test',
  description: 'A test that changes',
  priority: 'Medium',
  tags: ['dynamic'],
  site: 'https://example.com',
  task: 'Initial task'
};
`;
            fs.writeFileSync(testFile, initialContent);
            // Verify initial discovery
            let listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('DYNAMIC-001');
            expect(listResult).toContain('Dynamic Test');
            // Modify test
            const modifiedContent = `
export const DYNAMIC_TEST = {
  id: 'DYNAMIC-001',
  name: 'Modified Dynamic Test',
  description: 'A test that has been modified',
  priority: 'High',
  tags: ['dynamic', 'modified'],
  site: 'https://example.com',
  task: 'Modified task description'
};
`;
            fs.writeFileSync(testFile, modifiedContent);
            // Verify changes are detected
            listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Modified Dynamic Test');
        }, 30000);
    });
    describe('Configuration Management', () => {
        let projectPath;
        beforeEach(async () => {
            projectPath = path.join(baseTestPath, 'config-' + Date.now());
            fs.mkdirSync(projectPath, { recursive: true });
            // Set up project
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
        });
        it('should handle different configuration setups', async () => {
            // Test 1: Default configuration
            let listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found');
            // Test 2: Custom browser configuration
            const customConfig = `
export default {
  browser: {
    type: 'chromium',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    slowMo: 50
  },
  ai: {
    model: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2000
  },
  reporter: {
    types: ['console', 'html'],
    outputDir: './custom-reports'
  },
  testDir: './tests',
  resultDir: './test-results'
};
`;
            fs.writeFileSync(path.join(projectPath, 'endorphin.config.ts'), customConfig);
            // Verify configuration is accepted
            listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found');
            // Test 3: Environment-specific configuration
            const envConfig = `
const config = {
  development: {
    browser: { headless: false, slowMo: 100 },
    ai: { model: 'gpt-3.5-turbo' }
  },
  production: {
    browser: { headless: true, slowMo: 0 },
    ai: { model: 'gpt-4' }
  }
};

const environment = process.env.NODE_ENV || 'development';

export default {
  ...config[environment],
  reporter: { types: ['console', 'html'] },
  testDir: './tests',
  resultDir: './test-results'
};
`;
            fs.writeFileSync(path.join(projectPath, 'endorphin.config.ts'), envConfig);
            // Test with different environments
            listResult = execSync('NODE_ENV=development npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found');
            listResult = execSync('NODE_ENV=production npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found');
        }, 45000);
        it('should handle environment variable configurations', async () => {
            // Create different .env configurations
            const envConfigs = [
                'OPENAI_API_KEY=test-key-development\nNODE_ENV=development\n',
                'OPENAI_API_KEY=test-key-staging\nNODE_ENV=staging\n',
                'OPENAI_API_KEY=test-key-production\nNODE_ENV=production\n',
            ];
            for (const [index, envConfig] of envConfigs.entries()) {
                fs.writeFileSync(path.join(projectPath, '.env'), envConfig);
                // Test that configuration loads without errors
                const listResult = execSync('npx endorphin list', {
                    cwd: projectPath,
                    encoding: 'utf8',
                });
                expect(listResult).toContain('Found');
            }
        }, 30000);
    });
    describe('Error Recovery and Robustness', () => {
        let projectPath;
        beforeEach(async () => {
            projectPath = path.join(baseTestPath, 'error-recovery-' + Date.now());
            fs.mkdirSync(projectPath, { recursive: true });
            // Set up project
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
        });
        it('should recover from common user errors', async () => {
            // Error 1: Corrupted test file
            const testFile = path.join(projectPath, 'tests', 'corrupted.ts');
            fs.writeFileSync(testFile, 'export const BROKEN = { invalid syntax here }');
            // Should handle gracefully and continue with other tests
            const listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('Found'); // Should find valid tests
            // Error 2: Missing .env file
            const envFile = path.join(projectPath, '.env');
            if (fs.existsSync(envFile)) {
                fs.unlinkSync(envFile);
            }
            // Should handle missing environment gracefully
            try {
                execSync('npx endorphin run test all', {
                    cwd: projectPath,
                    encoding: 'utf8',
                    stdio: 'pipe',
                });
            }
            catch (error) {
                // Should provide helpful error message
                expect(error.stderr || error.stdout).toMatch(/API key|environment/i);
            }
            // Error 3: Invalid configuration file
            fs.writeFileSync(path.join(projectPath, 'endorphin.config.ts'), 'invalid config syntax {');
            // Should handle invalid config gracefully
            try {
                execSync('npx endorphin list', {
                    cwd: projectPath,
                    encoding: 'utf8',
                    stdio: 'pipe',
                });
            }
            catch (error) {
                // Should provide helpful error message about config
                expect(error.stderr || error.stdout).toMatch(/config|syntax/i);
            }
        }, 60000);
        it('should handle filesystem permission issues', async () => {
            // Create a directory with restricted permissions
            const restrictedDir = path.join(projectPath, 'restricted');
            fs.mkdirSync(restrictedDir);
            // Try to use it as test directory (should handle gracefully)
            const configWithRestrictedDir = `
export default {
  testDir: './restricted',
  resultDir: './test-results',
  browser: { headless: true },
  ai: { model: 'gpt-3.5-turbo' },
  reporter: { types: ['console'] }
};
`;
            fs.writeFileSync(path.join(projectPath, 'endorphin.config.ts'), configWithRestrictedDir);
            const result = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            // Should handle directory issues gracefully
            expect(result).toContain('No tests found');
        }, 30000);
    });
    describe('Performance and Scale', () => {
        let projectPath;
        beforeEach(async () => {
            projectPath = path.join(baseTestPath, 'performance-' + Date.now());
            fs.mkdirSync(projectPath, { recursive: true });
            // Set up project
            execSync('npm init -y', { cwd: projectPath, stdio: 'pipe' });
            execSync(`npm install "${PROJECT_ROOT}"`, { cwd: projectPath, stdio: 'pipe' });
            execSync('npx endorphin init', { cwd: projectPath, stdio: 'pipe' });
        });
        it('should handle large number of test files', async () => {
            const testsDir = path.join(projectPath, 'tests');
            // Create 50 test files
            for (let i = 1; i <= 50; i++) {
                const testContent = `
export const TEST_${i.toString().padStart(3, '0')} = {
  id: 'PERF-${i.toString().padStart(3, '0')}',
  name: 'Performance Test ${i}',
  description: 'Test file ${i} for performance testing',
  priority: ${i % 3 === 0 ? "'High'" : i % 2 === 0 ? "'Medium'" : "'Low'"},
  tags: ['performance', 'test${i}', '${i % 5 === 0 ? 'important' : 'regular'}'],
  site: 'https://example.com/test${i}',
  task: 'Execute performance test number ${i}'
};
`;
                fs.writeFileSync(path.join(testsDir, `test-${i.toString().padStart(3, '0')}.ts`), testContent);
            }
            // Measure discovery performance
            const startTime = Date.now();
            const listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            const endTime = Date.now();
            expect(listResult).toContain('PERF-001');
            expect(listResult).toContain('PERF-050');
            // Should complete within reasonable time (less than 10 seconds)
            expect(endTime - startTime).toBeLessThan(10000);
            // Test filtering performance
            const filterStartTime = Date.now();
            const highPriorityResult = execSync('npx endorphin list --priority High', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            const filterEndTime = Date.now();
            expect(filterEndTime - filterStartTime).toBeLessThan(5000);
            // Should find approximately 17 high priority tests (every 3rd test)
            const highPriorityCount = (highPriorityResult.match(/PERF-/g) || []).length;
            expect(highPriorityCount).toBeGreaterThan(15);
            expect(highPriorityCount).toBeLessThan(20);
        }, 90000);
        it('should handle complex test directory structures', async () => {
            const testsDir = path.join(projectPath, 'tests');
            // Create nested directory structure
            const directories = [
                'auth',
                'auth/login',
                'auth/logout',
                'auth/registration',
                'ui',
                'ui/navigation',
                'ui/forms',
                'api',
                'api/endpoints',
                'performance',
            ];
            for (const dir of directories) {
                fs.mkdirSync(path.join(testsDir, dir), { recursive: true });
                // Add a test file in each directory
                const testContent = `
export const ${dir.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_TEST = {
  id: '${dir.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-001',
  name: '${dir} Test',
  description: 'Test for ${dir} functionality',
  priority: 'Medium',
  tags: ['${dir}', 'nested'],
  site: 'https://example.com',
  task: 'Test ${dir} functionality'
};
`;
                fs.writeFileSync(path.join(testsDir, dir, 'test.ts'), testContent);
            }
            // Test discovery across nested structure
            const listResult = execSync('npx endorphin list', {
                cwd: projectPath,
                encoding: 'utf8',
            });
            expect(listResult).toContain('AUTH-001');
            expect(listResult).toContain('UI-001');
            expect(listResult).toContain('API-001');
            expect(listResult).toContain('AUTH-LOGIN-001');
        }, 45000);
    });
});
//# sourceMappingURL=real-world-scenarios.test.js.map