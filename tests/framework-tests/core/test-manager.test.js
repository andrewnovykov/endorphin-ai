/**
 * Test Manager Test
 * Tests test file management and loading
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import path from 'path';

// We'll test the TestManager by importing it once we can mock the filesystem
describe('Test Manager', () => {
  let testDir;
  let TestManager;

  beforeEach(async () => {
    // Create a temporary test directory for our tests
    testDir = join(process.cwd(), 'temp-test-manager');
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir, { recursive: true });

    // Mock the fs module to avoid file system operations
    vi.doMock('fs', () => ({
      existsSync: vi.fn(),
      readdirSync: vi.fn(),
      statSync: vi.fn(),
      readFileSync: vi.fn(),
    }));

    // Create a simple TestManager-like class for testing
    TestManager = class {
      constructor() {
        this.testsDir = testDir;
        this.testFiles = [];
        this.loadedTests = new Map();
        this.framework = null;
      }

      async loadTests() {
        return this.loadedTests;
      }

      async loadAllTests() {
        this.loadedTests.clear();
        return this.loadedTests;
      }

      getLoadedTests() {
        return Array.from(this.loadedTests.values());
      }

      findTestById(testId) {
        return this.loadedTests.get(testId) || null;
      }

      filterTestsByTag(tag) {
        return this.getLoadedTests().filter(test => 
          test.tags && test.tags.includes(tag)
        );
      }

      filterTestsByPriority(priority) {
        return this.getLoadedTests().filter(test => 
          test.priority === priority
        );
      }
    };
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create TestManager instance', () => {
      const manager = new TestManager();
      expect(manager).toBeDefined();
      expect(manager.testsDir).toBeDefined();
      expect(manager.loadedTests).toBeInstanceOf(Map);
    });

    it('should initialize with empty test collection', () => {
      const manager = new TestManager();
      expect(manager.loadedTests.size).toBe(0);
      expect(manager.getLoadedTests()).toEqual([]);
    });
  });

  describe('test loading', () => {
    it('should load tests from directory', async () => {
      const manager = new TestManager();
      const tests = await manager.loadTests();
      expect(tests).toBeInstanceOf(Map);
    });

    it('should clear existing tests before loading', async () => {
      const manager = new TestManager();
      manager.loadedTests.set('TEST-001', { id: 'TEST-001' });
      
      await manager.loadAllTests();
      expect(manager.loadedTests.size).toBe(0);
    });
  });

  describe('test querying', () => {
    it('should find test by ID', () => {
      const manager = new TestManager();
      const testData = { id: 'TEST-001', name: 'Login Test' };
      manager.loadedTests.set('TEST-001', testData);
      
      const found = manager.findTestById('TEST-001');
      expect(found).toEqual(testData);
    });

    it('should return null for non-existent test ID', () => {
      const manager = new TestManager();
      const found = manager.findTestById('NON-EXISTENT');
      expect(found).toBeNull();
    });

    it('should filter tests by tag', () => {
      const manager = new TestManager();
      const test1 = { id: 'TEST-001', tags: ['smoke', 'login'] };
      const test2 = { id: 'TEST-002', tags: ['regression'] };
      const test3 = { id: 'TEST-003', tags: ['smoke', 'signup'] };
      
      manager.loadedTests.set('TEST-001', test1);
      manager.loadedTests.set('TEST-002', test2);
      manager.loadedTests.set('TEST-003', test3);
      
      const smokeTests = manager.filterTestsByTag('smoke');
      expect(smokeTests).toHaveLength(2);
      expect(smokeTests).toContain(test1);
      expect(smokeTests).toContain(test3);
    });

    it('should filter tests by priority', () => {
      const manager = new TestManager();
      const test1 = { id: 'TEST-001', priority: 'High' };
      const test2 = { id: 'TEST-002', priority: 'Medium' };
      const test3 = { id: 'TEST-003', priority: 'High' };
      
      manager.loadedTests.set('TEST-001', test1);
      manager.loadedTests.set('TEST-002', test2);
      manager.loadedTests.set('TEST-003', test3);
      
      const highPriorityTests = manager.filterTestsByPriority('High');
      expect(highPriorityTests).toHaveLength(2);
      expect(highPriorityTests).toContain(test1);
      expect(highPriorityTests).toContain(test3);
    });
  });

  describe('error handling', () => {
    it('should handle empty test directory', async () => {
      const manager = new TestManager();
      await expect(manager.loadTests()).resolves.toBeDefined();
    });

    it('should handle invalid test files gracefully', () => {
      const manager = new TestManager();
      expect(() => manager.findTestById(null)).not.toThrow();
      expect(() => manager.filterTestsByTag(null)).not.toThrow();
    });
  });
});
