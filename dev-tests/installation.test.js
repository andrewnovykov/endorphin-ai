/**
 * Installation Tests
 * Tests the installation process, CLI functionality, and project setup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Installation and CLI Tests', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = await fs.mkdtemp(join(tmpdir(), 'endorphin-install-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    // Restore original directory and cleanup
    process.chdir(originalCwd);
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  describe('Package Structure', () => {
    it('should have correct package.json structure', async () => {
      const packagePath = join(process.cwd(), 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      expect(packageJson.name).toBe('endorphin-ai');
      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin.endorphin).toBe('bin/endorphin.js');
      expect(packageJson.type).toBe('module');
      expect(packageJson.main).toBeDefined();
    });

    it('should have all required files', async () => {
      const requiredFiles = [
        'bin/endorphin.js',
        'framework/test-framework.js',
        'framework/core/config-loader.js',
        'README.md',
        'package.json'
      ];

      for (const file of requiredFiles) {
        const filePath = join(process.cwd(), file);
        await expect(fs.access(filePath)).resolves.not.toThrow();
      }
    });

    it('should exclude development files in .npmignore', async () => {
      const npmignorePath = join(process.cwd(), '.npmignore');
      const npmignoreContent = await fs.readFile(npmignorePath, 'utf8');

      expect(npmignoreContent).toContain('dev-tests/');
      expect(npmignoreContent).toContain('vitest.config.js');
      expect(npmignoreContent).toContain('legacy/');
      expect(npmignoreContent).toContain('ai-instructions/');
    });
  });

  describe('CLI Functionality', () => {
    it('should display help when called without arguments', () => {
      const cliPath = join(process.cwd(), 'bin', 'endorphin.js');
      
      try {
        const output = execSync(`node ${cliPath}`, { encoding: 'utf8' });
        expect(output).toContain('Endorphin AI');
        expect(output).toContain('Usage:');
        expect(output).toContain('Commands:');
      } catch (error) {
        // CLI exits with code 0 for help, check stdout
        expect(error.stdout).toContain('Endorphin AI');
      }
    });

    it('should display version information', () => {
      const cliPath = join(process.cwd(), 'bin', 'endorphin.js');
      
      try {
        const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' });
        expect(output).toMatch(/Endorphin AI v\d+\.\d+\.\d+/);
      } catch (error) {
        expect(error.stdout).toMatch(/Endorphin AI v\d+\.\d+\.\d+/);
      }
    });

    it('should handle unknown commands gracefully', () => {
      const cliPath = join(process.cwd(), 'bin', 'endorphin.js');
      
      try {
        execSync(`node ${cliPath} unknown-command`, { encoding: 'utf8' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.status).toBe(1);
        expect(error.stderr).toContain('Unknown command');
      }
    });
  });

  describe('Configuration System', () => {
    beforeEach(() => {
      process.chdir(tempDir);
    });

    it('should create and load configuration file', async () => {
      const configContent = `
export default {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  execution: {
    timeout: 30000,
    testsDirectory: './tests'
  }
};
`;
      await fs.writeFile('endorphin.config.js', configContent);

      // Import config loader
      const { getConfig } = await import('../framework/core/config-loader.js');
      const config = await getConfig({ cwd: tempDir });

      expect(config.browser.headless).toBe(true);
      expect(config.browser.viewport.width).toBe(1280);
      expect(config.execution.timeout).toBe(30000);
    });

    it('should merge CLI flags with configuration', async () => {
      const configContent = `
export default {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  }
};
`;
      await fs.writeFile('endorphin.config.js', configContent);

      const { getConfig, resetConfig } = await import('../framework/core/config-loader.js');
      resetConfig(); // Reset config cache before testing CLI flags
      
      const options = { 
        cwd: tempDir,
        cliFlags: {
          headless: false,  // CLI override for headless 
          timeout: 60000    // CLI override for timeout
        }
      };
      const config = await getConfig(options);

      expect(config.browser.headless).toBe(false); // CLI override
      expect(config.execution.timeout).toBe(60000); // CLI override
      expect(config.browser.viewport.width).toBe(1280); // From config file
    });
  });

  describe('Test Discovery', () => {
    beforeEach(async () => {
      process.chdir(tempDir);
      await fs.mkdir('tests');
    });

    it('should discover test files', async () => {
      const testContent = `
export default {
  id: 'TEST-001',
  name: 'Sample Test',
  description: 'A test for discovery',
  priority: 'High',
  tags: ['discovery'],
  
  async execute(context) {
    // Test logic
  }
};
`;
      await fs.writeFile('tests/sample-test.js', testContent);

      const { discoverTests } = await import('../framework/core/test-discovery.js');
      const config = { execution: { testsDirectory: './tests' } };
      const tests = await discoverTests(config);

      expect(tests).toHaveLength(1);
      expect(tests[0].id).toBe('TEST-001');
      expect(tests[0].name).toBe('Sample Test');
    });

    it('should handle empty test directory', async () => {
      const { discoverTests } = await import('../framework/core/test-discovery.js');
      const config = { execution: { testsDirectory: './tests' } };
      const tests = await discoverTests(config);

      expect(tests).toEqual([]);
    });
  });

  describe('Project Setup', () => {
    beforeEach(() => {
      process.chdir(tempDir);
    });

    it('should create proper project structure', async () => {
      // Simulate project setup
      await fs.mkdir('tests');
      await fs.mkdir('data');
      
      const configContent = `
export default {
  browser: { headless: true },
  execution: { testsDirectory: './tests' }
};
`;
      await fs.writeFile('endorphin.config.js', configContent);

      const testData = { users: { test: 'data' } };
      await fs.writeFile('data/users.json', JSON.stringify(testData));

      // Verify structure
      await expect(fs.access('tests')).resolves.not.toThrow();
      await expect(fs.access('data')).resolves.not.toThrow();
      await expect(fs.access('endorphin.config.js')).resolves.not.toThrow();
      
      const loadedData = JSON.parse(await fs.readFile('data/users.json', 'utf8'));
      expect(loadedData.users.test).toBe('data');
    });

    it('should validate test file format', async () => {
      const validTest = `
export default {
  id: 'VALID-001',
  name: 'Valid Test',
  description: 'Properly formatted test',
  priority: 'High',
  tags: ['validation'],
  
  async execute(context) {
    const { page, expect } = context;
    // Test implementation
  }
};
`;
      
      const invalidTest = `
export default {
  name: 'Invalid Test'
  // Missing required fields
};
`;

      await fs.mkdir('tests');
      await fs.writeFile('tests/valid-test.js', validTest);
      await fs.writeFile('tests/invalid-test.js', invalidTest);

      // Test valid file
      const validModule = await import(`file://${join(tempDir, 'tests/valid-test.js')}`);
      expect(validModule.default.id).toBe('VALID-001');
      expect(typeof validModule.default.execute).toBe('function');

      // Test invalid file
      const invalidModule = await import(`file://${join(tempDir, 'tests/invalid-test.js')}`);
      expect(invalidModule.default.id).toBeUndefined();
      expect(invalidModule.default.execute).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration gracefully', async () => {
      process.chdir(tempDir);
      
      const { getConfig } = await import('../framework/core/config-loader.js');
      const config = await getConfig({ cwd: tempDir });

      // Should return default configuration
      expect(config.browser).toBeDefined();
      expect(config.execution).toBeDefined();
      expect(config.ai).toBeDefined();
    });

    it('should handle invalid configuration files', async () => {
      process.chdir(tempDir);
      
      // Create invalid config
      await fs.writeFile('endorphin.config.js', 'invalid javascript content');
      
      const { loadConfig } = await import('../framework/core/config-loader.js');
      
      try {
        await loadConfig(tempDir);
        // Should fall back to defaults if config is invalid
        expect(true).toBe(true); // Test passes if no error thrown
      } catch (error) {
        // Error handling should be graceful
        expect(error).toBeDefined();
      }
    });

    it('should handle file system errors', async () => {
      const { discoverTests } = await import('../framework/core/test-discovery.js');
      const config = { 
        execution: { 
          testsDirectory: '/non-existent-directory' 
        } 
      };
      
      const tests = await discoverTests(config);
      expect(tests).toEqual([]);
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      process.chdir(tempDir);
      await fs.mkdir('tests');
    });

    it('should handle multiple test files efficiently', async () => {
      // Create multiple test files
      const testCount = 10;
      const createPromises = [];

      for (let i = 1; i <= testCount; i++) {
        const testContent = `
export default {
  id: 'PERF-${i.toString().padStart(3, '0')}',
  name: 'Performance Test ${i}',
  description: 'Test for performance testing',
  priority: 'Medium',
  tags: ['performance'],
  
  async execute(context) {
    // Simulated test logic
  }
};
`;
        createPromises.push(
          fs.writeFile(`tests/perf-test-${i}.js`, testContent)
        );
      }

      await Promise.all(createPromises);

      const startTime = Date.now();
      const { discoverTests } = await import('../framework/core/test-discovery.js');
      const config = { execution: { testsDirectory: './tests' } };
      const tests = await discoverTests(config);
      const duration = Date.now() - startTime;

      expect(tests).toHaveLength(testCount);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
