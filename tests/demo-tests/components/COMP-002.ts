import type { TestCase } from '../../../framework/types/index.js';

export const COMP_002: TestCase = {
  id: 'COMP-002',
  name: 'Component Input Fields Test',
  description: 'Verify input field components exist',
  priority: 'Medium',
  tags: ['demo', 'components', 'inputs'],
  task: 'Navigate to https://httpbin.org/forms/post and verify the input field "custname" is visible on page'
};