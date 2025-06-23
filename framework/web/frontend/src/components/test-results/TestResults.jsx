import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import TestStepsPanel from './TestStepsPanel';
import ScreenshotPanel from './ScreenshotPanel';
import TestSummary from './TestSummary';

/**
 * TestResults component displays detailed results for a specific test execution
 */
const TestResults = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (jobId) {
      loadTestResult();
    }
  }, [jobId]);

  const loadTestResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getJobResult(jobId);
      setTestResult(result);
    } catch (err) {
      setError(`Failed to load test result: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="test-results-loading">
        <LoadingSpinner />
        <p>Loading test results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-results-error">
        <ErrorMessage message={error} />
        <button onClick={handleBackToDashboard} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="test-results-not-found">
        <h2>Test Result Not Found</h2>
        <p>The requested test result could not be found.</p>
        <button onClick={handleBackToDashboard} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="test-results">
      <div className="test-results-header">
        <button onClick={handleBackToDashboard} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>Test Results: {testResult.testId}</h1>
        <div className={`status-badge status-${testResult.status?.toLowerCase()}`}>
          {testResult.status || 'Unknown'}
        </div>
      </div>

      <div className="test-results-tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          Steps
        </button>
        <button
          className={`tab ${activeTab === 'screenshots' ? 'active' : ''}`}
          onClick={() => setActiveTab('screenshots')}
        >
          Screenshots
        </button>
      </div>

      <div className="test-results-content">
        {activeTab === 'summary' && (
          <TestSummary testResult={testResult} />
        )}
        {activeTab === 'steps' && (
          <TestStepsPanel steps={testResult.steps || []} />
        )}
        {activeTab === 'screenshots' && (
          <ScreenshotPanel 
            screenshots={testResult.screenshots || []} 
            jobId={jobId}
          />
        )}
      </div>
    </div>
  );
};

export default TestResults;
