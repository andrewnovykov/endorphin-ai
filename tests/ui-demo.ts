import type { TestCase } from '../framework/types/index.js';

export const UI_DEMO: TestCase = {
  id: 'UI-DEMO-001',
  name: 'Login UI Demo',
  description: 'Demonstrates UI automation with custom tools',
  priority: 'Medium',
  tags: ['ui', 'demo', 'login', 'custom-tools'],
  site: 'https://realworld.io',

  task: `
    Navigate to the login page and use login-ui-tool to login with email "demo@example.com" and password "demopassword123".
    After login, verify the user is successfully authenticated by checking for user profile elements.
  `,
};
