/**
 * Endorphin AI Project Initialization
 * Uses examples folder as templates for consistent setup
 */

import fs from 'fs/promises';
import path from 'path';

// Get the framework root directory by going up from this file's location
// This works both in compiled JS and during testing
const getFrameworkRoot = (): string => {
  // Try multiple potential paths to find the examples directory
  const possibleRoots = [
    // When installed as package: look in node_modules/endorphin-ai
    path.resolve(process.cwd(), 'node_modules/endorphin-ai'),
    // If running from project root (development)
    process.cwd(),
    // If __dirname is available (compiled JS), go up from framework/cli
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../../') : null,
    // Alternative path resolution
    path.resolve(process.cwd(), '../..'),
  ].filter(Boolean) as string[];

  // Return the first path that exists - actual existence check happens in copyExampleFiles
  return possibleRoots[0];
};

/**
 * Initialize Endorphin AI project in current directory
 * @param targetDir - Target directory path
 */
export async function initProject(targetDir: string = process.cwd()): Promise<void> {
  console.log('🎯 Initializing Endorphin AI project...');

  try {
    // Check if already initialized
    const configExists =
      (await fileExists(path.join(targetDir, 'endorphin.config.js'))) ||
      (await fileExists(path.join(targetDir, 'endorphin.config.ts')));
    if (configExists) {
      console.log('⚠️  Endorphin AI already initialized in this directory');
      console.log('💡 Run: npx endorphin-ai run test HEALTH-001');
      return;
    }

    // Create directories
    await createDirectories(targetDir);

    // Copy example files
    await copyExampleFiles(targetDir);

    console.log('✅ Endorphin AI project initialized successfully!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('  1. Edit .env and add your OpenAI API key');
    console.log('  2. Run: npx endorphin-ai run test HEALTH-001');
    console.log('  3. Try the API demo: npx endorphin-ai run test API-DEMO-001');
    console.log('  4. Check your custom tools: npx endorphin-ai list tools');
    console.log('  5. Try: npx endorphin-ai run generate report');
    console.log('  6. Try: npx endorphin-ai run test-recorder');
    console.log('');
    console.log('🛠️ Custom Tools:');
    console.log('  - JSONPlaceholder API tool included in tools/ directory');
    console.log('  - Create more: npx endorphin-ai create tool my-tool');
    console.log('');
    console.log('📚 Learn more: https://github.com/andrewnovykov/endorphin-ai');
  } catch (error: any) {
    console.error('❌ Failed to initialize project:', error.message);
    process.exit(1);
  }
}

async function createDirectories(targetDir: string): Promise<void> {
  const dirs = ['tests', 'test-results', 'test-recorder', 'tools'];

  for (const dir of dirs) {
    const dirPath = path.join(targetDir, dir);
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}/`);
  }
}

async function copyExampleFiles(targetDir: string): Promise<void> {
  // Get path to examples folder (relative to framework root)
  const frameworkRoot = getFrameworkRoot();
  const examplesDir = path.resolve(frameworkRoot, 'examples');

  // Check if examples directory exists
  try {
    await fs.access(examplesDir);
  } catch {
    console.warn(`⚠️  Examples directory not found at: ${examplesDir}`);
    console.warn('⚠️  Creating basic configuration files instead...');
    await createBasicFiles(targetDir);
    return;
  }

  const files = [
    { src: '.env.example', dest: '.env' },
    { src: 'endorphin.config.ts', dest: 'endorphin.config.ts' },
    { src: 'tests/sample-test.ts', dest: 'tests/sample-test.ts' },
    { src: 'tests/api-demo.yaml', dest: 'tests/api-demo.yaml' },
    { src: 'tools/jsonplaceholder-api.ts', dest: 'tools/jsonplaceholder-api.ts' },
    { src: 'tools/README.md', dest: 'tools/README.md' },
    { src: '.gitignore.example', dest: '.gitignore' },
    { src: 'README-ENDORPHIN.md', dest: 'README-ENDORPHIN.md' },
  ];

  for (const file of files) {
    const srcPath = path.join(examplesDir, file.src);
    const destPath = path.join(targetDir, file.dest);

    try {
      let content = await fs.readFile(srcPath, 'utf8');

      // Process content based on file type
      if (file.dest === '.env') {
        content = processEnvFile(content);
      } else if (file.dest === 'endorphin.config.ts') {
        content = processConfigFile(content);
      }

      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      await fs.mkdir(destDir, { recursive: true });

      await fs.writeFile(destPath, content);
      console.log(`📄 Created: ${file.dest}`);
    } catch (error: any) {
      console.warn(`⚠️  Could not create ${file.dest}: ${error.message}`);
    }
  }
}

function processEnvFile(content: string): string {
  // Add helpful comments for new users
  return `${content}

# 🎯 How to get your OpenAI API key:
# 1. Go to: https://platform.openai.com/api-keys
# 2. Create new secret key
# 3. Replace "your_openai_api_key_here" above with your actual key
# 4. Save this file
# 5. Run: npx endorphin-ai run test HEALTH-001`;
}

function processConfigFile(content: string): string {
  // Add helpful comments for beginners
  const helpfulComments = `// Endorphin AI Configuration
// This file controls how your tests run

`;

  return `${helpfulComments + content}

// 🎯 Configuration Tips:
// - Set headless: true for faster execution
// - Increase timeout for slow websites
// - Change viewport for mobile testing
// - Add your own custom settings here`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createBasicFiles(targetDir: string): Promise<void> {
  // Create basic .env file
  const envContent = `OPENAI_API_KEY=your_openai_api_key_here

# 🎯 How to get your OpenAI API key:
# 1. Go to: https://platform.openai.com/api-keys
# 2. Create new secret key
# 3. Replace "your_openai_api_key_here" above with your actual key
# 4. Save this file
# 5. Run: npx endorphin-ai run test HEALTH-001`;

  await fs.writeFile(path.join(targetDir, '.env'), envContent);
  console.log('📄 Created: .env');

  // Create basic config file
  const configContent = `// Endorphin AI Configuration
// This file controls how your tests run

export default {
  // Browser Configuration
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
  },

  // AI Configuration
  ai: {
    model: 'gpt-4o',
    temperature: 0.1,
    maxRetries: 3,
  },

  // Results configuration
  results: {
    directory: './test-results',
    keepHistory: 10,
    format: ['json', 'html'],
    screenshots: true,
    recordVideo: false,
  },

  // Test Settings
  testsDirectory: 'tests',
  environment: 'development',

  // Custom tools configuration
  customTools: [
    './tools', // Load all tools from the tools directory
  ],
};

// 🎯 Configuration Tips:
// - Set headless: true for faster execution
// - Increase timeout for slow websites
// - Change viewport for mobile testing
// - Add your own custom settings here`;

  await fs.writeFile(path.join(targetDir, 'endorphin.config.ts'), configContent);
  console.log('📄 Created: endorphin.config.ts');

  // Create basic sample test
  const testContent = `// Example Endorphin AI Test
// This is a sample test to help you get started

export const HEALTH_001 = {
  id: 'HEALTH-001',
  name: 'Health Check Test',
  description: 'Basic health check to verify the testing framework is working',
  priority: 'High',
  tags: ['health', 'smoke'],
  site: 'https://example.com',
  testData: {},
  task: 'Navigate to the homepage and verify that the page loads successfully. Check that the page title contains "Example Domain" and that there are no console errors.',
};`;

  await fs.mkdir(path.join(targetDir, 'tests'), { recursive: true });
  await fs.writeFile(path.join(targetDir, 'tests/sample-test.ts'), testContent);
  console.log('📄 Created: tests/sample-test.ts');

  // Create basic .gitignore
  const gitignoreContent = `# Dependencies
node_modules/

# Environment variables
.env

# Test results
test-results/
test-recorder/

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;

  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignoreContent);
  console.log('📄 Created: .gitignore');

  // Create basic README
  const readmeContent = `# Endorphin AI Project

Welcome to your new Endorphin AI testing project! 🎯

## Getting Started

1. **Set up your OpenAI API key:**
   - Edit the \`.env\` file
   - Add your OpenAI API key

2. **Run your first test:**
   \`\`\`bash
   npx endorphin-ai run test HEALTH-001
   \`\`\`

3. **View test results:**
   - Check the \`test-results/\` directory for HTML reports

## Project Structure

- \`tests/\` - Your test files
- \`test-results/\` - Generated test reports
- \`endorphin.config.js\` - Configuration settings
- \`.env\` - Environment variables (including API keys)

## Next Steps

- Add more tests in the \`tests/\` directory
- Customize your configuration in \`endorphin.config.js\`
- Explore the interactive test recorder: \`npx endorphin-ai run test-recorder\`

Happy testing! 🚀`;

  await fs.writeFile(path.join(targetDir, 'README-ENDORPHIN.md'), readmeContent);
  console.log('📄 Created: README-ENDORPHIN.md');

  // Create custom tools
  await createBasicCustomTools(targetDir);
}

async function createBasicCustomTools(targetDir: string): Promise<void> {
  // Create tools directory
  await fs.mkdir(path.join(targetDir, 'tools'), { recursive: true });

  // Create JSONPlaceholder API tool
  const apiToolContent = `/**
 * JSONPlaceholder API Tool
 * This tool demonstrates API testing with a real public service
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

/**
 * Creates a JSONPlaceholder API testing tool
 * @param framework - Framework instance
 * @returns LangChain tool for testing JSONPlaceholder API
 */
export function createJsonPlaceholderApiTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      endpoint: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
    }) => {
      const { endpoint, method = 'GET', data } = params;
      const baseUrl = 'https://jsonplaceholder.typicode.com';
      const url = \`$\{baseUrl}$\{endpoint.startsWith('/') ? endpoint : '/' + endpoint}\`;
      
      const stepDesc = \`API $\{method} request to: $\{endpoint}\`;
      console.log(\`🌐 $\{stepDesc}\`);
      
      try {
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
          requestOptions.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();
        
        framework.logTestStep(
          stepDesc,
          'jsonplaceholder-api',
          params,
          \`API response: $\{response.status} $\{response.statusText}\`,
          response.ok
        );
        
        if (response.ok) {
          return \`✅ $\{method} $\{endpoint} succeeded ($\{response.status}): $\{JSON.stringify(responseData, null, 2)}\`;
        } else {
          throw new Error(\`API request failed: $\{response.status} $\{response.statusText}\`);
        }
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'jsonplaceholder-api',
          params,
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'jsonplaceholder-api',
      description: 'Make API requests to JSONPlaceholder test service (posts, users, comments, etc.)',
      schema: z.object({
        endpoint: z.string().describe('API endpoint (e.g., /posts/1, /users, /comments)'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: GET)'),
        data: z.any().optional().describe('Request body data for POST/PUT requests'),
      }),
    }
  );
}`;

  await fs.writeFile(path.join(targetDir, 'tools/jsonplaceholder-api.ts'), apiToolContent);
  console.log('📄 Created: tools/jsonplaceholder-api.ts');

  // Create tools README
  const toolsReadmeContent = `# Custom Tools

This directory contains custom tools for your Endorphin AI project.

## 🛠️ Available Tools

### JSONPlaceholder API Tool (\`jsonplaceholder-api.ts\`)
A working example tool that demonstrates API testing with a real public service.

**Features:**
- Test JSONPlaceholder API endpoints (posts, users, comments, etc.)
- Support for GET, POST, PUT, DELETE methods
- Automatic error handling and logging
- Real API responses for testing

**Usage in tests:**
\`\`\`yaml
steps:
  - action: Get all posts from JSONPlaceholder API using /posts endpoint
  - action: Get user with ID 1 using /users/1 endpoint  
  - action: Create a new post with title "My Test Post" and body "This is a test post"
  - action: Update post 1 with new title "Updated Post"
\`\`\`

## 📝 Creating New Tools

To create a new custom tool:

\`\`\`bash
npx endorphin create tool my-new-tool --template basic
\`\`\`

Available templates:
- \`basic\` - Simple tool template
- \`ui\` - UI automation tool for browser interactions
- \`api\` - API testing tool template

## 🔧 Configuration

Your tools are automatically loaded because they're configured in \`endorphin.config.ts\`:

\`\`\`typescript
export default {
  // ... other config
  customTools: [
    './tools'  // This directory
  ],
};
\`\`\`

## 📚 Learn More

- [Custom Tools Guide](https://github.com/andrewnovykov/endorphin-ai#custom-tools)
- [Tool Development Documentation](https://github.com/andrewnovykov/endorphin-ai#tool-development)
- [API Examples](https://github.com/andrewnovykov/endorphin-ai#api-testing)`;

  await fs.writeFile(path.join(targetDir, 'tools/README.md'), toolsReadmeContent);
  console.log('📄 Created: tools/README.md');

  // Create API demo test
  const apiDemoContent = `id: API-DEMO-001
name: JSONPlaceholder API Demo
description: Demonstrates API testing with custom tools
tags:
  - api
  - demo
  - custom-tools
priority: medium
expectedDuration: 30
steps:
  - action: Get all posts from JSONPlaceholder using /posts endpoint
  - action: Get the first user details using /users/1 endpoint
  - action: Get comments for post 1 using /posts/1/comments endpoint
  - action: Create a new post with title "Test Post from Endorphin AI" and body "This post was created using Endorphin AI custom tools"`;

  await fs.writeFile(path.join(targetDir, 'tests/api-demo.yaml'), apiDemoContent);
  console.log('📄 Created: tests/api-demo.yaml');
}
