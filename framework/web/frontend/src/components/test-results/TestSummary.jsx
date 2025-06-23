import React from 'react';

/**
 * TestSummary component displays a summary of test execution results
 */
const TestSummary = ({ testResult }) => {
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Unknown';
    const duration = new Date(endTime) - new Date(startTime);
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="test-summary">
      <div className="summary-section">
        <h3>Test Information</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <label>Test ID:</label>
            <span>{testResult.testId}</span>
          </div>
          <div className="summary-item">
            <label>Job ID:</label>
            <span>{testResult.jobId}</span>
          </div>
          <div className="summary-item">
            <label>Status:</label>
            <span className={`status status-${testResult.status?.toLowerCase()}`}>
              {testResult.status}
            </span>
          </div>
          <div className="summary-item">
            <label>Priority:</label>
            <span>{testResult.priority || 'Not specified'}</span>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3>Execution Details</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <label>Started:</label>
            <span>{formatTimestamp(testResult.startTime)}</span>
          </div>
          <div className="summary-item">
            <label>Completed:</label>
            <span>{formatTimestamp(testResult.endTime)}</span>
          </div>
          <div className="summary-item">
            <label>Duration:</label>
            <span>{formatDuration(testResult.startTime, testResult.endTime)}</span>
          </div>
          <div className="summary-item">
            <label>Steps:</label>
            <span>{testResult.steps?.length || 0}</span>
          </div>
        </div>
      </div>

      {testResult.testData && (
        <div className="summary-section">
          <h3>Test Data</h3>
          <pre className="test-data">
            {JSON.stringify(testResult.testData, null, 2)}
          </pre>
        </div>
      )}

      {testResult.error && (
        <div className="summary-section error-section">
          <h3>Error Details</h3>
          <div className="error-message">
            {testResult.error}
          </div>
        </div>
      )}

      {testResult.description && (
        <div className="summary-section">
          <h3>Description</h3>
          <p>{testResult.description}</p>
        </div>
      )}

      {testResult.tags && testResult.tags.length > 0 && (
        <div className="summary-section">
          <h3>Tags</h3>
          <div className="tags">
            {testResult.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSummary;
