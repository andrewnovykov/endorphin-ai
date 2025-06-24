import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { initProject } from '../framework/core/init-command.js';

describe('Init Command', () => {
  let testDir;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(process.cwd(), 'tmp', `test-init-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create all required files and directories', async () => {
    await initProject(testDir);

    // Check directories
    const dirs = ['tests', 'test-results', 'test-recorder'];
    for (const dir of dirs) {
      const dirPath = path.join(testDir, dir);
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    }

    // Check files
    const files = ['.env', 'endorphin.config.js', 'tests/sample-test.js', '.gitignore', 'README-ENDORPHIN.md'];
    for (const file of files) {
      const filePath = path.join(testDir, file);
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
    }
  });

  it('should create valid configuration file', async () => {
    await initProject(testDir);
    
    const configPath = path.join(testDir, 'endorphin.config.js');
    const configContent = await fs.readFile(configPath, 'utf8');
    
    // Check that config contains expected structure
    expect(configContent).toContain('export default {');
    expect(configContent).toContain('browser:');
    expect(configContent).toContain('results:');
    expect(configContent).toContain('ai:');
  });

  it('should create valid sample test file', async () => {
    await initProject(testDir);
    
    const testPath = path.join(testDir, 'tests', 'sample-test.js');
    const testContent = await fs.readFile(testPath, 'utf8');
    
    // Check that test has required structure
    expect(testContent).toContain('export const HEALTH_001');
    expect(testContent).toContain('id: "HEALTH-001"');
    expect(testContent).toContain('task:');
  });

  it('should create environment file with placeholder', async () => {
    await initProject(testDir);
    
    const envPath = path.join(testDir, '.env');
    const envContent = await fs.readFile(envPath, 'utf8');
    
    expect(envContent).toContain('OPENAI_API_KEY=your_openai_api_key_here');
    expect(envContent).toContain('HEADLESS=false');
  });

  it('should not overwrite existing configuration', async () => {
    // Create an existing config file
    const configPath = path.join(testDir, 'endorphin.config.js');
    const originalContent = 'export default { custom: "config" };';
    await fs.writeFile(configPath, originalContent);

    await initProject(testDir);

    // Config should not be overwritten
    const configContent = await fs.readFile(configPath, 'utf8');
    expect(configContent).toBe(originalContent);
  });

  it('should handle non-existent target directory', async () => {
    const nonExistentDir = path.join(testDir, 'non-existent');
    
    // Should not throw an error
    await expect(initProject(nonExistentDir)).resolves.not.toThrow();
    
    // Directory should be created
    const stats = await fs.stat(nonExistentDir);
    expect(stats.isDirectory()).toBe(true);
  });
});
