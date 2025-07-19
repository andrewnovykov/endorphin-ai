import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_010: TestCase = {
  id: 'SAMPLE-N-010',
  name: 'Sample Nested Test 010',
  description: 'Sample nested test number 010',
  priority: 'Medium',
  tags: ['sample', 'nested'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};
