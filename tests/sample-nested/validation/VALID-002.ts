import type { TestCase } from '../../../framework/types/index.js';

export const VALID_002: TestCase = {
  id: 'VALID-002',
  name: 'Validation Test 002',
  description: 'Validation test number 002',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
