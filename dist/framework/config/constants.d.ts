/**
 * Framework Constants
 * Centralized constants to replace magic numbers throughout the codebase
 */
export declare const TIMEOUTS: {
    readonly DEFAULT_WAIT: 2000;
    readonly LONG_WAIT: 5000;
    readonly ELEMENT_WAIT: 30000;
    readonly PAGE_LOAD: 60000;
    readonly AGENT_TIMEOUT: 300000;
    readonly NETWORK_TIMEOUT: 30000;
    readonly FILE_OPERATION_TIMEOUT: 10000;
    readonly SCREENSHOT_TIMEOUT: 5000;
    readonly STEP_DELAY: 1000;
};
export declare const LIMITS: {
    readonly MAX_CONTENT_LENGTH: 8000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly MAX_SNAPSHOTS: 50;
    readonly MAX_TOKENS: 8000;
    readonly MAX_SCREENSHOTS: 100;
    readonly MAX_SESSION_DURATION: 3600000;
    readonly MAX_CONCURRENT_TESTS: 10;
    readonly MAX_FILE_SIZE: 10485760;
    readonly MAX_ERROR_STACK_DEPTH: 20;
};
export declare const SELECTORS: {
    readonly EMAIL_INPUTS: "input[type=\"email\"], input[name*=\"email\"], input[id*=\"email\"], #email";
    readonly PASSWORD_INPUTS: "input[type=\"password\"], input[name*=\"password\"], input[id*=\"password\"], #password";
    readonly USERNAME_INPUTS: "input[name*=\"username\"], input[id*=\"username\"], #username";
    readonly SUBMIT_BUTTONS: "button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Log\"), button:has-text(\"Sign\")";
    readonly FORM_ELEMENTS: "form, [role=\"form\"]";
    readonly NAVIGATION_LINKS: "a, [role=\"link\"]";
    readonly BUTTONS: "button, [role=\"button\"], input[type=\"button\"]";
    readonly TEXT_INPUTS: "input[type=\"text\"], input:not([type]), textarea";
    readonly CLICKABLE_ELEMENTS: "a, button, [role=\"button\"], [role=\"link\"], input[type=\"submit\"], input[type=\"button\"]";
};
export declare const CONTENT_LIMITS: {
    readonly MIN_TEXT_LENGTH: 10;
    readonly MAX_TEXT_LENGTH: 1000;
    readonly MAX_ELEMENTS_PER_TYPE: 20;
    readonly MAX_NAVIGATION_ITEMS: 15;
    readonly MAX_FORM_FIELDS: 25;
    readonly TOKEN_ESTIMATION_RATIO: 4;
    readonly OPTIMIZATION_THRESHOLD: 0.7;
};
export declare const SNAPSHOT_CONFIG: {
    readonly MAX_SNAPSHOTS: 50;
    readonly MAX_AGE: 300000;
    readonly CLEANUP_INTERVAL: 60000;
    readonly MAX_SNAPSHOT_SIZE: 1048576;
    readonly RETENTION_POLICY: "lru";
};
export declare const LOGGING: {
    readonly LEVELS: {
        readonly DEBUG: 0;
        readonly INFO: 1;
        readonly WARN: 2;
        readonly ERROR: 3;
    };
    readonly MAX_LOG_LENGTH: 1000;
    readonly MAX_CONTEXT_SIZE: 500;
};
export declare const NETWORK: {
    readonly MAX_REDIRECTS: 5;
    readonly USER_AGENT: "Endorphin-AI-Framework/0.8.0";
    readonly DEFAULT_HEADERS: {
        readonly Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
        readonly 'Accept-Language': "en-US,en;q=0.5";
        readonly 'Accept-Encoding': "gzip, deflate";
    };
};
export declare const TEST_EXECUTION: {
    readonly MAX_PARALLEL_TESTS: 5;
    readonly DEFAULT_PRIORITY: "medium";
    readonly VALID_PRIORITIES: readonly ["low", "medium", "high", "critical"];
    readonly VALID_STATUSES: readonly ["pending", "running", "passed", "failed", "skipped"];
    readonly MAX_TEST_NAME_LENGTH: 100;
    readonly MAX_TEST_DESCRIPTION_LENGTH: 500;
};
export declare const FILE_SYSTEM: {
    readonly MAX_PATH_LENGTH: 260;
    readonly ALLOWED_EXTENSIONS: readonly [".ts", ".js", ".json", ".html", ".css", ".png", ".jpg", ".jpeg"];
    readonly SCREENSHOT_FORMAT: "png";
    readonly REPORT_FORMAT: "html";
    readonly ENCODING: "utf8";
    readonly BACKUP_RETENTION: 7;
};
export declare const ERROR_HANDLING: {
    readonly MAX_STACK_TRACE_LENGTH: 1000;
    readonly MAX_ERROR_MESSAGE_LENGTH: 500;
    readonly RETRY_BACKOFF_MULTIPLIER: 2;
    readonly INITIAL_RETRY_DELAY: 100;
    readonly MAX_RETRY_DELAY: 5000;
};
export declare const PERFORMANCE: {
    readonly SLOW_OPERATION_THRESHOLD: 1000;
    readonly MEMORY_WARNING_THRESHOLD: number;
    readonly CPU_WARNING_THRESHOLD: 80;
    readonly DISK_WARNING_THRESHOLD: 90;
};
export declare const BROWSER_DEFAULTS: {
    readonly VIEWPORT: {
        readonly WIDTH: 1280;
        readonly HEIGHT: 720;
    };
    readonly TIMEOUT: 30000;
    readonly SLOW_MO: 0;
    readonly HEADLESS: true;
    readonly ARGS: readonly ["--start-maximized", "--disable-dev-shm-usage", "--no-sandbox"];
};
export declare const AI_CONFIG: {
    readonly DEFAULT_MODEL: "gpt-4o";
    readonly DEFAULT_TEMPERATURE: 0.1;
    readonly DEFAULT_MAX_TOKENS: 8000;
    readonly TOKEN_BUFFER: 500;
    readonly ESTIMATION_BUFFER: 0.1;
};
export declare const PATTERNS: {
    readonly EMAIL: RegExp;
    readonly URL: RegExp;
    readonly PHONE: RegExp;
    readonly SELECTOR: RegExp;
    readonly XPATH: RegExp;
};
export type TimeoutKey = keyof typeof TIMEOUTS;
export type LimitKey = keyof typeof LIMITS;
export type SelectorKey = keyof typeof SELECTORS;
export type Priority = (typeof TEST_EXECUTION.VALID_PRIORITIES)[number];
export type TestStatus = (typeof TEST_EXECUTION.VALID_STATUSES)[number];
//# sourceMappingURL=constants.d.ts.map