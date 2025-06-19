// QE-008: Responsive Design Test
// Description: Test site responsiveness across different viewport sizes
// Priority: Medium
// Tags: responsive, ui, mobile, desktop

export const QE008 = {
  id: "QE-008",
  name: "Responsive Design Test",
  description: "Test site responsiveness across different viewport sizes",
  priority: "Medium",
  tags: ["responsive", "ui", "mobile", "desktop"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
    uid: "test_user_008",
    viewports: [
      { width: 375, height: 667, name: "Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1920, height: 1080, name: "Desktop" }
    ]
  },
    task: `Navigate to https://qafromla.herokuapp.com/. Resize viewport to 375x667 for mobile testing. Wait 1 second for layout adjustment. Test mobile navigation menu. Resize viewport to 768x1024 for tablet testing. Wait 1 second. Verify tablet layout works properly. Resize viewport to 1920x1080 for desktop testing. Wait 1 second. Verify desktop layout is optimal. Test responsive design across all viewports.`
};
