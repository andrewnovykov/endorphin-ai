export default {
  browser: {
    headless: false,  // Keep browser visible during recording
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    slowMo: 500  // Slow down actions for better visibility
  },
  
  results: {
    directory: "./test-results",
    keepHistory: 10,
    format: ["json", "html"],
    screenshots: true,
    recordVideo: false
  },
  
  ai: {
    model: "gpt-4o",
    maxRetries: 3,
    temperature: 0.1
  },
  
  recorder: {
    outputDirectory: "./test-recorder",
    screenshotFormat: "png",
    stepDelay: 1000
  }
};
