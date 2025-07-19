import type { TestCase } from '../../../framework/types/index.js';

export const FORM_007: TestCase = {
  id: 'FORM-007',
  name: 'Form Test 007',
  description: 'Form interaction test number 007',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User007", and verify the field contains "User007"'
};
