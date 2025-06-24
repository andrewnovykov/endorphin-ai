import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { TestsProvider } from './context/TestsContextSimple';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/Dashboard';
import './styles/App.css';

function App() {
  return (
    <WebSocketProvider>
      <TestsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tests/:testId/run" element={<div>Test Runner (Coming Soon)</div>} />
              <Route path="/results" element={<div>Test Results (Coming Soon)</div>} />
              <Route path="/results/:jobId" element={<div>Test Results (Coming Soon)</div>} />
            </Routes>
          </Layout>
        </Router>
      </TestsProvider>
    </WebSocketProvider>
  );
}

export default App;
