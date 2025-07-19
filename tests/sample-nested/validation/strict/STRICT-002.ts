import type { TestCase } from '../../../../framework/types/index.js';

export const STRICT_002: TestCase = {
  id: 'STRICT-002',
  name: 'Strict Test 002',
  description: 'Strict validation test number 002',
  priority: 'Low',
  tags: ['sample', 'strict', 'validation'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};
