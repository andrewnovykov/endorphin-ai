export default {
  browser: {
    headless: true,
    slowMo: 0,
    viewport: { width: 1280, height: 720 }
  },
  execution: {
    testsDirectory: './tests',
    timeout: 30000,
    stepDelay: 1000
  },
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0.1
  }
};
