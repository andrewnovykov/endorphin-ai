import React from 'react';
import { useTests } from '../../context/TestsContext';
import SearchBar from './SearchBar';
import FilterTabs from './FilterTabs';
import TestGrid from './TestGrid';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const Dashboard = () => {
  const { 
    loading, 
    errors, 
    filters,
    getFilteredTests,
    updateFilters,
    loadTests
  } = useTests();

  const filteredTests = getFilteredTests();

  const handleRefresh = () => {
    loadTests();
  };

  if (loading.tests) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <LoadingSpinner />
          <p>Loading tests...</p>
        </div>
      </div>
    );
  }

  if (errors.tests) {
    return (
      <div className="dashboard">
        <ErrorMessage 
          message={errors.tests}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Test Dashboard</h2>
          <p className="dashboard-subtitle">
            Manage and execute your Endorphin AI tests
          </p>
        </div>
        
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={loading.tests}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-filters">
        <SearchBar 
          value={filters.search}
          onChange={(search) => updateFilters({ search })}
        />
        <FilterTabs 
          filters={filters}
          onFilterChange={updateFilters}
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredTests.length}</div>
            <div className="stat-label">Tests Available</div>
          </div>
        </div>

        <TestGrid tests={filteredTests} />
      </div>
    </div>
  );
};

export default Dashboard;
