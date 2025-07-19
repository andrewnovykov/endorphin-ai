import type { TestCase } from '../../framework/types/index.js';

export const SAMPLE_N_001: TestCase = {
  id: 'SAMPLE-N-001',
  name: 'Sample Nested Basic Test',
  description: 'Basic sample nested navigation test',
  priority: 'High',
  tags: ['sample', 'nested', 'basic'],
  task: 'Navigate to https://example.com and verify the heading "Example Domain" is visible on page'
};