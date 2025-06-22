export const CONSOLE_TEST_1 = {
  id: "CONSOLE-001",
  name: "Console Reporter Demo Test 1",
  description: "First test to demonstrate colorful console output",
  priority: "High",
  tags: ["demo", "console"],
  site: "https://httpbin.org/",
  testData: {},
  task: "Navigate to httpbin.org and verify the page loads successfully. This should pass."
};

export const CONSOLE_TEST_2 = {
  id: "CONSOLE-002",
  name: "Console Reporter Demo Test 2",
  description: "Second test to demonstrate colorful console output",
  priority: "Medium",
  tags: ["demo", "console"],
  site: "https://httpbin.org/",
  testData: {},
  task: "Navigate to httpbin.org and look for some element that doesn't exist. This should fail."
};
