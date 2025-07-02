/**
 * Configuration loader for Endorphin AI
 * Handles loading and merging of configuration from multiple sources
 */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
export class ConfigLoader {
    defaultConfig;
    constructor() {
        this.defaultConfig = {
            // Browser Configuration
            browser: {
                headless: false,
                viewport: { width: 1280, height: 720 },
                timeout: 30000,
                slowMo: 0,
                devtools: false,
                recordVideo: false,
                recordHar: false,
            },
            // AI Configuration
            ai: {
                openai: {
                    apiKey: process.env.OPENAI_API_KEY || '',
                    modelName: 'gpt-4o',
                    temperature: 0.1,
                    maxTokens: 4000,
                },
                agent: {
                    recursionLimit: 10,
                    stopPhrases: ['test completed', 'task finished', 'done'],
                },
            },
            // Test Execution Settings
            testsDirectory: 'tests',
            dataDirectory: 'test-data',
            resultsDirectory: 'test-results',
            environment: 'development',
            parallel: 1,
            maxRetries: 3,
            baseUrl: '',
            // Custom Tools
            customTools: [],
        };
    }
    /**
     * Get the default configuration
     */
    getDefaultConfig() {
        return JSON.parse(JSON.stringify(this.defaultConfig));
    }
    /**
     * Load user configuration from file
     */
    async loadUserConfig(configPath) {
        const possiblePaths = [
            configPath,
            resolve(process.cwd(), 'endorphin.config.js'),
            resolve(process.cwd(), 'endorphin.config.mjs'),
            resolve(process.cwd(), 'endorphin.config.ts'),
        ].filter(Boolean);
        for (const path of possiblePaths) {
            if (existsSync(path)) {
                try {
                    // Handle TypeScript files
                    if (path.endsWith('.ts')) {
                        return await this.loadTypeScriptConfig(path);
                    }
                    else {
                        // Handle JavaScript files
                        const configUrl = pathToFileURL(path).href;
                        const module = await import(configUrl);
                        return module.default || module;
                    }
                }
                catch (error) {
                    console.warn(`⚠️ Failed to load config from ${path}:`, error);
                }
            }
        }
        return {};
    }
    /**
     * Load TypeScript config file using tsx or fallback
     */
    async loadTypeScriptConfig(filePath) {
        try {
            // Try to register tsx loader if not already registered
            if (typeof globalThis.__tsx_registered === 'undefined') {
                try {
                    // Try to dynamically import tsx
                    const { register } = await import('tsx/esm/api');
                    register();
                    globalThis.__tsx_registered = true;
                }
                catch {
                    // If tsx is not available, fallback to JavaScript file
                    console.warn(`⚠️ TypeScript config loader not available, looking for JavaScript version`);
                    const jsConfigPath = filePath.replace('.ts', '.js');
                    if (existsSync(jsConfigPath)) {
                        const configUrl = pathToFileURL(jsConfigPath).href;
                        const module = await import(configUrl);
                        return module.default || module;
                    }
                    else {
                        throw new Error(`TypeScript config ${filePath} found but tsx loader not available and no JavaScript version exists`);
                    }
                }
            }
            // Load TypeScript file using tsx
            const configUrl = pathToFileURL(filePath).href;
            const module = await import(`${configUrl}?t=${Date.now()}`);
            return module.default || module;
        }
        catch (error) {
            console.error(`Failed to load TypeScript config ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Load configuration from environment variables
     */
    loadEnvConfig() {
        const envConfig = {};
        // Browser settings
        if (process.env.ENDORPHIN_HEADLESS) {
            if (!envConfig.browser)
                envConfig.browser = {};
            envConfig.browser.headless = process.env.ENDORPHIN_HEADLESS === 'true';
        }
        if (process.env.ENDORPHIN_VIEWPORT) {
            const [width, height] = process.env.ENDORPHIN_VIEWPORT.split('x').map(Number);
            if (!isNaN(width) && !isNaN(height)) {
                if (!envConfig.browser)
                    envConfig.browser = {};
                envConfig.browser.viewport = { width, height };
            }
        }
        if (process.env.ENDORPHIN_TIMEOUT) {
            const timeout = parseInt(process.env.ENDORPHIN_TIMEOUT, 10);
            if (!isNaN(timeout)) {
                if (!envConfig.browser)
                    envConfig.browser = {};
                envConfig.browser.timeout = timeout;
            }
        }
        // AI settings
        if (process.env.OPENAI_API_KEY) {
            if (!envConfig.ai)
                envConfig.ai = {};
            if (!envConfig.ai.openai)
                envConfig.ai.openai = {};
            envConfig.ai.openai.apiKey = process.env.OPENAI_API_KEY;
        }
        if (process.env.ENDORPHIN_MODEL) {
            if (!envConfig.ai)
                envConfig.ai = {};
            if (!envConfig.ai.openai)
                envConfig.ai.openai = {};
            envConfig.ai.openai.modelName = process.env.ENDORPHIN_MODEL;
        }
        if (process.env.ENDORPHIN_TEMPERATURE) {
            const temperature = parseFloat(process.env.ENDORPHIN_TEMPERATURE);
            if (!isNaN(temperature)) {
                if (!envConfig.ai)
                    envConfig.ai = {};
                if (!envConfig.ai.openai)
                    envConfig.ai.openai = {};
                envConfig.ai.openai.temperature = temperature;
            }
        }
        // Test execution settings
        if (process.env.ENDORPHIN_ENVIRONMENT) {
            envConfig.environment = process.env.ENDORPHIN_ENVIRONMENT;
        }
        if (process.env.ENDORPHIN_PARALLEL) {
            const parallel = parseInt(process.env.ENDORPHIN_PARALLEL, 10);
            if (!isNaN(parallel)) {
                envConfig.parallel = parallel;
            }
        }
        if (process.env.ENDORPHIN_BASE_URL) {
            envConfig.baseUrl = process.env.ENDORPHIN_BASE_URL;
        }
        return envConfig;
    }
    /**
     * Merge configurations with priority: CLI > User Config > Environment > Default
     */
    mergeConfigs(defaultConfig, envConfig, userConfig, cliFlags = {}) {
        // Deep merge helper
        const deepMerge = (target, source) => {
            const result = { ...target };
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = deepMerge(target[key] || {}, source[key]);
                }
                else {
                    result[key] = source[key];
                }
            }
            return result;
        };
        let config = deepMerge(defaultConfig, envConfig);
        config = deepMerge(config, userConfig);
        // Apply CLI flags (highest priority)
        if (cliFlags.headless !== undefined) {
            config.browser.headless = cliFlags.headless;
        }
        if (cliFlags.viewport) {
            config.browser.viewport = cliFlags.viewport;
        }
        if (cliFlags.timeout !== undefined) {
            config.browser.timeout = cliFlags.timeout;
        }
        if (cliFlags.parallel !== undefined) {
            config.parallel = cliFlags.parallel;
        }
        if (cliFlags.model) {
            config.ai.openai.modelName = cliFlags.model;
        }
        if (cliFlags.environment) {
            config.environment = cliFlags.environment;
        }
        if (cliFlags.baseUrl) {
            config.baseUrl = cliFlags.baseUrl;
        }
        if (cliFlags.temperature !== undefined) {
            config.ai.openai.temperature = cliFlags.temperature;
        }
        if (cliFlags.maxRetries !== undefined) {
            config.maxRetries = cliFlags.maxRetries;
        }
        if (cliFlags.testsDirectory) {
            config.testsDirectory = cliFlags.testsDirectory;
        }
        if (cliFlags.dataDirectory) {
            config.dataDirectory = cliFlags.dataDirectory;
        }
        return config;
    }
    /**
     * Validate configuration
     */
    validateConfig(config, validateAI = true) {
        // Validate browser viewport
        if (!config.browser.viewport.width || !config.browser.viewport.height) {
            throw new Error('Invalid viewport configuration: width and height must be positive numbers');
        }
        // Validate AI temperature
        if (config.ai.openai.temperature < 0 || config.ai.openai.temperature > 2) {
            throw new Error('Invalid AI temperature: must be between 0 and 2');
        }
        // Validate timeout
        if (config.browser.timeout <= 0) {
            throw new Error('Invalid timeout: must be positive number');
        }
        // Validate parallel execution
        if (config.parallel <= 0) {
            throw new Error('Invalid parallel setting: must be positive number');
        }
        // Validate OpenAI API key only if AI validation is required
        if (validateAI && !config.ai.openai.apiKey) {
            throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or provide in config.');
        }
        // Validate customTools
        if (config.customTools && !Array.isArray(config.customTools)) {
            throw new Error('Invalid customTools: must be an array of paths');
        }
        if (config.customTools) {
            for (const toolPath of config.customTools) {
                if (typeof toolPath !== 'string') {
                    throw new Error('Invalid customTools: each path must be a string');
                }
            }
        }
    }
    /**
     * Get configuration value by path (e.g., 'browser.headless')
     */
    getConfigValue(config, path) {
        return path.split('.').reduce((obj, key) => obj?.[key], config);
    }
    /**
     * Set configuration value by path
     */
    setConfigValue(config, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key])
                obj[key] = {};
            return obj[key];
        }, config);
        target[lastKey] = value;
    }
}
// Global config instance
let globalConfig = null;
const configLoader = new ConfigLoader();
/**
 * Get configuration with optional overrides
 */
export async function getConfig(options = {}) {
    const { cwd = process.cwd(), configPath, cliFlags = {}, validateAI = true } = options;
    // Change to specified directory temporarily
    const originalCwd = process.cwd();
    if (cwd !== originalCwd) {
        process.chdir(cwd);
    }
    try {
        // Load .env file if it exists
        const envPath = resolve(process.cwd(), '.env');
        if (existsSync(envPath)) {
            loadDotenv({ path: envPath });
        }
        const defaultConfig = configLoader.getDefaultConfig();
        const envConfig = configLoader.loadEnvConfig();
        const userConfig = await configLoader.loadUserConfig(configPath);
        const mergedConfig = configLoader.mergeConfigs(defaultConfig, envConfig, userConfig, cliFlags);
        configLoader.validateConfig(mergedConfig, validateAI);
        globalConfig = mergedConfig;
        return mergedConfig;
    }
    finally {
        // Restore original directory
        if (cwd !== originalCwd) {
            process.chdir(originalCwd);
        }
    }
}
/**
 * Get cached global configuration
 */
export function getGlobalConfig() {
    return globalConfig;
}
/**
 * Reset global configuration (useful for testing)
 */
export function resetGlobalConfig() {
    globalConfig = null;
}
//# sourceMappingURL=config-loader.js.map