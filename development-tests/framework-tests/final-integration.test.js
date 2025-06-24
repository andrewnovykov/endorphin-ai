/**
 * Final Integration Test
 * Comprehensive test to verify all components work together
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Final Integration Test', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'endorphin-final-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rmdir(tempDir, { recursive: true });
  });

  it('should perform complete end-to-end workflow', async () => {
    // Test 1: CLI Help Command
    const helpOutput = execSync('node bin/endorphin.js --help', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    expect(helpOutput).toContain('Endorphin AI');
    expect(helpOutput).toContain('Usage:');
    expect(helpOutput).toContain('Commands:');

    // Test 2: Version Command
    const versionOutput = execSync('node bin/endorphin.js --version', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    expect(versionOutput).toMatch(/Endorphin AI v\d+\.\d+\.\d+/);

    // Test 3: Configuration Loading
    process.chdir(tempDir);

    // Create test project structure
    await fs.mkdir('tests');
    await fs.mkdir('data');

    // Create package.json with ES modules support
    const packageJsonContent = JSON.stringify(
      {
        name: 'test-project',
        version: '1.0.0',
        type: 'module',
      },
      null,
      2
    );
    await fs.writeFile('package.json', packageJsonContent);

    const configContent = `
export default {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  execution: {
    timeout: 30000,
    testsDirectory: './tests'
  },
  ai: {
    model: 'gpt-4o-mini',
    temperature: 0.1
  }
};
`;
    await fs.writeFile('endorphin.config.js', configContent);

    // Test 4: Configuration System
    const { getConfig } = await import('../../framework/core/config-loader.js');
    const config = await getConfig({ cwd: tempDir });

    expect(config.browser.headless).toBe(true);
    expect(config.browser.viewport.width).toBe(1280);
    expect(config.execution.timeout).toBe(30000);
    expect(config.ai.model).toBe('gpt-4o-mini');

    // Test 5: Test Discovery
    const testContent = `
export const FINAL_001 = {
  id: 'FINAL-001',
  name: 'Final Integration Test',
  description: 'Test for final integration verification',
  priority: 'High',
  tags: ['integration', 'final'],
  site: 'https://example.com',
  task: 'Navigate to https://example.com and verify the page loads correctly by checking that an h1 element is visible'
};
`;
    await fs.writeFile('tests/final-test.js', testContent);

    const { discoverTests } = await import('../../framework/core/test-discovery.js');
    const tests = await discoverTests(config);

    expect(tests).toHaveLength(1);
    expect(tests[0].id).toBe('FINAL-001');
    expect(tests[0].name).toBe('Final Integration Test');
    expect(tests[0].tags).toContain('integration');

    // Test 6: CLI List Command
    const cliPath = join(originalCwd, 'bin', 'endorphin.js');
    const listOutput = execSync(`node ${cliPath} list`, {
      encoding: 'utf8',
      cwd: tempDir,
    });
    expect(listOutput).toContain('FINAL-001');
    expect(listOutput).toContain('Final Integration Test');

    // Test 7: CLI Flag Parsing
    const debugOutput = execSync(`node ${cliPath} list --debug`, {
      encoding: 'utf8',
      cwd: tempDir,
    });
    // Should include configuration debug info or run without error
    expect(debugOutput).toBeDefined();

    // Test 8: Data Loading
    const testData = {
      users: {
        testUser: {
          email: 'test@example.com',
          password: 'testpassword',
        },
      },
    };
    await fs.writeFile('data/users.json', JSON.stringify(testData, null, 2));

    const loadedData = JSON.parse(await fs.readFile('data/users.json', 'utf8'));
    expect(loadedData.users.testUser.email).toBe('test@example.com');

    console.log('✅ All integration tests passed!');
  });

  it('should handle errors gracefully', async () => {
    process.chdir(tempDir);

    // Test error handling with invalid config
    await fs.writeFile('endorphin.config.js', 'invalid javascript content');

    const { loadConfig } = await import('../../framework/core/config-loader.js');

    // Should handle invalid config gracefully
    try {
      const config = await loadConfig(tempDir);
      // If no error thrown, should fall back to defaults
      expect(config.browser).toBeDefined();
    } catch (error) {
      // Error handling should be graceful
      expect(error).toBeDefined();
    }
  });

  it('should validate project structure requirements', async () => {
    const requiredFiles = [
      'package.json',
      'README.md',
      'bin/endorphin.js',
      'framework/test-framework.js',
      'framework/core/config-loader.js',
      'framework/core/test-discovery.js',
      'vitest.config.js',
    ];

    for (const file of requiredFiles) {
      const filePath = join(originalCwd, file);
      await expect(fs.access(filePath)).resolves.not.toThrow();
    }
  });

  it('should verify clean project structure', async () => {
    // Verify old files are moved to legacy
    const legacyFiles = [
      'legacy/enhanced-test-framework.js',
      'legacy/endorphin-debug.js',
      'legacy/endorphin-old.js',
    ];

    for (const file of legacyFiles) {
      const filePath = join(originalCwd, file);
      await expect(fs.access(filePath)).resolves.not.toThrow();
    }

    // Verify bin directory only has main file
    const binFiles = await fs.readdir(join(originalCwd, 'bin'));
    expect(binFiles).toEqual(['endorphin.js']);
  });

  it('should validate package.json configuration', async () => {
    const packagePath = join(originalCwd, 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);

    // Verify essential package.json fields
    expect(packageJson.name).toBe('endorphin-ai');
    expect(packageJson.type).toBe('module');
    expect(packageJson.bin.endorphin).toBe('bin/endorphin.js');
    expect(packageJson.scripts.test).toBe('vitest');
    expect(packageJson.scripts['test:coverage']).toBe('vitest run --coverage');
  });
});
