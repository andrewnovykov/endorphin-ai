import type { TestCase } from '../../../framework/types/index.js';

export const FORM_008: TestCase = {
  id: 'FORM-008',
  name: 'Form Test 008',
  description: 'Form interaction test number 008',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User008", and verify the field contains "User008"'
};
