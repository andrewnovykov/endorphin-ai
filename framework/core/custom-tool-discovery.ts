/**
 * Custom Tool Discovery Module
 * Handles discovery, loading, and validation of custom tools
 */

import type { FrameworkConfig } from '@/types/index';
import { EnhancedBrowserTestFramework } from './browser-framework';
import { existsSync, statSync } from 'fs';
import { readdir } from 'fs/promises';
import { resolve, join, extname } from 'path';
import { pathToFileURL } from 'url';
import { z } from 'zod';
import {
  CustomToolError,
  ToolDiscoveryError,
  ToolLoadError,
  ToolValidationError,
  ToolConflictError,
  CustomToolErrorHandler,
} from './custom-tool-errors';

// Tool validation schema - keeping for future validation features
const _ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  schema: z.any(), // LangChain tools have their own schema validation
  func: z.function(),
});

export interface CustomToolInfo {
  name: string;
  path: string;
  module: any;
  error?: CustomToolError;
}

export interface ToolLoadResult {
  success: boolean;
  tools: any[];
  errors: CustomToolError[];
  statistics: {
    totalPaths: number;
    scannedFiles: number;
    loadedTools: number;
    failedLoads: number;
    validationErrors: number;
    conflicts: number;
    totalErrors: number;
  };
}

export class CustomToolDiscovery {
  private config: FrameworkConfig;
  private framework: EnhancedBrowserTestFramework;
  private loadedTools: any[] = [];
  private toolPaths: string[] = [];
  private errors: CustomToolError[] = [];
  private statistics = {
    totalPaths: 0,
    scannedFiles: 0,
    loadedTools: 0,
    failedLoads: 0,
    validationErrors: 0,
    conflicts: 0,
    totalErrors: 0,
  };

  constructor(config: FrameworkConfig, framework: EnhancedBrowserTestFramework) {
    this.config = config;
    this.framework = framework;
  }

  /**
   * Discover and load all custom tools with comprehensive error handling
   */
  async discoverAndLoadTools(): Promise<any[]> {
    try {
      // Reset state
      this.resetState();

      if (!this.config.customTools || this.config.customTools.length === 0) {
        console.log('📦 No custom tools configured');
        return [];
      }

      console.log('🔍 Discovering custom tools...');
      this.statistics.totalPaths = this.config.customTools.length;

      // Discover tool files with error handling
      await this.discoverToolFiles();

      // Load and validate tools with retry logic
      await this.loadTools();

      // Log final results
      this.logResults();

      return this.loadedTools;
    } catch (error: any) {
      const toolError = CustomToolErrorHandler.handleError(error, {
        phase: 'discovery',
        configuredPaths: this.config.customTools,
      });
      this.errors.push(toolError);
      console.error('❌ Critical error during tool discovery:', toolError.message);
      return [];
    }
  }

  /**
   * Get detailed load result with all errors and statistics
   */
  getLoadResult(): ToolLoadResult {
    return {
      success: this.errors.length === 0,
      tools: this.loadedTools,
      errors: this.errors,
      statistics: { ...this.statistics },
    };
  }

  /**
   * Discover tool files from configured paths
   */
  private async discoverToolFiles(): Promise<void> {
    for (const toolPath of this.config.customTools!) {
      try {
        const resolvedPath = resolve(process.cwd(), toolPath);

        if (!existsSync(resolvedPath)) {
          const error = new ToolDiscoveryError(`Custom tool path not found: ${toolPath}`, {
            toolPath,
            resolvedPath,
          });
          this.errors.push(error);
          continue;
        }

        const stat = statSync(resolvedPath);

        if (stat.isDirectory()) {
          // Scan directory for tool files
          await this.scanDirectory(resolvedPath);
        } else if (stat.isFile() && this.isToolFile(resolvedPath)) {
          // Add individual file
          this.toolPaths.push(resolvedPath);
          this.statistics.scannedFiles++;
        } else {
          const error = new ToolDiscoveryError(`Invalid tool path (not a tool file): ${toolPath}`, {
            toolPath,
            resolvedPath,
            isDirectory: stat.isDirectory(),
            isFile: stat.isFile(),
          });
          this.errors.push(error);
        }
      } catch (error: any) {
        const toolError = CustomToolErrorHandler.handleError(error, {
          toolPath,
          phase: 'path-resolution',
        });
        this.errors.push(toolError);
      }
    }
  }

  /**
   * Recursively scan directory for tool files
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          // Recursively scan subdirectories
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && this.isToolFile(fullPath)) {
          this.toolPaths.push(fullPath);
          this.statistics.scannedFiles++;
        }
      }
    } catch (error: any) {
      const toolError = CustomToolErrorHandler.handleError(error, {
        dirPath,
        phase: 'directory-scan',
      });
      this.errors.push(toolError);
    }
  }

  /**
   * Check if file is a potential tool file
   */
  private isToolFile(filePath: string): boolean {
    const ext = extname(filePath);
    return ['.ts', '.js', '.mjs'].includes(ext) && !filePath.includes('.test.') && !filePath.includes('.spec.');
  }

  /**
   * Load tools from discovered files with retry logic
   */
  private async loadTools(): Promise<void> {
    for (const toolPath of this.toolPaths) {
      let attempts = 0;
      let lastError: CustomToolError | null = null;

      while (attempts < 3) {
        try {
          await this.loadToolFromFile(toolPath);
          break; // Success - exit retry loop
        } catch (error: any) {
          attempts++;
          lastError = CustomToolErrorHandler.handleError(error, {
            toolPath,
            phase: 'tool-loading',
            attempt: attempts,
          });

          if (!CustomToolErrorHandler.shouldRetry(lastError) || attempts >= 3) {
            this.errors.push(lastError);
            this.statistics.failedLoads++;
            break;
          }

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempts - 1)));
        }
      }
    }
  }

  /**
   * Load and validate tool from a single file
   */
  private async loadToolFromFile(filePath: string): Promise<void> {
    try {
      // Import the module with cache busting
      const moduleUrl = pathToFileURL(filePath).href;
      const module = await import(`${moduleUrl}?t=${Date.now()}`);

      // Find tool creation functions
      const toolFunctions = this.extractToolFunctions(module);

      if (toolFunctions.length === 0) {
        throw new ToolLoadError(`No tool creation functions found in file`, {
          filePath,
          availableExports: Object.keys(module),
        });
      }

      // Create and validate each tool
      for (const { name, func } of toolFunctions) {
        try {
          const tool = await this.createAndValidateTool(func, name, filePath);
          if (tool) {
            this.loadedTools.push(tool);
            this.statistics.loadedTools++;
            console.log(`  ✓ Loaded tool: ${tool.name} from ${name}`);
          }
        } catch (error: any) {
          const toolError = CustomToolErrorHandler.handleError(error, {
            filePath,
            functionName: name,
            phase: 'tool-creation',
          });
          this.errors.push(toolError);
          
          if (toolError instanceof ToolValidationError) {
            this.statistics.validationErrors++;
          } else if (toolError instanceof ToolConflictError) {
            this.statistics.conflicts++;
          }
        }
      }
    } catch (error: any) {
      throw new ToolLoadError(`Module import failed: ${error.message}`, {
        filePath,
        originalError: error.name,
      });
    }
  }

  /**
   * Extract tool creation functions from module
   */
  private extractToolFunctions(module: any): Array<{ name: string; func: Function }> {
    const functions: Array<{ name: string; func: Function }> = [];

    // Look for named exports that match the pattern create*Tool
    for (const [key, value] of Object.entries(module)) {
      if (
        typeof value === 'function' &&
        (key.startsWith('create') && key.endsWith('Tool'))
      ) {
        functions.push({ name: key, func: value as Function });
      }
    }

    // Also check default export if it's a function
    if (typeof module.default === 'function') {
      functions.push({ name: 'default', func: module.default });
    }

    return functions;
  }

  /**
   * Create and validate a tool with comprehensive error handling
   */
  private async createAndValidateTool(func: Function, functionName: string, filePath: string): Promise<any | null> {
    // Create the tool
    let tool;
    try {
      tool = func(this.framework);
      
      // Handle async tool creation
      if (tool && typeof tool.then === 'function') {
        tool = await tool;
      }
    } catch (error: any) {
      throw new ToolLoadError(`Tool creation function failed: ${error.message}`, {
        filePath,
        functionName,
        originalError: error.name,
      });
    }

    // Validate tool structure
    const validationResult = this.validateTool(tool);
    if (!validationResult.isValid) {
      throw new ToolValidationError(`Invalid tool structure: ${validationResult.errors.join(', ')}`, {
        filePath,
        functionName,
        toolName: tool?.name || 'unknown',
        validationErrors: validationResult.errors,
      });
    }

    // Check for name conflicts
    if (this.hasNameConflict(tool.name)) {
      throw new ToolConflictError(`Tool name conflict: ${tool.name} already exists`, {
        filePath,
        functionName,
        toolName: tool.name,
        existingTool: this.getToolByName(tool.name)?.constructor?.name || 'unknown',
      });
    }

    return tool;
  }

  /**
   * Validate tool structure with detailed error reporting
   */
  private validateTool(tool: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Basic structure validation
      if (!tool || typeof tool !== 'object') {
        errors.push('Tool must be an object');
        return { isValid: false, errors };
      }

      // Check for required properties
      if (!tool.name || typeof tool.name !== 'string') {
        errors.push('Tool must have a string name property');
      }

      if (!tool.description || typeof tool.description !== 'string') {
        errors.push('Tool must have a string description property');
      }

      // LangChain tools have a specific structure
      if (typeof tool.call !== 'function' && typeof tool.func !== 'function') {
        errors.push('Tool must have either a call() or func() method');
      }

      // Additional validation for LangChain tools
      if (tool.schema && typeof tool.schema !== 'object') {
        errors.push('Tool schema must be an object if provided');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Check if tool name conflicts with existing tools
   */
  private hasNameConflict(name: string): boolean {
    return this.loadedTools.some(tool => tool.name === name);
  }

  /**
   * Get all loaded custom tools
   */
  getLoadedTools(): any[] {
    return this.loadedTools;
  }

  /**
   * Get tool by name
   */
  getToolByName(name: string): any | undefined {
    return this.loadedTools.find(tool => tool.name === name);
  }

  /**
   * Reset internal state
   */
  private resetState(): void {
    this.loadedTools = [];
    this.toolPaths = [];
    this.errors = [];
    this.statistics = {
      totalPaths: 0,
      scannedFiles: 0,
      loadedTools: 0,
      failedLoads: 0,
      validationErrors: 0,
      conflicts: 0,
      totalErrors: 0,
    };
    CustomToolErrorHandler.resetErrorCounts();
  }

  /**
   * Log final results
   */
  private logResults(): void {
    const { loadedTools, scannedFiles, failedLoads, validationErrors, conflicts } = this.statistics;
    
    if (loadedTools > 0) {
      console.log(`✅ Successfully loaded ${loadedTools} custom tools from ${scannedFiles} files`);
    }

    if (this.errors.length > 0) {
      console.log(`⚠️ Encountered ${this.errors.length} errors:`);
      console.log(`  - Failed loads: ${failedLoads}`);
      console.log(`  - Validation errors: ${validationErrors}`);
      console.log(`  - Name conflicts: ${conflicts}`);
      console.log(`  - Other errors: ${this.errors.length - failedLoads - validationErrors - conflicts}`);
    }

    // Log error summary for debugging
    if (this.errors.length > 0) {
      const errorSummary = this.errors.reduce((acc, error) => {
        acc[error.code] = (acc[error.code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Error summary:', errorSummary);
    }
  }

  /**
   * Get tool statistics
   */
  getStatistics(): {
    totalPaths: number;
    scannedFiles: number;
    loadedTools: number;
    failedLoads: number;
    validationErrors: number;
    conflicts: number;
    totalErrors: number;
  } {
    // Update totalErrors before returning
    this.statistics.totalErrors = this.errors.length;
    return { ...this.statistics };
  }

  /**
   * Get all errors
   */
  getErrors(): CustomToolError[] {
    return [...this.errors];
  }
}