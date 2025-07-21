# Endorphin AI Test Project

Welcome to your Endorphin AI test project! 🎉

## 🚀 Quick Start

### 1. Configure API Key

Edit `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Run Example Test

```bash
npx endorphin-ai run test HEALTH-001
```

### 3. Generate reporter

```bash
npx endorphin-ai generate report
npx endorphin-ai open report

```

### 4. Record Your Own Test

```bash
npx endorphin-ai run test-recorder
```

### 5. List All Tests

```bash
npx endorphin-ai list
```

## 📁 Project Structure

```
├── .env                    # Environment variables
├── endorphin.config.js     # Framework configuration
├── .gitignore             # Git ignore patterns
├── tests/                  # Your test files
│   └── sample-test.js      # Sample test (HEALTH-001)
├── test-results/          # Test execution results
└── test-recorder/         # Recorded test artifacts
```

## 🔄 Staying Updated

### Check Version

```bash
# Check your current version
npx endorphin-ai --version

# Check latest available version
npm view endorphin-ai version

# Check for updates
npm outdated endorphin-ai
```

### Update to Latest

```bash
# Update to the latest version
npm update endorphin-ai

# Or install specific version
npm install endorphin-ai@latest

# Verify the update worked
npx endorphin-ai --version
```

## 📋 Common Commands

### Test Execution

```bash
# Run specific test
npx endorphin-ai run test HEALTH-001

# Run all tests
npx endorphin-ai run test all

# Run tests by tag
npx endorphin-ai run test --tag smoke
npx endorphin-ai run test --tag authentication

# Run tests by priority
npx endorphin-ai run test --priority High
```

### Test Management

```bash
# List all available tests
npx endorphin-ai list

# Start test recorder for creating new tests
npx endorphin-ai run test-recorder

# Get help and see all commands
npx endorphin-ai --help
```

### Browser Options

```bash
# Run with visible browser (default)
npx endorphin-ai run test HEALTH-001 --no-headless

# Run in headless mode (faster)
npx endorphin-ai run test HEALTH-001 --headless

# Set custom viewport size
npx endorphin-ai run test HEALTH-001 --viewport 1920x1080
```

## ⚙️ Configuration

Your `endorphin.config.js` file controls framework behavior:

```javascript
export default {
  browser: {
    headless: false, // Show browser window
    viewport: { width: 1280, height: 720 },
    timeout: 30000, // 30 second timeout
  },

  results: {
    directory: './test-results',
    screenshots: true, // Take screenshots
    recordVideo: false, // Don't record video
  },

  ai: {
    model: 'gpt-4o', // AI model to use
    maxRetries: 3, // Retry failed AI API calls
    temperature: 0.1, // Low randomness
  },
};
```

## 📝 Writing Tests

Create test files in the `tests/` directory:

```javascript
// tests/my-test.ts
import type { TestCase } from 'endorphin-ai';

export const MY_TEST = {
  id: 'MY-001',
  name: 'My First Test',
  description: 'Test login functionality',
  priority: 'High',
  tags: ['login', 'smoke'],
  site: 'https://example.com',
  testData: {
    email: 'test@example.com',
    password: 'password123',
  },
  task: `Navigate to https://example.com and click the login button.
         Fill in the email field with the test email.
         Fill in the password field with the test password.
         Click submit and verify login was successful.`,
};
```

## 🔍 Troubleshooting

### API Key Issues

```bash
# Check if API key is set
cat .env

# Test API key works
npx endorphin-ai run test HEALTH-001
```

### Version Issues

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install endorphin-ai@latest

# Check Node.js version (requires 16+)
node --version
```

### Test Discovery Issues

```bash
# Check test file format
npx endorphin-ai list

# Verify exports are correct
node -e "import('./tests/sample-test.js').then(console.log)"
```

## 🎯 Next Steps

1. **Run the sample test**: `npx endorphin-ai run test HEALTH-001`
2. **Record your first test**: `npx endorphin-ai run test-recorder`
3. **Write custom tests**: Add new files to `tests/` directory
4. **Configure settings**: Edit `endorphin.config.js` for your needs
5. **Set up CI/CD**: Add Endorphin tests to your pipeline

## 📚 Learn More

- **📖 Main Documentation**:
  https://github.com/andrewnovykov/endorphin-ai#readme
- **🎬 Test Recorder Guide**:
  https://github.com/andrewnovykov/endorphin-ai/blob/main/doc/user-guide/Test-Recorder.md
- **⚙️ Configuration Reference**:
  https://github.com/andrewnovykov/endorphin-ai#configuration
- **🏗️ Framework Architecture**:
  https://github.com/andrewnovykov/endorphin-ai/blob/main/doc/Framework-Architecture.md
- **🔧 User Setup Guide**:
  https://github.com/andrewnovykov/endorphin-ai/blob/main/doc/user-guide/User-Setup-Guide.md

## 🆘 Need Help?

- **GitHub Issues**: https://github.com/andrewnovykov/endorphin-ai/issues
- **Documentation**: https://github.com/andrewnovykov/endorphin-ai/tree/main/doc
- **Examples**: Check the `tests/` directory for sample tests

Happy Testing! 🧪✨
