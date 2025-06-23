import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTests, runTest, fetchResults, fetchResultById } from '../utils/api';

const TestContext = createContext();

export function TestProvider({ children }) {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tests on component mount
  useEffect(() => {
    loadTests();
    loadResults();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTests = await fetchTests();
      setTests(fetchedTests);
    } catch (err) {
      setError('Failed to load tests: ' + err.message);
      console.error('Error loading tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const fetchedResults = await fetchResults();
      setResults(fetchedResults);
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const executeTest = async (testId) => {
    try {
      const result = await runTest(testId);
      // Refresh results after test execution
      setTimeout(() => loadResults(), 1000);
      return result;
    } catch (err) {
      setError('Failed to run test: ' + err.message);
      throw err;
    }
  };

  const getTestById = (testId) => {
    return tests.find(test => test.id === testId);
  };

  const getResultById = async (resultId) => {
    try {
      return await fetchResultById(resultId);
    } catch (err) {
      console.error('Error loading result:', err);
      return null;
    }
  };

  const value = {
    tests,
    results,
    loading,
    error,
    loadTests,
    loadResults,
    executeTest,
    getTestById,
    getResultById,
    setError,
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
}

export function useTests() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTests must be used within a TestProvider');
  }
  return context;
}
