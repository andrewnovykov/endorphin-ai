import type { TestCase } from '../../../framework/types/index.js';

export const UI_010: TestCase = {
  id: 'UI-010',
  name: 'UI Component Test 010',
  description: 'UI component test number 010',
  priority: 'Medium',
  tags: ['nested', 'ui', 'component'],
  task: 'Navigate to https://httpbin.org/forms/post and verify the submit button is visible on page'
};
