import type { TestCase } from '../../framework/types/index.js';

export const NESTED_005: TestCase = {
  id: 'NESTED-005',
  name: 'HTTPBin Main Page Test',
  description: 'Navigate to HTTPBin home and verify title',
  priority: 'Medium',
  tags: ['nested', 'navigation', 'home'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};