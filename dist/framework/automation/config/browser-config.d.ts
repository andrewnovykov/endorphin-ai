/**
 * Browser Configuration for Endorphin AI
 * Provides default configuration for browser behavior and options
 */
/**
 * Browser configuration settings
 */
export declare const BROWSER_CONFIG: {
    readonly launchOptions: {
        readonly headless: boolean;
        readonly args: readonly ["--start-maximized"];
    };
    readonly contextOptions: {
        readonly viewport: {
            readonly width: 1920;
            readonly height: 1080;
        };
    };
    readonly timeouts: {
        readonly navigation: 60000;
        readonly element: 45000;
        readonly screenshot: 5000;
        readonly testExecution: number;
        readonly verification: 60000;
    };
    readonly screenshot: {
        readonly fullPage: false;
        readonly type: "png";
    };
    readonly baseUrl: string;
};
export default BROWSER_CONFIG;
//# sourceMappingURL=browser-config.d.ts.map