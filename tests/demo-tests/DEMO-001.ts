import type { TestCase } from '../../framework/types/index.js';

export const DEMO_001: TestCase = {
  id: 'DEMO-001',
  name: 'Demo Example Page Test',
  description: 'Basic demo navigation test',
  priority: 'High',
  tags: ['demo', 'navigation', 'basic'],
  task: 'Navigate to https://example.com and verify the heading "Example Domain" is visible on page'
};