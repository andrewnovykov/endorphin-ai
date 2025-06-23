/**
 * CLI Handler for Web UI Commands
 * Handles 'endorphin serve' and 'endorphin ui' commands
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Handle web UI commands (serve, ui)
 * @param {Array} args - Command line arguments
 * @returns {boolean} - True if command was handled
 */
export function handleWebUICommand(args) {
  const command = args[2];
  
  if (command === 'serve' || command === 'ui') {
    return true;
  }
  
  return false;
}

/**
 * Parse web UI command options
 * @param {Array} args - Command line arguments
 * @returns {Object} - Parsed options
 */
export function parseWebUIOptions(args) {
  const options = {
    port: 3000,
    host: 'localhost',
    openBrowser: true,
    env: 'development',
    debug: false
  };

  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--port':
      case '-p':
        const port = parseInt(args[i + 1]);
        if (isNaN(port)) {
          throw new Error('Invalid port number');
        }
        if (port < 1024 || port > 65535) {
          throw new Error('Port number out of range');
        }
        options.port = port;
        i++; // Skip next argument
        break;
        
      case '--host':
      case '-h':
        options.host = args[i + 1];
        i++; // Skip next argument
        break;
        
      case '--no-browser':
        options.openBrowser = false;
        break;
        
      case '--debug':
        options.debug = true;
        break;
        
      case '--env':
        options.env = args[i + 1];
        i++; // Skip next argument
        break;
    }
  }

  return options;
}

/**
 * Validate web UI command arguments
 * @param {Array} args - Command line arguments (starting from command)
 */
export function validateWebUIArgs(args) {
  const command = args[0];
  
  if (!['serve', 'ui'].includes(command)) {
    throw new Error('Invalid command. Use "serve" or "ui"');
  }
  
  // Parse to validate options
  try {
    parseWebUIOptions(['node', 'endorphin.js', ...args]);
  } catch (error) {
    throw error;
  }
}

/**
 * Start the web UI server
 * @param {Object} options - Server options
 */
export async function startWebUIServer(options = {}) {
  const {
    port = 3000,
    host = 'localhost',
    openBrowser = true,
    env = 'development',
    debug = false
  } = options;

  try {
    // Import the server module dynamically
    const { createWebServer } = await import('./server.js');
    
    // Create and start the server
    const server = await createWebServer({
      port,
      host,
      env,
      debug
    });

    console.log(`🚀 Starting Endorphin Web UI on http://${host}:${port}`);
    
    // Set up graceful shutdown
    const cleanup = async () => {
      console.log('\\n📴 Shutting down Endorphin Web UI...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Open browser if requested
    if (openBrowser) {
      openBrowserToURL(`http://${host}:${port}`);
    }

    return {
      server: server,
      url: `http://${host}:${port}`,
      port: port,
      host: host,
      cleanup: cleanup
    };
  } catch (error) {
    throw new Error(`Failed to start server: ${error.message}`);
  }
}

/**
 * Open browser tab
 * @param {string} url - URL to open
 */
async function openBrowserToURL(url) {
  try {
    const open = await import('open');
    await open.default(url);
    console.log(`🌐 Opened ${url} in browser`);
  } catch (error) {
    console.log(`💡 Open ${url} in your browser to access the web UI`);
  }
}

/**
 * Create server configuration object
 * @param {Object} options - Configuration options
 * @returns {Object} - Server configuration
 */
export function createServerConfig(options) {
  return {
    port: options.port || 3000,
    host: options.host || 'localhost',
    cors: options.cors !== false,
    debug: options.debug === true,
    env: options.env || 'development'
  };
}

/**
 * Get help text for web UI commands
 * @returns {string} - Help text
 */
export function getWebUIHelp() {
  return `
Endorphin AI Web UI Commands:

  endorphin serve [options]     Start the web UI server
  endorphin ui [options]        Alias for 'serve'

Options:
  --port, -p <number>           Port number (default: 3000)
  --host, -h <host>             Host address (default: localhost)
  --no-browser                  Don't open browser automatically
  --debug                       Enable debug mode
  --env <environment>           Set environment (default: development)

Examples:
  endorphin serve               Start web UI on default port 3000
  endorphin ui --port 4000      Start web UI on port 4000
  endorphin serve --no-browser  Start without opening browser
  endorphin serve --debug       Start with debug logging enabled
`;
}

/**
 * Get usage examples for web UI commands
 * @returns {string} - Usage examples
 */
export function getWebUIUsageExamples() {
  return `
Usage Examples:

  # Start web UI with default settings
  endorphin serve

  # Start on custom port
  endorphin ui --port 4000

  # Start without opening browser
  endorphin serve --no-browser

  # Start with debug mode
  endorphin serve --debug

  # Start on different host
  endorphin serve --host 0.0.0.0 --port 8080
`;
}
