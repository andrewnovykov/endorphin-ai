import type { TestCase } from '../../framework/types/index.js';

export const NESTED_003: TestCase = {
  id: 'NESTED-003',
  name: 'HTTPBin HTML Page Test',
  description: 'Navigate to HTTPBin HTML and verify content',
  priority: 'High',
  tags: ['nested', 'navigation', 'html'],
  task: 'Navigate to https://httpbin.org/html and verify the heading "Herman Melville - Moby-Dick" is visible on page'
};