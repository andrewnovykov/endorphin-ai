import type { TestCase } from '../../../framework/types/index.js';

export const VALID_003: TestCase = {
  id: 'VALID-003',
  name: 'Validation Test 003',
  description: 'Validation test number 003',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
