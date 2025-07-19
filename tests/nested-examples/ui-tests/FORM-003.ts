import type { TestCase } from '../../../framework/types/index.js';

export const FORM_003: TestCase = {
  id: 'FORM-003',
  name: 'Form Test 003',
  description: 'Form interaction test number 003',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User003", and verify the field contains "User003"'
};
