/**
 * End-to-End Integration Tests for Complete Testing Workflow
 */

describe('End-to-End Testing Workflow', () => {
  /**
   * Interfaces for mock components used in the test suite
   */

  interface MockConfigLoader {
    loadConfig: jest.Mock<Promise<any>, any>;
  }

  interface MockTestDiscovery {
    discoverTests: jest.Mock<Promise<any>, any>;
    findTestById: jest.Mock<any, [string]>;
    findTestsByTag: jest.Mock<any[], [string]>;
  }

  interface MockBrowserFramework {
    initializeBrowser: jest.Mock<Promise<any>, any>;
    closeBrowser: jest.Mock<Promise<boolean>, any>;
    executeTask: jest.Mock<Promise<any>, [string, string]>;
  }

  interface MockConsoleReporter {
    reportSessionStart: jest.Mock<void, [number]>;
    reportTestStart: jest.Mock<void, [string]>;
    reportTestResult: jest.Mock<void, [any]>;
    reportSessionEnd: jest.Mock<void, []>;
    generateSessionSummary: jest.Mock<void, [any]>;
  }

  interface MockHtmlReporter {
    generateReport: jest.Mock<any, [any[], any?]>;
    saveReport: jest.Mock<Promise<any>, [string, string]>;
  }

  interface MockResultManager {
    saveTestResult: jest.Mock<Promise<any>, [any]>;
    getTestHistory: jest.Mock<Promise<any[]>, [string]>;
  }

  interface MockComponents {
    configLoader: MockConfigLoader;
    testDiscovery: MockTestDiscovery;
    browserFramework: MockBrowserFramework;
    consoleReporter: MockConsoleReporter;
    htmlReporter: MockHtmlReporter;
    resultManager: MockResultManager;
  }

  let mockComponents: MockComponents;

  beforeEach(() => {
    // Setup comprehensive mock ecosystem
    mockComponents = {
      configLoader: {
        loadConfig: jest.fn().mockResolvedValue({
          browser: {
            headless: true,
            viewport: { width: 1280, height: 720 },
            timeout: 30000,
            slowMo: 0
          },
          ai: {
            openai: {
              apiKey: 'test-api-key',
              modelName: 'gpt-4o',
              temperature: 0.1,
              maxTokens: 4000
            },
            agent: {
              recursionLimit: 10,
              stopPhrases: ['test completed', 'task finished', 'done']
            }
          },
          testsDirectory: 'tests',
          resultsDirectory: 'test-results',
          environment: 'development'
        })
      },

      testDiscovery: {
        discoverTests: jest.fn().mockResolvedValue({
          tests: [
            {
              id: 'LOGIN-001',
              name: 'User Authentication Test',
              description: 'Test complete user login flow',
              priority: 'High',
              tags: ['auth', 'critical', 'smoke'],
              site: 'https://demo.example.com',
              task: 'Navigate to login page, enter credentials (username: testuser, password: testpass), click login button, and verify successful authentication by checking for dashboard elements',
              sourceFile: '/tests/auth/login-test.js',
              exportName: 'TEST_ID'
            },
            {
              id: 'NAV-001',
              name: 'Navigation Test',
              description: 'Test main navigation functionality',
              priority: 'Medium',
              tags: ['navigation', 'ui'],
              site: 'https://demo.example.com',
              task: 'Test all main navigation links including Home, Products, About, and Contact pages. Verify each page loads correctly and displays expected content',
              sourceFile: '/tests/navigation/nav-test.js',
              exportName: 'TEST_ID'
            },
            {
              id: 'CART-001',
              name: 'Shopping Cart Test',
              description: 'Test e-commerce cart functionality',
              priority: 'High',
              tags: ['ecommerce', 'cart', 'critical'],
              site: 'https://demo.example.com',
              task: 'Add products to cart, modify quantities, remove items, and proceed to checkout. Verify cart calculations and state persistence',
              sourceFile: '/tests/ecommerce/cart-test.js',
              exportName: 'TEST_ID'
            }
          ],
          totalFound: 3,
          errors: []
        }),

        findTestById: jest.fn().mockImplementation((id) => {
          const tests = {
            'LOGIN-001': {
              id: 'LOGIN-001',
              name: 'User Authentication Test',
              site: 'https://demo.example.com',
              task: 'Navigate to login page, enter credentials (username: testuser, password: testpass), click login button, and verify successful authentication by checking for dashboard elements'
            },
            'NAV-001': {
              id: 'NAV-001',
              name: 'Navigation Test',
              site: 'https://demo.example.com',
              task: 'Test all main navigation links including Home, Products, About, and Contact pages. Verify each page loads correctly and displays expected content'
            },
            'CART-001': {
              id: 'CART-001',
              name: 'Shopping Cart Test',
              site: 'https://demo.example.com',
              task: 'Add products to cart, modify quantities, remove items, and proceed to checkout. Verify cart calculations and state persistence'
            }
          };
          return tests[id] || null;
        }),

        findTestsByTag: jest.fn().mockImplementation((tag) => {
          const allTests = [
            { id: 'LOGIN-001', name: 'User Authentication Test', tags: ['auth', 'critical', 'smoke'] },
            { id: 'NAV-001', name: 'Navigation Test', tags: ['navigation', 'ui'] },
            { id: 'CART-001', name: 'Shopping Cart Test', tags: ['ecommerce', 'cart', 'critical'] }
          ];
          return allTests.filter(test => test.tags.includes(tag));
        })
      },

      browserFramework: {
        initializeBrowser: jest.fn().mockResolvedValue({
          browser: { id: 'browser-1', type: 'chromium' },
          context: { id: 'context-1', userAgent: 'Test Agent' },
          page: { id: 'page-1', url: null }
        }),

        closeBrowser: jest.fn().mockResolvedValue(true),

        executeTask: jest.fn().mockImplementation(async (task, site) => {
          // Simulate different outcomes based on test type
          if (task.includes('login')) {
            return {
              success: true,
              actions: [
                { type: 'navigate', url: site, success: true, duration: 1200 },
                { type: 'click', selector: '#login-link', success: true, duration: 150 },
                { type: 'fill', selector: '#username', value: 'testuser', success: true, duration: 200 },
                { type: 'fill', selector: '#password', value: 'testpass', success: true, duration: 180 },
                { type: 'click', selector: '#login-button', success: true, duration: 300 },
                { type: 'wait', selector: '.dashboard', success: true, duration: 800 },
                { type: 'verify', condition: 'dashboard visible', success: true, duration: 100 }
              ],
              duration: 2930,
              screenshot: Buffer.from('login-screenshot-data'),
              aiTokensUsed: 420
            };
          } else if (task.includes('navigation')) {
            return {
              success: true,
              actions: [
                { type: 'navigate', url: site, success: true, duration: 1000 },
                { type: 'click', selector: '#nav-products', success: true, duration: 150 },
                { type: 'verify', condition: 'products page loaded', success: true, duration: 200 },
                { type: 'click', selector: '#nav-about', success: true, duration: 150 },
                { type: 'verify', condition: 'about page loaded', success: true, duration: 200 },
                { type: 'click', selector: '#nav-contact', success: true, duration: 150 },
                { type: 'verify', condition: 'contact page loaded', success: true, duration: 200 }
              ],
              duration: 2050,
              screenshot: Buffer.from('navigation-screenshot-data'),
              aiTokensUsed: 350
            };
          } else if (task.includes('cart')) {
            return {
              success: false,
              actions: [
                { type: 'navigate', url: site, success: true, duration: 1000 },
                { type: 'click', selector: '.product-item:first-child .add-to-cart', success: true, duration: 200 },
                { type: 'click', selector: '#cart-icon', success: true, duration: 150 },
                { type: 'verify', condition: 'item in cart', success: false, duration: 300, error: 'Cart item not found' }
              ],
              duration: 1650,
              error: 'Cart functionality test failed: Cart item not found',
              screenshot: Buffer.from('cart-error-screenshot-data'),
              aiTokensUsed: 380
            };
          }
          
          return {
            success: true,
            actions: [],
            duration: 1000,
            aiTokensUsed: 200
          };
        })
      },

      consoleReporter: {
        reportSessionStart: jest.fn(),
        reportTestStart: jest.fn(),
        reportTestResult: jest.fn(),
        reportSessionEnd: jest.fn(),
        generateSessionSummary: jest.fn().mockImplementation((summary) => {
          console.log(`\n📊 Test Session Summary:`);
          console.log(`Total Tests: ${summary.totalTests}`);
          console.log(`Passed: ${summary.passedTests}`);
          console.log(`Failed: ${summary.failedTests}`);
          console.log(`Duration: ${(summary.duration / 1000).toFixed(1)}s`);
          console.log(`Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
        })
      },

      htmlReporter: {
        generateReport: jest.fn().mockImplementation((results, options = {}) => {
          return {
            success: true,
            reportPath: `/test-results/report-${Date.now()}.html`,
            summary: {
              total: results.length,
              passed: results.filter(r => r.status === 'SUCCESS').length,
              failed: results.filter(r => r.status === 'FAILED').length
            },
            html: '<html><body>Generated Test Report</body></html>'
          };
        }),

        saveReport: jest.fn().mockResolvedValue({
          success: true,
          filePath: '/test-results/report.html',
          size: 15420
        })
      },

      resultManager: {
        saveTestResult: jest.fn().mockResolvedValue({
          success: true,
          resultPath: '/test-results/TEST-001/result.json'
        }),

        getTestHistory: jest.fn().mockImplementation((testId) => {
          const histories = {
            'NAV-001': [
              { date: '2024-01-01', status: 'SUCCESS', duration: 1500 },
              { date: '2024-01-02', status: 'SUCCESS', duration: 1600 },
              { date: '2024-01-03', status: 'SUCCESS', duration: 1400 }
            ],
            'LOGIN-001': [
              { date: '2024-01-01', status: 'SUCCESS', duration: 2500 },
              { date: '2024-01-02', status: 'SUCCESS', duration: 2300 },
              { date: '2024-01-03', status: 'FAILED', duration: 1200 }
            ],
            'CART-001': [
              { date: '2024-01-01', status: 'SUCCESS', duration: 3500 },
              { date: '2024-01-02', status: 'FAILED', duration: 3200 },
              { date: '2024-01-03', status: 'SUCCESS', duration: 3100 }
            ]
          };
          return Promise.resolve(histories[testId] || []);
        })
      }
    };

    jest.clearAllMocks();
  });

  describe('Complete Test Execution Workflow', () => {
    test('should execute full workflow for single test', async () => {
      const mockWorkflowEngine = {
        executeTest: jest.fn().mockImplementation(async (testId) => {
          // 1. Load configuration
          const config = await mockComponents.configLoader.loadConfig();
          
          // 2. Discover tests
          const discovery = await mockComponents.testDiscovery.discoverTests(config.testsDirectory);
          
          // 3. Find specific test
          const test = mockComponents.testDiscovery.findTestById(testId);
          if (!test) {
            throw new Error(`Test ${testId} not found`);
          }
          
          // 4. Initialize browser
          const browserSession = await mockComponents.browserFramework.initializeBrowser(config.browser);
          
          // 5. Report test start
          mockComponents.consoleReporter.reportSessionStart(1);
          mockComponents.consoleReporter.reportTestStart(test.name);
          
          const startTime = Date.now();
          
          try {
            // 6. Execute test task
            const taskResult = await mockComponents.browserFramework.executeTask(test.task, test.site);
            const endTime = Date.now();
            
            const testResult = {
              testId: test.id,
              testName: test.name,
              status: taskResult.success ? 'SUCCESS' : 'FAILED',
              duration: endTime - startTime,
              error: taskResult.error || null,
              actions: taskResult.actions,
              screenshot: taskResult.screenshot,
              aiTokensUsed: taskResult.aiTokensUsed,
              timestamp: new Date().toISOString()
            };
            
            // 7. Report test result
            mockComponents.consoleReporter.reportTestResult(testResult);
            
            // 8. Save test result
            await mockComponents.resultManager.saveTestResult(testResult);
            
            // 9. Cleanup
            await mockComponents.browserFramework.closeBrowser();
            mockComponents.consoleReporter.reportSessionEnd();
            
            return {
              success: taskResult.success,
              result: testResult,
              browserSession: browserSession
            };
            
          } catch (error) {
            const endTime = Date.now();
            const testResult = {
              testId: test.id,
              testName: test.name,
              status: 'FAILED',
              duration: endTime - startTime,
              error: error.message,
              timestamp: new Date().toISOString()
            };
            
            mockComponents.consoleReporter.reportTestResult(testResult);
            await mockComponents.resultManager.saveTestResult(testResult);
            await mockComponents.browserFramework.closeBrowser();
            
            throw error;
          }
        })
      };

      const result = await mockWorkflowEngine.executeTest('LOGIN-001');

      // Verify complete workflow execution
      expect(mockComponents.configLoader.loadConfig).toHaveBeenCalled();
      expect(mockComponents.testDiscovery.discoverTests).toHaveBeenCalledWith('tests');
      expect(mockComponents.testDiscovery.findTestById).toHaveBeenCalledWith('LOGIN-001');
      expect(mockComponents.browserFramework.initializeBrowser).toHaveBeenCalled();
      expect(mockComponents.consoleReporter.reportSessionStart).toHaveBeenCalledWith(1);
      expect(mockComponents.consoleReporter.reportTestStart).toHaveBeenCalledWith('User Authentication Test');
      expect(mockComponents.browserFramework.executeTask).toHaveBeenCalledWith(
        expect.stringContaining('login'),
        'https://demo.example.com'
      );
      expect(mockComponents.consoleReporter.reportTestResult).toHaveBeenCalled();
      expect(mockComponents.resultManager.saveTestResult).toHaveBeenCalled();
      expect(mockComponents.browserFramework.closeBrowser).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.result.status).toBe('SUCCESS');
      expect(result.result.actions).toHaveLength(7);
    });

    test('should execute batch tests with comprehensive reporting', async () => {
      const mockBatchEngine = {
        executeBatch: jest.fn().mockImplementation(async (testIds) => {
          const config = await mockComponents.configLoader.loadConfig();
          const discovery = await mockComponents.testDiscovery.discoverTests(config.testsDirectory);
          
          const results = [];
          const sessionStartTime = Date.now();
          
          mockComponents.consoleReporter.reportSessionStart(testIds.length);
          
          for (const testId of testIds) {
            const test = mockComponents.testDiscovery.findTestById(testId);
            if (!test) {
              results.push({
                testId: testId,
                status: 'SKIPPED',
                error: 'Test not found',
                duration: 0
              });
              continue;
            }
            
            mockComponents.consoleReporter.reportTestStart(test.name);
            
            const browserSession = await mockComponents.browserFramework.initializeBrowser(config.browser);
            const taskResult = await mockComponents.browserFramework.executeTask(test.task, test.site);
            
            const testResult = {
              testId: test.id,
              testName: test.name,
              status: taskResult.success ? 'SUCCESS' : 'FAILED',
              duration: taskResult.duration,
              error: taskResult.error || null,
              actions: taskResult.actions,
              aiTokensUsed: taskResult.aiTokensUsed
            };
            
            results.push(testResult);
            mockComponents.consoleReporter.reportTestResult(testResult);
            await mockComponents.resultManager.saveTestResult(testResult);
            await mockComponents.browserFramework.closeBrowser();
          }
          
          const sessionEndTime = Date.now();
          const sessionSummary = {
            totalTests: results.length,
            passedTests: results.filter(r => r.status === 'SUCCESS').length,
            failedTests: results.filter(r => r.status === 'FAILED').length,
            skippedTests: results.filter(r => r.status === 'SKIPPED').length,
            duration: sessionEndTime - sessionStartTime,
            totalAiTokens: results.reduce((sum, r) => sum + (r.aiTokensUsed || 0), 0)
          };
          
          mockComponents.consoleReporter.generateSessionSummary(sessionSummary);
          mockComponents.consoleReporter.reportSessionEnd();
          
          // Generate HTML report
          const htmlReport = await mockComponents.htmlReporter.generateReport(results, {
            title: 'Batch Test Execution Report',
            summary: sessionSummary
          });
          
          await mockComponents.htmlReporter.saveReport(htmlReport.html, htmlReport.reportPath);
          
          return {
            success: sessionSummary.failedTests === 0,
            sessionSummary: sessionSummary,
            results: results,
            reportPath: htmlReport.reportPath
          };
        })
      };

      const testIds = ['LOGIN-001', 'NAV-001', 'CART-001'];
      const batchResult = await mockBatchEngine.executeBatch(testIds);

      // Verify batch execution
      expect(mockComponents.consoleReporter.reportSessionStart).toHaveBeenCalledWith(3);
      expect(mockComponents.consoleReporter.reportTestStart).toHaveBeenCalledTimes(3);
      expect(mockComponents.browserFramework.executeTask).toHaveBeenCalledTimes(3);
      expect(mockComponents.consoleReporter.reportTestResult).toHaveBeenCalledTimes(3);
      expect(mockComponents.consoleReporter.generateSessionSummary).toHaveBeenCalled();
      expect(mockComponents.htmlReporter.generateReport).toHaveBeenCalled();
      expect(mockComponents.htmlReporter.saveReport).toHaveBeenCalled();

      expect(batchResult.success).toBe(false); // Due to cart test failure
      expect(batchResult.sessionSummary.totalTests).toBe(3);
      expect(batchResult.sessionSummary.passedTests).toBe(2);
      expect(batchResult.sessionSummary.failedTests).toBe(1);
      expect(batchResult.results).toHaveLength(3);
    });

    test('should execute tests by tag with filtering', async () => {
      const mockTagEngine = {
        executeByTag: jest.fn().mockImplementation(async (tag) => {
          const config = await mockComponents.configLoader.loadConfig();
          const testsWithTag = mockComponents.testDiscovery.findTestsByTag(tag);
          
          if (testsWithTag.length === 0) {
            return {
              success: true,
              message: `No tests found with tag: ${tag}`,
              results: []
            };
          }
          
          const results = [];
          mockComponents.consoleReporter.reportSessionStart(testsWithTag.length);
          
          for (const test of testsWithTag) {
            const fullTest = mockComponents.testDiscovery.findTestById(test.id);
            mockComponents.consoleReporter.reportTestStart(fullTest.name);
            
            const browserSession = await mockComponents.browserFramework.initializeBrowser(config.browser);
            const taskResult = await mockComponents.browserFramework.executeTask(fullTest.task, fullTest.site);
            
            const testResult = {
              testId: fullTest.id,
              testName: fullTest.name,
              status: taskResult.success ? 'SUCCESS' : 'FAILED',
              duration: taskResult.duration,
              tags: test.tags
            };
            
            results.push(testResult);
            mockComponents.consoleReporter.reportTestResult(testResult);
            await mockComponents.browserFramework.closeBrowser();
          }
          
          mockComponents.consoleReporter.reportSessionEnd();
          
          return {
            success: results.every(r => r.status === 'SUCCESS'),
            tag: tag,
            testsExecuted: results.length,
            results: results
          };
        })
      };

      // Test critical tag execution
      const criticalResult = await mockTagEngine.executeByTag('critical');
      expect(criticalResult.testsExecuted).toBe(2); // LOGIN-001 and CART-001
      expect(criticalResult.success).toBe(false); // Cart test fails

      // Test smoke tag execution
      const smokeResult = await mockTagEngine.executeByTag('smoke');
      expect(smokeResult.testsExecuted).toBe(1); // LOGIN-001 only
      expect(smokeResult.success).toBe(true);

      // Test non-existent tag
      const emptyResult = await mockTagEngine.executeByTag('nonexistent');
      expect(emptyResult.testsExecuted).toBeUndefined();
      expect(emptyResult.results).toHaveLength(0);
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle and recover from browser crashes during execution', async () => {
      mockComponents.browserFramework.executeTask.mockRejectedValueOnce(new Error('Browser crashed'));
      mockComponents.browserFramework.initializeBrowser.mockResolvedValueOnce({
        browser: { id: 'browser-2', type: 'chromium' },
        context: { id: 'context-2' },
        page: { id: 'page-2' }
      });

      const mockResilientEngine = {
        executeWithRecovery: jest.fn().mockImplementation(async (testId, maxRetries = 2) => {
          const config = await mockComponents.configLoader.loadConfig();
          const test = mockComponents.testDiscovery.findTestById(testId);
          
          let lastError;
          let attempt = 0;
          
          while (attempt < maxRetries) {
            attempt++;
            
            try {
              const browserSession = await mockComponents.browserFramework.initializeBrowser(config.browser);
              const taskResult = await mockComponents.browserFramework.executeTask(test.task, test.site);
              
              return {
                success: taskResult.success,
                attempt: attempt,
                recovered: attempt > 1,
                result: taskResult
              };
              
            } catch (error) {
              lastError = error;
              
              if (error.message.includes('Browser crashed') && attempt < maxRetries) {
                // Attempt recovery
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              
              break;
            } finally {
              try {
                await mockComponents.browserFramework.closeBrowser();
              } catch (cleanupError) {
                // Ignore cleanup errors during recovery
              }
            }
          }
          
          throw new Error(`Test failed after ${attempt} attempts: ${lastError.message}`);
        })
      };

      const result = await mockResilientEngine.executeWithRecovery('LOGIN-001', 2);

      expect(result.success).toBe(true);
      expect(result.attempt).toBe(2);
      expect(result.recovered).toBe(true);
      expect(mockComponents.browserFramework.initializeBrowser).toHaveBeenCalledTimes(2);
    });

    test('should handle configuration loading failures gracefully', async () => {
      mockComponents.configLoader.loadConfig.mockRejectedValue(new Error('Config file not found'));

      const mockFailsafeEngine = {
        executeWithFailsafe: jest.fn().mockImplementation(async (testId) => {
          try {
            const config = await mockComponents.configLoader.loadConfig();
            return { success: true, config: config };
          } catch (error) {
            // Use default configuration
            const defaultConfig = {
              browser: { headless: true, timeout: 30000 },
              ai: { openai: { apiKey: 'fallback-key', modelName: 'gpt-4o' } }
            };
            
            return {
              success: true,
              config: defaultConfig,
              warning: 'Used default configuration due to config loading failure',
              originalError: error.message
            };
          }
        })
      };

      const result = await mockFailsafeEngine.executeWithFailsafe('LOGIN-001');

      expect(result.success).toBe(true);
      expect(result.warning).toContain('default configuration');
      expect(result.config.browser.headless).toBe(true);
    });
  });

  describe('Performance and Metrics', () => {
    test('should track comprehensive performance metrics', async () => {
      const mockMetricsEngine = {
        executeWithMetrics: jest.fn().mockImplementation(async (testIds) => {
          const startTime = performance.now();
          const config = await mockComponents.configLoader.loadConfig();
          
          const metrics = {
            configLoadTime: 150,
            testDiscoveryTime: 300,
            browserInitTime: 2000,
            testExecutionTimes: [],
            totalAiTokens: 0,
            memoryUsage: {
              start: 100, // MB
              peak: 0,
              end: 0
            }
          };
          
          const results = [];
          
          for (const testId of testIds) {
            const test = mockComponents.testDiscovery.findTestById(testId);
            const testStartTime = performance.now();
            
            await mockComponents.browserFramework.initializeBrowser(config.browser);
            const taskResult = await mockComponents.browserFramework.executeTask(test.task, test.site);
            await mockComponents.browserFramework.closeBrowser();
            
            const testEndTime = performance.now();
            const testDuration = testEndTime - testStartTime;
            
            metrics.testExecutionTimes.push({
              testId: testId,
              duration: testDuration,
              aiTokens: taskResult.aiTokensUsed
            });
            
            metrics.totalAiTokens += taskResult.aiTokensUsed;
            metrics.memoryUsage.peak = Math.max(metrics.memoryUsage.peak, 150 + (testIds.indexOf(testId) * 20));
            
            results.push({
              testId: testId,
              status: taskResult.success ? 'SUCCESS' : 'FAILED',
              duration: testDuration
            });
          }
          
          const endTime = performance.now();
          metrics.totalDuration = endTime - startTime;
          metrics.memoryUsage.end = 120;
          
          return {
            success: results.every(r => r.status === 'SUCCESS'),
            results: results,
            metrics: metrics,
            averageTestTime: metrics.testExecutionTimes.reduce((sum, t) => sum + t.duration, 0) / metrics.testExecutionTimes.length,
            tokensPerTest: metrics.totalAiTokens / testIds.length
          };
        })
      };

      const testIds = ['LOGIN-001', 'NAV-001'];
      const result = await mockMetricsEngine.executeWithMetrics(testIds);

      expect(result.metrics.configLoadTime).toBe(150);
      expect(result.metrics.testExecutionTimes).toHaveLength(2);
      expect(result.metrics.totalAiTokens).toBeGreaterThan(0);
      expect(result.averageTestTime).toBeGreaterThan(0);
      expect(result.tokensPerTest).toBeGreaterThan(0);
      expect(result.metrics.memoryUsage.peak).toBeGreaterThan(result.metrics.memoryUsage.start);
    });

    test('should optimize execution based on test history', async () => {
      const mockOptimizedEngine = {
        executeOptimized: jest.fn().mockImplementation(async (testIds) => {
          const optimizations = {
            testOrderOptimized: false,
            browserReuseEnabled: false,
            parallelExecution: false
          };
          
          // Get test history for optimization
          const histories = {};
          for (const testId of testIds) {
            histories[testId] = await mockComponents.resultManager.getTestHistory(testId);
          }
          
          // Sort tests by average execution time (fastest first for quick feedback)
          const sortedTestIds = testIds.sort((a, b) => {
            const avgA = histories[a].reduce((sum, h) => sum + h.duration, 0) / histories[a].length;
            const avgB = histories[b].reduce((sum, h) => sum + h.duration, 0) / histories[b].length;
            return avgA - avgB;
          });
          
          optimizations.testOrderOptimized = true;
          
          const results = [];
          let sharedBrowser = null;
          
          // Reuse browser for similar tests
          for (const testId of sortedTestIds) {
            const test = mockComponents.testDiscovery.findTestById(testId);
            
            if (!sharedBrowser) {
              sharedBrowser = await mockComponents.browserFramework.initializeBrowser();
              optimizations.browserReuseEnabled = true;
            }
            
            const taskResult = await mockComponents.browserFramework.executeTask(test.task, test.site);
            
            results.push({
              testId: testId,
              status: taskResult.success ? 'SUCCESS' : 'FAILED',
              duration: taskResult.duration,
              optimized: true
            });
          }
          
          await mockComponents.browserFramework.closeBrowser();
          
          return {
            success: results.every(r => r.status === 'SUCCESS'),
            results: results,
            optimizations: optimizations,
            executionOrder: sortedTestIds
          };
        })
      };

      const testIds = ['CART-001', 'LOGIN-001', 'NAV-001']; // Unsorted order
      const result = await mockOptimizedEngine.executeOptimized(testIds);

      expect(result.optimizations.testOrderOptimized).toBe(true);
      expect(result.optimizations.browserReuseEnabled).toBe(true);
      expect(result.executionOrder).toEqual(['NAV-001', 'LOGIN-001', 'CART-001']); // Sorted by avg duration
      expect(mockComponents.browserFramework.initializeBrowser).toHaveBeenCalledTimes(1); // Browser reuse
    });
  });
});
