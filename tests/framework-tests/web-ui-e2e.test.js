/**
 * @file Web UI End-to-End Test Execution
 * @description Tests for running actual tests through the web UI interface
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createWebServer } from '../../framework/web/server.js';
import supertest from 'supertest';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

describe('Web UI End-to-End Test Execution', () => {
  let server;
  let app;
  let wsServer;
  
  beforeAll(async () => {
    // Start web server for testing
    const webServerInstance = await createWebServer({ port: 0 }); // Use random port
    server = webServerInstance;
    app = supertest(webServerInstance.httpServer);
    wsServer = webServerInstance.wss;
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Test Discovery and Listing', () => {
    it('should discover and list available tests through API', async () => {
      const response = await app
        .get('/api/tests')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Should have at least the example tests
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check test structure
      const firstTest = response.body[0];
      expect(firstTest).toHaveProperty('id');
      expect(firstTest).toHaveProperty('name');
      expect(firstTest).toHaveProperty('description');
      expect(firstTest).toHaveProperty('task');
    });

    it('should get specific test details by ID', async () => {
      // First get all tests
      const testsResponse = await app.get('/api/tests').expect(200);
      const tests = testsResponse.body;
      expect(tests.length).toBeGreaterThan(0);
      
      const testId = tests[0].id;
      
      // Get specific test
      const response = await app
        .get(`/api/tests/${testId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('task');
    });

    it('should return 404 for non-existent test', async () => {
      const response = await app
        .get('/api/tests/NON-EXISTENT-001')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Test not found');
    });
  });

  describe('Test Execution through API', () => {
    it('should start test execution and return job ID', async () => {
      // Get available tests first
      const testsResponse = await app.get('/api/tests').expect(200);
      const tests = testsResponse.body;
      expect(tests.length).toBeGreaterThan(0);
      
      const testId = tests[0].id;
      
      // Start test execution
      const response = await app
        .post(`/api/tests/${testId}/run`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'started');
      expect(response.body).toHaveProperty('testId', testId);
      expect(response.body).toHaveProperty('jobId');
      expect(typeof response.body.jobId).toBe('string');
    });

    it('should handle test execution with custom options', async () => {
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      const response = await app
        .post(`/api/tests/${testId}/run`)
        .send({
          options: {
            headless: true,
            timeout: 30000,
            debug: true
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'started');
      expect(response.body).toHaveProperty('testId', testId);
    });

    it('should return 404 for non-existent test execution', async () => {
      const response = await app
        .post('/api/tests/NON-EXISTENT-001/run')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Real-time Test Updates via WebSocket', () => {
    let ws;
    let messages = [];

    beforeAll((done) => {
      // Connect to WebSocket server
      const port = server.getPort();
      ws = new WebSocket(`ws://localhost:${port}`);
      
      ws.on('open', () => {
        console.log('WebSocket connected for testing');
        done();
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          messages.push(message);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', data.toString());
        }
      });
    });

    afterAll(() => {
      if (ws) {
        ws.close();
      }
    });

    it('should receive test start event via WebSocket', async () => {
      messages = []; // Clear previous messages
      
      // Get a test ID
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      // Start test execution
      await app
        .post(`/api/tests/${testId}/run`)
        .expect(200);
      
      // Wait for WebSocket messages
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for test start message
      const startMessage = messages.find(msg => msg.type === 'test-start');
      expect(startMessage).toBeDefined();
      expect(startMessage).toHaveProperty('test');
      expect(startMessage.test).toHaveProperty('id', testId);
      expect(startMessage).toHaveProperty('timestamp');
    });

    it('should receive test step events during execution', async () => {
      messages = []; // Clear previous messages
      
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      // Start test execution
      await app
        .post(`/api/tests/${testId}/run`)
        .expect(200);
      
      // Wait longer for test steps
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check for step messages
      const stepMessages = messages.filter(msg => msg.type === 'test-step');
      expect(stepMessages.length).toBeGreaterThan(0);
      
      const firstStep = stepMessages[0];
      expect(firstStep).toHaveProperty('step');
      expect(firstStep).toHaveProperty('timestamp');
    });

    it('should receive test completion event', async () => {
      messages = []; // Clear previous messages
      
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      // Start test execution
      await app
        .post(`/api/tests/${testId}/run`)
        .expect(200);
      
      // Wait for test completion
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check for completion message
      const completeMessage = messages.find(msg => msg.type === 'test-complete');
      expect(completeMessage).toBeDefined();
      expect(completeMessage).toHaveProperty('result');
      expect(completeMessage).toHaveProperty('timestamp');
    });
  });

  describe('Test Results API', () => {
    it('should list test results', async () => {
      const response = await app
        .get('/api/results')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Each result should have required properties
      if (response.body.length > 0) {
        const result = response.body[0];
        expect(result).toHaveProperty('testId');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('status');
      }
    });

    it('should get specific test result by ID', async () => {
      // First get all results
      const resultsResponse = await app.get('/api/results').expect(200);
      
      if (resultsResponse.body.length > 0) {
        const resultId = resultsResponse.body[0].id;
        
        const response = await app
          .get(`/api/results/${resultId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', resultId);
        expect(response.body).toHaveProperty('testId');
        expect(response.body).toHaveProperty('steps');
        expect(response.body).toHaveProperty('screenshots');
      }
    });

    it('should return 404 for non-existent result', async () => {
      const response = await app
        .get('/api/results/non-existent-result-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Screenshot Serving', () => {
    it('should serve screenshot files from test results', async () => {
      // This test assumes screenshots exist from previous test runs
      // In a real scenario, we'd run a test that generates screenshots first
      
      const resultsResponse = await app.get('/api/results').expect(200);
      
      if (resultsResponse.body.length > 0) {
        const result = resultsResponse.body[0];
        if (result.screenshots && result.screenshots.length > 0) {
          const screenshotPath = result.screenshots[0];
          
          const response = await app
            .get(`/screenshots/${screenshotPath}`)
            .expect(200);

          expect(response.headers['content-type']).toMatch(/image/);
        }
      }
    });

    it('should return 404 for non-existent screenshots', async () => {
      await app
        .get('/screenshots/non-existent-screenshot.png')
        .expect(404);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent test executions', async () => {
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      // Start multiple tests concurrently
      const promises = Array(3).fill().map(() =>
        app.post(`/api/tests/${testId}/run`).expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      // Each should get a unique job ID
      const jobIds = responses.map(r => r.body.jobId);
      const uniqueJobIds = new Set(jobIds);
      expect(uniqueJobIds.size).toBe(jobIds.length);
    });

    it('should handle malformed test execution requests', async () => {
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      const response = await app
        .post(`/api/tests/${testId}/run`)
        .send({ invalid: 'data' })
        .expect(200); // Should still work, just ignore invalid data

      expect(response.body).toHaveProperty('status', 'started');
    });

    it('should handle WebSocket connection failures gracefully', async () => {
      // Test that API still works even if WebSocket fails
      const testsResponse = await app.get('/api/tests').expect(200);
      const testId = testsResponse.body[0].id;
      
      // Mock WebSocket server failure
      const originalEmit = wsServer?.emit;
      if (wsServer) {
        wsServer.emit = vi.fn().mockImplementation(() => {
          throw new Error('WebSocket error');
        });
      }
      
      // Should still return success even if WebSocket fails
      const response = await app
        .post(`/api/tests/${testId}/run`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'started');
      
      // Restore original function
      if (wsServer && originalEmit) {
        wsServer.emit = originalEmit;
      }
    });
  });
});
