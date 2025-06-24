import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchTests, fetchTestById, runTest, fetchResults, getJobResult } from '../utils/api';

const TestsContext = createContext();

export const useTests = () => {
  const context = useContext(TestsContext);
  if (!context) {
    throw new Error('useTests must be used within a TestsProvider');
  }
  return context;
};

// Initial state
const initialState = {
  tests: [],
  currentTest: null,
  results: [],
  currentResult: null,
  runningTests: new Set(),
  loading: {
    tests: false,
    currentTest: false,
    results: false,
    currentResult: false,
  },
  errors: {
    tests: null,
    currentTest: null,
    results: null,
    currentResult: null,
    runTest: null,
  },
  filters: {
    search: '',
    tags: [],
    priority: '',
    status: ''
  }
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TESTS: 'SET_TESTS',
  SET_CURRENT_TEST: 'SET_CURRENT_TEST',
  SET_RESULTS: 'SET_RESULTS',
  SET_CURRENT_RESULT: 'SET_CURRENT_RESULT',
  ADD_RUNNING_TEST: 'ADD_RUNNING_TEST',
  REMOVE_RUNNING_TEST: 'REMOVE_RUNNING_TEST',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const testsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.value }
      };
    
    case ActionTypes.SET_TESTS:
      return { ...state, tests: action.tests };
    
    case ActionTypes.SET_CURRENT_TEST:
      return { ...state, currentTest: action.test };
    
    case ActionTypes.SET_RESULTS:
      return { ...state, results: action.results };
    
    case ActionTypes.SET_CURRENT_RESULT:
      return { ...state, currentResult: action.result };
    
    case ActionTypes.ADD_RUNNING_TEST:
      return {
        ...state,
        runningTests: new Set([...state.runningTests, action.testId])
      };
    
    case ActionTypes.REMOVE_RUNNING_TEST:
      const newRunningTests = new Set(state.runningTests);
      newRunningTests.delete(action.testId);
      return { ...state, runningTests: newRunningTests };
    
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters }
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.key]: null }
      };
    
    default:
      return state;
  }
};

export const TestsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testsReducer, initialState);

  // Load tests
  const loadTests = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, key: 'tests', value: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR, key: 'tests' });
    
    try {
      const tests = await fetchTests();
      dispatch({ type: ActionTypes.SET_TESTS, tests });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, key: 'tests', value: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, key: 'tests', value: false });
    }
  };

  // Load specific test
  const loadTest = async (testId) => {
    dispatch({ type: ActionTypes.SET_LOADING, key: 'currentTest', value: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR, key: 'currentTest' });
    
    try {
      const test = await fetchTestById(testId);
      dispatch({ type: ActionTypes.SET_CURRENT_TEST, test });
      return test;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, key: 'currentTest', value: error.message });
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, key: 'currentTest', value: false });
    }
  };

  // Run test
  const executeTest = async (testId) => {
    dispatch({ type: ActionTypes.ADD_RUNNING_TEST, testId });
    dispatch({ type: ActionTypes.CLEAR_ERROR, key: 'runTest' });
    
    try {
      const result = await runTest(testId);
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, key: 'runTest', value: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.REMOVE_RUNNING_TEST, testId });
    }
  };

  // Load results
  const loadResults = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, key: 'results', value: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR, key: 'results' });
    
    try {
      const results = await fetchResults();
      dispatch({ type: ActionTypes.SET_RESULTS, results });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, key: 'results', value: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, key: 'results', value: false });
    }
  };

  // Load specific result
  const loadResult = async (resultId) => {
    dispatch({ type: ActionTypes.SET_LOADING, key: 'currentResult', value: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR, key: 'currentResult' });
    
    try {
      const result = await fetchResultById(resultId);
      dispatch({ type: ActionTypes.SET_CURRENT_RESULT, result });
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, key: 'currentResult', value: error.message });
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, key: 'currentResult', value: false });
    }
  };

  // Update filters
  const updateFilters = (filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, filters });
  };

  // Get filtered tests
  const getFilteredTests = () => {
    let filtered = state.tests;
    
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(test => 
        test.name?.toLowerCase().includes(search) ||
        test.id?.toLowerCase().includes(search) ||
        test.description?.toLowerCase().includes(search)
      );
    }
    
    if (state.filters.priority) {
      filtered = filtered.filter(test => test.priority === state.filters.priority);
    }
    
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(test => 
        test.tags?.some(tag => state.filters.tags.includes(tag))
      );
    }
    
    return filtered;
  };

  // Load tests on mount
  useEffect(() => {
    loadTests();
  }, []);

  const value = {
    ...state,
    loadTests,
    loadTest,
    executeTest,
    loadResults,
    loadResult,
    updateFilters,
    getFilteredTests,
    isTestRunning: (testId) => state.runningTests.has(testId)
  };

  return (
    <TestsContext.Provider value={value}>
      {children}
    </TestsContext.Provider>
  );
};
