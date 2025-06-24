import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { TestRecorder } from '../../framework/core/test-recorder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('TestRecorder', () => {
  let mockFramework;
  let testData;
  let testRecorder;
  let tempTestDir;

  beforeAll(async () => {
    // Create temporary test directory
    tempTestDir = path.join(__dirname, 'temp-test-recorder');
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
    // Mock framework with page screenshot capability
    mockFramework = {
      page: {
        screenshot: vi.fn().mockResolvedValue(undefined),
      },
      cleanup: vi.fn().mockResolvedValue(undefined),
    };

    // Test data
    testData = {
      id: 'QE-TEST-001',
      name: 'Test Recording Session',
      description: 'Testing the test recorder functionality',
      priority: 'High',
      tags: ['testing', 'recorder'],
      site: 'https://example.com',
      testData: {
        email: 'test@example.com',
        password: 'testpass123',
      },
    };

    testRecorder = new TestRecorder(mockFramework, testData);
  });

  afterEach(async () => {
    // Clean up any created files
    try {
      if (testRecorder.recordingPath) {
        await fs.rm(testRecorder.recordingPath, { recursive: true, force: true });
      }
      await fs.rm('test-recorder', { recursive: true, force: true });
      await fs.rm('tests', { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    test('should initialize with framework and test data', () => {
      expect(testRecorder.framework).toBe(mockFramework);
      expect(testRecorder.testData).toBe(testData);
      expect(testRecorder.steps).toEqual([]);
      expect(testRecorder.stepCounter).toBe(0);
      expect(testRecorder.recordingId).toBeNull();
      expect(testRecorder.recordingPath).toBeNull();
      expect(testRecorder.stepsPath).toBeNull();
      expect(testRecorder.isRecording).toBe(false);
      expect(testRecorder.startTime).toBeNull();
    });
  });

  describe('sanitizeFileName', () => {
    test('should sanitize file names correctly', () => {
      const recorder = new TestRecorder(mockFramework, {});

      expect(recorder.sanitizeFileName('Click Login Button!')).toBe('click-login-button');
      expect(recorder.sanitizeFileName('Fill form with @special#chars$')).toBe(
        'fill-form-with-specialchars'
      );
      expect(
        recorder.sanitizeFileName('Very Long Description That Should Be Truncated To 30 Characters')
      ).toBe('very-long-description-that-sho');
      expect(recorder.sanitizeFileName('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
    });
  });

  describe('startRecording', () => {
    test('should start recording session and create directories', async () => {
      const recordingId = await testRecorder.startRecording();

      expect(recordingId).toMatch(/QE-TEST-001-\d+/);
      expect(testRecorder.recordingId).toBe(recordingId);
      expect(testRecorder.isRecording).toBe(true);
      expect(testRecorder.stepCounter).toBe(0);
      expect(testRecorder.steps).toEqual([]);
      expect(testRecorder.startTime).toBeInstanceOf(Date);

      // Check directories were created
      expect(testRecorder.recordingPath).toBe(
        path.join(process.cwd(), 'test-recorder', recordingId)
      );
      expect(testRecorder.stepsPath).toBe(path.join(testRecorder.recordingPath, 'steps'));

      // Verify directories exist
      const recordingDirExists = await fs
        .access(testRecorder.recordingPath)
        .then(() => true)
        .catch(() => false);
      const stepsDirExists = await fs
        .access(testRecorder.stepsPath)
        .then(() => true)
        .catch(() => false);

      expect(recordingDirExists).toBe(true);
      expect(stepsDirExists).toBe(true);
    });

    test('should use default recording ID when test ID is missing', async () => {
      const recorderWithoutId = new TestRecorder(mockFramework, { name: 'Test' });
      const recordingId = await recorderWithoutId.startRecording();

      expect(recordingId).toMatch(/REC-\d+/);
    });
  });

  describe('recordStep', () => {
    beforeEach(async () => {
      await testRecorder.startRecording();
    });

    test('should record a step with screenshots and metadata', async () => {
      const description = 'Click login button';
      const type = 'click';
      const data = { selector: '#login-btn' };
      const result = 'Button clicked successfully';

      const stepInfo = await testRecorder.recordStep(description, type, data, result);

      expect(stepInfo).toMatchObject({
        stepNumber: 1,
        description,
        type,
        data,
        result,
        beforeScreenshot: 'before.png',
        afterScreenshot: 'after.png',
      });

      expect(stepInfo.timestamp).toBeDefined();
      expect(testRecorder.stepCounter).toBe(1);
      expect(testRecorder.steps).toHaveLength(1);

      // Verify screenshots were taken
      expect(mockFramework.page.screenshot).toHaveBeenCalledTimes(2);

      // Verify step folder was created
      const stepFolder = path.join(testRecorder.stepsPath, '001-click-login-button');
      const stepFolderExists = await fs
        .access(stepFolder)
        .then(() => true)
        .catch(() => false);
      expect(stepFolderExists).toBe(true);

      // Verify step-info.json was created
      const stepInfoPath = path.join(stepFolder, 'step-info.json');
      const stepInfoExists = await fs
        .access(stepInfoPath)
        .then(() => true)
        .catch(() => false);
      expect(stepInfoExists).toBe(true);

      // Verify step info content
      const stepInfoContent = await fs.readFile(stepInfoPath, 'utf8');
      const parsedStepInfo = JSON.parse(stepInfoContent);
      expect(parsedStepInfo).toMatchObject({
        stepNumber: 1,
        description,
        type,
        data,
        result,
      });
    });

    test('should not record when not in recording state', async () => {
      testRecorder.isRecording = false;

      const stepInfo = await testRecorder.recordStep('test', 'test', {}, 'test');

      expect(stepInfo).toBeUndefined();
      expect(testRecorder.stepCounter).toBe(0);
      expect(mockFramework.page.screenshot).not.toHaveBeenCalled();
    });

    test('should increment step counter for multiple steps', async () => {
      await testRecorder.recordStep('Step 1', 'action', {}, 'Success');
      await testRecorder.recordStep('Step 2', 'action', {}, 'Success');
      await testRecorder.recordStep('Step 3', 'action', {}, 'Success');

      expect(testRecorder.stepCounter).toBe(3);
      expect(testRecorder.steps).toHaveLength(3);

      // Check step folder names
      const steps = testRecorder.steps;
      expect(steps[0].stepFolder).toBe('001-step-1');
      expect(steps[1].stepFolder).toBe('002-step-2');
      expect(steps[2].stepFolder).toBe('003-step-3');
    });
  });

  describe('generateTestFile', () => {
    beforeEach(async () => {
      await testRecorder.startRecording();
      await testRecorder.recordStep(
        'Navigate to site',
        'navigate',
        { url: 'https://example.com' },
        'Success'
      );
      await testRecorder.recordStep('Click login', 'click', { selector: '#login' }, 'Success');
    });

    test('should generate test file with correct format', async () => {
      const testFilePath = await testRecorder.generateTestFile();

      expect(testFilePath).toBe(path.join(process.cwd(), 'tests', 'qe-test-001-recorded-test.js'));

      // Verify tests directory was created
      const testsDir = path.join(process.cwd(), 'tests');
      const testsDirExists = await fs
        .access(testsDir)
        .then(() => true)
        .catch(() => false);
      expect(testsDirExists).toBe(true);

      // Verify test file exists
      const testFileExists = await fs
        .access(testFilePath)
        .then(() => true)
        .catch(() => false);
      expect(testFileExists).toBe(true);

      // Verify test file content
      const testContent = await fs.readFile(testFilePath, 'utf8');

      expect(testContent).toContain('export const QE_TEST_001 =');
      expect(testContent).toContain('"id": "QE-TEST-001"');
      expect(testContent).toContain('"name": "Test Recording Session"');
      expect(testContent).toContain('"testing",');
      expect(testContent).toContain('"recorder",');
      expect(testContent).toContain('"recorded"');
      expect(testContent).toContain('Navigate to site Click login');
      expect(testContent).toContain('STOP - test completed');
    });

    test('should handle test data without existing tags', async () => {
      const recorderNoTags = new TestRecorder(mockFramework, {
        ...testData,
        tags: undefined,
      });

      await recorderNoTags.startRecording();
      await recorderNoTags.recordStep('Test step', 'action', {}, 'Success');

      const testFilePath = await recorderNoTags.generateTestFile();
      const testContent = await fs.readFile(testFilePath, 'utf8');

      expect(testContent).toContain('"recorded"');
    });
  });

  describe('stopRecording', () => {
    beforeEach(async () => {
      await testRecorder.startRecording();
      await testRecorder.recordStep('Test step 1', 'action', { test: 'data' }, 'Success');
      await testRecorder.recordStep('Test step 2', 'action', { test: 'data2' }, 'Success');
    });

    test('should stop recording and generate all artifacts', async () => {
      const result = await testRecorder.stopRecording();

      expect(testRecorder.isRecording).toBe(false);
      expect(result).toMatchObject({
        recordingId: testRecorder.recordingId,
        recordingPath: testRecorder.recordingPath,
        steps: 2,
        testData,
      });

      // Verify session file was created
      const sessionPath = path.join(testRecorder.recordingPath, 'test-session.json');
      const sessionExists = await fs
        .access(sessionPath)
        .then(() => true)
        .catch(() => false);
      expect(sessionExists).toBe(true);

      // Verify session content
      const sessionContent = await fs.readFile(sessionPath, 'utf8');
      const sessionData = JSON.parse(sessionContent);
      expect(sessionData).toMatchObject({
        recordingId: testRecorder.recordingId,
        testData: expect.objectContaining({
          id: testData.id,
          name: testData.name,
          description: testData.description,
          priority: testData.priority,
          site: testData.site,
        }),
        totalSteps: 2,
      });
      expect(sessionData.steps).toHaveLength(2);

      // Verify summary file was created
      const summaryPath = path.join(testRecorder.recordingPath, 'summary.json');
      const summaryExists = await fs
        .access(summaryPath)
        .then(() => true)
        .catch(() => false);
      expect(summaryExists).toBe(true);

      // Verify test file was generated
      const testFilePath = path.join(process.cwd(), 'tests', 'qe-test-001-recorded-test.js');
      const testFileExists = await fs
        .access(testFilePath)
        .then(() => true)
        .catch(() => false);
      expect(testFileExists).toBe(true);
    });

    test('should not stop recording if not currently recording', async () => {
      testRecorder.isRecording = false;

      const result = await testRecorder.stopRecording();

      expect(result).toBeUndefined();
    });
  });

  describe('showBrowserFeedback', () => {
    beforeEach(async () => {
      await testRecorder.startRecording();
      mockFramework.page.evaluate = vi.fn().mockResolvedValue(undefined);
    });

    test('should call page.evaluate with feedback data', async () => {
      await testRecorder.showBrowserFeedback(1, 'Click button', 'click');

      expect(mockFramework.page.evaluate).toHaveBeenCalledWith(expect.any(Function), {
        stepId: 1,
        description: 'Click button',
        type: 'click',
      });
    });

    test('should handle browser feedback errors gracefully', async () => {
      mockFramework.page.evaluate = vi.fn().mockRejectedValue(new Error('Page error'));

      // Should not throw error
      await expect(testRecorder.showBrowserFeedback(1, 'test', 'test')).resolves.toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    test('should complete full recording workflow', async () => {
      // Start recording
      const recordingId = await testRecorder.startRecording();
      expect(testRecorder.isRecording).toBe(true);

      // Record multiple steps
      await testRecorder.recordStep(
        'Navigate to login page',
        'navigate',
        { url: 'https://example.com/login' },
        'Navigation successful'
      );
      await testRecorder.recordStep(
        'Enter username',
        'type',
        { selector: '#username', value: 'testuser' },
        'Text entered'
      );
      await testRecorder.recordStep(
        'Enter password',
        'type',
        { selector: '#password', value: 'password' },
        'Text entered'
      );
      await testRecorder.recordStep(
        'Click login button',
        'click',
        { selector: '#login-btn' },
        'Button clicked'
      );

      expect(testRecorder.stepCounter).toBe(4);
      expect(testRecorder.steps).toHaveLength(4);

      // Stop recording
      const result = await testRecorder.stopRecording();
      expect(testRecorder.isRecording).toBe(false);
      expect(result.steps).toBe(4);

      // Verify all artifacts were created
      const recordingPath = testRecorder.recordingPath;

      // Check session files
      const sessionExists = await fs
        .access(path.join(recordingPath, 'test-session.json'))
        .then(() => true)
        .catch(() => false);
      const summaryExists = await fs
        .access(path.join(recordingPath, 'summary.json'))
        .then(() => true)
        .catch(() => false);

      expect(sessionExists).toBe(true);
      expect(summaryExists).toBe(true);

      // Check step folders
      for (let i = 1; i <= 4; i++) {
        const stepNumber = String(i).padStart(3, '0');
        const stepFolder = path.join(recordingPath, 'steps');
        const stepDirs = await fs.readdir(stepFolder);
        const stepDir = stepDirs.find((dir) => dir.startsWith(stepNumber));

        expect(stepDir).toBeDefined();

        // Check step files
        const stepInfoExists = await fs
          .access(path.join(stepFolder, stepDir, 'step-info.json'))
          .then(() => true)
          .catch(() => false);
        expect(stepInfoExists).toBe(true);
      }

      // Check generated test file
      const testFileExists = await fs
        .access(path.join(process.cwd(), 'tests', 'qe-test-001-recorded-test.js'))
        .then(() => true)
        .catch(() => false);
      expect(testFileExists).toBe(true);

      // Verify screenshots were taken (2 per step)
      expect(mockFramework.page.screenshot).toHaveBeenCalledTimes(8); // 4 steps × 2 screenshots
    });
  });
});
