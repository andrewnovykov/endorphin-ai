
export const LOGIN_TEST = {
  id: 'LOGIN-001',
  name: 'User Login Test',
  description: 'Test user login functionality',
  priority: 'High',
  tags: ['authentication', 'smoke'],
  site: 'https://example.com/login',
  testData: {
    username: 'testuser@example.com',
    password: 'testpass123'
  },
  task: 'Navigate to login page, enter credentials, click login button, verify successful login'
};
