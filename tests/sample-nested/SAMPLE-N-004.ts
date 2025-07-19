import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_004: TestCase = {
  id: 'SAMPLE-N-004',
  name: 'Sample Nested Test 004',
  description: 'Sample nested test number 004',
  priority: 'Medium',
  tags: ['sample', 'nested'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};
