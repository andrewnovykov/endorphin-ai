// QE-005: Search Functionality Test
// Description: Test search feature with various search terms
// Priority: Medium
// Tags: search, functionality, ui

export const QE005 = {
  id: "QE-005",
  name: "Search Functionality Test",
  description: "Test search feature with various search terms",
  priority: "Medium",
  tags: ["search", "functionality", "ui"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
    uid: "test_user_005",
    searchTerms: ["test", "article", "user", "javascript", "automation"]
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Locate search box or search icon. Fill search field with "test". Click search button or press Enter. Wait 2 seconds for results. Verify search results appear. Clear search field. Fill search field with "article". Click search button. Wait 2 seconds. Verify different search results. Test empty search. Verify search functionality works properly.`
};
