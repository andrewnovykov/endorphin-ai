/**
 * UI Demo Test - Custom Tools Example
 * This test demonstrates how to use custom tools and test data generation in your tests
 */

import type { TestCase } from 'endorphin-ai';

const uiDemoTest: TestCase = {
  id: 'UI-DEMO-001',
  name: 'Custom Demo',
  description: 'Demonstrates using tools and AI-generated test data',
  priority: 'Medium',
  tags: ['demo', 'custom-tools', 'ui'],

  // Setup function - runs before test execution
  setup: async () => {
    console.log('Setting up UI demo test environment...');
    return {
      testUrl: 'https://qafromla.herokuapp.com/',
    };
  },

  // Async data generation - consistent with new pattern
  data: async () => {
    console.log('return test data...');
    return {
      user: {
        email: 'papapin888@gmail.com',
        password: 'lalalend',
      },
    };
  },

  task: async (data, setupData) => {
    return `
      STEP 1: Navigate to ${setupData?.testUrl || 'https://qafromla.herokuapp.com/'}
      STEP 2: Click on "Log In" button
      STEP 3: Wait 2 seconds for page load
      STEP 4: Enter "${data?.user?.email}" in the email field
      STEP 5: Enter "${data?.user?.password}" in the password field
      STEP 6: Click "Sign In" button
      STEP 7: Wait 3 seconds for page load
      STEP 8: Verify login was successful by checking page content
    `;
  },
};

export default uiDemoTest;
