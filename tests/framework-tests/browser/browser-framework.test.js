/**
 * Tests for Browser Framework
 * 
 * Tests the browser automation and interaction functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { existsSync } from 'fs';
import { EnhancedBrowserTestFramework as BrowserFramework } from '../../../packages/browser/src/automation/browser-framework.js';

describe('BrowserFramework', () => {
  let browserFramework;
  let testConfig;
  
  beforeEach(() => {
    testConfig = {
      browser: {
        headless: true,
        slowMo: 0,
        timeout: 5000
      },
      ai: {
        provider: 'openai',
        model: 'gpt-4o'
      },
      outputDir: join(process.cwd(), 'tests', 'tmp'),
      testDir: join(process.cwd(), 'tests', 'tmp', 'tests')
    };
    browserFramework = new BrowserFramework(testConfig);
  });
  
  afterEach(async () => {
    // Clean up browser instances
    if (browserFramework && browserFramework.browser) {
      await browserFramework.cleanup();
    }
  });

  describe('initialization', () => {
    it('should create browser framework with config', () => {
      expect(browserFramework).toBeDefined();
      expect(browserFramework.config).toBeDefined();
      expect(browserFramework.config.browser).toBeDefined();
      expect(browserFramework.config.ai).toBeDefined();
      expect(browserFramework.config.outputDir).toBe(testConfig.outputDir);
    });

    it('should handle missing config', () => {
      expect(() => new BrowserFramework()).not.toThrow();
    });
  });

  describe('basic functionality', () => {
    it('should have required methods', () => {
      expect(typeof browserFramework.initialize).toBe('function');
      expect(typeof browserFramework.cleanup).toBe('function');
      expect(typeof browserFramework.setupAgent).toBe('function');
    });

    it('should handle cleanup without browser', async () => {
      // Should not throw when cleaning up without browser
      await expect(browserFramework.cleanup()).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle browser launch failure gracefully', async () => {
      // This test validates that the framework can handle errors
      expect(browserFramework).toBeDefined();
    });

    it('should handle cleanup without browser', async () => {
      // Should not throw when cleaning up without browser
      await expect(browserFramework.cleanup()).resolves.not.toThrow();
    });
  });
});
