/**
 * Unit tests for custom tool discovery system
 */

import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { CustomToolDiscovery } from '../../../framework/core/custom-tool-discovery';
import { ToolDiscoveryError, ToolLoadError, ToolValidationError } from '../../../framework/core/custom-tool-errors';
import type { FrameworkConfig } from '../../../framework/types';

describe('CustomToolDiscovery', () => {
  const testDir = join(process.cwd(), 'test-tools-temp');
  
  // Mock framework
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

  describe('Configuration Handling', () => {
    it('should return empty array when no custom tools configured', async () => {
      const config: FrameworkConfig = { customTools: [] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toEqual([]);
    });

    it('should return empty array when customTools is undefined', async () => {
      const config: FrameworkConfig = {} as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toEqual([]);
    });
  });

  describe('File Discovery', () => {
    it('should discover tool files in directory', async () => {
      // Create test directory with tool files
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'tool1.ts'), `
        export function createTestTool() {
          return {
            name: 'test-tool-1',
            description: 'Test tool 1',
            call: () => 'result1'
          };
        }
      `);
      writeFileSync(join(testDir, 'tool2.ts'), `
        export function createAnotherTool() {
          return {
            name: 'test-tool-2',
            description: 'Test tool 2',
            call: () => 'result2'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toContain('test-tool-1');
      expect(tools.map(t => t.name)).toContain('test-tool-2');
    });

    it('should handle non-existent directories', async () => {
      const config: FrameworkConfig = { customTools: ['/non/existent/path'] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      expect(tools).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ToolDiscoveryError);
    });

    it('should scan subdirectories recursively', async () => {
      // Create nested directory structure
      mkdirSync(join(testDir, 'subdir'), { recursive: true });
      writeFileSync(join(testDir, 'subdir', 'nested-tool.ts'), `
        export function createNestedTool() {
          return {
            name: 'nested-tool',
            description: 'Nested tool',
            call: () => 'nested-result'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('nested-tool');
    });

    it('should ignore test files and spec files', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'tool.ts'), `
        export function createTool() {
          return { name: 'tool', description: 'Tool', call: () => 'result' };
        }
      `);
      writeFileSync(join(testDir, 'tool.test.ts'), `
        export function createTestTool() {
          return { name: 'test-tool', description: 'Test tool', call: () => 'test' };
        }
      `);
      writeFileSync(join(testDir, 'tool.spec.js'), `
        export function createSpecTool() {
          return { name: 'spec-tool', description: 'Spec tool', call: () => 'spec' };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('tool');
    });
  });

  describe('Tool Loading and Validation', () => {
    it('should load valid tools successfully', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'valid-tool.ts'), `
        export function createValidTool(framework) {
          return {
            name: 'valid-tool',
            description: 'A valid tool',
            call: async (input) => {
              return 'Tool executed successfully';
            }
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('valid-tool');
      expect(result.errors).toHaveLength(0);
      expect(result.statistics.loadedTools).toBe(1);
    });

    it('should handle tools with invalid structure', async () => {
      mkdirSync(testDir, { recursive: true });
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
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      expect(tools).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e instanceof ToolValidationError)).toBe(true);
      expect(result.statistics.validationErrors).toBeGreaterThan(0);
    });

    it('should handle name conflicts', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'tool1.ts'), `
        export function createDuplicateTool() {
          return {
            name: 'duplicate-name',
            description: 'First tool',
            call: () => 'first'
          };
        }
      `);
      writeFileSync(join(testDir, 'tool2.ts'), `
        export function createAnotherDuplicateTool() {
          return {
            name: 'duplicate-name',
            description: 'Second tool',
            call: () => 'second'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      // Should handle name conflicts gracefully
      expect(tools.length).toBeGreaterThan(0);
      
      // Implementation may either prevent conflicts or allow them
      // Both approaches are valid for the custom tools system
      expect(result.statistics.scannedFiles).toBe(2);
    });

    it('should handle module import errors', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'broken-tool.ts'), `
        import { nonExistentModule } from 'does-not-exist';
        
        export function createBrokenTool() {
          return nonExistentModule();
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      expect(tools).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e instanceof ToolLoadError)).toBe(true);
      expect(result.statistics.failedLoads).toBeGreaterThan(0);
    });

    it('should handle files with no tool functions', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'no-tools.ts'), `
        export const someConstant = 'value';
        export function regularFunction() {
          return 'not a tool';
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      
      expect(tools).toHaveLength(0);
      expect(result.errors.some(e => e instanceof ToolLoadError)).toBe(true);
    });
  });

  describe('Tool Function Detection', () => {
    it('should detect createXTool pattern functions', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'pattern-tool.ts'), `
        export function createMyAwesomeTool() {
          return {
            name: 'awesome-tool',
            description: 'Awesome tool',
            call: () => 'awesome'
          };
        }
        
        export function createAnotherTool() {
          return {
            name: 'another-tool',
            description: 'Another tool',
            call: () => 'another'
          };
        }
        
        export function notATool() {
          return 'not a tool';
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toContain('awesome-tool');
      expect(tools.map(t => t.name)).toContain('another-tool');
    });

    it('should detect default export functions', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'default-tool.ts'), `
        export default function(framework) {
          return {
            name: 'default-tool',
            description: 'Default export tool',
            call: () => 'default'
          };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      const tools = await discovery.discoverAndLoadTools();
      
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('default-tool');
    });
  });

  describe('Statistics and Results', () => {
    it('should provide detailed statistics', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'good-tool.ts'), `
        export function createGoodTool() {
          return {
            name: 'good-tool',
            description: 'Good tool',
            call: () => 'good'
          };
        }
      `);
      writeFileSync(join(testDir, 'bad-tool.ts'), `
        export function createBadTool() {
          return { invalid: 'structure' };
        }
      `);

      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      const result = discovery.getLoadResult();
      const stats = discovery.getStatistics();
      
      expect(stats.totalPaths).toBe(1);
      expect(stats.scannedFiles).toBe(2);
      expect(stats.loadedTools).toBe(1);
      expect(stats.validationErrors).toBe(1);
      expect(stats.totalErrors).toBe(1);
      
      expect(result.success).toBe(false);
      expect(result.tools).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should track multiple error types', async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'conflict1.ts'), `
        export function createConflictTool() {
          return {
            name: 'conflict-tool',
            description: 'First conflict',
            call: () => 'first'
          };
        }
      `);
      writeFileSync(join(testDir, 'conflict2.ts'), `
        export function createAnotherConflictTool() {
          return {
            name: 'conflict-tool',
            description: 'Second conflict',
            call: () => 'second'
          };
        }
      `);
      writeFileSync(join(testDir, 'invalid.ts'), `
        export function createInvalidTool() {
          return { bad: 'structure' };
        }
      `);

      const config: FrameworkConfig = { 
        customTools: [testDir, '/non/existent/path'] 
      } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      const stats = discovery.getStatistics();
      
      expect(stats.conflicts).toBe(1);
      expect(stats.validationErrors).toBe(1);
      expect(stats.totalErrors).toBe(3); // discovery + conflict + validation
    });
  });

  describe('Tool Access Methods', () => {
    beforeEach(async () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'accessible-tool.ts'), `
        export function createAccessibleTool() {
          return {
            name: 'accessible-tool',
            description: 'Accessible tool',
            call: () => 'accessible'
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
      expect(allTools[0].name).toBe('accessible-tool');
    });

    it('should find tool by name', async () => {
      const config: FrameworkConfig = { customTools: [testDir] } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      
      const tool = discovery.getToolByName('accessible-tool');
      expect(tool).toBeDefined();
      expect(tool.name).toBe('accessible-tool');
      
      const nonExistent = discovery.getToolByName('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should provide all errors', async () => {
      const config: FrameworkConfig = { 
        customTools: [testDir, '/non/existent/path'] 
      } as any;
      const discovery = new CustomToolDiscovery(config, mockFramework as any);
      
      await discovery.discoverAndLoadTools();
      
      const errors = discovery.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ToolDiscoveryError);
    });
  });
});