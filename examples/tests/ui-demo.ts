/**
 * UI Demo Test - Custom Tools Example
 * This test demonstrates how to use custom tools and test data generation in your tests
 */

import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';

const uiDemoTest: TestCase = {
  id: 'UI-DEMO-001',
  name: 'Custom Tools Demo',
  description: 'Demonstrates using custom tools and AI-generated test data',
  priority: 'medium',
  tags: ['demo', 'custom-tools', 'ui'],

  // Setup function - runs before test execution
  setup: async () => {
    console.log('Setting up UI demo test environment...');
    return {
      environment: 'demo',
      testUrl: 'https://qafromla.herokuapp.com/',
      initialized: new Date().toISOString(),
    };
  },

  // Async data generation - consistent with new pattern
  data: async () => {
    // Generate test data using AI with schema
    const testData = await generateData({
      email: 'email',
      password: 'password',
      username: 'username',
      firstName: 'firstname',
      lastName: 'lastname',
    });

    return {
      credentials: testData,
      testId: `demo-${Date.now()}`,
      sessionInfo: {
        browser: 'automated',
        timestamp: new Date().toISOString(),
      },
    };
  },

  task: `
    Navigate to https://qafromla.herokuapp.com/

    Click on login button 
    
    Use the generated test credentials for login:
    - Use the email from generated data
    - Use the password from generated data
    
    Click on sign in button 
    Verify the username from generated data is visible 
  `,
};

export default uiDemoTest;
