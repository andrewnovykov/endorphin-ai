import type { TestCase } from '../../framework/types/index.js';

export const NESTED_008: TestCase = {
  id: 'NESTED-008',
  name: 'HTTPBin Request Inspection Link Test',
  description: 'Navigate and verify request inspection link',
  priority: 'Medium',
  tags: ['nested', 'navigation', 'links'],
  task: 'Navigate to https://httpbin.org/ and verify the link "Request inspection" is visible on page'
};