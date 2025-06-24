/**
 * Test Discovery System Tests
 * Tests the test discovery and execution functionality using real examples
 */

import { describe, it, expect, vi } from 'vitest';
import { join } from 'path';
import { 
  discoverTests, 
  listAllTests, 
  runSingleTestById,
  runTestsByTag,
  runTestsByPriority,
  runAllTests 
} from '../framework/core/test-discovery.js';

// Use actual examples directory for testing
const EXAMPLES_TESTS_DIR = join(process.cwd(), 'examples', 'tests');

describe('Test Discovery System', () => {
  
  describe('discoverTests', () => {
    it('should discover test files in the examples directory', async () => {
      const config = {
        execution: {
          testsDirectory: EXAMPLES_TESTS_DIR
        }
      };

      const tests = await discoverTests(config);
      
      expect(tests).toBeInstanceOf(Array);
      expect(tests.length).toBeGreaterThan(0);
      
      // Check that we found the QE-001 test
      const qe001Test = tests.find(test => test.id === 'QE-001');
      expect(qe001Test).toBeDefined();
      expect(qe001Test.name).toBe('Basic Login Test');
      expect(qe001Test.priority).toBe('High');
      expect(qe001Test.tags).toContain('authentication');
    });

    it('should handle empty directory gracefully', async () => {
      const config = {
        execution: {
          testsDirectory: '/non/existent/path'
        }
      };

      const tests = await discoverTests(config);
      expect(tests).toBeInstanceOf(Array);
      expect(tests).toHaveLength(0);
    });
  });

  describe('listAllTests', () => {
    it('should return formatted list of all tests', async () => {
      const config = {
        execution: {
          testsDirectory: EXAMPLES_TESTS_DIR
        }
      };

      const result = await listAllTests(config);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tests).toBeInstanceOf(Array);
      expect(result.tests.length).toBeGreaterThan(0);
      
      const qe001Test = result.tests.find(test => test.id === 'QE-001');
      expect(qe001Test).toBeDefined();
    });
  });

  describe('runSingleTestById', () => {
    it('should find and return test by ID', async () => {
      const config = {
        execution: {
          testsDirectory: EXAMPLES_TESTS_DIR
        }
      };

      const result = await runSingleTestById('QE-001', config);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.test.id).toBe('QE-001');
      expect(result.test.name).toBe('Basic Login Test');
    });
  });

  describe('runTestsByTag', () => {
    it('should filter and return tests by tag', async () => {
      const config = {
        execution: {
          testsDirectory: EXAMPLES_TESTS_DIR
        }
      };

      const result = await runTestsByTag('authentication', config);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tests).toBeInstanceOf(Array);
      expect(result.tests.length).toBeGreaterThan(0);
    });
  });

  describe('runAllTests', () => {
    it('should return all discovered tests', async () => {
      const config = {
        execution: {
          testsDirectory: EXAMPLES_TESTS_DIR
        }
      };

      const result = await runAllTests(config);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tests).toBeInstanceOf(Array);
      expect(result.tests.length).toBeGreaterThan(0);
    });
  });
});
