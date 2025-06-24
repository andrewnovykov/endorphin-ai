/**
 * Endorphin AI Project Initialization
 * Uses examples folder as templates for consistent setup
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Endorphin AI project in current directory
 * @param targetDir - Target directory path
 */
export async function initProject(targetDir: string = process.cwd()): Promise<void> {
  console.log('🎯 Initializing Endorphin AI project...');

  try {
    // Check if already initialized
    const configExists = await fileExists(path.join(targetDir, 'endorphin.config.js'));
    if (configExists) {
      console.log('⚠️  Endorphin AI already initialized in this directory');
      console.log('💡 Run: npx endorphin run test HEALTH-001');
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
    console.log('  2. Run: npx endorphin run test HEALTH-001');
    console.log('  3. Try: npx endorphin run test-recorder');
    console.log('');
    console.log('📚 Learn more: https://github.com/andrewnovykov/endorphin-ai');
  } catch (error: any) {
    console.error('❌ Failed to initialize project:', error.message);
    process.exit(1);
  }
}

async function createDirectories(targetDir: string): Promise<void> {
  const dirs = ['tests', 'test-results', 'test-recorder'];

  for (const dir of dirs) {
    const dirPath = path.join(targetDir, dir);
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}/`);
  }
}

async function copyExampleFiles(targetDir: string): Promise<void> {
  // Get path to examples folder (relative to this file)
  const examplesDir = path.resolve(__dirname, '..', '..', 'examples');

  const files = [
    { src: '.env.example', dest: '.env' },
    { src: 'endorphin.config.js', dest: 'endorphin.config.js' },
    { src: 'tests/sample-test.js', dest: 'tests/sample-test.js' },
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
      } else if (file.dest === 'endorphin.config.js') {
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
# 5. Run: npx endorphin run test HEALTH-001`;
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
