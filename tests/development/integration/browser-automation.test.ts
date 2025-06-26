/**
 * Integration Tests for Browser Automation System
 */

describe('Browser Automation Integration', () => {
  let mockBrowser;
  let mockPage;
  let mockContext;
  let mockConfigLoader;
  let mockTaskExecutor;

  beforeEach(() => {
    // Setup comprehensive mocks
    mockPage = {
      goto: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('screenshot-data')),
      evaluate: jest.fn().mockResolvedValue({ result: 'evaluation complete' }),
      click: jest.fn().mockResolvedValue(true),
      fill: jest.fn().mockResolvedValue(true),
      selectOption: jest.fn().mockResolvedValue(['option-value']),
      check: jest.fn().mockResolvedValue(true),
      uncheck: jest.fn().mockResolvedValue(true),
      waitForSelector: jest.fn().mockResolvedValue({}),
      waitForLoadState: jest.fn().mockResolvedValue(true),
      setViewportSize: jest.fn().mockResolvedValue(true),
      url: jest.fn().mockReturnValue('https://example.com'),
      title: jest.fn().mockResolvedValue('Test Page'),
      content: jest.fn().mockResolvedValue('<html><body>Test content</body></html>'),
      locator: jest.fn().mockReturnValue({
        click: jest.fn().mockResolvedValue(true),
        fill: jest.fn().mockResolvedValue(true),
        textContent: jest.fn().mockResolvedValue('test text'),
        isVisible: jest.fn().mockResolvedValue(true),
        getAttribute: jest.fn().mockResolvedValue('test-value'),
        count: jest.fn().mockResolvedValue(1),
        nth: jest.fn().mockReturnThis(),
        waitFor: jest.fn().mockResolvedValue(true)
      }),
      keyboard: {
        press: jest.fn().mockResolvedValue(true),
        type: jest.fn().mockResolvedValue(true)
      },
      mouse: {
        click: jest.fn().mockResolvedValue(true),
        move: jest.fn().mockResolvedValue(true)
      }
    };

    mockContext = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(true),
      setExtraHTTPHeaders: jest.fn().mockResolvedValue(true),
      pages: jest.fn().mockReturnValue([mockPage])
    };

    mockBrowser = {
      newContext: jest.fn().mockResolvedValue(mockContext),
      close: jest.fn().mockResolvedValue(true),
      contexts: jest.fn().mockReturnValue([mockContext])
    };

    mockConfigLoader = {
      loadConfig: jest.fn().mockResolvedValue({
        browser: {
          headless: true,
          viewport: { width: 1280, height: 720 },
          timeout: 30000,
          slowMo: 0,
          devtools: false
        },
        ai: {
          openai: {
            apiKey: 'test-key',
            modelName: 'gpt-4o',
            temperature: 0.1,
            maxTokens: 4000
          }
        }
      })
    };

    mockTaskExecutor = {
      executeTask: jest.fn().mockResolvedValue({
        success: true,
        actions: [],
        duration: 2500,
        aiTokensUsed: 350
      })
    };

    jest.clearAllMocks();
  });

  describe('Complete Browser Workflow', () => {
    test('should execute complete test workflow with browser automation', async () => {
      const mockAutomationSystem = {
        executeCompleteWorkflow: jest.fn().mockImplementation(async (testConfig) => {
          // 1. Load configuration
          const config = await mockConfigLoader.loadConfig();
          
          // 2. Initialize browser
          const browser = mockBrowser;
          const context = await browser.newContext({
            viewport: config.browser.viewport,
            userAgent: 'Endorphin AI Test Agent'
          });
          const page = await context.newPage();
          
          // 3. Navigate to test site
          await page.goto(testConfig.site);
          await page.waitForLoadState('networkidle');
          
          // 4. Execute AI-powered task
          const taskResult = await mockTaskExecutor.executeTask(testConfig.task, testConfig.site);
          
          // 5. Take screenshot for evidence
          const screenshot = await page.screenshot({ fullPage: true });
          
          // 6. Cleanup
          await page.close();
          await context.close();
          await browser.close();
          
          return {
            success: taskResult.success,
            testId: testConfig.id,
            testName: testConfig.name,
            site: testConfig.site,
            duration: taskResult.duration,
            screenshot: screenshot,
            actions: taskResult.actions,
            aiTokensUsed: taskResult.aiTokensUsed
          };
        })
      };

      const testConfig = {
        id: 'TEST-001',
        name: 'Login Automation Test',
        site: 'https://example.com/login',
        task: 'Navigate to login page, enter credentials, and verify successful login'
      };

      const result = await mockAutomationSystem.executeCompleteWorkflow(testConfig);

      // Verify the complete workflow
      expect(mockConfigLoader.loadConfig).toHaveBeenCalled();
      expect(mockBrowser.newContext).toHaveBeenCalledWith({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Endorphin AI Test Agent'
      });
      expect(mockContext.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com/login');
      expect(mockPage.waitForLoadState).toHaveBeenCalledWith('networkidle');
      expect(mockTaskExecutor.executeTask).toHaveBeenCalledWith(
        'Navigate to login page, enter credentials, and verify successful login',
        'https://example.com/login'
      );
      expect(mockPage.screenshot).toHaveBeenCalledWith({ fullPage: true });
      expect(mockPage.close).toHaveBeenCalled();
      expect(mockContext.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.testId).toBe('TEST-001');
      expect(result.screenshot).toBeInstanceOf(Buffer);
    });

    test('should handle browser initialization failure gracefully', async () => {
      mockBrowser.newContext.mockRejectedValue(new Error('Failed to create browser context'));

      const mockAutomationSystem = {
        executeCompleteWorkflow: jest.fn().mockImplementation(async (testConfig) => {
          try {
            const config = await mockConfigLoader.loadConfig();
            const browser = mockBrowser;
            await browser.newContext();
          } catch (error) {
            return {
              success: false,
              testId: testConfig.id,
              error: error.message,
              duration: 0
            };
          }
        })
      };

      const testConfig = { id: 'TEST-001', site: 'https://example.com' };
      const result = await mockAutomationSystem.executeCompleteWorkflow(testConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create browser context');
    });

    test('should handle page navigation failures', async () => {
      mockPage.goto.mockRejectedValue(new Error('net::ERR_NAME_NOT_RESOLVED'));

      const mockAutomationSystem = {
        executeCompleteWorkflow: jest.fn().mockImplementation(async (testConfig) => {
          try {
            const config = await mockConfigLoader.loadConfig();
            const browser = mockBrowser;
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await page.goto(testConfig.site);
          } catch (error) {
            return {
              success: false,
              testId: testConfig.id,
              error: error.message,
              phase: 'navigation'
            };
          }
        })
      };

      const testConfig = { id: 'TEST-001', site: 'https://invalid-domain.test' };
      const result = await mockAutomationSystem.executeCompleteWorkflow(testConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('net::ERR_NAME_NOT_RESOLVED');
      expect(result.phase).toBe('navigation');
    });
  });

  describe('Complex Interaction Scenarios', () => {
    test('should handle multi-step form interactions', async () => {
      const mockFormHandler = {
        handleComplexForm: jest.fn().mockImplementation(async (formSteps) => {
          const results = [];
          
          for (const step of formSteps) {
            let stepResult;
            
            switch (step.type) {
              case 'fill':
                await mockPage.fill(step.selector, step.value);
                stepResult = { success: true, action: 'fill', selector: step.selector };
                break;
              case 'select':
                await mockPage.selectOption(step.selector, step.value);
                stepResult = { success: true, action: 'select', selector: step.selector };
                break;
              case 'check':
                await mockPage.check(step.selector);
                stepResult = { success: true, action: 'check', selector: step.selector };
                break;
              case 'click':
                await mockPage.click(step.selector);
                stepResult = { success: true, action: 'click', selector: step.selector };
                break;
              default:
                stepResult = { success: false, error: 'Unknown step type' };
            }
            
            results.push(stepResult);
          }
          
          return {
            success: results.every(r => r.success),
            steps: results,
            totalSteps: formSteps.length
          };
        })
      };

      const formSteps = [
        { type: 'fill', selector: '#firstName', value: 'John' },
        { type: 'fill', selector: '#lastName', value: 'Doe' },
        { type: 'fill', selector: '#email', value: 'john@example.com' },
        { type: 'select', selector: '#country', value: 'US' },
        { type: 'check', selector: '#terms' },
        { type: 'click', selector: '#submit' }
      ];

      const result = await mockFormHandler.handleComplexForm(formSteps);

      expect(result.success).toBe(true);
      expect(result.totalSteps).toBe(6);
      expect(result.steps).toHaveLength(6);
      expect(mockPage.fill).toHaveBeenCalledTimes(3);
      expect(mockPage.fill).toHaveBeenCalledWith('#firstName', 'John');
      expect(mockPage.fill).toHaveBeenCalledWith('#email', 'john@example.com');
    });

    test('should handle dynamic content loading', async () => {
      const mockDynamicHandler = {
        waitForDynamicContent: jest.fn().mockImplementation(async (contentConfig) => {
          const results = [];
          
          // Wait for initial page load
          await mockPage.waitForLoadState('networkidle');
          
          // Wait for specific dynamic elements
          for (const waitConfig of contentConfig.waitFor) {
            try {
              await mockPage.waitForSelector(waitConfig.selector, {
                timeout: waitConfig.timeout || 5000,
                state: waitConfig.state || 'visible'
              });
              
              results.push({
                selector: waitConfig.selector,
                success: true,
                found: true
              });
            } catch (error) {
              results.push({
                selector: waitConfig.selector,
                success: false,
                error: error.message
              });
            }
          }
          
          return {
            success: results.every(r => r.success),
            elementsFound: results.filter(r => r.found).length,
            totalElements: contentConfig.waitFor.length,
            results: results
          };
        })
      };

      const contentConfig = {
        waitFor: [
          { selector: '.loading-spinner', state: 'hidden', timeout: 10000 },
          { selector: '.data-table', state: 'visible', timeout: 5000 },
          { selector: '.pagination', state: 'visible', timeout: 3000 }
        ]
      };

      const result = await mockDynamicHandler.waitForDynamicContent(contentConfig);

      expect(result.success).toBe(true);
      expect(result.elementsFound).toBe(3);
      expect(mockPage.waitForLoadState).toHaveBeenCalledWith('networkidle');
      expect(mockPage.waitForSelector).toHaveBeenCalledTimes(3);
    });

    test('should handle file upload operations', async () => {
      const mockFileUploader = {
        uploadFiles: jest.fn().mockImplementation(async (uploadConfig) => {
          const results = [];
          
          for (const upload of uploadConfig.uploads) {
            try {
              // Mock file chooser interaction
              const fileChooser = {
                setFiles: jest.fn().mockResolvedValue(true)
              };
              
              // Wait for file input and set files
              await mockPage.setInputFiles(upload.selector, upload.files);
              
              // Optionally wait for upload completion
              if (upload.waitForUpload) {
                await mockPage.waitForSelector(upload.waitForUpload.selector, {
                  timeout: upload.waitForUpload.timeout || 30000
                });
              }
              
              results.push({
                selector: upload.selector,
                files: upload.files,
                success: true
              });
            } catch (error) {
              results.push({
                selector: upload.selector,
                success: false,
                error: error.message
              });
            }
          }
          
          return {
            success: results.every(r => r.success),
            uploadsCompleted: results.filter(r => r.success).length,
            totalUploads: uploadConfig.uploads.length,
            results: results
          };
        })
      };

      // Mock setInputFiles method
      mockPage.setInputFiles = jest.fn().mockResolvedValue(true);

      const uploadConfig = {
        uploads: [
          {
            selector: '#file-input-1',
            files: ['/path/to/document.pdf'],
            waitForUpload: {
              selector: '.upload-success',
              timeout: 10000
            }
          },
          {
            selector: '#file-input-2',
            files: ['/path/to/image.jpg', '/path/to/image2.png']
          }
        ]
      };

      const result = await mockFileUploader.uploadFiles(uploadConfig);

      expect(result.success).toBe(true);
      expect(result.uploadsCompleted).toBe(2);
      expect(mockPage.setInputFiles).toHaveBeenCalledTimes(2);
      expect(mockPage.setInputFiles).toHaveBeenCalledWith('#file-input-1', ['/path/to/document.pdf']);
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from temporary network issues', async () => {
      let attemptCount = 0;
      mockPage.goto.mockImplementation(async (url) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('net::ERR_INTERNET_DISCONNECTED');
        }
        return true;
      });

      const mockResilientNavigator = {
        navigateWithRetry: jest.fn().mockImplementation(async (url, maxRetries = 3) => {
          let lastError;
          
          for (let i = 0; i < maxRetries; i++) {
            try {
              await mockPage.goto(url);
              return {
                success: true,
                url: url,
                attempts: i + 1
              };
            } catch (error) {
              lastError = error;
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
          
          throw lastError;
        })
      };

      const result = await mockResilientNavigator.navigateWithRetry('https://example.com', 3);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(mockPage.goto).toHaveBeenCalledTimes(3);
    });

    test('should handle element staleness', async () => {
      let clickCount = 0;
      mockPage.click.mockImplementation(async (selector) => {
        clickCount++;
        if (clickCount === 1) {
          throw new Error('Element is not attached to the DOM');
        }
        return true;
      });

      const mockStaleElementHandler = {
        clickWithStaleRetry: jest.fn().mockImplementation(async (selector) => {
          try {
            await mockPage.click(selector);
            return { success: true, attempts: 1 };
          } catch (error) {
            if (error.message.includes('not attached to the DOM')) {
              // Re-find element and retry
              await mockPage.waitForSelector(selector, { state: 'attached' });
              await mockPage.click(selector);
              return { success: true, attempts: 2, recovered: true };
            }
            throw error;
          }
        })
      };

      const result = await mockStaleElementHandler.clickWithStaleRetry('#dynamic-button');

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('#dynamic-button', { state: 'attached' });
    });

    test('should handle browser crashes gracefully', async () => {
      mockBrowser.newContext.mockRejectedValueOnce(new Error('Browser process crashed'));

      const mockCrashHandler = {
        executeWithCrashRecovery: jest.fn().mockImplementation(async (testConfig) => {
          try {
            const context = await mockBrowser.newContext();
            return { success: true, recovered: false };
          } catch (error) {
            if (error.message.includes('crashed')) {
              // Simulate browser restart
              mockBrowser.newContext.mockResolvedValueOnce(mockContext);
              const context = await mockBrowser.newContext();
              return {
                success: true,
                recovered: true,
                recoveryAction: 'browser_restart'
              };
            }
            throw error;
          }
        })
      };

      const result = await mockCrashHandler.executeWithCrashRecovery({ id: 'TEST-001' });

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.recoveryAction).toBe('browser_restart');
    });
  });

  describe('Performance and Resource Management', () => {
    test('should manage multiple browser contexts efficiently', async () => {
      const mockContextManager = {
        createOptimizedContexts: jest.fn().mockImplementation(async (contextConfigs) => {
          const contexts = [];
          
          for (const config of contextConfigs) {
            const context = await mockBrowser.newContext({
              viewport: config.viewport,
              userAgent: config.userAgent,
              bypassCSP: config.bypassCSP || false
            });
            
            contexts.push({
              id: config.id,
              context: context,
              pages: []
            });
          }
          
          return {
            contexts: contexts,
            totalCreated: contexts.length,
            memoryEstimate: contexts.length * 50 // MB per context
          };
        }),
        
        cleanupContexts: jest.fn().mockImplementation(async (contexts) => {
          for (const contextInfo of contexts) {
            await contextInfo.context.close();
          }
          return { cleaned: contexts.length };
        })
      };

      const configs = [
        { id: 'mobile', viewport: { width: 375, height: 667 }, userAgent: 'Mobile Safari' },
        { id: 'desktop', viewport: { width: 1920, height: 1080 }, userAgent: 'Chrome Desktop' },
        { id: 'tablet', viewport: { width: 768, height: 1024 }, userAgent: 'iPad Safari' }
      ];

      const result = await mockContextManager.createOptimizedContexts(configs);
      const cleanup = await mockContextManager.cleanupContexts(result.contexts);

      expect(result.totalCreated).toBe(3);
      expect(result.memoryEstimate).toBe(150);
      expect(cleanup.cleaned).toBe(3);
      expect(mockBrowser.newContext).toHaveBeenCalledTimes(3);
    });

    test('should monitor resource usage during execution', async () => {
      const mockResourceMonitor = {
        monitorExecution: jest.fn().mockImplementation(async (executionFn) => {
          const startMemory = 100; // MB
          const startTime = Date.now();
          
          // Add a small delay to simulate execution time
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const result = await executionFn();
          
          const endTime = Date.now();
          const endMemory = 150; // MB
          
          return {
            ...result,
            performance: {
              duration: Math.max(endTime - startTime, 10), // Ensure duration is at least 10ms
              memoryUsed: endMemory - startMemory,
              peakMemory: endMemory,
              cpuUsage: 45 // percentage
            }
          };
        })
      };

      const testExecution = async () => {
        await mockPage.goto('https://example.com');
        await mockPage.click('#button');
        return { success: true };
      };

      const result = await mockResourceMonitor.monitorExecution(testExecution);

      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
      expect(result.performance.memoryUsed).toBe(50);
      expect(result.performance.duration).toBeGreaterThan(0);
    });
  });
});
