# create-endorphin-ai

Create a new [Endorphin AI](https://github.com/andrewnovykov/endorphin-ai) project with one command.

## Usage

### Interactive Mode

```bash
npx create-endorphin-ai
```

### Direct Project Creation

```bash
npx create-endorphin-ai my-ai-tests
```

### Using npm init

```bash
npm init endorphin-ai@latest
npm init endorphin-ai@latest my-ai-tests
```

## What It Does

1. **Creates project directory** with proper structure
2. **Installs Endorphin AI** as a dev dependency
3. **Initializes the project** with sample tests and configuration
4. **Sets up npm scripts** for common tasks

## Generated Project Structure

```
my-ai-tests/
├── .env                    # Environment variables (add your OpenAI API key)
├── package.json           # Project configuration with helpful scripts
├── endorphin.config.ts     # Endorphin AI configuration
├── .gitignore             # Git ignore patterns
├── tests/                 # Your test files
│   └── sample-test.ts     # Example test (HEALTH-001)
├── test-results/          # Generated test reports
└── test-recorder/         # Test recording sessions
```

## Generated npm Scripts

The created project includes these helpful scripts:

```json
{
  "scripts": {
    "test": "endorphin-ai run test all",
    "test:smoke": "endorphin-ai run test --tag smoke", 
    "test:record": "endorphin-ai run test-recorder",
    "test:single": "endorphin-ai run test",
    "endorphin-ai:init": "./node_modules/.bin/endorphin init",
    "endorphin-ai:version": "./node_modules/.bin/endorphin --version",
    "endorphin-ai:help": "./node_modules/.bin/endorphin --help"
  }
}
```

## Quick Start After Creation

```bash
cd my-ai-tests

# 1. Add your OpenAI API key to .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env

# 2. Run the sample test
npx endorphin-ai run test HEALTH-001

# 3. Generate and view test report
npx endorphin-ai generate report
npx endorphin-ai open report
```

## Requirements

- Node.js 18+ 
- OpenAI API key
- npm or yarn

## Features

- 🎯 **One-command setup** - Get started instantly
- 🤖 **AI-powered testing** - Write tests in plain English
- 📊 **Beautiful reports** - Interactive HTML reports with screenshots
- 🔧 **Zero configuration** - Works out of the box
- 🎮 **Interactive recorder** - Create tests by clicking through your app
- 📚 **TypeScript support** - Full type definitions included

## Troubleshooting

If `npx endorphin-ai` doesn't work after creation:

```bash
# Use npm scripts instead (always works)
npm run endorphin-ai:init
npm run test

# Or use direct path
./node_modules/.bin/endorphin --help
```

## More Information

- [Endorphin AI GitHub Repository](https://github.com/andrewnovykov/endorphin-ai)
- [Documentation](https://github.com/andrewnovykov/endorphin-ai#readme)
- [Issues](https://github.com/andrewnovykov/endorphin-ai/issues)

---

**Endorphin AI** - E2E Testing Reinvented with AI 🎯