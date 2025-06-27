// Endorphin AI Framework Health Check
// Comprehensive test to validate all core framework capabilities
export const HEALTH_001 = {
    id: 'HEALTH-001',
    name: 'Framework Health Check',
    description: 'Comprehensive health check testing navigation, interaction, verification, and content analysis',
    priority: 'High',
    tags: ['health', 'smoke', 'framework-validation'],
    site: 'https://demo.playwright.dev/todomvc',
    testData: {
        todoItem: 'Test Endorphin AI framework capabilities',
        expectedTitle: 'TodoMVC',
    },
    task: `Perform a comprehensive framework health check by:
1. Navigate to the TodoMVC demo at https://demo.playwright.dev/todomvc
2. Verify the page title contains "TodoMVC" to ensure navigation worked
3. Take a screenshot to capture the initial state
4. Add a new todo item: "Test Endorphin AI framework capabilities"
5. Verify the todo item was added successfully to the list
6. Mark the todo item as completed by clicking its checkbox
7. Verify the item is now marked as completed (should have line-through style)
8. Take a final screenshot to document the completed test
9. Provide a summary of all actions performed and their success status

This test validates:
- Navigation capabilities
- Page content verification
- Form interaction (input field)
- Button clicking
- Visual state verification
- Screenshot capture
- Content analysis and reporting`,
};
//# sourceMappingURL=sample-test.js.map