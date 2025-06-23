import React from 'react';
import TestCard from './TestCard';

const TestGrid = ({ tests }) => {
  if (tests.length === 0) {
    return (
      <div className="test-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No tests found</h3>
          <p>No tests match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-grid">
      {tests.map((test) => (
        <TestCard 
          key={test.id} 
          test={test}
        />
      ))}
    </div>
  );
};

export default TestGrid;
