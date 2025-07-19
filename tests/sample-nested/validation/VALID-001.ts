import type { TestCase } from '../../../framework/types/index.js';

export const VALID_001: TestCase = {
  id: 'VALID-001',
  name: 'Validation Element Check Test',
  description: 'Validate specific elements are visible',
  priority: 'Medium',
  tags: ['sample', 'validation', 'elements'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};