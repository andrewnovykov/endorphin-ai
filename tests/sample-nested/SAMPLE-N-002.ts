import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_002: TestCase = {
  id: 'SAMPLE-N-002',
  name: 'Sample Nested Test 002',
  description: 'Sample nested test number 002',
  priority: 'Medium',
  tags: ['sample', 'nested'],
  task: 'Navigate to https://httpbin.org/ and verify the heading "httpbin.org" is visible on page'
};
