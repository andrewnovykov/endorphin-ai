import type { TestCase } from '../../framework/types/index.js';

export const NESTED_007: TestCase = {
  id: 'NESTED-007',
  name: 'HTTPBin HTTP Methods Link Test',
  description: 'Navigate and verify HTTP methods link',
  priority: 'Medium',
  tags: ['nested', 'navigation', 'links'],
  task: 'Navigate to https://httpbin.org/ and verify the link "HTTP Methods" is visible on page'
};