import React from 'react';

function TestCard({ test, lastResult, onRun }) {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'status-passed';
      case 'failed':
        return 'status-failed';
      case 'running':
        return 'status-running';
      default:
        return 'status-unknown';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never run';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="test-card">
      <div className="test-card-header">
        <div className="test-card-title">
          <h3>{test.name}</h3>
          <span className="test-id">{test.id}</span>
        </div>
        <div className={`priority-badge ${getPriorityColor(test.priority)}`}>
          {test.priority || 'Medium'}
        </div>
      </div>

      <div className="test-card-body">
        <p className="test-description">{test.description}</p>
        
        {test.tags && test.tags.length > 0 && (
          <div className="test-tags">
            {test.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {lastResult && (
          <div className="last-result">
            <span className={`result-status ${getStatusColor(lastResult.status)}`}>
              {lastResult.status}
            </span>
            <span className="result-time">
              {formatTimestamp(lastResult.timestamp)}
            </span>
          </div>
        )}
      </div>

      <div className="test-card-footer">
        <button 
          className="run-button"
          onClick={onRun}
        >
          ▶️ Run Test
        </button>
        
        <div className="test-info">
          <span className="test-site">{test.site}</span>
        </div>
      </div>
    </div>
  );
}

export default TestCard;
