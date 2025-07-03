/**
 * Tool Manager
 * Handles built-in tool setup, loading, and management
 */
import { createAllTools } from '../automation/tools/index.js';
import { globalLogger } from './logger.js';
export class ToolManager {
    toolsArray = [];
    config;
    logger = globalLogger.createChild('ToolManager');
    constructor(config) {
        this.config = config;
    }
    /**
     * Setup and load all built-in tools
     */
    async setupTools(framework) {
        this.logger.info('Setting up built-in tools');
        try {
            // Load built-in tools
            await this.loadBuiltInTools(framework);
            this.logger.info(`Tools setup completed: ${this.toolsArray.length} built-in tools loaded`);
            return this.getTools();
        }
        catch (error) {
            this.logger.error('Failed to setup tools', error);
            throw error;
        }
    }
    /**
     * Get all loaded tools
     */
    getTools() {
        return [...this.toolsArray];
    }
    /**
     * Get tool by name
     */
    getToolByName(name) {
        return this.toolsArray.find((tool) => tool.name === name);
    }
    /**
     * Get tools by category/type
     */
    getToolsByType(type) {
        return this.toolsArray.filter((tool) => {
            // This could be enhanced with tool metadata
            return tool.name.toLowerCase().includes(type.toLowerCase());
        });
    }
    /**
     * Check if tool exists
     */
    hasTool(name) {
        return this.toolsArray.some((tool) => tool.name === name);
    }
    /**
     * Get tool count
     */
    getToolCount() {
        return this.toolsArray.length;
    }
    /**
     * Get tool statistics
     */
    getToolStats() {
        return {
            total: this.toolsArray.length,
            builtIn: this.toolsArray.length,
            toolNames: this.toolsArray.map((tool) => tool.name),
        };
    }
    /**
     * Load built-in tools
     */
    async loadBuiltInTools(framework) {
        this.logger.debug('Loading built-in tools');
        try {
            const builtInTools = await createAllTools(framework);
            this.toolsArray.push(...builtInTools);
            this.logger.info(`Loaded ${builtInTools.length} built-in tools`, {
                tools: builtInTools.map((tool) => tool.name),
            });
        }
        catch (error) {
            this.logger.error('Failed to load built-in tools', error);
            throw error;
        }
    }
    /**
     * Reload tools (useful for development)
     */
    async reloadTools(framework) {
        this.logger.info('Reloading all built-in tools');
        // Clear existing tools
        this.toolsArray = [];
        // Reload all tools
        await this.setupTools(framework);
        this.logger.info('Tools reloaded successfully');
    }
    /**
     * Validate tool configuration
     */
    validateTools() {
        const errors = [];
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
    getToolInfo() {
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
    clearTools() {
        this.logger.debug('Clearing all tools');
        this.toolsArray = [];
    }
}
//# sourceMappingURL=tool-manager.js.map