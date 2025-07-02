/**
 * Debug Manager
 * Manages global debug object for VS Code debugging integration
 */

import type { LangChainTool } from '../ai/types/agent.js';
import type { FrameworkConfig, TestSession } from '../types/index.js';
import { globalLogger } from './logger.js';
import type { TestFramework } from './test-framework.js';

/**
 * Tool information for debugging
 */
export interface ToolInfo {
  name: string;
  description: string;
  type: 'framework' | 'custom';
  schema: any;
  isLoaded: boolean;
  error?: string;
}

/**
 * Debug utilities for easier debugging
 */
export interface DebugUtils {
  getSessionData: () => any;
  getSetupResult: () => any;
  getDataGenerationResult: () => any;
  inspectTools: () => ToolInfo[];
  clearSession: () => void;
  getFrameworkStatus: () => any;
  getCurrentUrl: () => string | null;
  takeScreenshot: () => Promise<string>;
  getToolStats: () => any;
  getToolByName: (name: string) => any;
  getCustomToolDiscoveryInfo: () => any;
}

/**
 * Main debug object interface
 */
export interface EndorphinDebugObject {
  framework: TestFramework;
  session: TestSession | null;
  config: FrameworkConfig;
  tools: LangChainTool[];
  customTools: LangChainTool[];
  utils: DebugUtils;
  version: string;
  isDebugMode: boolean;
}

// Global debug object declaration
declare global {
  var endorphinDebug: EndorphinDebugObject | undefined;
}

/**
 * Debug Manager class
 */
export class DebugManager {
  private framework: TestFramework;
  private logger = globalLogger.createChild('DebugManager');
  private isInitialized = false;

  constructor(framework: TestFramework) {
    this.framework = framework;
  }

  /**
   * Initialize debug mode if ENDORPHIN_DEBUG is set
   */
  initialize(): void {
    if (process.env.ENDORPHIN_DEBUG !== 'true') {
      this.logger.debug('Debug mode not enabled (ENDORPHIN_DEBUG != true)');
      return;
    }

    this.logger.info('Initializing debug mode');

    try {
      // Create debug object
      const debugObject: EndorphinDebugObject = {
        framework: this.framework,
        session: null, // Will be updated when session is created
        config: this.framework.getConfigManager().getConfig(),
        tools: this.framework.getToolManager().getTools(),
        customTools: [], // Will be populated with custom tools
        utils: this.createDebugUtils(),
        version: this.getFrameworkVersion(),
        isDebugMode: true,
      };

      // Expose to global scope
      (globalThis as any).endorphinDebug = debugObject;

      this.isInitialized = true;
      this.logger.info('Debug object created and exposed as global.endorphinDebug');

      // Log available debugging features
      this.logDebugFeatures();
    } catch (error: any) {
      this.logger.error('Failed to initialize debug mode', error);
    }
  }

  /**
   * Update the current session in debug object
   */
  updateSession(session: TestSession | null): void {
    if (!this.isInitialized || !globalThis.endorphinDebug) {
      return;
    }

    globalThis.endorphinDebug.session = session;

    if (session) {
      this.logger.debug('Debug object updated with new session', {
        sessionId: session.sessionId,
        testName: session.testName,
      });
    } else {
      this.logger.debug('Debug object session cleared');
    }
  }

  /**
   * Update tools in debug object
   */
  updateTools(frameworkTools: LangChainTool[], _customTools: LangChainTool[] = []): void {
    if (!this.isInitialized || !globalThis.endorphinDebug) {
      return;
    }

    // Get detailed tool information from tool manager
    const toolManager = this.framework.getToolManager();
    const _toolStats = toolManager.getToolStats();
    const _customToolDiscovery = toolManager.getCustomToolDiscovery();

    // Separate built-in and custom tools
    const allTools = toolManager.getTools();
    const customToolNames = _customToolDiscovery?.getLoadedTools().map((t) => t.name) || [];

    const builtInTools = allTools.filter((tool) => !customToolNames.includes(tool.name));
    const actualCustomTools = allTools.filter((tool) => customToolNames.includes(tool.name));

    globalThis.endorphinDebug.tools = builtInTools;
    globalThis.endorphinDebug.customTools = actualCustomTools;

    this.logger.debug('Debug object updated with tools', {
      builtInTools: builtInTools.length,
      customTools: actualCustomTools.length,
      totalTools: allTools.length,
    });
  }

  /**
   * Check if debug mode is active
   */
  isDebugMode(): boolean {
    return this.isInitialized && !!globalThis.endorphinDebug;
  }

  /**
   * Create debug utilities
   */
  private createDebugUtils(): DebugUtils {
    return {
      getSessionData: () => {
        const session = globalThis.endorphinDebug?.session;
        if (!session) {
          console.log('No active session');
          return null;
        }

        return {
          sessionId: session.sessionId,
          testName: session.testName,
          status: session.status,
          steps: session.steps.length,
          screenshots: session.screenshotCounter,
          duration: session.duration,
          startTime: session.startTime,
          endTime: session.endTime,
          setupResult: session.setupResult,
          dataGenerationResult: session.dataGenerationResult,
        };
      },

      getSetupResult: () => {
        const session = globalThis.endorphinDebug?.session;
        return session?.setupResult || null;
      },

      getDataGenerationResult: () => {
        const session = globalThis.endorphinDebug?.session;
        return session?.dataGenerationResult || null;
      },

      inspectTools: () => {
        const debugObj = globalThis.endorphinDebug;
        if (!debugObj) return [];

        const toolManager = this.framework.getToolManager();
        const _toolStats = toolManager.getToolStats();
        const _customToolDiscovery = toolManager.getCustomToolDiscovery();

        const frameworkTools: ToolInfo[] = debugObj.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          type: 'framework' as const,
          schema: tool.schema,
          isLoaded: true,
        }));

        const customToolsInfo: ToolInfo[] = debugObj.customTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          type: 'custom' as const,
          schema: tool.schema,
          isLoaded: true,
        }));

        // Add information about failed custom tool loads
        const failedCustomTools: ToolInfo[] = [];
        // Note: CustomToolDiscovery doesn't expose failed tool information currently
        // This could be enhanced in the future to include discovery errors

        const allToolsInfo = [...frameworkTools, ...customToolsInfo, ...failedCustomTools];

        // Sort by type, then by name
        allToolsInfo.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'framework' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        return allToolsInfo;
      },

      clearSession: () => {
        if (globalThis.endorphinDebug) {
          globalThis.endorphinDebug.session = null;
          console.log('Debug session cleared');
        }
      },

      getFrameworkStatus: () => {
        return this.framework.getStatus();
      },

      getCurrentUrl: () => {
        const browserManager = this.framework.getBrowserManager();
        return browserManager.isInitialized() ? browserManager.getCurrentUrl() : null;
      },

      takeScreenshot: async () => {
        return await this.framework.takeScreenshot();
      },

      getToolStats: () => {
        const toolManager = this.framework.getToolManager();
        return toolManager.getToolStats();
      },

      getToolByName: (name: string) => {
        const toolManager = this.framework.getToolManager();
        return toolManager.getToolByName(name);
      },

      getCustomToolDiscoveryInfo: () => {
        const toolManager = this.framework.getToolManager();
        const customDiscovery = toolManager.getCustomToolDiscovery();

        if (!customDiscovery) {
          return { hasCustomTools: false, message: 'No custom tools configured' };
        }

        const loaded = customDiscovery.getLoadedTools();

        return {
          hasCustomTools: true,
          totalLoaded: loaded.length,
          loadedTools: loaded.map((tool) => ({
            name: tool.name,
            description: tool.description,
          })),
        };
      },
    };
  }

  /**
   * Get framework version
   */
  private getFrameworkVersion(): string {
    try {
      // Try to read package.json
      const fs = require('fs');
      const path = require('path');
      const packagePath = path.join(__dirname, '..', '..', 'package.json');

      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageJson.version || 'unknown';
      }
    } catch {
      // Fallback
    }

    return 'development';
  }

  /**
   * Log available debug features
   */
  private logDebugFeatures(): void {
    this.logger.info('Debug features available:');
    console.log(`
🐛 Endorphin AI Debug Mode Active

Available in VS Code debugger console:
• endorphinDebug.framework     - Access to framework instance
• endorphinDebug.session       - Current test session data
• endorphinDebug.config        - Framework configuration
• endorphinDebug.tools         - Available framework tools
• endorphinDebug.customTools   - Custom user tools
• endorphinDebug.utils         - Debug utilities

Quick utilities:
• endorphinDebug.utils.getSessionData()          - Get current session summary
• endorphinDebug.utils.getSetupResult()          - Get test setup result
• endorphinDebug.utils.getDataGenerationResult() - Get data generation result  
• endorphinDebug.utils.inspectTools()            - List all available tools with details
• endorphinDebug.utils.getToolStats()            - Get tool statistics (counts, names)
• endorphinDebug.utils.getToolByName('name')     - Get specific tool by name
• endorphinDebug.utils.getCustomToolDiscoveryInfo() - Get custom tool discovery status
• endorphinDebug.utils.getFrameworkStatus()      - Get framework status
• endorphinDebug.utils.getCurrentUrl()           - Get current browser URL
• endorphinDebug.utils.takeScreenshot()          - Take a screenshot
• endorphinDebug.utils.clearSession()            - Clear current session

Example usage:
> endorphinDebug.utils.getSessionData()
> endorphinDebug.utils.inspectTools()
> endorphinDebug.utils.getToolStats()
> endorphinDebug.tools.map(t => t.name)
> endorphinDebug.customTools.map(t => t.name)
> endorphinDebug.utils.getCustomToolDiscoveryInfo()
    `);
  }
}

/**
 * Create and initialize debug manager for a framework instance
 */
export function createDebugManager(framework: TestFramework): DebugManager {
  const debugManager = new DebugManager(framework);
  debugManager.initialize();
  return debugManager;
}
