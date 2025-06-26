/**
 * Jest Setup File for Endorphin AI Framework Tests
 */

export { }; // Ensure this file is treated as a module for global augmentation

// Extend NodeJS global type to include mockBrowser, mockFs, and originalConsole

declare global {
  // Minimal type for the mocked browser
  // You can expand these types as needed for your tests
  var mockBrowser: {
    newContext: jest.Mock;
    close: jest.Mock;
  };
  var mockFs: {
    existsSync: jest.Mock;
    readFileSync: jest.Mock;
    writeFileSync: jest.Mock;
    mkdirSync: jest.Mock;
  };
  var originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };
}

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock Playwright browser
global.mockBrowser = {
  newContext: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
      evaluate: jest.fn().mockResolvedValue({}),
      click: jest.fn().mockResolvedValue(true),
      fill: jest.fn().mockResolvedValue(true),
      waitForSelector: jest.fn().mockResolvedValue({}),
      locator: jest.fn().mockReturnValue({
        click: jest.fn().mockResolvedValue(true),
        fill: jest.fn().mockResolvedValue(true),
        textContent: jest.fn().mockResolvedValue('test text'),
        isVisible: jest.fn().mockResolvedValue(true)
      })
    }),
    close: jest.fn().mockResolvedValue(true)
  }),
  close: jest.fn().mockResolvedValue(true)
};

// Mock file system operations
global.mockFs = {
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn().mockReturnValue(true)
};

// Mock console methods to reduce noise in tests
global.originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// Silence console in tests unless specifically testing console output
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

// Setup test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
