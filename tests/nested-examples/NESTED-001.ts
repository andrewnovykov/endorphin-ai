import type { TestCase } from '../../framework/types/index.js';

export const NESTED_001: TestCase = {
  id: 'NESTED-001',
  name: 'Example Domain Navigation Test',
  description: 'Navigate and verify heading visibility',
  priority: 'High',
  tags: ['nested', 'navigation', 'basic'],
  task: 'Navigate to https://example.com and verify the heading "Example Domain" is visible on page'
};