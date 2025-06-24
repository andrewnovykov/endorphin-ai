import React, { createContext, useContext, useState } from 'react';

const TestsContext = createContext();

export const useTests = () => {
  const context = useContext(TestsContext);
  if (!context) {
    throw new Error('useTests must be used within a TestsProvider');
  }
  return context;
};

export const TestsProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    tests,
    loading,
    error,
    setTests,
    setLoading,
    setError
  };

  return (
    <TestsContext.Provider value={value}>
      {children}
    </TestsContext.Provider>
  );
};
