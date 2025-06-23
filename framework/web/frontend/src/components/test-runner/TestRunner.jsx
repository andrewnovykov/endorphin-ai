import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTests } from '../../context/TestsContext';
import { useWebSocket } from '../../context/WebSocketContext';
import TestExecutionPanel from './TestExecutionPanel';
import TestStepsDisplay from './TestStepsDisplay';
import LiveScreenshotDisplay from './LiveScreenshotDisplay';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const TestRunner = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentTest, loadTest, executeTest, isTestRunning, loading, errors } = useTests();
  const { lastMessage, isConnected } = useWebSocket();
  
  const [executionState, setExecutionState] = useState({
    status: 'idle', // idle, running, completed, failed
    steps: [],
    currentStep: null,
    screenshots: [],
    currentScreenshot: null,
    result: null,
    error: null,
    startTime: null,
    endTime: null
  });

  // Load test details when component mounts
  useEffect(() => {
    if (testId && (!currentTest || currentTest.id !== testId)) {
      loadTest(testId);
    }
  }, [testId, currentTest, loadTest]);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (!lastMessage) return;

    const { type, ...data } = lastMessage;

    switch (type) {
      case 'test-start':
        if (data.testId === testId) {
          setExecutionState(prev => ({
            ...prev,
            status: 'running',
            steps: [],
            startTime: new Date().toISOString(),
            error: null
          }));
        }
        break;

      case 'test-step':
        if (data.testId === testId) {
          setExecutionState(prev => ({
            ...prev,
            steps: [...prev.steps, data.step],
            currentStep: data.step
          }));
        }
        break;

      case 'test-screenshot':
        if (data.testId === testId) {
          setExecutionState(prev => ({
            ...prev,
            screenshots: [...prev.screenshots, data],
            currentScreenshot: data
          }));
        }
        break;

      case 'test-complete':
        if (data.result?.testId === testId) {
          setExecutionState(prev => ({
            ...prev,
            status: 'completed',
            result: data.result,
            endTime: new Date().toISOString()
          }));
        }
        break;

      case 'test-error':
        if (data.testId === testId) {
          setExecutionState(prev => ({
            ...prev,
            status: 'failed',
            error: data.error,
            endTime: new Date().toISOString()
          }));
        }
        break;
    }
  }, [lastMessage, testId]);

  const handleRunTest = async () => {
    if (!testId) return;

    try {
      // Reset execution state
      setExecutionState({
        status: 'idle',
        steps: [],
        currentStep: null,
        screenshots: [],
        currentScreenshot: null,
        result: null,
        error: null,
        startTime: null,
        endTime: null
      });

      // Start test execution
      await executeTest(testId);
    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        status: 'failed',
        error: error.message,
        endTime: new Date().toISOString()
      }));
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading.currentTest) {
    return (
      <div className="test-runner">
        <LoadingSpinner message="Loading test details..." />
      </div>
    );
  }

  if (errors.currentTest) {
    return (
      <div className="test-runner">
        <ErrorMessage 
          message={errors.currentTest}
          onRetry={() => loadTest(testId)}
        />
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="test-runner">
        <ErrorMessage 
          message="Test not found"
          onRetry={handleBackToDashboard}
        />
      </div>
    );
  }

  const isRunning = isTestRunning(testId) || executionState.status === 'running';

  return (
    <div className="test-runner">
      <div className="test-runner-header">
        <div className="test-runner-nav">
          <button 
            onClick={handleBackToDashboard}
            className="btn btn-ghost"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="test-runner-title">
          <h2>{currentTest.name || currentTest.id}</h2>
          <p>{currentTest.description}</p>
        </div>

        {!isConnected && (
          <div className="connection-warning">
            ⚠️ WebSocket disconnected - Real-time updates unavailable
          </div>
        )}
      </div>

      <div className="test-runner-content">
        <div className="test-runner-grid">
          <div className="test-runner-left">
            <TestExecutionPanel 
              test={currentTest}
              executionState={executionState}
              isRunning={isRunning}
              onRunTest={handleRunTest}
            />
            <TestStepsDisplay 
              steps={executionState.steps}
              currentStep={executionState.currentStep}
            />
          </div>
          
          <div className="test-runner-right">
            <LiveScreenshotDisplay 
              screenshots={executionState.screenshots}
              currentScreenshot={executionState.currentScreenshot}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
