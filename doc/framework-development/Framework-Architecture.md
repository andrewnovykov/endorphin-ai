# 🏗️ Framework Architecture

_Last Updated: June 28, 2025 - v0.5.0+_

## Overview

Endorphin AI is built with a **TypeScript-first modular architecture** that
separates concerns and provides clear interfaces between components. The
framework is designed for extensibility, maintainability, and ease of testing.

**Architecture Highlights (v0.5.0+):**

- ✅ **TypeScript Development**: Full type safety and modern tooling
- ✅ **JavaScript Distribution**: Compiled output for production
- ✅ **Modular Design**: Clean separation of concerns
- ✅ **Path Aliases**: Clean imports with `@core/`, `@tools/`, `@types/`
- ✅ **Comprehensive Testing**: Multi-tier testing strategy
- ✅ **Production Ready**: No development dependencies at runtime
- ✅ **TestCase Type**: Exported TestCase interface for test recorder
  integration
- ✅ **Interactive HTML Reports**: Fully functional screenshot display and
  filtering

## 📁 Directory Structure

### Development Structure (TypeScript)

```
framework/
├── index.ts                     # Main entry point
├── cli/                         # CLI command handlers
│   └── init-command.ts          # Project initialization
├── config/                      # Configuration files
│   ├── agent-config.ts          # AI agent settings
│   ├── browser-config.ts        # Browser configuration
│   └── paths.ts                 # Directory paths
├── core/                        # Core components
│   ├── browser-framework.ts     # Main framework class
│   ├── config-loader.ts         # Configuration management
│   ├── test-discovery.ts        # Test discovery & execution
│   ├── test-manager.ts          # Test management
│   ├── test-session.ts          # Session tracking
│   └── agent-setup.ts           # AI agent initialization
├── tools/                       # Browser automation tools
│   ├── index.ts                 # Tool exports
│   ├── navigation.ts            # Page navigation
│   ├── interaction.ts           # Clicks, form filling
│   ├── verification.ts          # Element verification
│   ├── content.ts               # Page content analysis
│   └── utilities.ts             # Screenshots, waits
├── types/                       # TypeScript type definitions
│   ├── index.ts                 # Main type exports
│   ├── agent.ts                 # AI agent types
│   ├── browser.ts               # Browser automation types
│   ├── cli.ts                   # CLI command types
│   ├── config.ts                # Configuration types
│   ├── errors.ts                # Error handling types
│   ├── recorder.ts              # Recording types
│   ├── reporter.ts              # Reporting types
│   └── test.ts                  # Test execution types
├── test-recorder/               # Interactive testing tools
│   ├── index.ts                 # Main recorder entry
│   ├── interactive-recorder.ts  # Interactive recording
│   └── session-recorder.ts      # Session management
├── reporters/                   # Report generation
│   ├── console-reporter.ts      # Console output
│   └── html-reporter.ts         # Interactive HTML report generation
├── templates/                   # Template files
│   └── reporter/               # HTML report templates
│       ├── report-template.html # Interactive HTML template
│       ├── styles.css          # Bootstrap-based styling
│       └── scripts.js          # Interactive JavaScript functionality
├── runner/                      # Test execution
│   └── task-executor.ts         # Task execution engine
└── results/                     # Result management
    ├── test-results-manager.ts  # Result storage
    └── test-results-parser.ts   # Result parsing
```

### Production Structure (Compiled JavaScript)

```
dist/
├── bin/
│   └── endorphin.js             # Compiled CLI entry
├── framework/
│   ├── index.js                 # Main framework entry
│   ├── index.d.ts               # TypeScript definitions
│   ├── core/                    # Core utilities (compiled)
│   ├── tools/                   # Browser tools (compiled)
│   ├── types/                   # Type definitions
│   └── ...                      # All modules compiled to JS
└── ...
```

## 🧩 Core Components

### TypeScript Path Aliases

The framework uses comprehensive **TypeScript path aliases** for clean imports:

```typescript
// Instead of: import { config } from '../../core/config-loader.ts'
import { config } from '@core/config-loader.js';

// Available aliases:
('@/*'); // ./framework/*
('@core/*'); // ./framework/core/*
('@tools/*'); // ./framework/tools/*
('@config/*'); // ./framework/config/*
('@types/*'); // ./framework/types/*
('@runner/*'); // ./framework/runner/*
('@test-recorder/*'); // ./framework/test-recorder/*
('@templates/*'); // ./framework/templates/*
('@reporters/*'); // ./framework/reporters/*
('@results/*'); // ./framework/results/*
('@cli/*'); // ./framework/cli/*
```

### Main Entry Points

#### `framework/index.ts`

- **TypeScript** main framework entry point
- Orchestrates all components with complete type safety
- Provides high-level API for test execution
- Exports typed interfaces for user consumption
- Uses path aliases for clean, maintainable imports

#### CLI Entry Points

- **Development**: `bin/endorphin.ts` (TypeScript with tsx)
- **Production**: `dist/bin/endorphin.js` (Compiled JavaScript)
- **User Experience**: No tsx dependency for end users
- **Command Handlers**: `framework/cli/` (TypeScript modules)

### Configuration Layer (TypeScript)

#### `config/agent-config.ts`

- AI agent configuration settings with TypeScript types
- OpenAI API parameters and model selection
- Model behavior tuning and safety controls
- Type-safe configuration validation

#### `config/browser-config.ts`

- Browser launch settings with typed options
- Viewport and display configurations
- Timeout and screenshot settings
- Type-safe Playwright configuration

#### `config/paths.ts`

- Directory path definitions with path validation
- Test result storage locations
- Temporary file handling with type safety
- Cross-platform path resolution

### Core Framework (TypeScript)

#### `core/browser-framework.ts`

- Main framework class with full TypeScript typing
- Browser lifecycle management with typed interfaces
- Test execution orchestration
- Session management and result collection

#### `core/config-loader.ts`

- Configuration file loading and merging with type validation
- Environment variable integration
- CLI flag override handling with typed options
- Configuration validation and error handling

#### `core/test-discovery.ts`

- Test file discovery and loading with type safety
- Test filtering by tags/priority with typed filters
- Dynamic ES module loading with proper typing
- Test validation against TypeScript interfaces

#### `core/test-session.ts`

- Test session lifecycle management
- Step tracking and logging with typed events
- Result aggregation with structured data
- Screenshot coordination and file management

### Browser Automation Tools (TypeScript)

#### `tools/navigation.ts`

- Page navigation utilities with typed page interfaces
- URL handling and validation with proper error types
- Wait conditions for page loads with timeout handling
- History management with state tracking

#### `tools/interaction.ts`

- Element interaction (click, type, select) with typed selectors
- Form handling and validation with structured data
- Input focus management with accessibility support
- Event simulation with proper event typing

#### `tools/verification.ts`

- Element existence and visibility checks with typed results
- Content validation with structured assertions
- State verification with typed state objects
- Assertion helpers with detailed error messages

#### `tools/content.ts`

- Page content analysis with structured data extraction
- HTML parsing and extraction with typed results
- Element discovery with selector validation
- Text content validation with pattern matching

#### `tools/utilities.ts`

- Screenshot capture with typed options and results
- Wait and delay utilities with proper timeout handling
- File I/O operations with path validation
- Error handling helpers with typed error classes

### Type System (`framework/types/`)

#### Complete TypeScript Type Coverage

- **`agent.ts`**: AI agent interfaces and LangChain types
- **`browser.ts`**: Browser automation and Playwright types
- **`cli.ts`**: CLI command interfaces and argument types
- **`config.ts`**: Configuration object types and validation
- **`errors.ts`**: Error classes and error handling types
- **`recorder.ts`**: Interactive recording and session types
- **`reporter.ts`**: Report generation and formatting types
- **`test.ts`**: Test execution and result types (includes TestCase interface)

#### Path Aliases for Clean Imports

```typescript
// Clean imports with path aliases
import type { TestConfig } from '@types/config.js';
import { BrowserFramework } from '@core/browser-framework.js';
import { NavigationTool } from '@tools/navigation.js';
```

## 🔄 Data Flow

### Development Flow (TypeScript)

```mermaid
graph TD
    A[CLI Command (TS)] --> B[Config Loader (TS)]
    B --> C[Test Discovery (TS)]
    C --> D[Browser Framework (TS)]
    D --> E[Test Session (TS)]
    E --> F[AI Agent (TS)]
    F --> G[Browser Tools (TS)]
    G --> H[Playwright Browser]
    H --> I[Target Website]
    G --> J[Screenshots]
    E --> K[Results Storage (TS)]
    K --> L[JSON Reports]
    K --> M[HTML Reports]
```

### Production Flow (Compiled JavaScript)

```mermaid
graph TD
    A[CLI Command (JS)] --> B[Config Loader (JS)]
    B --> C[Test Discovery (JS)]
    C --> D[Browser Framework (JS)]
    D --> E[Test Session (JS)]
    E --> F[AI Agent (JS)]
    F --> G[Browser Tools (JS)]
    G --> H[Playwright Browser]
    H --> I[Target Website]
    G --> J[Screenshots]
    E --> K[Results Storage (JS)]
    K --> L[JSON Reports]
    K --> M[HTML Reports]
```

### TypeScript → JavaScript Compilation

```
TypeScript Development:
framework/core/config-loader.ts → dist/framework/core/config-loader.js + .d.ts

CLI Development:
bin/endorphin.ts → dist/bin/endorphin.js (standalone)

Type Definitions:
framework/types/*.ts → dist/framework/types/*.d.ts
```

## 🎯 Design Principles

### Type Safety First

- **Strict TypeScript**: Full type coverage with strict compiler settings
- **Runtime Validation**: Type guards and validation at runtime boundaries
- **API Consistency**: Enforced interfaces and contracts
- **Error Prevention**: Compile-time error detection

### Modularity

- Each component has a single responsibility
- Clear TypeScript interfaces between modules
- Easy to test and maintain with dependency injection
- Supports selective importing with path aliases

### Extensibility

- Plugin-friendly architecture with typed interfaces
- Easy to add new browser tools with template patterns
- Configurable AI agent behavior with typed configurations
- Customizable test execution flow with hooks and events

### Reliability

- Comprehensive error handling with typed error classes
- Retry mechanisms for flaky operations with configurable policies
- Graceful degradation with fallback strategies
- Resource cleanup with proper lifecycle management

### Observability

- Detailed logging at every level with structured data
- Visual documentation (screenshots) with metadata
- Structured result formats with TypeScript schemas
- Performance tracking with metrics collection

### Production Readiness

- **No Development Dependencies**: Compiled JavaScript runs without tsx
- **Universal Compatibility**: Works in any Node.js environment
- **Type Definitions Included**: Full TypeScript support for users
- **Clean Module Structure**: ES modules with proper exports

## 🔧 Configuration System

### Configuration Hierarchy

1. **Default Configuration** (built-in)
2. **Environment Variables** (`.env` file)
3. **User Config File** (`endorphin.config.ts`)
4. **CLI Flags** (command-line overrides)

### Configuration Merging

```javascript
// Example of configuration merging
const finalConfig = merge(
  defaultConfig,
  environmentConfig,
  userConfig,
  cliFlags
);
```

## 🧪 Testing Strategy

### Multi-Tier Testing Architecture

The framework implements a **comprehensive multi-tier testing strategy** with
**Jest** as the primary testing framework:

```
tests/
├── development/                 # Framework development tests (Jest)
│   ├── unit/                   # Unit tests for individual components
│   │   ├── config-loader-simple.test.ts
│   │   ├── browser-framework.test.ts
│   │   ├── test-discovery.test.ts
│   │   ├── init-command.test.ts
│   │   ├── cli-init.test.ts
│   │   ├── task-executor.test.ts
│   │   ├── console-reporter.test.ts
│   │   ├── html-reporter.test.ts
│   │   └── import-test.test.ts
│   └── integration/             # Integration tests
│       └── init-command.test.ts
├── pre-release/                 # Pre-release validation (Jest)
│   ├── local-installation.test.ts
│   ├── cli-functionality.test.ts
│   ├── framework-integration.test.ts
│   ├── e2e-testing.test.ts
│   ├── test-recorder.test.ts
│   ├── test-reporter.test.ts
│   └── real-world-scenarios.test.ts
├── post-install/                # Post-install validation (Jest)
│   ├── package-installation.test.ts
│   ├── end-user-scenarios.test.ts
│   ├── e2e-scenarios.test.ts
│   └── interactive-cli.test.ts
└── package-tests/               # Legacy bash validation scripts
    └── run-all-tests.sh
```

### Test Execution Strategy

| Test Type               | Source      | Runtime        | Purpose                            |
| ----------------------- | ----------- | -------------- | ---------------------------------- |
| **Development**         | TypeScript  | tsx + Node.js  | Framework unit & integration tests |
| **Pre-Release**         | Compiled JS | Node.js only   | Local package validation           |
| **Post-Install**        | NPM package | Node.js only   | Published package verification     |
| **Package Integration** | Mixed       | Bash + Node.js | Real-world scenario validation     |

### Framework Test Coverage

- **TypeScript Source Testing**: Complete unit and integration test coverage
- **Compiled Package Testing**: Validation of JavaScript compilation
- **User Experience Testing**: End-to-end user workflow validation
- **Cross-Platform Testing**: Compatibility verification

## 🚀 Execution Flow

### 1. Initialization

```
CLI → Config Loading → Test Discovery → Framework Setup
```

### 2. Test Execution

```
Test Selection → Session Start → AI Agent → Browser Actions → Result Collection
```

### 3. Cleanup

```
Session End → Resource Cleanup → Report Generation → File Storage
```

## 🔌 Extension Points

### Custom Reporters (TypeScript)

Implement custom result reporting with typed interfaces:

```typescript
import type { TestSession, TestResults } from '@types/test.js';

export class CustomReporter {
  async generateReport(
    session: TestSession,
    results: TestResults
  ): Promise<void> {
    // Custom reporting logic with type safety
  }
}
```

### AI Agent Customization (TypeScript)

Extend AI agent behavior with typed base classes:

```typescript
import { BaseAgent } from '@core/agent-setup.js';
import type { AgentTask, AgentContext } from '@types/agent.js';

export class CustomAgent extends BaseAgent {
  async processTask(task: AgentTask, context: AgentContext): Promise<void> {
    // Custom AI processing with type safety
  }
}
```

## 📦 Dependencies

### Core Dependencies

- **Playwright**: Browser automation with TypeScript support
- **OpenAI**: AI agent functionality with typed API interfaces
- **LangChain**: AI tool integration with TypeScript types

### Development Dependencies

- **TypeScript**: v5.8+ for type-safe development
- **Jest**: Testing framework with TypeScript support
- **tsx**: TypeScript execution for development
- **ESLint**: Code quality with TypeScript rules
- **Prettier**: Code formatting

### Production Dependencies

**Compiled JavaScript Only**: No TypeScript runtime dependencies for end users

## 🛠️ Development Guidelines

### Adding New Features

1. **Follow TypeScript-first development**:
   - Write TypeScript source code
   - Define proper interfaces and types
   - Use path aliases for clean imports
   - Compile to JavaScript for distribution

2. **Add comprehensive testing**:
   - Unit tests for individual components
   - Integration tests for workflows
   - Pre-release validation tests
   - Post-install verification tests

3. **Update documentation**:
   - Update TypeScript interfaces
   - Document new path aliases
   - Update build and test instructions

4. **Maintain backward compatibility**:
   - Preserve existing API interfaces
   - Use deprecation warnings for breaking changes
   - Provide migration guides

### Code Style (TypeScript)

- **Use TypeScript with strict settings**: Full type safety enabled
- **ES6+ modules with proper imports**: `import/export` with .js extensions
- **Prefer async/await over promises**: Better error handling and readability
- **Include JSDoc comments with TypeScript annotations**: Enhanced IDE support
- **Use path aliases consistently**: `@core/`, `@tools/`, `@types/`, etc.
- **Follow TypeScript naming conventions**: PascalCase for types, camelCase for
  variables

### Error Handling (TypeScript)

- **Use typed error classes**: Define custom error types with proper inheritance
- **Provide meaningful error messages**: Include context and suggested solutions
- **Log errors with structured data**: Use typed logging interfaces
- **Implement retry logic with typed configurations**: Configurable retry
  policies

### TypeScript Best Practices

- **Strict TypeScript configuration**: Enable all strict checks
- **Use interfaces over types**: For object shapes and API contracts
- **Prefer composition over inheritance**: Modular, testable components
- **Use generics for reusable components**: Type-safe utilities and tools
- **Avoid `any` type**: Use proper typing or `unknown` with type guards

This **TypeScript-first architecture** provides a solid foundation for building
reliable, scalable, and maintainable browser automation tests with AI
assistance.
