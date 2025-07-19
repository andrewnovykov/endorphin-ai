import type { TestCase } from '../../framework/types/index.js';

export const NESTED_010: TestCase = {
  id: 'NESTED-010',
  name: 'HTTPBin Moby Dick Quote Test',
  description: 'Navigate and verify famous quote text',
  priority: 'Low',
  tags: ['nested', 'navigation', 'text'],
  task: 'Navigate to https://httpbin.org/html and verify the text "Call me Ishmael" is visible on page'
};