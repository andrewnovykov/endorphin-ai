export default {
  browser: {
    headless: false, // Make sure this is false to see browser
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
  },

  // Results configuration
  results: {
    directory: './test-results',
    keepHistory: 10,
    format: ['json', 'html'],
    screenshots: true,
    recordVideo: false,
  },

  ai: {
    model: 'gpt-4o',
    maxRetries: 3,
    temperature: 0.1,
  },
};

// 🎯 Configuration Tips:
// - Set headless: true for faster execution
// - Increase timeout for slow websites
// - Change viewport for mobile testing
// - Add your own custom settings here