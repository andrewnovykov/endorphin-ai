import type { TestCase } from '../../../framework/types/index.js';

export const UI_005: TestCase = {
  id: 'UI-005',
  name: 'Customer Phone Input Test',
  description: 'Fill phone field and verify visibility',
  priority: 'Medium',
  tags: ['nested', 'ui', 'input'],
  task: 'Navigate to https://httpbin.org/forms/post, fill the "custtel" field with "123-456-7890", and verify the field contains "123-456-7890"'
};