// React Frontend Serving TDD Tests
// Test that the Web UI serves the React app correctly

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { WebUIServer } from '../framework/web/server.js';

describe('React Frontend Serving', () => {
  let server;
  let port;

  beforeAll(async () => {
    // Create server instance for testing
    server = new WebUIServer({ 
      port: 0,  // Use random available port
      projectRoot: process.cwd()
    });
    await server.start();
    port = server.getPort();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  test('should serve React app at root URL', async () => {
    const response = await fetch(`http://localhost:${port}/`);
    const html = await response.text();
    
    // Should serve React app, not old static HTML
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    
    // React app should contain these elements
    expect(html).toContain('<div id="root">');
    expect(html).toContain('Endorphin AI - Test Runner');
    
    // Should NOT contain old static HTML elements
    expect(html).not.toContain('navbar-brand mb-0 h1'); // Old HTML marker
  });

  test('should serve React assets correctly', async () => {
    // First get the main page to see what assets it references
    const response = await fetch(`http://localhost:${port}/`);
    const html = await response.text();
    
    // Extract JS and CSS asset paths from HTML
    const jsMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = html.match(/href="(\/assets\/[^"]+\.css)"/);
    
    if (jsMatch) {
      const jsResponse = await fetch(`http://localhost:${port}${jsMatch[1]}`);
      expect(jsResponse.status).toBe(200);
      expect(jsResponse.headers.get('content-type')).toContain('javascript');
    }
    
    if (cssMatch) {
      const cssResponse = await fetch(`http://localhost:${port}${cssMatch[1]}`);
      expect(cssResponse.status).toBe(200);
      expect(cssResponse.headers.get('content-type')).toContain('css');
    }
  });

  test('should handle SPA routing for /dashboard', async () => {
    const response = await fetch(`http://localhost:${port}/dashboard`);
    const html = await response.text();
    
    // SPA should serve same React app for all routes
    expect(response.status).toBe(200);
    expect(html).toContain('<div id="root">');
    expect(html).toContain('Endorphin AI - Test Runner');
  });

  test('should handle SPA routing for /test-runner', async () => {
    const response = await fetch(`http://localhost:${port}/test-runner`);
    const html = await response.text();
    
    // SPA should serve same React app for all routes
    expect(response.status).toBe(200);
    expect(html).toContain('<div id="root">');
    expect(html).toContain('Endorphin AI - Test Runner');
  });

  test('should handle SPA routing for /test-results', async () => {
    const response = await fetch(`http://localhost:${port}/test-results`);
    const html = await response.text();
    
    // SPA should serve same React app for all routes
    expect(response.status).toBe(200);
    expect(html).toContain('<div id="root">');
    expect(html).toContain('Endorphin AI - Test Runner');
  });

  test('should still serve API endpoints correctly', async () => {
    // Ensure API endpoints still work with React serving
    const response = await fetch(`http://localhost:${port}/api/tests`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('React Frontend Package Testing', () => {
  test('should work from user project directory', async () => {
    // This test ensures the React app works when served from a user project
    // (using the package testing approach)
    
    const server = new WebUIServer({ 
      port: 0,
      projectRoot: '/Users/papapin777/Documents/CODE/AI/endorphin-ai/tmp/test-endorphin'
    });
    
    try {
      await server.start();
      const port = server.getPort();
      
      const response = await fetch(`http://localhost:${port}/`);
      const html = await response.text();
      
      expect(response.status).toBe(200);
      expect(html).toContain('<div id="root">');
      
      // Should discover user project tests
      const apiResponse = await fetch(`http://localhost:${port}/api/tests`);
      const tests = await apiResponse.json();
      
      expect(tests.some(test => test.id === 'USER-001')).toBe(true);
      
    } finally {
      await server.stop();
    }
  });
});
