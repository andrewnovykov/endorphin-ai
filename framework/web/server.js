/**
 * Endorphin AI Web UI Server
 * Express server with WebSocket support for real-time test execution
 */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebUIServer {
  constructor(options = {}) {
    this.port = options.port !== undefined ? options.port : 3000;
    this.projectRoot = options.projectRoot || process.cwd();
    this.config = options.config || null;
    this.app = express();
    this.httpServer = null;
    this.wss = null;
    this.jobs = new Map(); // Track running jobs
    this.setupMiddleware();
    this.setupRoutes();
  }

  generateJobId() {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filter tests based on search parameters
   * @param {Array} tests - Array of test objects
   * @param {Object} query - Query parameters from request
   * @returns {Array} Filtered array of tests
   */
  filterTests(tests, query) {
    if (!tests || tests.length === 0) {
      return [];
    }
    
    let filteredTests = [...tests];
    
    // Text search (case-insensitive, searches name, description, task, and tags)
    if (query.search && query.search.trim()) {
      const searchTerm = query.search.toLowerCase().trim();
      filteredTests = filteredTests.filter(test => {
        const searchFields = [
          test.name || '',
          test.description || '',
          test.task || '',
          test.id || '',
          (test.tags || []).join(' ')
        ].join(' ').toLowerCase();
        
        return searchFields.includes(searchTerm);
      });
    }
    
    // Filter by priority
    if (query.priority) {
      const validPriorities = ['High', 'Medium', 'Low'];
      if (!validPriorities.includes(query.priority)) {
        throw new Error(`Invalid priority: ${query.priority}. Valid values are: ${validPriorities.join(', ')}`);
      }
      filteredTests = filteredTests.filter(test => test.priority === query.priority);
    }
    
    // Filter by tags (supports comma-separated list)
    if (query.tags) {
      const searchTags = query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredTests = filteredTests.filter(test => {
        if (!test.tags || !Array.isArray(test.tags)) {
          return false;
        }
        const testTags = test.tags.map(tag => tag.toLowerCase());
        return searchTags.some(searchTag => testTags.includes(searchTag));
      });
    }
    
    return filteredTests;
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Serve React app from dist directory (production build)
    this.app.use(express.static(path.join(__dirname, 'public/dist')));
    
    // Serve additional static assets
    this.app.use('/assets', express.static(path.join(__dirname, 'public/dist/assets')));
    
    // Fallback for old static files (development)
    if (process.env.NODE_ENV !== 'production') {
      this.app.use('/old', express.static(path.join(__dirname, 'public')));
    }
  }

  setupRoutes() {
    // API routes
    this.app.get('/api/tests', async (req, res) => {
      try {
        const { discoverTests } = await import('../core/test-discovery.js');
        // Pass project root to discovery function
        const tests = await discoverTests({ projectRoot: this.projectRoot, config: this.config });
        
        // Apply search and filtering
        const filteredTests = this.filterTests(tests, req.query);
        
        res.json({ success: true, tests: filteredTests });
      } catch (error) {
        // Handle validation errors vs server errors
        if (error.message.includes('Invalid priority')) {
          res.status(400).json({ success: false, error: error.message });
        } else {
          res.status(500).json({ success: false, error: error.message });
        }
      }
    });

    this.app.get('/api/tests/:id', async (req, res) => {
      try {
        const { getTestById } = await import('../core/test-discovery.js');
        // Pass project root to discovery function
        const test = await getTestById(req.params.id, { projectRoot: this.projectRoot, config: this.config });
        
        if (!test) {
          return res.status(404).json({ error: 'Test not found' });
        }
        
        res.json(test);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/tests/:id/run', async (req, res) => {
      try {
        const testId = req.params.id;
        
        // Check if test exists first
        const { getTestById } = await import('../core/test-discovery.js');
        const test = await getTestById(testId, { projectRoot: this.projectRoot, config: this.config });
        
        if (!test) {
          return res.status(404).json({ error: 'Test not found' });
        }
        
        const { runSingleTestById } = await import('../core/test-runner.js');
        const { WebSocketReporter } = await import('./websocket-reporter.js');
        
        // Generate unique job ID
        const jobId = this.generateJobId();
        
        // Create job tracking entry
        this.jobs.set(jobId, {
          testId,
          status: 'running',
          startTime: new Date().toISOString(),
          test
        });
        
        // Create WebSocket reporter if WebSocket server exists
        const reporter = this.wss ? new WebSocketReporter(this.wss) : undefined;
        
        // Start test execution asynchronously
        runSingleTestById(testId, { reporter })
          .then((result) => {
            // Update job status on completion
            const job = this.jobs.get(jobId);
            if (job) {
              job.status = 'completed';
              job.endTime = new Date().toISOString();
              job.result = result;
            }
          })
          .catch((error) => {
            // Update job status on error
            const job = this.jobs.get(jobId);
            if (job) {
              job.status = 'failed';
              job.endTime = new Date().toISOString();
              job.error = error.message;
            }
            console.error('Test execution failed:', error);
          });
        
        res.json({ status: 'started', testId, jobId });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/results', async (req, res) => {
      try {
        const { getTestResults } = await import('../core/test-discovery.js');
        const results = await getTestResults();
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/results/:id', async (req, res) => {
      try {
        const { getTestResultById } = await import('../core/test-discovery.js');
        const result = await getTestResultById(req.params.id);
        
        if (!result) {
          return res.status(404).json({ error: 'Result not found' });
        }
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Screenshot serving endpoint (with API prefix)
    this.app.get('/api/screenshots/:filename', (req, res) => {
      const filename = req.params.filename;
      const screenshotPath = path.join(process.cwd(), 'test-results', filename);
      
      // Security check - ensure we're only serving from test-results directory
      if (!screenshotPath.startsWith(path.join(process.cwd(), 'test-results'))) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Check if file exists and send it, otherwise 404
      res.sendFile(screenshotPath, (err) => {
        if (err) {
          res.status(404).json({ error: 'Screenshot not found' });
        }
      });
    });

    // Job status endpoint
    this.app.get('/api/jobs/:id', async (req, res) => {
      try {
        const jobId = req.params.id;
        const job = this.jobs.get(jobId);
        
        if (!job) {
          return res.status(404).json({ success: false, error: 'Job not found' });
        }
        
        res.json({ success: true, job: { jobId, ...job } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Serve React app for all other routes (SPA fallback)
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
    });
  }

  setupWebSocket() {
    if (!this.httpServer) return;
    
    this.wss = new WebSocketServer({ server: this.httpServer });
    
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer = createServer(this.app);
        
        this.httpServer.on('error', (error) => {
          reject(error);
        });
        
        this.httpServer.listen(this.port, () => {
          console.log(`Endorphin Web UI running at http://localhost:${this.port}`);
          
          // Set up WebSocket server after HTTP server is listening
          this.setupWebSocket();
          
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        // Close WebSocket server first
        this.wss.close(() => {
          this.wss = null;
          this.closeHttpServer(resolve);
        });
      } else {
        this.closeHttpServer(resolve);
      }
    });
  }

  closeHttpServer(callback) {
    if (this.httpServer) {
      if (this.httpServer.listening) {
        this.httpServer.close(() => {
          console.log('Endorphin Web UI server stopped');
          this.httpServer = null;
          callback();
        });
      } else {
        this.httpServer = null;
        callback();
      }
    } else {
      callback();
    }
  }
}

/**
 * Create and start a web server instance
 * @param {Object} options - Server options
 * @returns {Promise<WebUIServer>} - Server instance
 */
export async function createWebServer(options = {}) {
  const server = new WebUIServer(options);
  await server.start();
  return server;
}
