/**
 * Sample Test - Getting Started with Endorphin AI
 * This test demonstrates basic navigation, interaction, setup, and data generation
 */

import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';

const sampleTest: TestCase = {
  id: 'SAMPLE-001',
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

  task: `
    Navigate to https://qafromla.herokuapp.com/
    Verify the page title contains "QA From LA"
    Take a screenshot to document the page
    Click on any navigation link to test interactivity
    Verify the page loads successfully
  `,
};

export default sampleTest;
