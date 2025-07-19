import type { TestCase } from '../../../framework/types/index.js';

export const VALID_005: TestCase = {
  id: 'VALID-005',
  name: 'Validation Test 005',
  description: 'Validation test number 005',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
