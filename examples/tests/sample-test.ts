// Example Endorphin AI Test
// This is a sample test to help you get started

export const HEALTH_001 = {
  id: 'HEALTH-001',
  name: 'Framework Health Check',
  description: 'Verify basic framework functionality by navigating to example.com',
  priority: 'High',
  tags: ['health', 'smoke', 'example'],
  site: 'https://example.com',
  testData: {
    expectedTitle: 'Example Domain',
  },
  task: "Navigate to https://example.com, wait for the page to load, and verify the page title contains 'Example Domain'",
};