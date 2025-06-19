// QE-002: Registration Flow Test
// Description: Test user registration with new account
// Priority: High
// Tags: authentication, registration, user-management

export const QE002 = {
  id: "QE-002",
  name: "Registration Flow Test",
  description: "Test user registration with new account",
  priority: "High", 
  tags: ["authentication", "registration", "user-management"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
    uid: "test_user_002",
    firstName: "Test",
    lastName: "User",
    email: "papapin888+test002@gmail.com",
    password: "TestPass123!"
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click on "Sign Up" button. Wait 2 seconds for registration form. Fill first name field. Fill last name field. Fill email field. Fill password field. Click "Sign Up" button to submit. Wait 3 seconds for confirmation. Verify registration success. STOP - test completed.`
};
