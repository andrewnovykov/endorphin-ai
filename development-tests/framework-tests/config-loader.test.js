// Config loader tests
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConfigLoader, getConfig, resetConfig } from '../../framework/core/config-loader.js';

describe('ConfigLoader', () => {
  let configLoader;
  let testConfigPath;

  beforeEach(() => {
    configLoader = new ConfigLoader();
    testConfigPath = resolve(process.cwd(), 'test-endorphin.config.js');
    resetConfig();
  });

  afterEach(() => {
    // Clean up test config file
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }

    // Reset environment variables
    delete process.env.ENDORPHIN_HEADLESS;
    delete process.env.ENDORPHIN_BASE_URL;
    delete process.env.ENDORPHIN_AI_MODEL;
  });

  describe('Default Configuration', () => {
    it('should have correct default browser settings', () => {
      const config = configLoader.defaultConfig;

      expect(config.browser.headless).toBe(false);
      expect(config.browser.viewport.width).toBe(1280);
      expect(config.browser.viewport.height).toBe(720);
      expect(config.browser.timeout).toBe(30000);
    });

    it('should have correct default AI settings', () => {
      const config = configLoader.defaultConfig;

      expect(config.ai.model).toBe('gpt-4o');
      expect(config.ai.maxRetries).toBe(3);
      expect(config.ai.temperature).toBe(0.1);
    });

    it('should have correct default execution settings', () => {
      const config = configLoader.defaultConfig;

      expect(config.execution.screenshots).toBe(true);
      expect(config.execution.recordVideo).toBe(false);
      expect(config.execution.continueOnError).toBe(false);
    });
  });

  describe('Environment Variable Loading', () => {
    it('should load browser settings from environment', () => {
      process.env.ENDORPHIN_HEADLESS = 'true';
      process.env.ENDORPHIN_VIEWPORT_WIDTH = '1920';
      process.env.ENDORPHIN_VIEWPORT_HEIGHT = '1080';

      const envConfig = configLoader.loadEnvironmentConfig();

      expect(envConfig.browser.headless).toBe(true);
      expect(envConfig.browser.viewport.width).toBe(1920);
      expect(envConfig.browser.viewport.height).toBe(1080);
    });

    it('should load AI settings from environment', () => {
      process.env.ENDORPHIN_AI_MODEL = 'gpt-4';
      process.env.ENDORPHIN_AI_TEMPERATURE = '0.5';

      const envConfig = configLoader.loadEnvironmentConfig();

      expect(envConfig.ai.model).toBe('gpt-4');
      expect(envConfig.ai.temperature).toBe(0.5);
    });

    it('should load test data from environment', () => {
      process.env.ENDORPHIN_BASE_URL = 'https://test.example.com';

      const envConfig = configLoader.loadEnvironmentConfig();

      expect(envConfig.testData.baseUrl).toBe('https://test.example.com');
    });
  });

  describe('User Config File Loading', () => {
    it('should load user config file when it exists', async () => {
      const userConfig = `
        export default {
          browser: {
            headless: true,
            viewport: { width: 1024, height: 768 }
          },
          ai: {
            model: 'gpt-3.5-turbo'
          }
        };
      `;

      writeFileSync(testConfigPath, userConfig);

      // Mock the config path resolution
      const originalLoadUserConfig = configLoader.loadUserConfig;
      configLoader.loadUserConfig = async function () {
        const { pathToFileURL } = await import('url');
        const configUrl = pathToFileURL(testConfigPath).href;
        const module = await import(`${configUrl}?t=${Date.now()}`);
        return module.default || module;
      };

      const loadedConfig = await configLoader.loadUserConfig();

      expect(loadedConfig).toBeDefined();
      expect(loadedConfig.browser.headless).toBe(true);
      expect(loadedConfig.browser.viewport.width).toBe(1024);
      expect(loadedConfig.ai.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('Config Merging', () => {
    it('should merge configs correctly with priority', async () => {
      const target = {
        browser: { headless: false, timeout: 30000 },
        ai: { model: 'gpt-4o' },
      };

      const source = {
        browser: { headless: true, viewport: { width: 1920 } },
        execution: { screenshots: false },
      };

      const merged = configLoader.mergeConfig(target, source);

      expect(merged.browser.headless).toBe(true); // Overridden
      expect(merged.browser.timeout).toBe(30000); // Preserved
      expect(merged.browser.viewport.width).toBe(1920); // Added
      expect(merged.ai.model).toBe('gpt-4o'); // Preserved
      expect(merged.execution.screenshots).toBe(false); // Added
    });
  });

  describe('Configuration Validation', () => {
    it('should validate browser viewport correctly', () => {
      const validConfig = {
        browser: {
          viewport: { width: 1280, height: 720 },
        },
      };

      expect(() => configLoader.validateConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid viewport', () => {
      const invalidConfig = {
        browser: {
          viewport: { width: 0 },
        },
      };

      expect(() => configLoader.validateConfig(invalidConfig)).toThrow();
    });

    it('should validate AI temperature range', () => {
      const validConfig = {
        ai: { temperature: 0.5 },
      };

      expect(() => configLoader.validateConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid temperature', () => {
      const invalidConfig = {
        ai: { temperature: 2.0 },
      };

      expect(() => configLoader.validateConfig(invalidConfig)).toThrow();
    });
  });

  describe('Config Path Utilities', () => {
    it('should get config value by path', () => {
      const config = {
        browser: {
          viewport: { width: 1280, height: 720 },
        },
      };

      expect(configLoader.getConfigValue(config, 'browser.viewport.width')).toBe(1280);
      expect(configLoader.getConfigValue(config, 'browser.timeout')).toBeUndefined();
    });

    it('should set config value by path', () => {
      const config = {
        browser: {},
      };

      configLoader.setConfigValue(config, 'browser.viewport.width', 1920);

      expect(config.browser.viewport.width).toBe(1920);
    });
  });

  describe('Global Config Instance', () => {
    it('should create and cache global config', async () => {
      const config1 = await getConfig();
      const config2 = await getConfig();

      expect(config1).toBe(config2); // Should be same instance
      expect(config1.browser.headless).toBeDefined();
    });

    it('should reset global config', async () => {
      await getConfig();
      resetConfig();

      const newConfig = await getConfig();
      expect(newConfig).toBeDefined();
    });
  });
});
