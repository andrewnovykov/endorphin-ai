// 🎯 **TEST CONFIGURATION**
// Define your test cases, URLs, and test data here

export const TEST_SITES = {
  QA_DEMO: "https://qafromla.herokuapp.com/",
  GOOGLE: "https://google.com",
  GITHUB: "https://github.com",
  WIKIPEDIA: "https://wikipedia.org",
  AMAZON: "https://amazon.com",
  ECOMMERCE_DEMO: "https://demo.opencart.com/",
  FORM_DEMO: "https://demoqa.com/automation-practice-form"
};

export const TEST_DATA = {
  USER: {
    email: "papapin888@gmail.com",
    password: "lalalend",
    firstName: "Test",
    lastName: "User",
    phone: "1234567890"
  },
  SEARCH_TERMS: [
    "playwright testing",
    "javascript automation",
    "browser testing"
  ],
  ARTICLE: {
    title: "Test Article Title",
    content: "This is a test article content for automation testing purposes.",
    tags: ["test", "automation", "browser"]
  }
};

export const TASK_TEMPLATES = {
  // 🔐 **AUTHENTICATION TASKS**
  LOGIN: (site, email, password) => `
    Navigate to ${site}, 
    find and click the login/sign in button, 
    fill email field with "${email}", 
    fill password field with "${password}", 
    submit the form, 
    verify successful login by checking for user dashboard or profile elements
  `,

  REGISTER: (site, userData) => `
    Navigate to ${site}, 
    find and click the registration/sign up button, 
    fill out the registration form with:
    - Email: ${userData.email}
    - Password: ${userData.password}
    - First Name: ${userData.firstName}
    - Last Name: ${userData.lastName}
    Submit the form and verify successful registration
  `,

  // 🛒 **E-COMMERCE TASKS**
  PRODUCT_SEARCH: (site, searchTerm) => `
    Navigate to ${site}, 
    find the search functionality, 
    search for "${searchTerm}", 
    verify search results appear, 
    click on the first product, 
    take screenshot of product details page
  `,

  ADD_TO_CART: (site, productName) => `
    Navigate to ${site}, 
    search for "${productName}", 
    click on first search result, 
    find and click "Add to Cart" button, 
    verify item was added to cart, 
    view cart and verify product is listed
  `,

  CHECKOUT_FLOW: (site) => `
    Navigate to ${site}, 
    add any product to cart, 
    proceed to checkout, 
    fill shipping information, 
    proceed through checkout steps, 
    stop before final payment submission
  `,

  // 📝 **CONTENT MANAGEMENT TASKS**
  CREATE_ARTICLE: (site, articleData) => `
    Navigate to ${site}, 
    login if required, 
    find "New Article" or "Create Post" button, 
    fill title with "${articleData.title}", 
    fill content with "${articleData.content}", 
    add tags if available, 
    publish or save the article, 
    verify article appears in feed or list
  `,

  EDIT_PROFILE: (site, userData) => `
    Navigate to ${site}, 
    login if required, 
    navigate to profile or account settings, 
    update profile information with provided data, 
    save changes, 
    verify updates are reflected in the profile
  `,

  // 🔍 **SEARCH AND NAVIGATION TASKS**
  SITE_EXPLORATION: (site) => `
    Navigate to ${site}, 
    take initial screenshot, 
    explore main navigation menu items, 
    visit each major section of the site, 
    take screenshots of key pages, 
    document the site structure and available features
  `,

  SEARCH_TEST: (site, searchTerms) => `
    Navigate to ${site}, 
    test search functionality with multiple terms: ${searchTerms.join(', ')}, 
    verify search results for each term, 
    test search filters if available, 
    document search behavior and results quality
  `,

  // 📱 **RESPONSIVE DESIGN TASKS**
  MOBILE_TEST: (site) => `
    Navigate to ${site}, 
    resize browser to mobile viewport (375x667), 
    verify mobile navigation works, 
    test key interactions on mobile, 
    check if content is properly responsive, 
    take screenshots of mobile layout
  `,

  // 🎨 **UI/UX TASKS**
  FORM_VALIDATION: (site) => `
    Navigate to ${site}, 
    find any form (login, registration, contact), 
    test form validation by:
    - Submitting empty form
    - Entering invalid email format
    - Testing password requirements
    - Verifying error messages appear correctly
  `,

  ACCESSIBILITY_TEST: (site) => `
    Navigate to ${site}, 
    test keyboard navigation (Tab key), 
    verify alt text on images, 
    check color contrast, 
    test with screen reader elements, 
    verify ARIA labels are present
  `,

  // 🔄 **WORKFLOW TASKS**
  USER_JOURNEY: (site, steps) => `
    Navigate to ${site} and complete this user journey:
    ${steps.map((step, i) => `${i + 1}. ${step}`).join('\n    ')}
    Take screenshots at each major step and verify the complete workflow works end-to-end.
  `,

  PERFORMANCE_TEST: (site) => `
    Navigate to ${site}, 
    measure page load time, 
    test navigation between pages, 
    verify images load properly, 
    check for any JavaScript errors in console, 
    document performance observations
  `
};

// 🎯 **PREDEFINED TEST SUITES**
export const TEST_SUITES = {
  BASIC_SMOKE: [
    {
      name: "Homepage Load Test",
      template: "SITE_EXPLORATION",
      params: [TEST_SITES.QA_DEMO]
    },
    {
      name: "Login Functionality",
      template: "LOGIN", 
      params: [TEST_SITES.QA_DEMO, TEST_DATA.USER.email, TEST_DATA.USER.password]
    }
  ],

  ECOMMERCE_FULL: [
    {
      name: "Product Search",
      template: "PRODUCT_SEARCH",
      params: [TEST_SITES.ECOMMERCE_DEMO, "laptop"]
    },
    {
      name: "Add to Cart",
      template: "ADD_TO_CART", 
      params: [TEST_SITES.ECOMMERCE_DEMO, "laptop"]
    },
    {
      name: "Checkout Process",
      template: "CHECKOUT_FLOW",
      params: [TEST_SITES.ECOMMERCE_DEMO]
    }
  ],

  CONTENT_MANAGEMENT: [
    {
      name: "User Login",
      template: "LOGIN",
      params: [TEST_SITES.QA_DEMO, TEST_DATA.USER.email, TEST_DATA.USER.password]
    },
    {
      name: "Create Article", 
      template: "CREATE_ARTICLE",
      params: [TEST_SITES.QA_DEMO, TEST_DATA.ARTICLE]
    },
    {
      name: "Edit Profile",
      template: "EDIT_PROFILE",
      params: [TEST_SITES.QA_DEMO, TEST_DATA.USER]
    }
  ],

  CROSS_BROWSER: [
    {
      name: "Google Search Test",
      template: "SEARCH_TEST",
      params: [TEST_SITES.GOOGLE, TEST_DATA.SEARCH_TERMS]
    },
    {
      name: "Wikipedia Navigation",
      template: "SITE_EXPLORATION", 
      params: [TEST_SITES.WIKIPEDIA]
    },
    {
      name: "GitHub Exploration",
      template: "SITE_EXPLORATION",
      params: [TEST_SITES.GITHUB]
    }
  ]
};

// Helper function to generate task from template
export function generateTask(templateName, params = []) {
  const template = TASK_TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }
  
  if (typeof template === 'function') {
    return template(...params);
  }
  return template;
}

// Helper function to generate test suite
export function generateTestSuite(suiteName) {
  const suite = TEST_SUITES[suiteName];
  if (!suite) {
    throw new Error(`Unknown test suite: ${suiteName}`);
  }
  
  return suite.map(test => ({
    name: test.name,
    description: generateTask(test.template, test.params)
  }));
}
