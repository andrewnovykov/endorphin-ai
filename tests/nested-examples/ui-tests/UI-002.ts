import type { TestCase } from '../../../framework/types/index.js';

export const UI_002: TestCase = {
  id: 'UI-002',
  name: 'Submit Button Visibility Test',
  description: 'Navigate to form and verify submit button',
  priority: 'High',
  tags: ['nested', 'ui', 'buttons'],
  task: 'Navigate to https://httpbin.org/forms/post and verify the submit button is visible on page'
};