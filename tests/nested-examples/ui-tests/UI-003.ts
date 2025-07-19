import type { TestCase } from '../../../framework/types/index.js';

export const UI_003: TestCase = {
  id: 'UI-003',
  name: 'Customer Name Input Test',
  description: 'Fill customer name field and verify visibility',
  priority: 'Medium',
  tags: ['nested', 'ui', 'input'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custname" field with "John Doe", and verify the field contains "John Doe"'
};