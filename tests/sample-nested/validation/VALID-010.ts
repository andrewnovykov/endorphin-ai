import type { TestCase } from '../../../framework/types/index.js';

export const VALID_010: TestCase = {
  id: 'VALID-010',
  name: 'Validation Test 010',
  description: 'Validation test number 010',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
