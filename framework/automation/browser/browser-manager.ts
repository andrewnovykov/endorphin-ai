/**
 * Browser Manager
 * Handles browser lifecycle, page navigation, and browser-specific operations
 */

import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import type { BrowserConfig } from '../types/browser.js';
import { globalLogger, logWithIcon, LogLevel } from '../../core/logger.js';
import { ciPerformanceMonitor } from '../../core/ci-performance.js';

export interface BrowserManagerConfig {
  browser: BrowserConfig;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserManagerConfig;
  private logger = globalLogger.createChild('BrowserManager');
  
  // Multi-user support
  private userContexts: Map<string, BrowserContext> = new Map();
  private userPages: Map<string, Page> = new Map();
  private currentUserId: string | null = null;

  constructor(config: BrowserManagerConfig) {
    this.config = config;
  }

  /**
   * Initialize browser, context, and page
   */
  async initialize(): Promise<void> {
    // Skip if already initialized
    if (this.browser && this.context && this.page) {
      logWithIcon(LogLevel.DEBUG, 'debug', 'Browser already initialized, reusing existing instance', {}, 'BrowserManager');
      return;
    }

    this.logger.info('Initializing browser');

    const browserType = this.getBrowserType();
    const launchOptions = this.getLaunchOptions();
    const contextOptions = this.getContextOptions();

    logWithIcon(LogLevel.DEBUG, 'debug', 'Launching browser', {
      type: this.config.browser.type,
      headless: this.config.browser.headless,
      viewport: this.config.browser.viewport,
    });

    this.browser = await browserType.launch(launchOptions);
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup page event handlers
    this.setupPageEventHandlers();

    // Set current page for performance monitoring
    ciPerformanceMonitor.setCurrentPage(this.page);

    this.logger.info('Browser initialized successfully');
  }

  /**
   * Get the current page
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
    return this.page;
  }

  /**
   * Get page for specific user
   */
  getUserPage(userId: string): Page {
    const page = this.userPages.get(userId);
    if (!page) {
      throw new Error(`User page not found for user: ${userId}. Call initializeMultiUser() first.`);
    }
    return page;
  }

  /**
   * Get the current browser context
   */
  getContext(): BrowserContext {
    if (!this.context) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
    return this.context;
  }

  /**
   * Get the current browser
   */
  getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
    return this.browser;
  }

  /**
   * Navigate to a URL
   */
  async navigateToUrl(
    url: string,
    options?: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }
  ): Promise<void> {
    const page = this.getPage();
    const timeout = options?.timeout || this.config.browser.timeout;
    const waitUntil = options?.waitUntil || 'domcontentloaded';

    this.logger.info(`Navigating to ${url}`, { timeout, waitUntil });

    try {
      await page.goto(url, { timeout, waitUntil });
      logWithIcon(LogLevel.DEBUG, 'debug', 'Navigation completed successfully', {}, 'BrowserManager');
    } catch (error: any) {
      this.logger.error('Navigation failed', error, { url, timeout, waitUntil });
      throw error;
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(options?: {
    path?: string;
    fullPage?: boolean;
    quality?: number;
  }): Promise<Buffer> {
    const page = this.getPage();

    logWithIcon(LogLevel.DEBUG, 'debug', 'Taking screenshot', options || {}, 'BrowserManager');

    try {
      const screenshotOptions: any = {
        fullPage: options?.fullPage ?? true,
      };

      if (options?.path) {
        screenshotOptions.path = options.path;
        // Only set quality for JPEG images (PNG doesn't support quality)
        const isJpeg = options.path.toLowerCase().includes('.jpg') || options.path.toLowerCase().includes('.jpeg');
        if (isJpeg && options?.quality) {
          screenshotOptions.quality = options.quality;
        }
      } else if (options?.quality) {
        // Default to JPEG when quality is specified but no path
        screenshotOptions.quality = options.quality;
        screenshotOptions.type = 'jpeg';
      }

      const screenshot = await page.screenshot(screenshotOptions);

      logWithIcon(LogLevel.DEBUG, 'debug', 'Screenshot taken successfully', {}, 'BrowserManager');
      return screenshot;
    } catch (error: any) {
      this.logger.error('Screenshot failed', error, options);
      throw error;
    }
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    const page = this.getPage();
    const waitTimeout = timeout || this.config.browser.timeout;

    logWithIcon(LogLevel.DEBUG, 'debug', 'Waiting for page load', { timeout: waitTimeout }, 'BrowserManager');

    try {
      await page.waitForLoadState('domcontentloaded', { timeout: waitTimeout });
      logWithIcon(LogLevel.DEBUG, 'debug', 'Page load completed', {}, 'BrowserManager');
    } catch (error: any) {
      this.logger.error('Page load timeout', error, { timeout: waitTimeout });
      throw error;
    }
  }

  /**
   * Create a new page
   */
  async createNewPage(): Promise<Page> {
    const context = this.getContext();

    logWithIcon(LogLevel.DEBUG, 'debug', 'Creating new page', {}, 'BrowserManager');

    const newPage = await context.newPage();
    this.setupPageEventHandlers(newPage);

    logWithIcon(LogLevel.DEBUG, 'debug', 'New page created', {}, 'BrowserManager');
    return newPage;
  }

  /**
   * Close current page
   */
  async closePage(): Promise<void> {
    if (this.page) {
      logWithIcon(LogLevel.DEBUG, 'debug', 'Closing page', {}, 'BrowserManager');
      // Remove event listeners before closing
      this.removePageEventHandlers(this.page);
      await this.page.close();
      this.page = null;
      logWithIcon(LogLevel.DEBUG, 'debug', 'Page closed', {}, 'BrowserManager');
    }
  }

  /**
   * Close browser context
   */
  async closeContext(): Promise<void> {
    if (this.context) {
      logWithIcon(LogLevel.DEBUG, 'debug', 'Closing browser context', {}, 'BrowserManager');
      // Clean up page event listeners if page still exists
      if (this.page) {
        this.removePageEventHandlers(this.page);
      }
      await this.context.close();
      this.context = null;
      this.page = null;
      logWithIcon(LogLevel.DEBUG, 'debug', 'Browser context closed', {}, 'BrowserManager');
    }
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      logWithIcon(LogLevel.DEBUG, 'debug', 'Closing browser', {}, 'BrowserManager');
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.logger.info('Browser closed');
    }
  }

  /**
   * Clean up all browser resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up browser resources');

    try {
      // Clean up multi-user sessions first
      await this.cleanupMultiUser();
      
      // Clean up single-user session
      await this.closePage();
      await this.closeContext();
      await this.closeBrowser();
      this.logger.info('Browser cleanup completed');
    } catch (error: any) {
      this.logger.error('Error during browser cleanup', error);
    }
  }

  /**
   * Clean up multi-user sessions
   */
  private async cleanupMultiUser(): Promise<void> {
    if (this.userPages.size === 0) {
      return;
    }

    logWithIcon(LogLevel.DEBUG, 'debug', 'Cleaning up multi-user sessions', { userCount: this.userPages.size }, 'BrowserManager');

    // Close all user pages except the main page if it's being reused
    for (const [userId, page] of this.userPages) {
      try {
        // Skip closing if this is the main page
        if (page === this.page) {
          logWithIcon(LogLevel.DEBUG, 'debug', 'Skipping main page close for user', { userId }, 'BrowserManager');
          continue;
        }
        this.removePageEventHandlers(page);
        await page.close();
        logWithIcon(LogLevel.DEBUG, 'debug', 'Closed page for user', { userId }, 'BrowserManager');
      } catch (error: any) {
        this.logger.error('Error closing page for user', error, { userId });
      }
    }

    // Close all user contexts except the main context if it's being reused
    for (const [userId, context] of this.userContexts) {
      try {
        // Skip closing if this is the main context
        if (context === this.context) {
          logWithIcon(LogLevel.DEBUG, 'debug', 'Skipping main context close for user', { userId }, 'BrowserManager');
          continue;
        }
        await context.close();
        logWithIcon(LogLevel.DEBUG, 'debug', 'Closed context for user', { userId }, 'BrowserManager');
      } catch (error: any) {
        this.logger.error('Error closing context for user', error, { userId });
      }
    }

    // Clear maps
    this.userPages.clear();
    this.userContexts.clear();
    this.currentUserId = null;

    logWithIcon(LogLevel.DEBUG, 'debug', 'Multi-user cleanup completed', {}, 'BrowserManager');
  }

  /**
   * Check if browser is initialized
   */
  isInitialized(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null;
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    const page = this.getPage();
    return page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    const page = this.getPage();
    return await page.title();
  }

  /**
   * Set viewport size
   */
  async setViewportSize(width: number, height: number): Promise<void> {
    const page = this.getPage();

    logWithIcon(LogLevel.DEBUG, 'debug', 'Setting viewport size', { width, height }, 'BrowserManager');

    await page.setViewportSize({ width, height });

    logWithIcon(LogLevel.DEBUG, 'debug', 'Viewport size updated', {}, 'BrowserManager');
  }

  /**
   * Initialize multi-user browser sessions
   */
  async initializeMultiUser(userIds: string[]): Promise<void> {
    if (userIds.length === 0) {
      throw new Error('At least one user ID is required');
    }

    if (userIds.length > 5) {
      throw new Error('Maximum 5 users supported per test');
    }

    this.logger.info('Initializing multi-user browser sessions', { userCount: userIds.length, users: userIds });

    // Ensure browser is initialized
    if (!this.browser) {
      await this.initialize();
    }

    // For the first user, reuse the existing context and page
    const firstUserId = userIds[0];
    if (this.context && this.page) {
      this.userContexts.set(firstUserId, this.context);
      this.userPages.set(firstUserId, this.page);
      logWithIcon(LogLevel.DEBUG, 'debug', `Reusing existing browser context for user: ${firstUserId}`, {}, 'BrowserManager');
    } else {
      throw new Error('Browser must be initialized before multi-user setup');
    }

    // Create new contexts and pages for additional users
    for (let i = 1; i < userIds.length; i++) {
      const userId = userIds[i];
      const contextOptions = this.getContextOptions();
      const context = await this.browser!.newContext(contextOptions);
      const page = await context.newPage();

      // Setup page event handlers
      this.setupPageEventHandlers(page);

      // Store user context and page
      this.userContexts.set(userId, context);
      this.userPages.set(userId, page);
      logWithIcon(LogLevel.DEBUG, 'debug', `Created new browser context for user: ${userId}`, {}, 'BrowserManager');

      logWithIcon(LogLevel.DEBUG, 'debug', 'Created browser session for user', { userId }, 'BrowserManager');
    }

    this.logger.info('Multi-user browser sessions initialized successfully');
  }

  /**
   * Parse base user ID from phase ID (e.g., 'user1.phase1' -> 'user1')
   */
  private parseBaseUserId(phaseId: string): string {
    return phaseId.split('.')[0];
  }

  /**
   * Switch to specific user context (supports phase-based IDs)
   */
  async switchToUser(userId: string): Promise<void> {
    // Parse base user ID from phase ID if needed
    const baseUserId = this.parseBaseUserId(userId);
    
    if (!this.userPages.has(baseUserId)) {
      throw new Error(`User ${baseUserId} not found. Call initializeMultiUser() first.`);
    }

    this.currentUserId = userId; // Keep the full phase ID for tracking
    this.page = this.userPages.get(baseUserId)!;
    this.context = this.userContexts.get(baseUserId)!;

    logWithIcon(LogLevel.DEBUG, 'debug', 'Switched to user context', { 
      phaseId: userId, 
      baseUserId,
      availableUsers: Array.from(this.userPages.keys())
    }, 'BrowserManager');

    // Add timing delay for multi-user context switching to ensure stability
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ensure the page is ready by checking if it's still connected
    if (this.page) {
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 3000 });
      } catch {
        // If networkidle times out, just wait for domcontentloaded
        await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 });
      }
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Get all user IDs
   */
  getUserIds(): string[] {
    return Array.from(this.userPages.keys());
  }

  /**
   * Check if multi-user mode is active
   */
  isMultiUserMode(): boolean {
    return this.userPages.size > 0;
  }

  /**
   * Get browser type
   */
  private getBrowserType() {
    switch (this.config.browser.type) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  /**
   * Get browser launch options
   */
  private getLaunchOptions() {
    const options: any = {
      headless: process.env.CI ? true : this.config.browser.headless, // Force headless in CI environments
      args: [
        '--window-size=1300,750',  // Small window size (slightly bigger than viewport for window chrome)
        '--disable-web-security',
      ],
    };

    // CI-specific basic settings
    if (process.env.CI) {
      options.args.push(
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
        // Removed --single-process as it causes issues with multi-context tests
      );

    }

    if (this.config.browser.slowMo !== undefined) {
      options.slowMo = this.config.browser.slowMo;
    }

    if (this.config.browser.devtools !== undefined) {
      options.devtools = this.config.browser.devtools;
    }

    return options;
  }

  /**
   * Get browser context options
   */
  private getContextOptions() {
    const options: any = {
      viewport: this.config.browser.viewport,
    };

    // CI-specific context optimizations
    if (process.env.CI) {
      // Basic CI optimizations (always applied in CI)
      options.ignoreHTTPSErrors = true;
      options.bypassCSP = true;
      options.acceptDownloads = false;

      // Disable video recording in CI by default (saves significant resources)
      if (!this.config.browser.recordVideo) {
        options.recordVideo = undefined;
      }

      // Disable HAR recording in CI by default
      if (!this.config.browser.recordHar) {
        options.recordHar = undefined;
      }

    }

    // Apply original video recording if configured
    if (this.config.browser.recordVideo && !process.env.CI) {
      options.recordVideo = {
        dir: 'test-results/videos/',
        size: this.config.browser.viewport,
      };
    }

    // Apply original HAR recording if configured
    if (this.config.browser.recordHar && !process.env.CI) {
      options.recordHar = {
        path: 'test-results/network.har',
      };
    }

    return options;
  }

  /**
   * Setup page event handlers for debugging and monitoring
   */
  private setupPageEventHandlers(page?: Page): void {
    const targetPage = page || this.page;
    if (!targetPage) return;

    // Clear existing listeners first to prevent duplicates
    this.removePageEventHandlers(targetPage);

    // Handle console messages
    targetPage.on('console', (msg) => {
      const level = msg.type();
      const text = msg.text();

      // Filter out useless mirror errors and other noise
      const isUselessError = this.shouldFilterConsoleMessage(text, level);
      
      if (level === 'error' && !isUselessError) {
        this.logger.warn(`Browser console error: ${text}`);
      } else if (level === 'warning' && !isUselessError) {
        logWithIcon(LogLevel.DEBUG, 'debug', `Browser console warning: ${text}`, {}, 'BrowserManager');
      }
    });

    // Handle page errors
    targetPage.on('pageerror', (error) => {
      this.logger.error('Page error occurred', error);
    });

    // Handle request failures
    targetPage.on('requestfailed', (request) => {
      this.logger.warn('Request failed', {
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
      });
    });

    // Handle response errors
    targetPage.on('response', (response) => {
      if (response.status() >= 400) {
        this.logger.warn('HTTP error response', {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });
  }

  /**
   * Determine if a console message should be filtered out
   */
  private shouldFilterConsoleMessage(text: string, _level: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Filter out mirror-related errors (CodeMirror, text editors, etc.)
    const mirrorPatterns = [
      'mirror',
      'codemirror',
      'cm-',
      'editor mirror',
      'text mirror'
    ];
    
    // Filter out other common useless errors from automation tools
    const uselessPatterns = [
      'playwright',
      'injected script',
      'automation',
      'non-critical'
    ];
    
    const allPatterns = [...mirrorPatterns, ...uselessPatterns];
    
    return allPatterns.some(pattern => lowerText.includes(pattern));
  }

  /**
   * Remove page event handlers to prevent memory leaks
   */
  private removePageEventHandlers(page: Page): void {
    try {
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      page.removeAllListeners('requestfailed');
      page.removeAllListeners('response');
    } catch {
      // Ignore errors when removing listeners (page might be closed)
    }
  }
}
