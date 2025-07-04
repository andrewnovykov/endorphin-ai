# CLAUDE.md - AI Assistant Instructions

_Last Updated: July 4, 2025 - v0.9.0_

This file contains instructions for AI assistants (like Claude) working on the
Endorphin AI project. This covers both framework development and user support.

## Project Overview

Endorphin AI is a **TypeScript-first browser automation testing framework** that
uses AI agents to execute natural language test instructions. The framework is
built with modern TypeScript, compiles to JavaScript for distribution, and provides
interactive HTML reports with comprehensive cost tracking and AI decision analysis.

## Architecture Summary

- **Language**: TypeScript development → JavaScript distribution
- **Framework**: Browser automation with Playwright + AI with OpenAI/LangChain
- **Testing**: Jest for comprehensive multi-tier testing
- **Build**: TypeScript compilation with path alias resolution
- **CLI**: `tsx` for development, compiled JS for production
- **Reports**: Interactive HTML with Bootstrap + custom JavaScript

## Key Commands

```bash
# Development workflow
npm test                    # Run all Jest tests (108 tests)
npm run build              # Compile TypeScript to JavaScript
npm run lint               # ESLint with TypeScript rules
npm run type-check         # TypeScript type checking

# Testing
npm run test:dev           # Development tests (Jest)
npm run test:package       # Package integration tests (bash scripts)
npm run test:coverage      # Test coverage analysis

# Real test execution (requires OpenAI API key)
npx tsx bin/endorphin.ts run test HEALTH-001
npx tsx bin/endorphin.ts generate report

# Test recorder
npx tsx bin/endorphin.ts run test-recorder

# Package testing workflow
cd dev-tests/package-tests && ./run-all-tests.sh
```

## Directory Structure (v0.9.0)

```
framework/                 # TypeScript source code
├── index.ts              # Main framework entry
├── core/                 # Core framework components
│   ├── config-loader.ts  # Configuration system
│   ├── test-framework.ts # Main test framework
│   ├── session-manager.ts# Test session management
│   └── token-tracker.ts  # Cost tracking and pricing
├── automation/           # Browser automation layer
│   ├── browser/          # Browser management
│   └── tools/            # Built-in browser tools (12 tools)
├── ai/                   # AI agent integration
│   ├── agent-setup.ts    # Agent configuration
│   └── validation-agent.ts # AI validation
├── cli/                  # CLI command handlers
│   ├── init-command.ts   # Project initialization
│   └── builtin-tools-command.ts # Tools management
├── types/                # TypeScript type definitions
│   ├── index.ts          # Main type exports (includes TestCase)
│   ├── test.ts           # Test execution types
│   ├── config.ts         # Configuration types
│   └── ...
├── reporters/            # Report generation
│   ├── html-reporter.ts  # Interactive HTML reports
│   └── console-reporter.ts # Console output
├── templates/            # HTML report templates
│   └── reporter/
│       ├── report-template.html
│       ├── styles.css
│       └── scripts.js    # Interactive functionality
├── test-recorder/        # Interactive test recording
│   ├── index.ts          # Recorder entry point
│   └── session-recorder.ts # Recording functionality
└── utils/                # Shared utilities

bin/                      # CLI entry points (TypeScript)
├── endorphin.ts          # Main CLI source

dev-tests/                # Framework testing infrastructure
├── development/          # Jest tests for TypeScript source
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── coverage/        # Test coverage reports
├── package-tests/       # Manual tarball testing (bash scripts)
│   ├── run-all-tests.sh # Main test runner
│   ├── scripts/         # Individual test scripts
│   └── results/         # Test execution results
└── utils/               # Testing utilities

dist/                    # Compiled JavaScript output
├── bin/endorphin.js     # Compiled CLI (production-ready)
├── framework/           # Compiled framework
│   ├── index.js         # Main entry
│   ├── index.d.ts       # TypeScript definitions
│   └── ...              # All compiled modules

doc/                     # Documentation
├── user-guide/          # End-user documentation
│   ├── Quick-Start.md   # Getting started guide
│   ├── Test-Structure-Guide.md # v0.9 test structure
│   ├── Contributing-Guide.md # How to contribute
│   └── ...
└── framework-development/ # Framework development docs
    ├── README.md         # Main development documentation hub
    ├── Contributing-Guide.md # Complete contribution workflow
    ├── Development-Environment-Setup-Guide.md # Environment setup
    ├── Testing-Guide.md  # Testing strategy overview
    └── ...

examples/               # User template files
├── endorphin.config.ts # Example configuration
├── global-setup.ts     # Example global setup
└── tests/              # Example test files
    ├── HEALTH-001.ts   # Health check test
    └── ...
```

## Important TypeScript Types

### TestCase Interface (v0.9 Update)

```typescript
// framework/types/test.ts
export interface TestCase extends TestConfig {
  recordingId?: string;
  recordedSteps?: number;
}

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  url?: string;
  setup?: TestSetupFunction;      // NEW: Async setup function
  data?: TestDataFunction | Record<string, any>;  // NEW: Dynamic data generation
  task: string | TestTaskFunction; // NEW: Can be async function
}

// NEW: Function types for dynamic tests
export type TestSetupFunction = () => Promise<any>;
export type TestDataFunction = () => Promise<any>;
export type TestTaskFunction = (data?: any, setupData?: any) => Promise<string> | string;

// Exported from framework/types/index.ts
export type { TestCase } from './test.js';
```

This type is used by the test recorder and must be importable as:

```typescript
import { TestCase } from 'endorphin-ai';
```

### New v0.9 Test Structure Examples

```typescript
// Basic test (static)
export const BASIC_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Basic Test',
  description: 'Simple static test',
  priority: 'High',
  tags: ['basic'],
  task: 'Navigate to google.com and search for "testing"'
};

// Dynamic test with setup and data
export const DYNAMIC_TEST: TestCase = {
  id: 'TEST-002',
  name: 'Dynamic Test',
  description: 'Test with setup and data generation',
  priority: 'High',
  tags: ['dynamic'],
  
  setup: async () => ({
    baseUrl: process.env.TEST_URL || 'https://example.com',
    timestamp: new Date().toISOString()
  }),
  
  data: async () => ({
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!'
  }),
  
  task: async (data, setupData) => `
    Navigate to ${setupData.baseUrl}/login
    Fill email with ${data.email}
    Fill password with ${data.password}
    Click Sign In
    Verify welcome message appears
  `
};
```

## Built-in Tools System

### Overview

Endorphin AI provides 12 comprehensive built-in browser automation tools that
cover all testing needs. These tools are automatically available in every test
without any configuration.

### Tool Categories

- **Navigation** (1 tool): `navigate` - URL navigation and routing
- **Content Analysis** (4 tools): `getDifferentialContent`, `getPageContent`,
  `getSimplePageContent`, `optimizeContent`
- **Interaction** (3 tools): `click`, `fill`, `clearField` - User interactions
- **Verification** (2 tools): `verifyElement`, `getElementInfo` - Element
  validation
- **Utilities** (2 tools): `wait`, `screenshot` - Test helpers

### CLI Commands

```bash
npx endorphin list tools              # Show all built-in tools
npx endorphin list tools --verbose    # Detailed tool information
```

### Usage in Tests

All tools are automatically available in test instructions:

```typescript
// Example test task
task: 'Navigate to login page, fill username and password, click submit, verify success';
```

## HTML Reporter System

### Components

- **HTML Template**: `framework/templates/reporter/report-template.html`
- **Styling**: `framework/templates/reporter/styles.css` (Bootstrap-based)
- **Interactivity**: `framework/templates/reporter/scripts.js` (Vanilla
  JavaScript)
- **Generator**: `framework/reporters/html-reporter.ts` (TypeScript)

### Data Flow

1. Test execution generates `test-session.json` with screenshots
2. HTML Reporter parses results and creates nested data structure
3. Template processing embeds data as JSON script tag
4. JavaScript creates interactive UI with search, filters, modals
5. Screenshots copied to `reports/screenshots/` directory

### Key Features

- Real-time search by test ID/name
- Status filtering (All/Passed/Failed)
- Modal dialogs for detailed test views
- Screenshot galleries with zoom functionality
- Keyboard shortcuts for navigation
- Export to JSON functionality
- **NEW v0.9**: Cost and token tracking per test
- **NEW v0.9**: AI decision history and agent thinking
- **NEW v0.9**: Detailed step-by-step cost analysis
- **NEW v0.9**: Tool selection reasoning display

## Build Process

### TypeScript Compilation

```bash
npm run build
# 1. tsc - Compile TypeScript to JavaScript
# 2. scripts/fix-imports.js - Fix path aliases
# 3. Copy templates to dist/
# 4. Set executable permissions
```

### Path Aliases

The project uses TypeScript path aliases that get resolved during build:

- `@core/*` → `./framework/core/*`
- `@tools/*` → `./framework/tools/*`
- `@types/*` → `./framework/types/*`
- etc.

## Testing Strategy (v0.9.0)

### Multi-Tier Testing Approach

The framework uses a comprehensive testing strategy with multiple validation layers:

```
Testing Strategy
├── 🧪 Development Testing    # Automated Jest tests during development
├── 📦 Package Testing        # Manual tarball testing before publishing  
├── 🚀 Post-Install Testing   # Published npm package validation
└── 📋 Publishing Process     # Step-by-step npm publishing guide
```

### Test Types

1. **Development Tests** (`dev-tests/development/`): Jest tests for TypeScript source
   - **Unit Tests** (`dev-tests/development/unit/`): Individual component tests
   - **Integration Tests** (`dev-tests/development/integration/`): Workflow tests
   - **Coverage Reports** (`dev-tests/development/coverage/`): Test coverage analysis

2. **Package Tests** (`dev-tests/package-tests/`): Manual tarball testing with bash scripts
   - **Environment Setup**: Package installation validation
   - **CLI Functionality**: Command testing with compiled JavaScript
   - **Test Discovery**: Test file discovery and execution
   - **Report Generation**: HTML and console report testing
   - **Test Recorder**: Interactive recording functionality

3. **Post-Install Tests**: Published npm package validation
   - Fresh environment testing (Docker, CI, local)
   - Cross-platform compatibility (macOS, Linux, Windows)
   - Version compatibility (Node.js 18, 20, 22)
   - Performance validation

### Running Tests

```bash
# Development tests (Jest with TypeScript)
npm test                    # All development tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # Coverage reports

# Package tests (Manual tarball with bash scripts)
npm run test:package        # Package integration tests
cd dev-tests/package-tests && ./run-all-tests.sh  # Complete package validation

# Quality checks
npm run type-check          # TypeScript validation
npm run lint               # Code quality checks
npm run build              # Compilation verification
```

### Test Coverage

- All tests use Jest framework for development testing
- TypeScript source is tested directly with tsx
- No browser dependencies in unit tests (mocked)
- Package tests use real compiled JavaScript
- Post-install tests validate actual npm package installation

## Common Development Tasks

### Adding New Types

1. Define in appropriate `framework/types/*.ts` file
2. Export from `framework/types/index.ts`
3. Update documentation
4. Add tests

### Fixing HTML Reporter Issues

1. **Template issues**: Edit `framework/templates/reporter/report-template.html`
2. **Styling issues**: Edit `framework/templates/reporter/styles.css`
3. **Interactive issues**: Edit `framework/templates/reporter/scripts.js`
4. **Data issues**: Edit `framework/reporters/html-reporter.ts`
5. **Always test**: Generate real report and verify functionality

### Working with Screenshots

- Screenshots stored in test result directories
- HTML reporter copies them to `reports/screenshots/`
- JavaScript expects relative paths like `screenshots/filename.png`
- Step-level screenshots embedded as image thumbnails

## Environment Setup

### Required Files

- `.env` file with `OPENAI_API_KEY=your_key_here`
- `endorphin.config.ts` for project configuration

### Dependencies

- **Runtime**: Node.js, Playwright, OpenAI, LangChain
- **Development**: TypeScript, Jest, ESLint, tsx
- **Production**: Compiled JavaScript only (no tsx dependency)

## Token Pricing Configuration

### Overview

The framework includes flexible token pricing configuration for accurate cost
tracking across different AI models.

### Default Pricing

Default pricing is provided for popular models:

- **OpenAI**: GPT-4o, GPT-4, GPT-3.5-turbo variants
- **Anthropic**: Claude-3 variants
- **Google**: Gemini Pro models

### Custom Pricing

Users can override default pricing in `endorphin.config.ts`:

```typescript
// endorphin.config.ts
export default {
  pricing: {
    // Override default model pricing
    'gpt-4o': {
      input: 0.002, // Cost per 1K input tokens
      output: 0.008, // Cost per 1K output tokens
    },

    // Add custom/private models
    'my-custom-model': {
      input: 0.001,
      output: 0.003,
    },

    // Local/free models
    'local-llama': {
      input: 0,
      output: 0,
    },
  },
  // ... other config
};
```

### Pricing Validation

- Input/output prices must be non-negative numbers
- Warnings for unusually high prices (>$1 per 1K tokens)
- Warnings when output price < input price (unusual pattern)
- Automatic fallback to defaults for invalid configurations

### Token Usage Tracking

- Real-time cost calculation during test execution
- Per-test and session-level cost summaries
- Console output: `💰 Token Usage: 1,234 tokens ($0.0123) in 1.2s`
- Detailed cost breakdowns in test reports

## Code Quality Standards

### TypeScript

- Strict mode enabled
- Use interfaces over types for object shapes
- Prefer path aliases for imports
- Include JSDoc comments for public APIs

### Testing

- Comprehensive Jest test coverage
- Mock external dependencies (Playwright, OpenAI)
- Test both TypeScript source and compiled output

### Linting

- ESLint with TypeScript rules
- Fix errors before commits
- Warnings acceptable for non-critical issues

## Known Issues & Quirks

### HTML Reporter

- JavaScript must use template literals (prefer-template ESLint rule)
- Bootstrap 5.3.0 used for styling
- Screenshots paths must be relative to report HTML file
- Filter functionality checks exact badge text ("Passed"/"Failed")

### TypeScript Compilation

- Path aliases require post-build fix-imports script
- Templates must be manually copied during build
- Type definitions included in distribution

### Testing

- Some tests timeout on slower systems (increase Jest timeout if needed)
- Browser tests are mocked - real browser testing via CLI commands
- OpenAI API key required for real test execution

## Debugging Commands

```bash
# Check types
npm run type-check

# Check compilation
npm run build && ls -la dist/

# Run specific test file
npx jest dev-tests/development/unit/html-reporter.test.ts

# Run real test with debug output
ENDORPHIN_DEBUG=verbose npx tsx bin/endorphin.ts run test HEALTH-001

# Generate and inspect report
npx tsx bin/endorphin.ts generate report
open test-results/reports/report-*.html
```

## Documentation Structure (Updated v0.9.0)

### User Guide Documentation (`doc/user-guide/`)

**For End Users** - Simplified, user-friendly documentation:

- **Quick-Start.md** - Get started in minutes (no version numbers)
- **Project-Setup-Guide.md** - Complete project setup instructions  
- **Test-Structure-Guide.md** - NEW: Learn the v0.9 test structure with setup/data functions
- **Test-Writing-Tips.md** - NEW: User-friendly test writing guidance
- **HTML-Reporter-Guide.md** - Interactive reports with cost tracking and AI insights
- **Test-Recorder.md** - Interactive test creation
- **Environment-Variables-Guide.md** - Simplified environment configuration
- **Global-Setup-Guide.md** - Global setup functionality (no teardown yet)
- **VSCode-Debugging-Guide.md** - VS Code debugging for end users
- **CI-CD-Setup-Guide.md** - GitHub Actions setup for users
- **Prompt-Guide.md** - Advanced prompting techniques (restored)

### Framework Development Documentation (`doc/framework-development/`)

**For Contributors & Maintainers** - Comprehensive development documentation:

- **README.md** - Main documentation hub and navigation
- **Contributing-Guide.md** - NEW: Complete contribution workflow (fork → develop → PR → merge)
- **Development-Environment-Setup-Guide.md** - NEW: Complete environment setup
- **Development-Guide.md** - Development workflow and practices
- **Maintainers-Guide.md** - Comprehensive maintainer documentation
- **Framework-Architecture.md** - Framework design and components
- **Testing-Guide.md** - Main testing hub linking all testing approaches
- **Development-Testing-Guide.md** - Automated Jest testing during development
- **Package-Testing-Guide.md** - Manual tarball testing before publishing
- **Post-Install-Testing-Guide.md** - Published npm package validation
- **VSCode-Debugging-Guide.md** - VS Code debugging for framework development
- **CI-CD-Guide.md** - Continuous integration and deployment
- **NPM-Publishing-Guide.md** - Step-by-step npm publishing process

### Key Documentation Features (v0.9.0)

1. **Role-Based Organization**:
   - **User Documentation**: End-user focused with simplified language
   - **Development Documentation**: Technical documentation for contributors

2. **Complete Contribution Workflow**:
   - Finding issues to work on
   - Forking and environment setup
   - Development best practices
   - Testing requirements
   - Pull request process

3. **Comprehensive Testing Documentation**:
   - Multi-tier testing strategy
   - Development testing (Jest)
   - Package testing (manual tarball)
   - Post-install testing (published package)

4. **Cross-Referenced Navigation**:
   - All guides link to related documentation
   - Role-based quick start guides
   - Clear progression paths

### Documentation Standards

- **User-focused**: User guides written for end users, not framework developers
- **Developer-focused**: Framework development guides are technical and comprehensive
- **Concise**: Shorter guides with practical examples
- **Cross-linked**: Related guides reference each other with clear navigation
- **Current**: No outdated version references or non-existent features
- **Portable**: No personal paths or system-specific information

## Git Workflow

### Current Branch

- **Main development**: `develop` branch

### Commit Best Practices

- Run `npm test` before committing
- Fix critical lint errors  
- Update documentation for user-facing changes
- Test HTML reporter functionality if modifying templates
- Run package tests before major changes: `cd dev-tests/package-tests && ./run-all-tests.sh`

## Contributing to Endorphin AI

### For New Contributors

When helping users who want to contribute:

1. **Direct them to the Contributing Guide**: `doc/framework-development/Contributing-Guide.md`
2. **Environment Setup**: `doc/framework-development/Development-Environment-Setup-Guide.md`
3. **Development Workflow**: `doc/framework-development/Development-Guide.md`
4. **Testing Approach**: `doc/framework-development/Testing-Guide.md`

### Contribution Workflow

```bash
# 1. Find an issue on GitHub
# 2. Fork the repository
# 3. Clone and set up development environment
git clone https://github.com/USERNAME/endorphin-ai.git
cd endorphin-ai
npm install
npm run build
npm test

# 4. Create feature branch
git checkout -b feature/issue-123-description

# 5. Make changes and test
npm run build:watch    # Watch TypeScript compilation
npm run test:watch     # Watch tests

# 6. Validate changes
npm run type-check     # TypeScript validation
npm run lint          # Code quality
npm test              # Development tests
cd dev-tests/package-tests && ./run-all-tests.sh  # Package tests

# 7. Commit and push
git add .
git commit -m "feat(scope): description"
git push origin feature/issue-123-description

# 8. Create pull request
```

### Testing Requirements

Before any PR is merged, ensure:
- ✅ All development tests pass (`npm test`)
- ✅ TypeScript compiles without errors (`npm run type-check`)
- ✅ Code passes linting (`npm run lint`)
- ✅ Package tests pass (`cd dev-tests/package-tests && ./run-all-tests.sh`)
- ✅ Manual testing of changed functionality

### Documentation Requirements

When helping with documentation:
- **User guides** should be simple and practical
- **Framework development guides** should be comprehensive and technical
- **Cross-reference related guides** 
- **Test all code examples**
- **Update CLAUDE.md** if framework architecture changes

## Environment Variables

### Required for Development

```bash
# .env file for development
NODE_ENV=development
OPENAI_API_KEY=your_api_key_here    # Required for AI functionality testing
ENDORPHIN_DEBUG=verbose             # Enable detailed debug output
HEADLESS=false                      # Show browser during development
```

### Debug Environment Variables

- `ENDORPHIN_DEBUG=verbose` - Detailed framework debug output
- `DEBUG=endorphin:*` - Enable all debug namespaces
- `HEADLESS=false` - Show browser during testing (development)
- `BASE_URL` - Override default test URL

---

This guide should help AI assistants understand the project structure and
contribute effectively to Endorphin AI development and user support.
