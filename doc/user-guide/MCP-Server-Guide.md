# MCP Server Integration Guide

## 🔌 Overview

Endorphin AI supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), an open protocol that allows AI applications to connect to external data sources and tools through standardized servers.

With MCP, you can:
- **Extend tool capabilities** beyond built-in browser automation
- **Connect to external services** like databases, APIs, file systems
- **Use community-built MCP servers** or create your own
- **Standardize tool integration** with a consistent protocol

## 🚀 Quick Start

### 1. Install an MCP Server

```bash
# Example: Install the filesystem MCP server
npm install -g @modelcontextprotocol/server-filesystem
```

### 2. Configure in `endorphin.config.ts`

```typescript
export default {
  // ... other config ...
  
  mcpServers: [
    {
      name: 'filesystem',
      transport: 'stdio',
      stdio: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', './test-data'],
      },
      enabled: true,
    },
  ],
};
```

### 3. Use in Your Tests

```typescript
export const DATA_TEST: TestCase = {
  id: 'MCP-001',
  name: 'File System Access Test',
  task: `
    1. Read the test data from ./test-data/users.json using the filesystem tool
    2. Navigate to the user management page
    3. Verify the users listed match the data from the file
  `,
};
```

The AI agent will automatically discover and use the MCP tools alongside built-in browser automation tools!

## 📋 Configuration

### MCP Server Configuration Structure

```typescript
interface MCPServerConfig {
  name: string;              // Unique identifier for this server
  transport: 'stdio' | 'sse'; // Connection type
  stdio?: {                  // For local process servers
    command: string;         // Command to execute
    args?: string[];         // Command arguments
    env?: Record<string, string>; // Environment variables
  };
  sse?: {                    // For remote HTTP servers
    url: string;             // Server URL
    headers?: Record<string, string>; // HTTP headers
  };
  enabled?: boolean;         // Enable/disable (default: true)
  timeout?: number;          // Operation timeout in ms
}
```

### Transport Types

#### STDIO Transport (Local Processes)

Use for MCP servers that run as local processes:

```typescript
{
  name: 'my-local-server',
  transport: 'stdio',
  stdio: {
    command: 'node',
    args: ['./mcp-server.js'],
    env: {
      'NODE_ENV': 'test'
    }
  }
}
```

**Best for:**
- Local file system access
- Database connections
- Python/Node.js tools
- Development and testing

#### SSE Transport (Remote Servers)

Use for MCP servers accessible over HTTP with Server-Sent Events:

```typescript
{
  name: 'my-remote-server',
  transport: 'sse',
  sse: {
    url: 'https://mcp-server.example.com',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'X-Custom-Header': 'value'
    }
  }
}
```

**Best for:**
- Cloud-hosted services
- Shared team resources
- Production environments
- Third-party integrations

## 🛠️ Available MCP Servers

### Official MCP Servers

Install from npm with `@modelcontextprotocol/server-*`:

#### Filesystem
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

```typescript
{
  name: 'filesystem',
  transport: 'stdio',
  stdio: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/directory']
  }
}
```

**Capabilities:** Read/write files, list directories, search files

#### GitHub
```bash
npm install -g @modelcontextprotocol/server-github
```

```typescript
{
  name: 'github',
  transport: 'stdio',
  stdio: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      'GITHUB_TOKEN': process.env.GITHUB_TOKEN
    }
  }
}
```

**Capabilities:** Repository access, issue management, pull requests

#### PostgreSQL
```bash
npm install -g @modelcontextprotocol/server-postgres
```

```typescript
{
  name: 'postgres',
  transport: 'stdio',
  stdio: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    env: {
      'DATABASE_URL': process.env.DATABASE_URL
    }
  }
}
```

**Capabilities:** SQL queries, database introspection

#### Google Drive
```bash
npm install -g @modelcontextprotocol/server-google-drive
```

**Capabilities:** File access, search, upload/download

#### Slack
```bash
npm install -g @modelcontextprotocol/server-slack
```

**Capabilities:** Send messages, read channels, user lookup

### Community MCP Servers

Discover more at [MCP Server Registry](https://modelcontextprotocol.io/servers)

## 💡 Examples

### Example 1: File System Testing

```typescript
// endorphin.config.ts
export default {
  mcpServers: [
    {
      name: 'filesystem',
      transport: 'stdio',
      stdio: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', './test-data']
      }
    }
  ]
};

// tests/file-test.ts
export const FILE_TEST: TestCase = {
  id: 'FILE-001',
  name: 'Validate User Data',
  task: `
    1. Use the filesystem tool to read ./test-data/users.json
    2. Navigate to https://example.com/users
    3. For each user in the JSON file:
       - Verify the user appears in the list
       - Check that email addresses match
  `
};
```

### Example 2: Database Integration

```typescript
// endorphin.config.ts
export default {
  mcpServers: [
    {
      name: 'database',
      transport: 'stdio',
      stdio: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        env: {
          'DATABASE_URL': 'postgresql://user:pass@localhost:5432/testdb'
        }
      }
    }
  ]
};

// tests/db-test.ts
export const DB_TEST: TestCase = {
  id: 'DB-001',
  name: 'Verify Order Data',
  task: `
    1. Query the database for orders created today using postgres tool
    2. Navigate to the orders page
    3. Verify each order from database appears on the page
    4. Check that order totals match database values
  `
};
```

### Example 3: Multi-Server Setup

```typescript
export default {
  mcpServers: [
    // Development: filesystem access
    {
      name: 'filesystem',
      transport: 'stdio',
      stdio: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', './test-data']
      },
      enabled: process.env.NODE_ENV !== 'production'
    },
    
    // Production: API service
    {
      name: 'api-validator',
      transport: 'sse',
      sse: {
        url: 'https://api-validator.mycompany.com/mcp',
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
      },
      enabled: process.env.NODE_ENV === 'production'
    },
    
    // Always available: GitHub integration
    {
      name: 'github',
      transport: 'stdio',
      stdio: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          'GITHUB_TOKEN': process.env.GITHUB_TOKEN
        }
      },
      enabled: !!process.env.GITHUB_TOKEN
    }
  ]
};
```

## 🔧 Creating Custom MCP Servers

### TypeScript Example

```typescript
// my-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'my-custom-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define your tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'Does something useful',
      inputSchema: {
        type: 'object',
        properties: {
          param: { type: 'string', description: 'A parameter' }
        }
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    // Your tool logic here
    return {
      content: [
        { type: 'text', text: 'Tool result' }
      ]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python Example

```python
# my_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("my-custom-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="my_tool",
            description="Does something useful",
            inputSchema={
                "type": "object",
                "properties": {
                    "param": {"type": "string", "description": "A parameter"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "my_tool":
        # Your tool logic here
        return [TextContent(type="text", text="Tool result")]

if __name__ == "__main__":
    server.run()
```

## 🐛 Troubleshooting

### Connection Issues

**Problem:** MCP server fails to connect

**Solutions:**
1. Verify the command/path is correct
2. Check that the MCP server is installed
3. Test the server independently: `npx @modelcontextprotocol/server-filesystem ./`
4. Check logs in `test-results/` directory

### Tool Discovery

**Problem:** Tools not appearing in agent

**Solutions:**
1. Ensure `enabled: true` in configuration
2. Check that server implements `tools/list` correctly
3. Verify server starts without errors
4. Use `endorphinDebug` to inspect available tools

### Authentication

**Problem:** SSE server authentication fails

**Solutions:**
1. Verify API tokens are correct
2. Check headers are properly formatted
3. Test the server endpoint with curl/Postman first
4. Ensure environment variables are loaded

### Performance

**Problem:** Tests slow with MCP servers

**Solutions:**
1. Use `timeout` configuration for slow servers
2. Consider caching for frequently accessed data
3. Use local STDIO servers for development
4. Disable unused servers with `enabled: false`

## 📚 Best Practices

### 1. Environment-Based Configuration

```typescript
const isDev = process.env.NODE_ENV === 'development';

export default {
  mcpServers: [
    // Fast local access in dev
    {
      name: 'filesystem',
      transport: 'stdio',
      enabled: isDev,
      // ...
    },
    // Production API in prod
    {
      name: 'api',
      transport: 'sse',
      enabled: !isDev,
      // ...
    }
  ]
};
```

### 2. Secure Credentials

```typescript
// ❌ Don't hardcode credentials
{
  sse: {
    headers: {
      'Authorization': 'Bearer sk-1234567890'
    }
  }
}

// ✅ Use environment variables
{
  sse: {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    }
  }
}
```

### 3. Conditional Servers

```typescript
{
  name: 'optional-server',
  transport: 'stdio',
  enabled: !!process.env.ENABLE_FEATURE, // Only if env var set
  // ...
}
```

### 4. Error Handling in Tests

```typescript
export const ROBUST_TEST: TestCase = {
  id: 'ROBUST-001',
  task: `
    1. Try to read data using filesystem tool
    2. If file not found, use default test data
    3. Navigate to the page and continue test
  `
};
```

## 🎯 Next Steps

1. **Explore Official Servers**: Try `@modelcontextprotocol/server-filesystem`
2. **Read MCP Docs**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
3. **Build Custom Server**: Create tools specific to your needs
4. **Share with Community**: Publish your MCP server for others to use

## 🤝 Support

- **MCP Protocol**: [GitHub Issues](https://github.com/modelcontextprotocol/specification/issues)
- **Endorphin AI**: [GitHub Issues](https://github.com/endorphin-ai/endorphin-ai/issues)
- **Examples**: See `examples/` directory in the repository
