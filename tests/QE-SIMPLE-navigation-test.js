// QE-SIMPLE: Simple Navigation Test
// Description: Basic navigation test to verify framework functionality
// Priority: High
// Tags: navigation, simple, smoke

export const QESIMPLE = {
  id: "QE-SIMPLE",
  name: "Simple Navigation Test", 
  description: "Basic navigation test to verify framework functionality",
  priority: "High",
  tags: ["navigation", "simple", "smoke"],
  site: "https://httpbin.org/",
  testData: {
    uid: "test_user_simple"
  },
  task: `Navigate to https://httpbin.org/. Wait 2 seconds for page load. Get page content to verify site is accessible. Verify simple navigation test completed successfully. STOP - test completed.`
};
