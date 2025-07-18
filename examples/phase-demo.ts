/**
 * Phase-Based Multi-User Workflow Demonstration
 * Shows how phases (.phase1, .phase2, .phase3) work with any user naming
 */

import type { TestCase } from 'endorphin-ai';

// Example 1: Simple user names with phases
export const PHASE_DEMO_SIMPLE: TestCase = {
  id: 'PHASE-DEMO-SIMPLE',
  name: 'Simple Phase Demo',
  description: 'Phase-based workflow with simple user names',
  priority: 'High',
  tags: ['demo', 'phases'],
  users: ['admin', 'user'], // Just 2 browser sessions
  tasks: () => ({
    'admin.phase1': 'STEP 1: Navigate to google.com as admin',
    'user.phase1': 'STEP 1: Navigate to tesla.com as user',
    'admin.phase2': 'STEP 2: Search for "admin tools"',
    'user.phase2': 'STEP 2: Browse Model 3',
    'admin.phase3': 'STEP 3: Verify admin dashboard',
  }),
};

// Example 2: Complex user names with phases
export const PHASE_DEMO_COMPLEX: TestCase = {
  id: 'PHASE-DEMO-COMPLEX',
  name: 'Complex Phase Demo',
  description: 'Phase-based workflow with complex user names',
  priority: 'High',
  tags: ['demo', 'phases'],
  users: ['super-admin-v2', 'regular-user-123', 'qa-tester'], // 3 browser sessions
  tasks: () => ({
    'super-admin-v2.phase1': 'STEP 1: Login as super admin',
    'regular-user-123.phase1': 'STEP 1: Login as regular user',
    'qa-tester.phase1': 'STEP 1: Access QA environment',
    'super-admin-v2.phase2': 'STEP 2: Configure system settings',
    'regular-user-123.phase2': 'STEP 2: Test user functionality',
    'qa-tester.phase2': 'STEP 2: Run automated tests',
    'super-admin-v2.phase3': 'STEP 3: Review system logs',
    'regular-user-123.phase3': 'STEP 3: Submit feedback',
    'qa-tester.phase3': 'STEP 3: Generate test report',
  }),
};

// Example 3: Mixed phases (not all users in every phase)
export const PHASE_DEMO_MIXED: TestCase = {
  id: 'PHASE-DEMO-MIXED',
  name: 'Mixed Phase Demo',
  description: 'Some users participate in some phases only',
  priority: 'Medium',
  tags: ['demo', 'phases'],
  users: ['reviewer', 'approver'], // 2 browser sessions
  tasks: () => ({
    'reviewer.phase1': 'STEP 1: Review document draft',
    'reviewer.phase2': 'STEP 2: Add review comments',
    'approver.phase1': 'STEP 1: Receive notification',
    'approver.phase2': 'STEP 2: Review comments',
    'reviewer.phase3': 'STEP 3: Address feedback',
    'approver.phase3': 'STEP 3: Final approval',
    'approver.phase4': 'STEP 4: Publish document', // Only approver in phase4
  }),
};