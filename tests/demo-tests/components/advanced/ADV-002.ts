import type { TestCase } from '../../../../framework/types/index.js';

export const ADV_002: TestCase = {
  id: 'ADV-002',
  name: 'Advanced Navigation Chain Test',
  description: 'Advanced navigation through multiple pages',
  priority: 'Low',
  tags: ['demo', 'advanced', 'navigation', 'chain'],
  task: 'Navigate to https://httpbin.org/, click the "Status codes" link, and verify the heading "Status codes" is visible on page'
};