import React from 'react';

const TestExecutionPanel = ({ test, executionState, isRunning, onRunTest }) => {
  const getStatusIcon = () => {
    switch (executionState.status) {
      case 'running': return '⚡';
      case 'completed': return executionState.result?.status === 'passed' ? '✅' : '❌';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = () => {
    switch (executionState.status) {
      case 'running': return 'Running...';
      case 'completed': return `Completed (${executionState.result?.status || 'unknown'})`;
      case 'failed': return 'Failed';
      default: return 'Ready to run';
    }
  };

  const getDuration = () => {
    if (!executionState.startTime) return null;
    
    const start = new Date(executionState.startTime);
    const end = executionState.endTime ? new Date(executionState.endTime) : new Date();
    const duration = Math.round((end - start) / 1000);
    
    return `${duration}s`;
  };

  return (
    <div className="test-execution-panel">
      <div className="panel-header">
        <h3>Test Execution</h3>
        <button
          onClick={onRunTest}
          disabled={isRunning}
          className={`btn btn-primary ${isRunning ? 'btn-loading' : ''}`}
        >
          {isRunning ? (
            <>
              <span className="loading-spinner"></span>
              Running...
            </>
          ) : (
            <>
              ▶️ Run Test
            </>
          )}
        </button>
      </div>

      <div className="test-info">
        <div className="test-detail">
          <label>Test ID:</label>
          <span className="test-id">{test.id}</span>
        </div>
        
        {test.site && (
          <div className="test-detail">
            <label>Target Site:</label>
            <span className="test-site">{test.site}</span>
          </div>
        )}
        
        {test.priority && (
          <div className="test-detail">
            <label>Priority:</label>
            <span className={`priority-badge priority-${test.priority.toLowerCase()}`}>
              {test.priority}
            </span>
          </div>
        )}

        {test.tags && test.tags.length > 0 && (
          <div className="test-detail">
            <label>Tags:</label>
            <div className="test-tags">
              {test.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="execution-status">
        <div className="status-header">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
          {getDuration() && (
            <span className="status-duration">{getDuration()}</span>
          )}
        </div>
        
        {executionState.error && (
          <div className="execution-error">
            <h4>Error Details:</h4>
            <p>{executionState.error}</p>
          </div>
        )}

        {executionState.result && (
          <div className="execution-result">
            <h4>Result:</h4>
            <div className={`result-status status-${executionState.result.status}`}>
              {executionState.result.status?.toUpperCase()}
            </div>
            {executionState.result.message && (
              <p>{executionState.result.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestExecutionPanel;
