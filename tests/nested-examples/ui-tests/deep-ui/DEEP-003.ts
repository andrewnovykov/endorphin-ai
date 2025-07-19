import type { TestCase } from '../../../../framework/types/index.js';

export const DEEP_003: TestCase = {
  id: 'DEEP-003',
  name: 'Link Navigation Deep Test',
  description: 'Navigate through multiple links and verify content',
  priority: 'Low',
  tags: ['nested', 'deep', 'navigation', 'links'],
  task: 'Navigate to https://httpbin.org/, click the "HTTP Methods" link, and verify the heading "HTTP Methods" is visible on page'
};