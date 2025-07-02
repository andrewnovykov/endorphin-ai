/**
 * Basic integration tests for the custom tools system
 */

import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { CustomToolDiscovery } from '../../../framework/core/custom-tool-discovery';
import type { FrameworkConfig } from '../../../framework/types';

describe('Custom Tools Basic Integration', () => {
  const testDir = join(process.cwd(), 'test-basic-temp');
  
  // Mock enhanced browser test framework
  const mockFramework = {
    config: {} as any,
    logTestStep: jest.fn(),
    takeStepScreenshot: jest.fn().mockResolvedValue(null),
    currentPage: null,
  };

  beforeEach(() => {
    // Clean up any existing test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Tool Loading', () => {
    it('should load a simple custom tool', async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'simple-tool.ts'), `
        export function createSimpleTool() {
          return {
            name: 'simple-tool',
            description: 'A simple tool for testing',
            call: () => 'simple result'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      const tools = await discovery.discoverAndLoadTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('simple-tool');
      expect(tools[0].description).toBe('A simple tool for testing');
      
      const result = await tools[0].call();
      expect(result).toBe('simple result');
    });

    it('should handle multiple tools in one file', async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'multi-tools.ts'), `
        export function createFirstTool() {
          return {
            name: 'first-tool',
            description: 'First tool',
            call: () => 'first'
          };
        }

        export function createSecondTool() {
          return {
            name: 'second-tool',
            description: 'Second tool',
            call: () => 'second'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      const tools = await discovery.discoverAndLoadTools();

      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toContain('first-tool');
      expect(tools.map(t => t.name)).toContain('second-tool');
    });

    it('should handle async tools', async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'async-tool.ts'), `
        export function createAsyncTool() {
          return {
            name: 'async-tool',
            description: 'An async tool',
            call: async (input) => {
              await new Promise(resolve => setTimeout(resolve, 10));
              return \`async result: \${input}\`;
            }
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      const tools = await discovery.discoverAndLoadTools();

      expect(tools).toHaveLength(1);
      
      const result = await tools[0].call('test');
      expect(result).toBe('async result: test');
    });

    it('should provide detailed statistics', async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'valid-tool.ts'), `
        export function createValidTool() {
          return {
            name: 'valid-tool',
            description: 'Valid tool',
            call: () => 'valid'
          };
        }
      `);

      writeFileSync(join(testDir, 'invalid-tool.ts'), `
        export function createInvalidTool() {
          return {
            // Missing required fields
            badField: 'invalid'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();

      expect(result.statistics.scannedFiles).toBe(2);
      expect(result.statistics.loadedTools).toBe(1);
      expect(result.statistics.validationErrors).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle tools with invalid structure gracefully', async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'broken-tool.ts'), `
        export function createBrokenTool() {
          return {
            name: 'broken-tool',
            // Missing description and call method
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();

      expect(tools).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.statistics.validationErrors).toBe(1);
    });

    it('should handle non-existent directories gracefully', async () => {
      const config: FrameworkConfig = { 
        customTools: ['/non/existent/directory'] 
      } as any;
      
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();

      expect(tools).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.statistics.totalPaths).toBe(1);
    });
  });

  describe('Tool Discovery API', () => {
    beforeEach(async () => {
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'api-tool.ts'), `
        export function createApiTool() {
          return {
            name: 'api-tool',
            description: 'API tool for testing',
            call: () => 'api result'
          };
        }
      `);
    });

    it('should provide access to loaded tools', async () => {
      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      
      const allTools = discovery.getLoadedTools();
      expect(allTools).toHaveLength(1);
      expect(allTools[0].name).toBe('api-tool');
    });

    it('should find tools by name', async () => {
      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      
      const tool = discovery.getToolByName('api-tool');
      expect(tool).toBeDefined();
      expect(tool.name).toBe('api-tool');
      
      const nonExistent = discovery.getToolByName('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should provide comprehensive statistics', async () => {
      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      const stats = discovery.getStatistics();
      
      expect(stats.totalPaths).toBe(1);
      expect(stats.scannedFiles).toBe(1);
      expect(stats.loadedTools).toBe(1);
      expect(stats.failedLoads).toBe(0);
      expect(stats.validationErrors).toBe(0);
      expect(stats.conflicts).toBe(0);
      expect(stats.totalErrors).toBe(0);
    });
  });
});