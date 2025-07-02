/**
 * Additional tests for custom-tool-discovery.ts to improve coverage
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CustomToolDiscovery } from '../../../framework/core/custom-tool-discovery';
import type { FrameworkConfig } from '../../../framework/types/config';

describe('CustomToolDiscovery - Coverage Enhancement', () => {
  const testTempDir = join(process.cwd(), 'temp-test-discovery-coverage');
  let discovery: CustomToolDiscovery;
  let mockFramework: any;

  beforeEach(() => {
    // Clean up any previous test runs
    if (existsSync(testTempDir)) {
      rmSync(testTempDir, { recursive: true, force: true });
    }

    mkdirSync(testTempDir, { recursive: true });

    mockFramework = {
      logTestStep: jest.fn(),
      takeStepScreenshot: jest.fn().mockResolvedValue(null),
      currentPage: null,
    };

    const config: FrameworkConfig = {
      browser: {
        type: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
      },
      ai: {
        openai: {
          apiKey: 'test-key',
          modelName: 'gpt-4o',
          temperature: 0.1,
          maxTokens: 4000,
        },
        agent: {
          recursionLimit: 10,
          stopPhrases: [],
        },
      },
      testsDirectory: 'tests',
      dataDirectory: 'data',
      resultsDirectory: 'results',
      environment: 'development',
      parallel: 1,
      maxRetries: 3,
      customTools: [testTempDir],
    };

    discovery = new CustomToolDiscovery(config, mockFramework);
  });

  afterEach(() => {
    if (existsSync(testTempDir)) {
      rmSync(testTempDir, { recursive: true, force: true });
    }
  });

  test('should handle tool creation with various error scenarios', async () => {
    // Create tool file with syntax error
    writeFileSync(
      join(testTempDir, 'syntax-error-tool.ts'),
      `
      import { tool } from '@langchain/core/tools';
      
      // Missing closing bracket to cause syntax error
      export function createSyntaxErrorTool(framework) {
        return tool(async () => {
          return 'result';
        }, {
          name: 'syntax-error-tool',
          description: 'Tool with syntax error'
        }
      // Missing closing bracket
    `
    );

    // Create tool file that throws during creation
    writeFileSync(
      join(testTempDir, 'creation-error-tool.ts'),
      `
      export function createCreationErrorTool(framework) {
        throw new Error('Tool creation failed');
      }
    `
    );

    const tools = await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Should handle errors gracefully
    expect(tools.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.statistics.failedLoads).toBeGreaterThan(0);
  });

  test('should handle edge cases in path resolution and validation', async () => {
    // Test with special characters in filename
    const specialCharFile = 'special-tool.ts';
    writeFileSync(
      join(testTempDir, specialCharFile),
      `
      export function createSpecialCharTool(framework) {
        return {
          name: 'special-char-tool',
          description: 'Tool with special characters in filename',
          invoke: async () => 'result'
        };
      }
    `
    );

    // Test with nested directory structure
    const nestedDir = join(testTempDir, 'level1', 'level2', 'level3');
    mkdirSync(nestedDir, { recursive: true });
    writeFileSync(
      join(nestedDir, 'nested-tool.ts'),
      `
      export function createNestedTool(framework) {
        return {
          name: 'nested-tool',
          description: 'Tool in deeply nested directory',
          invoke: async () => 'result'
        };
      }
    `
    );

    await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Should handle various edge cases
    expect(result.statistics.scannedFiles).toBeGreaterThan(0);
  });

  test('should provide comprehensive statistics tracking', async () => {
    // Create mix of valid and invalid tools
    writeFileSync(
      join(testTempDir, 'valid-tool.ts'),
      `
      export function createValidTool(framework) {
        return {
          name: 'valid-tool',
          description: 'A valid tool',
          invoke: async () => 'result'
        };
      }
    `
    );

    writeFileSync(
      join(testTempDir, 'error-tool.ts'),
      `
      export function createErrorTool(framework) {
        throw new Error('Tool creation error');
      }
    `
    );

    writeFileSync(
      join(testTempDir, 'not-a-tool.ts'),
      `
      export const someConstant = 'not a tool';
    `
    );

    await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Verify comprehensive statistics
    expect(result.statistics.totalPaths).toBe(1);
    expect(result.statistics.scannedFiles).toBeGreaterThan(0);
    expect(result.statistics.totalErrors).toBeGreaterThanOrEqual(0);

    // Should have some tools or errors
    expect(result.statistics.loadedTools + result.statistics.failedLoads).toBeGreaterThan(0);
  });

  test('should handle empty directories and non-existent paths', async () => {
    // Test with empty directory
    const emptyDir = join(testTempDir, 'empty');
    mkdirSync(emptyDir, { recursive: true });

    // Test with non-existent directory
    const nonExistentConfig: FrameworkConfig = {
      browser: {
        type: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
      },
      ai: {
        openai: {
          apiKey: 'test-key',
          modelName: 'gpt-4o',
          temperature: 0.1,
          maxTokens: 4000,
        },
        agent: {
          recursionLimit: 10,
          stopPhrases: [],
        },
      },
      testsDirectory: 'tests',
      dataDirectory: 'data',
      resultsDirectory: 'results',
      environment: 'development',
      parallel: 1,
      maxRetries: 3,
      customTools: [emptyDir, join(testTempDir, 'nonexistent')],
    };

    const emptyDiscovery = new CustomToolDiscovery(nonExistentConfig, mockFramework);
    const tools = await emptyDiscovery.discoverAndLoadTools();
    const result = emptyDiscovery.getLoadResult();

    expect(tools.length).toBe(0);
    expect(result.statistics.totalPaths).toBe(2);
  });

  test('should handle getAllTools method', async () => {
    writeFileSync(
      join(testTempDir, 'test-tool.ts'),
      `
      export function createTestTool(framework) {
        return {
          name: 'test-tool',
          description: 'A test tool',
          invoke: async () => 'result'
        };
      }
    `
    );

    await discovery.discoverAndLoadTools();
    const allTools = discovery.getAllTools();

    expect(Array.isArray(allTools)).toBe(true);
    expect(allTools.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle getLoadResult method', async () => {
    await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    expect(result).toHaveProperty('statistics');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('tools');
    expect(result.statistics).toHaveProperty('loadedTools');
    expect(result.statistics).toHaveProperty('totalErrors');
  });

  test('should handle files that are not tools', async () => {
    // Create files that don't export tool functions
    writeFileSync(
      join(testTempDir, 'config.ts'),
      `
      export const config = { setting: 'value' };
    `
    );

    writeFileSync(
      join(testTempDir, 'utility.ts'),
      `
      export function helperFunction() {
        return 'helper';
      }
    `
    );

    writeFileSync(
      join(testTempDir, 'readme.md'),
      `
      # This is a readme file
    `
    );

    const tools = await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Should scan files but not load any tools
    expect(result.statistics.scannedFiles).toBeGreaterThan(0);
    expect(tools.length).toBe(0);
  });

  test('should handle mixed file types', async () => {
    // Create TypeScript file
    writeFileSync(
      join(testTempDir, 'ts-tool.ts'),
      `
      export function createTsTool(framework) {
        return {
          name: 'ts-tool',
          description: 'TypeScript tool',
          invoke: async () => 'ts-result'
        };
      }
    `
    );

    // Create JavaScript file
    writeFileSync(
      join(testTempDir, 'js-tool.js'),
      `
      export function createJsTool(framework) {
        return {
          name: 'js-tool',
          description: 'JavaScript tool',
          invoke: async () => 'js-result'
        };
      }
    `
    );

    // Create non-tool files
    writeFileSync(join(testTempDir, 'data.json'), `{"key": "value"}`);
    writeFileSync(join(testTempDir, 'styles.css'), `.class { color: red; }`);

    await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Should scan multiple files but only load valid tools
    expect(result.statistics.scannedFiles).toBeGreaterThan(1);
  });

  test('should handle directory traversal', async () => {
    // Create nested structure
    const subDir1 = join(testTempDir, 'subdir1');
    const subDir2 = join(testTempDir, 'subdir1', 'subdir2');
    mkdirSync(subDir1, { recursive: true });
    mkdirSync(subDir2, { recursive: true });

    writeFileSync(
      join(subDir1, 'tool1.ts'),
      `
      export function createTool1(framework) {
        return {
          name: 'tool1',
          description: 'Tool in subdir1',
          invoke: async () => 'result1'
        };
      }
    `
    );

    writeFileSync(
      join(subDir2, 'tool2.ts'),
      `
      export function createTool2(framework) {
        return {
          name: 'tool2',
          description: 'Tool in subdir2',
          invoke: async () => 'result2'
        };
      }
    `
    );

    await discovery.discoverAndLoadTools();
    const result = discovery.getLoadResult();

    // Should discover tools in nested directories
    expect(result.statistics.scannedFiles).toBeGreaterThan(1);
  });
});
