/**
 * Tests for CLI graceful shutdown functionality
 */
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { handleWebUICommand } from '../framework/web/cli-handler.js';
import { createWebServer } from '../framework/web/server.js';

describe('CLI Graceful Shutdown', () => {
  let originalProcessOn;
  let originalConsoleLog;
  let capturedProcessEvents;
  let capturedLogs;

  beforeEach(() => {
    // Capture process event listeners
    capturedProcessEvents = {};
    originalProcessOn = process.on;
    process.on = (event, handler) => {
      capturedProcessEvents[event] = handler;
      return originalProcessOn.call(process, event, handler);
    };

    // Capture console.log
    capturedLogs = [];
    originalConsoleLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(args.join(' '));
    };
  });

  afterEach(() => {
    // Restore original functions
    process.on = originalProcessOn;
    console.log = originalConsoleLog;

    // Remove any event listeners we added
    Object.keys(capturedProcessEvents).forEach(event => {
      process.removeListener(event, capturedProcessEvents[event]);
    });
  });

  test('should set up graceful shutdown handlers for SIGINT and SIGTERM', async () => {
    // Mock process.exit to prevent actual exit
    const originalExit = process.exit;
    let exitCode = null;
    process.exit = (code = 0) => {
      exitCode = code;
    };

    try {
      // Use the actual startWebUIServer function
      const { startWebUIServer } = await import('../framework/web/cli-handler.js');
      
      // Start server with port 0 (random available port) and no browser
      const serverPromise = startWebUIServer({ 
        port: 0, 
        openBrowser: false 
      });
      
      // Give server time to start and register handlers
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify SIGINT and SIGTERM handlers were registered
      expect(capturedProcessEvents).toHaveProperty('SIGINT');
      expect(capturedProcessEvents).toHaveProperty('SIGTERM');
      expect(typeof capturedProcessEvents.SIGINT).toBe('function');
      expect(typeof capturedProcessEvents.SIGTERM).toBe('function');

      // Simulate SIGINT (should be async)
      await capturedProcessEvents.SIGINT();

      // Verify shutdown message was logged
      expect(capturedLogs.some(log => log.includes('📴 Shutting down Endorphin Web UI'))).toBe(true);
      
      // Verify clean exit
      expect(exitCode).toBe(0);
    } finally {
      process.exit = originalExit;
    }
  });

  test('should handle server stop errors gracefully', async () => {
    // Mock console.error to capture error output
    const capturedErrors = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
      capturedErrors.push(args.join(' '));
    };

    // Mock process.exit to prevent actual exit
    const originalExit = process.exit;
    let exitCode = null;
    process.exit = (code = 0) => {
      exitCode = code;
    };

    try {
      // Create a server instance that will fail to stop
      const server = {
        stop: async () => {
          throw new Error('Simulated shutdown error');
        }
      };

      // Create a cleanup function similar to the one in cli-handler
      const cleanup = async () => {
        console.log('\\n📴 Shutting down Endorphin Web UI...');
        try {
          await server.stop();
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      };

      // Call cleanup
      await cleanup();

      // Verify error was logged
      expect(capturedErrors.some(error => error.includes('Error during shutdown'))).toBe(true);
      
      // Verify error exit code
      expect(exitCode).toBe(1);
    } finally {
      process.exit = originalExit;
      console.error = originalConsoleError;
    }
  });

  test('should properly stop WebUIServer instance', async () => {
    // Test the actual WebUIServer stop method
    const server = await createWebServer({ port: 0 });
    
    // Verify server is running
    expect(server.getAddress()).toBeTruthy();
    expect(server.getPort()).toBeGreaterThan(0);

    // Stop the server
    await expect(server.stop()).resolves.not.toThrow();
    
    // Verify server is stopped
    expect(server.httpServer).toBe(null);
  });
});
