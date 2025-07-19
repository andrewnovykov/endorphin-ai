import type { TestCase } from '../../../framework/types/index.js';

export const FORM_009: TestCase = {
  id: 'FORM-009',
  name: 'Form Test 009',
  description: 'Form interaction test number 009',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User009", and verify the field contains "User009"'
};
