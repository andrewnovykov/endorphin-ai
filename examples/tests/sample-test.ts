/**
 * Sample Test - Getting Started with Endorphin AI
 * This test demonstrates basic navigation and interaction
 */

import type { TestCase } from 'endorphin-ai';

const sampleTest: TestCase = {
  id: 'SAMPLE-001',
  name: 'Sample Health Check Test',
  description: 'A simple test to verify the framework is working correctly',
  priority: 'high',
  tags: ['health-check', 'sample'],
  
  task: `
    Navigate to https://qafromla.herokuapp.com/
    Verify the page title contains "QA From LA"
    Take a screenshot to document the page
    Click on any navigation link to test interactivity
    Verify the page loads successfully
  `
};

export default sampleTest;