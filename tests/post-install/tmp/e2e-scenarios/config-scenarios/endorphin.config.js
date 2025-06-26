
export default {
  browser: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    timeout: 45000,
    slowMo: 100
  },
  ai: {
    openai: {
      modelName: 'gpt-4o',
      temperature: 0.0,
      maxTokens: 2000
    }
  },
  testsDirectory: 'tests',
  resultsDirectory: 'custom-results',
  environment: 'staging',
  parallel: 2,
  maxRetries: 2,
  baseUrl: 'https://staging.example.com'
};
