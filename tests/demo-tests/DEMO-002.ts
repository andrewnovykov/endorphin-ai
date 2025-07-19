import type { TestCase } from '../../framework/types/index.js';

export const DEMO_002: TestCase = {
  id: 'DEMO-002',
  name: 'Demo HTTPBin Navigation Test',
  description: 'Demo navigation to HTTPBin homepage',
  priority: 'High',
  tags: ['demo', 'navigation', 'httpbin'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};