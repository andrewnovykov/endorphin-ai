import type { TestCase } from '../../../framework/types/index.js';

export const FORM_005: TestCase = {
  id: 'FORM-005',
  name: 'Form Test 005',
  description: 'Form interaction test number 005',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User005", and verify the field contains "User005"'
};
