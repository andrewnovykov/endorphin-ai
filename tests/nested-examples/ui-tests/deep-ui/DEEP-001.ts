import type { TestCase } from '../../../../framework/types/index.js';

export const DEEP_001: TestCase = {
  id: 'DEEP-001',
  name: 'Form Submit Error Test',
  description: 'Submit form and verify error message',
  priority: 'High',
  tags: ['nested', 'deep', 'forms', 'errors'],
  task: 'Navigate to https://httpbin.org/forms/post, click the submit button, and verify the text "Method Not Allowed" is visible on page'
};