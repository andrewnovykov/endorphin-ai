// QE-010: Logout Functionality Test
// Description: Test user logout and session management
// Priority: High
// Tags: authentication, logout, session, security

export const QE010 = {
  id: "QE-010",
  name: "Logout Functionality Test",
  description: "Test user logout and session management",
  priority: "High",
  tags: ["authentication", "logout", "session", "security"],
  site: "https://qafromla.herokuapp.com/",
  prerequisites: ["QE-001"], // Requires login functionality
  testData: {
    uid: "test_user_010",
    email: "papapin888@gmail.com",
    password: "lalalend"
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Login button. Fill email field. Fill password field. Click Sign In button. Wait 2 seconds for login success. Locate logout button or link. Click logout button. Wait 2 seconds. Verify user is redirected to homepage. Verify user session is terminated. Test that protected pages require new login. Verify logout functionality works properly.`
};
