# VS Code Debugging Guide for Endorphin AI

This guide explains how to debug and develop the Endorphin AI framework using Visual Studio Code.

## Quick Setup

1. **Open the project in VS Code**
   ```bash
   code /path/to/endorphin-ai
   ```

2. **Install recommended extensions** (VS Code will prompt automatically):
   - TypeScript and JavaScript Language Features (built-in)
   - ESLint
   - Prettier - Code formatter
   - Jest (for test debugging)
   - Node.js Extension Pack

## Project Structure Overview

```
endorphin-ai/
├── framework/          # Core framework code (TypeScript)
│   ├── core/          # Main framework components
│   ├── cli/           # CLI command handlers
│   ├── config/        # Configuration management
│   ├── reporters/     # Test result reporting
│   └── tools/         # Browser automation tools
├── bin/               # CLI entry points
├── examples/          # User template files
├── tests/             # Development tests
├── dist/              # Compiled output
└── .vscode/           # VS Code configuration
```

## Debug Configurations

Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug CLI - Init",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/dist/bin/endorphin.js",
            "args": ["init"],
            "cwd": "/tmp/debug-project",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "sourceMaps": true,
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development"
            },
            "preLaunchTask": "build"
        },
        {
            "name": "Debug CLI - Test Runner",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/dist/bin/endorphin.js",
            "args": ["test", "HEALTH-001"],
            "cwd": "/tmp/debug-project",
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "sourceMaps": true,
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development",
                "OPENAI_API_KEY": "your-test-key-here"
            },
            "preLaunchTask": "build"
        },
        {
            "name": "Debug Test Suite",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
            "args": [
                "--runInBand",
                "--no-cache",
                "--testPathPattern=${input:testFile}"
            ],
            "cwd": "${workspaceFolder}",
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "test"
            }
        },
        {
            "name": "Debug Framework Core",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/dist/framework/index.js",
            "args": ["--test"],
            "outFiles": ["${workspaceFolder}/dist/**/*.js"],
            "sourceMaps": true,
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development",
                "OPENAI_API_KEY": "your-test-key-here"
            },
            "preLaunchTask": "build"
        }
    ],
    "inputs": [
        {
            "id": "testFile",
            "description": "Test file to debug",
            "type": "promptString",
            "default": "tests/development/unit/"
        }
    ]
}
```

Create `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "npm",
            "script": "build",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": ["$tsc"]
        },
        {
            "label": "build:watch",
            "type": "npm",
            "script": "build:watch",
            "group": "build",
            "isBackground": true,
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": ["$tsc-watch"]
        },
        {
            "label": "test",
            "type": "npm",
            "script": "test",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "lint",
            "type": "npm",
            "script": "lint",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

## Settings Configuration

Create `.vscode/settings.json`:

```json
{
    "typescript.preferences.sourceFileMap": {
        "../framework/*": "./framework/*"
    },
    "typescript.suggest.autoImports": true,
    "typescript.updateImportsOnFileMove.enabled": "always",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
    },
    "jest.autoRun": {
        "watch": false,
        "onSave": "test-src-file"
    },
    "jest.testExplorer": {
        "enabled": true
    },
    "files.exclude": {
        "**/node_modules": true,
        "**/dist": false,
        "**/.git": true,
        "**/coverage": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/coverage": true
    }
}
```

## Common Debugging Scenarios

### 1. Debug CLI Command

1. Set breakpoints in `framework/cli/` files
2. Run "Debug CLI - Init" configuration
3. Step through command execution

### 2. Debug Test Framework

1. Set breakpoints in `framework/core/` files
2. Run "Debug Framework Core" configuration  
3. Test browser automation and AI integration

### 3. Debug Jest Tests

1. Set breakpoints in test files
2. Run "Debug Test Suite" configuration
3. Enter specific test file path when prompted

### 4. Debug Package Installation

1. Build project: `npm run build`
2. Create test tarball: `npm run pack:local`
3. Set up temporary project directory
4. Install and debug from tarball

## Useful Commands

```bash
# Build and watch for changes
npm run build:watch

# Run tests in watch mode
npm run test:dev

# Run specific test file
npx jest tests/development/unit/init-command.test.ts

# Run linting
npm run lint

# Run package tests
npm run test:local

# Debug with Node.js inspector
node --inspect-brk dist/bin/endorphin.js init

# View test coverage
npm test && open tests/development/coverage/index.html
```

## Breakpoint Best Practices

### Strategic Breakpoint Locations

1. **CLI Entry Points**
   - `bin/endorphin.ts` - Main CLI routing
   - `bin/cli-handlers.ts` - Command handlers

2. **Core Framework**
   - `framework/core/config-loader.ts` - Configuration loading
   - `framework/core/test-discovery.ts` - Test file discovery
   - `framework/core/browser-framework.ts` - Browser automation

3. **Test Execution**
   - `framework/core/test-manager.ts` - Test orchestration
   - `framework/runner/task-executor.ts` - AI task execution

### Debugging TypeScript Source Maps

- Ensure `"sourceMap": true` in `tsconfig.json`
- Set breakpoints in `.ts` files, not `.js` files
- Use "Debug Console" for evaluating expressions

## Troubleshooting

### Common Issues

1. **Breakpoints not hitting**
   - Run `npm run build` first
   - Check source maps are enabled
   - Verify file paths in launch.json

2. **Cannot find module errors**
   - Build project: `npm run build`
   - Check import paths are correct
   - Restart VS Code TypeScript service

3. **Test debugging not working**
   - Install Jest extension
   - Use `--runInBand` flag for sequential execution
   - Check Jest configuration in `jest.config.js`

### Performance Tips

- Use "build:watch" task for continuous compilation
- Enable "Auto Attach" in VS Code for Node.js debugging
- Use conditional breakpoints for specific conditions
- Utilize debug console for runtime evaluation

## Environment Setup

Create `.env` file for development:

```bash
# Development environment
NODE_ENV=development

# OpenAI API (for testing AI features)
OPENAI_API_KEY=your-development-key

# Debug settings
DEBUG=endorphin:*
LOG_LEVEL=debug

# Browser settings (for framework testing)
HEADLESS=false
DEVTOOLS=true
```

## Remote Debugging

For debugging tests in CI or remote environments:

```bash
# Start with debugging enabled
node --inspect=0.0.0.0:9229 dist/bin/endorphin.js test HEALTH-001

# Connect from VS Code using "Attach to Process" configuration
```

This guide provides comprehensive debugging capabilities for developing and maintaining the Endorphin AI framework.