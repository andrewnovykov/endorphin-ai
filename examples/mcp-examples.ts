/**
 * Example: MCP Server Integration Test
 * Demonstrates how to use MCP (Model Context Protocol) servers in tests
 * 
 * Prerequisites:
 * 1. Install an MCP server: npm install -g @modelcontextprotocol/server-filesystem
 * 2. Configure mcpServers in endorphin.config.ts (see examples below)
 * 3. Run this test: npx endorphin-ai run test MCP-EXAMPLE-001
 */

import type { TestCase } from '../framework/types/index.js';

/**
 * Example 1: Using Filesystem MCP Server
 * 
 * Configuration needed in endorphin.config.ts:
 * 
 * mcpServers: [
 *   {
 *     name: 'filesystem',
 *     transport: 'stdio',
 *     stdio: {
 *       command: 'npx',
 *       args: ['-y', '@modelcontextprotocol/server-filesystem', './test-data'],
 *     },
 *     enabled: true,
 *   },
 * ]
 */
export const MCP_FILESYSTEM_EXAMPLE: TestCase = {
  id: 'MCP-EXAMPLE-001',
  name: 'MCP Filesystem Integration',
  description: 'Example test using MCP filesystem server to read test data',
  priority: 'Medium',
  tags: ['mcp', 'example', 'filesystem'],
  site: 'https://example.com',
  data: async () => {
    return {
      dataFile: './test-data/sample-data.json',
    };
  },
  task: `
    This is an example test that demonstrates MCP server integration.
    
    Steps:
    1. Use the filesystem MCP tool to read the file at ./test-data/sample-data.json
    2. Navigate to https://example.com
    3. Verify the page loads successfully
    4. Log the content from the file (for demonstration)
    
    Note: This is a demonstration. In real tests, you would:
    - Read actual test data from files
    - Use that data to validate application behavior
    - Compare database results with UI display
    - Access external services for test validation
  `,
};

/**
 * Example 2: Conditional MCP Usage
 * 
 * The AI agent will automatically discover MCP tools if they're available.
 * You can write tests that work with or without MCP servers.
 */
export const MCP_CONDITIONAL_EXAMPLE: TestCase = {
  id: 'MCP-EXAMPLE-002',
  name: 'Conditional MCP Tool Usage',
  description: 'Test that adapts based on available MCP tools',
  priority: 'Low',
  tags: ['mcp', 'example'],
  site: 'https://example.com',
  task: `
    1. Navigate to https://example.com
    2. If filesystem MCP tools are available:
       - Read test data from ./test-data/users.json
       - Use that data for validation
    3. Otherwise:
       - Use the default test data provided below
    4. Verify the page title contains "Example Domain"
    
    Default test data:
    - users: ["Alice", "Bob", "Charlie"]
  `,
};

/**
 * Example 3: Multiple MCP Servers
 * 
 * Configuration for using multiple MCP servers:
 * 
 * mcpServers: [
 *   {
 *     name: 'filesystem',
 *     transport: 'stdio',
 *     stdio: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', './'] }
 *   },
 *   {
 *     name: 'postgres',
 *     transport: 'stdio',
 *     stdio: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres'] },
 *     env: { 'DATABASE_URL': process.env.DATABASE_URL }
 *   }
 * ]
 */
export const MCP_MULTI_SERVER_EXAMPLE: TestCase = {
  id: 'MCP-EXAMPLE-003',
  name: 'Multiple MCP Servers',
  description: 'Example using both filesystem and database MCP servers',
  priority: 'Low',
  tags: ['mcp', 'example', 'advanced'],
  site: 'https://example.com',
  task: `
    Advanced example showing multiple MCP server integration:
    
    1. Use the database MCP tool to query: SELECT * FROM users LIMIT 5
    2. Use the filesystem MCP tool to read: ./test-data/expected-users.json
    3. Compare the database results with expected data from file
    4. Navigate to https://example.com/users
    5. Verify the page displays the users from the database
    
    Note: Requires both database and filesystem MCP servers configured
  `,
};

/**
 * Getting Started with MCP:
 * 
 * 1. Read the MCP Server Guide:
 *    doc/user-guide/MCP-Server-Guide.md
 * 
 * 2. Install your first MCP server:
 *    npm install -g @modelcontextprotocol/server-filesystem
 * 
 * 3. Add configuration to endorphin.config.ts:
 *    See examples/endorphin.config.ts
 * 
 * 4. Run these example tests:
 *    npx endorphin-ai run test MCP-EXAMPLE-001
 * 
 * 5. Explore official MCP servers:
 *    - @modelcontextprotocol/server-github
 *    - @modelcontextprotocol/server-google-drive
 *    - @modelcontextprotocol/server-postgres
 *    - @modelcontextprotocol/server-slack
 * 
 * 6. Create your own MCP server:
 *    See MCP-Server-Guide.md for examples
 */
