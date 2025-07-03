/**
 * Sample Test - Getting Started with Endorphin AI
 * This test demonstrates basic navigation, interaction, setup, and data generation
 */

import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';

const sampleTest: TestCase = {
  id: 'HEALTH-001',
  name: 'Sample Health Check Test',
  description: 'A simple test to verify the framework is working correctly',
  priority: 'High',
  tags: ['health-check', 'sample'],

  // Optional setup function that runs before the test
  setup: async () => {
    console.log('Setting up test environment...');
    return {
      timestamp: new Date().toISOString(),
      environment: 'test',
      testUrl: 'https://qafromla.herokuapp.com/',
    };
  },

  // Optional async data generation function
  data: async () => {
    console.log('Generating test data...');

    // Example of AI-powered data generation
    const userData = await generateData(
      {
        name: 'string',
        email: 'string',
        age: 'number',
      },
      'Generate realistic user data for testing'
    );

    return {
      user: userData,
      testId: `test-${Date.now()}`,
      iterations: 3,
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

export default sampleTest;
