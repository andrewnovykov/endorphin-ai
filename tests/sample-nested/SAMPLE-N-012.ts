import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_012: TestCase = {
  id: 'SAMPLE-N-012',
  name: 'Sample Nested Test 012',
  description: 'Sample nested test number 012',
  priority: 'Medium',
  tags: ['sample', 'nested'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};
