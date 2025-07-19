import type { TestCase } from '../../../../framework/types/index.js';

export const STRICT_005: TestCase = {
  id: 'STRICT-005',
  name: 'Strict Test 005',
  description: 'Strict validation test number 005',
  priority: 'Low',
  tags: ['sample', 'strict', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};
