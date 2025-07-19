import type { TestCase } from '../../framework/types/index.js';

export const NESTED_004: TestCase = {
  id: 'NESTED-004',
  name: 'HTTPBin Link Verification',
  description: 'Navigate and verify link visibility',
  priority: 'High',
  tags: ['nested', 'navigation', 'links'],
  task: 'Navigate to https://httpbin.org/html and verify the link "herman melville" is visible on page'
};