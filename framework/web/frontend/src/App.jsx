import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { TestsProvider } from './context/TestsContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/Dashboard';
import TestRunnerPage from './pages/TestRunner';
import TestResultsPage from './pages/TestResults';
import './styles/App.css';

function App() {
  return (
    <WebSocketProvider>
      <TestsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tests/:testId/run" element={<TestRunnerPage />} />
              <Route path="/results" element={<TestResultsPage />} />
              <Route path="/results/:jobId" element={<TestResultsPage />} />
            </Routes>
          </Layout>
        </Router>
      </TestsProvider>
    </WebSocketProvider>
  );
}

export default App;
