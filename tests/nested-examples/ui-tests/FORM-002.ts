import type { TestCase } from '../../../framework/types/index.js';

export const FORM_002: TestCase = {
  id: 'FORM-002',
  name: 'Form Test 002',
  description: 'Form interaction test number 002',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User002", and verify the field contains "User002"'
};
