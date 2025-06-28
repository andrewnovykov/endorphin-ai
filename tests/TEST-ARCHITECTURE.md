# Test Architecture and Coverage

## Overview
Endorphin AI has a comprehensive two-tier testing strategy that covers both framework development and end-user scenarios.

## Test Types

### 1. Development Tests (`tests/development/`)
These tests verify the internal framework functionality and are used during development.

#### Unit Tests (`tests/development/unit/`)
- **config-loader.test.ts** - Configuration loading and merging
- **init-command.test.ts** - Project initialization functionality  
- **test-discovery.test.ts** - Test file discovery and validation
- **browser-framework.test.ts** - Browser automation core
- **agent-setup.test.ts** - AI agent configuration
- **test-runner.test.ts** - Test execution engine
- **html-reporter.test.ts** - HTML report generation
- **console-reporter.test.ts** - Console output formatting

#### Integration Tests (`tests/development/integration/`)
- **browser-automation.test.ts** - Complete browser workflow
- **init-command.test.ts** - Full project initialization flow
- **test-recorder-integration.test.ts** - Interactive test recording

#### CLI Tests (`tests/development/cli/`)
- **cli-commands.test.ts** - CLI command parsing and execution

### 2. Post-Install Tests (`tests/post-install/`)
These tests simulate real end-user scenarios after package installation.

#### End-User Scenarios (`tests/post-install/`)
- **end-user-scenarios.test.ts** - Complete project setup workflows
- **interactive-cli.test.ts** - Interactive CLI features and prompts
- **package-installation.test.ts** - NPX usage and global CLI functionality
- **e2e-scenarios.test.ts** - Real-world end-to-end workflows

## Test Features Covered

### Framework Development Tests
- ✅ Configuration system (loading, merging, validation)
- ✅ Project initialization and file creation
- ✅ Test discovery and filtering
- ✅ Browser automation setup
- ✅ AI agent configuration
- ✅ Test execution engine
- ✅ HTML and console reporting
- ✅ CLI command handling
- ✅ Error handling and recovery

### End-User Scenario Tests
- ✅ Project initialization from scratch
- ✅ Interactive CLI prompts and responses
- ✅ Test recorder functionality
- ✅ NPX command execution
- ✅ Configuration file handling
- ✅ Multi-project scenarios
- ✅ Error recovery and migration
- ✅ Performance with multiple test files
- ✅ Cross-platform compatibility

## Test Execution

### Running Tests

```bash
# All tests
npm test

# Development tests only
npm run test:dev

# Post-install tests only  
npm run test:post-install

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests with extended timeout
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Configuration

- **Jest Configuration**: `jest.config.js` with TypeScript support
- **Setup File**: `tests/setup.js` with mocks and global configuration
- **Timeout**: 30s for development tests, 60-180s for post-install tests
- **Coverage**: 80% threshold for framework code
- **Parallel Execution**: Development tests run in parallel, post-install sequentially

## Mock Strategy

### Development Tests
- Mock Playwright browser interactions
- Mock file system operations
- Mock OpenAI API calls
- Mock console output for clean test logs

### Post-Install Tests
- Use real CLI commands via `spawn`
- Create temporary test directories
- Test actual file system operations
- Validate real command output

## Test Data and Fixtures

### Temporary Directories
- `tests/post-install/tmp/` - Temporary test projects
- Auto-cleanup after test completion
- Isolated test environments

### Mock Data
- Sample test configurations
- Mock API responses
- Fake browser interactions
- Test project templates

## Coverage Goals

- **Framework Code**: 80%+ coverage
- **Critical Paths**: 95%+ coverage (init, config, test execution)
- **Error Handling**: Complete coverage of error scenarios
- **CLI Commands**: All commands and flags tested

## TypeScript Integration

All tests are written in TypeScript with:
- Strict type checking
- ESM module support
- Path aliases for clean imports
- Proper Jest/TypeScript integration

## Continuous Integration

Tests are designed to run in CI environments with:
- Deterministic execution
- Proper cleanup
- Clear error reporting
- Reasonable timeouts
- No external dependencies for core tests

## Testing Best Practices

1. **Isolation**: Each test is independent
2. **Cleanup**: Proper teardown of resources
3. **Mocking**: Comprehensive mocking of external dependencies
4. **Real Scenarios**: Post-install tests use real CLI execution
5. **Error Coverage**: Both happy path and error scenarios
6. **Performance**: Tests complete within reasonable timeframes
7. **Documentation**: Clear test descriptions and purposes
