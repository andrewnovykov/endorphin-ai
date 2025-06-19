// QE-006: Profile Management Test
// Description: Test user profile editing and settings
// Priority: Medium
// Tags: profile, user-management, crud

export const QE006 = {
  id: "QE-006",
  name: "Profile Management Test",
  description: "Test user profile editing and settings",
  priority: "Medium",
  tags: ["profile", "user-management", "crud"],
  site: "https://qafromla.herokuapp.com/",
  prerequisites: ["QE-001"], // Requires login
  testData: {
    uid: "test_user_006",
    email: "papapin888@gmail.com",
    password: "lalalend",
    profileUpdates: {
      bio: "Updated bio for testing purposes",
      location: "Test City",
      website: "https://example.com"
    }
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Login button. Fill email field. Fill password field. Click Sign In button. Wait 2 seconds. Click Profile or Settings link. Wait 2 seconds for profile page. Update bio field with new text. Update location field. Click Save Changes button. Wait 2 seconds. Verify profile updates were saved successfully.`
};
