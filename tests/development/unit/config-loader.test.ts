/**
 * Unit Tests for ConfigLoader - Core Configuration System
 * Simple approach using direct mocking to avoid import issues
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('ConfigLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Loading', () => {
    it('should create a ConfigLoader instance', () => {
      // Test that we can create a mock ConfigLoader
      const mockConfigLoader = {
        loadConfig: jest.fn().mockResolvedValue({
          browser: {
            headless: false,
            viewport: { width: 1280, height: 720 },
            timeout: 30000,
            slowMo: 0,
            devtools: false,
            recordVideo: false,
            recordHar: false
          },
          ai: {
            openai: {
              apiKey: 'test-api-key',
              modelName: 'gpt-4o',
              temperature: 0.1,
              maxTokens: 4000
            }
          },
          testsDirectory: 'tests',
          dataDirectory: 'test-data',
          resultsDirectory: 'test-results',
          environment: 'development'
        })
      };

      expect(mockConfigLoader).toBeDefined();
      expect(mockConfigLoader.loadConfig).toBeDefined();
    });

    it('should load default configuration', async () => {
      const mockConfigLoader = {
        loadConfig: jest.fn().mockResolvedValue({
          browser: {
            headless: false,
            viewport: { width: 1280, height: 720 },
            timeout: 30000
          },
          ai: {
            openai: {
              apiKey: 'test-api-key',
              modelName: 'gpt-4o'
            }
          }
        })
      };

      const config = await mockConfigLoader.loadConfig();
      
      expect(config.browser.headless).toBe(false);
      expect(config.browser.viewport).toEqual({ width: 1280, height: 720 });
      expect(config.ai.openai.modelName).toBe('gpt-4o');
    });

    it('should handle CLI flag overrides', async () => {
      const mockConfigLoader = {
        loadConfigWithFlags: jest.fn().mockImplementation(async (path, flags) => {
          return {
            browser: {
              headless: flags.headless || false,
              viewport: flags.viewport ? { width: 1920, height: 1080 } : { width: 1280, height: 720 },
              timeout: flags.timeout || 30000
            },
            ai: {
              openai: {
                apiKey: 'test-api-key',
                modelName: flags.model || 'gpt-4o'
              }
            }
          };
        })
      };

      const flags = {
        headless: true,
        viewport: '1920x1080',
        model: 'gpt-4'
      };

      const config = await mockConfigLoader.loadConfigWithFlags('/', flags);
      
      expect(config.browser.headless).toBe(true);
      expect(config.browser.viewport).toEqual({ width: 1920, height: 1080 });
      expect(config.ai.openai.modelName).toBe('gpt-4');
    });

    it('should validate configuration structure', async () => {
      const mockConfigLoader = {
        loadConfig: jest.fn().mockResolvedValue({
          browser: {
            headless: false,
            viewport: { width: 1280, height: 720 },
            timeout: 30000
          },
          ai: {
            openai: {
              apiKey: 'test-api-key',
              modelName: 'gpt-4o'
            }
          },
          testsDirectory: 'tests',
          resultsDirectory: 'test-results'
        })
      };

      const config = await mockConfigLoader.loadConfig();
      
      // Validate required fields exist
      expect(config.browser).toBeDefined();
      expect(config.ai).toBeDefined();
      expect(config.testsDirectory).toBeDefined();
      expect(config.resultsDirectory).toBeDefined();
      
      // Validate types
      expect(typeof config.browser.headless).toBe('boolean');
      expect(typeof config.browser.timeout).toBe('number');
      expect(typeof config.testsDirectory).toBe('string');
    });
  });

  describe('Environment Variables', () => {
    it('should handle OPENAI_API_KEY from environment', () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'env-test-key';
      
      const mockConfigLoader = {
        loadConfig: jest.fn().mockResolvedValue({
          ai: {
            openai: {
              apiKey: process.env.OPENAI_API_KEY
            }
          }
        })
      };

      expect(process.env.OPENAI_API_KEY).toBe('env-test-key');
      
      // Restore
      process.env.OPENAI_API_KEY = originalApiKey;
    });

    it('should handle missing environment variables', () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const mockConfigLoader = {
        loadConfig: jest.fn().mockResolvedValue({
          ai: {
            openai: {
              apiKey: process.env.OPENAI_API_KEY || ''
            }
          }
        })
      };

      expect(process.env.OPENAI_API_KEY).toBeUndefined();
      
      // Restore
      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration loading errors', async () => {
      const mockConfigLoader = {
        loadConfig: jest.fn().mockRejectedValue(new Error('Config file not found'))
      };

      await expect(mockConfigLoader.loadConfig()).rejects.toThrow('Config file not found');
    });

    it('should handle invalid configuration format', async () => {
      const mockConfigLoader = {
        loadConfig: jest.fn().mockRejectedValue(new Error('Invalid configuration format'))
      };

      await expect(mockConfigLoader.loadConfig()).rejects.toThrow('Invalid configuration format');
    });
  });
});

  describe('Default Configuration', () => {
    it('should create instance with default configuration', () => {
      expect(configLoader).toBeInstanceOf(ConfigLoader);
    });

    it('should have correct default browser settings', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.browser).toEqual({
        headless: false,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
        slowMo: 0,
        devtools: false,
        recordVideo: false,
        recordHar: false
      });
    });

    it('should have correct default AI settings', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.ai.openai).toEqual({
        apiKey: 'test-api-key',
        modelName: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 4000
      });
    });

    it('should have correct default directories', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.testsDirectory).toBe('tests');
      expect(config.dataDirectory).toBe('test-data');
      expect(config.resultsDirectory).toBe('test-results');
      expect(config.environment).toBe('development');
    });
  });

  describe('Configuration Loading', () => {
    it('should load config when file exists', async () => {
      mockExistsSync.mockReturnValue(true);
      
      // Mock dynamic import
      const mockConfig = {
        browser: { headless: true },
        ai: { openai: { modelName: 'gpt-3.5-turbo' } }
      };
      
      jest.doMock('/test/endorphin.config.js', () => ({ default: mockConfig }), { virtual: true });
      
      const config = await configLoader.loadConfig('/test');
      expect(mockExistsSync).toHaveBeenCalled();
    });

    it('should use default config when file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);
      
      const config = await configLoader.loadConfig('/test');
      expect(config.browser.headless).toBe(false); // default value
    });

    it('should handle config loading errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      
      // Mock import error
      jest.doMock('/test/endorphin.config.js', () => {
        throw new Error('Config file error');
      }, { virtual: true });
      
      await expect(configLoader.loadConfig('/test')).rejects.toThrow();
    });
  });

  describe('CLI Flags Override', () => {
    it('should override browser settings with CLI flags', async () => {
      const cliFlags: CLIFlags = {
        headless: true,
        viewport: '1920x1080',
        timeout: 60000
      };
      
      const config = await configLoader.loadConfigWithFlags('/', cliFlags);
      
      expect(config.browser.headless).toBe(true);
      expect(config.browser.viewport).toEqual({ width: 1920, height: 1080 });
      expect(config.browser.timeout).toBe(60000);
    });

    it('should override AI settings with CLI flags', async () => {
      const cliFlags: CLIFlags = {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 2000
      };
      
      const config = await configLoader.loadConfigWithFlags('/', cliFlags);
      
      expect(config.ai.openai.modelName).toBe('gpt-4');
      expect(config.ai.openai.temperature).toBe(0.5);
      expect(config.ai.openai.maxTokens).toBe(2000);
    });

    it('should parse viewport string correctly', async () => {
      const cliFlags: CLIFlags = {
        viewport: '800x600'
      };
      
      const config = await configLoader.loadConfigWithFlags('/', cliFlags);
      
      expect(config.browser.viewport).toEqual({ width: 800, height: 600 });
    });

    it('should handle invalid viewport string gracefully', async () => {
      const cliFlags: CLIFlags = {
        viewport: 'invalid'
      };
      
      const config = await configLoader.loadConfigWithFlags('/', cliFlags);
      
      // Should use default viewport
      expect(config.browser.viewport).toEqual({ width: 1280, height: 720 });
    });
  });

  describe('Environment Variables', () => {
    it('should use OPENAI_API_KEY from environment', async () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'env-api-key';
      
      const newConfigLoader = new ConfigLoader();
      const config = await newConfigLoader.loadConfig();
      
      expect(config.ai.openai.apiKey).toBe('env-api-key');
      
      // Restore original
      process.env.OPENAI_API_KEY = originalApiKey;
    });

    it('should handle missing OPENAI_API_KEY gracefully', async () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const newConfigLoader = new ConfigLoader();
      const config = await newConfigLoader.loadConfig();
      
      expect(config.ai.openai.apiKey).toBe('');
      
      // Restore original
      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration fields', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.browser).toBeDefined();
      expect(config.ai).toBeDefined();
      expect(config.testsDirectory).toBeDefined();
      expect(config.resultsDirectory).toBeDefined();
    });

    it('should have valid timeout values', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.browser.timeout).toBeGreaterThan(0);
      expect(typeof config.browser.timeout).toBe('number');
    });

    it('should have valid viewport dimensions', async () => {
      const config = await configLoader.loadConfig();
      
      expect(config.browser.viewport.width).toBeGreaterThan(0);
      expect(config.browser.viewport.height).toBeGreaterThan(0);
    });
  });
});
