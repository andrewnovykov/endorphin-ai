/**
 * Browser Manager
 * Handles browser lifecycle, page navigation, and browser-specific operations
 */

import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import type { BrowserConfig } from '../types/browser.js';
import { globalLogger } from '../../core/logger.js';

export interface BrowserManagerConfig {
  browser: BrowserConfig;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserManagerConfig;
  private logger = globalLogger.createChild('BrowserManager');

  constructor(config: BrowserManagerConfig) {
    this.config = config;
  }

  /**
   * Initialize browser, context, and page
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing browser');

    const browserType = this.getBrowserType();
    const launchOptions = this.getLaunchOptions();
    const contextOptions = this.getContextOptions();

    this.logger.debug('Launching browser', {
      type: this.config.browser.type,
      headless: this.config.browser.headless,
      viewport: this.config.browser.viewport,
    });

    this.browser = await browserType.launch(launchOptions);
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Setup page event handlers
    this.setupPageEventHandlers();

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
      this.logger.debug('Navigation completed successfully');
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

    this.logger.debug('Taking screenshot', options);

    try {
      const screenshotOptions: any = {
        fullPage: options?.fullPage ?? true,
        quality: options?.quality ?? 90,
      };

      if (options?.path) {
        screenshotOptions.path = options.path;
      }

      const screenshot = await page.screenshot(screenshotOptions);

      this.logger.debug('Screenshot taken successfully');
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

    this.logger.debug('Waiting for page load', { timeout: waitTimeout });

    try {
      await page.waitForLoadState('domcontentloaded', { timeout: waitTimeout });
      this.logger.debug('Page load completed');
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

    this.logger.debug('Creating new page');

    const newPage = await context.newPage();
    this.setupPageEventHandlers(newPage);

    this.logger.debug('New page created');
    return newPage;
  }

  /**
   * Close current page
   */
  async closePage(): Promise<void> {
    if (this.page) {
      this.logger.debug('Closing page');
      await this.page.close();
      this.page = null;
      this.logger.debug('Page closed');
    }
  }

  /**
   * Close browser context
   */
  async closeContext(): Promise<void> {
    if (this.context) {
      this.logger.debug('Closing browser context');
      await this.context.close();
      this.context = null;
      this.page = null;
      this.logger.debug('Browser context closed');
    }
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      this.logger.debug('Closing browser');
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
      await this.closePage();
      await this.closeContext();
      await this.closeBrowser();
      this.logger.info('Browser cleanup completed');
    } catch (error: any) {
      this.logger.error('Error during browser cleanup', error);
    }
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

    this.logger.debug('Setting viewport size', { width, height });

    await page.setViewportSize({ width, height });

    this.logger.debug('Viewport size updated');
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
      headless: this.config.browser.headless,
      args: ['--start-maximized'],
    };

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

    if (this.config.browser.recordVideo) {
      options.recordVideo = {
        dir: 'test-results/videos/',
        size: this.config.browser.viewport,
      };
    }

    if (this.config.browser.recordHar) {
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

    // Handle console messages
    targetPage.on('console', (msg) => {
      const level = msg.type();
      const text = msg.text();

      if (level === 'error') {
        this.logger.warn(`Browser console error: ${text}`);
      } else if (level === 'warning') {
        this.logger.debug(`Browser console warning: ${text}`);
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
}
