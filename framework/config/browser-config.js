// framework/config/browser-config.js

export const BROWSER_CONFIG = {
  // Browser launch options
  launchOptions: {
    headless: false,
    args: ['--start-maximized']
  },
  
  // Browser context options
  contextOptions: {
    viewport: { width: 1920, height: 1080 }
  },
  
  // Default timeouts (in milliseconds)
  timeouts: {
    navigation: 60000,
    element: 10000,
    screenshot: 5000,
    testExecution: 5 * 60 * 1000 // 5 minutes
  },
  
  // Screenshot options
  screenshot: {
    fullPage: false,
    type: 'png'
  }
};

export default BROWSER_CONFIG;
