import type { TestCase } from '../../../framework/types/index.js';

export const COMP_001: TestCase = {
  id: 'COMP-001',
  name: 'Component Form Elements Test',
  description: 'Verify form components are visible',
  priority: 'Medium',
  tags: ['demo', 'components', 'forms'],
  task: 'Navigate to https://httpbin.org/forms/post and verify the form element is visible on page'
};