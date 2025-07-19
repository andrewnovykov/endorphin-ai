import type { TestCase } from '../../../../framework/types/index.js';

export const ADV_001: TestCase = {
  id: 'ADV-001',
  name: 'Advanced Multi-Step Form Test',
  description: 'Advanced form interaction with multiple steps',
  priority: 'Low',
  tags: ['demo', 'advanced', 'forms', 'multi-step'],
  task: 'Navigate to https://httpbin.org/forms/post, fill "custname" with "Advanced User", and verify the field contains "Advanced User"'
};