// QE-004: Navigation Test
// Description: Test all main navigation links and pages
// Priority: Medium
// Tags: navigation, ui, smoke

export const QE004 = {
  id: "QE-004",
  name: "Navigation Test",
  description: "Test all main navigation links and pages",
  priority: "Medium",
  tags: ["navigation", "ui", "smoke"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
    uid: "test_user_004"
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Home navigation link. Wait 1 second. Click About navigation link. Wait 1 second. Click Services navigation link. Wait 1 second. Click Contact navigation link. Wait 1 second. Click Login navigation link. Wait 1 second. Verify all navigation links work properly.`
};
