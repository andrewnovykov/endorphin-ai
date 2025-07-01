// Endorphin AI Framework Health Check
// Comprehensive test to validate all core framework capabilities

export const API_DEMO_001 = {
  id: 'API_DEMO_001',
  name: 'JSONPlaceholder API Demo',
  description: 'Demonstrates API testing with custom tools',
  priority: 'High',
  tags: ['health', 'smoke', 'framework-validation'],
  site: 'https://jsonplaceholder.typicode.com',
  testData: {
    todoItem: 'Test Endorphin AI framework capabilities',
    expectedTitle: 'TodoMVC',
  },
  task: `
  1: Get all posts from JSONPlaceholder using /posts endpoint
  2: Get the first user details using /users/1 endpoint
  3: Get comments for post 1 using /posts/1/comments endpoint
  4: Create a new post with title "Test Post from Endorphin AI" 
  and body "This post was created using Endorphin AI custom tools"`,
};
