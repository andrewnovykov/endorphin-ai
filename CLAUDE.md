# CLAUDE.md - AI Assistant Instructions

This file contains instructions for AI assistants (like Claude) working on the Endorphin AI project.

## Project Overview

Endorphin AI is a **TypeScript-first browser automation testing framework** that uses AI agents to execute natural language test instructions. The framework is built with modern TypeScript, compiles to JavaScript for distribution, provides interactive HTML reports, and supports custom tools for extending testing capabilities.

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
npm run test:dev           # Development tests
npm run test:pre-release   # Pre-release validation
npm run test:post-install  # Post-install verification

# Real test execution (requires OpenAI API key)
npx tsx bin/endorphin.ts run test HEALTH-001
npx tsx bin/endorphin.ts generate report

# Custom tools management
npx tsx bin/endorphin.ts create tool my-tool
npx tsx bin/endorphin.ts validate tools
npx tsx bin/endorphin.ts list tools
```

## Directory Structure

```
framework/                 # TypeScript source code
├── index.ts              # Main framework entry
├── types/                # TypeScript type definitions
│   ├── index.ts          # Main type exports (includes TestCase)
│   ├── test.ts           # Test execution types
│   └── ...
├── core/                 # Core framework components
│   ├── custom-tool-discovery.ts  # Custom tool loading system
│   └── custom-tool-errors.ts     # Error handling for custom tools
├── tools/                # Browser automation tools
├── cli/                  # CLI command handlers
│   └── tool-commands.ts  # Custom tool CLI commands
├── reporters/            # Report generation
│   └── html-reporter.ts  # Interactive HTML reports
├── templates/            # HTML report templates
│   └── reporter/
│       ├── report-template.html
│       ├── styles.css
│       └── scripts.js    # Interactive functionality
└── ...

dist/                     # Compiled JavaScript output
tests/                    # Multi-tier test suite
doc/                      # Documentation
```

## Important TypeScript Types

### TestCase Interface
```typescript
// framework/types/test.ts
export interface TestCase extends TestConfig {
  recordingId?: string;
  recordedSteps?: number;
}

// Exported from framework/types/index.ts
export type { TestCase } from './test.js';
```

This type is used by the test recorder and must be importable as:
```typescript
import { TestCase } from 'endorphin-ai';
```

## Custom Tools System

### Overview
The framework supports custom tools that extend testing capabilities with user-defined AI-powered functionality. Custom tools are TypeScript functions that integrate with LangChain and the testing framework.

### Key Components
- **Tool Discovery**: `framework/core/custom-tool-discovery.ts` - Automatic loading and validation
- **Error Handling**: `framework/core/custom-tool-errors.ts` - Comprehensive error management  
- **CLI Commands**: `framework/cli/tool-commands.ts` - Tool creation and management
- **Templates**: `framework/templates/tools/` - Tool creation templates

### Configuration
```typescript
// endorphin.config.ts
export default {
  customTools: ['./tools'], // Array of paths to tool files/directories
  // Other config...
};
```

### Tool Structure
```typescript
// tools/my-tool.ts
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createMyTool(framework: EnhancedBrowserTestFramework) {
  return {
    name: 'my-tool',
    description: 'Tool description',
    schema: z.object({
      input: z.string().describe('Input parameter'),
    }),
    call: async ({ input }) => {
      framework.logTestStep(`Executing tool with: ${input}`);
      return { result: 'Tool executed successfully' };
    },
  };
}
```

### CLI Commands
```bash
npx endorphin create tool my-tool --template api
npx endorphin validate tools
npx endorphin list tools --verbose
```

## HTML Reporter System

### Components
- **HTML Template**: `framework/templates/reporter/report-template.html` 
- **Styling**: `framework/templates/reporter/styles.css` (Bootstrap-based)
- **Interactivity**: `framework/templates/reporter/scripts.js` (Vanilla JavaScript)
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

## Testing Strategy

### Test Types
1. **Development Tests** (`tests/development/`): Jest tests for TypeScript source
2. **Pre-release Tests** (`tests/pre-release/`): Validation of compiled package
3. **Post-install Tests** (`tests/post-install/`): NPM package verification

### Running Tests
- All tests use Jest framework
- Run with `npm test` (currently 108/108 passing)
- TypeScript source is tested directly with tsx
- No browser dependencies in unit tests (mocked)

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
npx jest tests/development/unit/html-reporter.test.ts

# Run real test with debug output
DEBUG=* npx tsx bin/endorphin.ts run test HEALTH-001

# Generate and inspect report
npx tsx bin/endorphin.ts generate report
open test-results/reports/report-*.html
```

## Git Workflow

### Current Branch
- **Main development**: `develop` branch
- **Current branch**: `lint` (working on linting fixes)

### Commit Best Practices
- Run `npm test` before committing
- Fix critical lint errors
- Update documentation for user-facing changes
- Test HTML reporter functionality if modifying templates

---

This guide should help AI assistants understand the project structure and contribute effectively to Endorphin AI development.