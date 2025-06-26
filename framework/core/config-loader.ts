/**
 * Configuration loader for Endorphin AI
 * Handles loading and merging of configuration from multiple sources
 */

import type {
  AIConfig,
  BrowserConfig,
  CLIFlags,
  FrameworkConfig
} from '@/types/index';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

export class ConfigLoader {
  private defaultConfig: FrameworkConfig;

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
      } as BrowserConfig,

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
      } as AIConfig,

      // Test Execution Settings
      testsDirectory: 'tests',
      dataDirectory: 'test-data',
      resultsDirectory: 'test-results',
      environment: 'development' as const,
      parallel: 1,
      maxRetries: 3,
      baseUrl: undefined,
    };
  }

  /**
   * Get the default configuration
   */
  getDefaultConfig(): FrameworkConfig {
    return JSON.parse(JSON.stringify(this.defaultConfig));
  }

  /**
   * Load user configuration from file
   */
  async loadUserConfig(configPath?: string): Promise<Partial<FrameworkConfig>> {
    const possiblePaths = [
      configPath,
      resolve(process.cwd(), 'endorphin.config.js'),
      resolve(process.cwd(), 'endorphin.config.mjs'),
      resolve(process.cwd(), 'endorphin.config.ts'),
    ].filter(Boolean) as string[];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        try {
          const configUrl = pathToFileURL(path).href;
          const module = await import(configUrl);
          return module.default || module;
        } catch (error) {
          console.warn(`⚠️ Failed to load config from ${path}:`, error);
        }
      }
    }

    return {};
  }

  /**
   * Load configuration from environment variables
   */
  loadEnvConfig(): Partial<FrameworkConfig> {
    const envConfig: any = {};

    // Browser settings
    if (process.env.ENDORPHIN_HEADLESS) {
      if (!envConfig.browser) envConfig.browser = {};
      envConfig.browser.headless = process.env.ENDORPHIN_HEADLESS === 'true';
    }

    if (process.env.ENDORPHIN_VIEWPORT) {
      const [width, height] = process.env.ENDORPHIN_VIEWPORT.split('x').map(Number);
      if (!isNaN(width) && !isNaN(height)) {
        if (!envConfig.browser) envConfig.browser = {};
        envConfig.browser.viewport = { width, height };
      }
    }

    if (process.env.ENDORPHIN_TIMEOUT) {
      const timeout = parseInt(process.env.ENDORPHIN_TIMEOUT, 10);
      if (!isNaN(timeout)) {
        if (!envConfig.browser) envConfig.browser = {};
        envConfig.browser.timeout = timeout;
      }
    }

    // AI settings
    if (process.env.OPENAI_API_KEY) {
      if (!envConfig.ai) envConfig.ai = {};
      if (!envConfig.ai.openai) envConfig.ai.openai = {};
      envConfig.ai.openai.apiKey = process.env.OPENAI_API_KEY;
    }

    if (process.env.ENDORPHIN_MODEL) {
      if (!envConfig.ai) envConfig.ai = {};
      if (!envConfig.ai.openai) envConfig.ai.openai = {};
      envConfig.ai.openai.modelName = process.env.ENDORPHIN_MODEL;
    }

    if (process.env.ENDORPHIN_TEMPERATURE) {
      const temperature = parseFloat(process.env.ENDORPHIN_TEMPERATURE);
      if (!isNaN(temperature)) {
        if (!envConfig.ai) envConfig.ai = {};
        if (!envConfig.ai.openai) envConfig.ai.openai = {};
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
  mergeConfigs(
    defaultConfig: FrameworkConfig,
    envConfig: Partial<FrameworkConfig>,
    userConfig: Partial<FrameworkConfig>,
    cliFlags: CLIFlags = {}
  ): FrameworkConfig {
    // Deep merge helper
    const deepMerge = (target: any, source: any): any => {
      const result = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
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
      config.environment = cliFlags.environment as any;
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
  validateConfig(config: FrameworkConfig): void {
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

    // Validate OpenAI API key
    if (!config.ai.openai.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or provide in config.');
    }
  }

  /**
   * Get configuration value by path (e.g., 'browser.headless')
   */
  getConfigValue(config: FrameworkConfig, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], config);
  }

  /**
   * Set configuration value by path
   */
  setConfigValue(config: FrameworkConfig, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, config as any);
    target[lastKey] = value;
  }
}

// Global config instance
let globalConfig: FrameworkConfig | null = null;
const configLoader = new ConfigLoader();

/**
 * Get configuration with optional overrides
 */
export async function getConfig(options: {
  cwd?: string;
  configPath?: string;
  cliFlags?: CLIFlags;
} = {}): Promise<FrameworkConfig> {
  const { cwd = process.cwd(), configPath, cliFlags = {} } = options;

  // Change to specified directory temporarily
  const originalCwd = process.cwd();
  if (cwd !== originalCwd) {
    process.chdir(cwd);
  }

  try {
    const defaultConfig = configLoader.getDefaultConfig();
    const envConfig = configLoader.loadEnvConfig();
    const userConfig = await configLoader.loadUserConfig(configPath);

    const mergedConfig = configLoader.mergeConfigs(
      defaultConfig,
      envConfig,
      userConfig,
      cliFlags
    );

    configLoader.validateConfig(mergedConfig);

    globalConfig = mergedConfig;
    return mergedConfig;
  } finally {
    // Restore original directory
    if (cwd !== originalCwd) {
      process.chdir(originalCwd);
    }
  }
}

/**
 * Get cached global configuration
 */
export function getGlobalConfig(): FrameworkConfig | null {
  return globalConfig;
}

/**
 * Reset global configuration (useful for testing)
 */
export function resetGlobalConfig(): void {
  globalConfig = null;
}
