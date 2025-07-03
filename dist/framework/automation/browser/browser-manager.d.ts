/**
 * Browser Manager
 * Handles browser lifecycle, page navigation, and browser-specific operations
 */
import { Browser, BrowserContext, Page } from 'playwright';
import type { BrowserConfig } from '../types/browser.js';
export interface BrowserManagerConfig {
    browser: BrowserConfig;
}
export declare class BrowserManager {
    private browser;
    private context;
    private page;
    private config;
    private logger;
    constructor(config: BrowserManagerConfig);
    /**
     * Initialize browser, context, and page
     */
    initialize(): Promise<void>;
    /**
     * Get the current page
     */
    getPage(): Page;
    /**
     * Get the current browser context
     */
    getContext(): BrowserContext;
    /**
     * Get the current browser
     */
    getBrowser(): Browser;
    /**
     * Navigate to a URL
     */
    navigateToUrl(url: string, options?: {
        timeout?: number;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    }): Promise<void>;
    /**
     * Take a screenshot
     */
    takeScreenshot(options?: {
        path?: string;
        fullPage?: boolean;
        quality?: number;
    }): Promise<Buffer>;
    /**
     * Wait for page load
     */
    waitForPageLoad(timeout?: number): Promise<void>;
    /**
     * Create a new page
     */
    createNewPage(): Promise<Page>;
    /**
     * Close current page
     */
    closePage(): Promise<void>;
    /**
     * Close browser context
     */
    closeContext(): Promise<void>;
    /**
     * Close browser
     */
    closeBrowser(): Promise<void>;
    /**
     * Clean up all browser resources
     */
    cleanup(): Promise<void>;
    /**
     * Check if browser is initialized
     */
    isInitialized(): boolean;
    /**
     * Get current URL
     */
    getCurrentUrl(): string;
    /**
     * Get page title
     */
    getPageTitle(): Promise<string>;
    /**
     * Set viewport size
     */
    setViewportSize(width: number, height: number): Promise<void>;
    /**
     * Get browser type
     */
    private getBrowserType;
    /**
     * Get browser launch options
     */
    private getLaunchOptions;
    /**
     * Get browser context options
     */
    private getContextOptions;
    /**
     * Setup page event handlers for debugging and monitoring
     */
    private setupPageEventHandlers;
    /**
     * Determine if a console message should be filtered out
     */
    private shouldFilterConsoleMessage;
    /**
     * Remove page event handlers to prevent memory leaks
     */
    private removePageEventHandlers;
}
//# sourceMappingURL=browser-manager.d.ts.map