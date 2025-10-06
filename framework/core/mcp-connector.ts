/**
 * MCP (Model Context Protocol) Server Connector
 * Handles connections to MCP servers and converts their tools to LangChain format
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { MCPServerConfig } from '../types/config.js';
import { info, warn, error as logError, logWithIcon, LogLevel } from './logger.js';
import { ICONS } from '../config/icons.js';

/**
 * Interface for MCP server connection
 */
interface MCPConnection {
  name: string;
  client: Client;
  tools: DynamicStructuredTool[];
  connected: boolean;
}

/**
 * MCP Server Connector Class
 * Manages connections to multiple MCP servers and provides their tools
 */
export class MCPConnector {
  private connections: Map<string, MCPConnection> = new Map();

  /**
   * Connect to MCP servers based on configuration
   */
  async connectToServers(serverConfigs: MCPServerConfig[]): Promise<void> {
    if (!serverConfigs || serverConfigs.length === 0) {
      info(`${ICONS.tools} No MCP servers configured`, {}, 'MCP');
      return;
    }

    info(`${ICONS.tools} Connecting to ${serverConfigs.length} MCP server(s)...`, { count: serverConfigs.length }, 'MCP');

    const enabledConfigs = serverConfigs.filter(config => config.enabled !== false);
    
    for (const config of enabledConfigs) {
      try {
        await this.connectToServer(config);
      } catch (error) {
        logError(
          `${ICONS.tools} Failed to connect to MCP server: ${config.name}`,
          error instanceof Error ? error : undefined,
          { serverName: config.name },
          'MCP'
        );
      }
    }

    const connectedCount = Array.from(this.connections.values()).filter(c => c.connected).length;
    logWithIcon(
      LogLevel.INFO,
      'tools',
      `MCP servers connected: ${connectedCount}/${enabledConfigs.length}`,
      { connected: connectedCount, total: enabledConfigs.length },
      'MCP'
    );
  }

  /**
   * Connect to a single MCP server
   */
  private async connectToServer(config: MCPServerConfig): Promise<void> {
    info(`${ICONS.tools} Connecting to MCP server: ${config.name}`, { serverName: config.name }, 'MCP');

    // Create transport based on config
    let transport;
    
    if (config.transport === 'stdio' && config.stdio) {
      const stdioConfig: any = {
        command: config.stdio.command,
        args: config.stdio.args || [],
      };
      
      if (config.stdio.env) {
        stdioConfig.env = config.stdio.env;
      }
      
      transport = new StdioClientTransport(stdioConfig);
    } else if (config.transport === 'sse' && config.sse) {
      transport = new SSEClientTransport(
        new URL(config.sse.url),
        config.sse.headers
      );
    } else {
      throw new Error(`Invalid MCP server configuration for ${config.name}: missing transport configuration`);
    }

    // Create MCP client
    const client = new Client(
      {
        name: 'endorphin-ai',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect to the server
    await client.connect(transport);

    // List available tools from the server
    const toolsResponse = await client.listTools();
    
    if (!toolsResponse.tools || toolsResponse.tools.length === 0) {
      warn(`${ICONS.tools} MCP server ${config.name} has no tools available`, { serverName: config.name }, 'MCP');
      this.connections.set(config.name, {
        name: config.name,
        client,
        tools: [],
        connected: true,
      });
      return;
    }

    // Convert MCP tools to LangChain tools
    const langchainTools = this.convertMCPToolsToLangChain(config.name, client, toolsResponse.tools);

    // Store connection
    this.connections.set(config.name, {
      name: config.name,
      client,
      tools: langchainTools,
      connected: true,
    });

    info(
      `${ICONS.tools} MCP server ${config.name} connected with ${langchainTools.length} tool(s)`,
      { serverName: config.name, toolCount: langchainTools.length },
      'MCP'
    );
  }

  /**
   * Convert MCP tools to LangChain DynamicStructuredTool format
   */
  private convertMCPToolsToLangChain(
    serverName: string,
    client: Client,
    mcpTools: any[]
  ): DynamicStructuredTool[] {
    if (!Array.isArray(mcpTools)) {
      return [];
    }

    return mcpTools.map(mcpTool => {
      // Build Zod schema from MCP tool's input schema
      const schema = this.buildZodSchemaFromJSON(mcpTool.inputSchema || { type: 'object', properties: {} });

      // Create LangChain tool
      return new DynamicStructuredTool({
        name: `mcp_${serverName}_${mcpTool.name}`,
        description: mcpTool.description || `Tool from MCP server ${serverName}`,
        schema,
        func: async (input: any) => {
          try {
            // Call MCP tool
            const result = await client.callTool({
              name: mcpTool.name,
              arguments: input,
            });

            // Extract content from result
            if (result.content && Array.isArray(result.content) && result.content.length > 0) {
              const textContent = result.content
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.text)
                .join('\n');
              return textContent || JSON.stringify(result.content);
            }

            return JSON.stringify(result);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(
              `${ICONS.tools} MCP tool execution failed: ${mcpTool.name}`,
              error instanceof Error ? error : undefined,
              { toolName: mcpTool.name, serverName },
              'MCP'
            );
            return `Error executing tool: ${errorMessage}`;
          }
        },
      });
    });
  }

  /**
   * Build Zod schema from JSON Schema
   * This is a simplified converter - handles basic types
   */
  private buildZodSchemaFromJSON(jsonSchema: any): z.ZodObject<any> {
    const properties: Record<string, z.ZodTypeAny> = {};

    if (jsonSchema.properties) {
      for (const [key, value] of Object.entries(jsonSchema.properties as Record<string, any>)) {
        properties[key] = this.jsonSchemaTypeToZod(value);
      }
    }

    return z.object(properties);
  }

  /**
   * Convert JSON Schema type to Zod type
   */
  private jsonSchemaTypeToZod(schema: any): z.ZodTypeAny {
    const type = schema.type;

    switch (type) {
      case 'string':
        return z.string().describe(schema.description || '');
      case 'number':
        return z.number().describe(schema.description || '');
      case 'boolean':
        return z.boolean().describe(schema.description || '');
      case 'array':
        const itemType = schema.items ? this.jsonSchemaTypeToZod(schema.items) : z.any();
        return z.array(itemType).describe(schema.description || '');
      case 'object':
        return this.buildZodSchemaFromJSON(schema);
      default:
        return z.any().describe(schema.description || '');
    }
  }

  /**
   * Get all tools from all connected MCP servers
   */
  getAllTools(): DynamicStructuredTool[] {
    const allTools: DynamicStructuredTool[] = [];
    
    for (const connection of this.connections.values()) {
      if (connection.connected) {
        allTools.push(...connection.tools);
      }
    }

    return allTools;
  }

  /**
   * Get tools from a specific MCP server
   */
  getToolsFromServer(serverName: string): DynamicStructuredTool[] {
    const connection = this.connections.get(serverName);
    return connection?.tools || [];
  }

  /**
   * Get connection info for debugging
   */
  getConnectionInfo(): Array<{ name: string; connected: boolean; toolCount: number }> {
    return Array.from(this.connections.values()).map(conn => ({
      name: conn.name,
      connected: conn.connected,
      toolCount: conn.tools.length,
    }));
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnectAll(): Promise<void> {
    info(`${ICONS.tools} Disconnecting from MCP servers...`, {}, 'MCP');

    for (const connection of this.connections.values()) {
      try {
        await connection.client.close();
      } catch (error) {
        warn(
          `${ICONS.tools} Error disconnecting from MCP server: ${connection.name}`,
          { serverName: connection.name },
          'MCP'
        );
      }
    }

    this.connections.clear();
    info(`${ICONS.tools} All MCP servers disconnected`, {}, 'MCP');
  }

  /**
   * Disconnect from a specific MCP server
   */
  async disconnect(serverName: string): Promise<void> {
    const connection = this.connections.get(serverName);
    
    if (connection) {
      try {
        await connection.client.close();
        this.connections.delete(serverName);
        info(`${ICONS.tools} Disconnected from MCP server: ${serverName}`, { serverName }, 'MCP');
      } catch (error) {
        logError(
          `${ICONS.tools} Error disconnecting from MCP server: ${serverName}`,
          error instanceof Error ? error : undefined,
          { serverName },
          'MCP'
        );
      }
    }
  }
}

/**
 * Global MCP connector instance
 */
let globalMCPConnector: MCPConnector | null = null;

/**
 * Get or create the global MCP connector instance
 */
export function getMCPConnector(): MCPConnector {
  if (!globalMCPConnector) {
    globalMCPConnector = new MCPConnector();
  }
  return globalMCPConnector;
}

/**
 * Reset the global MCP connector (useful for testing)
 */
export function resetMCPConnector(): void {
  if (globalMCPConnector) {
    globalMCPConnector.disconnectAll().catch(() => {});
    globalMCPConnector = null;
  }
}
