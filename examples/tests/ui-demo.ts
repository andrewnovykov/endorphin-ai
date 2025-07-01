/**
 * UI Demo Test - Custom Tools Example
 * This test demonstrates how to use custom tools and test data generation in your tests
 */

import type { TestCase } from 'endorphin-ai';
import { generateData } from 'endorphin-ai';

// Generate test data using schema
const data = generateData({
  email: "email",
  password: "password", 
  username: "username",
  firstName: "firstname",
  lastName: "lastname"
});

const uiDemoTest: TestCase = {
  id: 'UI-DEMO-001',
  name: 'Custom Tools Demo',
  description: 'Demonstrates using custom tools and AI-generated test data',
  priority: 'medium',
  tags: ['demo', 'custom-tools', 'ui'],

  task: `
    Navigate to https://qafromla.herokuapp.com/

    Click on login button 
    
    Use the generated test credentials for login:
    - email: ${data.email}
    - password: ${data.password}
    
    Click on sign in button 
    Verify the username "${data.username}" is visible 
  `,
};

export default uiDemoTest;
