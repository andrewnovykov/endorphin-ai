# Pre-Release Testing

Pre-release testing validates the Endorphin AI framework using the **local
development version** before publishing to npm. This ensures all features work
correctly with the current codebase.

## Overview

Pre-release tests install and test the framework from the local source code,
simulating how users would experience the package after it's published, but
using the current development state.

## Key Differences from Post-Install Tests

| Test Type        | Package Source                                     | Purpose                                        | When to Run                        |
| ---------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| **Pre-Release**  | Local path (`npm install /path/to/endorphin-ai`)   | Validate current development before publishing | Before release, during development |
| **Post-Install** | Published npm package (`npm install endorphin-ai`) | Validate published package works correctly     | After publishing to npm            |

## Test Structure

```
tests/pre-release/
├── readme.md                    # This file
├── local-installation.test.ts   # Test local package installation
├── cli-functionality.test.ts    # Test CLI commands with local version
├── framework-integration.test.ts # Test framework features with local version
├── real-world-scenarios.test.ts  # Complete workflows with local version
├── scripts/                     # Helper scripts for pre-release testing
│   ├── setup-local-test.sh     # Set up test environment
│   ├── install-local.sh        # Install from local path
│   └── cleanup-test.sh         # Clean up test environment
└── tmp/                        # Temporary test directories
```

## Running Pre-Release Tests

### Manual Testing

```bash
# Install from local development version
cd /tmp/test-project
npm install /path/to/endorphin-ai

# Test CLI functionality
npx endorphin --help
npx endorphin init
npx endorphin list
npx endorphin test HEALTH-001
npx endorphin test-recorder
npx endorphin generate report
npx endorphin open report
```

### Automated Testing

```bash
# Run all pre-release tests
npm run test:pre-release

# Run specific pre-release test suites
npm test tests/pre-release/local-installation.test.ts
npm test tests/pre-release/cli-functionality.test.ts
```

## Test Scenarios

### 1. Local Package Installation

- Install framework from local source
- Verify all dependencies are included
- Check CLI commands are available
- Validate TypeScript compilation

### 2. CLI Functionality

- Test all CLI commands with local version
- Verify configuration loading
- Test project initialization
- Validate error handling

### 3. Framework Integration

- Test core framework features
- Verify browser automation works
- Test AI integration capabilities
- Validate reporter functionality

### 4. Real-World Scenarios

- Complete project setup workflows
- End-to-end test execution
- Report generation and viewing
- Configuration management

## Environment Setup

Pre-release tests create isolated environments to avoid conflicts:

```bash
# Create test directory
mkdir -p /tmp/endorphin-pre-release-test
cd /tmp/endorphin-pre-release-test

# Install local version
npm init -y
npm install /path/to/endorphin-ai

# Test functionality
npx endorphin init
npx endorphin list
```

## Validation Checklist

Before each release, pre-release tests should verify:

- [ ] Local package installs without errors
- [ ] All CLI commands work correctly
- [ ] TypeScript compilation succeeds
- [ ] Framework initializes properly
- [ ] Test discovery finds test files
- [ ] Configuration loading works
- [ ] Browser automation functions
- [ ] AI integration responds correctly
- [ ] Reports generate successfully
- [ ] Error handling is robust
- [ ] Documentation is accurate

## Integration with CI/CD

Pre-release tests can be integrated into the development workflow:

```yaml
# Example GitHub Actions workflow
name: Pre-Release Testing
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  pre-release-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test:pre-release
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   - Check `tsconfig.json` configuration
   - Verify all dependencies are properly declared
   - Run `npm run type-check`

2. **Missing Dependencies**
   - Check `package.json` dependencies
   - Verify peer dependencies are satisfied
   - Run `npm install` in test directory

3. **CLI Commands Not Found**
   - Check `bin` field in `package.json`
   - Verify executable permissions
   - Test with `npx` prefix

4. **Path Resolution Issues**
   - Use absolute paths for local installation
   - Check symbolic links are working
   - Verify npm cache is clean

## Best Practices

1. **Isolation**: Each test should use a clean, isolated environment
2. **Cleanup**: Always clean up test directories after testing
3. **Validation**: Test both success and failure scenarios
4. **Documentation**: Keep test scenarios aligned with user documentation
5. **Automation**: Automate as much as possible while maintaining reliability

## Related Documentation

- [Post-Install Testing](../post-install/readme.md) - Testing published packages
- [Development Testing](../development/) - Unit and integration tests
- [Package Testing](../package-tests/) - Package-specific tests
- [Test Architecture](../TEST-ARCHITECTURE.md) - Overall testing strategy
