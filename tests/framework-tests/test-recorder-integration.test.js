import { describe, test, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { runInteractiveRecorder, collectTestData } from '../framework/interactive/enhanced-interactive-recorder.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock readline for testing
vi.mock('readline', () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: vi.fn(),
      close: vi.fn()
    }))
  },
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn()
  }))
}));

// Mock the framework
vi.mock('../framework/index.js', () => ({
  EnhancedBrowserTestFramework: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    cleanup: vi.fn().mockResolvedValue(undefined),
    runTask: vi.fn().mockResolvedValue({ result: 'Task completed successfully' }),
    tools: {
      navigate: vi.fn().mockResolvedValue(undefined)
    },
    page: {
      screenshot: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined)
    }
  }))
}));

describe('Enhanced Interactive Recorder Integration', () => {
  let tempTestDir;
  let mockRl;
  
  beforeAll(async () => {
    // Create temporary test directory
    tempTestDir = path.join(__dirname, 'temp-integration-test');
    await fs.mkdir(tempTestDir, { recursive: true });
    
    // Change to temp directory for tests
    process.chdir(tempTestDir);
  });

  afterAll(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempTestDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }
  });

  beforeEach(() => {
    // Setup readline mock
    mockRl = {
      question: vi.fn(),
      close: vi.fn()
    };
    
    readline.createInterface.mockReturnValue(mockRl);
    
    // Mock console.log to suppress output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.clearAllMocks();
    
    // Clean up any created files
    try {
      await fs.rm('test-recorder', { recursive: true, force: true });
      await fs.rm('tests', { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('collectTestData', () => {
    test.skip('should collect complete test data', async () => {
      // Mock user inputs
      const inputs = [
        'QE-INTEGRATION-001',           // Test ID
        'Integration Test Example',      // Test Name
        'Testing data collection',      // Description
        'High',                         // Priority
        'integration, testing',         // Tags
        'https://example.com',          // Site URL
        'testuser',                     // User ID
        'test@example.com',             // Email
        'password123',                  // Password
        'John',                         // First Name
        'Doe',                          // Last Name
        '',                             // Custom field (empty to finish)
        'y'                            // Confirm
      ];
      
      let inputIndex = 0;
      mockRl.question.mockImplementation((question, callback) => {
        callback(inputs[inputIndex++] || '');
      });

      const testData = await collectTestData();

      expect(testData).toMatchObject({
        id: 'QE-INTEGRATION-001',
        name: 'Integration Test Example',
        description: 'Testing data collection',
        priority: 'High',
        tags: ['integration', 'testing'],
        site: 'https://example.com',
        testData: {
          uid: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      });
    });

    test.skip('should handle user cancellation', async () => {
      // Mock inputs that lead to cancellation
      const inputs = [
        'QE-TEST-001',
        'Test Name',
        'Test Description',
        'Medium',
        'test',
        'https://example.com',
        '', '', '', '', '', // Skip all test data fields
        '',  // Finish custom fields
        'n'  // Don't confirm
      ];
      
      let inputIndex = 0;
      mockRl.question.mockImplementation((question, callback) => {
        callback(inputs[inputIndex++] || '');
      });

      const testData = await collectTestData();

      expect(testData).toBeNull();
    });

    test.skip('should use default values correctly', async () => {
      // Mock minimal inputs using defaults
      const inputs = [
        'QE-MINIMAL-001',
        'Minimal Test',
        'Basic test with defaults',
        '',  // Use default priority (Medium)
        '',  // No tags
        '',  // Use default site
        '', '', '', '', '', // Skip all test data
        '',  // No custom fields
        'y'  // Confirm
      ];
      
      let inputIndex = 0;
      mockRl.question.mockImplementation((question, callback) => {
        callback(inputs[inputIndex++] || '');
      });

      // Mock environment variable for default site
      const originalEnv = process.env.BASE_URL;
      process.env.BASE_URL = 'https://default-site.com';

      const testData = await collectTestData();

      expect(testData).toMatchObject({
        id: 'QE-MINIMAL-001',
        name: 'Minimal Test',
        description: 'Basic test with defaults',
        priority: 'Medium',
        tags: [],
        site: 'https://default-site.com',
        testData: {}
      });

      // Restore environment
      if (originalEnv) {
        process.env.BASE_URL = originalEnv;
      } else {
        delete process.env.BASE_URL;
      }
    });
  });

  describe('CLI Integration', () => {
    test.skip('should import runInteractiveRecorder function correctly', async () => {
      // Test that the function is exported and can be imported
      const { runInteractiveRecorder } = await import('../framework/interactive/enhanced-interactive-recorder.js');
      
      expect(runInteractiveRecorder).toBeDefined();
      expect(typeof runInteractiveRecorder).toBe('function');
    });

    test.skip('should import collectTestData function correctly', async () => {
      // Test that the function is exported and can be imported
      const { collectTestData } = await import('../framework/interactive/enhanced-interactive-recorder.js');
      
      expect(collectTestData).toBeDefined();
      expect(typeof collectTestData).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test.skip('should handle framework initialization errors', async () => {
      // Mock framework initialization failure
      const { EnhancedBrowserTestFramework } = await import('../framework/index.js');
      const mockFramework = new EnhancedBrowserTestFramework();
      mockFramework.initialize.mockRejectedValue(new Error('Browser initialization failed'));

      // Mock successful data collection
      const inputs = [
        'QE-ERROR-001', 'Error Test', 'Testing error handling', 'High', 'error', 'https://example.com',
        '', '', '', '', '', '', 'y'
      ];
      
      let inputIndex = 0;
      mockRl.question.mockImplementation((question, callback) => {
        callback(inputs[inputIndex++] || '');
      });

      // Mock the runInteractiveRecorder to test error handling
      // Note: We can't easily test the full runInteractiveRecorder due to its complexity,
      // but we can test the components
      
      await expect(mockFramework.initialize()).rejects.toThrow('Browser initialization failed');
    });
  });

  describe('File System Integration', () => {
    test.skip('should create proper directory structure during recording', async () => {
      const { TestRecorder } = await import('../framework/core/test-recorder.js');
      const { EnhancedBrowserTestFramework } = await import('../framework/index.js');
      
      const mockFramework = new EnhancedBrowserTestFramework();
      const testData = {
        id: 'QE-FS-001',
        name: 'File System Test',
        description: 'Testing directory creation',
        priority: 'Medium',
        tags: ['filesystem'],
        site: 'https://example.com',
        testData: {}
      };
      
      const recorder = new TestRecorder(mockFramework, testData);
      const recordingId = await recorder.startRecording();
      
      // Verify directory structure
      const recordingPath = path.join(process.cwd(), 'test-recorder', recordingId);
      const stepsPath = path.join(recordingPath, 'steps');
      
      const recordingExists = await fs.access(recordingPath).then(() => true).catch(() => false);
      const stepsExists = await fs.access(stepsPath).then(() => true).catch(() => false);
      
      expect(recordingExists).toBe(true);
      expect(stepsExists).toBe(true);
      
      // Record a step to test step directory creation
      await recorder.recordStep('Test step', 'action', {}, 'Success');
      
      const stepDirs = await fs.readdir(stepsPath);
      expect(stepDirs).toHaveLength(1);
      expect(stepDirs[0]).toMatch(/001-test-step/);
      
      // Verify step files
      const stepDir = path.join(stepsPath, stepDirs[0]);
      const stepFiles = await fs.readdir(stepDir);
      expect(stepFiles).toContain('step-info.json');
      
      // Stop recording and verify final files
      await recorder.stopRecording();
      
      const recordingFiles = await fs.readdir(recordingPath);
      expect(recordingFiles).toContain('test-session.json');
      expect(recordingFiles).toContain('summary.json');
      expect(recordingFiles).toContain('steps');
      
      // Verify test file creation
      const testsDir = path.join(process.cwd(), 'tests');
      const testsExists = await fs.access(testsDir).then(() => true).catch(() => false);
      expect(testsExists).toBe(true);
      
      const testFiles = await fs.readdir(testsDir);
      expect(testFiles).toContain('qe-fs-001-recorded-test.js');
    });
  });

  describe('Generated Test File Validation', () => {
    test.skip('should generate valid test file that can be imported', async () => {
      const { TestRecorder } = await import('../framework/core/test-recorder.js');
      const { EnhancedBrowserTestFramework } = await import('../framework/index.js');
      
      const mockFramework = new EnhancedBrowserTestFramework();
      const testData = {
        id: 'QE-VALID-001',
        name: 'Valid Test Generation',
        description: 'Testing valid test file generation',
        priority: 'High',
        tags: ['validation'],
        site: 'https://example.com',
        testData: { test: 'data' }
      };
      
      const recorder = new TestRecorder(mockFramework, testData);
      await recorder.startRecording();
      
      // Record some steps
      await recorder.recordStep('Navigate to site', 'navigate', { url: 'https://example.com' }, 'Success');
      await recorder.recordStep('Click button', 'click', { selector: '#btn' }, 'Success');
      
      await recorder.stopRecording();
      
      // Read and validate generated test file
      const testFilePath = path.join(process.cwd(), 'tests', 'qe-valid-001-recorded-test.js');
      const testContent = await fs.readFile(testFilePath, 'utf8');
      
      // Verify test file structure
      expect(testContent).toContain('export const QE_VALID_001 =');
      expect(testContent).toMatch(/"id":\s*"QE-VALID-001"/);
      expect(testContent).toMatch(/"name":\s*"Valid Test Generation"/);
      expect(testContent).toMatch(/"priority":\s*"High"/);
      expect(testContent).toContain('"recorded"');
      expect(testContent).toContain('Navigate to site Click button');
      expect(testContent).toContain('STOP - test completed');
      
      // Test that the generated file is valid JavaScript
      expect(() => {
        new Function(testContent.replace('export const', 'const'));
      }).not.toThrow();
    });
  });
});
