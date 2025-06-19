// QE-003: Article Creation Test
// Description: Test creating a new article after login
// Priority: Medium
// Tags: content-management, article, crud

export const QE003 = {
  id: "QE-003",
  name: "Article Creation Test",
  description: "Test creating a new article after login",
  priority: "Medium",
  tags: ["content-management", "article", "crud"],
  site: "https://qafromla.herokuapp.com/",
  prerequisites: ["QE-001"], // Requires login test to pass first
  testData: {
    uid: "test_user_003",
    email: "papapin888@gmail.com",
    password: "lalalend",
    articleTitle: "Test Article AutoGen",
    articleContent: "This is a test article created by automation testing framework. Content includes various text to verify article creation functionality works properly.",
    tags: ["test", "automation"]
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Login button. Fill email field. Fill password field. Click Sign In button. Wait 2 seconds. Click New Article button. Wait 2 seconds for form. Fill article title field. Fill article content field. Add tags if available. Click Publish Article button. Wait 3 seconds. Verify article was created successfully.`
};
