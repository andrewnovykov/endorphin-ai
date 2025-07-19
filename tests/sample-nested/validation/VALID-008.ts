import type { TestCase } from '../../../framework/types/index.js';

export const VALID_008: TestCase = {
  id: 'VALID-008',
  name: 'Validation Test 008',
  description: 'Validation test number 008',
  priority: 'Medium',
  tags: ['sample', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};
