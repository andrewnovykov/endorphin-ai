/**
 * Enhanced Browser Framework Tests
 * Tests the enhanced browser framework functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fs module first - comprehensive mocking
vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({ isDirectory: () => false })),
    rmSync: vi.fn(),
    mkdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    writeFileSync: vi.fn(),
    copyFileSync: vi.fn()
  };
  
  return {
    default: mockFs,
    ...mockFs
  };
});

import { EnhancedBrowserTestFramework } from '../framework/core/browser-framework.js';

// Mock Playwright
vi.mock('playwright', () => {
  const mockPage = {
    goto: vi.fn(),
    fill: vi.fn(),
    click: vi.fn(),
    close: vi.fn()
  };

  const mockContext = {
    newPage: vi.fn(() => Promise.resolve(mockPage)),
    close: vi.fn()
  };

  const mockBrowser = {
    newContext: vi.fn(() => Promise.resolve(mockContext)),
    close: vi.fn()
  };

  return {
    chromium: {
      launch: vi.fn(() => Promise.resolve(mockBrowser))
    }
  };
});

// Mock LangChain
vi.mock('@langchain/core/messages', () => ({
  HumanMessage: vi.fn()
}));

// Mock file system
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}));

describe('Enhanced Browser Framework', () => {
  let framework;

  beforeEach(() => {
    framework = new EnhancedBrowserTestFramework();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (framework) {
      await framework.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should create framework instance', () => {
      expect(framework).toBeInstanceOf(EnhancedBrowserTestFramework);
      expect(framework.browser).toBeNull();
      expect(framework.page).toBeNull();
      expect(framework.testResults).toEqual([]);
    });

    it('should initialize framework successfully', async () => {
      await framework.initialize();
      
      expect(framework.browser).toBeDefined();
      expect(framework.context).toBeDefined();
      expect(framework.page).toBeDefined();
    });
  });

  describe('Test Session Management', () => {
    it('should start a new test session', async () => {
      await framework.initialize();
      
      const testId = 'TEST-001';
      framework.startTestSession(testId);
      
      expect(framework.currentTestSession).toBeDefined();
      expect(framework.currentTestSession.testId).toBe(testId);
    });

    it('should end test session and save results', async () => {
      await framework.initialize();
      
      framework.startTestSession('TEST-001');
      framework.endTestSession();
      
      expect(framework.currentTestSession).toBeNull();
    });
  });

  describe('Test Execution', () => {
    it('should execute test with proper setup', async () => {
      await framework.initialize();
      
      const mockTest = {
        id: 'TEST-001',
        name: 'Sample Test',
        execute: vi.fn().mockResolvedValue({ success: true })
      };

      const result = await framework.runTest(mockTest);
      
      expect(result).toBeDefined();
      expect(mockTest.execute).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup browser resources', async () => {
      await framework.initialize();
      await framework.cleanup();
      
      expect(framework.browser).toBeNull();
      expect(framework.page).toBeNull();
    });
  });

  describe('Interactive Mode', () => {
    it('should support interactive mode toggle', () => {
      framework.setInteractiveMode(true);
      expect(framework.isInteractiveMode).toBe(true);
      
      framework.setInteractiveMode(false);
      expect(framework.isInteractiveMode).toBe(false);
    });
  });

  describe('Result Management', () => {
    it('should store test results', async () => {
      await framework.initialize();
      
      const result = { testId: 'TEST-001', success: true };
      framework.addTestResult(result);
      
      expect(framework.testResults).toContain(result);
    });

    it('should clear test results', async () => {
      await framework.initialize();
      
      framework.addTestResult({ testId: 'TEST-001', success: true });
      framework.clearTestResults();
      
      expect(framework.testResults).toEqual([]);
    });
  });
});
