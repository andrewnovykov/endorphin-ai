import type { TestCase } from '../../../../framework/types/index.js';

export const STRICT_001: TestCase = {
  id: 'STRICT-001',
  name: 'Strict Validation Deep Test',
  description: 'Strict validation at maximum nesting depth',
  priority: 'Low',
  tags: ['sample', 'strict', 'validation', 'deep'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};