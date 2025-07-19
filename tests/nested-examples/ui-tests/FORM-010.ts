import type { TestCase } from '../../../framework/types/index.js';

export const FORM_010: TestCase = {
  id: 'FORM-010',
  name: 'Form Test 010',
  description: 'Form interaction test number 010',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User010", and verify the field contains "User010"'
};
