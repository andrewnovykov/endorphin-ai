/**
 * Tests for Test Discovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { TestDiscovery } from '../../../framework/core/test-discovery.js';

describe('TestDiscovery', () => {
  let testDiscovery;
  let testDir;
  
  beforeEach(() => {
    testDiscovery = new TestDiscovery();
    testDir = join(process.cwd(), 'tests', 'tmp', 'test-discovery');
    
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create TestDiscovery instance', () => {
      expect(testDiscovery).toBeDefined();
      expect(testDiscovery).toBeInstanceOf(TestDiscovery);
    });
  });

  describe('basic functionality', () => {
    it('should have required methods', () => {
      expect(typeof testDiscovery.discoverTests).toBe('function');
      expect(typeof testDiscovery.isValidTest).toBe('function');
      expect(typeof testDiscovery.getAllTests).toBe('function');
    });

    it('should handle empty directory', async () => {
      await testDiscovery.discoverTests();
      const tests = testDiscovery.getAllTests();
      expect(Array.isArray(tests)).toBe(true);
      expect(tests).toHaveLength(0);
    });
  });
});
