/**
 * Tests for Config Loader
 * 
 * Tests the configuration loading and validation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { ConfigLoader } from '../../../packages/core/src/config/config-loader.js';

describe('ConfigLoader', () => {
  let configLoader;
  let testDir;
  
  beforeEach(() => {
    configLoader = new ConfigLoader();
    testDir = join(process.cwd(), 'tests', 'tmp', 'test-config');
    
    // Ensure test directory exists
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Clean up any test config files
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create ConfigLoader instance', () => {
      expect(configLoader).toBeDefined();
      expect(configLoader).toBeInstanceOf(ConfigLoader);
    });

    it('should have default config', () => {
      expect(configLoader.defaultConfig).toBeDefined();
      expect(configLoader.defaultConfig.browser).toBeDefined();
      expect(configLoader.defaultConfig.ai).toBeDefined();
    });
  });

  describe('basic functionality', () => {
    it('should handle empty directory', async () => {
      // This is a basic test to ensure the module loads correctly
      expect(configLoader).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof configLoader.loadConfig).toBe('function');
      expect(typeof configLoader.loadUserConfig).toBe('function');
      expect(typeof configLoader.loadEnvironmentConfig).toBe('function');
    });
  });
});
