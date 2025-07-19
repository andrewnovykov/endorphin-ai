import type { TestCase } from '../../../framework/types/index.js';

export const VALID_007: TestCase = {
  id: 'VALID-007',
  name: 'Validation Test 007',
  description: 'Validation test number 007',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
