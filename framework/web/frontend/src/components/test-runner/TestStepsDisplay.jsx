import React, { useState } from 'react';

/**
 * TestStepsDisplay component shows real-time test execution steps
 */
const TestStepsDisplay = ({ steps, currentStep }) => {
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

  const getStepIcon = (step, index) => {
    if (index < currentStep) return '✅';
    if (index === currentStep) return '⏳';
    if (step.status === 'error') return '❌';
    return '⚪';
  };

  const getStepStatus = (step, index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'running';
    if (step.status === 'error') return 'error';
    return 'pending';
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="test-steps-display-empty">
        <p>Waiting for test execution to begin...</p>
      </div>
    );
  }

  return (
    <div className="test-steps-display">
      <div className="steps-header">
        <h4>Execution Steps ({steps.length})</h4>
        <div className="progress-indicator">
          Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
        </div>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`step-item ${getStepStatus(step, index)}`}
          >
            <div 
              className="step-header"
              onClick={() => toggleStepExpanded(index)}
            >
              <div className="step-info">
                <span className="step-icon">{getStepIcon(step, index)}</span>
                <span className="step-number">{index + 1}</span>
                <span className="step-description">
                  {step.description || step.action || 'Executing step...'}
                </span>
              </div>
              <div className="step-controls">
                {step.timestamp && (
                  <span className="step-time">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
                <span className="step-toggle">
                  {expandedSteps.has(index) ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {expandedSteps.has(index) && step.details && (
              <div className="step-details">
                {step.details.action && (
                  <div className="step-detail">
                    <label>Action:</label>
                    <code>{step.details.action}</code>
                  </div>
                )}
                
                {step.details.selector && (
                  <div className="step-detail">
                    <label>Selector:</label>
                    <code>{step.details.selector}</code>
                  </div>
                )}

                {step.details.value && (
                  <div className="step-detail">
                    <label>Value:</label>
                    <code>{step.details.value}</code>
                  </div>
                )}

                {step.details.result && (
                  <div className="step-detail">
                    <label>Result:</label>
                    <pre>{JSON.stringify(step.details.result, null, 2)}</pre>
                  </div>
                )}

                {step.error && (
                  <div className="step-detail error">
                    <label>Error:</label>
                    <pre className="error-text">{step.error}</pre>
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

export default TestStepsDisplay;
