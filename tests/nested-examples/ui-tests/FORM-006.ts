import type { TestCase } from '../../../framework/types/index.js';

export const FORM_006: TestCase = {
  id: 'FORM-006',
  name: 'Form Test 006',
  description: 'Form interaction test number 006',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User006", and verify the field contains "User006"'
};
