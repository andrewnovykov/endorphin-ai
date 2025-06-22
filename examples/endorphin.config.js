// Endorphin AI Configuration File
// This file is optional - place in your project root directory

export default {
  // Browser Configuration
  browser: {
    headless: false,                    // Set to true for CI/CD
    viewport: { 
      width: 1280, 
      height: 720 
    },
    timeout: 30000,                     // Default timeout in milliseconds
    slowMo: 0,                         // Delay between actions (useful for debugging)
  },

  // AI Configuration
  ai: {
    model: "gpt-4o",                   // OpenAI model to use
    maxRetries: 3,                     // Retry failed actions
    temperature: 0.1,                  // AI creativity (0 = consistent, 1 = creative)
  },

  // Test Execution Settings
  execution: {
    screenshots: true,                 // Take screenshots during tests
    recordVideo: false,                // Record test execution (future feature)
    pauseOnError: false,              // Pause when test fails
    continueOnError: false,           // Continue running other tests if one fails
  },

  // Global Test Data
  testData: {
    baseUrl: "https://staging.example.com",
    adminEmail: "admin@example.com",
    defaultTimeout: 5000,
    retryCount: 2,
  },

  // Result Storage
  results: {
    directory: "./test-results",       // Where to save test results
    keepHistory: 10,                   // Number of test runs to keep
    format: ["json", "html"],          // Result formats
  },

  // Environment Settings
  environments: {
    development: {
      baseUrl: "http://localhost:3000",
      headless: false,
    },
    staging: {
      baseUrl: "https://staging.example.com", 
      headless: true,
    },
    production: {
      baseUrl: "https://example.com",
      headless: true,
      screenshots: false,
    }
  }
};
