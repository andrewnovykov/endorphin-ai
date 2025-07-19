import type { TestCase } from '../../../framework/types/index.js';

export const VALID_004: TestCase = {
  id: 'VALID-004',
  name: 'Validation Test 004',
  description: 'Validation test number 004',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
