import type { TestCase } from '../../../framework/types/index.js';

export const UI_004: TestCase = {
  id: 'UI-004',
  name: 'Customer Email Input Test',
  description: 'Fill email field and verify visibility',
  priority: 'Medium',
  tags: ['nested', 'ui', 'input'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custemail" field with "test@example.com", and verify the field contains "test@example.com"'
};