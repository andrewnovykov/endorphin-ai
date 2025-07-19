import type { TestCase } from '../../../framework/types/index.js';

export const VALID_009: TestCase = {
  id: 'VALID-009',
  name: 'Validation Test 009',
  description: 'Validation test number 009',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
