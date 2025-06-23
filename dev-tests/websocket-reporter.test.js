/**
 * Test-Driven Development for WebSocket Reporter
 * Tests for real-time test execution broadcasting
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketReporter } from '../framework/web/websocket-reporter.js';

describe('WebSocketReporter', () => {
  let mockWebSocketServer;
  let mockClient1;
  let mockClient2;
  let reporter;

  beforeEach(() => {
    // Mock WebSocket clients
    mockClient1 = {
      readyState: 1, // WebSocket.OPEN
      send: vi.fn()
    };
    
    mockClient2 = {
      readyState: 1, // WebSocket.OPEN
      send: vi.fn()
    };
    
    // Mock WebSocket server
    mockWebSocketServer = {
      clients: new Set([mockClient1, mockClient2]),
      on: vi.fn(),
      emit: vi.fn()
    };
    
    reporter = new WebSocketReporter(mockWebSocketServer);
  });

  describe('Broadcasting', () => {
    it('should broadcast messages to all connected clients', () => {
      const testMessage = { type: 'test', data: 'hello' };
      
      reporter.broadcast(testMessage);
      
      const expectedMessage = JSON.stringify(testMessage);
      expect(mockClient1.send).toHaveBeenCalledWith(expectedMessage);
      expect(mockClient2.send).toHaveBeenCalledWith(expectedMessage);
    });

    it('should only send to clients with OPEN readyState', () => {
      // Set one client to closed state
      mockClient2.readyState = 3; // WebSocket.CLOSED
      
      const testMessage = { type: 'test', data: 'hello' };
      reporter.broadcast(testMessage);
      
      expect(mockClient1.send).toHaveBeenCalled();
      expect(mockClient2.send).not.toHaveBeenCalled();
    });

    it('should handle empty client list gracefully', () => {
      mockWebSocketServer.clients = new Set();
      
      expect(() => {
        reporter.broadcast({ type: 'test' });
      }).not.toThrow();
    });
  });

  describe('Test Event Broadcasting', () => {
    it('should broadcast test start event', () => {
      const testInfo = {
        id: 'TEST-001',
        name: 'Sample Test',
        description: 'Test description'
      };
      
      reporter.onTestStart(testInfo);
      
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"test-start"/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"test":\{"id":"TEST-001","name":"Sample Test"\}/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"timestamp":"[\d-T:.Z]+"/));
    });

    it('should broadcast test step event', () => {
      const stepInfo = {
        stepNumber: 1,
        description: 'Navigate to homepage',
        status: 'running'
      };
      
      reporter.onTestStep(stepInfo);
      
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"test-step"/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"step":\{"stepNumber":1,"description":"Navigate to homepage","status":"running"\}/)
      );
    });

    it('should broadcast test complete event', () => {
      const result = {
        testId: 'TEST-001',
        success: true,
        duration: 5000,
        steps: []
      };
      
      reporter.onTestComplete(result);
      
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"test-complete"/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"result":/)
      );
    });

    it('should broadcast test error event', () => {
      const error = {
        message: 'Test failed',
        stack: 'Error stack trace'
      };
      
      reporter.onTestError(error);
      
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"test-error"/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"error":/)
      );
    });

    it('should broadcast screenshot event', () => {
      const screenshotInfo = {
        path: '/path/to/screenshot.png',
        stepNumber: 2
      };
      
      reporter.onTestScreenshot(screenshotInfo);
      
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"test-screenshot"/)
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringMatching(/"screenshot":\{"path":"\/path\/to\/screenshot.png","stepNumber":2\}/)
      );
    });
  });

  describe('Console Reporter Integration', () => {
    it('should extend ConsoleReporter functionality', () => {
      // Mock stdout.write method (used by ConsoleReporter)
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => {});
      
      const testInfo = { id: 'TEST-001', name: 'Test' };
      
      // Should call both parent console logging AND WebSocket broadcasting
      reporter.onTestStart(testInfo);
      
      // Verify stdout output (inherited from ConsoleReporter)
      expect(stdoutSpy).toHaveBeenCalled();
      
      // Verify WebSocket broadcasting (new functionality)
      expect(mockClient1.send).toHaveBeenCalled();
      
      stdoutSpy.mockRestore();
    });

    it('should maintain all ConsoleReporter methods', () => {
      // Verify that WebSocketReporter has all expected methods
      expect(typeof reporter.onTestStart).toBe('function');
      expect(typeof reporter.onTestStep).toBe('function');
      expect(typeof reporter.onTestComplete).toBe('function');
      expect(typeof reporter.onTestError).toBe('function');
      expect(typeof reporter.onTestScreenshot).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle client send errors gracefully', () => {
      mockClient1.send = vi.fn().mockImplementation(() => {
        throw new Error('Client disconnected');
      });
      
      expect(() => {
        reporter.broadcast({ type: 'test' });
      }).not.toThrow();
      
      // Should still send to other clients
      expect(mockClient2.send).toHaveBeenCalled();
    });

    it('should handle malformed message data', () => {
      const circularRef = {};
      circularRef.self = circularRef;
      
      expect(() => {
        reporter.broadcast(circularRef);
      }).not.toThrow();
    });
  });

  describe('Real-time Updates', () => {
    it('should include accurate timestamps', () => {
      const beforeTime = new Date();
      
      reporter.onTestStart({ id: 'TEST-001' });
      
      const afterTime = new Date();
      const sentMessage = JSON.parse(mockClient1.send.mock.calls[0][0]);
      const messageTime = new Date(sentMessage.timestamp);
      
      expect(messageTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(messageTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should preserve message order for sequential events', () => {
      reporter.onTestStart({ id: 'TEST-001' });
      reporter.onTestStep({ stepNumber: 1, description: 'Step 1' });
      reporter.onTestStep({ stepNumber: 2, description: 'Step 2' });
      reporter.onTestComplete({ success: true });
      
      expect(mockClient1.send).toHaveBeenCalledTimes(4);
      
      const calls = mockClient1.send.mock.calls;
      const messages = calls.map(call => JSON.parse(call[0]));
      
      expect(messages[0].type).toBe('test-start');
      expect(messages[1].type).toBe('test-step');
      expect(messages[1].step.stepNumber).toBe(1);
      expect(messages[2].type).toBe('test-step');
      expect(messages[2].step.stepNumber).toBe(2);
      expect(messages[3].type).toBe('test-complete');
    });
  });
});
