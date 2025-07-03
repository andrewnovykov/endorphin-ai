/**
 * Browser Manager
 * Handles browser lifecycle, page navigation, and browser-specific operations
 */
import { chromium, firefox, webkit } from 'playwright';
import { globalLogger } from '../../core/logger.js';
export class BrowserManager {
    browser = null;
    context = null;
    page = null;
    config;
    logger = globalLogger.createChild('BrowserManager');
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize browser, context, and page
     */
    async initialize() {
        // Skip if already initialized
        if (this.browser && this.context && this.page) {
            this.logger.debug('Browser already initialized, reusing existing instance');
            return;
        }
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
    getPage() {
        if (!this.page) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }
        return this.page;
    }
    /**
     * Get the current browser context
     */
    getContext() {
        if (!this.context) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }
        return this.context;
    }
    /**
     * Get the current browser
     */
    getBrowser() {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }
        return this.browser;
    }
    /**
     * Navigate to a URL
     */
    async navigateToUrl(url, options) {
        const page = this.getPage();
        const timeout = options?.timeout || this.config.browser.timeout;
        const waitUntil = options?.waitUntil || 'domcontentloaded';
        this.logger.info(`Navigating to ${url}`, { timeout, waitUntil });
        try {
            await page.goto(url, { timeout, waitUntil });
            this.logger.debug('Navigation completed successfully');
        }
        catch (error) {
            this.logger.error('Navigation failed', error, { url, timeout, waitUntil });
            throw error;
        }
    }
    /**
     * Take a screenshot
     */
    async takeScreenshot(options) {
        const page = this.getPage();
        this.logger.debug('Taking screenshot', options);
        try {
            const screenshotOptions = {
                fullPage: options?.fullPage ?? true,
            };
            if (options?.path) {
                screenshotOptions.path = options.path;
                // Only set quality for JPEG images (PNG doesn't support quality)
                const isJpeg = options.path.toLowerCase().includes('.jpg') || options.path.toLowerCase().includes('.jpeg');
                if (isJpeg && options?.quality) {
                    screenshotOptions.quality = options.quality;
                }
            }
            else if (options?.quality) {
                // Default to JPEG when quality is specified but no path
                screenshotOptions.quality = options.quality;
                screenshotOptions.type = 'jpeg';
            }
            const screenshot = await page.screenshot(screenshotOptions);
            this.logger.debug('Screenshot taken successfully');
            return screenshot;
        }
        catch (error) {
            this.logger.error('Screenshot failed', error, options);
            throw error;
        }
    }
    /**
     * Wait for page load
     */
    async waitForPageLoad(timeout) {
        const page = this.getPage();
        const waitTimeout = timeout || this.config.browser.timeout;
        this.logger.debug('Waiting for page load', { timeout: waitTimeout });
        try {
            await page.waitForLoadState('domcontentloaded', { timeout: waitTimeout });
            this.logger.debug('Page load completed');
        }
        catch (error) {
            this.logger.error('Page load timeout', error, { timeout: waitTimeout });
            throw error;
        }
    }
    /**
     * Create a new page
     */
    async createNewPage() {
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
    async closePage() {
        if (this.page) {
            this.logger.debug('Closing page');
            // Remove event listeners before closing
            this.removePageEventHandlers(this.page);
            await this.page.close();
            this.page = null;
            this.logger.debug('Page closed');
        }
    }
    /**
     * Close browser context
     */
    async closeContext() {
        if (this.context) {
            this.logger.debug('Closing browser context');
            // Clean up page event listeners if page still exists
            if (this.page) {
                this.removePageEventHandlers(this.page);
            }
            await this.context.close();
            this.context = null;
            this.page = null;
            this.logger.debug('Browser context closed');
        }
    }
    /**
     * Close browser
     */
    async closeBrowser() {
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
    async cleanup() {
        this.logger.info('Cleaning up browser resources');
        try {
            await this.closePage();
            await this.closeContext();
            await this.closeBrowser();
            this.logger.info('Browser cleanup completed');
        }
        catch (error) {
            this.logger.error('Error during browser cleanup', error);
        }
    }
    /**
     * Check if browser is initialized
     */
    isInitialized() {
        return this.browser !== null && this.context !== null && this.page !== null;
    }
    /**
     * Get current URL
     */
    getCurrentUrl() {
        const page = this.getPage();
        return page.url();
    }
    /**
     * Get page title
     */
    async getPageTitle() {
        const page = this.getPage();
        return await page.title();
    }
    /**
     * Set viewport size
     */
    async setViewportSize(width, height) {
        const page = this.getPage();
        this.logger.debug('Setting viewport size', { width, height });
        await page.setViewportSize({ width, height });
        this.logger.debug('Viewport size updated');
    }
    /**
     * Get browser type
     */
    getBrowserType() {
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
    getLaunchOptions() {
        const options = {
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
    getContextOptions() {
        const options = {
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
    setupPageEventHandlers(page) {
        const targetPage = page || this.page;
        if (!targetPage)
            return;
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
            }
            else if (level === 'warning' && !isUselessError) {
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
    /**
     * Determine if a console message should be filtered out
     */
    shouldFilterConsoleMessage(text, _level) {
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
    removePageEventHandlers(page) {
        try {
            page.removeAllListeners('console');
            page.removeAllListeners('pageerror');
            page.removeAllListeners('requestfailed');
            page.removeAllListeners('response');
        }
        catch {
            // Ignore errors when removing listeners (page might be closed)
        }
    }
}
//# sourceMappingURL=browser-manager.js.map