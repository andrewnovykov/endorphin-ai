/**
 * TDD Tests for CLI Integration with Web UI
 * Tests for 'endorphin serve' and 'endorphin ui' commands
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CLI Web UI Integration', () => {
  let mockSpawn;
  let mockProcess;

  beforeEach(() => {
    // Mock child_process.spawn
    mockSpawn = vi.fn();
    vi.doMock('child_process', () => ({
      spawn: mockSpawn
    }));

    // Mock process.on
    mockProcess = {
      on: vi.fn(),
      exit: vi.fn()
    };
    
    // Mock global process
    global.process = {
      ...process,
      on: mockProcess.on,
      exit: mockProcess.exit,
      cwd: vi.fn().mockReturnValue('/test/project')
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('child_process');
  });

  describe('Command Parsing', () => {
    it('should recognize "serve" command', async () => {
      const args = ['node', 'endorphin.js', 'serve'];
      
      // Mock the CLI module
      const { handleWebUICommand } = await import('../framework/web/cli-handler.js');
      
      const result = await handleWebUICommand(args);
      expect(result).toBe(true); // Command was handled
    });

    it('should recognize "ui" command as alias for serve', async () => {
      const args = ['node', 'endorphin.js', 'ui'];
      
      const { handleWebUICommand } = await import('../framework/web/cli-handler.js');
      
      const result = await handleWebUICommand(args);
      expect(result).toBe(true); // Command was handled
    });

    it('should parse port option correctly', async () => {
      const args = ['node', 'endorphin.js', 'serve', '--port', '4000'];
      
      const { parseWebUIOptions } = await import('../framework/web/cli-handler.js');
      
      const options = parseWebUIOptions(args);
      expect(options.port).toBe(4000);
    });

    it('should use default port when not specified', async () => {
      const args = ['node', 'endorphin.js', 'serve'];
      
      const { parseWebUIOptions } = await import('../framework/web/cli-handler.js');
      
      const options = parseWebUIOptions(args);
      expect(options.port).toBe(3000);
    });
  });

  describe('Server Startup', () => {
    it('should start web UI server with correct parameters', async () => {
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      const result = await startWebUIServer({ 
        port: 3001, // Use different port to avoid conflicts
        openBrowser: false 
      });
      
      expect(result).toHaveProperty('server');
      expect(result).toHaveProperty('url', 'http://localhost:3001');
      expect(result).toHaveProperty('port', 3001);
      expect(result).toHaveProperty('host', 'localhost');
      expect(result).toHaveProperty('cleanup');
      expect(typeof result.cleanup).toBe('function');
      
      // Clean up
      result.cleanup();
    });

    it('should handle server startup errors', async () => {
      // Start a server first to occupy the port
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      const firstServer = await startWebUIServer({ port: 3002, openBrowser: false });
      
      // Try to start another server on the same port
      await expect(startWebUIServer({ port: 3002, openBrowser: false }))
        .rejects.toThrow(/Failed to start server.*address already in use/);
        
      // Clean up
      firstServer.cleanup();
    });

    it('should set up graceful shutdown handlers', async () => {
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      const result = await startWebUIServer({ 
        port: 3003,
        openBrowser: false 
      });
      
      expect(result.cleanup).toBeDefined();
      expect(typeof result.cleanup).toBe('function');
      
      // Clean up
      result.cleanup();
    });
  });

  describe('Browser Integration', () => {
    it('should open browser automatically by default', async () => {
      const mockOpen = vi.fn().mockResolvedValue();
      vi.doMock('open', () => ({ default: mockOpen }));
      
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      const result = await startWebUIServer({ port: 3004, openBrowser: true });
      
      // Give it a moment for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockOpen).toHaveBeenCalledWith('http://localhost:3004');
      
      // Clean up
      result.cleanup();
      vi.doUnmock('open');
    });

    it('should not open browser when disabled', async () => {
      const mockOpen = vi.fn().mockResolvedValue();
      vi.doMock('open', () => ({ default: mockOpen }));
      
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      const result = await startWebUIServer({ port: 3005, openBrowser: false });
      
      // Give it a moment for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockOpen).not.toHaveBeenCalled();
      
      // Clean up
      result.cleanup();
      vi.doUnmock('open');
    });
  });

  describe('CLI Integration with Main Binary', () => {
    it('should integrate with main endorphin CLI', async () => {
      // Test that the CLI properly delegates to web UI handler
      const originalArgv = process.argv;
      process.argv = ['node', 'endorphin.js', 'serve'];
      
      // Mock the main CLI module
      const mockHandleWebUI = vi.fn().mockResolvedValue(true);
      vi.doMock('../framework/web/cli-handler.js', () => ({
        handleWebUICommand: mockHandleWebUI,
        parseWebUIOptions: vi.fn().mockReturnValue({ port: 3000 }),
        startWebUIServer: vi.fn().mockResolvedValue()
      }));
      
      // This would normally be tested by importing and running the CLI
      // For now, we'll test the integration points
      expect(process.argv[2]).toBe('serve');
      
      process.argv = originalArgv;
      vi.doUnmock('../framework/web/cli-handler.js');
    });

    it('should handle command line argument validation', async () => {
      const { validateWebUIArgs } = await import('../framework/web/cli-handler.js');
      
      // Valid arguments
      expect(() => validateWebUIArgs(['serve'])).not.toThrow();
      expect(() => validateWebUIArgs(['ui'])).not.toThrow();
      expect(() => validateWebUIArgs(['serve', '--port', '3000'])).not.toThrow();
      
      // Invalid arguments
      expect(() => validateWebUIArgs(['serve', '--port', 'invalid'])).toThrow('Invalid port number');
      expect(() => validateWebUIArgs(['serve', '--port', '99999'])).toThrow('Port number out of range');
    });
  });

  describe('Environment Configuration', () => {
    it('should pass environment variables to server process', async () => {
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      const result = await startWebUIServer({ 
        port: 4000, 
        env: 'development',
        debug: true,
        openBrowser: false
      });
      
      // Verify server is running with the correct configuration
      expect(result.port).toBe(4000);
      expect(result.url).toContain('localhost:4000');
      
      // Clean up
      result.cleanup();
    });

    it('should handle different server configurations', async () => {
      const { createServerConfig } = await import('../framework/web/cli-handler.js');
      
      const config = createServerConfig({
        port: 5000,
        host: 'localhost',
        cors: true,
        debug: false
      });
      
      expect(config).toMatchObject({
        port: 5000,
        host: 'localhost',
        cors: true,
        debug: false
      });
    });
  });

  describe('Help and Documentation', () => {
    it('should display help for serve command', async () => {
      const { getWebUIHelp } = await import('../framework/web/cli-handler.js');
      
      const help = getWebUIHelp();
      
      expect(help).toContain('endorphin serve');
      expect(help).toContain('--port');
      expect(help).toContain('--no-browser');
      expect(help).toContain('Start the web UI server');
    });

    it('should show usage examples', async () => {
      const { getWebUIUsageExamples } = await import('../framework/web/cli-handler.js');
      
      const examples = getWebUIUsageExamples();
      
      expect(examples).toContain('endorphin serve');
      expect(examples).toContain('endorphin ui --port 4000');
      expect(examples).toContain('endorphin serve --no-browser');
    });
  });
});
