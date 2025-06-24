/**
 * @fileoverview Test Search and Filtering TDD Tests
 * Tests for Web UI search functionality - backend API and frontend integration
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Web UI Test Search and Filtering', () => {
  let serverProcess;
  let testDir;
  const port = 3001; // Use different port to avoid conflicts
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, 'temp-search-test');
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'tests'), { recursive: true });

    // Create test files with different properties for filtering
    const testFiles = [
      {
        filename: 'login-test.js',
        content: `export const LOGIN_TEST = {
  id: "LOGIN-001",
  name: "User Login Test",
  description: "Test user login functionality",
  priority: "High",
  tags: ["authentication", "smoke", "critical"],
  site: "https://example.com",
  testData: { username: "test@example.com" },
  task: "Navigate to login page and authenticate user"
};`
      },
      {
        filename: 'search-test.js',
        content: `export const SEARCH_TEST = {
  id: "SEARCH-001", 
  name: "Product Search Test",
  description: "Test product search functionality",
  priority: "Medium",
  tags: ["search", "products", "functional"],
  site: "https://shop.example.com",
  testData: { searchTerm: "laptop" },
  task: "Search for products and verify results"
};`
      },
      {
        filename: 'checkout-test.js',
        content: `export const CHECKOUT_TEST = {
  id: "CHECKOUT-001",
  name: "Checkout Process Test", 
  description: "Test e-commerce checkout flow",
  priority: "High",
  tags: ["checkout", "payment", "critical"],
  site: "https://shop.example.com",
  testData: { product: "laptop", quantity: 1 },
  task: "Complete checkout process with test payment"
};`
      },
      {
        filename: 'registration-test.js',
        content: `export const REGISTRATION_TEST = {
  id: "REG-001",
  name: "User Registration Test",
  description: "Test new user registration",
  priority: "Low", 
  tags: ["registration", "functional"],
  site: "https://example.com",
  testData: { email: "newuser@example.com" },
  task: "Register new user account and verify confirmation"
};`
      }
    ];

    // Write test files
    for (const testFile of testFiles) {
      await fs.writeFile(
        path.join(testDir, 'tests', testFile.filename),
        testFile.content
      );
    }

    // Create endorphin config
    const configContent = `export default {
  testDir: "./tests",
  browser: "chromium",
  headless: true,
  timeout: 30000,
  retries: 1,
  environments: {
    dev: { baseUrl: "https://example.com" }
  }
};`;
    await fs.writeFile(path.join(testDir, 'endorphin.config.js'), configContent);

    // Start server from test directory
    serverProcess = spawn('node', [
      path.join(__dirname, '..', 'bin', 'endorphin.js'),
      'serve',
      '--port', port.toString()
    ], {
      cwd: testDir,
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server failed to start within timeout'));
      }, 10000);

      const checkServer = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/health`);
          if (response.ok) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkServer, 100);
          }
        } catch (error) {
          setTimeout(checkServer, 100);
        }
      };
      checkServer();
    });
  }, 15000);

  afterAll(async () => {
    // Cleanup
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test directory:', error.message);
    }
  });

  describe('API Search Endpoints', () => {
    test('should return all tests without filters', async () => {
      const response = await fetch(`${baseUrl}/api/tests`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(4);
      expect(data.tests.map(t => t.id)).toEqual(
        expect.arrayContaining(['LOGIN-001', 'SEARCH-001', 'CHECKOUT-001', 'REG-001'])
      );
    });

    test('should filter tests by name search', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=login`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(1);
      expect(data.tests[0].id).toBe('LOGIN-001');
      expect(data.tests[0].name).toContain('Login');
    });

    test('should filter tests by tag', async () => {
      const response = await fetch(`${baseUrl}/api/tests?tags=critical`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(2); // LOGIN and CHECKOUT tests
      expect(data.tests.map(t => t.id)).toEqual(
        expect.arrayContaining(['LOGIN-001', 'CHECKOUT-001'])
      );
    });

    test('should filter tests by priority', async () => {
      const response = await fetch(`${baseUrl}/api/tests?priority=High`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(2); // LOGIN and CHECKOUT tests
      expect(data.tests.every(t => t.priority === 'High')).toBe(true);
    });

    test('should handle multiple filters', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=checkout&priority=High`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(1);
      expect(data.tests[0].id).toBe('CHECKOUT-001');
    });

    test('should return empty results for no matches', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=nonexistent`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(0);
    });

    test('should handle multiple tag filters', async () => {
      const response = await fetch(`${baseUrl}/api/tests?tags=functional,authentication`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(3); // SEARCH, REG, LOGIN tests
    });

    test('should validate search parameters', async () => {
      // Test invalid priority
      const response1 = await fetch(`${baseUrl}/api/tests?priority=Invalid`);
      expect(response1.status).toBe(400);
      
      // Test empty search
      const response2 = await fetch(`${baseUrl}/api/tests?search=`);
      expect(response2.status).toBe(200); // Empty search should return all tests
      
      const data2 = await response2.json();
      expect(data2.tests).toHaveLength(4);
    });

    test('should be case-insensitive for search', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=LOGIN`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(1);
      expect(data.tests[0].id).toBe('LOGIN-001');
    });

    test('should search in description field', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=authentication`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tests).toHaveLength(1);
      expect(data.tests[0].id).toBe('LOGIN-001');
    });
  });

  describe('Search Parameter Validation', () => {
    test('should handle URL encoding in search params', async () => {
      const searchTerm = encodeURIComponent('user login');
      const response = await fetch(`${baseUrl}/api/tests?search=${searchTerm}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should handle special characters in search', async () => {
      const response = await fetch(`${baseUrl}/api/tests?search=@example.com`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      // Should not crash, even if no results
    });
  });
});
