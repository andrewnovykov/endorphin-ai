/**
 * CLI Functionality Integration Tests
 * Tests real CLI command execution and functionality
 */

import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

describe('CLI Functionality Integration Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeAll(() => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../../../tmp/cli-functionality-tests');
  });

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('CLI Init Command', () => {
    it('should create project structure correctly', async () => {
      const projectDir = path.join(testDir, 'test-init-project');
      
      try {
        // Create project directory and cd into it
        await fs.mkdir(projectDir, { recursive: true });
        
        // Test the init command from within the project directory
        const initOutput = execSync(`npx tsx ${path.join(originalCwd, 'bin/endorphin.ts')} init`, {
          cwd: projectDir,
          encoding: 'utf8',
          timeout: 30000
        });

        expect(initOutput).toBeDefined();

        // Verify project structure was created
        const expectedFiles = [
          'package.json',
          'endorphin.config.ts',
          'tests/sample-test.ts',
          'README-ENDORPHIN.md'
        ];

        for (const file of expectedFiles) {
          const filePath = path.join(projectDir, file);
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          expect(exists).toBe(true);
        }

        // Verify package.json has correct dependencies
        const packageJson = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf8'));
        expect(packageJson.dependencies).toHaveProperty('endorphin-ai');
        expect(packageJson.devDependencies).toHaveProperty('@types/node');

        // Verify sample test uses new data format
        const sampleTest = await fs.readFile(path.join(projectDir, 'tests/sample-test.ts'), 'utf8');
        expect(sampleTest).toMatch(/["']?data["']?\s*:\s*async\s*\(\)\s*=>/);
        expect(sampleTest).not.toContain('testData: {');

      } catch (error) {
        throw new Error(`CLI init command failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 60000);
  });

  describe('CLI Help Command', () => {
    it('should display help information', async () => {
      try {
        const helpOutput = execSync('npx tsx bin/endorphin.ts --help', {
          cwd: originalCwd,
          encoding: 'utf8',
          timeout: 15000
        });

        expect(helpOutput).toBeDefined();
        expect(helpOutput).toContain('endorphin');
        expect(helpOutput).toContain('Commands:');
        expect(helpOutput).toContain('init');
        expect(helpOutput).toContain('run');
        expect(helpOutput).toContain('generate');

      } catch (error) {
        throw new Error(`CLI help command failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });

  describe('CLI Run Command Validation', () => {
    it('should validate test existence before running', async () => {
      try {
        // Try to run a non-existent test
        let errorThrown = false;
        let errorOutput = '';
        
        try {
          execSync(`npx tsx ${path.join(originalCwd, 'bin/endorphin.ts')} run test NONEXISTENT-001`, {
            cwd: originalCwd,
            encoding: 'utf8',
            timeout: 15000,
            env: {
              ...process.env,
              OPENAI_API_KEY: 'test-api-key-for-validation'
            }
          });
        } catch (error: any) {
          errorThrown = true;
          errorOutput = error.stdout || error.stderr || error.message;
        }

        expect(errorThrown).toBe(true);
        // Check for various possible error messages (CI may have different output)
        expect(errorOutput.toLowerCase()).toMatch(/(test not found|test.*not.*found|error.*nonexistent|cannot find.*test|scanning for test id.*nonexistent)/);

      } catch (error) {
        throw new Error(`CLI run command validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });

  describe('CLI Generate Report Command', () => {
    it('should handle empty test results gracefully', async () => {
      try {
        let output = '';
        
        try {
          output = execSync('npx tsx bin/endorphin.ts generate report', {
            cwd: originalCwd,
            encoding: 'utf8',
            timeout: 15000
          });
        } catch (error: any) {
          // Mark that we caught an error
          output = error.stdout || error.stderr || error.message;
        }

        // Should either succeed with empty report or give helpful error message
        expect(output).toMatch(/No test results|Report generated|Run some tests first/i);

      } catch (error) {
        throw new Error(`CLI generate report command failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });

  describe('CLI Test Recorder Validation', () => {
    it('should validate test recorder accessibility', async () => {
      try {
        // Test that test recorder can be invoked (but timeout quickly)
        const child = spawn('npx', ['tsx', 'bin/endorphin.ts', 'run', 'test-recorder'], {
          cwd: originalCwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            OPENAI_API_KEY: 'test-api-key-for-validation'
          }
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        // Give it a moment to start, then kill it
        setTimeout(() => {
          child.kill('SIGTERM');
        }, 5000);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            child.kill('SIGKILL'); // Force kill if SIGTERM didn't work
            reject(new Error('Test recorder process did not exit within timeout'));
          }, 10000); // 10 second timeout for process to exit

          child.on('exit', () => {
            clearTimeout(timeout);
            resolve(undefined);
          });
        });

        // Should start the recorder process without import errors
        const combinedOutput = output + errorOutput;
        expect(combinedOutput).not.toMatch(/Cannot find module|Module not found|SyntaxError/i);
        
        // Should contain recorder startup messages
        expect(combinedOutput).toMatch(/Interactive Test Recorder|Test Data Collection|Initializing/i);

      } catch (error) {
        throw new Error(`CLI test recorder validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });

  describe('CLI Command Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      try {
        let errorThrown = false;
        let errorOutput = '';
        
        try {
          execSync('npx tsx bin/endorphin.ts invalid-command', {
            cwd: originalCwd,
            encoding: 'utf8',
            timeout: 15000
          });
        } catch (error: any) {
          errorThrown = true;
          errorOutput = error.stdout || error.stderr || error.message;
        }

        expect(errorThrown).toBe(true);
        expect(errorOutput).toMatch(/Unknown command|Invalid command|help/i);

      } catch (error) {
        throw new Error(`CLI error handling test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });

  describe('CLI Environment Validation', () => {
    it('should validate Node.js environment and dependencies', async () => {
      try {
        // Test that CLI can check environment
        const versionOutput = execSync('npx tsx bin/endorphin.ts --version', {
          cwd: originalCwd,
          encoding: 'utf8',
          timeout: 15000
        });

        expect(versionOutput).toBeDefined();
        expect(versionOutput.trim()).toMatch(/Endorphin AI v\d+\.\d+\.\d+/); // Full version format

      } catch (error) {
        throw new Error(`CLI environment validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 30000);
  });
});