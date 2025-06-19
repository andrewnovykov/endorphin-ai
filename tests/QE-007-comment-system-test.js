// QE-007: Comment System Test
// Description: Test article commenting functionality
// Priority: Low
// Tags: comments, social, crud

export const QE007 = {
  id: "QE-007",
  name: "Comment System Test",
  description: "Test article commenting functionality",
  priority: "Low",
  tags: ["comments", "social", "crud"],
  site: "https://qafromla.herokuapp.com/",
  prerequisites: ["QE-001"], // Requires login
  testData: {
    uid: "test_user_007",
    email: "papapin888@gmail.com",
    password: "lalalend",
    comment: "This is a test comment created by automation testing."
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Login button. Fill email field. Fill password field. Click Sign In button. Wait 2 seconds. Click on first article or blog post. Wait 2 seconds for article page. Scroll to comments section. Fill comment text area with test comment. Click Post Comment or Submit button. Wait 2 seconds. Verify comment was posted successfully.`
};
