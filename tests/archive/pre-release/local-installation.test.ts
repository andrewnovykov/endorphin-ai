/**
 * Pre-Release Local Installation Tests
 *
 * Tests that verify the Endorphin AI framework can be installed and used
 * from the local development source code before publishing.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, getPackageVersion, setupTestProject } from './test-utils';

const TEST_DIR = path.join(__dirname, 'tmp', 'local-install-test');

describe('Pre-Release Local Installation', () => {
  let testProjectPath: string;

  beforeAll(async () => {
    // Create a clean test directory
    testProjectPath = `${TEST_DIR  }-${  Date.now()}`;

    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    // Setup test project with endorphin-ai installed from tarball
    setupTestProject(testProjectPath);
  }, 60000);

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
      // Verify package.json was updated
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(testProjectPath, 'package.json'), 'utf8')
      );

      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['endorphin-ai']).toBeDefined();
    });

    it('should have all required files in node_modules', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai');

      expect(fs.existsSync(nodeModulesPath)).toBe(true);

      // Check for essential files
      const requiredFiles = [
        'package.json',
        'dist/bin/endorphin.js',
        'dist/framework/index.js',
        'dist/framework/core/config-loader.js',
        'dist/framework/reporters/html-reporter.js',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(nodeModulesPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have executable CLI command', async () => {
      // Test that the CLI command is available (use direct node execution)
      const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js --help', {
        cwd: testProjectPath,
        encoding: 'utf8',
        timeout: 30000,
      });

      expect(result).toContain('Endorphin AI');
      expect(result).toContain('Commands:');
    }, 15000);

    it('should have correct TypeScript declarations', async () => {
      const nodeModulesPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai');

      // Check for TypeScript declaration files
      const declarationFiles = [
        'dist/framework/index.d.ts',
        'dist/framework/core/config-loader.d.ts',
        'dist/framework/reporters/html-reporter.d.ts',
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
      const requiredDeps = ['playwright', 'langchain', '@langchain/core', 'dotenv', 'openai'];

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
      const result = execSync('node node_modules/endorphin-ai/dist/bin/endorphin.js --version', {
        cwd: testProjectPath,
        encoding: 'utf8',
        timeout: 30000,
      });

      // Check version matches current package version
      const currentVersion = getPackageVersion();
      expect(result.trim()).toBe(`Endorphin AI v${currentVersion}`);
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
      const frameworkPath = path.join(testProjectPath, 'node_modules', 'endorphin-ai', 'dist', 'framework');

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
        'dist',
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
