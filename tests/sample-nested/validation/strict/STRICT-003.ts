import type { TestCase } from '../../../../framework/types/index.js';

export const STRICT_003: TestCase = {
  id: 'STRICT-003',
  name: 'Strict Test 003',
  description: 'Strict validation test number 003',
  priority: 'Low',
  tags: ['sample', 'strict', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};
