import type { TestCase } from '../../framework/types/index.js';

export const NESTED_006: TestCase = {
  id: 'NESTED-006',
  name: 'HTTPBin Status Methods Link Test',
  description: 'Navigate and verify status methods link',
  priority: 'Medium',
  tags: ['nested', 'navigation', 'links'],
  task: 'Navigate to https://httpbin.org/ and verify the link "Status codes" is visible on page'
};