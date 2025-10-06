/**
 * Unit Tests for MCP Connector
 * Tests the Model Context Protocol server integration
 */

import { MCPConnector, getMCPConnector, resetMCPConnector } from '../../../framework/core/mcp-connector';
import type { MCPServerConfig } from '../../../framework/types/config';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    listTools: jest.fn().mockResolvedValue({
      tools: [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'Test input' }
            }
          }
        }
      ]
    }),
    callTool: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Test result' }]
    }),
    close: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: jest.fn().mockImplementation(() => ({}))
}));

// Mock logger
jest.mock('../../../framework/core/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logWithIcon: jest.fn(),
  LogLevel: {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }
}));

describe('MCPConnector', () => {
  let connector: MCPConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMCPConnector();
    connector = new MCPConnector();
  });

  afterEach(async () => {
    await connector.disconnectAll();
  });

  describe('Initialization', () => {
    test('should create MCPConnector instance', () => {
      expect(connector).toBeDefined();
      expect(connector).toBeInstanceOf(MCPConnector);
    });

    test('should return empty tools initially', () => {
      const tools = connector.getAllTools();
      expect(tools).toEqual([]);
      expect(Array.isArray(tools)).toBe(true);
    });

    test('should return empty connection info initially', () => {
      const info = connector.getConnectionInfo();
      expect(info).toEqual([]);
      expect(Array.isArray(info)).toBe(true);
    });
  });

  describe('Server Connection', () => {
    test('should handle empty server configuration', async () => {
      await connector.connectToServers([]);
      const tools = connector.getAllTools();
      expect(tools).toEqual([]);
    });

    test('should connect to stdio MCP server', async () => {
      const config: MCPServerConfig = {
        name: 'test-stdio-server',
        transport: 'stdio',
        stdio: {
          command: 'node',
          args: ['server.js']
        },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toHaveLength(1);
      expect(connectionInfo[0].name).toBe('test-stdio-server');
      expect(connectionInfo[0].connected).toBe(true);
    });

    test('should connect to SSE MCP server', async () => {
      const config: MCPServerConfig = {
        name: 'test-sse-server',
        transport: 'sse',
        sse: {
          url: 'https://example.com/mcp',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toHaveLength(1);
      expect(connectionInfo[0].name).toBe('test-sse-server');
    });

    test('should skip disabled servers', async () => {
      const config: MCPServerConfig = {
        name: 'disabled-server',
        transport: 'stdio',
        stdio: {
          command: 'node',
          args: []
        },
        enabled: false
      };

      await connector.connectToServers([config]);
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toEqual([]);
    });

    test('should connect to multiple servers', async () => {
      const configs: MCPServerConfig[] = [
        {
          name: 'server1',
          transport: 'stdio',
          stdio: { command: 'node', args: ['server1.js'] },
          enabled: true
        },
        {
          name: 'server2',
          transport: 'stdio',
          stdio: { command: 'node', args: ['server2.js'] },
          enabled: true
        }
      ];

      await connector.connectToServers(configs);
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toHaveLength(2);
      expect(connectionInfo.map(c => c.name)).toEqual(['server1', 'server2']);
    });

    test('should handle connection errors gracefully', async () => {
      const config: MCPServerConfig = {
        name: 'error-server',
        transport: 'stdio',
        stdio: {
          command: 'invalid-command',
          args: []
        },
        enabled: true
      };

      // Should not throw, but log error
      await expect(connector.connectToServers([config])).resolves.not.toThrow();
    });
  });

  describe('Tool Management', () => {
    test('should retrieve tools from connected server', async () => {
      const config: MCPServerConfig = {
        name: 'tool-server',
        transport: 'stdio',
        stdio: { command: 'node', args: ['tool-server.js'] },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const tools = connector.getAllTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should get tools from specific server', async () => {
      const config: MCPServerConfig = {
        name: 'specific-server',
        transport: 'stdio',
        stdio: { command: 'node', args: ['server.js'] },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const tools = connector.getToolsFromServer('specific-server');
      expect(Array.isArray(tools)).toBe(true);
    });

    test('should return empty array for non-existent server', () => {
      const tools = connector.getToolsFromServer('non-existent');
      expect(tools).toEqual([]);
    });

    test('should convert MCP tools to LangChain format', async () => {
      const config: MCPServerConfig = {
        name: 'format-test-server',
        transport: 'stdio',
        stdio: { command: 'node', args: [] },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const tools = connector.getAllTools();
      
      if (tools.length > 0) {
        const tool = tools[0];
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('schema');
        expect(tool.name).toContain('mcp_');
      }
    });
  });

  describe('Server Disconnection', () => {
    test('should disconnect all servers', async () => {
      const config: MCPServerConfig = {
        name: 'disconnect-test',
        transport: 'stdio',
        stdio: { command: 'node', args: [] },
        enabled: true
      };

      await connector.connectToServers([config]);
      await connector.disconnectAll();
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toEqual([]);
    });

    test('should disconnect specific server', async () => {
      const configs: MCPServerConfig[] = [
        {
          name: 'server-to-keep',
          transport: 'stdio',
          stdio: { command: 'node', args: [] },
          enabled: true
        },
        {
          name: 'server-to-remove',
          transport: 'stdio',
          stdio: { command: 'node', args: [] },
          enabled: true
        }
      ];

      await connector.connectToServers(configs);
      await connector.disconnect('server-to-remove');
      
      const connectionInfo = connector.getConnectionInfo();
      expect(connectionInfo).toHaveLength(1);
      expect(connectionInfo[0].name).toBe('server-to-keep');
    });

    test('should handle disconnection errors gracefully', async () => {
      await expect(connector.disconnect('non-existent-server')).resolves.not.toThrow();
    });
  });

  describe('Global Connector Instance', () => {
    test('should return singleton instance', () => {
      const instance1 = getMCPConnector();
      const instance2 = getMCPConnector();
      
      expect(instance1).toBe(instance2);
    });

    test('should reset global instance', () => {
      const instance1 = getMCPConnector();
      resetMCPConnector();
      const instance2 = getMCPConnector();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Configuration Validation', () => {
    test('should handle stdio config with environment variables', async () => {
      const config: MCPServerConfig = {
        name: 'env-test-server',
        transport: 'stdio',
        stdio: {
          command: 'node',
          args: ['server.js'],
          env: {
            'TEST_VAR': 'test-value'
          }
        },
        enabled: true
      };

      await expect(connector.connectToServers([config])).resolves.not.toThrow();
    });

    test('should handle SSE config with custom headers', async () => {
      const config: MCPServerConfig = {
        name: 'auth-server',
        transport: 'sse',
        sse: {
          url: 'https://example.com/mcp',
          headers: {
            'Authorization': 'Bearer token',
            'X-Custom-Header': 'value'
          }
        },
        enabled: true
      };

      await expect(connector.connectToServers([config])).resolves.not.toThrow();
    });

    test('should handle invalid transport configuration', async () => {
      const config: MCPServerConfig = {
        name: 'invalid-server',
        transport: 'stdio',
        // Missing stdio config
        enabled: true
      };

      await expect(connector.connectToServers([config])).resolves.not.toThrow();
    });
  });

  describe('Connection Info', () => {
    test('should provide accurate connection information', async () => {
      const config: MCPServerConfig = {
        name: 'info-server',
        transport: 'stdio',
        stdio: { command: 'node', args: [] },
        enabled: true
      };

      await connector.connectToServers([config]);
      
      const info = connector.getConnectionInfo();
      expect(info).toHaveLength(1);
      expect(info[0]).toHaveProperty('name');
      expect(info[0]).toHaveProperty('connected');
      expect(info[0]).toHaveProperty('toolCount');
      expect(typeof info[0].connected).toBe('boolean');
      expect(typeof info[0].toolCount).toBe('number');
    });
  });
});
