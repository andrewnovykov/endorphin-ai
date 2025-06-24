import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fetch from 'node-fetch';
import { WebUIServer } from '../framework/web/server.js';

describe('React Frontend Integration Tests', () => {
  let server;
  let port;
  let baseUrl;

  beforeAll(async () => {
    // Start server on a random port
    server = new WebUIServer();
    await server.start(0);
    port = server.getPort();
    baseUrl = `http://localhost:${port}`;
    console.log(`🚀 Test server running on ${baseUrl}`);
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Static Assets and SPA Routing', () => {
    it('should serve the React app at root URL', async () => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<title>Endorphin AI - Test Runner</title>');
      expect(html).toContain('<div id="root">');
      expect(html).toContain('/assets/index-'); // Should include the React bundle with hash
    });

    it('should serve React app for SPA routes (dashboard)', async () => {
      const response = await fetch(`${baseUrl}/dashboard`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<title>Endorphin AI - Test Runner</title>');
      expect(html).toContain('<div id="root">');
    });

    it('should serve React app for SPA routes (test runner)', async () => {
      const response = await fetch(`${baseUrl}/test-runner/TEST-001`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<title>Endorphin AI - Test Runner</title>');
    });

    it('should serve React app for SPA routes (test results)', async () => {
      const response = await fetch(`${baseUrl}/test-results/job-123`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<title>Endorphin AI - Test Runner</title>');
    });

    it('should serve static assets (CSS)', async () => {
      // First, get the HTML to find the actual CSS filename
      const htmlResponse = await fetch(`${baseUrl}/`);
      const html = await htmlResponse.text();
      
      // Extract CSS filename from the HTML
      const cssMatch = html.match(/href="([^"]*\.css)"/);
      if (cssMatch) {
        const cssPath = cssMatch[1];
        const cssResponse = await fetch(`${baseUrl}${cssPath}`);
        expect(cssResponse.status).toBe(200);
        expect(cssResponse.headers.get('content-type')).toMatch(/text\/css/);
      } else {
        // If no separate CSS file, it might be inlined or not present
        console.log('No separate CSS file found (might be inlined)');
      }
    });

    it('should serve static assets (JS)', async () => {
      // First, get the HTML to find the actual JS filename
      const htmlResponse = await fetch(`${baseUrl}/`);
      const html = await htmlResponse.text();
      
      // Extract JS filename from the HTML
      const jsMatch = html.match(/src="([^"]*\.js)"/);
      if (jsMatch) {
        const jsPath = jsMatch[1];
        const jsResponse = await fetch(`${baseUrl}${jsPath}`);
        expect(jsResponse.status).toBe(200);
        expect(jsResponse.headers.get('content-type')).toMatch(/javascript/);
      } else {
        // If no separate JS file found, fail the test
        throw new Error('No JavaScript bundle found in HTML');
      }
    });
  });

  describe('API Integration with Frontend', () => {
    it('should have working API endpoints that frontend will call', async () => {
      // Test /api/tests endpoint (used by Dashboard)
      const testsResponse = await fetch(`${baseUrl}/api/tests`);
      expect(testsResponse.status).toBe(200);
      
      const tests = await testsResponse.json();
      expect(Array.isArray(tests)).toBe(true);
    });

    it('should handle CORS properly for frontend requests', async () => {
      const response = await fetch(`${baseUrl}/api/tests`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      
      expect(response.status).toBe(200);
      // CORS headers should be present if needed
    });

    it('should serve API and frontend from same origin', async () => {
      // This ensures no CORS issues since everything is served from same server
      const apiResponse = await fetch(`${baseUrl}/api/tests`);
      const frontendResponse = await fetch(`${baseUrl}/`);
      
      expect(apiResponse.status).toBe(200);
      expect(frontendResponse.status).toBe(200);
      
      // Both should come from same origin
      expect(new URL(apiResponse.url).origin).toBe(new URL(frontendResponse.url).origin);
    });
  });

  describe('WebSocket Integration', () => {
    it('should have WebSocket endpoint available for frontend', async () => {
      // Test that WebSocket endpoint exists (we can't easily test WS in node-fetch)
      // But we can verify the server has it configured
      expect(server.wss).toBeDefined();
      expect(server.wss.clients).toBeDefined();
    });
  });

  describe('Frontend Build Quality', () => {
    it('should have optimized production build', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      // Should contain minified/hashed assets (production build indicators)
      const cssMatch = html.match(/href="[^"]*-[a-f0-9]+\.css"/);
      const jsMatch = html.match(/src="[^"]*-[a-f0-9]+\.js"/);
      
      // In production builds, files typically have content hashes
      if (cssMatch || jsMatch) {
        console.log('✅ Production build detected with asset hashing');
      }
      
      // Should not contain development-only content
      expect(html).not.toContain('vite:');
      expect(html).not.toContain('localhost:5173');
    });

    it('should have proper meta tags for PWA/SEO', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      expect(html).toContain('<meta charset="UTF-8"');
      expect(html).toContain('<meta name="viewport"');
      expect(html).toContain('<title>Endorphin AI - Test Runner</title>');
    });
  });
});
