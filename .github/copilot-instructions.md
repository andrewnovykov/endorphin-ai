# GitHub Copilot Instructions for Endorphin AI

## Project Context

This is Endorphin AI - a natural language browser testing framework that uses AI
to execute test instructions written in plain English. The framework is built
with **TypeScript** for type safety and better developer experience.

## Code Style & Patterns

- Use **TypeScript** with strict type checking for all framework code
- Use ES6+ modules with `import/export`
- Prefer async/await over promises
- Use descriptive variable names with proper TypeScript types
- Add JSDoc comments with TypeScript type annotations
- Use consistent error handling with try/catch and proper error types
- Follow TypeScript best practices (interfaces, generics, strict null checks)

## Framework Architecture (TypeScript)

- `bin/endorphin.ts` - Main CLI entry point (TypeScript)
- `bin/cli-handlers.ts` - CLI command handlers (TypeScript)
- `framework/index.ts` - Main framework entry point (TypeScript)
- `framework/core/` - Core utilities (config, discovery, etc.) - **All TypeScript**
- `framework/types/` - TypeScript type definitions (modular)
- `framework/reporters/` - Test reporting system (TypeScript)
- `framework/runner/` - Test execution (TypeScript)
- `framework/test-recorder/` - Interactive recording (TypeScript)
- `framework/tools/` - Browser automation tools (TypeScript)
- `framework/config/` - Configuration system (TypeScript)
- `framework/results/` - Result management (TypeScript)
- `examples/` - User examples and templates
- `development-tests/` - Package integration tests
- `tests/development/` - Jest test files (unit & integration)
- `roadmap/` - Project documentation and progress tracking

## Path Aliases (Use These!)

Always use these TypeScript path aliases in framework code:
- `@/` - Points to `./framework/*`
- `@core/` - Points to `./framework/core/*`
- `@tools/` - Points to `./framework/tools/*`
- `@config/` - Points to `./framework/config/*`
- `@types/` - Points to `./framework/types/*`
- `@runner/` - Points to `./framework/runner/*`
- `@reporters/` - Points to `./framework/reporters/*`

## TypeScript Configuration

- Strict TypeScript configuration enabled
- ES2022 target with ESNext modules
- Path aliases configured in `tsconfig.json`
- Declaration files generated
- Source maps enabled for debugging

## Testing & Running

- **Framework Tests**: `npm run test` (Jest in `tests/development/`)
- **Package Tests**: `npm run test:package` (Integration tests)
- **Type Checking**: `npm run type-check` (TypeScript compilation check)
- **Build**: `npm run build` (Compile TypeScript to JavaScript)
- **Development**: Use `tsx` for direct TypeScript execution
- **CLI**: `endorphin` command runs via TypeScript (bin/endorphin.ts)

## Configuration System

- Uses `endorphin.config.js` in user project root
- Config structure follows the pattern in `examples/endorphin.config.js`
- CLI flags override config file settings
- Support for multiple environments (dev, staging, prod)
- Configuration loading handled by `@core/config-loader.ts`

## Test File Format

Users create test files with this structure (JavaScript for simplicity):

```javascript
export const TEST_ID = {
  id: 'TEST-001',
  name: 'Test Name',
  description: 'What this test does',
  priority: 'High|Medium|Low',
  tags: ['tag1', 'tag2'],
  site: 'https://example.com',
  testData: {
    /* any test data */
  },
  task: 'Natural language instructions for the AI',
};
```

## CLI Commands

- `endorphin run test TEST-ID` - Run specific test
- `endorphin run test --tag smoke` - Run by tag
- `endorphin run test --priority High` - Run by priority
- `endorphin run test all` - Run all tests
- `endorphin run test-recorder` - Start test recorder
- `endorphin list` - List available tests
- `endorphin generate report` - Generate HTML reports
- `endorphin cleanup results` - Clean up old results

## Dependencies

- **Core**: Playwright for browser automation (TypeScript support)
- **AI**: OpenAI API with LangChain (TypeScript)
- **Testing**: Jest for framework tests
- **Build**: TypeScript compiler, tsx for development
- **Config**: Custom config loader in `@core/config-loader.ts`

## TypeScript Types

Key interfaces and types are modularized in `framework/types/`:
- `agent.ts` - AI/LangChain types
- `browser.ts` - Browser automation types
- `cli.ts` - CLI command types
- `config.ts` - Configuration types
- `errors.ts` - Error handling types
- `recorder.ts` - Recording types
- `reporter.ts` - Reporting types
- `test.ts` - Test execution types

## Do NOT suggest:

- **JavaScript files in framework/** (everything should be TypeScript)
- Complex programmatic test writing (users write simple objects)
- Importing framework code in user tests
- Creating test files in framework directory
- Using Vitest (we use Jest)
- Adding dependencies without discussion
- **Creating markdown files in root** (use `roadmap/in-progress/` instead)
- Relative imports (use path aliases: `@core/`, `@tools/`, etc.)

## DO suggest:

- **TypeScript with proper type annotations**
- **Path aliases for clean imports** (`@core/`, `@tools/`, etc.)
- Simple, readable code with TypeScript benefits
- Natural language task descriptions
- Configuration-driven behavior
- Error handling improvements with TypeScript error types
- Performance optimizations
- **Modular architecture with single responsibility**
- **Type-safe interfaces for all data structures**

## Architecture Principles

- **DRY (Don't Repeat Yourself)**: No duplicate functionality
- **Single Responsibility**: Each module has one clear purpose
- **Type Safety**: Strict TypeScript throughout
- **Modular Design**: Clean separation of concerns
- **Professional Structure**: Enterprise-grade codebase organization
