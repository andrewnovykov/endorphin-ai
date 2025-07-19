import type { TestCase } from '../../../../framework/types/index.js';

export const STRICT_004: TestCase = {
  id: 'STRICT-004',
  name: 'Strict Test 004',
  description: 'Strict validation test number 004',
  priority: 'Low',
  tags: ['sample', 'strict', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};
