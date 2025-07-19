import type { TestCase } from '../../../framework/types/index.js';

export const FORM_001: TestCase = {
  id: 'FORM-001',
  name: 'Form Test 001',
  description: 'Form interaction test number 001',
  priority: 'Medium',
  tags: ['nested', 'forms', 'interaction'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "User001", and verify the field contains "User001"'
};
