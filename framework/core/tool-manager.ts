/**
 * Tool Manager
 * Handles tool setup, loading, and management
 */

import type { FrameworkConfig, LangChainTool } from '../types/index.js';
import { createAllTools } from '../automation/tools/index.js';
import { CustomToolDiscovery } from './custom-tool-discovery.js';
import { globalLogger } from './logger.js';

export class ToolManager {
  private toolsArray: LangChainTool[] = [];
  private customToolDiscovery: CustomToolDiscovery | null = null;
  private config: FrameworkConfig;
  private logger = globalLogger.createChild('ToolManager');

  constructor(config: FrameworkConfig) {
    this.config = config;
  }

  /**
   * Setup and load all tools (built-in + custom)
   */
  async setupTools(framework: any): Promise<LangChainTool[]> {
    this.logger.info('Setting up tools');

    try {
      // Load built-in tools
      await this.loadBuiltInTools(framework);

      // Load custom tools if configured
      await this.loadCustomTools(framework);

      this.logger.info(`Tools setup completed: ${this.toolsArray.length} tools loaded`);

      return this.getTools();
    } catch (error: any) {
      this.logger.error('Failed to setup tools', error);
      throw error;
    }
  }

  /**
   * Get all loaded tools
   */
  getTools(): LangChainTool[] {
    return [...this.toolsArray];
  }

  /**
   * Get tool by name
   */
  getToolByName(name: string): LangChainTool | undefined {
    return this.toolsArray.find((tool) => tool.name === name);
  }

  /**
   * Get tools by category/type
   */
  getToolsByType(type: string): LangChainTool[] {
    return this.toolsArray.filter((tool) => {
      // This could be enhanced with tool metadata
      return tool.name.toLowerCase().includes(type.toLowerCase());
    });
  }

  /**
   * Check if tool exists
   */
  hasTool(name: string): boolean {
    return this.toolsArray.some((tool) => tool.name === name);
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.toolsArray.length;
  }

  /**
   * Get tool statistics
   */
  getToolStats() {
    const builtInCount =
      this.toolsArray.length - (this.customToolDiscovery?.getLoadedTools().length || 0);
    const customCount = this.customToolDiscovery?.getLoadedTools().length || 0;

    return {
      total: this.toolsArray.length,
      builtIn: builtInCount,
      custom: customCount,
      toolNames: this.toolsArray.map((tool) => tool.name),
    };
  }

  /**
   * Get custom tool discovery instance
   */
  getCustomToolDiscovery(): CustomToolDiscovery | null {
    return this.customToolDiscovery;
  }

  /**
   * Load built-in tools
   */
  private async loadBuiltInTools(framework: any): Promise<void> {
    this.logger.debug('Loading built-in tools');

    try {
      const builtInTools = await createAllTools(framework);
      this.toolsArray.push(...builtInTools);

      this.logger.info(`Loaded ${builtInTools.length} built-in tools`, {
        tools: builtInTools.map((tool) => tool.name),
      });
    } catch (error: any) {
      this.logger.error('Failed to load built-in tools', error);
      throw error;
    }
  }

  /**
   * Load custom tools
   */
  private async loadCustomTools(framework: any): Promise<void> {
    if (!this.config.customTools || this.config.customTools.length === 0) {
      this.logger.debug('No custom tools configured');
      return;
    }

    this.logger.debug('Loading custom tools', {
      paths: this.config.customTools,
    });

    try {
      this.customToolDiscovery = new CustomToolDiscovery(this.config, framework);
      const customTools = await this.customToolDiscovery.discoverAndLoadTools();

      if (customTools.length > 0) {
        this.toolsArray.push(...customTools);
        this.logger.info(`Loaded ${customTools.length} custom tools`, {
          tools: customTools.map((tool) => tool.name),
        });
      } else {
        this.logger.warn('No custom tools loaded');
      }

      // Log any errors encountered during custom tool loading
      const loadResult = this.customToolDiscovery.getLoadResult();
      if (loadResult.errors.length > 0) {
        this.logger.warn(`Custom tool loading completed with ${loadResult.errors.length} errors`);
        loadResult.errors.forEach((error) => {
          this.logger.warn(`Custom tool error: ${error.message}`, {
            code: error.code,
            context: error.context,
          });
        });
      }
    } catch (error: any) {
      this.logger.error('Failed to load custom tools', error);
      // Don't throw here - allow framework to continue with built-in tools only
      this.logger.warn('Continuing with built-in tools only');
    }
  }

  /**
   * Reload tools (useful for development)
   */
  async reloadTools(framework: any): Promise<void> {
    this.logger.info('Reloading all tools');

    // Clear existing tools
    this.toolsArray = [];
    this.customToolDiscovery = null;

    // Reload all tools
    await this.setupTools(framework);

    this.logger.info('Tools reloaded successfully');
  }

  /**
   * Validate tool configuration
   */
  validateTools(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate tool names
    const toolNames = this.toolsArray.map((tool) => tool.name);
    const duplicates = toolNames.filter((name, index) => toolNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      errors.push(`Duplicate tool names found: ${duplicates.join(', ')}`);
    }

    // Validate each tool has required properties
    for (const tool of this.toolsArray) {
      if (!tool.name || typeof tool.name !== 'string') {
        errors.push(`Tool missing valid name: ${JSON.stringify(tool)}`);
      }

      if (!tool.description || typeof tool.description !== 'string') {
        errors.push(`Tool '${tool.name}' missing valid description`);
      }

      if (typeof tool.call !== 'function' && typeof tool.func !== 'function') {
        errors.push(`Tool '${tool.name}' missing call() or func() method`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get tool information for debugging
   */
  getToolInfo(): Array<{
    name: string;
    description: string;
    hasCall: boolean;
    hasFunc: boolean;
    hasSchema: boolean;
  }> {
    return this.toolsArray.map((tool) => ({
      name: tool.name,
      description: tool.description,
      hasCall: typeof tool.call === 'function',
      hasFunc: typeof tool.func === 'function',
      hasSchema: tool.schema !== undefined,
    }));
  }

  /**
   * Clear all tools
   */
  clearTools(): void {
    this.logger.debug('Clearing all tools');
    this.toolsArray = [];
    this.customToolDiscovery = null;
  }
}
