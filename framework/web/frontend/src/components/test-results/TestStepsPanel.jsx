import React, { useState } from 'react';

/**
 * TestStepsPanel component displays the step-by-step execution of a test
 */
const TestStepsPanel = ({ steps }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const toggleStepExpanded = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step) => {
    if (step.status === 'success') return '✅';
    if (step.status === 'error') return '❌';
    if (step.status === 'warning') return '⚠️';
    return '⏳';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const duration = new Date(endTime) - new Date(startTime);
    return `(${(duration / 1000).toFixed(2)}s)`;
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="test-steps-empty">
        <p>No execution steps recorded for this test.</p>
      </div>
    );
  }

  return (
    <div className="test-steps-panel">
      <div className="steps-header">
        <h3>Execution Steps ({steps.length})</h3>
        <div className="steps-controls">
          <button
            className="btn btn-sm"
            onClick={() => setExpandedSteps(new Set(steps.map((_, i) => i)))}
          >
            Expand All
          </button>
          <button
            className="btn btn-sm"
            onClick={() => setExpandedSteps(new Set())}
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div key={index} className={`step-item ${step.status || 'pending'}`}>
            <div 
              className="step-header"
              onClick={() => toggleStepExpanded(index)}
            >
              <div className="step-info">
                <span className="step-icon">{getStepIcon(step)}</span>
                <span className="step-number">Step {index + 1}</span>
                <span className="step-title">{step.description || step.action || 'Unnamed step'}</span>
              </div>
              <div className="step-meta">
                <span className="step-time">
                  {formatTimestamp(step.timestamp)}
                  {step.duration && ` ${formatDuration(step.startTime, step.endTime)}`}
                </span>
                <span className="step-toggle">
                  {expandedSteps.has(index) ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {expandedSteps.has(index) && (
              <div className="step-details">
                {step.action && (
                  <div className="step-detail">
                    <label>Action:</label>
                    <code>{step.action}</code>
                  </div>
                )}
                
                {step.selector && (
                  <div className="step-detail">
                    <label>Selector:</label>
                    <code>{step.selector}</code>
                  </div>
                )}

                {step.value && (
                  <div className="step-detail">
                    <label>Value:</label>
                    <code>{step.value}</code>
                  </div>
                )}

                {step.result && (
                  <div className="step-detail">
                    <label>Result:</label>
                    <pre>{JSON.stringify(step.result, null, 2)}</pre>
                  </div>
                )}

                {step.error && (
                  <div className="step-detail error">
                    <label>Error:</label>
                    <pre className="error-text">{step.error}</pre>
                  </div>
                )}

                {step.screenshot && (
                  <div className="step-detail">
                    <label>Screenshot:</label>
                    <img 
                      src={`/api/screenshots/${step.screenshot}`}
                      alt={`Step ${index + 1} screenshot`}
                      className="step-screenshot"
                    />
                  </div>
                )}

                {step.logs && step.logs.length > 0 && (
                  <div className="step-detail">
                    <label>Logs:</label>
                    <div className="step-logs">
                      {step.logs.map((log, logIndex) => (
                        <div key={logIndex} className={`log-entry log-${log.level || 'info'}`}>
                          <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                          <span className="log-message">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestStepsPanel;
