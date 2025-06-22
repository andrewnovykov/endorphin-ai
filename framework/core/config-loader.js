// Configuration loader for Endorphin AI
// Handles loading and merging of configuration from multiple sources

import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { pathToFileURL } from 'url';

export class ConfigLoader {
  constructor() {
    this.defaultConfig = {
      // Browser Configuration
      browser: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
        slowMo: 0,
        deviceScaleFactor: 1,
      },

      // AI Configuration  
      ai: {
        model: "gpt-4o",
        maxRetries: 3,
        temperature: 0.1,
        maxTokens: 4000,
      },

      // Test Execution Settings
      execution: {
        screenshots: true,
        recordVideo: false,
        pauseOnError: false,
        continueOnError: false,
        maxConcurrency: 1,
      },

      // Global Test Data
      testData: {
        baseUrl: "https://example.com",
        timeout: 5000,
        retryCount: 2,
      },

      // Result Storage
      results: {
        directory: "./test-results",
        keepHistory: 10,
        format: ["json", "html"],
      },

      // Environment Settings
      environments: {
        development: {
          baseUrl: "http://localhost:3000",
          headless: false,
        },
        staging: {
          baseUrl: "https://staging.example.com",
          headless: true,
        },
        production: {
          baseUrl: "https://example.com",
          headless: true,
          screenshots: false,
        }
      }
    };
  }

  /**
   * Load configuration from all sources and merge them
   * Priority: CLI flags > User config > Environment > Defaults
   */
  async loadConfig(options = {}) {
    let config = { ...this.defaultConfig };

    // 1. Load user config file if it exists
    const userConfig = await this.loadUserConfig();
    if (userConfig) {
      config = this.mergeConfig(config, userConfig);
    }

    // 2. Apply environment variables
    const envConfig = this.loadEnvironmentConfig();
    config = this.mergeConfig(config, envConfig);

    // 3. Apply CLI options (highest priority)
    if (options) {
      // Transform CLI flags to proper config structure
      const transformedOptions = this.transformCliFlags(options);
      config = this.mergeConfig(config, transformedOptions);
    }

    // 4. Apply environment-specific overrides
    const environment = process.env.NODE_ENV || 'development';
    if (config.environments && config.environments[environment]) {
      config = this.mergeConfig(config, config.environments[environment]);
    }

    return config;
  }

  /**
   * Load user's endorphin.config.js file
   */
  async loadUserConfig() {
    const configPaths = [
      resolve(process.cwd(), 'endorphin.config.js'),
      resolve(process.cwd(), 'endorphin.config.mjs'),
      resolve(process.cwd(), '.endorphin.config.js'),
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const configUrl = pathToFileURL(configPath).href;
          const module = await import(`${configUrl}?t=${Date.now()}`);
          const config = module.default || module;
          
          console.log(`📁 Loaded config from: ${configPath}`);
          return config;
        } catch (error) {
          console.warn(`⚠️ Failed to load config from ${configPath}:`, error.message);
        }
      }
    }

    return null;
  }

  /**
   * Load configuration from environment variables
   */
  loadEnvironmentConfig() {
    const envConfig = {};

    // Browser settings
    if (process.env.ENDORPHIN_HEADLESS !== undefined) {
      envConfig.browser = { headless: process.env.ENDORPHIN_HEADLESS === 'true' };
    }

    if (process.env.ENDORPHIN_VIEWPORT_WIDTH || process.env.ENDORPHIN_VIEWPORT_HEIGHT) {
      envConfig.browser = envConfig.browser || {};
      envConfig.browser.viewport = {
        width: parseInt(process.env.ENDORPHIN_VIEWPORT_WIDTH) || 1280,
        height: parseInt(process.env.ENDORPHIN_VIEWPORT_HEIGHT) || 720,
      };
    }

    // AI settings
    if (process.env.ENDORPHIN_AI_MODEL) {
      envConfig.ai = { model: process.env.ENDORPHIN_AI_MODEL };
    }

    if (process.env.ENDORPHIN_AI_TEMPERATURE) {
      envConfig.ai = envConfig.ai || {};
      envConfig.ai.temperature = parseFloat(process.env.ENDORPHIN_AI_TEMPERATURE);
    }

    // Test data
    if (process.env.ENDORPHIN_BASE_URL) {
      envConfig.testData = { baseUrl: process.env.ENDORPHIN_BASE_URL };
    }

    return envConfig;
  }

  /**
   * Transform CLI flags to proper config structure
   */
  transformCliFlags(options) {
    const result = { ...options };
    
    // Extract cliFlags if present
    if (options.cliFlags) {
      const { cliFlags, ...otherOptions } = options;
      
      // Map CLI flags to config structure
      const configFromFlags = {};
      
      if (cliFlags.headless !== undefined) {
        configFromFlags.browser = { ...configFromFlags.browser, headless: cliFlags.headless };
      }
      
      if (cliFlags.timeout !== undefined) {
        configFromFlags.execution = { ...configFromFlags.execution, timeout: cliFlags.timeout };
      }
      
      if (cliFlags.viewport !== undefined) {
        configFromFlags.browser = { 
          ...configFromFlags.browser, 
          viewport: cliFlags.viewport 
        };
      }
      
      if (cliFlags.parallel !== undefined) {
        configFromFlags.execution = { 
          ...configFromFlags.execution, 
          parallel: cliFlags.parallel 
        };
      }
      
      if (cliFlags.model !== undefined) {
        configFromFlags.ai = { ...configFromFlags.ai, model: cliFlags.model };
      }
      
      if (cliFlags.environment !== undefined) {
        configFromFlags.environment = cliFlags.environment;
      }
      
      // Merge transformed flags with other options
      return this.mergeConfig(otherOptions, configFromFlags);
    }
    
    return result;
  }

  /**
   * Deep merge two configuration objects
   */
  mergeConfig(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];

    // Validate browser config
    if (config.browser) {
      if (config.browser.viewport) {
        if (!config.browser.viewport.width || !config.browser.viewport.height) {
          errors.push('Browser viewport must have width and height');
        }
      }
    }

    // Validate AI config
    if (config.ai) {
      if (config.ai.temperature !== undefined) {
        if (config.ai.temperature < 0 || config.ai.temperature > 1) {
          errors.push('AI temperature must be between 0 and 1');
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  /**
   * Get configuration value by path (e.g., 'browser.viewport.width')
   */
  getConfigValue(config, path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], config);
  }

  /**
   * Set configuration value by path
   */
  setConfigValue(config, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, config);
    
    target[lastKey] = value;
    return config;
  }
}

// Global config instance
let configInstance = null;

/**
 * Get the global configuration instance
 */
export async function getConfig(options = {}) {
  if (!configInstance) {
    const loader = new ConfigLoader();
    configInstance = await loader.loadConfig(options);
    loader.validateConfig(configInstance);
  }
  return configInstance;
}

/**
 * Reset the global configuration (useful for testing)
 */
export function resetConfig() {
  configInstance = null;
}
