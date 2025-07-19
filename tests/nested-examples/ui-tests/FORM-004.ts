import type { TestCase } from '../../../framework/types/index.js';

export const FORM_004: TestCase = {
  id: 'FORM-004',
  name: 'Form Test 004',
  description: 'Form interaction test number 004',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User004", and verify the field contains "User004"'
};
