import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_003: TestCase = {
  id: 'SAMPLE-N-003',
  name: 'Sample Nested Test 003',
  description: 'Sample nested test number 003',
  priority: 'Medium',
  tags: ['sample', 'nested'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};
