/**
 * Pre-Release Local Installation Tests
 *
 * Tests that verify the Endorphin AI framework can be installed and used
 * from the local development source code before publishing.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Jest-compatible path resolution
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEST_DIR = path.join(__dirname, 'tmp', 'local-install-test');

describe('Pre-Release Local Installation', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = TEST_DIR + '-' + Date.now();

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    fs.mkdirSync(testProjectPath, { recursive: true });

    // Initialize a new npm project
    execSync('npm init -y', {
      cwd: testProjectPath,
      stdio: 'pipe',
    });
  }, 30000);

  afterAll(async () => {
    // Clean up test directory
    if (fs.existsSync(testProjectPath)) {
      try {
        fs.rmSync(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Could not clean up test directory:', error);
      }
    }
  });

  describe('Local Package Installation', () => {
    it('should install the framework from local path', async () => {
      expect(() => {
        // Install from local development path
        execSync(`npm install "${PROJECT_ROOT}"`, {
          cwd: testProjectPath,
          stdio: 'pipe',
        });
      }).not.toThrow();

      // Verify package.json was updated
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(testProjectPath, 'package.json'), 'utf8')
      );

      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['endorphin-ai']).toBeDefined();
    }, 60000);

    it('should have all required files in node_modules', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai');

      expect(fs.existsSync(nodeModulesPath)).toBe(true);

      // Check for essential files
      const requiredFiles = [
        'package.json',
        'bin/endorphin.js',
        'framework/index.js',
        'framework/core/config-loader.js',
        'framework/reporters/html-reporter.js',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(nodeModulesPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have executable CLI command', async () => {
      // Test that the CLI command is available
      const result = execSync('npx endorphin --help', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      expect(result).toContain('Endorphin AI');
      expect(result).toContain('Commands:');
    }, 15000);

    it('should have correct TypeScript declarations', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai');

      // Check for TypeScript declaration files
      const declarationFiles = [
        'framework/index.d.ts',
        'framework/core/config-loader.d.ts',
        'framework/reporters/html-reporter.d.ts',
      ];

      for (const file of declarationFiles) {
        const filePath = path.join(nodeModulesPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });
  });

  describe('Package Dependencies', () => {
    it('should install all required dependencies', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules');

      // Key dependencies that should be installed
      const requiredDeps = ['playwright', 'langchain', '@langchain/openai', 'dotenv'];

      for (const dep of requiredDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        expect(fs.existsSync(depPath)).toBe(true);
      }
    });

    it('should not have development dependencies', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules');

      // Development dependencies that should NOT be installed
      const devDeps = ['jest', 'typescript', '@types/node'];

      for (const dep of devDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        expect(fs.existsSync(depPath)).toBe(false);
      }
    });
  });

  describe('Version Validation', () => {
    it('should report correct version', async () => {
      const result = execSync('npx endorphin --version', {
        cwd: testProjectPath,
        encoding: 'utf8',
      });

      // Read version from source package.json
      const sourcePackageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
      );

      expect(result.trim()).toBe(sourcePackageJson.version);
    });

    it('should have matching package.json version', async () => {
      const installedPackageJson = JSON.parse(
        fs.readFileSync(
          path.join(testProjectPath, 'node_modules', 'endorphin-ai', 'package.json'),
          'utf8'
        )
      );

      const sourcePackageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
      );

      expect(installedPackageJson.version).toBe(sourcePackageJson.version);
      expect(installedPackageJson.name).toBe('endorphin-ai');
    });
  });

  describe('File Integrity', () => {
    it('should have all framework modules', async () => {
      const frameworkPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai', 'framework');

      const requiredModules = ['core', 'reporters', 'tools', 'types', 'runner', 'config'];

      for (const module of requiredModules) {
        const modulePath = path.join(frameworkPath, module);
        expect(fs.existsSync(modulePath)).toBe(true);
        expect(fs.statSync(modulePath).isDirectory()).toBe(true);
      }
    });

    it('should have template files', async () => {
      const templatesPath = path.join(
        testProjectPath,
        'node_modules',
        'endorphin-ai',
        'framework',
        'templates'
      );

      expect(fs.existsSync(templatesPath)).toBe(true);

      const reporterTemplatePath = path.join(templatesPath, 'reporter', 'report-template.html');
      expect(fs.existsSync(reporterTemplatePath)).toBe(true);
    });

    it('should have examples directory', async () => {
      const examplesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai', 'examples');

      expect(fs.existsSync(examplesPath)).toBe(true);

      const configExample = path.join(examplesPath, 'endorphin.config.ts');
      expect(fs.existsSync(configExample)).toBe(true);
    });
  });
});
