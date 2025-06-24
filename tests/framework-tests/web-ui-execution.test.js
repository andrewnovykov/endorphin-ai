/**
 * @fileoverview Test Execution via Web UI TDD Tests
 * Tests for running tests through the web interface with job tracking and real-time updates
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Web UI Test Execution', () => {
  let serverProcess;
  let testDir;
  const port = 3005; // Use unique port
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, 'temp-execution-test');
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'tests'), { recursive: true });

    // Create a simple test file that can be executed
    const testContent = `export const EXEC_TEST = {
  id: "EXEC-001",
  name: "Execution Test",
  description: "Test that can be executed for testing execution API",
  priority: "High",
  tags: ["execution", "api-test"],
  site: "https://example.com",
  testData: {},
  task: "Navigate to https://example.com and verify the page title contains 'Example'"
};`;

    await fs.writeFile(path.join(testDir, 'tests', 'execution-test.js'), testContent);

    // Create endorphin config
    const configContent = `export default {
  testDir: "./tests",
  browser: "chromium",
  headless: true,
  timeout: 10000,
  retries: 0,
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
      }, 15000);

      const checkServer = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/tests`);
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
  }, 20000);

  afterAll(async () => {
    // Cleanup
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test directory:', error.message);
    }
  });

  describe('Test Execution API', () => {
    test('should start test execution and return job ID', async () => {
      // First get available tests
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      expect(testsResponse.status).toBe(200);
      
      const testsData = await testsResponse.json();
      expect(testsData.success).toBe(true);
      expect(testsData.tests).toHaveLength(1);
      
      const testId = testsData.tests[0].id;
      expect(testId).toBe('EXEC-001');

      // Start test execution
      const response = await fetch(`${baseUrl}/api/tests/${testId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('started');
      expect(data.testId).toBe(testId);
      expect(data.jobId).toBeDefined();
      expect(typeof data.jobId).toBe('string');
      expect(data.jobId).toMatch(/^job-\d+-\w+$/);
    });

    test('should return 404 for non-existent test execution', async () => {
      const response = await fetch(`${baseUrl}/api/tests/NON-EXISTENT/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Test not found');
    });

    test('should track job status via job ID', async () => {
      // Get test ID
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      const testsData = await testsResponse.json();
      const testId = testsData.tests[0].id;

      // Start execution
      const execResponse = await fetch(`${baseUrl}/api/tests/${testId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const execData = await execResponse.json();
      const jobId = execData.jobId;

      // Check job status immediately (should be running)
      const statusResponse = await fetch(`${baseUrl}/api/jobs/${jobId}`);
      expect(statusResponse.status).toBe(200);
      
      const statusData = await statusResponse.json();
      expect(statusData.success).toBe(true);
      expect(statusData.job).toBeDefined();
      expect(statusData.job.jobId).toBe(jobId);
      expect(statusData.job.testId).toBe(testId);
      expect(statusData.job.status).toMatch(/^(running|completed|failed)$/);
      expect(statusData.job.startTime).toBeDefined();
      
      // If still running, wait a bit and check again
      if (statusData.job.status === 'running') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalStatusResponse = await fetch(`${baseUrl}/api/jobs/${jobId}`);
        const finalStatusData = await finalStatusResponse.json();
        expect(finalStatusData.job.status).toMatch(/^(completed|failed)$/);
        
        if (finalStatusData.job.status === 'completed') {
          expect(finalStatusData.job.endTime).toBeDefined();
          expect(finalStatusData.job.result).toBeDefined();
        }
      }
    });

    test('should return 404 for non-existent job ID', async () => {
      const response = await fetch(`${baseUrl}/api/jobs/non-existent-job`);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Job not found');
    });

    test('should handle multiple concurrent executions', async () => {
      // Get test ID
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      const testsData = await testsResponse.json();
      const testId = testsData.tests[0].id;

      // Start multiple executions concurrently
      const promises = Array.from({ length: 3 }, () =>
        fetch(`${baseUrl}/api/tests/${testId}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed
      for (const response of responses) {
        expect(response.status).toBe(200);
      }

      const dataPromises = responses.map(r => r.json());
      const execData = await Promise.all(dataPromises);

      // All should have unique job IDs
      const jobIds = execData.map(d => d.jobId);
      const uniqueJobIds = [...new Set(jobIds)];
      expect(uniqueJobIds).toHaveLength(3);

      // All jobs should be trackable
      for (const jobId of jobIds) {
        const statusResponse = await fetch(`${baseUrl}/api/jobs/${jobId}`);
        expect(statusResponse.status).toBe(200);
      }
    });

    test('should handle test execution errors gracefully', async () => {
      // Create a test that will fail
      const failingTestContent = `export const FAILING_TEST = {
  id: "FAIL-001",
  name: "Failing Test",
  description: "Test that intentionally fails",
  priority: "Low",
  tags: ["failing", "error-test"],
  site: "https://invalid-domain-that-does-not-exist.com",
  testData: {},
  task: "Navigate to an invalid domain and expect failure"
};`;

      await fs.writeFile(path.join(testDir, 'tests', 'failing-test.js'), failingTestContent);
      
      // Wait a moment for file system and test discovery
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the failing test ID
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      const testsData = await testsResponse.json();
      const failingTest = testsData.tests.find(t => t.id === 'FAIL-001');
      
      if (failingTest) {
        // Start execution of failing test
        const response = await fetch(`${baseUrl}/api/tests/FAIL-001/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        expect(response.status).toBe(200);
        const data = await response.json();
        const jobId = data.jobId;

        // Wait for execution to complete and check status
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const statusResponse = await fetch(`${baseUrl}/api/jobs/${jobId}`);
        const statusData = await statusResponse.json();
        
        // Job should exist but may have failed
        expect(statusData.success).toBe(true);
        expect(['completed', 'failed']).toContain(statusData.job.status);
        
        if (statusData.job.status === 'failed') {
          expect(statusData.job.error).toBeDefined();
        }
      }
    });
  });

  describe('WebSocket Real-time Updates', () => {
    test('should send test execution events via WebSocket', async () => {
      const ws = new WebSocket(`ws://localhost:${port}`);
      const messages = [];
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        ws.on('error', reject);
      });

      // Listen for messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          messages.push(message);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', data.toString());
        }
      });

      // Get test ID and start execution
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      const testsData = await testsResponse.json();
      const testId = testsData.tests[0].id;

      const execResponse = await fetch(`${baseUrl}/api/tests/${testId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(execResponse.status).toBe(200);

      // Wait for WebSocket messages
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Should have received some messages
      expect(messages.length).toBeGreaterThan(0);

      // Check for test start event
      const hasStartEvent = messages.some(msg => 
        msg.type === 'test-start' && msg.testId === testId
      );
      expect(hasStartEvent).toBe(true);

      ws.close();
    });

    test('should handle WebSocket connection errors gracefully', async () => {
      // Test should still work via API even if WebSocket fails
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      const testsData = await testsResponse.json();
      const testId = testsData.tests[0].id;

      const response = await fetch(`${baseUrl}/api/tests/${testId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.jobId).toBeDefined();

      // Job tracking should still work
      const statusResponse = await fetch(`${baseUrl}/api/jobs/${data.jobId}`);
      expect(statusResponse.status).toBe(200);
    });
  });
});
