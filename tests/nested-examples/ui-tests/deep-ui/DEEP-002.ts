import type { TestCase } from '../../../../framework/types/index.js';

export const DEEP_002: TestCase = {
  id: 'DEEP-002',
  name: 'Fill All Fields Test',
  description: 'Fill all form fields and verify submit button',
  priority: 'Medium',
  tags: ['nested', 'deep', 'forms', 'complete'],
  task: 'Navigate to https://httpbin.org/forms/post, fill "custname" with "John", "custemail" with "john@test.com", "custtel" with "555-1234", and verify the submit button is visible on page'
};