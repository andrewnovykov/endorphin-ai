// QE-001: Basic Login Test
// Description: Test the login functionality with valid credentials
// Priority: High
// Tags: authentication, login, smoke

export const QE001 = {
  id: "QE-001",
  name: "Basic Login Test", 
  description: "Test the login functionality with valid credentials",
  priority: "High",
  tags: ["authentication", "login", "smoke"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
 
    originalEmail: "papapin888@gmail.com",
    originalPassword: "lalalend"
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click on "Log In" button. Wait 2 seconds for page load. Fill email field with "papapin888@gmail.com". Fill password field with "lalalend". Click "Sign In" button. Wait 3 seconds for page load. Verify login was successful by checking page content. STOP - test completed.`
};
