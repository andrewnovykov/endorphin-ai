/**
 * Package Distribution Integration Tests
 * Tests the actual npm pack and distributed package functionality
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

describe('Package Distribution Integration Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeAll(() => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../../../tmp/package-distribution-tests');
  });

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Build Process', () => {
    it('should build successfully without errors', async () => {
      try {
        // Test the actual build process
        const buildOutput = execSync('npm run build', { 
          cwd: originalCwd,
          encoding: 'utf8',
          timeout: 60000 // 1 minute timeout
        });

        // Build should complete without critical errors
        expect(buildOutput).toBeDefined();
        
        // Verify dist directory exists and has expected files
        const distDir = path.join(originalCwd, 'dist');
        const distExists = await fs.access(distDir).then(() => true).catch(() => false);
        expect(distExists).toBe(true);

        // Check for essential distribution files
        const essentialFiles = [
          'index.js',
          'templates/reporter/report-template.html',
          'automation/browser/browser-manager.js',
          'reporters/html-reporter.js'
        ];

        for (const file of essentialFiles) {
          const filePath = path.join(distDir, file);
          const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
          expect(fileExists).toBe(true);
        }

      } catch (error) {
        fail(`Build process failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 120000); // 2 minute timeout for build
  });

  describe('Package Creation', () => {
    it('should create npm package successfully', async () => {
      try {
        // First ensure build is complete
        execSync('npm run build', { cwd: originalCwd, timeout: 60000 });

        // Create the package
        const packOutput = execSync('npm pack --pack-destination ' + testDir, {
          cwd: originalCwd,
          encoding: 'utf8',
          timeout: 30000
        });

        expect(packOutput).toBeDefined();

        // Verify package file was created
        const files = await fs.readdir(testDir);
        const tgzFiles = files.filter(f => f.endsWith('.tgz'));
        expect(tgzFiles.length).toBeGreaterThan(0);

        const packageFile = path.join(testDir, tgzFiles[0]);
        const packageExists = await fs.access(packageFile).then(() => true).catch(() => false);
        expect(packageExists).toBe(true);

      } catch (error) {
        fail(`Package creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 120000);
  });

  describe('Installed Package Functionality', () => {
    it('should work when installed as npm package', async () => {
      try {
        // Build and pack
        execSync('npm run build', { cwd: originalCwd, timeout: 60000 });
        execSync('npm pack --pack-destination ' + testDir, { cwd: originalCwd, timeout: 30000 });

        // Create a test project
        const testProjectDir = path.join(testDir, 'test-project');
        await fs.mkdir(testProjectDir, { recursive: true });

        // Create package.json for test project
        const packageJson = {
          name: 'test-endorphin-project',
          version: '1.0.0',
          type: 'module',
          dependencies: {}
        };
        await fs.writeFile(
          path.join(testProjectDir, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        // Get the created package file
        const files = await fs.readdir(testDir);
        const tgzFile = files.find(f => f.endsWith('.tgz'));
        if (!tgzFile) {
          throw new Error('No package file found');
        }

        const packagePath = path.join(testDir, tgzFile);

        // Install the package
        process.chdir(testProjectDir);
        execSync(`npm install ${packagePath}`, { timeout: 60000 });

        // Test that the package can be imported and used
        const testScript = `
import { HtmlReporter } from 'endorphin-ai';

try {
  const reporter = new HtmlReporter('./test-results');
  console.log('SUCCESS: Package import and instantiation works');
  process.exit(0);
} catch (error) {
  console.error('FAILED: Package import failed:', error.message);
  process.exit(1);
}
`;

        await fs.writeFile(path.join(testProjectDir, 'test-import.mjs'), testScript);

        // Run the test script
        const testOutput = execSync('node test-import.mjs', {
          cwd: testProjectDir,
          encoding: 'utf8',
          timeout: 30000
        });

        expect(testOutput).toContain('SUCCESS');

      } catch (error) {
        fail(`Installed package test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 180000); // 3 minute timeout for full package test
  });

  describe('Template Resolution in Distributed Package', () => {
    it('should find templates when installed as package', async () => {
      try {
        // Build and pack
        execSync('npm run build', { cwd: originalCwd, timeout: 60000 });
        execSync('npm pack --pack-destination ' + testDir, { cwd: originalCwd, timeout: 30000 });

        // Create test project and install package
        const testProjectDir = path.join(testDir, 'template-test-project');
        await fs.mkdir(testProjectDir, { recursive: true });

        const packageJson = {
          name: 'template-test-project',
          version: '1.0.0',
          type: 'module',
          dependencies: {}
        };
        await fs.writeFile(
          path.join(testProjectDir, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        const files = await fs.readdir(testDir);
        const tgzFile = files.find(f => f.endsWith('.tgz'));
        if (!tgzFile) throw new Error('No package file found');

        process.chdir(testProjectDir);
        execSync(`npm install ${path.join(testDir, tgzFile)}`, { timeout: 60000 });

        // Test template resolution from installed package
        const templateTestScript = `
import { HtmlReporter } from 'endorphin-ai';
import fs from 'fs';

try {
  const reporter = new HtmlReporter('./test-results');
  
  // Try to generate a report (this tests template path resolution)
  const mockSessions = [{
    id: 'test-session',
    testId: 'TEST-001',
    testName: 'Template Test',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: 'SUCCESS',
    duration: 1000,
    steps: [],
    screenshots: [],
    finalResult: 'Test completed'
  }];
  
  await reporter.generateReport(mockSessions);
  
  // Check if report was generated (proves templates were found)
  const reportFiles = fs.readdirSync('./test-results/reports').filter(f => f.endsWith('.html'));
  
  if (reportFiles.length > 0) {
    console.log('SUCCESS: Template resolution works in installed package');
    process.exit(0);
  } else {
    console.error('FAILED: No report generated - template resolution failed');
    process.exit(1);
  }
} catch (error) {
  console.error('FAILED: Template resolution error:', error.message);
  process.exit(1);
}
`;

        await fs.writeFile(path.join(testProjectDir, 'template-test.mjs'), templateTestScript);

        const testOutput = execSync('node template-test.mjs', {
          cwd: testProjectDir,
          encoding: 'utf8',
          timeout: 30000
        });

        expect(testOutput).toContain('SUCCESS');

      } catch (error) {
        fail(`Template resolution test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 180000);
  });
});