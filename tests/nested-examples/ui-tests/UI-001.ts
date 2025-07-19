import type { TestCase } from '../../../framework/types/index.js';

export const UI_001: TestCase = {
  id: 'UI-001',
  name: 'Form Page Load Test',
  description: 'Navigate to form page and verify form exists',
  priority: 'High',
  tags: ['nested', 'ui', 'forms'],
  task: 'Navigate to https://httpbin.org/forms/post and verify the form element is visible on page'
};