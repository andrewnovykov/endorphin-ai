// Example test file for Endorphin AI Framework
// Users can copy this structure to create their own tests

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
  task: `Navigate to https://qafromla.herokuapp.com/. 
  Click on "Log In" button. Wait 2 seconds for page load. 
  Fill email field with "papapin888@gmail.com". 
  Fill password field with "lalalend". 
  Click "Sign In" button. Wait 3 seconds for page load. 
  Verify login was successful by checking page content.`
};

export const QE002 = {
  id: "QE-002",
  name: "Homepage Navigation Test",
  description: "Test basic navigation and page loading",
  priority: "Medium",
  tags: ["navigation", "smoke"],
  site: "https://example.com/",
  task: `Navigate to https://example.com/. 
  Wait for page to load completely.
  Take a screenshot of the homepage.
  Verify page title contains "Example".
  Check that main navigation menu is visible.`
};

export const QE003 = {
  id: "QE-003", 
  name: "Search Functionality Test",
  description: "Test search feature with various queries",
  priority: "Medium",
  tags: ["search", "functionality"],
  site: "https://example.com/",
  testData: {
    searchQuery: "testing"
  },
  task: `Navigate to https://example.com/.
  Find and click on search input field.
  Type "testing" in the search field.
  Press Enter or click search button.
  Wait for search results to load.
  Verify search results are displayed.
  Take a screenshot of search results.`
};

export const QE004 = {
  id: "QE-004",
  name: "Form Validation Test", 
  description: "Test form validation with invalid inputs",
  priority: "High",
  tags: ["forms", "validation", "negative-testing"],
  site: "https://example.com/contact",
  task: `Navigate to https://example.com/contact.
  Try to submit form with empty required fields.
  Verify validation error messages appear.
  Fill only email field with invalid email format.
  Try to submit and verify email validation error.
  Fill all fields with valid data and submit.
  Verify success message or redirect occurs.`
};
