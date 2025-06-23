/**
 * Test-Driven Development for Endorphin Web UI Server
 * Tests for Express server with REST API endpoints
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { WebUIServer } from '../framework/web/server.js';

describe('WebUIServer', () => {
  let server;
  let app;

  beforeEach(async () => {
    // Create test server instance
    server = new WebUIServer({ port: 0 }); // Use random port for testing
    app = server.app;
  });

  afterEach(async () => {
    if (server.httpServer) {
      await server.stop();
    }
  });

  describe('Server Setup', () => {
    it('should create Express app with middleware', () => {
      expect(app).toBeDefined();
      expect(app._router).toBeDefined(); // Express router exists
    });

    it('should start and stop server', async () => {
      await server.start();
      expect(server.httpServer.listening).toBe(true);
      
      await server.stop();
      expect(server.httpServer).toBe(null);
    });

    it('should serve static files from public directory', async () => {
      await server.start();
      
      // Test that index.html is served for non-existent files (SPA fallback)
      const response = await request(app)
        .get('/test-static-file.txt')
        .expect(200); // Serves index.html due to wildcard route
        
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('API Endpoints', () => {
    beforeEach(async () => {
      await server.start();
    });

    describe('GET /api/tests', () => {
      it('should return list of discovered tests', async () => {
        // Mock test discovery
        vi.doMock('../framework/core/test-discovery.js', () => ({
          discoverTests: vi.fn().mockResolvedValue([
            {
              id: 'TEST-001',
              name: 'Sample Test',
              description: 'Test description',
              filePath: '/path/to/test.js'
            }
          ])
        }));

        const response = await request(app)
          .get('/api/tests')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body).toEqual([
          {
            id: 'TEST-001',
            name: 'Sample Test',
            description: 'Test description',
            filePath: '/path/to/test.js'
          }
        ]);
      });

      it('should handle test discovery errors', async () => {
        // Mock test discovery error
        vi.doMock('../framework/core/test-discovery.js', () => ({
          discoverTests: vi.fn().mockRejectedValue(new Error('Discovery failed'))
        }));

        const response = await request(app)
          .get('/api/tests')
          .expect(500)
          .expect('Content-Type', /json/);

        expect(response.body).toEqual({
          error: 'Discovery failed'
        });
      });
    });

    describe('GET /api/tests/:id', () => {
      it('should return specific test details', async () => {
        vi.doMock('../framework/core/test-discovery.js', () => ({
          getTestById: vi.fn().mockResolvedValue({
            id: 'TEST-001',
            name: 'Sample Test',
            description: 'Test description',
            priority: 'High',
            tags: ['smoke'],
            site: 'https://example.com',
            task: 'Navigate to homepage and verify title'
          })
        }));

        const response = await request(app)
          .get('/api/tests/TEST-001')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body.id).toBe('TEST-001');
        expect(response.body.name).toBe('Sample Test');
      });

      it('should return 404 for non-existent test', async () => {
        vi.doMock('../framework/core/test-discovery.js', () => ({
          getTestById: vi.fn().mockResolvedValue(null)
        }));

        const response = await request(app)
          .get('/api/tests/NON-EXISTENT')
          .expect(404)
          .expect('Content-Type', /json/);

        expect(response.body.error).toBe('Test not found');
      });
    });

    describe('POST /api/tests/:id/run', () => {
      it('should start test execution and return status', async () => {
        // Mock test runner
        vi.doMock('../framework/core/test-runner.js', () => ({
          runSingleTestById: vi.fn().mockResolvedValue({
            success: true,
            testId: 'TEST-001'
          })
        }));

        const response = await request(app)
          .post('/api/tests/TEST-001/run')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body).toEqual({
          status: 'started',
          testId: 'TEST-001'
        });
      });

      it('should handle test execution errors gracefully', async () => {
        // The server should still return 200 for starting the test
        // Errors are handled asynchronously and reported via WebSocket
        vi.doMock('../framework/core/test-runner.js', () => ({
          runSingleTestById: vi.fn().mockRejectedValue(new Error('Test execution failed'))
        }));

        const response = await request(app)
          .post('/api/tests/INVALID-TEST/run')
          .expect(200)  // Server returns success for starting the test
          .expect('Content-Type', /json/);

        expect(response.body).toEqual({
          status: 'started',
          testId: 'INVALID-TEST'
        });
      });
    });

    describe('GET /api/results', () => {
      it('should return list of test results', async () => {
        vi.doMock('../framework/core/test-discovery.js', () => ({
          getTestResults: vi.fn().mockResolvedValue([
            {
              testId: 'TEST-001',
              timestamp: '2025-06-23T10:00:00Z',
              success: true,
              duration: 5000,
              resultPath: '/path/to/results'
            }
          ])
        }));

        const response = await request(app)
          .get('/api/results')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].testId).toBe('TEST-001');
      });
    });

    describe('GET /api/results/:id', () => {
      it('should return specific test result details', async () => {
        vi.doMock('../framework/core/test-discovery.js', () => ({
          getTestResultById: vi.fn().mockResolvedValue({
            testId: 'TEST-001',
            success: true,
            steps: [
              { description: 'Navigate to homepage', success: true },
              { description: 'Verify title', success: true }
            ],
            screenshots: ['/path/to/screenshot.png']
          })
        }));

        const response = await request(app)
          .get('/api/results/TEST-001_2025-06-23')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(response.body.testId).toBe('TEST-001');
        expect(response.body.steps).toHaveLength(2);
      });
    });
  });

  describe('WebSocket Integration', () => {
    it('should set up WebSocket server', async () => {
      await server.start();
      expect(server.wss).toBeDefined();
    });

    it('should handle WebSocket connections', async () => {
      await server.start();
      
      // Mock WebSocket connection
      const mockConnection = {
        on: vi.fn(),
        send: vi.fn()
      };

      // Simulate connection event
      server.wss.emit('connection', mockConnection);
      
      expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    it('should handle server startup errors', async () => {
      // Create server with invalid port
      const badServer = new WebUIServer({ port: -1 });
      
      await expect(badServer.start()).rejects.toThrow();
    });

    it('should handle malformed JSON in POST requests', async () => {
      await server.start();
      
      const response = await request(app)
        .post('/api/tests/TEST-001/run')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('CORS Configuration', () => {
    it('should allow cross-origin requests', async () => {
      // Mock test discovery for this test
      vi.doMock('../framework/core/test-discovery.js', () => ({
        discoverTests: vi.fn().mockResolvedValue([
          { id: 'TEST-001', name: 'Sample Test' }
        ])
      }));
      
      await server.start();
      
      const response = await request(app)
        .get('/api/tests')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});

describe('WebSocket Reporter Integration', () => {
  let server;
  let mockWebSocketServer;

  beforeEach(() => {
    mockWebSocketServer = {
      clients: new Set(),
      on: vi.fn(),
      emit: vi.fn()
    };
    
    server = new WebUIServer({ port: 0 });
    server.wss = mockWebSocketServer;
  });

  it('should broadcast test events to connected clients', async () => {
    const { WebSocketReporter } = await import('../framework/web/websocket-reporter.js');
    
    const mockClient = {
      readyState: 1, // WebSocket.OPEN
      send: vi.fn()
    };
    
    mockWebSocketServer.clients.add(mockClient);
    
    const reporter = new WebSocketReporter(mockWebSocketServer);
    
    // Test broadcasting
    reporter.onTestStart({
      id: 'TEST-001',
      name: 'Sample Test'
    });
    
    expect(mockClient.send).toHaveBeenCalledWith(
      expect.stringMatching(/"type":"test-start"/)
    );
    
    // Verify the message structure
    const sentMessage = JSON.parse(mockClient.send.mock.calls[0][0]);
    expect(sentMessage).toMatchObject({
      type: 'test-start',
      test: { id: 'TEST-001', name: 'Sample Test' },
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    });
  });
});
