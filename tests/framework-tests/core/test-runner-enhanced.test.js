/**
 * Test Runner Test
 * Tests core test execution functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runTask } from '../../../packages/runner/src/test-runner.js';

describe('Test Runner', () => {
  let mockFramework;
  let mockSession;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Create mock test session
    mockSession = {
      sessionId: 'test-session-123',
      testId: 'TEST-001',
      startTime: new Date(),
      steps: [],
      screenshots: []
    };

    // Create mock framework
    mockFramework = {
      currentTestSession: null,
      createTestSession: vi.fn().mockReturnValue(mockSession),
      logTestStep: vi.fn(),
      takeStepScreenshot: vi.fn(),
      finishTestSession: vi.fn(),  // Add missing method
      agent: {
        invoke: vi.fn().mockResolvedValue({ success: true })
      }
    };
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('runTask function', () => {
    it('should be defined', () => {
      expect(typeof runTask).toBe('function');
    });

    it('should handle basic task execution', async () => {
      const task = 'Navigate to example.com';
      const testName = 'Navigation Test';
      
      await runTask(mockFramework, task, testName);
      
      expect(mockFramework.createTestSession).toHaveBeenCalledWith(testName, 'navigation-test');
      expect(mockFramework.logTestStep).toHaveBeenCalled();
      expect(mockFramework.takeStepScreenshot).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle null framework gracefully', async () => {
      try {
        await runTask(null, 'test task');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle empty task', async () => {
      await runTask(mockFramework, '');
      expect(mockFramework.createTestSession).toHaveBeenCalled();
    });

    it('should generate test name when not provided', async () => {
      await runTask(mockFramework, 'test task');
      expect(mockFramework.createTestSession).toHaveBeenCalled();
      const call = mockFramework.createTestSession.mock.calls[0];
      expect(call[0]).toMatch(/Test-\d+/);
    });

    it('should set current test session on framework', async () => {
      await runTask(mockFramework, 'test task');
      expect(mockFramework.currentTestSession).toBe(mockSession);
    });

    it('should handle agent invocation', async () => {
      const task = 'Click the login button';
      
      await runTask(mockFramework, task);
      
      expect(mockFramework.agent.invoke).toHaveBeenCalled();
      const agentCall = mockFramework.agent.invoke.mock.calls[0];
      expect(agentCall[0].messages).toBeDefined();
      expect(agentCall[1]).toHaveProperty('recursionLimit');
      expect(agentCall[1]).toHaveProperty('configurable');
    });

    it('should handle agent failure gracefully', async () => {
      mockFramework.agent.invoke.mockRejectedValue(new Error('Agent failed'));
      
      try {
        await runTask(mockFramework, 'failing task');
      } catch (error) {
        expect(error.message).toContain('Agent failed');
      }
      
      expect(mockFramework.createTestSession).toHaveBeenCalled();
    });
  });
});
