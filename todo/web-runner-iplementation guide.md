# Web UI Runner Implementation Guide

## 🎯 Current Status & Next Steps (January 2025)

### ✅ **COMPLETED - SOLID FOUNDATION**
We have successfully implemented a robust foundation using **Test-Driven Development (TDD)**:

#### **Backend Infrastructure (100% Complete)**
- Express server with REST API endpoints
- WebSocket server for real-time communication  
- CLI integration (`endorphin serve`, `endorphin ui`)
- Complete TDD test coverage with **40+ passing tests**:
  - Web server tests: 15/15 ✅
  - WebSocket reporter tests: 10/10 ✅
  - CLI integration tests: 15/15 ✅

#### **Basic Frontend (Working MVP)**
- Professional static HTML interface with Bootstrap
- Test listing and basic UI layout
- WebSocket connectivity working

#### **Core Functionality Working**
- Test discovery API functional
- Basic test execution through web interface
- Real-time WebSocket updates for test start events
- CLI commands fully integrated with main binary

---

### 🔄 **IN PROGRESS - E2E TEST EXECUTION (RED-GREEN-REFACTOR CYCLE)**
Current TDD cycle is focused on **End-to-End Test Execution** features:

#### **E2E Tests Status (TDD RED Phase)**
- ✅ Comprehensive E2E test suite created (`dev-tests/web-ui-e2e.test.js`)
- ✅ Tests for job tracking, error handling, and WebSocket events
- 🔄 **Some tests passing, others failing and driving development** (this is intentional TDD)
- 🔄 Failing tests are guiding implementation of missing features

#### **E2E Test Execution Status: 🎉 ALL TESTS PASSING! (17/17) ✅**

**MAJOR MILESTONE COMPLETED ✅ (TDD GREEN ACHIEVED):**

*All failing E2E tests have been successfully fixed through TDD implementation:*

- ✅ **Job ID generation and tracking** (E2E tests now pass)
- ✅ **404 responses for non-existent tests** (E2E tests now pass)
- ✅ **WebSocket test start events** (E2E tests now pass) 
- ✅ **WebSocket test step events during execution** (E2E tests now pass)
- ✅ **WebSocket test completion events** (E2E tests now pass)
- ✅ **Test results API with status property** (E2E tests now pass)
- ✅ **Test result retrieval by ID** (E2E tests now pass)
- ✅ **Screenshot serving with 404 handling** (E2E tests now pass)
- ✅ **Error handling and concurrent execution** (E2E tests now pass)

**Backend Implementation: 100% Complete ✅**
- Express server with full REST API
- WebSocket server with real-time events
- Job tracking and status management
- Test results storage and retrieval
- Screenshot serving with proper error handling
- Complete CLI integration

**Current Status: Ready for Phase 3B (React Frontend)** 🚀

---

### 📋 **NEXT PHASES - PRIORITIZED ROADMAP**

#### **Phase 3A: Complete E2E Execution (✅ COMPLETED - ALL TESTS PASSING!)**
**Goal:** Make all E2E tests pass by implementing the missing features
- [x] **Fix job ID generation and tracking** ✅
- [x] **Implement robust error handling** ✅  
- [x] **Complete test results storage/retrieval** ✅
- [x] **Add screenshot serving middleware** ✅
- [x] **Ensure all WebSocket events work reliably** ✅
- [x] **Verify all E2E tests pass** ✅ **17/17 TESTS PASSING!**

#### **Phase 3B: Dynamic React Frontend (NEXT PRIORITY)**  
**Goal:** Replace static HTML with interactive React components
- [ ] Set up Vite + React project structure
- [ ] Create dynamic Dashboard component
- [ ] Build interactive TestRunner with live updates
- [ ] Add TestResults component with screenshot gallery
- [ ] Implement search/filter functionality
- [ ] Add routing and navigation

#### **Phase 3C: Test Recorder Integration (MEDIUM PRIORITY)**
**Goal:** Add Test Recorder tab/section to web UI, reusing existing CLI recorder
- [ ] **Backend API for Test Recorder**
  - [ ] Add `/api/recorder/start` endpoint to start recording session
  - [ ] Add `/api/recorder/stop` endpoint to stop and save recording
  - [ ] Add `/api/recorder/status` endpoint to check recording status
  - [ ] Add WebSocket events for real-time recording updates
  - [ ] Integrate with existing CLI test recorder logic
- [ ] **Frontend Test Recorder Components**
  - [ ] Create TestRecorder tab/section in main navigation
  - [ ] Build RecorderDashboard component for starting/managing sessions
  - [ ] Add RecorderViewer component for live recording display
  - [ ] Implement RecorderControls (start, stop, pause, save)
  - [ ] Add real-time browser preview during recording
- [ ] **CLI Integration & Compatibility**
  - [ ] Ensure CLI `test-recorder` command still works unchanged
  - [ ] Share recorder logic between CLI and web UI
  - [ ] Maintain all existing recorder features and file formats
- [ ] **Recording Features in Web UI**
  - [ ] Live browser window display/streaming
  - [ ] Step-by-step action recording with timestamps
  - [ ] Auto-generate test file with proper Endorphin format
  - [ ] Save recorded tests directly to user's test directory
  - [ ] Preview and edit generated test before saving

#### **Phase 4: Advanced Features (LOWER PRIORITY)**
- [ ] Concurrent test execution management
- [ ] Advanced UI animations and polish
- [ ] Performance optimizations
- [ ] Mobile responsive enhancements
- [ ] Advanced error recovery

---

### 🧪 **TDD Approach Working Excellently**
Our TDD approach has proven highly effective:
- ✅ **Strong foundation:** All core infrastructure tests passing (40+ tests)
- ✅ **Clear development direction:** Failing E2E tests guide next features precisely
- ✅ **High confidence:** Comprehensive test coverage prevents regressions
- ✅ **Incremental progress:** Each feature built with tests first
- 🔄 **Current RED-GREEN cycle:** E2E tests failing intentionally, driving feature completion

**Current TDD Status:** 
- ✅ **GREEN:** Core infrastructure (40+ tests passing)
- ✅ **GREEN:** E2E execution tests (ALL 17/17 TESTS PASSING!) 🎉
- 🎯 **Next:** Phase 3B - React Frontend Development

**Major Achievement:** Successfully completed the RED-GREEN-REFACTOR cycle for E2E test execution!

**Next Iteration:** Continue TDD cycle by fixing the specific failing E2E tests to complete core web UI functionality.

---

## Overview

This guide provides a complete implementation plan for adding a professional web UI to the Endorphin AI test runner. The web UI will allow users to view, search, and run tests through a browser interface while maintaining full CLI compatibility.

## Architecture Overview

The web UI consists of three main components:

1. **Express Server** (`framework/web/server.js`) - Serves the React app and provides REST API endpoints
2. **WebSocket Reporter** (`framework/web/websocket-reporter.js`) - Extends ConsoleReporter for real-time updates
3. **React Frontend** (`framework/web/src/`) - Professional UI built with Vite

## Implementation Plan

### Phase 1: Core Infrastructure ✅ COMPLETED
- [x] Create web server directory structure
- [x] Implement Express server with REST API
- [x] Create WebSocket reporter extending ConsoleReporter
- [x] Add CLI command for launching web UI
- [x] TDD test coverage for core functionality (40+ tests passing)

### Phase 2: Frontend Development 🔄 IN PROGRESS
- [x] Basic HTML UI with Bootstrap styling
- [x] Professional test runs interface
- [ ] Full React + Vite project setup
- [ ] Dynamic dashboard with test listing
- [ ] Advanced search and filtering
- [ ] Interactive test execution interface

### Phase 3: E2E Test Execution 🔄 IN PROGRESS
- [x] Basic test discovery and execution API
- [x] WebSocket real-time communication
- [x] Test start events working
- [ ] Job ID generation and tracking
- [ ] Error handling for non-existent tests
- [ ] Test step events during execution
- [ ] Test completion events
- [ ] Test results storage and retrieval
- [ ] Screenshot serving

### Phase 4: Advanced Features 📋 PLANNED
- [ ] Full React frontend with components
- [ ] Real-time test runner interface
- [ ] Test results visualization
- [ ] Screenshot gallery
- [ ] Performance optimization
- [ ] Advanced error handling

## Directory Structure

```
framework/web/
├── server.js                 # Express server
├── websocket-reporter.js     # WebSocket reporter
├── package.json             # Web UI dependencies
├── vite.config.js           # Vite configuration
├── public/                  # Static assets
│   └── index.html
└── src/                     # React source code
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── Dashboard.jsx
    │   ├── TestList.jsx
    │   ├── TestRunner.jsx
    │   └── TestResults.jsx
    └── styles/
        └── main.css
```

## Step-by-Step Implementation Guide

### Step 1: Create Web Server Infrastructure

#### 1.1 Create directory structure
```bash
mkdir -p framework/web/src/components
mkdir -p framework/web/src/styles
mkdir -p framework/web/public
```

#### 1.2 Create Express server (`framework/web/server.js`)
```javascript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverTests } from '../core/test-discovery.js';
import { runTest } from '../core/test-runner.js';
import { WebSocketReporter } from './websocket-reporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API Routes
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await discoverTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tests/:testId/run', async (req, res) => {
  try {
    const { testId } = req.params;
    const reporter = new WebSocketReporter(io);
    
    // Run test with WebSocket reporter
    const result = await runTest(testId, { reporter });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Endorphin Web UI running at http://localhost:${PORT}`);
});
```

#### 1.3 Create WebSocket reporter (`framework/web/websocket-reporter.js`)
```javascript
import { ConsoleReporter } from '../core/console-reporter.js';

export class WebSocketReporter extends ConsoleReporter {
  constructor(io) {
    super();
    this.io = io;
  }

  onTestStart(testInfo) {
    super.onTestStart(testInfo);
    this.io.emit('test:start', testInfo);
  }

  onTestStep(stepInfo) {
    super.onTestStep(stepInfo);
    this.io.emit('test:step', stepInfo);
  }

  onTestScreenshot(screenshotInfo) {
    super.onTestScreenshot(screenshotInfo);
    this.io.emit('test:screenshot', screenshotInfo);
  }

  onTestComplete(result) {
    super.onTestComplete(result);
    this.io.emit('test:complete', result);
  }

  onTestError(error) {
    super.onTestError(error);
    this.io.emit('test:error', error);
  }
}
```

### Step 2: Frontend Development

#### 2.1 Create Vite configuration (`framework/web/vite.config.js`)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

#### 2.2 Create package.json (`framework/web/package.json`)
```json
{
  "name": "endorphin-web-ui",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.0",
    "express": "^4.18.0",
    "socket.io": "^4.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

#### 2.3 Create main React app (`framework/web/src/App.jsx`)
```jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import TestRunner from './components/TestRunner';
import './styles/main.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleRunTest = (test) => {
    setSelectedTest(test);
    setCurrentView('runner');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTest(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧬 Endorphin AI Test Runner</h1>
        {currentView === 'runner' && (
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
        )}
      </header>

      <main className="app-main">
        {currentView === 'dashboard' ? (
          <Dashboard onRunTest={handleRunTest} />
        ) : (
          <TestRunner test={selectedTest} socket={socket} />
        )}
      </main>
    </div>
  );
}

export default App;
```

### Step 3: Add CLI Command

#### 3.1 Update CLI (`bin/endorphin.js`)
Add the following command handler:

```javascript
// Add after existing command handlers
if (command === 'serve' || command === 'ui') {
  const { spawn } = await import('child_process');
  const path = await import('path');
  
  console.log('🚀 Starting Endorphin Web UI...');
  
  // Start the web server
  const serverPath = path.join(process.cwd(), 'node_modules', 'endorphin-ai', 'framework', 'web', 'server.js');
  const server = spawn('node', [serverPath], { stdio: 'inherit' });
  
  server.on('error', (err) => {
    console.error('Failed to start web server:', err);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    server.kill();
    process.exit(0);
  });
  
  return;
}
```

### Step 4: Update Core Framework (Minimal Changes)

#### 4.1 Update test discovery (`framework/core/test-discovery.js`)
Add optional reporter parameter:

```javascript
export async function discoverTests(options = {}) {
  const { reporter } = options;
  
  // ...existing code...
  
  if (reporter) {
    reporter.onDiscoveryStart?.();
  }
  
  // ...existing discovery logic...
  
  if (reporter) {
    reporter.onDiscoveryComplete?.(tests);
  }
  
  return tests;
}
```

#### 4.2 Update test runner (`framework/core/test-runner.js`)
Ensure reporter is passed through:

```javascript
export async function runTest(testId, options = {}) {
  const { reporter = new ConsoleReporter() } = options;
  
  // ...existing code using reporter...
}
```

## Implementation Checklist

### Core Infrastructure ✅ COMPLETED
- [x] Create `framework/web/` directory structure
- [x] Implement Express server with REST API endpoints
- [x] Create WebSocket reporter extending ConsoleReporter
- [x] Add web UI dependencies to package.json
- [x] TDD test framework with 40+ passing tests

### Backend API ✅ MOSTLY COMPLETED / 🔄 NEEDS E2E-DRIVEN FIXES
- [x] `/api/tests` - GET endpoint to list all tests
- [x] `/api/tests/:id` - GET endpoint to get specific test details
- [x] `/api/tests/:id/run` - POST endpoint to run specific test
- [ ] **Job ID generation and tracking for test runs** ← E2E test failing, needs implementation
- [ ] **Proper 404 handling for non-existent tests** ← E2E test failing, needs implementation
- [x] `/api/results` - GET endpoint to list test results (stub exists)
- [x] `/api/results/:id` - GET endpoint to get specific result details (stub exists)
- [ ] **Complete test results storage and retrieval** ← E2E test failing, needs implementation
- [x] WebSocket events for real-time test updates (basic)
- [ ] **Enhanced WebSocket events for test steps and completion** ← E2E test failing, needs implementation
- [x] Error handling for API endpoints (basic)
- [x] CORS configuration for development

### Real-time Features ✅ PARTIALLY WORKING / 🔄 NEEDS E2E-DRIVEN ENHANCEMENT
- [x] WebSocket connection management
- [x] Test start events via WebSocket
- [ ] **Reliable test step events during execution** ← E2E test failing, needs implementation
- [ ] **Test completion events with results** ← E2E test failing, needs implementation
- [ ] **Screenshot display during execution** ← E2E test failing, needs implementation
- [ ] **Progress indicators and status updates** ← E2E test failing, needs implementation
- [ ] **Error message display via WebSocket** ← E2E test failing, needs implementation

### CLI Integration ✅ COMPLETED
- [x] Add `endorphin serve` command
- [x] Add `endorphin ui` command alias
- [x] Graceful server startup and shutdown
- [x] Port configuration options (`--port`)
- [x] Browser control options (`--no-browser`)
- [x] Host configuration (`--host`)
- [x] Help documentation and usage examples

### Framework Integration ✅ COMPLETED
- [x] Update test-discovery.js for optional reporter
- [x] Ensure test-runner.js accepts custom reporter
- [x] Maintain backward compatibility with CLI
- [x] No breaking changes to existing functionality
- [x] Proper error propagation

### Frontend Components 🔄 BASIC VERSION EXISTS / 📋 NEEDS FULL IMPLEMENTATION
- [x] Static HTML interface with Bootstrap
- [x] Professional test runs page layout
- [ ] **Dynamic React app with routing**
- [ ] **Dashboard component for test overview**
- [ ] **TestList component with search/filter**
- [ ] **TestRunner component for live execution**
- [ ] **TestResults component for viewing results**
- [ ] **Screenshot gallery component**

### Testing & Quality ✅ EXCELLENT TDD COVERAGE / 🔄 E2E CYCLE IN PROGRESS
- [x] Comprehensive TDD test suite (40+ tests)
- [x] Web server tests (15/15 passing)
- [x] WebSocket reporter tests (10/10 passing)  
- [x] CLI integration tests (15/15 passing)
- [x] E2E test framework created (`dev-tests/web-ui-e2e.test.js`)
- 🔄 **E2E tests: some passing, some failing (driving development)** ← This is intentional TDD RED
- [x] Verify CLI commands still work unchanged
- [x] Test WebSocket connection reliability
- [ ] **Fix failing E2E tests to drive feature completion** ← Current TDD GREEN goal
- [ ] Cross-browser compatibility testing (future)
- [ ] Mobile responsive design testing (future)

### Documentation 📋 NEEDS UPDATE
- [ ] Update main README with web UI instructions
- [ ] Add web UI user guide
- [ ] Create developer documentation
- [ ] Add troubleshooting section
- [ ] Include demo video/screenshots

### Performance & Polish 📋 FUTURE PHASE
- [ ] Optimize bundle size (after React implementation)
- [ ] Add loading states and animations
- [ ] Implement proper error boundaries
- [ ] Add accessibility features
- [ ] Professional visual design enhancements

## Usage Instructions

### For Users

1. **Start the web UI:**
   ```bash
   endorphin serve
   # or
   endorphin ui
   ```

2. **Access the interface:**
   - Open browser to `http://localhost:3000`
   - View and search available tests
   - Click "Run" to execute tests with real-time updates

3. **CLI remains unchanged:**
   ```bash
   endorphin run test TEST-001  # Still works exactly the same
   endorphin list              # Still works exactly the same
   ```

### For Developers

1. **Development setup:**
   ```bash
   cd framework/web
   npm install
   npm run dev  # Start Vite dev server
   ```

2. **Build for production:**
   ```bash
   npm run build  # Builds to public/ directory
   ```

## Key Benefits

✅ **No Breaking Changes** - All existing CLI functionality preserved  
✅ **Professional UI** - Modern interface with real-time updates (static HTML MVP working)  
✅ **Easy Integration** - Reuses existing framework code  
✅ **Backward Compatible** - Works with all existing test files and configs  
✅ **Excellent TDD Coverage** - 40+ tests ensuring reliability  
✅ **CLI Integration Complete** - `endorphin serve` and `endorphin ui` commands working  
🔄 **Real-time Updates** - Basic WebSocket events working, enhancing for full test execution  
🔄 **Test Execution** - Basic test running working, adding job tracking and error handling  
📋 **Full React Frontend** - Planned for Phase 3B after E2E completion  

## Technical Notes

- **WebSocket Reporter**: Extends existing ConsoleReporter, so CLI output unchanged
- **API Design**: RESTful endpoints that wrap existing framework functions
- **Frontend State**: React components manage UI state separately from framework
- **Build Process**: Vite builds frontend to `public/` directory served by Express
- **Port Configuration**: Web UI runs on port 3000, Vite dev server on 5173

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change PORT environment variable
2. **WebSocket errors**: Check CORS configuration
3. **Build failures**: Ensure Node.js 16+ and correct dependencies
4. **Test discovery issues**: Verify config file and test directory structure

### Development Tips

- Use `npm run dev` for hot reloading during development
- Check browser console for WebSocket connection status
- Use Express middleware for debugging API requests
- Test with various test files to ensure compatibility

# Endorphin AI Web UI Implementation Guide

## Overview

This guide outlines the implementation of a professional web UI for the Endorphin AI test runner. The web UI will allow users to view, search, and run tests from a browser with real-time progress updates, step-by-step execution display, and full CLI compatibility.

## Architecture

### Full-Stack Approach
- **Backend**: Node.js/Express server with WebSocket support
- **Frontend**: React with Vite for fast development and modern UI
- **Real-time Communication**: WebSockets for live test execution updates
- **Data Storage**: File-based (existing test files and results)

### Directory Structure
```
framework/
  web/
    server.js                 # Express server entry point
    websocket-reporter.js     # WebSocket reporter for real-time updates
    routes/
      api.js                  # REST API endpoints
      tests.js                # Test management endpoints
    public/                   # Static files served by Express
    src/                      # React frontend source
      components/
        TestList.jsx          # Test listing and filtering
        TestRunner.jsx        # Test execution interface
        TestResults.jsx       # Results and screenshots display
        Dashboard.jsx         # Main dashboard
      hooks/
        useWebSocket.js       # WebSocket connection hook
        useTests.js           # Test data management
      utils/
        api.js                # Frontend API client
      App.jsx               # Main React app
      main.jsx              # React entry point
    package.json              # Frontend dependencies
    vite.config.js           # Vite configuration
```

## Implementation Plan

### Phase 1: Backend Infrastructure
1. **Express Server Setup**
   - Create `/framework/web/server.js` with Express app
   - Serve static files from `/framework/web/public`
   - Set up CORS for development
   - Add graceful shutdown handling

2. **REST API Endpoints**
   - `GET /api/tests` - List all available tests
   - `GET /api/tests/:id` - Get specific test details
   - `POST /api/tests/:id/run` - Execute a test
   - `GET /api/results` - List test results
   - `GET /api/results/:id` - Get specific result details

3. **WebSocket Integration**
   - Create `/framework/web/websocket-reporter.js`
   - Extend existing reporter system to support WebSocket output
   - Implement real-time test step broadcasting
   - Handle client connection/disconnection

### Phase 2: Frontend Development
1. **React App Setup**
   - Initialize Vite project in `/framework/web/src`
   - Set up modern React with hooks and context
   - Configure Tailwind CSS for styling
   - Add Material-UI or similar component library

2. **Core Components**
   - **Dashboard**: Overview of tests and recent results
   - **TestList**: Searchable, filterable test listing
   - **TestRunner**: Real-time test execution interface
   - **TestResults**: Detailed results with screenshots

3. **Real-time Features**
   - WebSocket connection management
   - Live test step updates
   - Progress indicators and status displays
   - Screenshot streaming during execution

### Phase 3: Integration & Polish
1. **CLI Integration**
   - Add `endorphin serve` or `endorphin ui` command
   - Auto-detect available port
   - Open browser automatically
   - Support configuration options

2. **Testing & Documentation**
   - Unit tests for new components
   - Integration tests for API endpoints
   - User documentation and screenshots
   - Demo video creation

## Detailed Implementation Guide

### 1. Backend Server (`/framework/web/server.js`)

```javascript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { testDiscovery } from '../core/test-discovery.js';
import { TestRunner } from '../core/test-runner.js';
import { WebSocketReporter } from './websocket-reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebUIServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // API routes
    this.app.get('/api/tests', async (req, res) => {
      try {
        const tests = await testDiscovery.discoverTests();
        res.json(tests);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/tests/:id/run', async (req, res) => {
      try {
        const testId = req.params.id;
        const reporter = new WebSocketReporter(this.wss);
        const runner = new TestRunner({ reporter });
        
        // Run test asynchronously
        runner.runTest(testId).catch(console.error);
        
        res.json({ status: 'started', testId });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve React app for all other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
  }

  async start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Endorphin Web UI running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Endorphin Web UI server stopped');
        resolve();
      });
    });
  }
}
```

### 2. WebSocket Reporter (`/framework/web/websocket-reporter.js`)

```javascript
import { BaseReporter } from '../core/base-reporter.js';

export class WebSocketReporter extends BaseReporter {
  constructor(wss) {
    super();
    this.wss = wss;
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  onTestStart(test) {
    this.broadcast({
      type: 'test-start',
      test: test,
      timestamp: new Date().toISOString()
    });
  }

  onTestStep(step) {
    this.broadcast({
      type: 'test-step',
      step: step,
      timestamp: new Date().toISOString()
    });
  }

  onTestComplete(result) {
    this.broadcast({
      type: 'test-complete',
      result: result,
      timestamp: new Date().toISOString()
    });
  }

  onScreenshot(screenshotPath) {
    this.broadcast({
      type: 'screenshot',
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 3. React Frontend Structure

#### Main App Component (`/framework/web/src/App.jsx`)

```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TestList from './components/TestList';
import TestRunner from './components/TestRunner';
import TestResults from './components/TestResults';
import { WebSocketProvider } from './hooks/useWebSocket';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-purple-600 text-white p-4">
            <h1 className="text-2xl font-bold">Endorphin AI Test Runner</h1>
          </nav>
          
          <main className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tests" element={<TestList />} />
              <Route path="/tests/:id/run" element={<TestRunner />} />
              <Route path="/results" element={<TestResults />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
```

#### Test Runner Component (`/framework/web/src/components/TestRunner.jsx`)

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';

const TestRunner = () => {
  const { id } = useParams();
  const { lastMessage, sendMessage } = useWebSocket();
  const [testStatus, setTestStatus] = useState('idle');
  const [steps, setSteps] = useState([]);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'test-start':
          setTestStatus('running');
          setSteps([]);
          break;
        case 'test-step':
          setSteps(prev => [...prev, data.step]);
          break;
        case 'test-complete':
          setTestStatus('completed');
          break;
        case 'screenshot':
          setCurrentScreenshot(data.path);
          break;
      }
    }
  }, [lastMessage]);

  const runTest = async () => {
    try {
      const response = await fetch(`/api/tests/${id}/run`, {
        method: 'POST'
      });
      const result = await response.json();
      console.log('Test started:', result);
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Test Execution</h2>
        
        <button
          onClick={runTest}
          disabled={testStatus === 'running'}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {testStatus === 'running' ? 'Running...' : 'Run Test'}
        </button>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Steps:</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {steps.map((step, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                {step.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Live Screenshot</h2>
        {currentScreenshot ? (
          <img
            src={`/screenshots/${currentScreenshot}`}
            alt="Current test step"
            className="w-full h-auto border rounded"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 border rounded flex items-center justify-center">
            <span className="text-gray-500">No screenshot available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunner;
```

### 4. CLI Integration

Update `/bin/endorphin.js` to add web UI commands:

```javascript
// Add to existing CLI commands
else if (args[1] === 'serve' || args[1] === 'ui') {
  const { WebUIServer } = await import('../framework/web/server.js');
  const server = new WebUIServer({ port: args[2] || 3000 });
  
  await server.start();
  
  // Auto-open browser
  const open = await import('open');
  await open.default(`http://localhost:${server.port}`);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}
```

### 5. Build Process

Create `/framework/web/package.json`:

```json
{
  "name": "endorphin-web-ui",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.4",
    "vite": "^4.1.0"
  }
}
```

Create `/framework/web/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

## Implementation Checklist

### Backend Development
- [ ] Create Express server with basic routing
- [ ] Implement REST API endpoints for tests and results
- [ ] Set up WebSocket server for real-time communication
- [ ] Create WebSocketReporter class
- [ ] Add screenshot serving endpoints
- [ ] Implement graceful shutdown handling
- [ ] Add error handling and logging
- [ ] Test API endpoints with Postman/curl

### Frontend Development
- [ ] Set up Vite + React project structure
- [ ] Configure Tailwind CSS for styling
- [ ] Create main App component with routing
- [ ] Implement Dashboard component
- [ ] Build TestList component with search/filter
- [ ] Create TestRunner component with real-time updates
- [ ] Build TestResults component for viewing past results
- [ ] Implement WebSocket hook for connection management
- [ ] Add responsive design for mobile devices
- [ ] Create loading states and error handling

### Integration & Testing
- [ ] Add CLI command for starting web UI (`endorphin serve`)
- [ ] Implement auto-browser opening
- [ ] Test WebSocket communication end-to-end
- [ ] Verify test execution works from web UI
- [ ] Test screenshot display and real-time updates
- [ ] Add build process for production deployment
- [ ] Create unit tests for new components
- [ ] Add integration tests for API endpoints
- [ ] Test on different browsers and devices

### Documentation & Polish
- [ ] Create user guide for web UI
- [ ] Add screenshots to documentation
- [ ] Record demo video
- [ ] Update main README with web UI info
- [ ] Add configuration options documentation
- [ ] Create troubleshooting guide
- [ ] Polish UI/UX based on feedback
- [ ] Optimize performance and loading times

### Deployment & Distribution
- [ ] Ensure web UI builds are included in npm package
- [ ] Test installation and setup process
- [ ] Create Docker container option
- [ ] Add environment variable configuration
- [ ] Test in different Node.js versions
- [ ] Create production deployment guide
- [ ] Add security considerations documentation
- [ ] Prepare release notes and changelog

## Key Considerations

### Backward Compatibility
- All existing CLI commands must continue working unchanged
- Test file format remains exactly the same
- Configuration system unchanged
- No breaking changes to core framework

### Performance
- Lazy load components to reduce initial bundle size
- Implement pagination for large test suites
- Optimize WebSocket message frequency
- Cache test results for faster loading

### Security
- Sanitize all user inputs
- Implement basic authentication if needed
- Secure WebSocket connections
- Validate file paths and prevent directory traversal

### User Experience
- Intuitive navigation and clear visual hierarchy
- Responsive design for all screen sizes
- Fast loading and smooth real-time updates
- Comprehensive error messages and help text

## Success Metrics

### ✅ **ACHIEVED SO FAR**
1. **Core Functionality**: Test listing and basic execution working ✅
2. **CLI Integration**: Complete CLI compatibility with new commands ✅  
3. **TDD Foundation**: 40+ tests providing solid reliability ✅
4. **No Breaking Changes**: All existing workflows preserved ✅
5. **Real-time Communication**: WebSocket infrastructure working ✅
6. **Professional UI**: Bootstrap-based web interface with test listing ✅
7. **Robust Architecture**: Express server, API endpoints, WebSocket reporter ✅

### 🔄 **IN PROGRESS (TDD RED-GREEN CYCLE)**  
1. **E2E Test Execution**: ✅ **COMPLETED! All 17/17 tests passing**
2. **Complete WebSocket Events**: ✅ **COMPLETED! All events working**
3. **Test Results System**: ✅ **COMPLETED! Full API implemented**

### 📋 **PLANNED (NEXT PHASES)**
1. **Full React UI**: Dynamic, interactive frontend components (Phase 3B - Next Priority)
2. **Test Recorder Integration**: Web UI for test recording with CLI compatibility (Phase 3C)
3. **Performance**: Optimized loading and responsive interface  
4. **Documentation**: Complete user and developer guides
5. **Advanced Features**: Concurrent execution, advanced UI polish

This implementation will provide a modern, professional web interface for Endorphin AI while maintaining full backward compatibility with existing CLI workflows.

## 🚀 **Quick Start - Current Working Features**

### **Using the Web UI (Available Now)**
```bash
# Start the web UI server
endorphin serve

# Or with custom options
endorphin serve --port 3333 --no-browser
endorphin ui --host 0.0.0.0 --port 8080
```

### **What Works Right Now**
- ✅ Professional web interface at `http://localhost:3000`
- ✅ View all available tests with professional Bootstrap UI
- ✅ Click to run tests through web UI
- ✅ Real-time WebSocket connection established
- ✅ Basic test execution with test start events
- ✅ All CLI commands still work exactly the same
- ✅ Complete CLI integration (`endorphin serve`, `endorphin ui`)

### **Current Limitations (TDD RED - Failing E2E Tests Driving Development)**
- 🔄 **Job tracking for test runs** (E2E test failing, needs implementation)
- 🔄 **Detailed test step events** (E2E test failing, needs implementation)
- 🔄 **Test completion events** (E2E test failing, needs implementation)
- 🔄 **Test results storage/viewing** (E2E test failing, needs implementation)  
- 🔄 **Screenshot serving** (E2E test failing, needs implementation)
- 🔄 **Error handling for 404s** (E2E test failing, needs implementation)
- 📋 **Full React frontend** (planned for Phase 3B after E2E completion)

### **TDD Status**
- ✅ **40+ infrastructure tests passing** (solid foundation)
- 🔄 **E2E tests failing intentionally** (driving feature development)
- 🎯 **Next goal:** Make E2E tests GREEN by implementing the specific features they test

#### **E2E Test Coverage (Red-Green-Refactor Cycle)**
The failing E2E tests in `dev-tests/web-ui-e2e.test.js` specifically test:
- ❌ Job ID generation and tracking for test execution
- ❌ 404 error handling for non-existent tests  
- ❌ Test step events broadcast via WebSocket during execution
- ❌ Test completion events with full results
- ❌ Test results storage and retrieval via `/api/results` endpoints
- ❌ Screenshot serving and display during test runs
- ❌ Proper error propagation through WebSocket events

*These failing tests are intentional and guide exactly what needs to be implemented next.*

---